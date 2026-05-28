import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  to: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Anima un numero da quello attualmente visualizzato fino a `to` in `duration` ms (easeOutCubic).
 * Usa requestAnimationFrame, nessuna libreria esterna.
 */
export function CountUp({ to, duration = 600, format, className, style }: CountUpProps) {
  const [value, setValue] = useState(to);
  const fromRef = useRef(to);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (to === fromRef.current) return;
    const start = performance.now();
    const from = fromRef.current;
    const delta = to - from;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + delta * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [to, duration]);

  const display = format ? format(value) : value.toLocaleString();
  return <span className={className} style={style}>{display}</span>;
}
