# Rebalance Economia e Progressione — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementare il rebalance descritto in `docs/superpowers/specs/2026-05-17-rebalance-design.md`: curva EXP quadratica, scaling zone più ripido, cap moltiplicatori, prezzi shop/CP rivisti, daily caps su pozioni.

**Architecture:** Modifiche numeriche su 6 file di codice + 1 migration SQL nuova. Ogni Task tocca un'area indipendente per consentire revert puntuali. Niente refactor strutturale. Workflow di Alessio: tutto in locale, smoke test prima del push + zip Twitch.

**Tech Stack:** React + TypeScript + Vite (frontend), Node.js + Express + TypeScript (backend), PostgreSQL (Render). No test framework configurato → verifica via `npm run build` (type check) e smoke test manuale.

---

## File Structure

| File | Responsabilità nel cambio |
|---|---|
| `frontend/src/components/MyHero.tsx` | costanti EXP_BASE e exponent della funzione `expForLevel` (display progress bar) |
| `backend/src/types/index.ts` | costante esportata `EXP_BASE` |
| `backend/src/services/heroGenerator.ts` | funzione autoritativa `expForLevel` usata da `tryLevelUp` |
| `backend/src/data/zones.ts` | campo `baseScale` per ogni zona |
| `backend/src/data/dungeonModifiers.ts` | `expMultiplier` / `goldMultiplier` per Incubo, Elitario, Ricchezza |
| `backend/src/services/dungeonService.ts` | costanti `1.5` del bonus completamento (riga 263-264) |
| `backend/src/services/shopService.ts` | array `PERMANENT_SHOP` + nuovo middleware cap giornaliero in `purchaseShopItem` |
| `backend/src/services/channelPointsService.ts` | array `CHANNEL_POINT_REWARDS` + reward EXP/oro amounts |
| `database/013_rebalance.sql` | NUOVO: tabella `daily_purchases` |

---

## Task 1: Curva EXP quadratica (backend + frontend allineati)

**Files:**
- Modify: `backend/src/types/index.ts:229`
- Modify: `backend/src/services/heroGenerator.ts:211-213`
- Modify: `frontend/src/components/MyHero.tsx:20,32-34`

Backend e frontend usano DUE costanti separate. Vanno cambiate insieme nello stesso commit per evitare divergenza display/progressione.

- [ ] **Step 1: Aggiornare costante backend**

Modificare `backend/src/types/index.ts:229`:

```ts
// Prima:
export const EXP_BASE = 150;

// Dopo:
export const EXP_BASE = 300;
```

- [ ] **Step 2: Aggiornare formula backend**

Modificare `backend/src/services/heroGenerator.ts:211-213`:

```ts
// Prima:
export function expForLevel(level: number): number {
  return Math.floor(EXP_BASE * Math.pow(level, 1.5));
}

// Dopo:
export function expForLevel(level: number): number {
  return Math.floor(EXP_BASE * Math.pow(level, 2.0));
}
```

- [ ] **Step 3: Aggiornare costante frontend**

Modificare `frontend/src/components/MyHero.tsx:20`:

```ts
// Prima:
const EXP_BASE = 150;

// Dopo:
const EXP_BASE = 300;
```

- [ ] **Step 4: Aggiornare formula frontend**

Modificare `frontend/src/components/MyHero.tsx:32-34`:

```tsx
// Prima:
function expForLevel(level: number): number {
  return Math.floor(EXP_BASE * Math.pow(level, 1.5));
}

// Dopo:
function expForLevel(level: number): number {
  return Math.floor(EXP_BASE * Math.pow(level, 2.0));
}
```

- [ ] **Step 5: Verificare build backend**

Run:
```bash
cd backend && npm run build
```
Expected: 0 errori TypeScript.

- [ ] **Step 6: Verificare build frontend**

Run:
```bash
cd frontend && npm run build
```
Expected: 0 errori TypeScript.

