import { Hero, HeroStats } from '../types';
import { CLASS_MODIFIERS } from '../constants/balance';
import type { InventoryItem } from '../services/api';

/**
 * True se l'eroe può equipaggiare l'item (rispetta allowedClasses).
 */
export function canHeroEquip(hero: Hero, item: Pick<InventoryItem, 'allowedClasses'>): boolean {
  if (!item.allowedClasses || item.allowedClasses.length === 0) return true;
  return item.allowedClasses.includes(hero.heroClass);
}

/**
 * Calcola le statistiche effettive di un eroe applicando i modificatori di classe.
 */
export function getEffectiveStats(hero: Hero): HeroStats {
  const mod = CLASS_MODIFIERS[hero.heroClass] || { hp: 1, atk: 1, def: 1, spd: 1, crit: 1 };

  return {
    hp: Math.floor(hero.stats.hp * mod.hp),
    atk: Math.floor(hero.stats.atk * mod.atk),
    def: Math.floor(hero.stats.def * mod.def),
    spd: Math.floor(hero.stats.spd * mod.spd),
    crit: Number((hero.stats.crit * mod.crit).toFixed(1)),
    critDmg: hero.stats.critDmg,
  };
}

/**
 * Calcola il Combat Power dell'eroe, considerando le stat effettive + i bonus equipaggiamento.
 * Stessa formula usata in MyHero (estratta qui per riusarla nell'anteprima viva del picker).
 */
export function computeCP(
  stats: HeroStats | null | undefined,
  bonuses: Record<string, number>,
): number {
  if (!stats) return 0;
  const { atk, def, hp, spd, crit, critDmg } = stats;
  const bonusAtk = bonuses.atk || 0;
  const bonusDef = bonuses.def || 0;
  const bonusHp = bonuses.hp || 0;
  const bonusSpd = bonuses.spd || 0;
  const bonusCrit = bonuses.crit || 0;
  const bonusCritDmg = bonuses.critDmg || 0;

  const baseCP =
    (atk + bonusAtk) * 2 +
    (def + bonusDef) * 1.5 +
    (hp + bonusHp) * 0.5 +
    (spd + bonusSpd) * 5;
  const totalCrit = crit + bonusCrit;
  const totalCritDmg = critDmg + bonusCritDmg;
  const critMult = 1 + (totalCrit / 100) * (totalCritDmg / 100);
  return Math.floor(baseCP * critMult);
}

/**
 * Restituisce il valore di vendita totale di una entry di inventario (sellValue × quantity).
 * Usa il campo `sellValue` che ora arriva dal backend.
 */
export function itemSellValue(item: Pick<InventoryItem, 'sellValue' | 'quantity'>): number {
  const per = item.sellValue || 0;
  const qty = item.quantity || 1;
  return per * qty;
}

/**
 * True se il candidate ha tutti i bonus stats ≥ dell'equipped e almeno uno strettamente >.
 * Se equipped è null/undefined, qualsiasi candidato con bonus > 0 è migliore.
 */
export function isStrictlyBetter(
  candidate: Pick<InventoryItem, 'statBonuses'>,
  equipped: Pick<InventoryItem, 'statBonuses'> | null | undefined,
): boolean {
  const cand = candidate.statBonuses || {};
  if (!equipped) {
    return Object.values(cand).some(v => (v || 0) > 0);
  }
  const eq = equipped.statBonuses || {};
  const keys = new Set([...Object.keys(cand), ...Object.keys(eq)]);
  let oneStrictlyBetter = false;
  for (const k of keys) {
    const c = cand[k] || 0;
    const e = eq[k] || 0;
    if (c < e) return false;
    if (c > e) oneStrictlyBetter = true;
  }
  return oneStrictlyBetter;
}

/**
 * True se l'item può essere venduto (non equipaggiato).
 */
export function canSellItem(item: Pick<InventoryItem, 'equippedOn'>): boolean {
  return !item.equippedOn;
}
