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
    const hpDanger = raid.hpPercent <= 20;

    return (
      <div className="raid-container">
        <div className="raid-boss-banner">
          <span className="raid-corner tl" /><span className="raid-corner tr" />
          <span className="raid-corner bl" /><span className="raid-corner br" />

          <div className="raid-boss-emoji">{raid.emoji}</div>
          <div className="raid-boss-name">{raid.name}</div>
          <div className="raid-boss-tag">Boss Settimanale #{raid.weekNumber}</div>

          {raid.defeated ? (
            <div className="raid-defeated-badge">🏆 SCONFITTO!</div>
          ) : (
            <>
              <div className={`raid-hp${hpDanger ? ' raid-hp-danger' : ''}`}>
                <div className="raid-hp-top">
                  <span className="lbl">HP del Boss</span>
                  <span style={{ color: hpBarColor }}>{raid.currentHp.toLocaleString()}</span>
                </div>
                <div className="raid-hp-track">
                  <div className="raid-hp-fill" style={{
                    width: `${raid.hpPercent}%`,
                    background: `linear-gradient(90deg, ${hpBarColor}, ${hpBarColor}99)`,
                  }} />
                </div>
                <div className="raid-hp-pct">{raid.hpPercent}% rimanente</div>
              </div>

              <button className="raid-attack-btn" onClick={handleAttack}>
                ⚔️ Attacca il Boss!
              </button>
            </>
          )}
          {error && <div style={{ color: '#f44336', fontSize: 11, marginTop: 8, textAlign: 'center', fontWeight: 700 }}>⚠️ {error}</div>}
        </div>

        {raid.myContribution && (
          <div className="raid-contrib">
            <div className="raid-contrib-title">🎯 La tua contribuzione</div>
            <div className="raid-contrib-grid">
              <div className="raid-contrib-cell">
                <div className="v dmg">{raid.myContribution.damageDealt.toLocaleString()}</div>
                <div className="k">Totale</div>
              </div>
              <div className="raid-contrib-cell">
                <div className="v">{raid.myContribution.attempts}</div>
                <div className="k">Turni</div>
              </div>
              <div className="raid-contrib-cell">
                <div className="v best">{raid.myContribution.bestDamage.toLocaleString()}</div>
                <div className="k">Best</div>
              </div>
            </div>
          </div>
        )}

        <div className="raid-lb-head">
          <span>🏆 Leaderboard</span>
          <span className="count">{raid.totalContributors} eroi attivi</span>
        </div>
        {raid.topContributors.slice(0, 5).map((c, i) => (
          <div key={c.userId} className="raid-lb-row">
            <div className={`raid-lb-rank${i < 3 ? ` r${i + 1}` : ''}`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
            </div>
            <div className="raid-lb-name">{c.displayName}</div>
            <div className="raid-lb-dmg">{c.damageDealt.toLocaleString()} <span>dmg</span></div>
          </div>
        ))}
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
