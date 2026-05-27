# Spec — Redesign UX Equipaggiamento & Gestione Oggetti ("Scheda Viva")

- **Data:** 2026-05-27
- **Progetto:** Heroes Collector (estensione Twitch)
- **Autore:** Alessio (ShydanRem) + Claude
- **Stato:** Design APPROVATO. Prossimo passo: review spec → `writing-plans`.

---

## 1. Obiettivo

Rendere equipaggiamento e gestione oggetti **intuitivi, chiari e "premium/addicting"**. Due bisogni espliciti:
1. Poter **equipaggiare dalla pagina Eroe** (oggi la sub-tab "Equip" è in sola lettura: mostra gli slot ma per equipaggiare bisogna andare nello Zaino).
2. Rendere **vendita/gestione oggetti** chiara e veloce (oggi: nessun prezzo prima di vendere, nessuna vendita multipla).

## 2. Portata

**In scope** — il "loop gear": pagina Eroe (equip), Zaino (gestione + vendita), look premium coerente su queste schermate.

**Fuori scope (per ora)** — redesign della navigazione globale (i 10 tab), restyle dell'intera app, suoni (di default OFF, eventualmente in un secondo momento), drag&drop, auto-ottimizza loadout su tutti gli slot, lock/preferiti oggetti.

## 3. Stato attuale (sintesi)

- **MyHero** (`frontend/src/components/MyHero.tsx`): header persistente sempre visibile (ritratto, barre stat con bonus equip, Combat Power, barra XP) + sub-tabs (Abilità / **Equip** / Talenti / Missioni / Altro). La sub-tab "Equip" mostra i 3 slot (arma/armatura/accessorio) **in sola lettura**.
- **Inventory / Zaino** (`frontend/src/components/Inventory.tsx`): lista piatta filtrabile per slot; dettaglio oggetto con equip-su-eroe / unequip / vendi. **Nessun prezzo mostrato prima di vendere, nessuna vendita multipla.**
- **API esistenti** (`frontend/src/services/api.ts`): `getInventory()`, `equipItem(inventoryId, heroId)`, `unequipItem(inventoryId)`, `sellItem(inventoryId) → { message, gold }`.
- **Backend**: prezzi di vendita **fissi per rarità** in `itemService.ts` (comune 5, non_comune 15, raro 40, …). CP calcolato **inline** in MyHero (`calculateCP`).
- Pannello Twitch **stretto** (~320px), verticale, scrollabile.

## 4. Design

### ① Pagina Eroe — sub-tab "Equip" interattiva ("Scheda Viva", approccio B+C)

L'header eroe (ritratto + CP + barre stat), **già sempre visibile in alto**, fa da **anteprima viva** — non si duplica il ritratto in un "paper doll".

- **3 slot-card** (arma / armatura / accessorio) che mostrano l'oggetto equipaggiato. Tap su una card → si **espande inline** con i candidati compatibili dallo zaino (nessun salto di schermata).
- Ogni **candidato**: icona, nome (colore rarità), stat, **delta CP** ("↑ +120" verde / "↓ −40" rosso), tasto **Equip**, vendita rapida ("Vendi 15g").
- **Anteprima viva**: al focus/selezione di un candidato, l'header (CP + barre stat) mostra il valore **previsto** (riempimento "fantasma" verde/rosso, numero CP in tween). Deseleziona → torna com'era.
- **Equip confermato**: CP che conta in su, badge **"POWER UP!"** se sale (neutro se sidegrade), glow di rarità sullo slot + micro-bounce.
- **Slot vuoto**: stato tratteggiato "＋", tap per scegliere.
- **Unequip** dal singolo slot.

### ② Zaino premium (hub gestione + vendita)

- **Header riepilogo**: N oggetti · **valore totale** in g.
- **Filtri** per slot + **ordina** per rarità/valore.
- **Card oggetto**: bordo/glow per rarità (epici/leggendari brillano — riuso keyframe `shimmer`), icona, nome, stat, badge "equipaggiato su <eroe>", **valore in g**, badge **NEW** per i non ancora visti.
- **Vendita multipla**: tap per selezionare → **barra sticky** in basso con totale live "+Ng" → un tap "💰 Vendi".
- **Quick-sell intelligente**: "Vendi i comuni non equipaggiati (+Ng)" in un colpo (gli equipaggiati sono **protetti**).
- **Equip anche da qui** su qualsiasi eroe, con lo **stesso confronto** della pagina Eroe.
- **Guardie**: blocco vendita degli equipaggiati; conferma per rarità ≥ raro.

