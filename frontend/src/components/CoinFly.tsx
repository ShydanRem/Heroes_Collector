import React, { useEffect } from 'react';

interface CoinFlyProps {
  /** Posizione di partenza (px assoluti, viewport) */
  origin: { x: number; y: number };
  /** Numero di monete da animare */
  count?: number;
  /** Quando l'animazione finisce */
  onDone: () => void;
}

/**
 * Spawnna `count` monete 🪙 sopra il viewport che salgono e svaniscono.
 * Effetto effimero — il consumer la rimonta a ogni evento.
 */
export function CoinFly({ origin, count = 6, onDone }: CoinFlyProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 1000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const dx = (Math.random() - 0.5) * 80;
        const dy = -80 - Math.random() * 40;
        const delay = i * 60;
        return (
          <span
            key={i}
            className="coin-fly"
            style={{
              left: origin.x,
              top: origin.y,
              animationDelay: `${delay}ms`,
              ['--dx' as any]: `${dx}px`,
              ['--dy' as any]: `${dy}px`,
            }}
          >🪙</span>
        );
      })}
    </>
  );
}
