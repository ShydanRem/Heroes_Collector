import { describe, it, expect } from 'vitest';
import { generateBotOpponent } from './pvpBot';
import { Rarity, RARITY_ORDER } from '../types';

function party(n: number, level = 10, rarity: Rarity = Rarity.RARO) {
  return Array.from({ length: n }, (_, i) => ({
    id: `h${i}`,
    level,
    rarity,
  }));
}

describe('generateBotOpponent', () => {
  it('matches the player party size, capped at 5', () => {
    expect(generateBotOpponent(party(1), 1000).heroes).toHaveLength(1);
    expect(generateBotOpponent(party(3), 1000).heroes).toHaveLength(3);
    expect(generateBotOpponent(party(8), 1000).heroes).toHaveLength(5);
  });

  it('never produces an empty arena even for an empty party', () => {
    const bot = generateBotOpponent([], 1000);
    expect(bot.heroes.length).toBeGreaterThanOrEqual(1);
    expect(bot.isBot).toBe(true);
  });

  it('scales the bot level to the average party level', () => {
    const bot = generateBotOpponent(
      [{ id: 'a', level: 10, rarity: Rarity.RARO }, { id: 'b', level: 20, rarity: Rarity.RARO }],
      1500,
    );
    expect(bot.heroes.every(h => h.level === 15)).toBe(true);
  });

  it('matches the player ELO for a balanced fight', () => {
    expect(generateBotOpponent(party(3), 1234).elo).toBe(1234);
  });

  it('scales the bot rarity to the average party rarity', () => {
    const bot = generateBotOpponent(party(3, 10, Rarity.EPICO), 1000);
    const idx = RARITY_ORDER.indexOf(Rarity.EPICO);
    expect(bot.heroes.every(h => RARITY_ORDER.indexOf(h.rarity) === idx)).toBe(true);
  });

  it('produces fighters with positive combat stats', () => {
    const bot = generateBotOpponent(party(5, 25, Rarity.LEGGENDARIO), 2000);
    for (const h of bot.heroes) {
      expect(h.hp).toBeGreaterThan(0);
      expect(h.atk).toBeGreaterThan(0);
      expect(h.ability_ids.length).toBeGreaterThan(0);
    }
  });
});
