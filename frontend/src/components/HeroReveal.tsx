import React, { useState, useEffect } from 'react';
import { Hero, RARITY_COLORS, RARITY_LABELS, CLASS_LABELS, CLASS_EMOJIS } from '../types';
import { HeroSprite } from './HeroSprite';

interface HeroRevealProps {
  hero: Hero;
  onComplete: () => void;
}

type Phase = 'creating' | 'class' | 'rarity' | 'sprite' | 'stats' | 'done';

const PHASE_DURATIONS: Record<Phase, number> = {
  creating: 1500,
  class: 1500,
  rarity: 2000,
  sprite: 2000,
  stats: 2000,
  done: 0,
};

const PHASE_ORDER: Phase[] = ['creating', 'class', 'rarity', 'sprite', 'stats', 'done'];

const DRAMATIC_RARITIES = ['epico', 'leggendario', 'mitico', 'master'];
const GOLDEN_RARITIES = ['leggendario', 'mitico', 'master'];

export function HeroReveal({ hero, onComplete }: HeroRevealProps) {
  const [phase, setPhase] = useState<Phase>('creating');
  const [statCounters, setStatCounters] = useState({ hp: 0, atk: 0, def: 0, spd: 0 });

  const rarityColor = RARITY_COLORS[hero.rarity] || '#9ca3af';
  const isDramatic = DRAMATIC_RARITIES.includes(hero.rarity);
  const isGolden = GOLDEN_RARITIES.includes(hero.rarity);

  useEffect(() => {
    const idx = PHASE_ORDER.indexOf(phase);
    if (phase === 'done') return;
    const duration = PHASE_DURATIONS[phase];
    const timer = setTimeout(() => {
      setPhase(PHASE_ORDER[idx + 1]);
    }, duration);
    return () => clearTimeout(timer);
  }, [phase]);

  // Count-up animation for stats
  useEffect(() => {
    if (phase !== 'stats') return;
    const targets = { hp: hero.stats.hp, atk: hero.stats.atk, def: hero.stats.def, spd: hero.stats.spd };
    const steps = 20;
    const interval = 1800 / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setStatCounters({
        hp: Math.round(targets.hp * progress),
        atk: Math.round(targets.atk * progress),
        def: Math.round(targets.def * progress),
        spd: Math.round(targets.spd * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [phase, hero.stats]);

  return (
    <>
      <style>{`
        .reveal-overlay {
          position: absolute;
          inset: 0;
          z-index: 100;
          background: #0a0a12;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: inherit;
        }

        /* Phase: Creating */
        .reveal-creating {
          position: relative;
          width: 120px;
          height: 120px;
        }
        .reveal-creating .orb {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #7c3aed;
          animation: orb-converge 1.5s ease-in forwards;
        }
        .reveal-creating .orb:nth-child(1) { top: 0; left: 50%; animation-delay: 0s; }
        .reveal-creating .orb:nth-child(2) { top: 50%; right: 0; animation-delay: 0.1s; }
        .reveal-creating .orb:nth-child(3) { bottom: 0; left: 50%; animation-delay: 0.2s; }
        .reveal-creating .orb:nth-child(4) { top: 50%; left: 0; animation-delay: 0.3s; }
        .reveal-creating .orb:nth-child(5) { top: 10%; left: 10%; animation-delay: 0.15s; }
        .reveal-creating .orb:nth-child(6) { top: 10%; right: 10%; animation-delay: 0.25s; }
        .reveal-creating .orb:nth-child(7) { bottom: 10%; left: 10%; animation-delay: 0.35s; }
        .reveal-creating .orb:nth-child(8) { bottom: 10%; right: 10%; animation-delay: 0.05s; }

        @keyframes orb-converge {
          0% { opacity: 0; transform: scale(1.5); }
          30% { opacity: 1; }
          100% { opacity: 0; top: 50%; left: 50%; transform: scale(0); }
        }

        .reveal-creating-text {
          margin-top: 16px;
          color: #a78bfa;
          font-size: 14px;
          animation: pulse-text 0.8s ease-in-out infinite alternate;
        }

        @keyframes pulse-text {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }

        /* Phase: Class */
        .reveal-class-emoji {
          font-size: 56px;
          animation: zoom-pulse 0.6s ease-out forwards;
        }
        .reveal-class-name {
          margin-top: 8px;
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 4px;
          text-transform: uppercase;
          animation: fade-in 0.4s ease-out 0.3s both;
        }
        .reveal-flash {
          position: absolute;
          inset: 0;
          background: white;
          animation: flash 0.5s ease-out forwards;
          pointer-events: none;
        }

        @keyframes zoom-pulse {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes flash {
          0% { opacity: 0.7; }
          100% { opacity: 0; }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Phase: Rarity */
        .reveal-rarity-text {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 6px;
          text-transform: uppercase;
          animation: rarity-appear 0.6s ease-out forwards;
        }

        @keyframes rarity-appear {
          0% { opacity: 0; transform: scale(0.5); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }

        .reveal-shake {
          animation: shake 0.4s ease-in-out 0.3s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        /* Golden particles */
        .golden-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #fbbf24;
          animation: float-up 1.8s ease-out forwards;
        }

        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-80px) scale(0); }
        }

        /* Phase: Sprite */
        .reveal-sprite-container {
          animation: sprite-appear 0.8s ease-out forwards;
          position: relative;
        }
        .reveal-sprite-glow {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          filter: blur(20px);
          opacity: 0.4;
          animation: glow-pulse 1.5s ease-in-out infinite alternate;
        }

        @keyframes sprite-appear {
          0% { opacity: 0; transform: scale(0); }
          70% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes glow-pulse {
          from { opacity: 0.3; transform: scale(0.9); }
          to { opacity: 0.5; transform: scale(1.1); }
        }

        /* Phase: Stats */
        .reveal-name {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 10px;
          animation: slide-up 0.4s ease-out forwards;
        }
        .reveal-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 16px;
        }
        .reveal-stat {
          font-size: 12px;
          color: #ccc;
          opacity: 0;
          animation: fade-in 0.3s ease-out forwards;
        }
        .reveal-stat:nth-child(1) { animation-delay: 0.2s; }
        .reveal-stat:nth-child(2) { animation-delay: 0.4s; }
        .reveal-stat:nth-child(3) { animation-delay: 0.6s; }
        .reveal-stat:nth-child(4) { animation-delay: 0.8s; }

        .reveal-stat-value {
          font-weight: 700;
          color: #fff;
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Phase: Done */
        .reveal-done-btn {
          margin-top: 20px;
          padding: 10px 28px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          animation: fade-in 0.5s ease-out forwards;
          transition: transform 0.15s;
        }
        .reveal-done-btn:hover {
          transform: scale(1.05);
        }
      `}</style>

      <div className={`reveal-overlay ${isDramatic && phase === 'rarity' ? 'reveal-shake' : ''}`}>
        {/* Phase: Creating */}
        {phase === 'creating' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="reveal-creating">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="orb" />
              ))}
            </div>
            <div className="reveal-creating-text">Creazione in corso...</div>
          </div>
        )}

        {/* Phase: Class */}
        {phase === 'class' && (
          <>
            <div className="reveal-flash" />
            <div className="reveal-class-emoji">{CLASS_EMOJIS[hero.heroClass]}</div>
            <div className="reveal-class-name">{CLASS_LABELS[hero.heroClass]}</div>
          </>
        )}

        {/* Phase: Rarity */}
        {phase === 'rarity' && (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              className="reveal-rarity-text"
              style={{
                color: rarityColor,
                textShadow: `0 0 20px ${rarityColor}, 0 0 40px ${rarityColor}`,
              }}
            >
              {RARITY_LABELS[hero.rarity]}
            </div>
            {isGolden &&
              Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="golden-particle"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 1.2}s`,
                    width: `${3 + Math.random() * 4}px`,
                    height: `${3 + Math.random() * 4}px`,
                  }}
                />
              ))}
          </div>
        )}

        {/* Phase: Sprite */}
        {phase === 'sprite' && (
          <div className="reveal-sprite-container" style={{ position: 'relative' }}>
            <div className="reveal-sprite-glow" style={{ background: rarityColor }} />
            <HeroSprite heroClass={hero.heroClass} rarity={hero.rarity} size={96} animate="idle" />
          </div>
        )}

        {/* Phase: Stats */}
        {phase === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="reveal-sprite-container" style={{ position: 'relative', marginBottom: 12 }}>
              <div className="reveal-sprite-glow" style={{ background: rarityColor }} />
              <HeroSprite heroClass={hero.heroClass} rarity={hero.rarity} size={80} animate="idle" />
            </div>
            <div className="reveal-name" style={{ color: rarityColor }}>{hero.displayName}</div>
            <div className="reveal-stats-grid">
              <div className="reveal-stat">HP: <span className="reveal-stat-value">{statCounters.hp}</span></div>
              <div className="reveal-stat">ATK: <span className="reveal-stat-value">{statCounters.atk}</span></div>
              <div className="reveal-stat">DEF: <span className="reveal-stat-value">{statCounters.def}</span></div>
              <div className="reveal-stat">SPD: <span className="reveal-stat-value">{statCounters.spd}</span></div>
            </div>
          </div>
        )}

        {/* Phase: Done */}
        {phase === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <div className="reveal-sprite-glow" style={{ background: rarityColor }} />
              <HeroSprite heroClass={hero.heroClass} rarity={hero.rarity} size={80} animate="idle" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: rarityColor, marginBottom: 4 }}>
              {hero.displayName}
            </div>
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>
              {CLASS_EMOJIS[hero.heroClass]} {CLASS_LABELS[hero.heroClass]} &middot; {RARITY_LABELS[hero.rarity]}
            </div>
            <div className="reveal-stats-grid" style={{ marginBottom: 8 }}>
              <div className="reveal-stat" style={{ opacity: 1 }}>HP: <span className="reveal-stat-value">{hero.stats.hp}</span></div>
              <div className="reveal-stat" style={{ opacity: 1 }}>ATK: <span className="reveal-stat-value">{hero.stats.atk}</span></div>
              <div className="reveal-stat" style={{ opacity: 1 }}>DEF: <span className="reveal-stat-value">{hero.stats.def}</span></div>
              <div className="reveal-stat" style={{ opacity: 1 }}>SPD: <span className="reveal-stat-value">{hero.stats.spd}</span></div>
            </div>
            <button className="reveal-done-btn" onClick={onComplete}>
              Inizia l'avventura!
            </button>
          </div>
        )}
      </div>
    </>
  );
}
