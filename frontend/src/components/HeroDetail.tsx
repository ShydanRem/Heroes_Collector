import React, { useState, useEffect } from 'react';
import { Hero, Ability, ClassInfo, Rarity, RARITY_COLORS, RARITY_LABELS, CLASS_EMOJIS, CLASS_LABELS, RARITY_ORDER, CAPTURE_ENERGY_COST } from '../types';
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

  async function handleCapture(rarity: Rarity) {
    if (!hero) return;
    setCapturing(true);
    try {
      const result = await api.captureHero(hero.id, rarity);
      setMessage({ text: result.message, type: 'success' });
      setTimeout(() => onCapture?.(), 800);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setCapturing(false);
    }
  }

  // Rarità disponibili per la cattura (da Comune fino alla rarità dell'eroe)
  function getAvailableRarities(): Rarity[] {
    if (!hero) return [];
    const heroIdx = RARITY_ORDER.indexOf(hero.rarity);
    return RARITY_ORDER.slice(0, heroIdx + 1);
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
        <div className="capture-rarity-selector" style={{ marginTop: 12 }}>
          <h3 style={{ marginBottom: 8, fontSize: 13 }}>Scegli a che rarita catturare:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {getAvailableRarities().map((r) => (
              <button
                key={r}
                className="btn btn-capture"
                onClick={() => handleCapture(r)}
                disabled={capturing}
                style={{
                  borderLeft: `4px solid ${RARITY_COLORS[r]}`,
                  color: RARITY_COLORS[r],
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  fontSize: 12,
                }}
              >
                <span>{RARITY_LABELS[r]}</span>
                <span style={{ opacity: 0.8 }}>{CAPTURE_ENERGY_COST[r]}E</span>
              </button>
            ))}
          </div>
          {capturing && <div style={{ marginTop: 6, fontSize: 11 }}>Cattura in corso...</div>}
        </div>
      )}

      {message && (
        <div className={`toast ${message.type}`}>{message.text}</div>
      )}
    </div>
  );
}
