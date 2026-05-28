# Equip & Item UX Redesign — Implementation Plan ("Scheda Viva")

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendere equipaggiamento e gestione oggetti **interattivi, chiari e "premium/addicting"** sull'estensione Twitch Heroes Collector — pagina Eroe sub-tab Equip diventa interattiva con anteprima viva, Zaino premium con vendita multipla + quick-sell.

**Architecture:** 2 endpoint backend nuovi (`sellValue` nel payload inventory + `POST /items/sell-bulk` transazionale), tutto il resto frontend. Confronto/anteprima 100% client; nuova `EquipPanel` con slot-card espandibili guida un `previewBonuses` state in `MyHero` che fa "anteprima viva" sull'header già esistente; `Inventory` ridisegnato con multi-select + sticky sell bar; componenti `ItemCard`/`ComparisonRow`/`CountUp`/`PowerUpBadge` condivisi.

**Tech Stack:** React 18 + TypeScript + Vite (frontend), Express + pg + vitest (backend). Stile: inline + CSS classes (`premium.css`). Frontend tests: vitest da introdurre (minimo setup).

**Spec source:** `docs/superpowers/specs/2026-05-27-equip-item-ux-design.md`

---

## File Structure

**Backend (modify):**
- `backend/src/services/itemService.ts` — export `SELL_PRICES`, aggiungere `sellValue` a `InventoryItem` payload, nuova `sellBulk()` transazionale
- `backend/src/routes/items.ts` — nuovo endpoint `POST /items/sell-bulk`
- `backend/src/services/itemService.test.ts` — **create** — unit/integration test per `sellBulk` (con db reale via setup esistente)

**Frontend foundations (create + modify):**
- `frontend/vitest.config.ts` — **create** — setup minimo vitest
- `frontend/package.json` — modify — aggiungere `vitest` e script `test`
- `frontend/src/constants/stats.ts` — **create** — STAT_LABELS, STAT_MAX, STAT_ICONS (oggi duplicati in MyHero/Inventory)
- `frontend/src/utils/stats.ts` — modify — aggiungere `computeCP`, `itemSellValue`, `isStrictlyBetter`, `canSellItem`
- `frontend/src/utils/stats.test.ts` — **create** — unit test per funzioni pure
- `frontend/src/services/api.ts` — modify — `sellValue` su `InventoryItem`, nuova `sellBulk()` API
- `frontend/src/premium.css` — modify — glow rarità per oggetti, badge NEW, sticky sell bar, coin fly keyframe, POWER UP keyframe

**Frontend componenti (create):**
- `frontend/src/components/CountUp.tsx` — tween numerico riusabile
- `frontend/src/components/PowerUpBadge.tsx` — badge effimero "POWER UP!"
- `frontend/src/components/ItemCard.tsx` — card oggetto condivisa (icona, nome, stat, rarità, valore)
- `frontend/src/components/ComparisonRow.tsx` — riga "candidato" con delta CP e azione Equip
- `frontend/src/components/EquipPanel.tsx` — pannello slot-card espandibili + picker
- `frontend/src/components/MyHero.tsx` — modify — usare EquipPanel + `previewBonuses` per anteprima viva
- `frontend/src/components/Inventory.tsx` — modify — redesign zaino premium

**Single-responsibility:** ogni componente ha una sola responsabilità. `MyHero` orchestra header + sub-tabs e tiene lo stato di preview; `EquipPanel` gestisce slot e picker; `Inventory` orchestra lista + multi-select + sticky bar. Funzioni pure isolate in `utils/stats.ts`.

---

## Task Sequence

Lavori indipendenti raggruppati prima (1–5 = foundations parallelizzabili dopo task 1). Da task 6 in poi i componenti consumano le foundations.

---

### Task 1: Backend — esporre `SELL_PRICES` e aggiungere `sellValue` al payload `getInventory()`

**Files:**
- Modify: `backend/src/services/itemService.ts`
- Modify: `backend/src/routes/items.ts` (nessun cambio in questa task — solo conferma che il payload resta retrocompatibile)
- Modify: `backend/src/services/itemService.test.ts` (la creiamo qui se non esiste)

**Rationale:** Il client oggi non conosce il prezzo di vendita prima di vendere. Aggiungiamo il campo al payload come unica fonte di verità. La tabella prezzi è già hardcoded in `sellItem()` — la promuoviamo a `const` esportata per riusarla in `sellBulk` (task 2).

- [ ] **Step 1: Creare il file di test (se non esiste già) con uno scaffold minimo**

Se `backend/src/services/itemService.test.ts` non esiste, crearlo:

```ts
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
```

- [ ] **Step 2: Run test — deve fallire (import inesistente)**

Run dalla root: `cd backend && npm test -- itemService`
Expected: FAIL con "SELL_PRICES" not exported / undefined.

- [ ] **Step 3: Promuovere `sellPrices` a constant esportato + esportare il tipo Rarity-string**

Modificare `backend/src/services/itemService.ts`, in cima al file (dopo gli import, prima di `giveItem`):

```ts
export const SELL_PRICES: Record<string, number> = {
  comune: 5,
  non_comune: 15,
  raro: 40,
  molto_raro: 100,
  epico: 250,
  leggendario: 600,
  mitico: 1500,
  master: 3000,
};
```

Poi nella funzione `sellItem`, rimuovere la const locale `sellPrices` (riga `const sellPrices: Record<string, number> = {...}`) e usare `SELL_PRICES[item.rarity]` al posto di `sellPrices[item.rarity]`.

- [ ] **Step 4: Aggiornare l'interfaccia `InventoryItem` con `sellValue`**

In `backend/src/services/itemService.ts` modificare l'interfaccia:

```ts
export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  slot: string;
  rarity: string;
  statBonuses: Record<string, number>;
  quantity: number;
  equippedOn: string | null;
  allowedClasses?: string[];
  sellValue: number; // gold per pezzo (rispetta la rarità)
}
```

- [ ] **Step 5: Popolare `sellValue` in `getInventory()`**

Modificare il `.map()` dentro `getInventory()`:

```ts
return result.rows.map(row => {
  const def = ITEM_MAP.get(row.item_id);
  return {
    id: row.id,
    itemId: row.item_id,
    name: row.name,
    description: row.description,
    slot: row.slot,
    rarity: row.rarity,
    statBonuses: row.stat_bonuses || {},
    quantity: row.quantity,
    equippedOn: row.equipped_on,
    allowedClasses: def?.allowedClasses || undefined,
    sellValue: SELL_PRICES[row.rarity] ?? 5,
  };
});
```

- [ ] **Step 6: Aggiungere test per `sellValue` nel payload (con DB)**

Aggiungere in `backend/src/services/itemService.test.ts`:

```ts
import { getInventory, giveItem } from './itemService';

// (questo test richiede DB attivo — saltare in CI senza DB)
describe.skipIf(!process.env.DATABASE_URL)('getInventory().sellValue', () => {
  it('includes sellValue matching rarity tier', async () => {
    const userId = 'test-user-' + Date.now();
    // assumiamo che esista un item 'spada_comune_1' di rarità 'comune'
    await giveItem(userId, 'spada_comune_1', 1);
    const inv = await getInventory(userId);
    const item = inv.find(i => i.itemId === 'spada_comune_1');
    expect(item?.sellValue).toBe(5);
  });
});
```

Se non esiste un item con quel ID, sostituire con un itemId valido da `backend/src/data/items.ts` (cercare uno comune). Lo test di `SELL_PRICES` è il principale; quello DB è opzionale.

- [ ] **Step 7: Run test — `SELL_PRICES` test deve passare**

Run: `cd backend && npm test -- itemService`
Expected: PASS per il test su `SELL_PRICES`. Il test DB-gated può essere skipped se manca `DATABASE_URL`.

- [ ] **Step 8: Typecheck**

Run: `cd backend && npm run typecheck`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add backend/src/services/itemService.ts backend/src/services/itemService.test.ts
git commit -m "feat(items): export SELL_PRICES + add sellValue to inventory payload"
```

---

### Task 2: Backend — endpoint `POST /items/sell-bulk` (transazionale)

**Files:**
- Modify: `backend/src/services/itemService.ts` (aggiungere `sellBulk()`)
- Modify: `backend/src/routes/items.ts` (aggiungere route)
- Modify: `backend/src/services/itemService.test.ts` (test sellBulk)

- [ ] **Step 1: Scrivere il test fallente per `sellBulk` (logica di skip)**

Aggiungere in `backend/src/services/itemService.test.ts`:

```ts
import { sellBulk } from './itemService';

