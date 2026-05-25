# Heroes Collector — Code Review (Viren, 2026-05-25)

Review completa di backend (TypeScript/Express, ~9.8k righe), database (PostgreSQL, 12 migration) e frontend (React/Vite, ~11.9k righe). Findings con riferimenti `file:riga`, ordinati per severità.

> Verdetto sintetico: **buona architettura e tanta feature, ma NON pronto per la produzione.** Tre famiglie di problemi bloccano il lancio: (1) auth Twitch che si rompe da sola dopo ~30 min, (2) economia interamente exploitabile per race condition, (3) sistema di migration che muta dati a ogni deploy. Più: zero test, zero lint, zero CI su 22k righe.

---

## 🔴 BLOCCANTI (da sistemare prima di qualsiasi lancio)

### B1 — Il token Twitch non viene rinnovato → 401 garantiti dopo ~30 min
`frontend/App.tsx:62-70`. Twitch chiama `onAuthorized` di nuovo a ogni rotazione del JWT (~30 min). Il flag `resolved` blocca tutte le chiamate dopo la prima, quindi `setAuthToken` non viene più richiamato → il token scade → ogni azione (battaglia, shop, equip) va in 401 senza recovery. Il path di retry (`App.tsx:106-120`) ha lo stesso difetto.
**Fix:** aggiornare SEMPRE il token in `onAuth`; tenere il flag one-shot solo per il primo caricamento profilo.

### B2 — JWT verificato senza pinning dell'algoritmo
`backend/src/middleware/twitchAuth.ts:38-39`. `jwt.verify(token, secret)` senza `algorithms`. È il classico foot-gun di key-confusion / `alg`. Twitch usa HS256.
**Fix:** `jwt.verify(token, secret, { algorithms: ['HS256'] })`.

### B3 — Backdoor di auth in dev gated solo da NODE_ENV (che default a 'development')
`twitchAuth.ts:26-34` + `config/env.ts:7`. Qualsiasi token `dev:<id>:broadcaster` viene accettato come quell'utente con quel ruolo quando `NODE_ENV === 'development'`. E `nodeEnv` default a `'development'` se non settato. **Se il processo di produzione parte senza NODE_ENV esplicito → auth completamente bypassabile** impersonando chiunque, incluso il ruolo broadcaster.
**Fix:** richiedere una flag esplicita per il backdoor e fail-fast in produzione.

### B4 — Double-spend / race condition su OGNI flusso di valuta (no transazioni)
`config/database.ts:15-23` espone solo una `query()` per-chiamata; **nessun service usa BEGIN/COMMIT**. Quasi ogni spesa è read-then-write non atomica:
- Shop buy — `shopService.ts:140-156`: `SELECT gold` → `UPDATE gold = gold - price`. Due richieste concorrenti passano entrambe il check, scalano entrambe, **consegnano entrambe l'item**. Gold va negativo.
- Reroll classe — `heroService.ts:480-491`. Stesso pattern.
- Upgrade essenze — `heroService.ts:271-290`.
- Cattura — `heroService.ts:143-178`: check esistenza → INSERT. Doppia cattura per una sola carica di energia.
- Daily login — `dailyLoginService.ts:121-170`: doppia riscossione reward.
- Mission claim — `missionService.ts:220-250`: reward pagato due volte.
- Sell item — `itemService.ts:218-258`: doppio accredito di gold.
- Equip split — `itemService.ts:151-163`: **duplicazione item** (stampa gold via sell).

L'unico spend corretto è l'energia: `userService.ts:140-152` usa `UPDATE … WHERE energy >= $1 RETURNING`. **Quello è il template per tutto il resto.**
**Fix:** ogni spesa = singolo `UPDATE … WHERE saldo >= costo RETURNING`, oppure `withTransaction` helper. Risolve B4, e gran parte di H1-H5 insieme.

### B5 — Migration: nessuna tracking table → muta dati di gioco a ogni deploy
`backend/src/config/migrate.ts:9-15` rilegge ed esegue TUTTI i `.sql` a ogni avvio. Non è idempotente per i file con UPDATE:
- `012_playtest_fixes.sql:23`: `UPDATE users SET energy = GREATEST(energy, 100) WHERE energy < 100;` → **ri-floora l'energia di tutti i giocatori a 100 a ogni deploy.** Bug di economia live.
- `005_essences_economy.sql:14`: idem con `max_energy`.
**Fix:** aggiungere `schema_migrations` table; applicare ogni file una sola volta.

### B6 — Collisione dei due file `012` con tipi incompatibili
`006_roster_capture_rarity.sql:10` definisce `capture_rarity` come enum `rarity` NOT NULL; `012_playtest_fixes.sql:6` lo ri-aggiunge come `VARCHAR(32) DEFAULT 'comune'`. Con il sort lessicale del runner, ambienti diversi finiscono con **schemi strutturalmente diversi per la stessa colonna**.
**Fix:** rinominare i 012 in 012/013 distinti e allineare il tipo della colonna.

