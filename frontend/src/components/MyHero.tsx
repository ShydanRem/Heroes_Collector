import React, { useState } from 'react';
import { Hero, HeroClass, UserProfile, RARITY_COLORS, RARITY_LABELS, CLASS_LABELS, CLASS_EMOJIS } from '../types';
import { HeroSprite } from './HeroSprite';
import { HintBanner } from './Tooltip';
import { Missions } from './Missions';
import { Achievements } from './Achievements';
import * as api from '../services/api';

interface MyHeroProps {
  profile: UserProfile;
  hero: Hero | null;
  onHeroUpdate?: (hero: Hero) => void;
}

const ALL_CLASSES: HeroClass[] = ['guardiano', 'lama', 'arcano', 'custode', 'ombra', 'ranger', 'sciamano', 'crono'];
const REROLL_COST = 500;

export function MyHero({ profile, hero, onHeroUpdate }: MyHeroProps) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [showReroll, setShowReroll] = useState(false);
  const [rerolling, setRerolling] = useState(false);
  const [rerollMsg, setRerollMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!hero) {
    return (
      <div className="empty-state">
        <p>Il tuo eroe non e ancora stato generato.</p>
        <p>Questo non dovrebbe succedere se hai fatto join!</p>
      </div>
    );
  }

  const rarityColor = RARITY_COLORS[hero.rarity];

  return (
    <div>
      <HintBanner
        id="myhero"
        text="Questo e il TUO eroe! La tua rarita dipende da quanto sei attivo sul canale: chatta, guarda e subba per diventare piu forte!"
        icon="🦸"
      />
      <div className="hero-detail-card" style={{ borderColor: rarityColor }}>
        {/* Sprite grande al centro */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <HeroSprite
            heroClass={hero.heroClass}
            rarity={hero.rarity}
            size={80}
            animate="idle"
            name={hero.displayName}
          />
        </div>

        <div className="hero-detail-name">{hero.displayName}</div>
        <div className="hero-detail-class">
          {CLASS_LABELS[hero.heroClass]}
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

      <div style={{ background: '#1f1f23', borderRadius: 8, padding: 10, marginTop: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#9147ff' }}>
          I tuoi stats
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 12 }}>
          <div>
            <span style={{ color: '#adadb8' }}>Gold: </span>
            <span style={{ color: '#ffd700' }}>{profile.gold}</span>
          </div>
          <div>
            <span style={{ color: '#adadb8' }}>Energia: </span>
            <span style={{ color: '#00c853' }}>{Math.floor(profile.energy)}/{profile.maxEnergy}</span>
          </div>
          <div>
            <span style={{ color: '#adadb8' }}>Score: </span>
            <span>{profile.activityScore.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Reroll Classe */}
      <div style={{ marginTop: 8 }}>
        <button
          className="btn btn-secondary"
          onClick={() => setShowReroll(!showReroll)}
          style={{ width: '100%', fontSize: 11 }}
        >
          Cambia Classe ({REROLL_COST} gold)
        </button>

        {showReroll && (
          <div style={{
            background: '#1f1f23', borderRadius: 8, padding: 10, marginTop: 6,
            border: '1px solid #333',
          }}>
            <div style={{ fontSize: 10, color: '#adadb8', marginBottom: 6 }}>
              Scegli la nuova classe:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
              {ALL_CLASSES.filter(c => c !== hero.heroClass).map(cls => (
                <button
                  key={cls}
                  className="btn btn-secondary"
                  disabled={rerolling || profile.gold < REROLL_COST}
                  onClick={async () => {
                    setRerolling(true);
                    setRerollMsg(null);
                    try {
                      const result = await api.rerollHeroClass(cls);
                      setRerollMsg({ text: `Ora sei un ${CLASS_LABELS[cls]}!`, type: 'success' });
                      onHeroUpdate?.(result.hero);
                      setShowReroll(false);
                    } catch (err: any) {
                      setRerollMsg({ text: err.message, type: 'error' });
                    } finally {
                      setRerolling(false);
                    }
                  }}
                  style={{ fontSize: 10, padding: '6px 4px', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}
                >
                  {CLASS_EMOJIS[cls]} {CLASS_LABELS[cls]}
                </button>
              ))}
            </div>
            {profile.gold < REROLL_COST && (
              <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 6, textAlign: 'center' }}>
                Servono {REROLL_COST} gold (hai {profile.gold})
              </div>
            )}
            {rerollMsg && (
              <div style={{
                fontSize: 10, marginTop: 6, textAlign: 'center',
                color: rerollMsg.type === 'success' ? '#22c55e' : '#f44336',
              }}>
                {rerollMsg.text}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Missioni Giornaliere */}
      <Missions />

      {/* Achievements (collapsible) */}
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => setShowAchievements(!showAchievements)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 10px',
            cursor: 'pointer',
            color: 'var(--accent)',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <span>Achievements</span>
          <span style={{
            transition: 'transform 0.2s',
            transform: showAchievements ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: 10,
          }}>
            ▼
          </span>
        </button>
        {showAchievements && (
          <div style={{ marginTop: 6 }}>
            <Achievements />
          </div>
        )}
      </div>
    </div>
  );
}
