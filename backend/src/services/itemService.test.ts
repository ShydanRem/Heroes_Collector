// backend/src/services/itemService.test.ts
import { describe, it, expect } from 'vitest';
import { SELL_PRICES } from './itemService';

describe('SELL_PRICES', () => {
  it('expose sell price for every rarity tier', () => {
    expect(SELL_PRICES.comune).toBe(5);
    expect(SELL_PRICES.non_comune).toBe(15);
    expect(SELL_PRICES.raro).toBe(40);
    expect(SELL_PRICES.molto_raro).toBe(100);
    expect(SELL_PRICES.epico).toBe(250);
    expect(SELL_PRICES.leggendario).toBe(600);
    expect(SELL_PRICES.mitico).toBe(1500);
    expect(SELL_PRICES.master).toBe(3000);
  });
});
