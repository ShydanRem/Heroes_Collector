import { describe, it, expect } from 'vitest';
import {
  calculateActivityScore,
  scoreToRarity,
  assignClass,
  calculateStats,
  selectAbilities,
  generateHero,
  expForLevel,
  tryLevelUp,
} from './heroGenerator';
import { HeroClass, Rarity, EXP_BASE, MAX_LEVEL, RARITY_MULTIPLIERS } from '../types';
import { CLASS_BASE_STATS } from '../data/classes';

const ZERO_ACTIVITY = { chatMessages: 0, watchTimeMinutes: 0, subMonths: 0, followAgeDays: 0 };

describe('calculateActivityScore', () => {
  it('returns 0 for a completely inactive user', () => {
    expect(calculateActivityScore(ZERO_ACTIVITY)).toBe(0);
  });

  it('is monotonic: more chat never lowers the score', () => {
    const low = calculateActivityScore({ ...ZERO_ACTIVITY, chatMessages: 10 });
    const high = calculateActivityScore({ ...ZERO_ACTIVITY, chatMessages: 5000 });
    expect(high).toBeGreaterThan(low);
  });

  it('weighs each metric so a top supporter scores higher than a lurker', () => {
    const lurker = calculateActivityScore({ chatMessages: 5, watchTimeMinutes: 60, subMonths: 0, followAgeDays: 10 });
    const whale = calculateActivityScore({ chatMessages: 5000, watchTimeMinutes: 50000, subMonths: 36, followAgeDays: 1095 });
    expect(whale).toBeGreaterThan(lurker);
    expect(whale).toBeGreaterThanOrEqual(0.9);
  });

  it('rounds to 3 decimals', () => {
    const score = calculateActivityScore({ chatMessages: 123, watchTimeMinutes: 456, subMonths: 2, followAgeDays: 99 });
    expect(score).toBe(Math.round(score * 1000) / 1000);
  });
});

describe('scoreToRarity', () => {
  it('maps boundary values to the correct tier', () => {
    expect(scoreToRarity(0)).toBe(Rarity.COMUNE);
    expect(scoreToRarity(0.11)).toBe(Rarity.COMUNE);
    expect(scoreToRarity(0.12)).toBe(Rarity.NON_COMUNE);
    expect(scoreToRarity(0.22)).toBe(Rarity.RARO);
    expect(scoreToRarity(0.35)).toBe(Rarity.MOLTO_RARO);
    expect(scoreToRarity(0.48)).toBe(Rarity.EPICO);
    expect(scoreToRarity(0.60)).toBe(Rarity.LEGGENDARIO);
    expect(scoreToRarity(0.75)).toBe(Rarity.MITICO);
    expect(scoreToRarity(0.90)).toBe(Rarity.MASTER);
    expect(scoreToRarity(2.0)).toBe(Rarity.MASTER);
  });
});

describe('assignClass', () => {
  it('is deterministic for the same username', () => {
    expect(assignClass('randomviewer')).toBe(assignClass('randomviewer'));
  });

  it('honors manual overrides (case-insensitive)', () => {
    expect(assignClass('shydanrem')).toBe(HeroClass.OMBRA);
    expect(assignClass('ShydanRem')).toBe(HeroClass.OMBRA);
    expect(assignClass('hollow90x')).toBe(HeroClass.CRONO);
  });

  it('always returns a valid HeroClass', () => {
    const valid = Object.values(HeroClass);
    for (const name of ['abc', 'zzzz', 'a', 'player_42', 'ülrich']) {
      expect(valid).toContain(assignClass(name));
    }
  });
});

describe('calculateStats', () => {
  it('at level 1 equals base stats scaled by rarity multiplier', () => {
    const base = CLASS_BASE_STATS[HeroClass.LAMA];
    const mult = RARITY_MULTIPLIERS[Rarity.COMUNE];
    const stats = calculateStats(HeroClass.LAMA, Rarity.COMUNE, 1);
    expect(stats.hp).toBe(Math.floor(base.hp * mult));
    expect(stats.atk).toBe(Math.floor(base.atk * mult));
  });

  it('scales up with level', () => {
    const lvl1 = calculateStats(HeroClass.LAMA, Rarity.RARO, 1);
    const lvl20 = calculateStats(HeroClass.LAMA, Rarity.RARO, 20);
    expect(lvl20.hp).toBeGreaterThan(lvl1.hp);
    expect(lvl20.atk).toBeGreaterThan(lvl1.atk);
  });

  it('scales up with rarity', () => {
    const comune = calculateStats(HeroClass.ARCANO, Rarity.COMUNE, 10);
    const master = calculateStats(HeroClass.ARCANO, Rarity.MASTER, 10);
    expect(master.hp).toBeGreaterThan(comune.hp);
  });

  it('caps crit at 100', () => {
    const stats = calculateStats(HeroClass.OMBRA, Rarity.MASTER, MAX_LEVEL);
    expect(stats.crit).toBeLessThanOrEqual(100);
  });
});

describe('selectAbilities', () => {
  it('is deterministic for the same seed', () => {
    const a = selectAbilities(HeroClass.LAMA, Rarity.RARO, 10, 'seed-123');
    const b = selectAbilities(HeroClass.LAMA, Rarity.RARO, 10, 'seed-123');
    expect(a).toEqual(b);
  });

  it('returns a non-empty list of ability ids', () => {
    const abilities = selectAbilities(HeroClass.GUARDIANO, Rarity.COMUNE, 1, 'x');
    expect(abilities.length).toBeGreaterThan(0);
    expect(abilities.every(id => typeof id === 'string' && id.length > 0)).toBe(true);
  });

  it('does not unlock more abilities below level 20 than at level 20+', () => {
    const seed = 'compare';
    const below = selectAbilities(HeroClass.LAMA, Rarity.MASTER, 19, seed);
    const at20 = selectAbilities(HeroClass.LAMA, Rarity.MASTER, 20, seed);
    expect(at20.length).toBeGreaterThanOrEqual(below.length);
  });
});

describe('expForLevel', () => {
  it('returns EXP_BASE at level 1', () => {
    expect(expForLevel(1)).toBe(EXP_BASE);
  });

  it('is strictly increasing', () => {
    for (let lvl = 1; lvl < 10; lvl++) {
      expect(expForLevel(lvl + 1)).toBeGreaterThan(expForLevel(lvl));
    }
  });
});

describe('tryLevelUp', () => {
  const baseHero = { level: 5, exp: 0, heroClass: HeroClass.LAMA, rarity: Rarity.RARO, abilities: [] as string[] };

  it('does not level up without enough exp', () => {
    const res = tryLevelUp({ ...baseHero, exp: expForLevel(5) - 1 });
    expect(res.leveled).toBe(false);
    expect(res.newLevel).toBe(5);
  });

  it('levels up and carries over remaining exp', () => {
    const required = expForLevel(5);
    const res = tryLevelUp({ ...baseHero, exp: required + 42 });
    expect(res.leveled).toBe(true);
    expect(res.newLevel).toBe(6);
    expect(res.remainingExp).toBe(42);
    expect(res.newStats).toBeDefined();
  });

  it('does not level past MAX_LEVEL', () => {
    const res = tryLevelUp({ ...baseHero, level: MAX_LEVEL, exp: 999999 });
    expect(res.leveled).toBe(false);
    expect(res.newLevel).toBe(MAX_LEVEL);
  });
});