- [ ] **Step 7: Commit**

```bash
git add backend/src/types/index.ts backend/src/services/heroGenerator.ts frontend/src/components/MyHero.tsx
git commit -m "balance: curva EXP quadratica (300 * lv^2.0) per longevita endgame"
```

---

## Task 2: Scaling zone più ripido

**Files:**
- Modify: `backend/src/data/zones.ts` (6 campi `baseScale`)

- [ ] **Step 1: Aggiornare baseScale Pianure**

Modificare `backend/src/data/zones.ts:65`:

```ts
// Prima:
baseScale: 1.4,

// Dopo:
baseScale: 1.6,
```

(Riga esatta da localizzare via grep nel blocco zona `id: 'plains'`.)

- [ ] **Step 2: Aggiornare baseScale Caverna**

Modificare `backend/src/data/zones.ts:89`:

```ts
// Prima:
baseScale: 1.9,

// Dopo:
baseScale: 2.6,
```

(Blocco zona `id: 'cavern'`.)

- [ ] **Step 3: Aggiornare baseScale Palude**

Modificare `backend/src/data/zones.ts:114`:

```ts
// Prima:
baseScale: 2.5,

// Dopo:
baseScale: 3.8,
```

(Blocco zona `id: 'swamp'`.)

- [ ] **Step 4: Aggiornare baseScale Vulcano**

Modificare `backend/src/data/zones.ts:139`:

```ts
// Prima:
baseScale: 3.2,

// Dopo:
baseScale: 5.2,
```

(Blocco zona `id: 'volcano'`.)

- [ ] **Step 5: Aggiornare baseScale Vuoto**

Modificare `backend/src/data/zones.ts:165`:

```ts
// Prima:
baseScale: 4.2,

// Dopo:
baseScale: 7.0,
```

(Blocco zona `id: 'void'`. Foresta resta a 1.0, non modificare.)

- [ ] **Step 6: Verificare build backend**

Run:
```bash
cd backend && npm run build
```
Expected: 0 errori TypeScript.

- [ ] **Step 7: Commit**

```bash
git add backend/src/data/zones.ts
git commit -m "balance: alzato baseScale zone progressive per chiudere snowball difficolta"
```

---

## Task 3: Cap moltiplicatori modificatori + bonus completamento

**Files:**
- Modify: `backend/src/data/dungeonModifiers.ts` (3 modificatori)
- Modify: `backend/src/services/dungeonService.ts:263-264`

- [ ] **Step 1: Cappare modificatore Incubo**

Modificare `backend/src/data/dungeonModifiers.ts` nel blocco `id: 'incubo'`:

```ts
// Prima (linee ~63-65):
goldMultiplier: 2.0,
expMultiplier: 2.0,

// Dopo:
goldMultiplier: 1.8,
expMultiplier: 1.8,
```

E aggiornare anche la `description` se contiene il numero esplicito. Verificare il testo attuale `'Nemici +50% HP ma doppio loot e EXP'` → aggiornare a `'Nemici +50% HP ma +80% loot e EXP'`.

- [ ] **Step 2: Cappare modificatore Sfida Elitaria**

Modificare `backend/src/data/dungeonModifiers.ts` nel blocco `id: 'elitario'`:

```ts
// Prima (linea ~143):
expMultiplier: 3.0,

// Dopo:
expMultiplier: 2.0,
```

`goldMultiplier: 1.5` resta invariato.

Aggiornare la `description` da `'Nemici hanno +30% a tutte le stats ma tripla EXP'` a `'Nemici hanno +30% a tutte le stats ma doppia EXP'`.

- [ ] **Step 3: Cappare modificatore Febbre dell'Oro**

Modificare `backend/src/data/dungeonModifiers.ts` nel blocco `id: 'ricchezza'`:

```ts
// Prima (linea ~81):
goldMultiplier: 3.0,

// Dopo:
goldMultiplier: 2.0,
```