### B7 — Verifica firma EventSub debole → endpoint pubblico che stampa valuta
`backend/src/routes/twitch.ts:16-22`. La HMAC è calcolata su `JSON.stringify(req.body)` (ri-serializzato) invece che sui **byte raw**, e il confronto è `!==` (non constant-time). `/api/twitch/eventsub` è pubblico (`index.ts:40`) e da lì `handleGiftSub` accredita `total * 50` gold senza cap (`twitchService.ts:201-214`). Se la verifica salta/è mal configurata → conio illimitato di gold/item via POST forgiati.
**Fix:** HMAC sui byte raw del body + `crypto.timingSafeEqual` + cap su `gift.total` + anti-replay su messageId.

---

## 🟠 GRAVI

- **H1 — Realtime interamente mockato.** `frontend/App.tsx:28` dichiara `listen` ma non lo usa mai. PubSub commentato (`NotificationOverlay.tsx:38-44`), `getChannelProgress`/`MOCK_BLESSINGS` ritornano dati finti (`api.ts:558-598`). In produzione gli eventi non arrivano ai viewer.
- **H2 — Niente autorizzazione per ruolo.** Nessuna route controlla `req.twitchUser.role`. `role` è decorativo.
- **H3 — `user_id` derivato da `opaque_user_id` per utenti non-linkati**, usato come chiave primaria ovunque tranne `/join` (`twitchAuth.ts:43-50`). Identità incoerente / anti-abuse aggirabile.
- **H4 — Race su raid (cap 5/giorno aggirabile) + EXP/gold senza upper bound** scalano con damage (`raidService.ts:206-328`).
- **H5 — PVP: ELO/reward su più query non transazionali + cooldown 3 min bypassabile** in parallelo (`pvpService.ts:61-71,150-199`).
- **H6 — `tactics_json` salvato come JSON arbitrario non validato** (solo `Array.isArray`), poi consumato dal battle engine (`tactics.ts:45-78`). DoS / row bloat.
- **DB-H1 — Nessun `CHECK (... >= 0)`** su gold/energy/hp/essences/prezzi.
- **DB-H2 — `energy`/`max_energy` tipati FLOAT** invece di INTEGER → `99.99999`, rompe i confronti.
- **DB-H3 — Nessun indice su `leaderboard.elo_rating`** (né `weekly_scores.points`, né raid damage). La query più frequente del gioco è full-scan + sort.
- **DB-H4 — FK senza indici:** `roster.hero_id`, `inventory.item_id`, **tutta la tabella `battles`**, `channel_point_redemptions.user_id`.
- **FE-H — Acquisto Bits rotto:** `BitShop.tsx:52` usa `useNextEntitlement()` invece di `useBits(sku)`, nessuna mappatura SKU, `alert()` bloccante (inaffidabile in iframe), listener senza cleanup.

---

## 🟡 MEDI (selezione)

- SQL injection latente (non attiva oggi, ma a un passo): identificatore di colonna interpolato in `userService.ts:84-88` (`addActivity`) e `weeklyService.ts:35-43`. Tutti i valori sono parametrizzati correttamente.
- `parseInt`/`parseFloat` su input utente senza guardie NaN/negativi (`heroes.ts:12-13`, `battles.ts:71,96`).
- Errori interni esposti al client: `tactics.ts:40,81` ritorna `err.message` raw.
- Frontend: fetch duplicati senza cache (App/Shop/Inventory rifanno `getMyProfile`), `refreshProfile` a ogni click tab (`App.tsx:265`), `key={tab}` rimonta l'intero sottoalbero (`App.tsx:272`).
- Errori frontend ingoiati in silenzio (`App.tsx:146-152`, `MyHero.tsx:81`, `PvpArena.tsx:30`).
- Nessun retry/backoff: il cold-start di Render (free tier, 10-30s) fa fallire la prima richiesta con schermata vuota.
- `localStorage` non protetto in iframe sandboxed Twitch (`App.tsx:220`, `Tutorial.tsx:51`).

---

## 🟢 STRUTTURALI (qualità del progetto)

- **Zero test.** 22k righe, nessun `.test`/`.spec`. Per un gioco con economia e battle engine è il buco più grosso.
- **Zero lint / Prettier / CI.** Nessun guardrail automatico.
- **CORS `origin: '*'`** in `index.ts:27,31` (sia socket.io che express). La guida lo riconosce ma il codice non lo restringe.
- **Nessun rate limiting** né `helmet`/security headers.
- **WebSocket senza auth:** chiunque può fare `join-channel` su qualsiasi canale e ricevere i broadcast (`index.ts:60-70`).
- **`jwtSecret: 'dev-secret'`** default in `env.ts:14` (apparentemente inutilizzato — da rimuovere).
- Pervasivo uso di `any` nel frontend + mismatch contratto snake_case/camelCase mascherato con `as any` (`PartyManager.tsx`).
- Bundle unico 379 KB senza code splitting.

---

## Ordine di attacco consigliato

1. **B4 + B5/B6** (transazioni + migration): toccano l'integrità dei dati, vanno fatti prima che ci siano giocatori veri.
2. **B1 + B2 + B3 + B7** (auth + EventSub): senza questi l'estensione non regge la produzione né la review Twitch.
3. **Test + lint + CI**: prima di rifattorizzare l'economia, una rete di sicurezza.
4. Indici DB (DB-H3/H4) + CHECK constraints (DB-H1).
5. Realtime vero (H1) + Bits (FE-H) + pulizia frontend (cache, retry, error handling).

— Viren ⚡
