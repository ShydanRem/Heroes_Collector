import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

export function TalentTree() {
  const [status, setStatus] = useState<api.TalentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => { loadTalents(); }, []);
  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(null), 3000); return () => clearTimeout(t); }
  }, [message]);

  async function loadTalents() {
    try {
      const data = await api.getTalentStatus();
      setStatus(data);
    } catch { /* */ }
    finally { setLoading(false); }
  }

  async function handleUnlock(talentId: string) {
    setUnlocking(true);
    try {
      const result = await api.unlockTalent(talentId);
      setStatus(result);
      setMessage({ text: result.message, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally { setUnlocking(false); }
  }

  if (loading) return <div className="loading"><div className="spinner" /> Caricamento...</div>;
  if (!status?.tree) return null;

  const { tree, unlocked, pointsAvailable } = status;

  return (
    <div style={{
      background: '#1f1f23', borderRadius: 8, padding: 10, marginTop: 6,
      border: '1px solid #2d2d35',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9147ff' }}>
          Albero Talenti
        </div>
        <div style={{
          fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10,
          background: pointsAvailable > 0 ? 'rgba(145,71,255,0.2)' : 'rgba(255,255,255,0.05)',
          color: pointsAvailable > 0 ? '#c084fc' : '#53535f',
        }}>
          {pointsAvailable} punti
        </div>
      </div>

      {tree.branches.map(branch => (
        <div key={branch.name} style={{ marginBottom: 8 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#adadb8', marginBottom: 4,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span>{branch.emoji}</span>
            <span>{branch.name}</span>
            <span style={{ color: '#53535f', fontWeight: 400 }}>— {branch.description}</span>
          </div>

          <div style={{ display: 'flex', gap: 3 }}>
            {branch.nodes.map(node => {
              const isUnlocked = unlocked.includes(node.id);
              const prevNode = branch.nodes.find(n => n.tier === node.tier - 1);
              const prevUnlocked = !prevNode || unlocked.includes(prevNode.id);
              const canUnlock = !isUnlocked && prevUnlocked && pointsAvailable > 0;

              return (
                <div
                  key={node.id}
                  onClick={() => canUnlock && !unlocking && handleUnlock(node.id)}
                  style={{
                    flex: 1,
                    background: isUnlocked
                      ? 'rgba(145,71,255,0.2)'
                      : canUnlock
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isUnlocked ? '#9147ff' : canUnlock ? '#555' : '#2d2d35'}`,
                    borderRadius: 6,
                    padding: '6px 4px',
                    textAlign: 'center',
                    cursor: canUnlock ? 'pointer' : 'default',
                    opacity: !isUnlocked && !canUnlock ? 0.4 : 1,
                    transition: 'all 0.2s',
                    position: 'relative' as const,
                  }}
                  title={`${node.name}\n${node.description}`}
                >
                  <div style={{
                    fontSize: 8, fontWeight: 800,
                    color: isUnlocked ? '#c084fc' : canUnlock ? '#efeff1' : '#53535f',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {node.name}
                  </div>
                  <div style={{ fontSize: 7, color: '#737380', marginTop: 1 }}>
                    {node.description}
                  </div>
                  {isUnlocked && (
                    <div style={{
                      position: 'absolute', top: -3, right: -3,
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#9147ff',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {message && (
        <div style={{
          fontSize: 10, textAlign: 'center', marginTop: 4,
          color: message.type === 'success' ? '#22c55e' : '#f44336',
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