describe('sellBulk()', () => {
  it('returns { soldCount: 0, gold: 0, skipped: [] } for empty input', async () => {
    const result = await sellBulk('any-user-id', []);
    expect(result.soldCount).toBe(0);
    expect(result.gold).toBe(0);
    expect(result.skipped).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test — deve fallire (sellBulk non esiste)**

Run: `cd backend && npm test -- itemService`
Expected: FAIL con "sellBulk is not a function" / import error.

- [ ] **Step 3: Implementare `sellBulk()` in `itemService.ts`**

In `backend/src/services/itemService.ts`, in fondo al file:

```ts
export interface BulkSellResult {
  soldCount: number;
  gold: number;
  skipped: { inventoryId: string; reason: 'equipped' | 'not_found' | 'already_sold' }[];
}

/**
 * Vende in batch più oggetti. Transazionale: salta gli equipaggiati e quelli già venduti,
 * accredita gold solo per quelli effettivamente eliminati.
 */
export async function sellBulk(
  userId: string,
  inventoryIds: string[]
): Promise<BulkSellResult> {
  if (inventoryIds.length === 0) {
    return { soldCount: 0, gold: 0, skipped: [] };
  }

  return withTransaction(async (client) => {
    // Lock + select gli inventory item richiesti che appartengono all'utente e non sono equipaggiati
    const selectable = await client.query(
      `SELECT i.id, i.quantity, d.rarity
       FROM inventory i
       JOIN item_definitions d ON d.id = i.item_id
       WHERE i.id = ANY($1::uuid[]) AND i.user_id = $2 AND i.equipped_on IS NULL
       FOR UPDATE OF i`,
      [inventoryIds, userId]
    );

    const found = new Set(selectable.rows.map((r: any) => r.id));
    const skipped: BulkSellResult['skipped'] = [];

    // Determina chi è stato saltato e perché (per i mancanti, scopri se equipaggiato o assente)
    const missingIds = inventoryIds.filter(id => !found.has(id));
    if (missingIds.length > 0) {
      const reasonRows = await client.query(
        `SELECT id, equipped_on FROM inventory WHERE id = ANY($1::uuid[]) AND user_id = $2`,
        [missingIds, userId]
      );
      const reasonMap = new Map<string, string | null>(
        reasonRows.rows.map((r: any) => [r.id, r.equipped_on])
      );
      for (const id of missingIds) {
        if (!reasonMap.has(id)) {
          skipped.push({ inventoryId: id, reason: 'not_found' });
        } else if (reasonMap.get(id)) {
          skipped.push({ inventoryId: id, reason: 'equipped' });
        } else {
          skipped.push({ inventoryId: id, reason: 'already_sold' });
        }
      }
    }

    if (selectable.rows.length === 0) {
      return { soldCount: 0, gold: 0, skipped };
    }

    // Calcola gold totale (prezzo per rarità × quantity)
    let totalGold = 0;
    let totalCount = 0;
    for (const row of selectable.rows) {
      const price = SELL_PRICES[row.rarity] ?? 5;
      totalGold += price * row.quantity;
      totalCount += 1; // contiamo stack, non singoli pezzi
    }

    // Delete atomico — solo quello che era ancora presente
    const deleted = await client.query(
      `DELETE FROM inventory
       WHERE id = ANY($1::uuid[]) AND user_id = $2 AND equipped_on IS NULL
       RETURNING id`,
      [selectable.rows.map((r: any) => r.id), userId]
    );

    if (deleted.rows.length !== selectable.rows.length) {
      // race: qualcuno ha venduto/equipaggiato tra SELECT e DELETE. Non capita con FOR UPDATE,
      // ma in caso, throw per rollback.
      throw new Error('sellBulk race detected — rolling back');
    }

    await client.query(
      'UPDATE users SET gold = gold + $1, updated_at = NOW() WHERE twitch_user_id = $2',
      [totalGold, userId]
    );

    return { soldCount: totalCount, gold: totalGold, skipped };
  });
}
```

- [ ] **Step 4: Run test — empty input deve passare**

Run: `cd backend && npm test -- itemService`
Expected: PASS per "returns { soldCount: 0, gold: 0, skipped: [] } for empty input".

- [ ] **Step 5: Aggiungere test "skipped" con id falsi (no DB richiesto perché l'array è vuoto in DB)**

Aggiungere in `itemService.test.ts`:

```ts
describe.skipIf(!process.env.DATABASE_URL)('sellBulk() with non-existent ids', () => {
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
```

- [ ] **Step 6: Run test**

Run: `cd backend && npm test -- itemService`
Expected: PASS (DB test skipped se manca DATABASE_URL).

- [ ] **Step 7: Aggiungere la route in `backend/src/routes/items.ts`**

Aggiungere dopo la route `/sell` esistente, prima di `/equipped/:heroId`:

```ts
// POST /api/items/sell-bulk - Vendita multipla in transazione
itemRoutes.post('/sell-bulk', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const { inventoryIds } = req.body;

    if (!Array.isArray(inventoryIds)) {
      return res.status(400).json({ error: 'inventoryIds (array) richiesto' });
    }
    if (inventoryIds.length > 200) {
      return res.status(400).json({ error: 'Massimo 200 oggetti per richiesta' });
    }

    const result = await itemService.sellBulk(userId, inventoryIds);
    res.json(result);
  } catch (err) {
    console.error('Errore POST /sell-bulk:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});
```

- [ ] **Step 8: Typecheck**

Run: `cd backend && npm run typecheck`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add backend/src/services/itemService.ts backend/src/services/itemService.test.ts backend/src/routes/items.ts
git commit -m "feat(items): POST /items/sell-bulk transactional bulk sell endpoint"
```

---

### Task 3: Frontend — setup vitest minimo

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/vitest.config.ts`

**Rationale:** Le funzioni pure che estraggo nei task 4–5 devono essere testate. Il frontend oggi non ha test runner. Aggiungo vitest minimale (NIENTE jsdom — solo logica pura). Test di UI/integrazione sono fuori scope, come dichiarato nello spec.

- [ ] **Step 1: Aggiungere vitest in `frontend/package.json`**

Modificare `frontend/package.json` aggiungendo lo script `test` e la dev dependency:

```json
{
  "name": "twitch-heroes-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.2",
    "vite": "^5.0.8",
    "vitest": "^4.1.7"
  }
}
```

- [ ] **Step 2: Creare `frontend/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // funzioni pure, no DOM
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});
```

- [ ] **Step 3: Installare vitest**

Run: `cd frontend && npm install`
Expected: `vitest` installato, nessun errore.

- [ ] **Step 4: Verificare smoke test (creare un test "vivo" temporaneo)**

Creare `frontend/src/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run test**

Run: `cd frontend && npm test`
Expected: PASS (1 test, 1 file).

- [ ] **Step 6: Rimuovere il sanity test**

```bash
rm frontend/src/sanity.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vitest.config.ts
git commit -m "chore(frontend): add vitest for pure-function unit tests"
```

---

### Task 4: Frontend — estrarre constants `STAT_LABELS`/`STAT_MAX`/`STAT_ICONS`

**Files:**
- Create: `frontend/src/constants/stats.ts`
- Modify: `frontend/src/components/MyHero.tsx` (rimuovere duplicati locali)
- Modify: `frontend/src/components/Inventory.tsx` (rimuovere duplicati locali)

**Rationale:** Stessi `STAT_LABELS` ridefiniti in MyHero (riga 37) e Inventory (riga 57). Estrarli per coerenza.

- [ ] **Step 1: Creare `frontend/src/constants/stats.ts`**

```ts
export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  atk: 'ATK',
  def: 'DEF',
  spd: 'SPD',
  crit: 'CRIT',
  critDmg: 'C.DMG',
};

// Soft cap per normalizzare le barre stat (visual reference, non gameplay)
export const STAT_MAX: Record<string, number> = {
  atk: 600,
  def: 500,
  hp: 6000,
  spd: 350,
  crit: 100,
  critDmg: 300,
};

export const STAT_ICONS: Record<string, string> = {
  atk: '⚔️',
  def: '🛡️',
  hp: '❤️',
  spd: '⚡',
  crit: '🎯',
  critDmg: '💥',
};

export const STAT_KEYS = ['atk', 'def', 'hp', 'spd', 'crit', 'critDmg'] as const;
export type StatKey = typeof STAT_KEYS[number];
```

- [ ] **Step 2: Rimuovere il duplicato in `MyHero.tsx`**

In `frontend/src/components/MyHero.tsx`:

Rimuovere righe 36–47 (i tre `const STAT_LABELS`, `STAT_MAX`, `STAT_ICONS`).

Aggiungere subito dopo gli import esistenti (dopo riga 9):

```ts
import { STAT_LABELS, STAT_MAX, STAT_ICONS } from '../constants/stats';
```

- [ ] **Step 3: Rimuovere il duplicato in `Inventory.tsx`**

In `frontend/src/components/Inventory.tsx`:

Rimuovere righe 56–58 (`const STAT_LABELS: Record<string, string> = { hp: 'HP', ... };`).

Aggiungere dopo gli import esistenti (dopo riga 4):

```ts
import { STAT_LABELS } from '../constants/stats';
```

- [ ] **Step 4: Verificare build frontend (typecheck via build)**

Run: `cd frontend && npm run build`
Expected: PASS (compila senza errori).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/constants/stats.ts frontend/src/components/MyHero.tsx frontend/src/components/Inventory.tsx
git commit -m "refactor(frontend): extract shared stat constants"
```

---

### Task 5: Frontend — estrarre `computeCP` + helper di confronto in `utils/stats.ts`

**Files:**
- Modify: `frontend/src/utils/stats.ts`
- Create: `frontend/src/utils/stats.test.ts`
- Modify: `frontend/src/components/MyHero.tsx` (sostituire `calculateCP` inline con `computeCP`)

- [ ] **Step 1: Scrivere il test fallente per `computeCP`, `itemSellValue`, `isStrictlyBetter`, `canSellItem`**

Creare `frontend/src/utils/stats.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeCP, itemSellValue, isStrictlyBetter, canSellItem } from './stats';
import type { Hero } from '../types';

const baseStats = { hp: 1000, atk: 100, def: 80, spd: 50, crit: 10, critDmg: 150 };

describe('computeCP', () => {
  it('returns 0 for null/undefined hero stats', () => {
    expect(computeCP(null as any, {})).toBe(0);
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
    expect(itemSellValue({ sellValue: 40 } as any)).toBe(40);
  });
  it('multiplies by quantity for stacks', () => {
    expect(itemSellValue({ sellValue: 5, quantity: 3 } as any)).toBe(15);
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
    expect(canSellItem({ equippedOn: 'hero-1' } as any)).toBe(false);
  });
  it('true if item is not equipped', () => {
    expect(canSellItem({ equippedOn: null } as any)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — deve fallire (funzioni inesistenti)**

Run: `cd frontend && npm test -- stats`
Expected: FAIL con "computeCP is not exported" / similar.

- [ ] **Step 3: Implementare le funzioni in `frontend/src/utils/stats.ts`**

Sostituire il contenuto di `frontend/src/utils/stats.ts` con:

```ts
import { Hero, HeroStats } from '../types';
import { CLASS_MODIFIERS } from '../constants/balance';
import type { InventoryItem } from '../services/api';

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
 * Stessa formula usata in MyHero (è stata estratta qui per riusarla nell'anteprima viva).
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
 * Se equipped è null/undefined, qualsiasi candidato è migliore.
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
```

- [ ] **Step 4: Run test — deve passare**

Run: `cd frontend && npm test -- stats`
Expected: PASS (tutti i test).

- [ ] **Step 5: Aggiornare `MyHero.tsx` per usare `computeCP`**

In `frontend/src/components/MyHero.tsx`:

Aggiungere import (insieme a `getEffectiveStats`):

```ts
import { getEffectiveStats, computeCP } from '../utils/stats';
```

Rimuovere la funzione locale `calculateCP` (righe 97–108 circa) e sostituire la riga `const combatPower = calculateCP();` con:

```ts
const combatPower = computeCP(effectiveStats, equipBonuses);
```

- [ ] **Step 6: Aggiungere `sellValue` al tipo client `InventoryItem`**

In `frontend/src/services/api.ts`, modificare l'interfaccia `InventoryItem`:

```ts
export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  slot: string;
  rarity: string;
  statBonuses: Record<string, number>;
  quantity: number;
  equippedOn: string | null;
  allowedClasses?: string[];
  sellValue: number; // gold per pezzo dal backend
}
```

- [ ] **Step 7: Verificare build**

Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/utils/stats.ts frontend/src/utils/stats.test.ts frontend/src/components/MyHero.tsx frontend/src/services/api.ts
git commit -m "feat(frontend): extract computeCP + comparison helpers in utils/stats"
```

---

### Task 6: Frontend — API client `sellBulk()`

**Files:**
- Modify: `frontend/src/services/api.ts`

- [ ] **Step 1: Aggiungere tipo e funzione client**

In `frontend/src/services/api.ts`, dopo `sellItem()`:

```ts
export interface BulkSellResult {
  soldCount: number;
  gold: number;
  skipped: { inventoryId: string; reason: 'equipped' | 'not_found' | 'already_sold' }[];
}

export async function sellBulk(inventoryIds: string[]): Promise<BulkSellResult> {
  return request('/items/sell-bulk', {
    method: 'POST',
    body: JSON.stringify({ inventoryIds }),
  });
}
```

- [ ] **Step 2: Verificare build**

Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/api.ts
git commit -m "feat(frontend): add sellBulk API client"
```

---

### Task 7: Frontend — `CountUp` component (tween numerico)

**Files:**
- Create: `frontend/src/components/CountUp.tsx`

**Rationale:** Anima il CP da `from` a `to` in ~600ms. Usato dall'header eroe per il count-up dopo equip e per il totale "+Ng" nella sticky sell bar.

- [ ] **Step 1: Creare `frontend/src/components/CountUp.tsx`**

```tsx
import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  to: number;
  duration?: number; // ms
  format?: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Anima un numero da quello attualmente visualizzato fino a `to` in `duration` ms (easeOut).
 * Riusa `requestAnimationFrame`. Nessuna libreria esterna.
 */
export function CountUp({ to, duration = 600, format, className, style }: CountUpProps) {
  const [value, setValue] = useState(to);
  const fromRef = useRef(to);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (to === fromRef.current) return;
    const start = performance.now();
    const from = fromRef.current;
    const delta = to - from;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + delta * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [to, duration]);

  const display = format ? format(value) : value.toLocaleString();
  return <span className={className} style={style}>{display}</span>;
}
```

- [ ] **Step 2: Verificare build**

Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/CountUp.tsx
git commit -m "feat(frontend): add CountUp tween component"
```

---

### Task 8: Frontend — `PowerUpBadge` component

**Files:**
- Create: `frontend/src/components/PowerUpBadge.tsx`
- Modify: `frontend/src/premium.css` (keyframe)

- [ ] **Step 1: Aggiungere keyframe `powerUpPop` in `premium.css`**

In `frontend/src/premium.css`, in fondo al file:

```css
/* === POWER UP badge (transient, dopo equip) === */
.power-up-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  background: linear-gradient(180deg, #ffd700, #ff8a00);
  color: #1a1a1a;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1px;
  border-radius: 999px;
  white-space: nowrap;
  text-shadow: 0 1px 0 rgba(255,255,255,0.4);
  box-shadow: 0 4px 14px rgba(255,180,0,0.55);
  animation: powerUpPop 1.4s ease-out forwards;
  z-index: 50;
  pointer-events: none;
}
@keyframes powerUpPop {
  0%   { opacity: 0; transform: translate(-50%, 6px) scale(0.7); }
  20%  { opacity: 1; transform: translate(-50%, -14px) scale(1.15); }
  35%  { transform: translate(-50%, -14px) scale(1.0); }
  85%  { opacity: 1; transform: translate(-50%, -22px) scale(1.0); }
  100% { opacity: 0; transform: translate(-50%, -34px) scale(0.95); }
}
```

- [ ] **Step 2: Creare `frontend/src/components/PowerUpBadge.tsx`**

```tsx
import React, { useEffect, useState } from 'react';

interface PowerUpBadgeProps {
  /** Numero che cambia: ogni cambio mostra il badge per ~1.4s */
  triggerKey: number;
  label?: string;
}

/**
 * Mostra "POWER UP!" sopra l'elemento padre (deve essere `position: relative`)
 * quando `triggerKey` cambia. Auto-dismiss dopo l'animazione.
 */
export function PowerUpBadge({ triggerKey, label = 'POWER UP!' }: PowerUpBadgeProps) {
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (triggerKey === 0) return; // no trigger yet
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
```

- [ ] **Step 3: Verificare build**

Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/PowerUpBadge.tsx frontend/src/premium.css
git commit -m "feat(frontend): add PowerUpBadge with powerUpPop keyframe"
```

---

### Task 9: Frontend — `ItemCard` component condiviso

**Files:**
- Create: `frontend/src/components/ItemCard.tsx`

**Rationale:** Look coerente per oggetto in zaino e in picker. Una sola fonte per icona/nome/rarità/stat/value. Riuso `getItemIcon` (oggi inline in Inventory) → lo manteniamo lì, oppure lo estraiamo in `utils/itemIcon.ts`. Per minimizzare i cambi, lo estraiamo.

- [ ] **Step 1: Estrarre `getItemIcon` in `frontend/src/utils/itemIcon.ts`**

Creare `frontend/src/utils/itemIcon.ts` con il contenuto della funzione `getItemIcon` attualmente in `Inventory.tsx` (righe 18–54):

```ts
const SLOT_ICONS: Record<string, string> = {
  arma: '⚔️',
  armatura: '🛡️',
  accessorio: '💍',
};

export function getItemIcon(name: string, slot: string): string {
  const n = name.toLowerCase();
  // Armi
  if (n.includes('spada') || n.includes('lama')) return '🗡️';
  if (n.includes('arco') || n.includes('balestra')) return '🏹';
  if (n.includes('bastone') || n.includes('scettro') || n.includes('tomo') || n.includes('sfera')) return '🪄';
  if (n.includes('pugnale') || n.includes('falcetto')) return '🔪';
  if (n.includes('martello') || n.includes('mazza')) return '🔨';
  if (n.includes('ascia')) return '🪓';
  if (n.includes('lancia') || n.includes('tridente')) return '🔱';
  if (n.includes('frusta')) return '⛓️';
  if (n.includes('katana')) return '⚔️';
  if (n.includes('falce')) return '💀';
  if (n.includes('arpa')) return '🎵';
  // Armature
  if (n.includes('corazza') || n.includes('armatura') || n.includes('piastre') || n.includes('egida')) return '🛡️';
  if (n.includes('veste') || n.includes('tunica') || n.includes('manto') || n.includes('toga')) return '👘';
  if (n.includes('cotta') || n.includes('brigantina')) return '🧥';
  if (n.includes('elmo') || n.includes('corona')) return '👑';
  if (n.includes('mantello')) return '🧣';
  if (n.includes('pelle') || n.includes('gilet')) return '🦺';
  // Accessori
  if (n.includes('anello')) return '💍';
  if (n.includes('amuleto') || n.includes('talismano') || n.includes('ciondolo') || n.includes('pendente') || n.includes('sigillo')) return '📿';
  if (n.includes('stivali') || n.includes('calzari')) return '👢';
  if (n.includes('occhio') || n.includes('sfera') || n.includes('gemma') || n.includes('frammento')) return '🔮';
  if (n.includes('cintura')) return '🎗️';
  if (n.includes('guanti')) return '🧤';
  if (n.includes('ali')) return '🪽';
  if (n.includes('teschio')) return '💀';
  if (n.includes('cuore')) return '❤️';
  if (n.includes('occhiali')) return '👓';
  if (n.includes('orecchino')) return '✨';
  if (n.includes('fascia') || n.includes('bracciale')) return '💪';
  return SLOT_ICONS[slot] || '📦';
}
```

- [ ] **Step 2: Aggiornare `Inventory.tsx` per importare `getItemIcon`**

In `frontend/src/components/Inventory.tsx`:

Rimuovere la funzione locale `getItemIcon` (righe 18–54) e l'oggetto `SLOT_ICONS` locale (12–16).

Aggiungere agli import:

```ts
import { getItemIcon } from '../utils/itemIcon';
```

Mantenere `SLOT_LABELS` locale (è usato solo qui).

**Nota:** `SLOT_ICONS` resta usato da `Inventory.tsx` riga 352 (`SLOT_ICONS[item.slot]`). Esportarlo da `utils/itemIcon.ts` aggiungendo `export` a `SLOT_ICONS`. Modificare `Inventory.tsx` per importare anche `SLOT_ICONS`:

```ts
import { getItemIcon, SLOT_ICONS } from '../utils/itemIcon';
```

E in `utils/itemIcon.ts`, cambiare la prima riga in:

```ts
export const SLOT_ICONS: Record<string, string> = {
```

- [ ] **Step 3: Creare `frontend/src/components/ItemCard.tsx`**

```tsx
import React from 'react';
import { InventoryItem } from '../services/api';
import { RARITY_COLORS, RARITY_LABELS } from '../types';
import { STAT_LABELS } from '../constants/stats';
import { getItemIcon } from '../utils/itemIcon';

interface ItemCardProps {
  item: InventoryItem;
  /** Mostra il valore in g (in basso a destra) */
  showSellValue?: boolean;
  /** Mostra il badge NEW (consumer decide quando) */
  isNew?: boolean;
  /** Bordo selezione (multi-select) */
  selected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Right side slot custom (override del valore) — es. checkbox o badge */
  right?: React.ReactNode;
}

/**
 * Card oggetto condivisa tra Zaino, picker EquipPanel, dettaglio.
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
          <div style={{ color: '#ffd700', fontWeight: 700 }}>{item.sellValue}g</div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Aggiungere CSS per glow rarità in `premium.css`**

In fondo a `frontend/src/premium.css`:

```css
/* === Item card glow per alta rarità === */
.item-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
.item-card:hover { transform: translateY(-1px); }
.item-card--shimmer {
  background:
    linear-gradient(180deg, #18181b, #18181b) padding-box,
    linear-gradient(120deg,
      rgba(255,215,0,0.0) 0%,
      rgba(255,215,0,0.18) 35%,
      rgba(255,215,0,0.0) 70%) border-box;
  border-color: transparent !important;
  box-shadow: 0 0 12px rgba(255,180,0,0.15);
}
```

- [ ] **Step 5: Verificare build**

Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/utils/itemIcon.ts frontend/src/components/ItemCard.tsx frontend/src/components/Inventory.tsx frontend/src/premium.css
git commit -m "feat(frontend): shared ItemCard component + extract item icon helper"
```

---

### Task 10: Frontend — `ComparisonRow` (riga candidato con delta CP)

**Files:**
- Create: `frontend/src/components/ComparisonRow.tsx`

**Rationale:** Riga compatta che il picker mostra per ogni candidato. Mostra: icona, nome (colore rarità), stat, delta CP (↑ +120 verde / ↓ −40 rosso), bottoni Equip + Vendi.

- [ ] **Step 1: Creare `frontend/src/components/ComparisonRow.tsx`**

```tsx
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
  /** Conferma equip */
  onEquip: () => void;
  /** Vendita rapida (può essere undefined se l'item è equipaggiato altrove e non vendibile) */
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
        <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: rarityColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
```

- [ ] **Step 2: Verificare build**

Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ComparisonRow.tsx
git commit -m "feat(frontend): ComparisonRow component with delta CP preview"
```

---

### Task 11: Frontend — `EquipPanel` (slot-card + picker espandibili)

**Files:**
- Create: `frontend/src/components/EquipPanel.tsx`

- [ ] **Step 1: Creare `frontend/src/components/EquipPanel.tsx`**

```tsx
import React, { useMemo, useState } from 'react';
import { Hero, RARITY_COLORS } from '../types';
import { InventoryItem } from '../services/api';
import { STAT_LABELS } from '../constants/stats';
import { computeCP, isStrictlyBetter } from '../utils/stats';
import { ComparisonRow } from './ComparisonRow';
import { getItemIcon } from '../utils/itemIcon';

const SLOTS = ['arma', 'armatura', 'accessorio'] as const;
type Slot = typeof SLOTS[number];

const SLOT_ICONS: Record<Slot, string> = {
  arma: '⚔️',
  armatura: '🛡️',
  accessorio: '💍',
};

const SLOT_LABELS: Record<Slot, string> = {
  arma: 'Arma',
  armatura: 'Armatura',
  accessorio: 'Accessorio',
};

interface EquipPanelProps {
  hero: Hero;
  /** Tutti gli item dell'utente (zaino completo, equipaggiati inclusi) */
  inventory: InventoryItem[];
  /** Stat dell'eroe (effective), per calcolare delta CP nei candidati */
  effectiveStats: { hp: number; atk: number; def: number; spd: number; crit: number; critDmg: number };
  /** Bonus correnti dall'equip già equipaggiato su questo eroe */
  currentBonuses: Record<string, number>;
  /** Callback per impostare il "preview" sull'header eroe — passa i bonus simulati o null per resettare */
  onPreviewBonuses: (bonuses: Record<string, number> | null) => void;
  /** Esegui equip */
  onEquip: (inventoryId: string) => Promise<void>;
  /** Esegui unequip */
  onUnequip: (inventoryId: string) => Promise<void>;
  /** Esegui sell singolo */
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

  // Equipaggiati su questo eroe
  const equippedOnHero = useMemo(
    () => inventory.filter(i => i.equippedOn === hero.id),
    [inventory, hero.id]
  );

  const equippedBySlot = (slot: Slot): InventoryItem | undefined =>
    equippedOnHero.find(i => i.slot === slot);

  const currentCP = computeCP(effectiveStats, currentBonuses);

  // Quando il picker è aperto per uno slot, l'utente vede candidati = item non equipaggiati di quello slot
  // + compatibili con la classe dell'eroe
  const candidatesForSlot = (slot: Slot): InventoryItem[] => {
    return inventory
      .filter(i => i.slot === slot && !i.equippedOn && canHeroEquip(hero, i))
      .sort((a, b) => {
        // ordina i candidati per delta CP discendente (più forte prima)
        const dA = computeDelta(a, slot);
        const dB = computeDelta(b, slot);
        return dB - dA;
      });
  };

  /** Delta CP che otterremmo equipaggiando candidate su questo slot */
  const computeDelta = (candidate: InventoryItem, slot: Slot): number => {
    const baseOtherSlots = sumBonusesExcluding(equippedOnHero, slot);
    const simulated = addBonuses(baseOtherSlots, candidate.statBonuses);
    return computeCP(effectiveStats, simulated) - currentCP;
  };

  /** "Migliore" candidato per uno slot (per nudge) */
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
        const best = bestCandidate(slot);
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
            {/* Slot header (cliccabile, toggle picker) */}
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
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#efeff1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {equipped.name}
                    </div>
                    <div style={{ fontSize: 9, color: eqRarityColor, textTransform: 'uppercase' }}>
                      {equipped.rarity}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: '#555' }}>
                    {SLOT_ICONS[slot]} Slot {SLOT_LABELS[slot]} vuoto — tocca per equipaggiare
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

            {/* Nudge "equipaggia il migliore" — visibile solo se collassato e c'è qualcosa di meglio */}
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

            {/* Picker espanso */}
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
                    Nessun {SLOT_LABELS[slot]} disponibile in zaino.
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
```

- [ ] **Step 2: Verificare build**

Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/EquipPanel.tsx
git commit -m "feat(frontend): EquipPanel with inline picker and live preview hooks"
```

---

### Task 12: Frontend — integrare `EquipPanel` in `MyHero` con anteprima viva

**Files:**
- Modify: `frontend/src/components/MyHero.tsx`

**Rationale:** L'header eroe (CP + stat bars) deve poter mostrare valori "fantasma" quando l'utente fa hover su un candidato. Si fa con uno state `previewBonuses` che, quando settato, override i `equipBonuses` nel calcolo CP e nelle barre stat.

- [ ] **Step 1: Aggiungere lo state `previewBonuses` e i wrapper API in `MyHero.tsx`**

In `frontend/src/components/MyHero.tsx`:

Subito dopo `const [equipBonuses, setEquipBonuses] = useState<Record<string, number>>({});` (riga ~56), aggiungere:

```ts
const [previewBonuses, setPreviewBonuses] = useState<Record<string, number> | null>(null);
const [equipTriggerKey, setEquipTriggerKey] = useState(0); // incrementato a ogni equip per badge POWER UP
```

Aggiungere import in cima al file:

```ts
import { EquipPanel } from './EquipPanel';
import { CountUp } from './CountUp';
import { PowerUpBadge } from './PowerUpBadge';
```

- [ ] **Step 2: Sostituire il calcolo CP con preview-aware**

Sostituire la riga `const combatPower = computeCP(effectiveStats, equipBonuses);` con:

```ts
const activeBonuses = previewBonuses ?? equipBonuses;
const combatPower = computeCP(effectiveStats, activeBonuses);
```

E nel rendering delle stat bars (riga ~163 del file), sostituire:

```tsx
{(['atk', 'def', 'hp', 'spd', 'crit', 'critDmg'] as const).map(stat => {
  const base = effectiveStats[stat];
  const bonus = equipBonuses[stat] || 0;
```

con (notare che usiamo `activeBonuses` per il bonus):

```tsx
{(['atk', 'def', 'hp', 'spd', 'crit', 'critDmg'] as const).map(stat => {
  const base = effectiveStats[stat];
  const bonus = activeBonuses[stat] || 0;
  const realBonus = equipBonuses[stat] || 0;
  const isPreviewing = previewBonuses !== null && bonus !== realBonus;
```

Modificare la riga del valore stat per visualizzare un colore differente in preview:

```tsx
<span className="jrpg-stat-value" style={isPreviewing ? { color: bonus > realBonus ? '#22c55e' : '#ef4444' } : undefined}>
  {display}
  {bonus > 0 && <span className="jrpg-stat-bonus">+{bonus}</span>}
</span>
```

- [ ] **Step 3: Sostituire la visualizzazione del CP con `CountUp` + `PowerUpBadge`**

Trovare il blocco JRPG che mostra `<strong className="jrpg-cp-value">{combatPower.toLocaleString()}</strong>` (riga ~147) e sostituire l'intero `jrpg-cp-line` con:

```tsx
<div className="jrpg-cp-line" style={{ position: 'relative' }}>
  <span className="jrpg-cp-label">COMBAT POWER</span>
  <CountUp
    to={combatPower}
    className="jrpg-cp-value"
    style={previewBonuses ? { color: combatPower >= computeCP(effectiveStats, equipBonuses) ? '#22c55e' : '#ef4444' } : undefined}
  />
  <span className="jrpg-cp-star">⭐</span>
  <PowerUpBadge triggerKey={equipTriggerKey} />
</div>
```

- [ ] **Step 4: Sostituire il contenuto della sub-tab 'equip' con `EquipPanel`**

Trovare il blocco `{subTab === 'equip' && (` (riga ~257) e sostituire l'intero block con:

```tsx
{subTab === 'equip' && (
  <div className="animate-fadeIn">
    <EquipPanel
      hero={hero}
      inventory={equipment.length === 0
        ? []
        : /* serve l'inventario completo, non solo gli equipaggiati — la prossima step lo carica */ equipment
      }
      effectiveStats={effectiveStats}
      currentBonuses={equipBonuses}
      onPreviewBonuses={setPreviewBonuses}
      onEquip={async (inventoryId) => {
        try {
          await api.equipItem(inventoryId, hero.id);
          setEquipTriggerKey(k => k + 1);
          await loadHeroDetails();
          onProfileRefresh?.();
        } catch (e) { console.error(e); }
      }}
      onUnequip={async (inventoryId) => {
        try {
          await api.unequipItem(inventoryId);
          await loadHeroDetails();
        } catch (e) { console.error(e); }
      }}
      onSell={async (inventoryId) => {
        try {
          await api.sellItem(inventoryId);
          await loadHeroDetails();
          onProfileRefresh?.();
        } catch (e) { console.error(e); }
      }}
    />
  </div>
)}
```

- [ ] **Step 5: Aggiornare `loadHeroDetails` per tenere l'inventario completo**

Cambiare il tipo dello state da `equipment` (solo equipaggiati) a `inventory` (completo). Sostituire:

```ts
const [equipment, setEquipment] = useState<any[]>([]);
```

con:

```ts
const [inventory, setInventory] = useState<InventoryItem[]>([]);
```

E aggiungere import in cima:

```ts
import type { InventoryItem } from '../services/api';
```

Aggiornare `loadHeroDetails`:

```ts
async function loadHeroDetails() {
  if (!hero) return;
  try {
    const [detailData, invData] = await Promise.all([
      api.getHeroDetail(hero.id),
      api.getInventory(),
    ]);
    setAbilities(detailData.abilities || []);
    setInventory(invData.inventory);
    const equipped = invData.inventory.filter(item => item.equippedOn === hero.id);
    const bonuses: Record<string, number> = {};
    for (const item of equipped) {
      if (item.statBonuses) {
        for (const [stat, val] of Object.entries(item.statBonuses)) {
          bonuses[stat] = (bonuses[stat] || 0) + (val as number);
        }
      }
    }
    setEquipBonuses(bonuses);
  } catch { /* ignore */ }
}
```

Aggiornare il props passato a EquipPanel (rimuovere il commento del workaround):

```tsx
<EquipPanel
  hero={hero}
  inventory={inventory}
  effectiveStats={effectiveStats}
  currentBonuses={equipBonuses}
  onPreviewBonuses={setPreviewBonuses}
  /* ... onEquip / onUnequip / onSell come prima */
/>
```

- [ ] **Step 6: Verificare build**

Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 7: Smoke test manuale**

Avviare il dev server:

```bash
cd backend && npm run dev   # (terminale 1)
cd frontend && npm run dev  # (terminale 2)
```

In browser, aprire il dev server frontend. Andare alla pagina Eroe → sub-tab Equip. Verificare:
- Le 3 slot-card si mostrano
- Tap su una si espande con i candidati
- Hover su un candidato fa cambiare il CP nell'header e colora le barre
- Mouse-leave resetta
- Equip aggiorna CP, mostra badge POWER UP, ricarica
- Unequip funziona
- Vendita rapida funziona

Se qualcosa non va, ANNOTARE in `docs/superpowers/specs/2026-05-27-equip-item-ux-design.md` (sezione "Issues found during impl") prima di proseguire.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/MyHero.tsx
git commit -m "feat(hero): interactive Equip sub-tab with live preview header"
```

---

### Task 13: Frontend — Zaino premium — header riepilogo + sort/filter

**Files:**
- Modify: `frontend/src/components/Inventory.tsx`

**Rationale:** Iniziamo con lo scheletro premium del nuovo zaino: header con conta oggetti + valore totale, controlli sort. La logica di multi-select arriva nel task 14.

- [ ] **Step 1: Aggiornare `Inventory.tsx` — header riepilogo e sort**

In `frontend/src/components/Inventory.tsx`:

Aggiungere agli import in cima:

```ts
import { ItemCard } from './ItemCard';
import { itemSellValue } from '../utils/stats';
```

Aggiungere uno state `sort` dopo `const [filter, setFilter] = useState<string>('');`:

```ts
const [sort, setSort] = useState<'rarity' | 'value'>('rarity');
```

Trovare la sezione che inizia con `// Lista inventario` e `return ( <div>` (verso fine file). Sostituire l'header `<div style={{ display: 'flex', justifyContent: 'space-between'...` con:

```tsx
{(() => {
  const totalValue = filteredInventory.reduce((sum, it) => sum + itemSellValue(it), 0);
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 8, padding: '8px 10px',
      background: 'linear-gradient(180deg, #2d2d35, #18181b)',
      borderRadius: 8, border: '1px solid #333',
    }}>
      <div>
        <div style={{ fontSize: 11, color: '#adadb8' }}>Zaino</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#efeff1' }}>
          {filteredInventory.length} oggetti
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 9, color: '#adadb8', textTransform: 'uppercase', letterSpacing: 1 }}>Valore totale</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#ffd700' }}>{totalValue.toLocaleString()}g</div>
      </div>
    </div>
  );
})()}
```

- [ ] **Step 2: Aggiungere controllo Sort sotto i filtri slot**

Subito dopo il blocco dei filtri slot (`['arma', 'armatura', 'accessorio'].map(...)`), prima del check `filteredInventory.length === 0`:

```tsx
<div style={{ display: 'flex', gap: 4, marginBottom: 8, alignItems: 'center' }}>
  <span style={{ fontSize: 9, color: '#adadb8', marginRight: 4 }}>Ordina:</span>
  <button
    className="btn btn-secondary"
    onClick={() => setSort('rarity')}
    style={{ fontSize: 9, padding: '3px 8px', background: sort === 'rarity' ? '#9147ff' : undefined, color: sort === 'rarity' ? '#fff' : undefined }}
  >Rarità</button>
  <button
    className="btn btn-secondary"
    onClick={() => setSort('value')}
    style={{ fontSize: 9, padding: '3px 8px', background: sort === 'value' ? '#9147ff' : undefined, color: sort === 'value' ? '#fff' : undefined }}
  >Valore</button>
</div>
```

- [ ] **Step 3: Applicare il sort a `filteredInventory`**

Trovare la `const filteredInventory =` (verso riga 144) e sostituirla con:

```ts
const RARITY_ORDER: Record<string, number> = {
  master: 8, mitico: 7, leggendario: 6, epico: 5,
  molto_raro: 4, raro: 3, non_comune: 2, comune: 1,
};

const filteredInventory = (filter
  ? inventory.filter(i => i.slot === filter)
  : [...inventory]
).sort((a, b) => {
  if (sort === 'value') return (b.sellValue * b.quantity) - (a.sellValue * a.quantity);
  return (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0);
});
```

- [ ] **Step 4: Sostituire le card oggetto con `ItemCard`**

Trovare il `filteredInventory.map(item => { ... })` (riga ~330) e sostituire l'intero JSX di ogni item con `<ItemCard>` (manteniamo per ora il click che apre il dettaglio):

```tsx
{filteredInventory.map(item => (
  <div key={item.id} style={{ marginBottom: 4 }}>
    <ItemCard
      item={item}
      showSellValue={!item.equippedOn}
      onClick={() => setSelectedItem(item)}
      right={item.equippedOn ? (
        <div style={{ color: '#9147ff', fontSize: 10 }}>
          {(() => {
            const h = allHeroes.find(h => h.id === item.equippedOn);
            return h ? `${h.displayName}` : 'Equipaggiato';
          })()}
        </div>
      ) : undefined}
    />
  </div>
))}
```

- [ ] **Step 5: Verificare build**

Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 6: Smoke test**

Avviare dev server (se non già attivo) e aprire la tab Zaino. Verificare:
- Header con conta oggetti + valore totale
- Bottoni Sort che riordinano la lista (rarità/valore)
- Le card mostrano valore in g a destra (per non equipaggiati)
- Click su una card apre il dettaglio come prima

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/Inventory.tsx
git commit -m "feat(inventory): premium header with total value + sort by rarity/value"
```

---

### Task 14: Frontend — Zaino: multi-select + sticky sell bar + bulk sell

**Files:**
- Modify: `frontend/src/components/Inventory.tsx`
- Modify: `frontend/src/premium.css`

- [ ] **Step 1: Aggiungere CSS per sticky sell bar in `premium.css`**

In fondo a `frontend/src/premium.css`:

```css
/* === Sticky sell bar (Zaino multi-select) === */
.sticky-sell-bar {
  position: sticky;
  bottom: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: linear-gradient(180deg, #2d2d35, #1a1a20);
  border: 1px solid #ffd700;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.5), 0 0 18px rgba(255,180,0,0.15);
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  animation: slideUp 0.25s ease-out;
  z-index: 20;
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
```

- [ ] **Step 2: Aggiungere modalità multi-select in `Inventory.tsx`**

Sotto gli altri state, aggiungere:

```ts
const [selectMode, setSelectMode] = useState(false);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [bulkBusy, setBulkBusy] = useState(false);
```

E gli handler:

```ts
function toggleSelect(id: string) {
  setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}

function exitSelectMode() {
  setSelectMode(false);
  setSelectedIds(new Set());
}

async function handleBulkSell() {
  if (selectedIds.size === 0) return;
  setBulkBusy(true);
  try {
    const ids = Array.from(selectedIds);
    const result = await api.sellBulk(ids);
    await loadData();
    setMessage({
      text: `Venduti ${result.soldCount} oggetti per ${result.gold}g${result.skipped.length ? ` (${result.skipped.length} saltati)` : ''}`,
      type: 'success',
    });
    exitSelectMode();
  } catch (err: any) {
    setMessage({ text: err.message, type: 'error' });
  } finally {
    setBulkBusy(false);
  }
}
```

- [ ] **Step 3: Aggiungere bottone "Seleziona" nell'header**

Modificare l'header del riepilogo aggiungendo a destra (sotto il valore totale) un bottone toggle:

Subito dopo il `<div>{totalValue}g</div>` block, aggiungere ancora dentro il `<div style={{ textAlign: 'right' }}>`:

```tsx
<button
  className="btn btn-secondary"
  onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
  style={{ fontSize: 9, padding: '3px 8px', marginTop: 4 }}
>
  {selectMode ? 'Annulla' : 'Seleziona'}
</button>
```

- [ ] **Step 4: Modificare il rendering delle card per supportare la selezione**

Sostituire il blocco `filteredInventory.map(item => ...)` (introdotto nel task 13) con:

```tsx
{filteredInventory.map(item => {
  const isSelected = selectedIds.has(item.id);
  const isSellable = !item.equippedOn;
  return (
    <div key={item.id} style={{ marginBottom: 4 }}>
      <ItemCard
        item={item}
        showSellValue={isSellable}
        selected={selectMode && isSelected}
        onClick={() => {
          if (selectMode) {
            if (!isSellable) return; // gli equipaggiati restano protetti
            toggleSelect(item.id);
          } else {
            setSelectedItem(item);
          }
        }}
        right={selectMode ? (
          <div style={{
            width: 20, height: 20, borderRadius: 4,
            background: isSelected ? '#22c55e' : '#0e0e10',
            color: isSelected ? '#0a0a0a' : '#555',
            border: '1px solid #444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 12,
            opacity: isSellable ? 1 : 0.4,
          }}>
            {isSelected ? '✓' : ''}
          </div>
        ) : (item.equippedOn ? (
          <div style={{ color: '#9147ff', fontSize: 10 }}>
            {(() => {
              const h = allHeroes.find(h => h.id === item.equippedOn);
              return h ? `${h.displayName}` : 'Equipaggiato';
            })()}
          </div>
        ) : undefined)}
      />
    </div>
  );
})}
```

- [ ] **Step 5: Aggiungere la sticky sell bar in fondo alla lista**

Subito dopo la chiusura del `filteredInventory.map`, prima del toast `{message && ...}`:

```tsx
{selectMode && selectedIds.size > 0 && (
  <div className="sticky-sell-bar">
    <div>
      <div style={{ fontSize: 10, color: '#adadb8' }}>{selectedIds.size} selezionati</div>
      <div style={{ fontSize: 16, fontWeight: 900, color: '#ffd700' }}>
        +{Array.from(selectedIds)
          .map(id => inventory.find(i => i.id === id))
          .filter(Boolean)
          .reduce((sum, it) => sum + itemSellValue(it!), 0).toLocaleString()}g
      </div>
    </div>
    <button
      onClick={handleBulkSell}
      disabled={bulkBusy}
      className="btn btn-primary"
      style={{ fontSize: 12, padding: '8px 16px' }}
    >
      💰 Vendi
    </button>
  </div>
)}
```

- [ ] **Step 6: Verificare build**

Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 7: Smoke test**

Nel browser, andare allo Zaino:
- Clic su "Seleziona" → modalità multi-select attiva
- Tap su oggetti non equipaggiati → checkbox verde, sticky bar appare in basso
- Sticky bar mostra conta e totale in g
- Clic "💰 Vendi" → chiamata backend, oggetti scompaiono, toast con risultato
- Equipaggiati non selezionabili (opacità ridotta, click ignorato)
- "Annulla" esce dalla modalità

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/Inventory.tsx frontend/src/premium.css
git commit -m "feat(inventory): multi-select + sticky sell bar + bulk sell"
```

---

### Task 15: Frontend — Quick-sell "comuni non equipaggiati" + badge NEW

**Files:**
- Modify: `frontend/src/components/Inventory.tsx`

**Rationale:** Quick-sell intelligente: un tap vende tutti i `comune` non equipaggiati. Badge NEW per gli oggetti non visti — la tracciatura "visti" è locale (localStorage) per evitare migration backend.

- [ ] **Step 1: Aggiungere il bottone quick-sell e l'handler**

In `Inventory.tsx`, sotto `handleBulkSell`:

```ts
async function handleQuickSellCommons() {
  const commonsUnequipped = inventory.filter(i => i.rarity === 'comune' && !i.equippedOn);
  if (commonsUnequipped.length === 0) {
    setMessage({ text: 'Nessun oggetto comune da vendere', type: 'success' });
    return;
  }
  const totalEstimate = commonsUnequipped.reduce((s, it) => s + itemSellValue(it), 0);
  if (!confirm(`Vendere ${commonsUnequipped.length} oggetti comuni per ~${totalEstimate}g?`)) return;
  setBulkBusy(true);
  try {
    const result = await api.sellBulk(commonsUnequipped.map(i => i.id));
    await loadData();
    setMessage({
      text: `Venduti ${result.soldCount} comuni per ${result.gold}g`,
      type: 'success',
    });
  } catch (err: any) {
    setMessage({ text: err.message, type: 'error' });
  } finally {
    setBulkBusy(false);
  }
}
```

Aggiungere il bottone subito sotto il blocco Sort (dopo i bottoni Rarità/Valore):

```tsx
{(() => {
  const commons = inventory.filter(i => i.rarity === 'comune' && !i.equippedOn);
  if (commons.length === 0) return null;
  const total = commons.reduce((s, it) => s + itemSellValue(it), 0);
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={handleQuickSellCommons}
        disabled={bulkBusy}
        className="btn btn-secondary"
        style={{ width: '100%', fontSize: 10, padding: '6px', color: '#ffd700' }}
      >
        ⚡ Vendi {commons.length} comuni non equipaggiati (+{total}g)
      </button>
    </div>
  );
})()}
```

- [ ] **Step 2: Aggiungere tracking badge NEW (localStorage)**

In cima al file (dopo gli import) aggiungere helper:

```ts
const SEEN_KEY = 'heroes-collector:seen-items';
function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}
function saveSeen(seen: Set<string>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(seen)));
  } catch { /* ignore */ }
}
```

Dentro il componente, dopo gli altri state:

```ts
const [seenIds] = useState<Set<string>>(() => loadSeen());
const [, forceRerender] = useState(0);
```

Dopo `loadData()` (alla fine del then-block), marcare i nuovi come visti dopo un breve delay (così l'utente li nota):

```ts
useEffect(() => {
  if (inventory.length === 0) return;
  const newOnes = inventory.filter(it => !seenIds.has(it.id));
  if (newOnes.length === 0) return;
  const t = setTimeout(() => {
    for (const it of newOnes) seenIds.add(it.id);
    saveSeen(seenIds);
    forceRerender(n => n + 1);
  }, 4000); // dopo 4s li consideriamo "visti"
  return () => clearTimeout(t);
}, [inventory, seenIds]);
```

Aggiornare la chiamata a `<ItemCard>` per passare `isNew`:

```tsx
<ItemCard
  item={item}
  isNew={!seenIds.has(item.id)}
  /* ... resto invariato */
/>
```

- [ ] **Step 3: Verificare build**

Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 4: Smoke test**

Nel browser:
- Far apparire dei nuovi oggetti (dopo un dungeon o uno shop) → badge NEW verde in alto a destra di ogni card per i primi 4s
- Bottone quick-sell appare solo se ci sono comuni non equipaggiati
- Conferma → vendita batch riuscita
- Equipaggiati non vengono mai venduti

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Inventory.tsx
git commit -m "feat(inventory): quick-sell commons + NEW badge for unseen items"
```

---

### Task 16: Frontend — Juice finale: monete che volano dopo vendita

**Files:**
- Create: `frontend/src/components/CoinFly.tsx`
- Modify: `frontend/src/components/Inventory.tsx`
- Modify: `frontend/src/premium.css`

**Rationale:** Quando l'utente vende (singolo o bulk), una raffica di "🪙" sale dalla sticky bar o dalla card verso il contatore oro. Effetto puramente CSS — niente librerie.

- [ ] **Step 1: Aggiungere keyframe coin fly in `premium.css`**

In fondo a `frontend/src/premium.css`:

```css
/* === Coin fly (sell feedback) === */
.coin-fly {
  position: fixed;
  font-size: 22px;
  pointer-events: none;
  z-index: 9999;
  animation: coinFlyAnim 0.9s cubic-bezier(.22,1.13,.34,1.06) forwards;
}
@keyframes coinFlyAnim {
  0%   { opacity: 1; transform: translate(0, 0) scale(1); }
  60%  { opacity: 1; transform: translate(var(--dx, 0px), var(--dy, -80px)) scale(1.2); }
  100% { opacity: 0; transform: translate(var(--dx, 0px), var(--dy, -120px)) scale(0.6); }
}
```

- [ ] **Step 2: Creare `frontend/src/components/CoinFly.tsx`**

```tsx
import React, { useEffect } from 'react';

interface CoinFlyProps {
  /** Posizione di partenza (px assoluti, viewport) */
  origin: { x: number; y: number };
  /** Numero di monete da animare */
  count?: number;
  /** Quando l'animazione finisce */
  onDone: () => void;
}

/**
 * Spawnna `count` monete 🪙 sopra il viewport che salgono e svaniscono.
 * Effetto effimero — il consumer la rimonta a ogni evento.
 */
export function CoinFly({ origin, count = 6, onDone }: CoinFlyProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 1000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const dx = (Math.random() - 0.5) * 80;
        const dy = -80 - Math.random() * 40;
        const delay = i * 60;
        return (
          <span
            key={i}
            className="coin-fly"
            style={{
              left: origin.x,
              top: origin.y,
              animationDelay: `${delay}ms`,
              ['--dx' as any]: `${dx}px`,
              ['--dy' as any]: `${dy}px`,
            }}
          >🪙</span>
        );
      })}
    </>
  );
}
```

- [ ] **Step 3: Integrare in `Inventory.tsx`**

Aggiungere import:

```ts
import { CoinFly } from './CoinFly';
```

Aggiungere state:

```ts
const [coinBurst, setCoinBurst] = useState<{ x: number; y: number; key: number } | null>(null);
```

Nella `handleBulkSell` (e `handleQuickSellCommons` se desideri), dopo il successful sell ma prima di `exitSelectMode`:

```ts
// Trigger coin animation dalla sticky bar
const el = document.querySelector('.sticky-sell-bar') as HTMLElement | null;
if (el) {
  const rect = el.getBoundingClientRect();
  setCoinBurst({ x: rect.left + rect.width / 2, y: rect.top, key: Date.now() });
}
```

(Stesso pattern in `handleQuickSellCommons`, ma usando un anchor diverso — il bottone quick-sell stesso. Se preferisci mantenerlo semplice, basta il caso bulk per ora.)

Renderizzare CoinFly in cima al `return` (subito sotto al toast):

```tsx
{coinBurst && (
  <CoinFly
    key={coinBurst.key}
    origin={{ x: coinBurst.x, y: coinBurst.y }}
    onDone={() => setCoinBurst(null)}
  />
)}
```

- [ ] **Step 4: Verificare build**

Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 5: Smoke test**

Vendere in bulk → vedere le 6 monete salire da dove era la sticky bar. Funziona anche se la sticky bar è già scomparsa? Sì, perché catturiamo le coordinate prima di svuotare la selezione.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/CoinFly.tsx frontend/src/components/Inventory.tsx frontend/src/premium.css
git commit -m "feat(inventory): coin fly animation on bulk sell"
```

---

### Task 17: Test end-to-end manuale + verifica regressioni

**Files:** nessun cambio codice — verification only.

- [ ] **Step 1: Riavviare backend + frontend puliti**

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

- [ ] **Step 2: Checklist regressioni Pagina Eroe**

- [ ] Header CP, barre stat e ritratto si renderizzano correttamente come prima
- [ ] Le sub-tab Abilità / Talenti / Missioni / Altro NON sono cambiate visivamente
- [ ] La sub-tab Equip mostra le 3 slot-card
- [ ] Hover su candidato → preview CP/barre attivo
- [ ] Mouse-leave → preview resetta
- [ ] Equip → CP count-up, badge POWER UP visibile per ~1.4s
- [ ] Unequip dallo slot pulisce
- [ ] Class restriction filtra correttamente i candidati nel picker

- [ ] **Step 3: Checklist regressioni Zaino**

- [ ] Header riepilogo (count + valore totale) corretto
- [ ] Filtri slot funzionano (Tutti / Arma / Armatura / Accessorio)
- [ ] Sort per Rarità e Valore corretti
- [ ] Tap su card oggetto apre il dettaglio (come prima)
- [ ] Pulsante "Seleziona" entra in multi-select
- [ ] Multi-select: equipaggiati non selezionabili
- [ ] Sticky sell bar mostra totale corretto
- [ ] Bulk sell vende correttamente, mostra toast, accredita gold (verificare nel header risorse)
- [ ] Quick-sell comuni: si attiva solo se ci sono comuni; conferma dialog; vende tutti
- [ ] Badge NEW visibile sui nuovi oggetti, scompare dopo ~4s
- [ ] CoinFly su bulk sell
- [ ] Equip/Unequip/Sell singolo dal dettaglio oggetto continuano a funzionare

- [ ] **Step 4: Run tutti i test**

```bash
cd backend && npm test
cd frontend && npm test
```

Expected: tutti i test passano.

- [ ] **Step 5: Typecheck**

```bash
cd backend && npm run typecheck
cd frontend && npm run build  # tsc + vite build
```

Expected: PASS.

- [ ] **Step 6: Commit finale di documentazione (se ci sono note)**

Se hai trovato regressioni minori o note, aggiornare lo spec o questo plan con una sezione "Implementation notes" e committare. Altrimenti questo task non genera commit.

---

## Self-Review

**Spec coverage:**
- ✓ Pagina Eroe sub-tab Equip interattiva → Task 11 + 12
- ✓ Anteprima viva (CP/stat header) → Task 12 (`previewBonuses` state)
- ✓ Slot-card espandibili con picker inline → Task 11
- ✓ Delta CP nei candidati → Task 10 (`ComparisonRow.deltaCP`)
- ✓ Vendita rapida nel picker → Task 10/11 (`onSell`)
- ✓ Equip → POWER UP + CP count-up + glow → Task 7, 8, 12
- ✓ Slot vuoto stato tratteggiato + tap → Task 11 (rendering)
- ✓ Unequip dal singolo slot → Task 11
- ✓ Zaino — header riepilogo + valore totale → Task 13
- ✓ Filtri + sort → Task 13
- ✓ Card con bordo/glow rarità → Task 9 (`ItemCard --shimmer` per epico+)
- ✓ Badge "equipaggiato su <eroe>" → Task 13/14 (`right` prop)
- ✓ Valore in g visibile → Task 9 (`showSellValue`)
- ✓ Badge NEW → Task 15
- ✓ Vendita multipla + sticky bar → Task 14
- ✓ Quick-sell intelligente comuni non equipaggiati → Task 15
- ✓ Equip protetti dalla vendita → Task 14 (frontend) + Task 2 (`sellBulk` salta equipaggiati)
- ✓ Confronto 100% client → Task 11 (compute in `EquipPanel`)
- ✓ `sellValue` nel payload → Task 1
- ✓ `POST /items/sell-bulk` transazionale → Task 2
- ✓ Test unit su funzioni pure → Task 5
- ✓ Coin fly + burst → Task 16
- ✓ Nudge "equipaggia il migliore" → Task 11
- ⚠ **Suoni**: dichiarati fuori scope nello spec — corretto non includerli.
- ⚠ **Drag&drop**: fuori scope — corretto.

**Type consistency check:**
- `InventoryItem` backend e frontend ora entrambi con `sellValue: number` ✓ (task 1 + 5)
- `BulkSellResult` definito identicamente backend/frontend ✓ (task 2 + 6)
- `computeCP(stats, bonuses)` firma uniforme in tutti i call site ✓ (task 5, 11, 12)
- `STAT_LABELS` importato dalla stessa fonte in MyHero / Inventory / ItemCard / ComparisonRow / EquipPanel ✓
- `SLOT_ICONS` esportato da `utils/itemIcon.ts` (task 9) e usato in `Inventory.tsx` ✓

**Placeholder scan:**
- Nessun "TBD"/"TODO"/"implement later"
- Tutti i blocchi di codice sono completi
- Esempi DB nei test sono ben isolati con `describe.skipIf(!process.env.DATABASE_URL)` per non bloccare CI senza DB

**Gaps individuati e già coperti:**
- Inizialmente non avevo previsto come gestire `getItemIcon` (duplicato tra Inventory e nuove card) → estratto in `utils/itemIcon.ts` in Task 9.
- Inizialmente il frontend non aveva test runner → Task 3 lo aggiunge minimalmente.
- `MyHero` aveva uno stato `equipment` (solo equipaggiati): il picker ha bisogno del **full inventory** → Task 12 step 5 estende a `inventory`.

---

## Execution

**Plan complete and saved to `docs/superpowers/plans/2026-05-28-equip-item-ux-implementation.md`.**

Quando l'utente decide come eseguire (subagent-driven o inline), si seguono i sub-skill `superpowers:subagent-driven-development` o `superpowers:executing-plans`.