`expMultiplier: 1.0` resta invariato.

Aggiornare la `description` da `'Triplo gold ma nemici +20% ATK'` a `'Doppio gold ma nemici +20% ATK'`.

- [ ] **Step 4: Ridurre bonus completamento zona**

Modificare `backend/src/services/dungeonService.ts:263-264`:

```ts
// Prima:
if (won) {
  totalExpReward = Math.floor(totalExpReward * 1.5);
  totalGoldReward = Math.floor(totalGoldReward * 1.5);

// Dopo:
if (won) {
  totalExpReward = Math.floor(totalExpReward * 1.3);
  totalGoldReward = Math.floor(totalGoldReward * 1.3);
```

- [ ] **Step 5: Verificare build backend**

Run:
```bash
cd backend && npm run build
```
Expected: 0 errori TypeScript.

- [ ] **Step 6: Commit**

```bash
git add backend/src/data/dungeonModifiers.ts backend/src/services/dungeonService.ts
git commit -m "balance: cappati moltiplicatori modificatori e bonus completamento"
```

---

## Task 4: Migration daily_purchases + cap nel shop service

**Files:**
- Create: `database/013_rebalance.sql`
- Modify: `backend/src/services/shopService.ts` (funzione `purchaseShopItem`)

- [ ] **Step 1: Creare migration SQL**

Creare il file `database/013_rebalance.sql`:

```sql
-- ============================================
-- REBALANCE — TABELLA CAP GIORNALIERI SHOP
-- ============================================
-- Traccia gli acquisti per utente/tipo/giorno per applicare i cap.
-- Lasciata IF NOT EXISTS per essere idempotente in caso di re-apply.

CREATE TABLE IF NOT EXISTS daily_purchases (
  user_id     VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  item_type   VARCHAR(32) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_type, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_purchases_date ON daily_purchases(date);
```

- [ ] **Step 2: Aprire il file shopService.ts e localizzare purchaseShopItem**

Leggere `backend/src/services/shopService.ts` per trovare la funzione `purchaseShopItem` (intorno alla riga 100-160). Identificare il punto subito DOPO il check del gold sufficiente e PRIMA dello `UPDATE users SET gold = gold - ...`.

- [ ] **Step 3: Aggiungere il cap check**

In `backend/src/services/shopService.ts`, aggiungere subito dopo l'inizio della funzione `purchaseShopItem` (e prima di qualsiasi UPDATE gold) il seguente blocco:

```ts
const DAILY_CAPS: Record<string, number> = {
  energy: 5,
  energy_full: 2,
  exp_potion: 3,
};

const dailyCap = DAILY_CAPS[listing.itemType];
if (dailyCap !== undefined) {
  const today = new Date().toISOString().slice(0, 10);
  const usage = await query(
    `INSERT INTO daily_purchases (user_id, item_type, date, count)
     VALUES ($1, $2, $3, 1)
     ON CONFLICT (user_id, item_type, date)
     DO UPDATE SET count = daily_purchases.count + 1
     RETURNING count`,
    [userId, listing.itemType, today]
  );
  if (usage.rows[0].count > dailyCap) {
    // Rollback dell'incremento appena fatto, altrimenti il contatore avanza anche se non compri
    await query(
      `UPDATE daily_purchases SET count = count - 1
       WHERE user_id = $1 AND item_type = $2 AND date = $3`,
      [userId, listing.itemType, today]
    );
    throw new Error(`Limite giornaliero raggiunto: max ${dailyCap} ${listing.itemType}/giorno`);
  }
}
```

NB: usare `listing.itemType` se la variabile `listing` esiste già nello scope (vedere il codice esistente). Altrimenti, usare la variabile che contiene il tipo dell'item ricercato in shop.

- [ ] **Step 4: Verificare build backend**

Run:
```bash
cd backend && npm run build
```
Expected: 0 errori TypeScript.

- [ ] **Step 5: Applicare la migration in locale**

