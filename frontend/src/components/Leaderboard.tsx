import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { LeaderboardEntry } from '../services/api';

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setError(null);
    try {
      const [lb, rank] = await Promise.all([
        api.getLeaderboard(),
        api.getMyRank(),
      ]);
      setEntries(lb.leaderboard);
      setMyRank(rank.rank);
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
      {/* La mia posizione */}
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

      {/* Classifica */}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#adadb8', marginBottom: 4 }}>
        Top Classifica
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
    </div>
  );
}

function getRankColor(rank: number): string {
  if (rank === 1) return '#ffd700'; // Oro
  if (rank === 2) return '#c0c0c0'; // Argento
  if (rank === 3) return '#cd7f32'; // Bronzo
  if (rank <= 10) return '#9147ff';
  return '#555';
}
