import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { PvpResult } from '../services/api';
import { BattleArena, ArenaFighter } from './BattleArena';
import { HeroClass, Rarity } from '../types';

export function PvpArena() {
  const [state, setState] = useState<'idle' | 'searching' | 'fighting' | 'result'>('idle');
  const [result, setResult] = useState<PvpResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myRank, setMyRank] = useState<any>(null);

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

  function buildTeams(): { left: ArenaFighter[]; right: ArenaFighter[] } {
    if (!result) return { left: [], right: [] };

    // Costruisci team dal risultato PVP
    // Fallback: se i partyHeroes non sono disponibili, crea fighter dal log
    let leftHeroes = result.myPartyHeroes || [];
    let rightHeroes = result.opponentPartyHeroes || [];

    // Se i team sono vuoti, prova a ricostruirli dagli attori nel log
    if (leftHeroes.length === 0 && rightHeroes.length === 0 && result.log.length > 0) {
      const seenActors = new Map<string, { id: string; name: string }>();
      for (const entry of result.log) {
        if (entry.actorId && entry.actor && entry.actor !== 'status') {
          seenActors.set(entry.actorId, { id: entry.actorId, name: entry.actor });
        }
        if (entry.targetId && entry.target && entry.target !== 'status') {
          seenActors.set(entry.targetId, { id: entry.targetId, name: entry.target });
        }
      }
      const actors = Array.from(seenActors.values());
      const half = Math.ceil(actors.length / 2);
      leftHeroes = actors.slice(0, half).map(a => ({ id: a.id, name: a.name, heroClass: 'lama', rarity: 'comune', maxHp: 100 }));
      rightHeroes = actors.slice(half).map(a => ({ id: a.id, name: a.name, heroClass: 'lama', rarity: 'comune', maxHp: 100 }));
    }

    const left: ArenaFighter[] = leftHeroes.map((hero: any) => ({
      id: hero.id,
      name: hero.name,
      heroClass: (hero.heroClass || 'lama') as HeroClass,
      rarity: (hero.rarity || 'comune') as Rarity,
      isMonster: false,
      maxHp: hero.maxHp || 100,
      currentHp: hero.maxHp || 100,
      team: 'left' as const,
      isAlive: true,
    }));

    const right: ArenaFighter[] = rightHeroes.map((hero: any) => ({
      id: hero.id,
      name: hero.name,
      heroClass: (hero.heroClass || 'lama') as HeroClass,
      rarity: (hero.rarity || 'comune') as Rarity,
      isMonster: false,
      maxHp: hero.maxHp || 100,
      currentHp: hero.maxHp || 100,
      team: 'right' as const,
      isAlive: true,
    }));

    return { left, right };
  }

  // ===== IDLE =====
  if (state === 'idle') {
    return (
      <div>
        <div style={{
          background: 'linear-gradient(135deg, #1a0505 0%, #18181b 100%)',
          borderRadius: 8, padding: 12,
          textAlign: 'center', marginBottom: 8, border: '1px solid #333',
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#f44336', marginBottom: 4 }}>
            Arena PVP
          </div>
          <div style={{ fontSize: 11, color: '#adadb8', marginBottom: 10 }}>
            Sfida un avversario con ELO simile al tuo!<br />
            Il tuo party attivo combatte automaticamente.
          </div>

          {myRank && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4,
              marginBottom: 10, fontSize: 12,
            }}>
              <div style={{ background: '#0e0e10', borderRadius: 4, padding: 6 }}>
                <div style={{ color: '#adadb8', fontSize: 10 }}>ELO</div>
                <div style={{ fontWeight: 800, color: '#ffd700', fontSize: 18 }}>{myRank.elo}</div>
              </div>
              <div style={{ background: '#0e0e10', borderRadius: 4, padding: 6 }}>
                <div style={{ color: '#adadb8', fontSize: 10 }}>Posizione</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>#{myRank.rank}</div>
              </div>
              <div style={{ background: '#0e0e10', borderRadius: 4, padding: 6 }}>
                <div style={{ color: '#adadb8', fontSize: 10 }}>Vittorie</div>
                <div style={{ fontWeight: 700, color: '#00c853' }}>{myRank.wins}</div>
              </div>
              <div style={{ background: '#0e0e10', borderRadius: 4, padding: 6 }}>
                <div style={{ color: '#adadb8', fontSize: 10 }}>Sconfitte</div>
                <div style={{ fontWeight: 700, color: '#f44336' }}>{myRank.losses}</div>
              </div>
            </div>
          )}

          <button className="btn btn-primary" onClick={startFight} style={{ fontSize: 14, padding: '10px 24px', background: '#f44336' }}>
            Cerca Avversario!
          </button>
          {error && (
            <div style={{ color: '#f44336', fontSize: 12, marginTop: 8 }}>{error}</div>
          )}
        </div>
      </div>
    );
  }

  // ===== SEARCHING =====
  if (state === 'searching') {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div className="spinner" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f44336' }}>Cercando avversario...</div>
      </div>
    );
  }

  // ===== FIGHTING =====
  if (state === 'fighting' && result) {
    const { left, right } = buildTeams();

    return (
      <div>
        <div style={{
          background: '#1f1f23', borderRadius: '6px 6px 0 0', padding: '4px 8px',
          textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#f44336',
        }}>
          VS {result.opponentName}
        </div>

        <BattleArena
          leftTeam={left}
          rightTeam={right}
          log={result.log}
          speed={500}
          onComplete={onFightComplete}
          onSkip={skipToResult}
        />
      </div>
    );
  }

  // ===== RESULT =====
  if (state === 'result' && result) {
    return (
      <div>
        <div style={{
          background: result.won ? '#1b5e20' : '#b71c1c',
          borderRadius: 8, padding: 16, textAlign: 'center', marginBottom: 8,
        }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {result.won ? 'VITTORIA!' : 'SCONFITTA'}
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            vs {result.opponentName} ({result.totalTurns} turni)
          </div>
        </div>

        <div style={{
          background: '#18181b', borderRadius: 8, padding: 12,
          marginBottom: 8, border: '1px solid #333',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 20, fontWeight: 800,
                color: result.eloChange >= 0 ? '#00c853' : '#f44336',
              }}>
                {result.eloChange >= 0 ? '+' : ''}{result.eloChange}
              </div>
              <div style={{ fontSize: 10, color: '#adadb8' }}>ELO ({result.newElo})</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#64b5f6' }}>
                +{result.rewards.exp}
              </div>
              <div style={{ fontSize: 10, color: '#adadb8' }}>EXP</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ffd700' }}>
                +{result.rewards.gold}
              </div>
              <div style={{ fontSize: 10, color: '#adadb8' }}>Gold</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-primary" onClick={startFight} style={{ flex: 1, background: '#f44336' }}>
            Ancora!
          </button>
          <button className="btn btn-secondary" onClick={backToIdle} style={{ flex: 1 }}>
            Indietro
          </button>
        </div>
      </div>
    );
  }

  return null;
}
