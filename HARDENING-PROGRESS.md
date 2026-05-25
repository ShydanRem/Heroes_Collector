# Hardening Progress — Heroes Collector

Stato di avanzamento del lavoro di hardening basato su `REVIEW-VIREN-2026-05-25.md`.
Aggiornato man mano. Se la sessione si interrompe, **riprendi dal primo blocco non spuntato**.

Ordine d'attacco (dalla review):
1. B4 + B5/B6 (transazioni + migration)
2. B1 + B2 + B3 + B7 (auth + EventSub)
3. Test + lint + CI
4. Indici DB + CHECK constraints
5. Realtime vero + Bits + pulizia frontend ("addicting")

---

## ✅ Blocco 1 — Integrità dati (FATTO, commit cf61284 + 25c45f1)
- [x] B4 — transazioni atomiche su tutte le spese/ricompense
- [x] B5 — schema_migrations table (migration idempotenti)
- [x] B6 — collisione 012/013 risolta (rinominato + tipi allineati)

## ✅ Blocco 2 — Auth + EventSub (FATTO, build verde backend+frontend)
- [x] B2 — JWT con `algorithms: ['HS256']` (pinning algoritmo)
- [x] B3 — backdoor dev gated da flag esplicita `ALLOW_DEV_AUTH` + fail-fast in prod
- [x] B7 — EventSub: HMAC su raw bytes + `timingSafeEqual` + cap su gift.total (max 100) + anti-replay (finestra 10 min)
- [x] B1 — frontend: refresh token ad ogni `onAuthorized` (no più 401 dopo 30 min)
- [x] rimosso default pericoloso `jwtSecret: 'dev-secret'`
- [x] `validateEnv()` fail-fast all'avvio in produzione
- ⚠️ NUOVO: per dev locale serve `ALLOW_DEV_AUTH=true` in `backend/.env` (documentato in .env.example)

## ✅ BUG PRIORITÀ MAX — PVP arena vuota (FATTO, build verde + test unit)
Root cause: `findAndFight` cercava avversari solo tra chi aveva già una riga `leaderboard`
+ party attivo → in testing/bassa popolazione 0 avversari → errore, mai un fight = "arena vuota".
Fix:
- [x] ricerca avversario allargata (qualsiasi utente con party attivo non vuoto, niente requisito leaderboard)
- [x] avversario BOT di fallback scalato sul party del giocatore (`pvpBot.ts`) → PVP sempre giocabile
- [x] ELO/save bot-aware (no update avversario inesistente, defender NULL)
- [x] badge "🤖 BOT" nel frontend (trasparenza)
- [x] test unit del generatore: `backend/src/scripts/verifyPvpBot.ts` (npx ts-node)
- ⚠️ DA VERIFICARE LIVE: flusso PVP completo contro DB reale in locale

## ⬜ Blocco 3 — Test + lint + CI
- [ ] da fare (seed: c'è già verifyPvpBot.ts come primo test)

## ⬜ Blocco 4 — Indici DB + CHECK constraints (DB-H1/H3/H4, DB-H2 float→int)
- [ ] da fare

## ⬜ Blocco 5 — Realtime + Bits + frontend ("fighissima e addicting")
- [ ] H1 realtime vero (PubSub/socket)
- [ ] FE-H Bits shop (useBits + SKU mapping)
- [ ] H2/H3/H4/H5/H6 rimanenti
- [ ] feature engagement (eventi, trading, tornei, sfide chat)

---
_Nota: il "rendere addicting" sta nel Blocco 5. Prima si stabilizza (auth + economia), poi si aggiunge l'engagement._
