# Phase 2 — Rebalance Economia e Progressione

**Data**: 2026-05-17
**Status**: Design approvato (pending review scritto)
**Phase**: 2 di [post-test sprint](../plans/2026-05-13-post-test-sprint.md)
**Filosofia di design**: longevità prima di tutto. Il gioco deve durare 6-12+ mesi di stream attivi, non esaurirsi in un mese come un gacha mobile. Le leve scelte vanno a punire lo snowball senza bloccare il giocatore esplicitamente.

---

## 1. Goal

Rallentare la progressione e indurire la difficoltà per chiudere lo snowball emerso al test del 13/05/2026 (giocatori a lv9 con 3 stage cleared in una serata). Il design deve scalare nativamente alle zone future (zona 7-8-9+, fino a lv80-100), senza richiedere riscritture strutturali.

### Acceptance criteria (gameplay)

- Nuovo utente, party 4 eroi, dopo 5 run Foresta complete + 1 run Pianure → **non supera lv4**.
- Lv9 in Caverna → muore o sopravvive con eroe a < 30% HP entro wave 4.
- Lv9 con 1.000 gold → NON può convertirli in oltre 600 EXP comprabili (cap acquisti).
- Run Vulcano + Sfida Elitaria + completata → reward EXP totale ≤ 1.5× del Vulcano + Incubo.
- Build (`cd frontend && npm run build` + `cd backend && npm run build`) pulita, zero TS errors.

### Out of scope (follow-up plan separati)

- Drop rate rarità (leggendari/mitici).
- Costo essenze per ascensione rarità.
- Sistema paragon/talenti lv80+.
- Stagioni e leaderboard reset.
- Equipment endgame (set bonus, gemme).
- Compensazioni una tantum per giocatori esistenti (gold/essenze regalo): da valutare dopo deploy.

---

## 2. Target di progressione

| Profilo | Sessioni | Livello target | Orizzonte reale |
|---|---|---|---|
| Casual serata | 1-2h | lv3-4 | day 1 |
| Settimana attiva | ~10h | lv8-10 | week 1 |
| Mese intenso | ~40h | lv20-25 | month 1 |
| 3 mesi attivi | ~120h | lv35-45 | month 3 |
| Endgame casual | ~250h | lv55-65 | 6 mesi |
| Endgame hardcore | 500h+ | lv70+ | 12 mesi |
| Paragon (zone future) | ∞ | lv80+ | post-endgame |

---

## 3. Curva EXP — quadratica vera

**Formula attuale**: `expForLevel(level) = floor(150 × level^1.5)`
**Formula nuova**: `expForLevel(level) = floor(300 × level^2.0)`

Razionale: la `lv^2.0` è quadratica pura, ha headroom infinito senza creare "muri" arbitrari. La pergamena EXP fissa si autobilancia (rilevante early, irrilevante endgame).

### Snapshot della nuova curva

| Livello | EXP per next | Cumulativo |
|---|---|---|
| lv1→2 | 300 | 300 |
| lv2→3 | 1.200 | 1.500 |
| lv5→6 | 7.500 | ~16.000 |
| lv10→11 | 30.000 | ~120.000 |
| lv20→21 | 120.000 | ~870.000 |
| lv30→31 | 270.000 | ~2.9M |
| lv50→51 | 750.000 | ~13M |
| lv70→71 | 1.470.000 | ~35M |
| lv80→81 | 1.920.000 | ~53M |

### Files toccati

Frontend (display visivo del progress bar EXP nella MyHero card):
- `frontend/src/components/MyHero.tsx:20` → `const EXP_BASE = 300;`
- `frontend/src/components/MyHero.tsx:32-34` → cambiare `Math.pow(level, 1.5)` in `Math.pow(level, 2.0)`.

Backend (formula autorevole per il level-up):
- `backend/src/types/index.ts:229` → `export const EXP_BASE = 300;`
- `backend/src/services/heroGenerator.ts:211-213` → cambiare `Math.pow(level, 1.5)` in `Math.pow(level, 2.0)` nella funzione `expForLevel`.
- `tryLevelUp` (stesso file) usa già `expForLevel` quindi si propaga automaticamente — nessuna altra modifica nei file `heroService.ts` che la consumano.

Entrambi i lati DEVONO usare gli stessi parametri (base 300, exp 2.0) o display e progressione divergono.

---

## 4. Scaling zone (difficoltà mostri)

`backend/src/data/zones.ts` → campo `baseScale` per ogni zona.