Run (in psql locale o tramite il client che Alessio usa):
```bash
psql -d heroes_collector_local -f database/013_rebalance.sql
```
Expected: `CREATE TABLE` e `CREATE INDEX` o NOTICE "already exists".

- [ ] **Step 6: Commit**

```bash
git add database/013_rebalance.sql backend/src/services/shopService.ts
git commit -m "feat: migration daily_purchases + cap acquisti giornalieri shop"
```

---

## Task 5: Aggiornare prezzi shop

**Files:**
- Modify: `backend/src/services/shopService.ts:25-64` (array `PERMANENT_SHOP`)

- [ ] **Step 1: Aggiornare prezzo Pozione di Energia**

In `backend/src/services/shopService.ts`, nell'array `PERMANENT_SHOP`, blocco `itemType: 'energy'`:

```ts
// Prima:
{
  itemId: null, itemType: 'energy',
  name: 'Pozione di Energia', description: 'Recupera 40 energia.',
  priceGold: 50, priceChannelPoints: 0, stock: -1,
},

// Dopo:
{
  itemId: null, itemType: 'energy',
  name: 'Pozione di Energia', description: 'Recupera 40 energia. Max 5/giorno.',
  priceGold: 80, priceChannelPoints: 0, stock: -1,
},
```

- [ ] **Step 2: Aggiornare prezzo Elisir di Energia**

Blocco `itemType: 'energy_full'`:

```ts
// Prima:
{
  itemId: null, itemType: 'energy_full',
  name: 'Elisir di Energia', description: 'Recupera tutta l\'energia al massimo.',
  priceGold: 150, priceChannelPoints: 0, stock: -1,
},

// Dopo:
{
  itemId: null, itemType: 'energy_full',
  name: 'Elisir di Energia', description: 'Recupera tutta l\'energia. Max 2/giorno.',
  priceGold: 350, priceChannelPoints: 0, stock: -1,
},
```

- [ ] **Step 3: Aggiornare prezzo Pergamena dell'Esperienza**

Blocco `itemType: 'exp_potion'`:

```ts
// Prima:
{
  itemId: null, itemType: 'exp_potion',
  name: 'Pergamena dell\'Esperienza', description: 'Dona 200 EXP a un eroe.',
  priceGold: 100, priceChannelPoints: 0, stock: -1,
},

// Dopo:
{
  itemId: null, itemType: 'exp_potion',
  name: 'Pergamena dell\'Esperienza', description: 'Dona 150 EXP a un eroe. Max 3/giorno.',
  priceGold: 250, priceChannelPoints: 0, stock: -1,
},
```

- [ ] **Step 4: Aggiornare il valore EXP dato dalla pergamena**

Nel `switch` di `purchaseShopItem`, blocco `case 'exp_potion'` (linea ~178-190):

```ts
// Prima:
case 'exp_potion':
  const heroResult = await query(
    'SELECT id, display_name FROM heroes WHERE twitch_user_id = $1 LIMIT 1',
    [userId]
  );
  if (heroResult.rows.length > 0) {
    const { addExpToHero } = await import('./heroService');
    await addExpToHero(heroResult.rows[0].id, 200);
    resultMessage = `+200 EXP a ${heroResult.rows[0].display_name}!`;
  } else {
    resultMessage = `Pergamena usata, ma nessun eroe trovato.`;
  }
  break;

// Dopo:
case 'exp_potion':
  const heroResult = await query(
    'SELECT id, display_name FROM heroes WHERE twitch_user_id = $1 LIMIT 1',
    [userId]
  );
  if (heroResult.rows.length > 0) {
    const { addExpToHero } = await import('./heroService');
    await addExpToHero(heroResult.rows[0].id, 150);
    resultMessage = `+150 EXP a ${heroResult.rows[0].display_name}!`;
  } else {
    resultMessage = `Pergamena usata, ma nessun eroe trovato.`;
  }
  break;
```

