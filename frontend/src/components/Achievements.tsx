import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Achievement } from '../services/api';

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Achievement | null>(null);

  useEffect(() => { loadAchievements(); }, []);

  async function loadAchievements() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAchievements();
      setAchievements(data.achievements);
      setUnlockedCount(data.unlockedCount);
      setTotalCount(data.totalCount);
    } catch (err: any) {
      setError(err.message || 'Errore caricamento achievements');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading" style={{ padding: 16 }}><div className="spinner" /> Caricamento...</div>
    );
  }

  if (error) {
    return (
      <div className="error-state" style={{ padding: 12 }}>
        <div className="error-state-text">{error}</div>
        <button className="btn btn-secondary btn-sm" onClick={loadAchievements}>Riprova</button>
      </div>
    );
  }

  // Group by category
  const grouped: Record<string, Achievement[]> = {};
  for (const a of achievements) {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  }

  return (
    <div>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--text-secondary)',
        marginBottom: 8,
        textAlign: 'center',
      }}>
        {unlockedCount} / {totalCount} Achievements sbloccati
      </div>

      {/* Selected achievement detail */}
      {selected && (
        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px',
          marginBottom: 8,
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 20 }}>{selected.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
              {selected.name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {selected.description}
            </div>
            {selected.unlocked && selected.unlockedAt && (
              <div style={{ fontSize: 9, color: 'var(--success)', marginTop: 2 }}>
                Sbloccato il {new Date(selected.unlockedAt).toLocaleDateString('it-IT')}
              </div>
            )}
          </div>
          <button
            className="btn btn-back"
            style={{ padding: '2px 6px', fontSize: 10 }}
            onClick={() => setSelected(null)}
          >
            X
          </button>
        </div>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} style={{ marginBottom: 8 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 4,
          }}>
            {category}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 4,
          }}>
            {items.map(a => (
              <div
                key={a.id}
                onClick={() => setSelected(a)}
                title={a.name}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  background: a.unlocked ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${a.unlocked ? 'var(--border-hover)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  opacity: a.unlocked ? 1 : 0.4,
                  transition: 'all 0.15s ease',
                  filter: a.unlocked ? 'none' : 'grayscale(1)',
                }}
              >
                {a.icon}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
