import React, { useState, useEffect } from 'react';
import { Hero, Rarity, HeroClass, RARITY_LABELS, CLASS_LABELS } from '../types';
import { HeroCard } from './HeroCard';
import { HeroDetail } from './HeroDetail';
import { HintBanner } from './Tooltip';
import * as api from '../services/api';

export function HeroList() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRarity, setFilterRarity] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHeroes();
  }, [page, filterRarity, filterClass]);

  async function loadHeroes() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listHeroes({
        page,
        limit: 20,
        rarity: filterRarity || undefined,
        class: filterClass || undefined,
      });
      setHeroes(data.heroes);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Errore caricamento eroi:', err);
      setError('Errore nel caricamento. Controlla la connessione.');
    } finally {
      setLoading(false);
    }
  }

  if (selectedHeroId) {
    return (
      <HeroDetail
        heroId={selectedHeroId}
        onBack={() => setSelectedHeroId(null)}
        onCapture={() => {
          setSelectedHeroId(null);
          loadHeroes();
        }}
        showCaptureButton
      />
    );
  }

  return (
    <div>
      <HintBanner
        id="catalog"
        text="Qui trovi tutti gli eroi dei viewer! Clicca su uno per vedere i dettagli e catturarlo spendendo energia."
        icon="📖"
      />
      <div className="filter-bar">
        <select value={filterRarity} onChange={(e) => { setFilterRarity(e.target.value); setPage(1); }}>
          <option value="">Tutte le rarita</option>
          {Object.entries(RARITY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setPage(1); }}>
          <option value="">Tutte le classi</option>
          {Object.entries(CLASS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Caricamento...</div>
      ) : error ? (
        <div style={{
          textAlign: 'center', padding: '20px 16px',
          color: '#adadb8',
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 12, marginBottom: 12 }}>{error}</div>
          <button className="btn btn-secondary" onClick={loadHeroes} style={{ fontSize: 11 }}>
            Riprova
          </button>
        </div>
      ) : heroes.length === 0 ? (
        <div className="empty-state">
          <p>📖 Nessun eroe trovato.</p>
          <p>Aspetta che altri viewer facciano !join</p>
        </div>
      ) : (
        <>
          {heroes.map((hero) => (
            <HeroCard
              key={hero.id}
              hero={hero}
              onClick={() => setSelectedHeroId(hero.id)}
            />
          ))}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
              <button
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                ←
              </button>
              <span style={{ fontSize: 12, lineHeight: '32px' }}>{page}/{totalPages}</span>
              <button
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
