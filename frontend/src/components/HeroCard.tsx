import React from 'react';
import { Hero, RARITY_COLORS, RARITY_LABELS, CLASS_LABELS } from '../types';
import { HeroSprite } from './HeroSprite';

interface HeroCardProps {
  hero: Hero;
  onClick?: () => void;
  compact?: boolean;
}

export function HeroCard({ hero, onClick, compact }: HeroCardProps) {
  const rarityColor = RARITY_COLORS[hero.rarity];

  return (
    <div
      className="hero-card"
      data-rarity={hero.rarity}
      onClick={onClick}
    >
      <div className="hero-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeroSprite
            heroClass={hero.heroClass}
            rarity={hero.rarity}
            size={36}
            animate="idle"
          />
          <div>
            <span className="hero-name">{hero.displayName}</span>
            <div className="hero-rarity" style={{ color: rarityColor, marginBottom: 0 }}>
              {RARITY_LABELS[hero.rarity]}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="hero-class-badge">
            {CLASS_LABELS[hero.heroClass]}
          </span>
          <div className="hero-level">Lv. {hero.level}</div>
        </div>
      </div>

      {!compact && (
        <div className="hero-stats-grid" style={{ marginTop: 6 }}>
          <div className="stat-item">
            <span className="stat-label">HP</span>
            <span className="stat-value">{hero.stats.hp}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">ATK</span>
            <span className="stat-value">{hero.stats.atk}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">DEF</span>
            <span className="stat-value">{hero.stats.def}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">SPD</span>
            <span className="stat-value">{hero.stats.spd}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">CRIT</span>
            <span className="stat-value">{hero.stats.crit}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">C.DMG</span>
            <span className="stat-value">{hero.stats.critDmg}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
