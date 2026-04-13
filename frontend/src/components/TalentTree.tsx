import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

export function TalentTree() {
  const [status, setStatus] = useState<api.TalentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [activeBranch, setActiveBranch] = useState(0);

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

  async function handleReset() {
    try {
      await api.resetTalents();
      await loadTalents();
      setMessage({ text: 'Talenti resettati!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /> Caricamento...</div>;
  if (!status?.tree) return null;

  const { tree, unlocked, pointsAvailable, pointsSpent, pointsTotal } = status;
  const branch = tree.branches[activeBranch];
  if (!branch) return null;

  // Conta nodi sbloccati per ramo
  const branchCounts = tree.branches.map(b =>
    b.nodes.filter(n => unlocked.includes(n.id)).length
  );

  return (
    <div>
      {/* Header con punti */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
      }}>
        <div style={{ fontSize: 10, color: '#adadb8' }}>
          <span style={{ fontWeight: 800, color: pointsAvailable > 0 ? '#c084fc' : '#53535f' }}>
            {pointsAvailable}
          </span> punti disponibili
          <span style={{ color: '#53535f' }}> ({pointsSpent}/{pointsTotal})</span>
        </div>
        {pointsSpent > 0 && (
          <button onClick={handleReset} style={{
            background: 'none', border: '1px solid #333', borderRadius: 4,
            color: '#f44336', fontSize: 9, padding: '2px 6px', cursor: 'pointer',
          }}>
            Reset
          </button>
        )}
      </div>

      {/* Tab rami */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
        {tree.branches.map((b, i) => (
          <button key={b.name} onClick={() => setActiveBranch(i)} style={{
            flex: 1, padding: '5px 2px', fontSize: 10, fontWeight: 700,
            background: activeBranch === i ? 'rgba(145,71,255,0.15)' : '#18181b',
            border: `1px solid ${activeBranch === i ? '#9147ff' : '#2d2d35'}`,
            borderRadius: 6, cursor: 'pointer',
            color: activeBranch === i ? '#c084fc' : '#737380',
            transition: 'all 0.2s',
          }}>
            <div>{b.emoji}</div>
            <div style={{ fontSize: 9 }}>{b.name}</div>
            {branchCounts[i] > 0 && (
              <div style={{ fontSize: 8, color: '#9147ff' }}>{branchCounts[i]}/5</div>
            )}
          </button>
        ))}
      </div>

      {/* Descrizione ramo */}
      <div style={{ fontSize: 10, color: '#adadb8', marginBottom: 6, textAlign: 'center' }}>
        {branch.description}
      </div>

      {/* Nodi verticali */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {branch.nodes.map((node, idx) => {
          const isUnlocked = unlocked.includes(node.id);
          const prevNode = branch.nodes.find(n => n.tier === node.tier - 1);
          const prevUnlocked = !prevNode || unlocked.includes(prevNode.id);
          const canUnlock = !isUnlocked && prevUnlocked && pointsAvailable > 0;

          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Connettore verticale */}
              {idx > 0 && (
                <div style={{
                  width: 2, height: 8, marginBottom: -2,
                  background: isUnlocked || (prevNode && unlocked.includes(prevNode.id))
                    ? '#9147ff' : '#2d2d35',
                }} />
              )}

              {/* Nodo */}
              <div
                onClick={() => canUnlock && !unlocking && handleUnlock(node.id)}
                style={{
                  width: '100%',
                  background: isUnlocked
                    ? 'rgba(145,71,255,0.15)'
                    : canUnlock ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isUnlocked ? '#9147ff' : canUnlock ? '#555' : '#2d2d35'}`,
                  borderRadius: 6, padding: '8px 10px',
                  cursor: canUnlock ? 'pointer' : 'default',
                  opacity: !isUnlocked && !canUnlock ? 0.4 : 1,
                  transition: 'all 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: isUnlocked ? '#c084fc' : canUnlock ? '#efeff1' : '#53535f',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800,
                      background: isUnlocked ? '#9147ff' : '#2d2d35', color: isUnlocked ? '#fff' : '#53535f',
                    }}>{node.tier}</span>
                    {node.name}
                    {node.specialEffect && (
                      <span style={{ fontSize: 8, color: '#f59e0b', fontWeight: 800 }}>★</span>
                    )}
                  </div>
                  <div style={{ fontSize: 9, color: '#737380', marginTop: 2 }}>
                    {node.description}
                  </div>
                </div>
                {canUnlock && (
                  <div style={{
                    fontSize: 9, color: '#c084fc', fontWeight: 700,
                    padding: '2px 8px', background: 'rgba(145,71,255,0.2)',
                    borderRadius: 4, whiteSpace: 'nowrap',
                  }}>
                    Sblocca
                  </div>
                )}
                {isUnlocked && (
                  <div style={{ fontSize: 12, color: '#9147ff' }}>✓</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {message && (
        <div style={{
          fontSize: 10, textAlign: 'center', marginTop: 6, padding: '4px 8px',
          borderRadius: 4,
          background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(244,67,54,0.1)',
          color: message.type === 'success' ? '#22c55e' : '#f44336',
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
