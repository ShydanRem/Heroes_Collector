# Night Work — 2026-05-25 → 26 (autonomo)

Sessione autonoma richiesta da Alessio (va a dormire 23:00, stop alle 05:00 o a token esauriti).

## Regole
- Solo branch `viren/hardening-2026-05-25`, **nessun deploy live**, nessun merge su main.
- Commit frequenti + verde (test/typecheck/build) prima di ogni commit.
- Mai toccare segreti/.env.
- Lavoro testabile senza DB (motore combat, Gambit, pvpBot, heroGenerator, frontend build).

## Baseline (23:04)
- backend `npm test` → 36 test verdi
- backend `npm run typecheck` → ok
- frontend `npm run build` → ok (bundle 378 KB)

## Coda di lavoro (priorità)
### Fase A — Bug motore / Gambit (testabili)
- [ ] A1 — `has_no_buff` include i debuff (filtrare sui buff veri)
- [ ] A2 — flag `isBoss` su BattleFighter (monsters + createFighter)
- [ ] A3 — `hp_lt_X` valutato sul gruppo invece che sul target (risolvere target prima)
- [ ] A4 — target della regola Gambit non guida l'azione (preferredTarget in selectTargets)
- [ ] A5 — validazione shape `tactics_json` (H6)

### Fase B — Polish visivo frontend ("fighissima e addicting")
- [ ] B1 — animazioni/flow arena combattimento
- [ ] B2 — UI premium pass (coerenza jrpg, transizioni)

### Fase C — Meccaniche
- [ ] C1 — nuove condizioni/azioni Gambit (ultimate_ready, turn_geq_N, ally_dead...)
- [ ] C2 — UI tactics: checkbox enabled + riordino regole
- [ ] C3 — meccanica engagement nuova (se tempo)

### Fase D — Hardening sicuro frontend
- [ ] D1 — retry/backoff cold-start Render
- [ ] D2 — gold non aggiornato nella schermata eroe
- [ ] D3 — error handling silenzioso

## Log
- 23:04 — baseline verde, piano impostato. Parto da Fase A.
- 23:08 — Fase A (A1-A5) FATTA. Commit 51e913c. Fix motore Gambit (#2-#5) + validazione tactics + evaluateGambit pura. +24 test (60 totali).
- 23:14 — Fase C1+C2 FATTA. Espanse condizioni Gambit (ultimate_ready, ally_dead, enemy_count_geq_3, turn_geq_3, hp_gt_80) con turno in contesto. UI TacticsEditor: toggle on/off, riordino priorità ▲▼, badge priorità, nuove condizioni, look curato. +5 test (65 totali). Frontend build verde.
  - NB: le modifiche frontend richiedono rebuild+zip+upload su Twitch per andare live (non fatto, come da regole notturne).