| Zona | Vecchio `baseScale` | Nuovo `baseScale` | Δ vs zona precedente |
|---|---|---|---|
| Foresta Oscura | 1.0 | **1.0** | — |
| Pianure Selvagge | 1.4 | **1.6** | +60% |
| Caverna Profonda | 1.9 | **2.6** | +62% |
| Palude Maledetta | 2.5 | **3.8** | +46% |
| Vulcano Infernale | 3.2 | **5.2** | +37% |
| Il Vuoto | 4.2 | **7.0** | +35% |

### Headroom per zone future (referenza, non da implementare ora)

| Zona futura ipotetica | `baseScale` previsto | `recommendedLevel` previsto |
|---|---|---|
| Zona 7 | 10.0 | 50-70 |
| Zona 8 | 14.0 | 65-85 |
| Zona 9 | 19.0 | 80-100 |

### Effetto concreto

Formula `templateToMonster` in `backend/src/data/monsters.ts:266`:
`scaleFactor = baseScale + (level - 1) * 0.12 + (wave - 1) * 0.08`

- Lv9 in Caverna: `scaleFactor = 2.6 + 8 × 0.12 = 3.56` (vs 2.86 oggi → mostri +24% stats).
- Lv9 in Vulcano: `scaleFactor = 5.2 + 8 × 0.12 = 6.16` (vs 4.16 oggi → mostri +48% stats).
- Lv25 in Vulcano (range raccomandato): `scaleFactor = 5.2 + 24 × 0.12 = 8.08` (vs 6.08 oggi → mostri +33% stats).

Il giocatore in-range avverte un combat più "punchy" ma sostenibile; il sotto-livello viene respinto duramente senza un blocco esplicito.

`recommendedLevel` resta solo come hint UI (non cambia).

---

## 5. Cap modificatori dungeon

`backend/src/data/dungeonModifiers.ts`:

| Modificatore | Vecchio | Nuovo |
|---|---|---|
| Incubo (`incubo`) | expMul 2.0, goldMul 2.0 | **expMul 1.8, goldMul 1.8** |
| Sfida Elitaria (`elitario`) | expMul 3.0, goldMul 1.5 | **expMul 2.0**, goldMul 1.5 (invariato) |
| Febbre dell'Oro (`ricchezza`) | expMul 1.0, goldMul 3.0 | expMul 1.0 (invariato), **goldMul 2.0** |
| Cannone di Vetro (`vetro`) | expMul 1.2, goldMul 1.2 | invariato |
| Colpo Fortunato (`critico`) | expMul 1.1 | invariato |
| Iperspazio (`velocita`) | expMul 0.9, goldMul 0.9 | invariato |
| Altri | invariati | invariati |

### Bonus completamento zona

`backend/src/services/dungeonService.ts:263-264`:

```ts
// Prima
totalExpReward = Math.floor(totalExpReward * 1.5);
totalGoldReward = Math.floor(totalGoldReward * 1.5);

// Dopo
totalExpReward = Math.floor(totalExpReward * 1.3);
totalGoldReward = Math.floor(totalGoldReward * 1.3);
```

### Cap cumulativo (implicito)

Run massima Vuoto + Elitario completata: `2.0 (mod) × 1.3 (bonus) × 3.5 (zone reward)` = 9.1× sui reward base. Era 3.0 × 1.5 × 3.5 = 15.75×. Riduzione del 42% sul massimo possibile, ma il caso "base no mod" resta uguale (3.5× zone reward standard).

---

## 6. Shop

`backend/src/services/shopService.ts:25-64` → array `PERMANENT_SHOP`.

| Articolo | Vecchio | Nuovo |
|---|---|---|
| Pozione di Energia (+40) | 50g, stock infinito | **80g**, cap **5/giorno** |
| Elisir di Energia (full) | 150g, stock infinito | **350g**, cap **2/giorno** |
| Pergamena Esperienza | 100g → +200 EXP, infinito | **250g → +150 EXP**, cap **3/giorno** |
| Cristallo Reroll | 300g | invariato |
| Equipment base | 80-100g | invariato |

### Migration daily_purchases

Nuova tabella per tracciare i cap giornalieri:

```sql
CREATE TABLE daily_purchases (
  user_id     VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  item_type   VARCHAR(32) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_type, date)
);

CREATE INDEX idx_daily_purchases_date ON daily_purchases(date);
```

### Enforce nei codice

In `shopService.ts → purchaseShopItem`, prima di `UPDATE users SET gold = gold - …`, eseguire:

```ts
const CAPS: Record<string, number> = {
  energy: 5,
  energy_full: 2,
  exp_potion: 3,
};

if (CAPS[itemType]) {
  const today = new Date().toISOString().slice(0, 10);
  const usage = await query(
    `INSERT INTO daily_purchases (user_id, item_type, date, count)
     VALUES ($1, $2, $3, 1)
     ON CONFLICT (user_id, item_type, date)
     DO UPDATE SET count = daily_purchases.count + 1
     RETURNING count`,
    [userId, itemType, today]
  );
  if (usage.rows[0].count > CAPS[itemType]) {
    throw new Error(`Limite giornaliero raggiunto: max ${CAPS[itemType]} ${itemType}/giorno`);
  }
}
```

