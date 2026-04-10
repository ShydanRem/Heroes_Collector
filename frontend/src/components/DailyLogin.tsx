import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

const DAY_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '🎁'];

export function DailyLogin({ onClaim }: { onClaim?: () => void }) {
  const [status, setStatus] = useState<api.DailyLoginStatus | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<api.ClaimResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    try {
      const s = await api.getDailyLoginStatus();
      setStatus(s);
    } catch {
      // Endpoint potrebbe non esistere ancora
    }
  }

  async function handleClaim() {
    setClaiming(true);
    setError(null);
    try {
      const result = await api.claimDailyLogin();
      setClaimResult(result);
      // Aggiorna stato
      const s = await api.getDailyLoginStatus();
      setStatus(s);
      onClaim?.();
    } catch (err: any) {
      setError(err.message || 'Errore');
    } finally {
      setClaiming(false);
    }
  }

  if (!status) return null;

  return (
    <div style={{
      background: '#1f1f23',
      borderRadius: 8,
      padding: 10,
      marginTop: 6,
      border: '1px solid #2d2d35',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9147ff' }}>
          Login Giornaliero
        </div>
        <div style={{ fontSize: 10, color: '#adadb8' }}>
          Streak: <span style={{ color: '#ffd700', fontWeight: 800 }}>{status.currentStreak}</span>
          {status.bestStreak > 0 && (
            <span style={{ color: '#53535f', marginLeft: 4 }}>
              (record: {status.bestStreak})
            </span>
          )}
        </div>
      </div>

      {/* 7 giorni */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 3,
        marginBottom: 8,
      }}>
        {status.rewards.map((reward, i) => {
          const dayNum = i + 1;
          const isCurrentDay = dayNum === status.streakDay;
          const isPast = status.claimedToday
            ? dayNum <= status.streakDay
            : dayNum < status.streakDay;
          const isClaimed = isPast && (status.claimedToday || dayNum < status.streakDay);

          return (
            <div key={dayNum} style={{
              background: isCurrentDay
                ? (status.canClaim ? 'rgba(145, 71, 255, 0.2)' : 'rgba(34, 197, 94, 0.15)')
                : isClaimed
                  ? 'rgba(34, 197, 94, 0.08)'
                  : 'rgba(255,255,255,0.03)',
              borderRadius: 6,
              padding: '4px 2px',
              textAlign: 'center',
              border: isCurrentDay
                ? `1px solid ${status.canClaim ? '#9147ff' : '#22c55e'}`
                : '1px solid transparent',
              position: 'relative',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: 14 }}>{DAY_EMOJIS[i]}</div>
              <div style={{
                fontSize: 8,
                color: isClaimed ? '#22c55e' : isCurrentDay ? '#efeff1' : '#53535f',
                fontWeight: 700,
                marginTop: 1,
              }}>
                {isClaimed ? '✓' : `${reward.gold}g`}
              </div>
              {dayNum === 7 && !isClaimed && (
                <div style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  background: '#ffd700',
                  borderRadius: '50%',
                  width: 8,
                  height: 8,
                  animation: 'pulse 1.5s ease infinite',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Reward di oggi */}
      {status.canClaim ? (
        <div>
          <div style={{
            fontSize: 10,
            color: '#adadb8',
            textAlign: 'center',
            marginBottom: 6,
          }}>
            Giorno {status.streakDay}: <span style={{ color: '#ffd700', fontWeight: 700 }}>{status.todayReward.label}</span>
          </div>
          <button
            onClick={handleClaim}
            disabled={claiming}
            style={{
              width: '100%',
              padding: '8px 0',
              background: claiming ? '#333' : 'linear-gradient(90deg, #9147ff, #c084fc)',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontWeight: 800,
              fontSize: 12,
              cursor: claiming ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {claiming ? 'Riscuotendo...' : 'Riscuoti Premio!'}
          </button>
        </div>
      ) : claimResult ? (
        <div style={{
          textAlign: 'center',
          padding: '6px 0',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, marginBottom: 2 }}>
            Premio riscosso!
          </div>
          <div style={{ fontSize: 10, color: '#adadb8' }}>
            +{claimResult.gold} Gold, +{claimResult.energy} Energia
            {claimResult.essences > 0 && `, +${claimResult.essences} Essenze`}
          </div>
          <div style={{ fontSize: 10, color: '#ffd700', marginTop: 2 }}>
            Streak: {claimResult.newStreak} giorni
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          fontSize: 10,
          color: '#22c55e',
          padding: '4px 0',
        }}>
          Torna domani per il giorno {status.streakDay + 1 > 7 ? 1 : status.streakDay + 1}!
        </div>
      )}

      {error && (
        <div style={{ fontSize: 10, color: '#f44336', textAlign: 'center', marginTop: 4 }}>
          {error}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