- [ ] **Step 5: Verificare build backend**

Run:
```bash
cd backend && npm run build
```
Expected: 0 errori TypeScript.

- [ ] **Step 6: Commit**

```bash
git add backend/src/services/shopService.ts
git commit -m "balance: prezzi shop alzati e pergamena EXP nerf (250g -> 150 EXP)"
```

---

## Task 6: Aggiornare reward channel points

**Files:**
- Modify: `backend/src/services/channelPointsService.ts:23-66` (array `CHANNEL_POINT_REWARDS`)
- Modify: `backend/src/services/channelPointsService.ts:99-114` (handler exp_boost + gold_pack)

- [ ] **Step 1: Aggiornare prezzo CP Ricarica Completa**

Modificare `backend/src/services/channelPointsService.ts` nel blocco `id: 'cp_energy_full'`:

```ts
// Prima:
{
  id: 'cp_energy_full',
  type: 'energy_full',
  name: 'Ricarica Energia Completa',
  description: 'Riporta l\'energia al massimo.',
  cost: 1500,
},

// Dopo:
{
  id: 'cp_energy_full',
  type: 'energy_full',
  name: 'Ricarica Energia Completa',
  description: 'Riporta l\'energia al massimo.',
  cost: 2000,
},
```

- [ ] **Step 2: Aggiornare reward Boost EXP**

Modificare `backend/src/services/channelPointsService.ts` nel blocco `id: 'cp_exp_boost'`:

```ts
// Prima:
{
  id: 'cp_exp_boost',
  type: 'exp_boost',
  name: 'Boost EXP (+500)',
  description: 'Dona 500 EXP al tuo eroe principale.',
  cost: 2000,
},

// Dopo:
{
  id: 'cp_exp_boost',
  type: 'exp_boost',
  name: 'Boost EXP (+300)',
  description: 'Dona 300 EXP al tuo eroe principale.',
  cost: 3000,
},
```

- [ ] **Step 3: Aggiornare reward Sacchetto Oro**

Modificare il blocco `id: 'cp_gold_pack'`:

```ts
// Prima:
{
  id: 'cp_gold_pack',
  type: 'gold_pack',
  name: 'Sacchetto d\'Oro (+200)',
  description: 'Ricevi 200 gold.',
  cost: 1000,
},

// Dopo:
{
  id: 'cp_gold_pack',
  type: 'gold_pack',
  name: 'Sacchetto d\'Oro (+250)',
  description: 'Ricevi 250 gold.',
  cost: 1500,
},
```

- [ ] **Step 4: Aggiornare l'handler exp_boost (amount EXP dato)**

In `backend/src/services/channelPointsService.ts:99-107`, blocco `case 'exp_boost'`:

```ts
// Prima:
case 'exp_boost':
  const heroResult = await query(
    'SELECT id FROM heroes WHERE twitch_user_id = $1 LIMIT 1',
    [userId]
  );
  if (heroResult.rows.length > 0) {
    await addExpToHero(heroResult.rows[0].id, 500);
  }
  return { success: true, message: '+500 EXP al tuo eroe!' };

// Dopo:
case 'exp_boost':
  const heroResult = await query(
    'SELECT id FROM heroes WHERE twitch_user_id = $1 LIMIT 1',
    [userId]
  );
  if (heroResult.rows.length > 0) {
    await addExpToHero(heroResult.rows[0].id, 300);
  }
  return { success: true, message: '+300 EXP al tuo eroe!' };
```

- [ ] **Step 5: Aggiornare l'handler gold_pack (amount gold dato)**

In `backend/src/services/channelPointsService.ts:109-114`, blocco `case 'gold_pack'`:

