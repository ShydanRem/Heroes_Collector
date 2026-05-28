import React, { useEffect, useState } from 'react';

interface PowerUpBadgeProps {
  /** Numero che cambia: ogni cambio mostra il badge per ~1.5s */
  triggerKey: number;
  label?: string;
}

/**
 * Mostra "POWER UP!" sopra l'elemento padre (deve essere position: relative)
 * quando `triggerKey` cambia. Auto-dismiss dopo l'animazione.
 */
export function PowerUpBadge({ triggerKey, label = 'POWER UP!' }: PowerUpBadgeProps) {
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (triggerKey === 0) return;
    setVisible(true);
    setKey(k => k + 1);
    const t = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(t);
  }, [triggerKey]);

  if (!visible) return null;
  return (
    <div key={key} className="power-up-badge">
      ⚡ {label}
    </div>
  );
}
