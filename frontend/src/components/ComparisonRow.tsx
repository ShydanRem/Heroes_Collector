import React from 'react';
import { InventoryItem } from '../services/api';
import { RARITY_COLORS } from '../types';
import { STAT_LABELS } from '../constants/stats';
import { getItemIcon } from '../utils/itemIcon';

interface ComparisonRowProps {
  candidate: InventoryItem;
  /** Delta CP che il candidato darebbe rispetto all'item attualmente equipaggiato */
  deltaCP: number;
  /** Hover/focus: dice al parent di simulare il candidato (per anteprima viva). null per resettare. */
  onPreview?: (item: InventoryItem | null) => void;
  onEquip: () => void;
  /** Vendita rapida (undefined se l'item è equipaggiato altrove e non vendibile) */
  onSell?: () => void;
  disabled?: boolean;
}

export function ComparisonRow({
  candidate, deltaCP, onPreview, onEquip, onSell, disabled,
}: ComparisonRowProps) {
  const rarityColor = RARITY_COLORS[candidate.rarity as keyof typeof RARITY_COLORS] || '#9e9e9e';
  const deltaColor = deltaCP > 0 ? '#22c55e' : deltaCP < 0 ? '#ef4444' : '#adadb8';
  const deltaSym = deltaCP > 0 ? '↑' : deltaCP < 0 ? '↓' : '=';

  return (
    <div
      onMouseEnter={() => onPreview?.(candidate)}
      onMouseLeave={() => onPreview?.(null)}
      onFocus={() => onPreview?.(candidate)}
      onBlur={() => onPreview?.(null)}
      style={{
        background: '#0e0e10',
        borderRadius: 6,
        padding: '6px 8px',
        marginBottom: 4,
        borderLeft: `3px solid ${rarityColor}`,
        opacity: disabled ? 0.4 : 1,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>{getItemIcon(candidate.name, candidate.slot)}</span>
        <span style={{
          flex: 1, fontSize: 11, fontWeight: 700, color: rarityColor,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {candidate.name}
        </span>
        <span style={{ fontSize: 11, fontWeight: 900, color: deltaColor }}>
          {deltaSym} {deltaCP > 0 ? '+' : ''}{deltaCP}
        </span>
      </div>
      <div style={{ fontSize: 9, color: '#adadb8', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Object.entries(candidate.statBonuses).map(([s, v]) => (
          <span key={s}>{(v as number) >= 0 ? '+' : ''}{v as number} {STAT_LABELS[s] || s}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={onEquip}
          disabled={disabled}
          className="btn btn-primary"
          style={{ flex: 1, fontSize: 10, padding: '4px 6px' }}
        >
          Equipaggia
        </button>
        {onSell && (
          <button
            onClick={onSell}
            disabled={disabled}
            className="btn btn-secondary"
            style={{ fontSize: 10, padding: '4px 6px', color: '#ffd700' }}
          >
            Vendi {candidate.sellValue}g
          </button>
        )}
      </div>
    </div>
  );
}
