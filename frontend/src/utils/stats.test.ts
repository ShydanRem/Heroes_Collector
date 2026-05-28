import { describe, it, expect } from 'vitest';
import { computeCP, itemSellValue, isStrictlyBetter, canSellItem } from './stats';

const baseStats = { hp: 1000, atk: 100, def: 80, spd: 50, crit: 10, critDmg: 150 };

describe('computeCP', () => {
  it('returns 0 for null/undefined hero stats', () => {
    expect(computeCP(null, {})).toBe(0);
  });

  it('computes base CP without bonuses', () => {
    // (100)*2 + (80)*1.5 + (1000)*0.5 + 50*5 = 200 + 120 + 500 + 250 = 1070
    // critMult = 1 + (10/100)*(150/100) = 1 + 0.15 = 1.15
    // -> floor(1070 * 1.15) = 1230
    expect(computeCP(baseStats, {})).toBe(1230);
  });

  it('applies equipment bonuses to atk/def/hp', () => {
    const bonuses = { atk: 50, def: 20, hp: 500 };
    // (150)*2 + (100)*1.5 + (1500)*0.5 + 50*5 = 300 + 150 + 750 + 250 = 1450
    // critMult = 1.15
    // -> floor(1450 * 1.15) = 1667
    expect(computeCP(baseStats, bonuses)).toBe(1667);
  });
});

describe('itemSellValue', () => {
  it('returns sellValue from item payload', () => {
    expect(itemSellValue({ sellValue: 40, quantity: 1 })).toBe(40);
  });
  it('multiplies by quantity for stacks', () => {
    expect(itemSellValue({ sellValue: 5, quantity: 3 })).toBe(15);
  });
  it('falls back to 0 if sellValue missing', () => {
    expect(itemSellValue({ quantity: 1 } as any)).toBe(0);
  });
});

describe('isStrictlyBetter', () => {
  it('true when candidate beats equipped on all stats and ties none worse', () => {
    const equipped = { statBonuses: { atk: 10, def: 5 } };
    const candidate = { statBonuses: { atk: 15, def: 8 } };
    expect(isStrictlyBetter(candidate as any, equipped as any)).toBe(true);
  });
  it('false when any stat is worse', () => {
    const equipped = { statBonuses: { atk: 10, def: 10 } };
    const candidate = { statBonuses: { atk: 15, def: 5 } };
    expect(isStrictlyBetter(candidate as any, equipped as any)).toBe(false);
  });
  it('true when no equipped item (anything beats nothing)', () => {
    const candidate = { statBonuses: { atk: 5 } };
    expect(isStrictlyBetter(candidate as any, null)).toBe(true);
  });
  it('false for an exact tie', () => {
    const equipped = { statBonuses: { atk: 10 } };
    const candidate = { statBonuses: { atk: 10 } };
    expect(isStrictlyBetter(candidate as any, equipped as any)).toBe(false);
  });
});

describe('canSellItem', () => {
  it('false if item is equipped', () => {
    expect(canSellItem({ equippedOn: 'hero-1' })).toBe(false);
  });
  it('true if item is not equipped', () => {
    expect(canSellItem({ equippedOn: null })).toBe(true);
  });
});
