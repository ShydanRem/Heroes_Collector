import React, { useState, useEffect } from 'react';
import { Hero, Ability, ClassInfo, Rarity, HeroClass, RARITY_COLORS, RARITY_LABELS, CLASS_EMOJIS, CLASS_LABELS, RARITY_ORDER, CAPTURE_ENERGY_COST } from '../types';
import * as api from '../services/api';
import { CaptureMinigame } from './CaptureMinigame';
import { getEffectiveStats } from '../utils/stats';

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
  const [selectedCaptureRarity, setSelectedCaptureRarity] = useState<Rarity | null>(null);
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

  async function startCapture(rarity: Rarity) {
    setSelectedCaptureRarity(rarity);
  }

  async function handleMinigameSuccess() {
    if (!hero || !selectedCaptureRarity) return;
    setCapturing(true);
    const rarity = selectedCaptureRarity;
    setSelectedCaptureRarity(null);
    try {
      const result = await api.captureHero(hero.id, rarity);
      setMessage({ text: result.message, type: 'success' });
      setTimeout(() => onCapture?.(), 1000);
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

  const rarityColor = RARITY_COLORS[hero.rarity as Rarity];
  const effectiveStats = getEffectiveStats(hero);

  return (
    <div className="hero-detail">
      <button className="btn btn-back" onClick={onBack}>← Indietro</button>

      <div className="hero-detail-card" style={{ borderColor: rarityColor }}>
        <div className="hero-detail-name">{hero.displayName}</div>
        <div className="hero-detail-class">
          {CLASS_EMOJIS[hero.heroClass as HeroClass] || '❓'} {classInfo?.name || CLASS_LABELS[hero.heroClass as HeroClass]} — {classInfo?.role}
        </div>
        <div className="hero-detail-rarity" style={{ color: rarityColor }}>
          {RARITY_LABELS[hero.rarity as Rarity]} — Lv. {hero.level}
        </div>

        <div className="stats-detail-grid">
          <div className="stat-detail-item">
            <span className="stat-detail-label">HP</span>
            <span>{effectiveStats.hp}</span>
          </div>
          <div className="stat-detail-item">
            <span className="stat-detail-label">ATK</span>
            <span>{effectiveStats.atk}</span>
          </div>
          <div className="stat-detail-item">
            <span className="stat-detail-label">DEF</span>
            <span>{effectiveStats.def}</span>
          </div>
          <div className="stat-detail-item">
            <span className="stat-detail-label">SPD</span>
            <span>{effectiveStats.spd}</span>
          </div>
          <div className="stat-detail-item">
            <span className="stat-detail-label">CRIT</span>
            <span>{effectiveStats.crit}%</span>
          </div>
          <div className="stat-detail-item">
            <span className="stat-detail-label">CRIT DMG</span>
            <span>{effectiveStats.critDmg}%</span>
          </div>
        </div>
      </div>

      <div className="abilities-section">
        <h3>Abilita</h3>
        {abilities.map((ability: Ability) => (
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
                onClick={() => startCapture(r)}
                disabled={capturing || !!selectedCaptureRarity}
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

      {selectedCaptureRarity && hero && (
        <CaptureMinigame 
          hero={hero}
          rarity={selectedCaptureRarity}
          onSuccess={handleMinigameSuccess}
          onFail={(err) => {
            setMessage({ text: err, type: 'error' });
            setSelectedCaptureRarity(null);
          }}
          onCancel={() => setSelectedCaptureRarity(null)}
        />
      )}

      {message && (
        <div className={`toast ${message.type}`}>{message.text}</div>
      )}
    </div>
  );
}
