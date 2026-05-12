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
    const hpBarColor = raid.hpPercent > 50 ? '#22c55e' : raid.hpPercent > 20 ? '#ff9800' : '#f44336';

    return (
      <div className="raid-container">
        <div className="raid-header">
          <div className="raid-boss-display">
            <div className="raid-boss-sprite-container" style={{ fontSize: 60 }}>
              {raid.emoji}
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#f44336', textShadow: '0 0 15px rgba(244,67,54,0.3)', margin: '0 0 4px' }}>
              {raid.name}
            </h2>
            <div style={{ fontSize: 10, color: '#adadb8', textTransform: 'uppercase', letterSpacing: 2 }}>
              Boss Settimanale #{raid.weekNumber}
            </div>
          </div>

          {raid.defeated ? (
            <div style={{ 
              textAlign: 'center', color: '#ffd700', fontWeight: 900, fontSize: 20, 
              padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: 12,
              border: '1px solid #ffd700'
            }}>
              🏆 SCONFITTO!
            </div>
          ) : (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, fontWeight: 800 }}>
                <span style={{ color: '#adadb8' }}>HP DEL BOSS</span>
                <span style={{ color: hpBarColor }}>{raid.currentHp.toLocaleString()}</span>
              </div>
              <div style={{ height: 16, background: 'rgba(0,0,0,0.4)', borderRadius: 8, overflow: 'hidden', border: '1px solid #333' }}>
                <div className="hp-bar-fill" style={{
                  width: `${raid.hpPercent}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${hpBarColor}, ${hpBarColor}aa)`,
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
              </div>
              <div style={{ textAlign: 'center', fontSize: 10, color: '#adadb8', marginTop: 4, fontWeight: 700 }}>
                {raid.hpPercent}% RIMANENTE
              </div>
            </div>
          )}

          {!raid.defeated && (
            <button className="btn btn-primary" onClick={handleAttack}
              style={{ 
                width: '100%', background: '#f44336', fontSize: 16, padding: '12px',
                boxShadow: '0 4px 15px rgba(244,67,54,0.4)', fontWeight: 900
              }}>
              ATTACCA IL BOSS!
            </button>
          )}
          {error && <div style={{ color: '#f44336', fontSize: 11, marginTop: 8, textAlign: 'center', fontWeight: 700 }}>⚠️ {error}</div>}
        </div>

        {raid.myContribution && (
          <div className="contribution-bar-container">
            <div style={{ fontSize: 11, color: '#9147ff', fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>
              🎯 La tua contribuzione
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#f44336' }}>{raid.myContribution.damageDealt.toLocaleString()}</div>
                <div style={{ fontSize: 8, color: '#adadb8', textTransform: 'uppercase' }}>Totale</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 900 }}>{raid.myContribution.attempts}</div>
                <div style={{ fontSize: 8, color: '#adadb8', textTransform: 'uppercase' }}>Turni</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#ff9800' }}>{raid.myContribution.bestDamage.toLocaleString()}</div>
                <div style={{ fontSize: 8, color: '#adadb8', textTransform: 'uppercase' }}>Best</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#adadb8', marginBottom: 10, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
            <span>🏆 Leaderboard</span>
            <span style={{ fontSize: 10, fontWeight: 400 }}>{raid.totalContributors} eroi attivi</span>
          </div>
          
          {raid.topContributors.slice(0, 5).map((c, i) => (
            <div key={c.userId} className="leaderboard-item">
              <div className={`leaderboard-rank rank-${i + 1}`}>
                {i < 3 ? '' : i + 1}
                {i === 0 && '🥇'}
                {i === 1 && '🥈'}
                {i === 2 && '🥉'}
              </div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>{c.displayName}</div>
              <div style={{ color: '#f44336', fontWeight: 900, fontSize: 12 }}>
                {c.damageDealt.toLocaleString()} <span style={{ fontSize: 9 }}>dmg</span>
              </div>
            </div>
          ))}
        </div>
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
