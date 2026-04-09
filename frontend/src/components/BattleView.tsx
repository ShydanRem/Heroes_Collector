import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { DungeonResult, ZoneInfo } from '../services/api';
import { BattleArena, ArenaFighter } from './BattleArena';
import { HeroClass, Rarity } from '../types';

export function BattleView() {
  const [state, setState] = useState<'zone_select' | 'idle' | 'loading' | 'fighting' | 'wave_complete' | 'result'>('zone_select');
  const [zones, setZones] = useState<ZoneInfo[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneInfo | null>(null);
  const [dungeonResult, setDungeonResult] = useState<DungeonResult | null>(null);
  const [currentWave, setCurrentWave] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [zonesLoading, setZonesLoading] = useState(true);

  useEffect(() => { loadZones(); }, []);

  async function loadZones() {
    setZonesLoading(true);
    try {
      const data = await api.getZones();
      setZones(data.zones);
    } catch (err) {
      console.error('Errore caricamento zone:', err);
    } finally {
      setZonesLoading(false);
    }
  }

  function selectZone(zone: ZoneInfo) {
    if (!zone.unlocked) return;
    setSelectedZone(zone);
    setState('idle');
  }

  async function startDungeon() {
    if (!selectedZone) return;
    setState('loading');
    setError(null);
    setCurrentWave(0);

    try {
      const result = await api.startDungeon(selectedZone.id);
      setDungeonResult(result);
      setState('fighting');
    } catch (err: any) {
      setError(err.message);
      setState('idle');
    }
  }

  function onWaveComplete() { setState('wave_complete'); }

  function nextWave() {
    if (!dungeonResult) return;
    if (currentWave < dungeonResult.waves.length - 1) {
      setCurrentWave(prev => prev + 1);
      setState('fighting');
    } else {
      setState('result');
    }
  }

  function skipToResult() { setState('result'); }

  function backToZoneSelect() {
    setState('zone_select');
    setDungeonResult(null);
    setSelectedZone(null);
    loadZones();
  }

  function buildTeams(wave: DungeonResult['waves'][number]): { left: ArenaFighter[]; right: ArenaFighter[] } {
    const hpMap = new Map<string, { currentHp: number; maxHp: number }>();
    if (wave.heroHpStart) {
      for (const hp of wave.heroHpStart) {
        hpMap.set(hp.id, { currentHp: hp.currentHp, maxHp: hp.maxHp });
      }
    }

    const heroes = dungeonResult?.partyHeroes || [];
    const left: ArenaFighter[] = heroes.map((hero) => {
      const hpData = hpMap.get(hero.id);
      const maxHp = hpData?.maxHp || hero.maxHp;
      const currentHp = hpData?.currentHp ?? maxHp;
      return {
        id: hero.id, name: hero.name,
        heroClass: hero.heroClass as HeroClass, rarity: hero.rarity as Rarity,
        isMonster: false, maxHp, currentHp,
        team: 'left' as const, isAlive: currentHp > 0,
      };
    });

    const right: ArenaFighter[] = wave.enemies.map((enemy, i) => {
      const hp = enemy.maxHp || 100;
      return {
        id: enemy.id || `enemy_${wave.wave}_${i}`,
        name: enemy.displayName || enemy.name,
        monsterName: enemy.name,
        emoji: '👹', tier: enemy.tier,
        isMonster: true, maxHp: hp, currentHp: hp,
        team: 'right' as const, isAlive: true,
      };
    });

    return { left, right };
  }

  // ===== ZONE SELECT =====
  if (state === 'zone_select') {
    if (zonesLoading) {
      return <div className="loading"><div className="spinner" /> Caricamento campagna...</div>;
    }

    return (
      <div>
        <div style={{
          background: 'linear-gradient(135deg, #1a0a2e 0%, #18181b 100%)',
          borderRadius: 8, padding: 12, textAlign: 'center', marginBottom: 8,
          border: '1px solid #333',
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#9147ff', marginBottom: 2 }}>
            Campagna Dungeon
          </div>
          <div style={{ fontSize: 10, color: '#adadb8' }}>
            Completa ogni zona per sbloccare la successiva
          </div>
        </div>

        {zones.map((zone) => {
          const isLocked = !zone.unlocked;
          const statusIcon = isLocked ? '🔒' : zone.cleared ? '✅' : '▶';
          const statusColor = isLocked ? '#555' : zone.cleared ? '#22c55e' : '#9147ff';

          return (
            <div key={zone.id}
              onClick={() => selectZone(zone)}
              style={{
                background: isLocked ? '#111' : '#18181b',
                borderRadius: 8, padding: '10px 12px', marginBottom: 4,
                border: `1px solid ${isLocked ? '#222' : '#333'}`,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.5 : 1,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              {/* Emoji zona */}
              <div style={{ fontSize: 24, width: 36, textAlign: 'center', flexShrink: 0 }}>
                {zone.emoji}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: isLocked ? '#555' : '#efeff1' }}>
                    {zone.name}
                  </span>
                  <span style={{ fontSize: 14 }}>{statusIcon}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#737380', marginTop: 2 }}>
                  <span>{zone.totalWaves} onde</span>
                  <span>Lv.{zone.recommendedLevel}</span>
                  {zone.cleared && zone.totalClears > 0 && (
                    <span style={{ color: '#22c55e' }}>{zone.totalClears}x completata</span>
                  )}
                  {!zone.cleared && zone.bestWaves > 0 && (
                    <span style={{ color: '#f59e0b' }}>Best: {zone.bestWaves}/{zone.totalWaves}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ===== IDLE (zona selezionata) =====
  if (state === 'idle' && selectedZone) {
    return (
      <div>
        <div style={{
          background: 'linear-gradient(135deg, #1a0a2e 0%, #18181b 100%)',
          borderRadius: 8, padding: 14, textAlign: 'center', marginBottom: 8,
          border: '1px solid #333',
        }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>{selectedZone.emoji}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#9147ff', marginBottom: 2 }}>
            {selectedZone.name}
          </div>
          <div style={{ fontSize: 11, color: '#adadb8', marginBottom: 4 }}>
            {selectedZone.totalWaves} ondate — Livello consigliato: {selectedZone.recommendedLevel}
          </div>
          {selectedZone.cleared && (
            <div style={{ fontSize: 10, color: '#f59e0b', marginBottom: 6 }}>
              Zona gia completata — Ricompense ridotte (farm mode)
            </div>
          )}
          <button className="btn btn-primary" onClick={startDungeon} style={{ fontSize: 14, padding: '10px 24px' }}>
            Entra!
          </button>
          {error && <div style={{ color: '#f44336', fontSize: 12, marginTop: 8 }}>{error}</div>}
        </div>

        <button className="btn btn-secondary" onClick={backToZoneSelect} style={{ width: '100%', fontSize: 11 }}>
          Cambia zona
        </button>
      </div>
    );
  }

  // ===== LOADING =====
  if (state === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div className="spinner" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: 14, color: '#9147ff' }}>
          {selectedZone ? `${selectedZone.emoji} Entrando in ${selectedZone.name}...` : 'Entrando nel dungeon...'}
        </div>
      </div>
    );
  }

  // ===== FIGHTING =====
  if (state === 'fighting' && dungeonResult) {
    const wave = dungeonResult.waves[currentWave];
    if (!wave) { setState('result'); return null; }

    const { left, right } = buildTeams(wave);
    const mod = dungeonResult.modifier;

    return (
      <div>
        {/* Modificatore + Sinergie banner */}
        {(mod || (dungeonResult.synergies && dungeonResult.synergies.length > 0)) && currentWave === 0 && (
          <div style={{
            background: 'linear-gradient(90deg, #1a0a2e, #18181b)',
            borderRadius: '6px 6px 0 0', padding: '4px 8px',
            display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap',
            borderBottom: '1px solid #333',
          }}>
            {mod && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10,
                background: mod.difficulty === 'difficile' ? 'rgba(239,68,68,0.2)' : mod.difficulty === 'facile' ? 'rgba(34,197,94,0.2)' : 'rgba(145,71,255,0.2)',
                color: mod.difficulty === 'difficile' ? '#f44336' : mod.difficulty === 'facile' ? '#22c55e' : '#9147ff',
              }}>
                {mod.emoji} {mod.name}
              </span>
            )}
            {dungeonResult.synergies?.map((s, i) => (
              <span key={i} style={{
                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10,
                background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
              }}>
                {s.name}
              </span>
            ))}
          </div>
        )}

        <div style={{
          background: '#1f1f23', padding: '4px 8px',
          textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#9147ff',
        }}>
          {dungeonResult.zoneEmoji} {dungeonResult.zoneName} — Ondata {wave.wave}/{dungeonResult.totalWaves}
        </div>

        <BattleArena
          leftTeam={left} rightTeam={right} log={wave.log}
          speed={600} onComplete={onWaveComplete} onSkip={skipToResult}
        />
      </div>
    );
  }

  // ===== WAVE COMPLETE =====
  if (state === 'wave_complete' && dungeonResult) {
    const wave = dungeonResult.waves[currentWave];
    const isLastWave = currentWave >= dungeonResult.waves.length - 1;

    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          background: wave.won ? '#1b5e20' : '#b71c1c',
          borderRadius: 8, padding: 12, marginBottom: 8,
        }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>
            Ondata {wave.wave}: {wave.won ? 'SUPERATA!' : 'SCONFITTA'}
          </div>
          <div style={{ fontSize: 11, marginTop: 4, color: 'rgba(255,255,255,0.8)' }}>
            {wave.enemies.map(e => e.name).join(', ')} — {wave.totalTurns} turni
          </div>
        </div>

        <button className="btn btn-primary" onClick={isLastWave || !wave.won ? () => setState('result') : nextWave}
          style={{ fontSize: 13, padding: '8px 20px' }}>
          {isLastWave || !wave.won ? 'Vedi risultati' : `Ondata ${currentWave + 2} →`}
        </button>
      </div>
    );
  }

  // ===== RESULT =====
  if (state === 'result' && dungeonResult) {
    return (
      <div>
        {/* Zona completata! */}
        {dungeonResult.zoneCleared && dungeonResult.nextZoneUnlocked && (
          <div style={{
            background: 'linear-gradient(135deg, #1b5e20, #0d3310)',
            borderRadius: 8, padding: 12, marginBottom: 8, textAlign: 'center',
            border: '2px solid #22c55e',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#22c55e' }}>
              ZONA COMPLETATA!
            </div>
            <div style={{ fontSize: 12, marginTop: 4, color: '#a5d6a7' }}>
              Hai sbloccato la zona successiva!
            </div>
          </div>
        )}

        {/* Modificatore e sinergie */}
        {(dungeonResult.modifier || (dungeonResult.synergies && dungeonResult.synergies.length > 0)) && (
          <div style={{
            background: '#1a0a2e', borderRadius: 8, padding: 8, marginBottom: 6,
            display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {dungeonResult.modifier && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                background: 'rgba(145,71,255,0.2)', color: '#c084fc',
              }}>
                {dungeonResult.modifier.emoji} {dungeonResult.modifier.name}
              </span>
            )}
            {dungeonResult.synergies?.map((s, i) => (
              <span key={i} style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
              }}>
                {s.name}
              </span>
            ))}
          </div>
        )}

        <div style={{
          background: dungeonResult.won ? '#1b5e20' : '#b71c1c',
          borderRadius: 8, padding: 16, textAlign: 'center', marginBottom: 8,
        }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {dungeonResult.won ? 'VITTORIA!' : 'SCONFITTA'}
          </div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            {dungeonResult.zoneEmoji} {dungeonResult.zoneName} — {dungeonResult.wavesCompleted}/{dungeonResult.totalWaves} ondate
          </div>
          {dungeonResult.isReplay && (
            <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 4 }}>Farm mode — ricompense ridotte</div>
          )}
        </div>

        <div style={{
          background: '#18181b', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #333',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#9147ff', marginBottom: 6 }}>Ricompense</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#64b5f6' }}>+{dungeonResult.rewards.exp}</div>
              <div style={{ fontSize: 10, color: '#adadb8' }}>EXP</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ffd700' }}>+{dungeonResult.rewards.gold}</div>
              <div style={{ fontSize: 10, color: '#adadb8' }}>Gold</div>
            </div>
          </div>
          {dungeonResult.rewards.items.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 8, color: '#ff9800', fontWeight: 700, fontSize: 12 }}>
              Loot: {dungeonResult.rewards.items.join(', ')}
            </div>
          )}
        </div>

        {/* Riepilogo ondate */}
        <div style={{ marginBottom: 8 }}>
          {dungeonResult.waves.map((w) => (
            <div key={w.wave} style={{
              display: 'flex', justifyContent: 'space-between',
              background: '#18181b', borderRadius: 4, padding: '4px 8px', marginBottom: 2, fontSize: 11,
              borderLeft: `3px solid ${w.won ? '#00c853' : '#f44336'}`,
            }}>
              <span>Ondata {w.wave}: {w.enemies.map(e => e.name).join(', ')}</span>
              <span style={{ color: w.won ? '#00c853' : '#f44336' }}>{w.won ? `${w.totalTurns}t` : 'KO'}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-primary" onClick={startDungeon} style={{ flex: 1 }}>Riprova</button>
          <button className="btn btn-secondary" onClick={backToZoneSelect} style={{ flex: 1 }}>Mappa</button>
        </div>
      </div>
    );
  }

  return <div className="loading"><div className="spinner" /> Preparazione...</div>;
}
