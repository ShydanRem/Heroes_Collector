import React, { useMemo, useState } from 'react';
import { Hero, RARITY_COLORS, HeroStats } from '../types';
import { InventoryItem } from '../services/api';
import { STAT_LABELS } from '../constants/stats';
import { computeCP, isStrictlyBetter } from '../utils/stats';
import { ComparisonRow } from './ComparisonRow';
import { getItemIcon } from '../utils/itemIcon';

const SLOTS = ['arma', 'armatura', 'accessorio'] as const;
type Slot = typeof SLOTS[number];

const SLOT_ICONS_LOCAL: Record<Slot, string> = {
  arma: '⚔️',
  armatura: '🛡️',
  accessorio: '💍',
};

const SLOT_LABELS_LOCAL: Record<Slot, string> = {
  arma: 'Arma',
  armatura: 'Armatura',
  accessorio: 'Accessorio',
};

interface EquipPanelProps {
  hero: Hero;
  /** Tutti gli item dell'utente (zaino completo, equipaggiati inclusi) */
  inventory: InventoryItem[];
  /** Stat dell'eroe (effective), per calcolare delta CP nei candidati */
  effectiveStats: HeroStats;
  /** Bonus correnti dall'equip già equipaggiato su questo eroe */
  currentBonuses: Record<string, number>;
  /** Callback per impostare il preview sull'header eroe — passa i bonus simulati o null per resettare */
  onPreviewBonuses: (bonuses: Record<string, number> | null) => void;
  onEquip: (inventoryId: string) => Promise<void>;
  onUnequip: (inventoryId: string) => Promise<void>;
  onSell: (inventoryId: string) => Promise<void>;
}

function sumBonusesExcluding(items: InventoryItem[], excludeSlot: Slot | null): Record<string, number> {
  const out: Record<string, number> = {};
  for (const it of items) {
    if (excludeSlot && it.slot === excludeSlot) continue;
    for (const [k, v] of Object.entries(it.statBonuses)) out[k] = (out[k] || 0) + (v as number);
  }
  return out;
}

function addBonuses(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = (out[k] || 0) + v;
  return out;
}

function canHeroEquip(hero: Hero, item: InventoryItem): boolean {
  if (!item.allowedClasses || item.allowedClasses.length === 0) return true;
  return item.allowedClasses.includes(hero.heroClass);
}

