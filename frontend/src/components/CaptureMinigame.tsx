import React, { useState, useEffect, useRef } from 'react';
import { Hero, Rarity, RARITY_COLORS, RARITY_LABELS } from '../types';
import { HeroSprite } from './HeroSprite';

interface CaptureMinigameProps {
  hero: Hero;
  rarity: Rarity;
  onSuccess: () => void;
  onFail: (message: string) => void;
  onCancel: () => void;
}

const SUCCESS_ZONE_WIDTHS: Record<Rarity, number> = {
  comune: 60,
  non_comune: 50,
  raro: 40,
  molto_raro: 30,
  epico: 25,
  leggendario: 18,
  mitico: 12,
  master: 8,
};

const CURSOR_SPEEDS: Record<Rarity, number> = {
  comune: 1.5,
  non_comune: 1.8,
  raro: 2.2,
  molto_raro: 2.5,
  epico: 3.0,
  leggendario: 3.5,
  mitico: 4.0,
  master: 5.0,
};

export function CaptureMinigame({ hero, rarity, onSuccess, onFail, onCancel }: CaptureMinigameProps) {
  const [cursorPos, setCursorPos] = useState(0);
  const [direction, setDirection] = useState(1);
  const [gameState, setGameState] = useState<'playing' | 'success' | 'fail' | 'celebrating'>('playing');
  const requestRef = useRef<number>();
  
  const zoneWidth = SUCCESS_ZONE_WIDTHS[rarity];
  const speed = CURSOR_SPEEDS[rarity];
  const zoneStart = (100 - zoneWidth) / 2;
  const zoneEnd = zoneStart + zoneWidth;

  const update = () => {
    if (gameState !== 'playing') return;

    setCursorPos((prev) => {
      let next = prev + direction * speed;
      if (next >= 100) {
        setDirection(-1);
        next = 100;
      } else if (next <= 0) {
        setDirection(1);
        next = 0;
      }
      return next;
    });

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [direction, gameState]);

  const handleCapture = () => {
    if (gameState !== 'playing') return;
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    const hit = cursorPos >= zoneStart && cursorPos <= zoneEnd;
    
    if (hit) {
      setGameState('success');
      setTimeout(() => {
        setGameState('celebrating');
        setTimeout(onSuccess, 1500);
      }, 600);
    } else {
      setGameState('fail');
      setTimeout(() => onFail('Mancato! L\'eroe è scappato.'), 1200);
    }
  };

  return (
    <div className="capture-overlay">
      <div className="capture-modal">
        <div className={`capture-hero-container ${gameState}`}>
          <HeroSprite 
            heroClass={hero.heroClass} 
            rarity={rarity} 
            size={120} 
            animate={gameState === 'playing' ? 'idle' : gameState === 'success' || gameState === 'celebrating' ? 'idle' : 'hurt'}
            name={hero.displayName}
          />
          {gameState === 'playing' && <div className="capture-hint">Tocca per catturare!</div>}
        </div>

        <div className="capture-ui">
          <div className="capture-target-info">
            <span style={{ color: RARITY_COLORS[rarity] }}>{RARITY_LABELS[rarity]}</span>
            <h3>{hero.displayName}</h3>
          </div>

          <div className="capture-bar-container">
            <div className="capture-bar">
              <div 
                className="capture-zone" 
                style={{ 
                  left: `${zoneStart}%`, 
                  width: `${zoneWidth}%`,
                  backgroundColor: RARITY_COLORS[rarity]
                }} 
              />
              <div 
                className={`capture-cursor ${gameState}`} 
                style={{ left: `${cursorPos}%` }} 
              />
            </div>
          </div>

          <div className="capture-actions">
            {gameState === 'playing' ? (
              <>
                <button className="btn btn-capture" onClick={handleCapture}>
                  CATTURA!
                </button>
                <button className="btn btn-back" onClick={onCancel}>Annulla</button>
              </>
            ) : (
              <div className={`capture-result ${gameState}`}>
                {gameState === 'success' || gameState === 'celebrating' ? 'PRESO!' : 'FALLITO!'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
