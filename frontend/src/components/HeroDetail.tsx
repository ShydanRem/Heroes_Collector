import React, { useState, useEffect } from 'react';
import { Hero, Ability, ClassInfo, RARITY_COLORS, RARITY_LABELS, CLASS_EMOJIS, CLASS_LABELS } from '../types';
import * as api from '../services/api';

interface HeroDetailProps {
  heroId: string;
  onBack: () => void;
  onCapture?: () => void;
  showCaptureButton?: boolean;
}

export function HeroDetail({ heroId, onBack, onCapture, showCaptureButton }: HeroDetailProps) {
  const [hero, setHero] = useState<Hero | null>(null);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadHero();
  }, [heroId]);

  async function loadHero() {
    try {
      const data = await api.getHeroDetail(heroId);
      setHero(data.hero);
      setAbilities(data.abilities);
      setClassInfo(data.classInfo);
    } catch (err) {
      console.error('Errore caricamento eroe:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCapture() {
    if (!hero) return;
    setCapturing(true);
    try {
      const result = await api.captureHero(hero.id);
      setMessage({ text: result.message, type: 'success' });
      setTimeout(() => onCapture?.(), 800);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setCapturing(false);
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner" /> Caricamento...</div>;
  }

  if (!hero) {
    return <div className="empty-state">Eroe non trovato</div>;
  }

  const rarityColor = RARITY_COLORS[hero.rarity];

  return (
    <div className="hero-detail">
      <button className="btn btn-back" onClick={onBack}>← Indietro</button>

      <div className="hero-detail-card" style={{ borderColor: rarityColor }}>
        <div className="hero-detail-name">{hero.displayName}</div>
        <div className="hero-detail-class">
          {CLASS_EMOJIS[hero.heroClass]} {classInfo?.name || CLASS_LABELS[hero.heroClass]} — {classInfo?.role}
        </div>
        <div className="hero-detail-rarity" style={{ color: rarityColor }}>
          {RARITY_LABELS[hero.rarity]} — Lv. {hero.level}
        </div>

        <div className="stats-detail-grid">
          <div className="stat-detail-item">
            <span className="stat-detail-label">HP</span>
            <span>{hero.stats.hp}</span>
          </div>
          <div className="stat-detail-item">
            <span className="stat-detail-label">ATK</span>
            <span>{hero.stats.atk}</span>
          </div>
          <div className="stat-detail-item">
            <span className="stat-detail-label">DEF</span>
            <span>{hero.stats.def}</span>
          </div>
          <div className="stat-detail-item">
            <span className="stat-detail-label">SPD</span>
            <span>{hero.stats.spd}</span>
          </div>
          <div className="stat-detail-item">
            <span className="stat-detail-label">CRIT</span>
            <span>{hero.stats.crit}%</span>
          </div>
          <div className="stat-detail-item">
            <span className="stat-detail-label">CRIT DMG</span>
            <span>{hero.stats.critDmg}%</span>
          </div>
        </div>
      </div>

      <div className="abilities-section">
        <h3>Abilita</h3>
        {abilities.map((ability) => (
          <div key={ability.id} className="ability-item">
            <div className="ability-name">{ability.name}</div>
            <div className="ability-desc">{ability.description}</div>
            <div className="ability-meta">
              <span>Potenza: {ability.power}x</span>
              <span>CD: {ability.cooldown} turni</span>
              {ability.statusEffect && <span>Effetto: {ability.statusEffect}</span>}
            </div>
          </div>
        ))}
      </div>

      {showCaptureButton && (
        <button
          className="btn btn-capture"
          onClick={handleCapture}
          disabled={capturing}
          style={{ marginTop: 12 }}
        >
          {capturing ? 'Cattura in corso...' : `Cattura ${hero.displayName}!`}
        </button>
      )}

      {message && (
        <div className={`toast ${message.type}`}>{message.text}</div>
      )}
    </div>
  );
}