export function EquipPanel({
  hero, inventory, effectiveStats, currentBonuses, onPreviewBonuses, onEquip, onUnequip, onSell,
}: EquipPanelProps) {
  const [expandedSlot, setExpandedSlot] = useState<Slot | null>(null);

  const equippedOnHero = useMemo(
    () => inventory.filter(i => i.equippedOn === hero.id),
    [inventory, hero.id]
  );

  const equippedBySlot = (slot: Slot): InventoryItem | undefined =>
    equippedOnHero.find(i => i.slot === slot);

  const currentCP = computeCP(effectiveStats, currentBonuses);

  /** Delta CP che otterremmo equipaggiando candidate su questo slot */
  const computeDelta = (candidate: InventoryItem, slot: Slot): number => {
    const baseOtherSlots = sumBonusesExcluding(equippedOnHero, slot);
    const simulated = addBonuses(baseOtherSlots, candidate.statBonuses);
    return computeCP(effectiveStats, simulated) - currentCP;
  };

  const candidatesForSlot = (slot: Slot): InventoryItem[] => {
    return inventory
      .filter(i => i.slot === slot && !i.equippedOn && canHeroEquip(hero, i))
      .sort((a, b) => computeDelta(b, slot) - computeDelta(a, slot));
  };

  const bestCandidate = (slot: Slot): InventoryItem | null => {
    const eq = equippedBySlot(slot);
    const cands = candidatesForSlot(slot);
    for (const c of cands) {
      if (isStrictlyBetter(c, eq || null)) return c;
    }
    return null;
  };

  const handlePreview = (slot: Slot, candidate: InventoryItem | null) => {
    if (!candidate) {
      onPreviewBonuses(null);
      return;
    }
    const baseOtherSlots = sumBonusesExcluding(equippedOnHero, slot);
    const simulated = addBonuses(baseOtherSlots, candidate.statBonuses);
    onPreviewBonuses(simulated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {SLOTS.map(slot => {
        const equipped = equippedBySlot(slot);
        const isExpanded = expandedSlot === slot;
        const candidates = isExpanded ? candidatesForSlot(slot) : [];
        const best = !isExpanded ? bestCandidate(slot) : null;
        const eqRarityColor = equipped
          ? RARITY_COLORS[equipped.rarity as keyof typeof RARITY_COLORS]
          : undefined;

        return (
          <div key={slot} style={{
            background: '#18181b',
            borderRadius: 12,
            padding: 12,
            border: `1px solid ${isExpanded ? '#9147ff' : '#333'}`,
            transition: 'border-color 0.2s',
          }}>
            <div
              onClick={() => {
                setExpandedSlot(isExpanded ? null : slot);
                onPreviewBonuses(null);
              }}
              style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{
                width: 40, height: 40, background: '#0e0e10', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                border: equipped ? `1px solid ${eqRarityColor}` : '1px dashed #444',
                boxShadow: equipped && ['epico', 'leggendario', 'mitico', 'master'].includes(equipped.rarity)
                  ? `0 0 10px ${eqRarityColor}66`
                  : undefined,
              }}>
                {equipped ? getItemIcon(equipped.name, slot) : '＋'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {equipped ? (
                  <>
                    <div style={{
                      fontWeight: 800, fontSize: 13, color: '#efeff1',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {equipped.name}
                    </div>
                    <div style={{ fontSize: 9, color: eqRarityColor, textTransform: 'uppercase' }}>
                      {equipped.rarity}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: '#555' }}>
                    {SLOT_ICONS_LOCAL[slot]} Slot {SLOT_LABELS_LOCAL[slot]} vuoto — tocca per equipaggiare
                  </div>
                )}
              </div>
              {equipped?.statBonuses && !isExpanded && (
                <div style={{ textAlign: 'right' }}>
                  {Object.entries(equipped.statBonuses).map(([s, v]) => (
                    <div key={s} style={{ color: '#22c55e', fontSize: 10, fontWeight: 800 }}>
                      +{v as number} {STAT_LABELS[s] || s}
                    </div>
                  ))}
                </div>
              )}
              <span style={{ fontSize: 14, color: '#737380' }}>{isExpanded ? '▾' : '▸'}</span>
            </div>

            {!isExpanded && best && (
              <div
                onClick={(e) => { e.stopPropagation(); setExpandedSlot(slot); }}
                style={{
                  marginTop: 8, padding: '4px 8px',
                  background: 'rgba(34, 197, 94, 0.12)', borderRadius: 6,
                  color: '#22c55e', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                }}
              >
                ⤴ equipaggia il migliore: <strong>{best.name}</strong> ({(() => {
                  const d = computeDelta(best, slot);
                  return d > 0 ? `+${d} CP` : `${d} CP`;
                })()})
              </div>
            )}

            {isExpanded && (
              <div style={{ marginTop: 10 }}>
                {equipped && (
                  <button
                    onClick={() => onUnequip(equipped.id)}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: 10, padding: '6px', marginBottom: 6 }}
                  >
                    Rimuovi {equipped.name}
                  </button>
                )}
                {candidates.length === 0 ? (
                  <div style={{ fontSize: 11, color: '#737380', padding: 8, textAlign: 'center' }}>
                    Nessun {SLOT_LABELS_LOCAL[slot]} disponibile in zaino.
                  </div>
                ) : (
                  candidates.map(c => (
                    <ComparisonRow
                      key={c.id}
                      candidate={c}
                      deltaCP={computeDelta(c, slot)}
                      onPreview={(it) => handlePreview(slot, it)}
                      onEquip={async () => {
                        onPreviewBonuses(null);
                        await onEquip(c.id);
                        setExpandedSlot(null);
                      }}
                      onSell={async () => {
                        onPreviewBonuses(null);
                        await onSell(c.id);
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
