import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { PvpResult } from '../services/api';
import { BattleArena, ArenaFighter } from './BattleArena';
import { HeroClass, Rarity } from '../types';
import { CountUp } from './CountUp';

const PVP_SPEED_OPTIONS = [
  { label: '1x', value: 500 },
  { label: '2x', value: 250 },
  { label: '3x', value: 120 },
];

function getSavedPvpSpeed(): number {
  try { return parseInt(localStorage.getItem('battleSpeed') || '500', 10); } catch { return 500; }
}

export function PvpArena() {
  const [state, setState] = useState<'idle' | 'searching' | 'fighting' | 'result'>('idle');
  const [result, setResult] = useState<PvpResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myRank, setMyRank] = useState<any>(null);
  const [battleSpeed, setBattleSpeed] = useState(getSavedPvpSpeed);

  useEffect(() => { loadRank(); }, []);

  async function loadRank() {
    try {
      const data = await api.getMyRank();
      setMyRank(data.rank);
    } catch (err) { /* ignore */ }
  }

  async function startFight() {
    setState('searching');
    setError(null);
    try {
      const data = await api.startPvp();
      setResult(data);
      setState('fighting');
    } catch (err: any) {
      setError(err.message);
      setState('idle');
    }
  }

  function onFightComplete() {
    setState('result');
  }

  function skipToResult() {
    setState('result');
  }

  function backToIdle() {
    setState('idle');
    setResult(null);
    loadRank();
  }

  function heroToFighter(hero: any, team: 'left' | 'right'): ArenaFighter {
    return {
      id: hero.id || `unknown_${Math.random()}`,
      name: hero.name || 'Sconosciuto',
      heroClass: (hero.heroClass || 'lama') as HeroClass,
      rarity: (hero.rarity || 'comune') as Rarity,
      isMonster: false,
      maxHp: hero.maxHp || 100,
      currentHp: hero.maxHp || 100,
      team,
      isAlive: true,
    };
  }

  function buildTeams(): { left: ArenaFighter[]; right: ArenaFighter[] } {
    if (!result) return { left: [], right: [] };
    return {
      left: (result.myPartyHeroes || []).map((h: any) => heroToFighter(h, 'left')),
      right: (result.opponentPartyHeroes || []).map((h: any) => heroToFighter(h, 'right')),
    };
  }

  // ===== IDLE =====
  if (state === 'idle') {
    const winRate = myRank && (myRank.wins + myRank.losses) > 0
      ? Math.round((myRank.wins / (myRank.wins + myRank.losses)) * 100)
      : null;

    return (
      <div>
        {/* === ARENA HEADER === */}
        <div style={{
          background: 'linear-gradient(160deg, #1a0505 0%, #0a0a0a 60%, #2a0a0a 100%)',
          borderRadius: 14, padding: '18px 14px', textAlign: 'center', marginBottom: 10,
          border: '2px solid #f44336',
          boxShadow: '0 0 24px rgba(244,67,54,0.35), inset 0 0 30px rgba(244,67,54,0.08)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            fontSize: 22, fontWeight: 900, letterSpacing: 3,
            background: 'linear-gradient(180deg, #ff8a80, #c62828)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            textShadow: '0 0 14px rgba(244,67,54,0.5)',
            marginBottom: 4,
          }}>
            ⚔ ARENA PVP ⚔
          </div>
          <div style={{ fontSize: 10, color: '#adadb8', marginBottom: 14, letterSpacing: 1 }}>
            Sfida ELO-matched · Il party attivo combatte in automatico
          </div>

          {/* ELO mega + Rank */}
          {myRank && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 16, marginBottom: 12,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 9, color: '#adadb8', letterSpacing: 2, textTransform: 'uppercase',
                  }}>ELO</div>
                  <div style={{
                    fontSize: 32, fontWeight: 900, lineHeight: 1,
                    background: 'linear-gradient(180deg, #ffd700, #ff8a00)',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                    textShadow: '0 0 18px rgba(255,180,0,0.45)',
                  }}>
                    {myRank.elo}
                  </div>
                </div>
                <div style={{ width: 1, height: 40, background: 'rgba(244,67,54,0.3)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 9, color: '#adadb8', letterSpacing: 2, textTransform: 'uppercase',
                  }}>Rank</div>
                  <div style={{
                    fontSize: 28, fontWeight: 900, color: '#efeff1', lineHeight: 1,
                  }}>
                    #{myRank.rank}
                  </div>
                </div>
              </div>

              {/* Win/Loss + Win Rate */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap',
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999,
                  background: 'rgba(34,197,94,0.18)', color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.3)',
                }}>
                  {myRank.wins} W
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999,
                  background: 'rgba(244,67,54,0.18)', color: '#f44336',
                  border: '1px solid rgba(244,67,54,0.3)',
                }}>
                  {myRank.losses} L
                </span>
                {winRate !== null && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999,
                    background: 'rgba(255,215,0,0.15)', color: '#ffd700',
                    border: '1px solid rgba(255,215,0,0.3)',
                  }}>
                    {winRate}% WR
                  </span>
                )}
              </div>
            </>
          )}

          <button
            onClick={startFight}
            style={{
              fontSize: 14, padding: '12px 28px', fontWeight: 900, letterSpacing: 2,
              background: 'linear-gradient(180deg, #ff5252, #b71c1c)',
              border: '1px solid #ff8a80', borderRadius: 10,
              color: '#fff', cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(244,67,54,0.45)',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            ⚔ CERCA AVVERSARIO
          </button>
          {error && (
            <div style={{ color: '#f44336', fontSize: 11, marginTop: 10, fontWeight: 700 }}>
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== SEARCHING =====
  if (state === 'searching') {
    return (
      <div style={{
        textAlign: 'center', padding: '50px 20px',
        background: 'linear-gradient(160deg, #1a0505 0%, #0a0a0a 70%)',
        borderRadius: 14, border: '1px solid rgba(244,67,54,0.4)',
        boxShadow: 'inset 0 0 40px rgba(244,67,54,0.1)',
      }}>
        <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#f44336' }} />
        <div style={{
          fontSize: 16, fontWeight: 900, letterSpacing: 2,
          color: '#f44336', textShadow: '0 0 12px rgba(244,67,54,0.6)',
          marginBottom: 4,
        }}>
          ⚔ CERCANDO AVVERSARIO ⚔
        </div>
        <div style={{ fontSize: 10, color: '#adadb8', letterSpacing: 1 }}>
          matchmaking ELO-based in corso...
        </div>
      </div>
    );
  }

  // ===== FIGHTING =====
  if (state === 'fighting' && result) {
    const { left, right } = buildTeams();

    return (
      <div>
        <div style={{
          background: 'linear-gradient(90deg, #1a0505, #2a0a0a, #1a0505)',
          borderRadius: '8px 8px 0 0', padding: '6px 10px',
          textAlign: 'center',
          borderTop: '1px solid #f44336', borderLeft: '1px solid #f44336', borderRight: '1px solid #f44336',
          boxShadow: '0 0 16px rgba(244,67,54,0.25)',
        }}>
          <span style={{
            fontSize: 11, fontWeight: 900, letterSpacing: 2,
            color: '#ff8a80', textShadow: '0 0 8px rgba(244,67,54,0.5)',
          }}>
            ⚔ VS {result.opponentName}
          </span>
          {result.isBot && (
            <span style={{
              marginLeft: 8, fontSize: 8, fontWeight: 800, color: '#adadb8',
              background: '#0e0e10', borderRadius: 999, padding: '2px 7px',
              border: '1px solid #444', verticalAlign: 'middle', letterSpacing: 1,
            }}>
              🤖 BOT
            </span>
          )}
        </div>

        {/* Speed control */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
          {PVP_SPEED_OPTIONS.map(opt => (
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
          log={result.log}
          speed={battleSpeed}
          onComplete={onFightComplete}
          onSkip={skipToResult}
        />
      </div>
    );
  }

  // ===== RESULT =====
  if (state === 'result' && result) {
    const eloUp = result.eloChange >= 0;
    return (
      <div>
        <div className={`result-banner ${result.won ? 'victory' : 'defeat'}`}>
          <div className={`result-title ${result.won ? '' : 'defeat'}`}>
            {result.won ? '✦ VITTORIA ✦' : '✗ SCONFITTA'}
          </div>
          <div style={{ fontSize: 11, color: '#fff', opacity: 0.85, marginTop: 4, letterSpacing: 1 }}>
            vs <strong>{result.opponentName}</strong>{result.isBot ? ' 🤖' : ''}
          </div>
          <div style={{
            display: 'inline-block', marginTop: 8, padding: '4px 12px',
            borderRadius: 999, background: 'rgba(0,0,0,0.35)',
            fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: 1,
          }}>
            {result.totalTurns} turni
          </div>
        </div>

        <div className="reward-box">
          <div style={{
            fontSize: 9, color: '#adadb8', textAlign: 'center',
            textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8,
          }}>
            Risultato
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div className="reward-pill">
              <div style={{
                fontSize: 20, fontWeight: 900, lineHeight: 1,
                color: eloUp ? '#22c55e' : '#f44336',
                textShadow: `0 0 10px ${eloUp ? 'rgba(34,197,94,0.4)' : 'rgba(244,67,54,0.4)'}`,
              }}>
                {eloUp ? '↑' : '↓'} {eloUp ? '+' : ''}{result.eloChange}
              </div>
              <div style={{ fontSize: 9, color: '#adadb8', letterSpacing: 1 }}>
                ELO · {result.newElo}
              </div>
            </div>
            <div className="reward-pill">
              <CountUp
                to={result.rewards.exp}
                duration={800}
                style={{ fontSize: 20, fontWeight: 900, color: '#64b5f6' }}
                format={n => `+${n.toLocaleString()}`}
              />
              <div style={{ fontSize: 9, color: '#adadb8', letterSpacing: 1 }}>EXP</div>
            </div>
            <div className="reward-pill">
              <CountUp
                to={result.rewards.gold}
                duration={800}
                style={{ fontSize: 20, fontWeight: 900, color: '#ffd700' }}
                format={n => `+${n.toLocaleString()}`}
              />
              <div style={{ fontSize: 9, color: '#adadb8', letterSpacing: 1 }}>GOLD</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={startFight} className="raid-action-attack">
            ⚔ Ancora!
          </button>
          <button
            className="btn btn-secondary"
            onClick={backToIdle}
            style={{ flex: 1, padding: '10px' }}
          >
            Indietro
          </button>
        </div>
      </div>
    );
  }

  return null;
}
