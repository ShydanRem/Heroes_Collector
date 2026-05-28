import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { DungeonResult, ZoneInfo } from '../services/api';
import { BattleArena, ArenaFighter } from './BattleArena';
import { HeroClass, Rarity } from '../types';
import { CountUp } from './CountUp';

const SPEED_OPTIONS = [
  { label: '1x', value: 600 },
  { label: '2x', value: 300 },
  { label: '3x', value: 150 },
];

function getSavedSpeed(): number {
  try { return parseInt(localStorage.getItem('battleSpeed') || '600', 10); } catch { return 600; }
}

export function BattleView() {
  const [state, setState] = useState<'zone_select' | 'idle' | 'loading' | 'fighting' | 'wave_complete' | 'result'>('zone_select');
  const [zones, setZones] = useState<ZoneInfo[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneInfo | null>(null);
  const [dungeonResult, setDungeonResult] = useState<DungeonResult | null>(null);
  const [currentWave, setCurrentWave] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [battleSpeed, setBattleSpeed] = useState(getSavedSpeed);

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

  function getZoneTheme(zone: ZoneInfo): string {
    const name = zone.name.toLowerCase();
    const emoji = zone.emoji;
    if (name.includes('foresta') || emoji === '🌲' || emoji === '🌳') return 'forest';
    if (name.includes('vulcano') || name.includes('fuoco') || emoji === '🌋' || emoji === '🔥') return 'volcano';
    if (name.includes('ghiaccio') || name.includes('neve') || emoji === '❄️' || emoji === '🏔️') return 'ice';
    if (name.includes('deserto') || name.includes('sabbia') || emoji === '🏜️' || emoji === '🌵') return 'sand';
    if (name.includes('oscuro') || name.includes('morte') || emoji === '💀' || emoji === '🌑') return 'dark';
    return '';
  }

  // ===== ZONE SELECT =====
  if (state === 'zone_select') {
    if (zonesLoading) {
      return <div className="loading"><div className="spinner" /> Caricamento campagna...</div>;
    }

    return (
      <div className="zone-selection-container">
        <header style={{
          background: 'linear-gradient(135deg, #1a0a2e, #18181b)',
          borderRadius: 16, padding: '16px 20px', textAlign: 'center', marginBottom: 16,
          border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#9147ff', margin: 0, letterSpacing: 1 }}>CAMPAGNA</h1>
          <p style={{ fontSize: 10, color: '#adadb8', marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 }}>Esplora i Dungeon di Shydan</p>
        </header>

        <div className="zone-list">
          {zones.map((zone) => {
            const isLocked = !zone.unlocked;
            const theme = getZoneTheme(zone);
            const progress = (zone.bestWaves / zone.totalWaves) * 100;

            return (
              <div key={zone.id}
                className={`zone-card ${isLocked ? 'locked' : ''} ${theme}`}
                onClick={() => selectZone(zone)}
              >
                <div className="zone-card-bg" />
                
                <div className="zone-emoji-container">
                  {isLocked ? '🔒' : zone.emoji}
                </div>

                <div className="zone-content">
                  <div className="zone-header">
                    <span className="zone-title">{zone.name}</span>
                    {!isLocked && zone.cleared && <span style={{ color: '#22c55e', fontSize: 14 }}>✅</span>}
                  </div>

                  <div className="zone-pills">
                    <span className="zone-pill level">Lv. {zone.recommendedLevel}</span>
                    <span className="zone-pill">{zone.totalWaves} Onde</span>
                    {zone.totalClears > 0 && <span className="zone-pill cleared">{zone.totalClears} Clears</span>}
                  </div>

                  {!isLocked && (
                    <div className="zone-mini-progress">
                      <div className="zone-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                  
                  {!isLocked && (
                    <div style={{ fontSize: 8, color: '#adadb8', marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <span>PROGRESSO</span>
                      <span>{zone.bestWaves}/{zone.totalWaves}</span>
                    </div>
                  )}
                </div>

                {!isLocked && (
                  <div style={{ marginLeft: 'auto', fontSize: 20, color: '#9147ff', opacity: 0.5 }}>
                    ➜
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== IDLE (zona selezionata) =====
  if (state === 'idle' && selectedZone) {
    return (
      <div>
        <div style={{
          background: 'linear-gradient(160deg, #1a0a2e 0%, #0a0a0a 60%, #1a0a2e 100%)',
          borderRadius: 14, padding: '20px 16px', textAlign: 'center', marginBottom: 10,
          border: '2px solid #9147ff',
          boxShadow: '0 0 24px rgba(145,71,255,0.35), inset 0 0 30px rgba(145,71,255,0.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 44, marginBottom: 6, filter: 'drop-shadow(0 0 12px rgba(145,71,255,0.6))' }}>
            {selectedZone.emoji}
          </div>
          <div style={{
            fontSize: 20, fontWeight: 900, letterSpacing: 1,
            background: 'linear-gradient(180deg, #c084fc, #7e3af2)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            textShadow: '0 0 14px rgba(145,71,255,0.45)',
            marginBottom: 8,
          }}>
            {selectedZone.name}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
              background: 'rgba(145,71,255,0.18)', color: '#c084fc',
              border: '1px solid rgba(145,71,255,0.3)',
            }}>
              {selectedZone.totalWaves} Ondate
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
              background: 'rgba(34,197,94,0.15)', color: '#22c55e',
              border: '1px solid rgba(34,197,94,0.3)',
            }}>
              Lv. {selectedZone.recommendedLevel}
            </span>
          </div>
          {selectedZone.cleared && (
            <div style={{
              fontSize: 10, color: '#f59e0b', fontWeight: 700, marginBottom: 10,
              padding: '4px 10px', borderRadius: 6, display: 'inline-block',
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
            }}>
              ⚠ Farm mode — Ricompense ridotte
            </div>
          )}
          <button
            className="btn btn-primary"
            onClick={startDungeon}
            style={{
              fontSize: 14, padding: '12px 32px', fontWeight: 900, letterSpacing: 2,
              background: 'linear-gradient(180deg, #9147ff, #5e35b1)',
              border: '1px solid #c084fc', borderRadius: 10,
              boxShadow: '0 6px 18px rgba(145,71,255,0.45)',
              display: 'block', margin: '0 auto',
            }}
          >
            ⚔ ENTRA
          </button>
          {error && <div style={{ color: '#f44336', fontSize: 12, marginTop: 10 }}>{error}</div>}
        </div>

        <button className="btn btn-secondary" onClick={backToZoneSelect} style={{ width: '100%', fontSize: 11 }}>
          ← Cambia zona
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

        {/* Speed control */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
          {SPEED_OPTIONS.map(opt => (
            <button key={opt.value}
              onClick={() => { setBattleSpeed(opt.value); localStorage.setItem('battleSpeed', opt.value.toString()); }}
              style={{
                background: battleSpeed === opt.value ? '#9147ff' : '#18181b',
                color: battleSpeed === opt.value ? '#fff' : '#adadb8',
                border: '1px solid #333', borderRadius: 4, padding: '2px 8px',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}>
              {opt.label}
            </button>
          ))}
        </div>

        <BattleArena
          leftTeam={left} rightTeam={right} log={wave.log}
          speed={battleSpeed} onComplete={onWaveComplete} onSkip={skipToResult}
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
        <div className={`result-banner ${wave.won ? 'victory' : 'defeat'}`}>
          <div className={`result-title ${wave.won ? '' : 'defeat'}`} style={{ fontSize: 18 }}>
            {wave.won ? `✦ ONDATA ${wave.wave} SUPERATA ✦` : `✗ ONDATA ${wave.wave} SCONFITTA`}
          </div>
          <div style={{ fontSize: 10, color: '#adadb8', marginTop: 4 }}>
            {wave.enemies.map(e => e.name).join(' · ')}
          </div>
          <div style={{ fontSize: 10, color: '#fff', marginTop: 4, opacity: 0.8 }}>
            {wave.totalTurns} turni di combattimento
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={isLastWave || !wave.won ? () => setState('result') : nextWave}
          style={{
            fontSize: 13, padding: '10px 24px', fontWeight: 800, letterSpacing: 1,
            background: 'linear-gradient(180deg, #9147ff, #5e35b1)',
            border: '1px solid #c084fc', borderRadius: 10,
            boxShadow: '0 4px 14px rgba(145,71,255,0.35)',
          }}
        >
          {isLastWave || !wave.won ? '📜 Vedi risultati' : `Ondata ${currentWave + 2} →`}
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

        <div className={`result-banner ${dungeonResult.won ? 'victory' : 'defeat'} ${dungeonResult.isReplay ? 'farm' : ''}`}>
          <div className={`result-title ${dungeonResult.won ? '' : 'defeat'}`}>
            {dungeonResult.won ? '✦ VITTORIA ✦' : '✗ SCONFITTA'}
          </div>
          <div style={{ fontSize: 11, color: '#fff', opacity: 0.85, marginTop: 4, letterSpacing: 1 }}>
            {dungeonResult.zoneEmoji} {dungeonResult.zoneName}
          </div>
          <div style={{
            display: 'inline-block', marginTop: 8, padding: '4px 12px',
            borderRadius: 999, background: 'rgba(0,0,0,0.35)',
            fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 1,
          }}>
            {dungeonResult.wavesCompleted}/{dungeonResult.totalWaves} ondate
          </div>
          {dungeonResult.isReplay && (
            <div style={{ fontSize: 9, color: '#f59e0b', marginTop: 8, letterSpacing: 1 }}>
              ⚠ FARM MODE — RICOMPENSE RIDOTTE
            </div>
          )}
        </div>

        <div className="reward-box">
          <div style={{
            fontSize: 9, color: '#adadb8', textAlign: 'center',
            textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8,
          }}>
            Ricompense
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div className="reward-pill">
              <CountUp
                to={dungeonResult.rewards.exp}
                duration={800}
                style={{ fontSize: 20, fontWeight: 900, color: '#64b5f6' }}
                format={n => `+${n.toLocaleString()}`}
              />
              <div style={{ fontSize: 9, color: '#adadb8', letterSpacing: 1 }}>EXP</div>
            </div>
            <div className="reward-pill">
              <CountUp
                to={dungeonResult.rewards.gold}
                duration={800}
                style={{ fontSize: 20, fontWeight: 900, color: '#ffd700' }}
                format={n => `+${n.toLocaleString()}`}
              />
              <div style={{ fontSize: 9, color: '#adadb8', letterSpacing: 1 }}>GOLD</div>
            </div>
          </div>
          {dungeonResult.rewards.items.length > 0 && (
            <div style={{
              marginTop: 10, padding: '6px 8px',
              background: 'linear-gradient(90deg, rgba(255,152,0,0.15), rgba(255,152,0,0.04))',
              borderLeft: '3px solid #ff9800', borderRadius: 4,
            }}>
              <div style={{ fontSize: 9, color: '#ff9800', letterSpacing: 1, marginBottom: 2 }}>
                💎 LOOT
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
                {dungeonResult.rewards.items.join(' · ')}
              </div>
            </div>
          )}
        </div>

        {/* Riepilogo ondate */}
        <div style={{ marginBottom: 10 }}>
          <div style={{
            fontSize: 9, color: '#adadb8', textAlign: 'center',
            textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6,
          }}>
            Riepilogo ondate
          </div>
          {dungeonResult.waves.map((w) => (
            <div key={w.wave} className={`wave-row ${w.won ? 'won' : 'lost'}`}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span className="wave-num">#{w.wave}</span>
                <span style={{
                  fontSize: 10, color: '#adadb8',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {w.enemies.map(e => e.name).join(' · ')}
                </span>
              </span>
              <span style={{
                fontWeight: 800, fontSize: 10,
                color: w.won ? '#22c55e' : '#f44336',
                whiteSpace: 'nowrap', marginLeft: 8,
              }}>
                {w.won ? `${w.totalTurns}t ✓` : '✗ KO'}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-primary"
            onClick={startDungeon}
            style={{
              flex: 1, padding: '10px', fontWeight: 800, letterSpacing: 1,
              background: 'linear-gradient(180deg, #9147ff, #5e35b1)',
              border: '1px solid #c084fc', borderRadius: 10,
              boxShadow: '0 4px 14px rgba(145,71,255,0.35)',
            }}
          >
            🔄 Riprova
          </button>
          <button
            className="btn btn-secondary"
            onClick={backToZoneSelect}
            style={{ flex: 1, padding: '10px' }}
          >
            🗺 Mappa
          </button>
        </div>
      </div>
    );
  }

  return <div className="loading"><div className="spinner" /> Preparazione...</div>;
}
