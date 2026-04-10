import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { LeaderboardEntry, WeeklyEntry, WeeklyChampion } from '../services/api';
import { CLASS_LABELS, CLASS_EMOJIS } from '../types';

type RankTab = 'pvp' | 'weekly';

export function Leaderboard() {
  const [rankTab, setRankTab] = useState<RankTab>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [weeklyEntries, setWeeklyEntries] = useState<WeeklyEntry[]>([]);
  const [weeklyChampion, setWeeklyChampion] = useState<WeeklyChampion | null>(null);
  const [myWeekly, setMyWeekly] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setError(null);
    setLoading(true);
    try {
      const [lb, rank, weekly, myW] = await Promise.all([
        api.getLeaderboard(),
        api.getMyRank(),
        api.getWeeklyLeaderboard().catch(() => ({ leaderboard: [], champion: null })),
        api.getMyWeeklyScore().catch(() => ({ score: null })),
      ]);
      setEntries(lb.leaderboard);
      setMyRank(rank.rank);
      setWeeklyEntries(weekly.leaderboard);
      setWeeklyChampion(weekly.champion);
      setMyWeekly(myW.score);
    } catch (err) {
      console.error('Errore caricamento classifica:', err);
      setError('Errore nel caricamento. Controlla la connessione.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner" /> Caricamento...</div>;
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center', padding: '20px 16px',
        color: '#adadb8',
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontSize: 12, marginBottom: 12 }}>{error}</div>
        <button className="btn btn-secondary" onClick={loadData} style={{ fontSize: 11 }}>
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Tab switcher */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 8,
      }}>
        <button
          onClick={() => setRankTab('weekly')}
          style={{
            flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 700,
            background: rankTab === 'weekly' ? 'rgba(145,71,255,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${rankTab === 'weekly' ? '#9147ff' : '#2d2d35'}`,
            borderRadius: 6, color: rankTab === 'weekly' ? '#9147ff' : '#737380',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          Settimanale
        </button>
        <button
          onClick={() => setRankTab('pvp')}
          style={{
            flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 700,
            background: rankTab === 'pvp' ? 'rgba(145,71,255,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${rankTab === 'pvp' ? '#9147ff' : '#2d2d35'}`,
            borderRadius: 6, color: rankTab === 'pvp' ? '#9147ff' : '#737380',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          PVP ELO
        </button>
      </div>

      {rankTab === 'weekly' ? renderWeekly() : renderPvp()}
    </div>
  );

  function renderWeekly() {
    return (
      <>
        {/* Campione settimana scorsa */}
        {weeklyChampion && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(145,71,255,0.1))',
            borderRadius: 8, padding: 10, marginBottom: 8,
            border: '1px solid rgba(255,215,0,0.3)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 9, color: '#ffd700', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              {weeklyChampion.title}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>
              👑 {weeklyChampion.displayName}
            </div>
            <div style={{ fontSize: 10, color: '#adadb8' }}>
              {weeklyChampion.points} punti
            </div>
          </div>
        )}

        {/* Il mio punteggio */}
        {myWeekly && (
          <div style={{
            background: '#1f1f23', borderRadius: 8, padding: 10,
            marginBottom: 8, border: '1px solid #9147ff',
          }}>
            <div style={{ fontSize: 11, color: '#9147ff', fontWeight: 700, marginBottom: 4 }}>
              La tua settimana
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 800 }}>#{myWeekly.rank}</span>
                <span style={{ fontSize: 14, color: '#ffd700', fontWeight: 800, marginLeft: 8 }}>
                  {myWeekly.points} pt
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 9, color: '#adadb8' }}>
                <span>🏰{myWeekly.dungeonsCleared}</span>
                <span>⚔️{myWeekly.pvpWins}</span>
                <span>🐉{myWeekly.raidDamage}</span>
                <span>👥{myWeekly.captures}</span>
              </div>
            </div>
          </div>
        )}

        {/* Classifica */}
        <div style={{ fontSize: 12, fontWeight: 700, color: '#adadb8', marginBottom: 4 }}>
          Classifica Settimanale
        </div>

        {weeklyEntries.length === 0 ? (
          <div className="empty-state">
            <p>📊 Nessun punteggio questa settimana.</p>
            <p>Gioca dungeon, PVP o raid per salire in classifica!</p>
          </div>
        ) : (
          weeklyEntries.map((entry) => (
            <div key={entry.userId} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#18181b', borderRadius: 6, padding: '6px 10px',
              marginBottom: 3, fontSize: 12,
              borderLeft: `3px solid ${getRankColor(entry.rank)}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontWeight: 800, fontSize: 14,
                  color: getRankColor(entry.rank),
                  minWidth: 28,
                }}>
                  #{entry.rank}
                </span>
                <div>
                  <div style={{ fontWeight: 700 }}>{entry.displayName}</div>
                  <div style={{ fontSize: 9, color: '#adadb8' }}>
                    {CLASS_EMOJIS[entry.heroClass as keyof typeof CLASS_EMOJIS] || ''} {CLASS_LABELS[entry.heroClass as keyof typeof CLASS_LABELS] || ''} Lv.{entry.level}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: '#ffd700', fontSize: 14 }}>
                  {entry.points}
                </div>
                <div style={{ fontSize: 8, color: '#53535f' }}>punti</div>
              </div>
            </div>
          ))
        )}
      </>
    );
  }

  function renderPvp() {
    return (
      <>
        {myRank && (
          <div style={{
            background: '#1f1f23', borderRadius: 8, padding: 10,
            marginBottom: 8, border: '1px solid #9147ff',
          }}>
            <div style={{ fontSize: 11, color: '#9147ff', fontWeight: 700, marginBottom: 4 }}>
              La tua posizione
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 800 }}>#{myRank.rank}</span>
                <span style={{ fontSize: 10, color: '#adadb8', marginLeft: 6 }}>
                  su {myRank.totalPlayers} giocatori
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12 }}>
                <div style={{ color: '#ffd700', fontWeight: 800 }}>{myRank.elo} ELO</div>
                <div style={{ fontSize: 10, color: '#adadb8' }}>
                  {myRank.wins}W / {myRank.losses}L
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 12, fontWeight: 700, color: '#adadb8', marginBottom: 4 }}>
          Top PVP
        </div>

        {entries.length === 0 ? (
          <div className="empty-state">
            <p>🏆 Nessun giocatore in classifica ancora.</p>
            <p>Fai la prima partita PVP!</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.userId} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#18181b', borderRadius: 6, padding: '6px 10px',
              marginBottom: 3, fontSize: 12,
              borderLeft: `3px solid ${getRankColor(entry.rank)}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontWeight: 800, fontSize: 14,
                  color: getRankColor(entry.rank),
                  minWidth: 28,
                }}>
                  #{entry.rank}
                </span>
                <div>
                  <div style={{ fontWeight: 700 }}>{entry.displayName}</div>
                  <div style={{ fontSize: 10, color: '#adadb8' }}>
                    {entry.wins}W/{entry.losses}L ({entry.winRate}%)
                  </div>
                </div>
              </div>
              <div style={{ fontWeight: 800, color: '#ffd700', fontSize: 14 }}>
                {entry.elo}
              </div>
            </div>
          ))
        )}
      </>
    );
  }
}

function getRankColor(rank: number): string {
  if (rank === 1) return '#ffd700';
  if (rank === 2) return '#c0c0c0';
  if (rank === 3) return '#cd7f32';
  if (rank <= 10) return '#9147ff';
  return '#555';
}
