import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { RaidInfo, RaidAttackResult } from '../services/api';
import { BattleArena, ArenaFighter } from './BattleArena';
import { HeroClass, Rarity } from '../types';

const RAID_SPEED_OPTIONS = [
  { label: '1x', value: 400 },
  { label: '2x', value: 200 },
  { label: '3x', value: 100 },
];

function getSavedRaidSpeed(): number {
  try { return parseInt(localStorage.getItem('battleSpeed') || '400', 10); } catch { return 400; }
}

export function RaidBoss() {
  const [raid, setRaid] = useState<RaidInfo | null>(null);
  const [state, setState] = useState<'info' | 'fighting' | 'result'>('info');
  const [attackResult, setAttackResult] = useState<RaidAttackResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [battleSpeed, setBattleSpeed] = useState(getSavedRaidSpeed);

  useEffect(() => { loadRaid(); }, []);

  async function loadRaid() {
    try {
      const data = await api.getRaidInfo();
      setRaid(data.raid);
    } catch (err) {
      console.error('Errore caricamento raid:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAttack() {
    setError(null);
    try {
      const result = await api.attackRaid();
      setAttackResult(result);
      setState('fighting');
    } catch (err: any) {
      setError(err.message);
    }
  }

  function onFightComplete() { setState('result'); }
  function skipToResult() { setState('result'); }

  function backToInfo() {
    setState('info');
    setAttackResult(null);
    loadRaid();
  }

  function buildTeams(): { left: ArenaFighter[]; right: ArenaFighter[] } {
    if (!attackResult || !raid) return { left: [], right: [] };

    const left: ArenaFighter[] = (attackResult.partyHeroes || []).map(hero => ({
      id: hero.id,
      name: hero.name,
      heroClass: hero.heroClass as HeroClass,
      rarity: hero.rarity as Rarity,
      isMonster: false,
      maxHp: hero.maxHp,
      currentHp: hero.maxHp,
      team: 'left' as const,
      isAlive: true,
    }));

    const boss = attackResult.boss;
    const right: ArenaFighter[] = boss ? [{
      id: boss.id,
      name: boss.name,
      emoji: boss.emoji,
      tier: 'boss',
      isMonster: true,
      maxHp: boss.maxHp,
      currentHp: boss.maxHp,
      team: 'right' as const,
      isAlive: true,
    }] : [];

    return { left, right };
  }

  if (loading) {
    return <div className="loading"><div className="spinner" /> Caricamento raid...</div>;
  }

  if (!raid) {
    return <div className="empty-state"><p>Nessun raid boss questa settimana.</p></div>;
  }

  // ===== INFO BOSS =====
  if (state === 'info') {
    const hpBarColor = raid.hpPercent > 50 ? '#00c853' : raid.hpPercent > 20 ? '#ff9800' : '#f44336';

    return (
      <div>
        <div className="raid-boss-card">
          <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 4 }}>{raid.emoji}</div>
          <div style={{ fontSize: 18, fontWeight: 800, textAlign: 'center', color: '#f44336' }}>
            {raid.name}
          </div>
          <div style={{ fontSize: 10, textAlign: 'center', color: '#adadb8', marginBottom: 8 }}>
            Boss Settimanale #{raid.weekNumber}
          </div>

          {raid.defeated ? (
            <div style={{ textAlign: 'center', color: '#00c853', fontWeight: 800, fontSize: 16, padding: 8 }}>
              SCONFITTO!
            </div>
          ) : (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                <span>HP</span>
                <span>{raid.currentHp.toLocaleString()} / {raid.maxHp.toLocaleString()}</span>
              </div>
              <div style={{ height: 12, background: '#0e0e10', borderRadius: 6, overflow: 'hidden' }}>
                <div className="hp-bar-fill" style={{
                  width: `${raid.hpPercent}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${hpBarColor}, ${hpBarColor}aa)`,
                  borderRadius: 6,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ textAlign: 'center', fontSize: 10, color: '#adadb8', marginTop: 2 }}>
                {raid.hpPercent}% rimanente
              </div>
            </div>
          )}

          {!raid.defeated && (
            <button className="btn btn-primary" onClick={handleAttack}
              style={{ width: '100%', background: '#f44336', fontSize: 14, padding: '10px' }}>
              Attacca il Boss!
            </button>
          )}
          {error && <div style={{ color: '#f44336', fontSize: 11, marginTop: 6, textAlign: 'center' }}>{error}</div>}
        </div>

        {raid.myContribution && (
          <div style={{ background: '#18181b', borderRadius: 8, padding: 10, marginBottom: 8, border: '1px solid #9147ff' }}>
            <div style={{ fontSize: 11, color: '#9147ff', fontWeight: 700, marginBottom: 4 }}>La tua contribuzione</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, fontSize: 11 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, color: '#f44336' }}>{raid.myContribution.damageDealt.toLocaleString()}</div>
                <div style={{ fontSize: 9, color: '#adadb8' }}>Danno totale</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800 }}>{raid.myContribution.attempts}</div>
                <div style={{ fontSize: 9, color: '#adadb8' }}>Tentativi</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, color: '#ff9800' }}>{raid.myContribution.bestDamage.toLocaleString()}</div>
                <div style={{ fontSize: 9, color: '#adadb8' }}>Miglior colpo</div>
              </div>
            </div>
          </div>
        )}

        {raid.topContributors.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#adadb8', marginBottom: 4 }}>Top Contributori</div>
            {raid.topContributors.slice(0, 5).map((c, i) => (
              <div key={c.userId} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#18181b', borderRadius: 4, padding: '4px 8px', marginBottom: 2, fontSize: 11,
              }}>
                <span>
                  <span style={{ fontWeight: 800, color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#adadb8', marginRight: 6 }}>
                    #{i + 1}
                  </span>
                  {c.displayName}
                </span>
                <span style={{ color: '#f44336', fontWeight: 700 }}>{c.damageDealt.toLocaleString()} dmg</span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#555', marginTop: 4, textAlign: 'center' }}>
              {raid.totalContributors} giocatori hanno partecipato
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== FIGHTING =====
  if (state === 'fighting' && attackResult) {
    const { left, right } = buildTeams();

    return (
      <div>
        <div style={{
          background: '#1f1f23', borderRadius: '6px 6px 0 0', padding: '4px 8px',
          textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#f44336',
        }}>
          {raid.emoji} {raid.name}
        </div>

        {/* Speed control */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
          {RAID_SPEED_OPTIONS.map(opt => (
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
          leftTeam={left}
          rightTeam={right}
          log={attackResult.log}
          speed={battleSpeed}
          onComplete={onFightComplete}
          onSkip={skipToResult}
        />
      </div>
    );
  }

  // ===== RESULT =====
  if (state === 'result' && attackResult) {
    return (
      <div>
        <div style={{
          background: attackResult.bossDefeated ? '#1b5e20' : '#18181b',
          borderRadius: 8, padding: 16, textAlign: 'center', marginBottom: 8,
          border: `2px solid ${attackResult.bossDefeated ? '#00c853' : '#f44336'}`,
        }}>
          {attackResult.bossDefeated && (
            <div style={{ fontSize: 20, fontWeight: 800, color: '#ffd700', marginBottom: 4 }}>
              BOSS SCONFITTO!
            </div>
          )}
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f44336' }}>
            {attackResult.damageDealt.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: '#adadb8' }}>danni inflitti in {attackResult.totalTurns} turni</div>
          <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>
            Boss HP: {attackResult.bossHpAfter.toLocaleString()} / {attackResult.bossHpBefore.toLocaleString()}
          </div>
        </div>

        <div style={{ background: '#18181b', borderRadius: 8, padding: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#64b5f6' }}>+{attackResult.rewards.exp}</div>
              <div style={{ fontSize: 10, color: '#adadb8' }}>EXP</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffd700' }}>+{attackResult.rewards.gold}</div>
              <div style={{ fontSize: 10, color: '#adadb8' }}>Gold</div>
            </div>
          </div>
          {attackResult.rewards.items.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 8, color: '#ff9800', fontWeight: 700, fontSize: 12 }}>
              Drop: {attackResult.rewards.items.join(', ')}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-primary" onClick={handleAttack} style={{ flex: 1, background: '#f44336' }}>Ancora!</button>
          <button className="btn btn-secondary" onClick={backToInfo} style={{ flex: 1 }}>Indietro</button>
        </div>
      </div>
    );
  }

  return null;
}