```ts
// Prima:
case 'gold_pack':
  await query(
    'UPDATE users SET gold = gold + 200 WHERE twitch_user_id = $1',
    [userId]
  );
  return { success: true, message: '+200 gold!' };

// Dopo:
case 'gold_pack':
  await query(
    'UPDATE users SET gold = gold + 250 WHERE twitch_user_id = $1',
    [userId]
  );
  return { success: true, message: '+250 gold!' };
```

- [ ] **Step 6: Verificare build backend**

Run:
```bash
cd backend && npm run build
```
Expected: 0 errori TypeScript.

- [ ] **Step 7: Commit**

```bash
git add backend/src/services/channelPointsService.ts
git commit -m "balance: prezzi e amount channel points rivisti per longevita"
```

> ⚠️ **Reminder post-deploy**: dopo il push a Render, Alessio deve aggiornare manualmente i prezzi dei reward Channel Points nella dashboard Twitch del canale ShydanRem, altrimenti chi riscatta paga il vecchio prezzo CP.

---

## Task 7: Smoke test manuale in locale

**Files:** nessuno (solo verifica).

Prima del push su Render + zip Twitch, validare i 5 acceptance criteria dello spec §1.

- [ ] **Step 1: Reset DB locale (opzionale ma consigliato)**

Se vuoi partire pulito, droppare e ricreare il DB locale. Altrimenti applicare solo la migration nuova:

```bash
psql -d heroes_collector_local -f database/013_rebalance.sql
```

- [ ] **Step 2: Avviare backend in dev**

Run in un terminale:
```bash
cd backend && npm run dev
```
Expected: server su `localhost:3001`, nessun crash.

- [ ] **Step 3: Avviare frontend in dev**

Run in un secondo terminale:
```bash
cd frontend && npm run dev
```
Expected: Vite su `localhost:3000` (o porta tua), apre il browser.

- [ ] **Step 4: Login dev come utente A (nuovo)**

In browser, usare token dev: `dev:userA:viewer` o equivalente. Verificare che parta a lv1 con 0 EXP.

- [ ] **Step 5: Verificare curva EXP visivamente**

Nella card MyHero, la barra EXP deve mostrare 0/300 per il livello 1. Se mostra 0/150 vuol dire che il frontend non ha aggiornato → ricontrollare Task 1 Step 3-4.

- [ ] **Step 6: Run 5 dungeon Foresta + 1 Pianure**

Eseguire 5 run Foresta complete e 1 Pianure. Acceptance: il livello NON deve superare lv4.

Se supera → la curva è troppo lassa o i reward troppo alti. Verificare anche `dungeonService.ts` per eventuali altri moltiplicatori (es. `modifier.expMultiplier`).

- [ ] **Step 7: Simulare utente B lv9 in Caverna**

In psql locale:
```sql
UPDATE heroes SET level = 9, hp = 2000, atk = 250, def = 150, spd = 100 WHERE twitch_user_id = 'userB';
```

Loggare come `dev:userB:viewer`. Provare la Caverna. Acceptance: muore o sopravvive con eroe a < 30% HP entro wave 4.

- [ ] **Step 8: Verificare cap shop**

Come utente con 1500+ gold, comprare 4 Pergamene EXP in rapida successione. Acceptance: la 4ª deve dare errore "Limite giornaliero raggiunto: max 3 exp_potion/giorno".

- [ ] **Step 9: Verificare run Vulcano + Elitario**

Con un party lv25+, attivare il modificatore Elitario in Vulcano (può essere random, ritentare se serve). Completare la run. Acceptance: il reward EXP totale è grossomodo allineato (non esplode oltre 1.5× del vecchio comportamento di Vulcano + Incubo).

- [ ] **Step 10: Aggiungere commento sui risultati nel commit**

Se tutto passa, nessun commit qui. Se hai dovuto aggiustare un numero (es. `baseScale` ulteriormente), committare il fix con `git commit -m "fix: aggiustato X dopo smoke test"`.

---

## Task 8: Applicare migration su Render + build frontend + push

- [ ] **Step 1: Applicare migration sul DB Render**

