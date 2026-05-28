import React from 'react';
import { InventoryItem } from '../services/api';
import { RARITY_COLORS, RARITY_LABELS } from '../types';
import { STAT_LABELS } from '../constants/stats';
import { getItemIcon } from '../utils/itemIcon';
import { itemSellValue } from '../utils/stats';

interface ItemCardProps {
  item: InventoryItem;
  showSellValue?: boolean;
  isNew?: boolean;
  selected?: boolean;
  onClick?: () => void;
  right?: React.ReactNode;
}

/**
 * Card oggetto condivisa tra Zaino, picker EquipPanel e dettaglio.
 * Glow rarità per epico/leggendario/mitico/master.
 */
export function ItemCard({ item, showSellValue, isNew, selected, onClick, right }: ItemCardProps) {
  const rarityColor = RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || '#9e9e9e';
  const isHighRarity = ['epico', 'leggendario', 'mitico', 'master'].includes(item.rarity);

  return (
    <div
      onClick={onClick}
      className={isHighRarity ? 'item-card item-card--shimmer' : 'item-card'}
      style={{
        position: 'relative',
        background: '#18181b',
        borderRadius: 8,
        padding: '8px 10px',
        cursor: onClick ? 'pointer' : 'default',
        border: selected ? `2px solid ${rarityColor}` : '1px solid #333',
        borderLeft: `3px solid ${rarityColor}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {isNew && (
        <span style={{
          position: 'absolute', top: -6, right: 6,
          background: '#22c55e', color: '#0a0a0a',
          fontSize: 8, fontWeight: 900, padding: '2px 6px',
          borderRadius: 999, letterSpacing: 1,
        }}>NEW</span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <div style={{ fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 }}>
          {getItemIcon(item.name, item.slot)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#efeff1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.name}
          </div>
          <div style={{ fontSize: 9, display: 'flex', gap: 6, color: '#adadb8', marginTop: 1 }}>
            <span style={{ color: rarityColor }}>
              {RARITY_LABELS[item.rarity as keyof typeof RARITY_LABELS]}
            </span>
            {item.quantity > 1 && <span>x{item.quantity}</span>}
          </div>
          <div style={{ fontSize: 10, color: '#22c55e', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(item.statBonuses).map(([s, v]) => (
              <span key={s}>{(v as number) >= 0 ? '+' : ''}{v as number} {STAT_LABELS[s] || s}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right', fontSize: 10, flexShrink: 0 }}>
        {right ?? (showSellValue && (
          <div style={{ color: '#ffd700', fontWeight: 700 }}>{itemSellValue(item)}g</div>
        ))}
      </div>
    </div>
  );
}