### ③ Juice / feedback

- **Anteprima viva** (vedi ①): vedi CP/stat prima di confermare → zero rischio.
- **Equip**: CP count-up, "POWER UP!", glow rarità, bounce.
- **Vendita**: monete che volano verso il contatore oro (tween); bulk → burst "+Ng" e oggetti che collassano fuori dalla lista.
- **Loot/rarità**: glow/shimmer su epici+, badge NEW sui non visti.
- **Nudge "equipaggia il migliore"**: se per uno slot esiste un pezzo strettamente migliore, micro-suggerimento "⤴ equipaggia il migliore" in un tap.

## 5. Architettura tecnica

### Componenti (frontend)
- `utils/stats.ts`: estrarre **`computeCP(stats, bonuses)`** (oggi inline in MyHero → unica fonte di verità) e **`itemSellValue(item)`** (usa `sellValue` dal payload).
- **`EquipPanel`**: slot-card + picker di confronto; callback di **anteprima/commit** verso `MyHero`, che mantiene uno stato `previewBonuses` per animare l'header.
- **`ItemCard` / `ComparisonRow`** condivisi tra pagina Eroe e Zaino (look coerente, componenti a responsabilità singola).
- Mini-componenti juice: `CountUp` (tween numerico), `PowerUpBadge`, glow CSS in `premium.css`.
- `Inventory` ridisegnato: header riepilogo, sort/filter, multi-select + sticky sell bar, quick-sell.

### Dati / API
- Equip / unequip / sell: **endpoint esistenti**.
- Confronto / anteprima: **100% client** (CP ricalcolato con i bonus scambiati). Nessun backend.
- **Backend #1 (approvato)**: aggiungere **`sellValue`** al payload di ogni inventory item (mapping in `itemService.getInventory`) → **unica fonte di verità** sui prezzi, niente duplicazione/drift nel client.
- **Backend #2 (approvato)**: **`POST /items/sell-bulk { inventoryIds: string[] }`** → `{ soldCount, gold, skipped }`. **Transazionale**; salta equipaggiati e già-venduti; somma per rarità riusando la tabella `sellPrices` esistente. Il quick-sell "comuni non equipaggiati" invia gli id selezionati lato client.

### Gestione errori
- **Equip**: classe incompatibile (disabilitata nel picker via `canHeroEquip`), item già equipaggiato altrove, dati stale → toast + refresh.
- **Sell**: blocco equipaggiati; conferma per rarità ≥ raro; bulk riporta "X venduti, Y saltati".
- UI **ottimistica con rollback** su errore; refresh profilo/inventario dopo ogni mutazione (pattern già in uso).

### Test
- Unit su funzioni pure: `computeCP`, `itemSellValue`, logica "is strictly better", guard "vendibile".
- Backend: `sell-bulk` transazionale (salta equipaggiati, totale corretto, eventuale interazione con cap giornalieri da verificare).
- Allineamento a `vitest` (backend) + CI esistente; test frontend leggeri secondo il setup presente.

## 6. Fuori scope / YAGNI
Suoni (default OFF), drag&drop, auto-ottimizzazione completa del loadout, lock/preferiti oggetti, redesign navigazione globale.

## 7. Stato approvazioni
- Portata = **solo loop gear** ✓
- Priorità = tutte e 4 (confronto, juice, zero-frizione, progressione) ✓
- Approccio = **"Scheda Viva" (B+C)** ✓
- Zaino premium + vendita multipla/quick-sell ✓
- Juice/feedback ✓
- **2 aggiunte backend** (`sellValue` nel payload + `POST /items/sell-bulk`) ✓ (Alessio accetta il redeploy di Render)

_Tutto approvato da Alessio il 2026-05-27. Prossimo passo (domani): Alessio rivede questo spec → poi `writing-plans` per il piano di implementazione._
