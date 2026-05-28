// backend/src/services/itemService.test.ts
import { describe, it, expect } from 'vitest';
import { SELL_PRICES, sellBulk } from './itemService';

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

describe('sellBulk()', () => {
  it('returns { soldCount: 0, gold: 0, skipped: [] } for empty input', async () => {
    const result = await sellBulk('any-user-id', []);
    expect(result.soldCount).toBe(0);
    expect(result.gold).toBe(0);
    expect(result.skipped).toEqual([]);
  });
});

// Test DB-gated: abilita manualmente puntando DATABASE_URL a un DB live
describe.skip('sellBulk() with non-existent ids (DB-gated, enable manually)', () => {
  it('marks all unknown ids as not_found and accredits no gold', async () => {
    const fakeIds = [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
    ];
    const result = await sellBulk('non-existent-user-' + Date.now(), fakeIds);
    expect(result.soldCount).toBe(0);
    expect(result.gold).toBe(0);
    expect(result.skipped).toHaveLength(2);
    expect(result.skipped.every(s => s.reason === 'not_found')).toBe(true);
  });
});
