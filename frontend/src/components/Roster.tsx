import React, { useState, useEffect } from 'react';
import { Hero } from '../types';
import { HeroCard } from './HeroCard';
import { HeroDetail } from './HeroDetail';
import * as api from '../services/api';

export function Roster() {
  const [roster, setRoster] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoster();
  }, []);

  async function loadRoster() {
    setError(null);
    try {
      const data = await api.getMyRoster();
      setRoster(data.roster);
    } catch (err) {
      console.error('Errore caricamento roster:', err);
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
      />
    );
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
        <button className="btn btn-secondary" onClick={loadRoster} style={{ fontSize: 11 }}>
          Riprova
        </button>
      </div>
    );
  }

  if (roster.length === 0) {
    return (
      <div className="empty-state">
        <p>👥 Non hai ancora catturato nessun eroe.</p>
        <p>Vai al Catalogo per trovarne!</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: '#adadb8', marginBottom: 8 }}>
        {roster.length} eroi catturati
      </div>
      {roster.map((hero) => (
        <HeroCard
          key={hero.id}
          hero={hero}
          onClick={() => setSelectedHeroId(hero.id)}
        />
      ))}
    </div>
  );
}