Connettersi al DB di produzione (credenziali in `.env` su Render o nel secret store di Alessio) ed eseguire:

```bash
psql "<DATABASE_URL_RENDER>" -f database/013_rebalance.sql
```

Expected: `CREATE TABLE` (o `NOTICE: relation already exists`).

> ⚠️ Se Alessio preferisce, può applicarla via dashboard Render → shell. NON skippare questo step: senza la tabella il middleware in shopService.ts crasha al primo acquisto.

- [ ] **Step 2: Build frontend per produzione**

Run:
```bash
cd frontend && npm run build
```
Expected: build pulita, output in `frontend/dist/`.

- [ ] **Step 3: Rinominare index.html in panel.html**

Twitch richiede `panel.html` come entry point per il pannello extension. Rinominare:

```bash
ren frontend\dist\index.html panel.html
```

(O equivalente PowerShell: `Move-Item frontend\dist\index.html frontend\dist\panel.html`)

- [ ] **Step 4: Creare zip Twitch**

Comprimere il contenuto di `frontend/dist/` (non la cartella, il CONTENUTO):

```powershell
Compress-Archive -Path frontend\dist\* -DestinationPath frontend\twitch-extension.zip -Force
```

- [ ] **Step 5: Push del codice su GitHub**

```bash
git push origin main
```

Expected: push accettato. Render auto-deploy parte da solo (verificare nel dashboard Render che il deploy del backend sia in corso).

- [ ] **Step 6: Upload zip su Twitch**

Alessio deve fare manualmente: dashboard Twitch → Extensions → Heroes Collector → Files → upload `frontend/twitch-extension.zip`.

- [ ] **Step 7: Aggiornare prezzi Channel Points su Twitch**

Alessio deve fare manualmente nella dashboard Twitch del canale ShydanRem → Community → Channel Points → Manage Rewards:

| Reward | Nuovo costo CP | Nuovo amount |
|---|---|---|
| Ricarica Energia Completa | 2000 | — |
| Boost EXP | 3000 | descrizione "+300 EXP" |
| Sacchetto d'Oro | 1500 | descrizione "+250 gold" |

- [ ] **Step 8: Smoke test in produzione**

Aprire il canale Twitch ShydanRem con extension attivo, verificare:
- La barra EXP del proprio eroe (override Assassino) mostra il nuovo "X/Y" coerente con la curva quadratica.
- Tentare un acquisto in shop come stress test.

Se qualcosa rompe → rollback puntuale via `git revert <commit_hash>` del commit incriminato + redeploy.

---

## Self-Review

Checklist eseguito dal compilatore del plan stesso prima di handoff:

### 1. Spec coverage

| Spec sezione | Task che la copre |
|---|---|
| §3 Curva EXP | Task 1 |
| §4 Scaling zone | Task 2 |
| §5 Cap modificatori + bonus completamento | Task 3 |
| §6 Shop prezzi + cap giornalieri | Task 4 (migration + middleware) + Task 5 (prezzi) |
| §7 Channel points | Task 6 |
| §8 Migration / rollout | Task 4 (locale) + Task 8 (produzione) |
| §9 Acceptance criteria | Task 7 |

Nessuna sezione spec scoperta.

### 2. Placeholder scan

✅ Nessun "TBD", "TODO", "implement later", "add appropriate error handling" generico.
✅ Tutti i blocchi di codice mostrano il `// Prima` e `// Dopo`.
✅ Tutti i comandi git/build sono espliciti.

### 3. Type consistency

✅ `EXP_BASE` usato uguale in backend (`types/index.ts`) e frontend (`MyHero.tsx`).
✅ `expForLevel` ha la stessa firma in entrambi i lati.
✅ `daily_purchases` struttura coerente tra migration SQL e middleware shopService.ts.
✅ `listing.itemType` referenziato in Task 4 Step 3 esiste nel codice di shopService.ts (verificato in fase di lettura per spec).