Errore va catturato nel frontend (`Shop.tsx`) e mostrato come toast.

---

## 7. Channel points

`backend/src/services/channelPointsService.ts` → array `CHANNEL_POINT_REWARDS` + handler `handleChannelPointRedemption`.

| Reward | Vecchio | Nuovo |
|---|---|---|
| Boost Energia (+60) | 500 CP | invariato |
| Ricarica Completa | 1500 CP | **2000 CP** |
| Boost EXP | 2000 CP → +500 EXP | **3000 CP → +300 EXP** |
| Sacchetto Oro | 1000 CP → +200 gold | **1500 CP → +250 gold** |
| Cassa Misteriosa | 5000 CP | invariato |
| Reroll Abilità | 3000 CP | invariato |

Nessun cap giornaliero su CP (il viewer ha già un costo opportunità reale per accumularli).

> **Nota deploy**: i Channel Points sono configurati manualmente nella dashboard Twitch del broadcaster. Dopo questo cambio Alessio deve aggiornare i prezzi CP nella dashboard. Documentare in `GUIDA-DEPLOYMENT-TWITCH.md` (o file equivalente).

---

## 8. Migration e rollout

### Migration `013_rebalance.sql`

```sql
-- 1. Tabella per cap acquisti giornalieri
CREATE TABLE IF NOT EXISTS daily_purchases (
  user_id     VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  item_type   VARCHAR(32) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_type, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_purchases_date ON daily_purchases(date);

-- 2. Nota: NO reset di level/exp sugli eroi esistenti.
-- Chi è già lv9 resta lv9 come "premio early adopter".
-- La nuova curva rallenta solo le progressioni future.
```

### Compatibilità giocatori esistenti

- Eroi `lv9+` esistenti **non vengono retroattivamente abbassati**. Sarebbe punitivo e creerebbe churn.
- Da `now` in poi tutti progrediscono sulla curva nuova → naturalmente livellati arriveranno gli starter a colmare il gap nei prossimi mesi.
- Considerare (out of scope qui) una compensazione cosmetica una tantum: titolo "Pioneer", badge, o oggetto esclusivo non-power-creep.

### Ordine commit consigliato (per il plan di implementazione)

1. Curva EXP (frontend + backend) — riga isolata, no migration
2. baseScale zone — singola modifica `zones.ts`
3. Cap modificatori — singola modifica `dungeonModifiers.ts`
4. Bonus completamento — singola modifica `dungeonService.ts`
5. Migration `013_rebalance.sql` + creazione cap shop
6. Update prezzi shop in `shopService.ts` (`PERMANENT_SHOP`)
7. Update prezzi channel points
8. Build + zip frontend + push
9. Manual smoke test (vedi §9)

Ogni step un commit. Nessun "big bang" — se qualcosa va male in produzione si revertano i singoli punti.

---

## 9. Verifica e smoke test

### Pre-push (locale)

1. `cd backend && npm run build` → 0 errori
2. `cd frontend && npm run build` → 0 errori
3. Reset DB locale: applicare `013_rebalance.sql`
4. Avviare `npm run dev` su backend, `npm run dev` su frontend
5. Login dev come 2 utenti fittizi:
   - **utente A** nuovo, lv1, 0 EXP
   - **utente B** simulato lv9 (UPDATE manuale in DB)
6. Eseguire i 4 acceptance criteria di §1
7. Verificare cap shop: comprare 4 pozioni EXP come stesso utente in 1 giornata → la 4ª deve fallire con messaggio chiaro

### Post-push (produzione Render)

- Render auto-deploy dal commit
- Aggiornare prezzi Channel Points nella dashboard Twitch del broadcaster
- Build + zip frontend → upload su Twitch (necessario perché curva EXP è frontend-visibile)
- Monitorare la live successiva: chiedere a 3-5 viewer attivi feedback sul "feel" dopo 1 ora

### Rollback plan

Se qualcosa esplode:
- Curva EXP: revert MyHero.tsx → re-build frontend → re-upload
- Scale/mod/bonus: revert backend → Render auto-redeploy
- Cap shop: drop `daily_purchases` (lasciandolo non-bloccante: se la tabella non esiste, skip il check)

---

## 10. Open questions

Nessuna. Tutti i numeri sono stati discussi e approvati. Eventuali aggiustamenti fini (es. "la curva è ancora troppo lenta") verranno fatti in PR successivi sui singoli campi (non richiedono ridiscutere il design).
