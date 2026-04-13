import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { DailyMission } from '../services/api';

export function Missions() {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => { loadMissions(); }, []);

  async function loadMissions() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDailyMissions();
      setMissions(data.missions);
    } catch (err: any) {
      setError(err.message || 'Errore caricamento missioni');
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim(missionId: string) {
    setClaiming(missionId);
    try {
      await api.claimMission(missionId);
      await loadMissions();
    } catch (err: any) {
      console.error('Errore riscossione:', err);
    } finally {
      setClaiming(null);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '12px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#9147ff' }}>
          Missioni Giornaliere
        </div>
        <div className="loading" style={{ padding: 16 }}><div className="spinner" /> Caricamento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '12px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#9147ff' }}>
          Missioni Giornaliere
        </div>
        <div className="error-state" style={{ padding: 12 }}>
          <div className="error-state-text">{error}</div>
          <button className="btn btn-secondary btn-sm" onClick={loadMissions}>Riprova</button>
        </div>
      </div>
    );
  }

  if (missions.length === 0) return null;

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#9147ff' }}>
        Missioni Giornaliere
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {missions.map(m => (
          <MissionCard
            key={m.id}
            mission={m}
            claiming={claiming === m.id}
            onClaim={() => handleClaim(m.id)}
          />
        ))}
      </div>
    </div>
  );
}

function MissionCard({ mission, claiming, onClaim }: {
  mission: DailyMission;
  claiming: boolean;
  onClaim: () => void;
}) {
  const progressPct = Math.min(100, Math.round((mission.progress / mission.target) * 100));

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-sm)',
      padding: '8px 10px',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
          {mission.description}
        </span>
        {mission.claimed ? (
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--success)',
            padding: '2px 6px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: 10,
          }}>
            Completata
          </span>
        ) : mission.completed ? (
          <button
            className="btn btn-primary btn-sm"
            style={{ padding: '3px 10px', fontSize: 10 }}
            onClick={onClaim}
            disabled={claiming}
          >
            {claiming ? '...' : 'Riscuoti'}
          </button>
        ) : null}
      </div>

      {/* Progress bar */}
      <div style={{
        height: 6,
        background: 'var(--bg-primary)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
      }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: mission.completed
            ? 'var(--success)'
            : 'linear-gradient(90deg, #9147ff, #c084fc)',
          borderRadius: 3,
          transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 10,
      }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
          {mission.progress}/{mission.target}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
            +{mission.rewardGold}g
          </span>
          <span style={{ color: '#64b5f6', fontWeight: 700 }}>
            +{mission.rewardExp} EXP
          </span>
          {mission.rewardEssences > 0 && (
            <span style={{ color: '#a855f7', fontWeight: 700 }}>
              +{mission.rewardEssences} Ess
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
