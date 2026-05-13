# Post-Test Sprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address the 5 macro-areas of feedback that emerged from the official test on 13/05/2026: combat speed bug, monster sprite quality, gameplay rebalance, UI premium pass, Gambit expansion.

**Architecture:** Five sequential phases, each independently shippable. Phase 1 is a focused bugfix (this session). Phases 2-5 are larger and should be broken into sub-plans when started.

**Tech Stack:** React 18 + TypeScript + Vite (frontend), Express + TypeScript + PostgreSQL (backend), Twitch Extension SDK, OBS overlay.

---

## Sprint Overview

| Phase | Area | Estimated Effort | Status | Priority |
|-------|------|------------------|--------|----------|
| 1 | Combat speed bug | 1-2h | **NEXT** | Critical — blocks gameplay at 2x/3x |
| 2 | Gameplay rebalance | 3-5h | Pending | Critical — economy broken |
| 3 | Gambit expansion + semantic fixes | 3-5h | Pending | High — engagement value |
| 4 | Monster sprite redo | 4-8h | Pending | Medium — visual quality |
| 5 | UI premium pass | 10-20h (multi-session) | Pending | Medium — consistent feel |

**Order rationale:**
1. **Speed bug first** — players actively notice broken combat. Small scope, fast fix, high impact.
2. **Rebalance second** — every day of delay = more over-leveled players in DB. Hard to retroactively fix progression.
3. **Gambit third** — high perceived value, scope is contained, already has design doc in `memory/project_gambit_followup.md`.
4. **Sprites fourth** — visible improvement but doesn't break gameplay. Can be released in batches.
5. **UI premium pass last** — biggest scope. Spread across multiple sessions, 3-4 components per batch.

---

## Phase 1: Combat Speed Bug (THIS SESSION)

**Goal:** Make combat feel correct at 2x (300ms) and 3x (150ms) playback speeds.

### Root Cause Analysis (Phase 1 of systematic-debugging — DONE)

Speed options in `frontend/src/components/BattleView.tsx:7-11` (also in PvpArena, RaidBoss):
- 1x = 600ms per turn, 2x = 300ms, 3x = 150ms

Identified three root causes in `frontend/src/components/BattleArena.tsx`:

**RC#1 — Floating text accumulation (lines 141-147):**
```tsx
useEffect(() => {
  if (floatingTexts.length === 0) return;
  const timer = setTimeout(() => {
    setFloatingTexts(prev => prev.slice(1));  // removes ONE per timer
  }, 1200);  // HARDCODED 1200ms
  return () => clearTimeout(timer);
}, [floatingTexts]);
```
At 3x (150ms/turn), damage entries add a float every 150ms but cleanup removes ONE every 1200ms. Floats accumulate 8x faster than they clear → visual overload (overlapping `-99` numbers everywhere).

**RC#2 — Battle bubble accumulation (lines 150-156):** Same pattern, cleanup at hardcoded 1500ms vs addition rate ~500ms.

**RC#3 — Untracked side-effect timers (lines 219-223, 272-276, 318-322):**
- Ultimate freeze reset: `setTimeout(..., 1000)` — NO ref to clear
- Crit shake/flash reset: `setTimeout(..., 400)` — NO ref to clear
- Animation reset: `setTimeout(..., speed * 0.6)` — NO ref to clear

At 3x, multiple of these fire in flight. The fire-and-forget timer from entry #1 fires DURING entry #3's processing and incorrectly resets state set by #3.

### Task 1.1: Add failing repro (visual smoke test)

**Files:**
- Modify: `frontend/src/components/BattleArena.tsx`

**Repro is manual** (no test framework set up). Document repro steps:

- [ ] **Step 1: Document repro in comment**

Add to the top of `BattleArena.tsx`, just below imports:

```tsx
// REPRO BUG (pre-fix): set speed=150 (3x) and run a dungeon with 8+ heroes.
// EXPECTED: floats clear in ~1.2s, bubbles in ~1.5s, crit FX last ~0.4s.
// ACTUAL: 10+ floats overlap on screen at once, screen shake persists into
// next non-crit turns, ultimate freeze visual lingers.
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/BattleArena.tsx
git commit -m "docs: document combat speed repro before fix"
```

### Task 1.2: Fix RC#1 — floating text cleanup scales with playback

**Files:**
- Modify: `frontend/src/components/BattleArena.tsx:141-147`

- [ ] **Step 1: Replace the floating-texts cleanup effect**

Replace lines 141-147 with:

```tsx
// Cleanup floating text — vita scalata sulla velocità così alla 3x
// non si accumulano. Al minimo 250ms per restare leggibili.
useEffect(() => {
  if (floatingTexts.length === 0) return;
  const lifeMs = Math.max(250, speed * 1.5);
  const timer = setTimeout(() => {
    setFloatingTexts(prev => prev.slice(1));
  }, lifeMs);
  return () => clearTimeout(timer);
}, [floatingTexts, speed]);
```

Result: at 1x (600ms), floats last 900ms. At 2x (300ms), 450ms. At 3x (150ms), 250ms (floor). Always slightly longer than turn duration so user reads them, but never accumulates.

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```
Expected: clean build, no TS errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/BattleArena.tsx
git commit -m "fix: scale floating text lifetime with playback speed"
```

### Task 1.3: Fix RC#2 — battle bubble cleanup scales

**Files:**
- Modify: `frontend/src/components/BattleArena.tsx:150-156`

- [ ] **Step 1: Replace the bubbles cleanup effect**

```tsx
useEffect(() => {
  if (bubbles.length === 0) return;
  const lifeMs = Math.max(400, speed * 2);
  const timer = setTimeout(() => {
    setBubbles(prev => prev.slice(1));
  }, lifeMs);
  return () => clearTimeout(timer);
}, [bubbles, speed]);
```

Bubbles get a longer floor (400ms) because they're chatter text — readability is more important. At 1x bubble lasts 1200ms, at 3x 400ms.

- [ ] **Step 2: Verify build + Commit**

```bash
cd frontend && npm run build
git add frontend/src/components/BattleArena.tsx
git commit -m "fix: scale battle bubble lifetime with playback speed"
```

### Task 1.4: Fix RC#3 — track all transient FX timers in refs

**Files:**
- Modify: `frontend/src/components/BattleArena.tsx` — three setTimeout sites

- [ ] **Step 1: Add refs for fx timers**

After line 78 (`const timerRef = useRef<number | null>(null);`), add:

```tsx
const ultimateTimerRef = useRef<number | null>(null);
const critTimerRef = useRef<number | null>(null);
const animResetTimerRef = useRef<number | null>(null);
```

- [ ] **Step 2: Replace ultimate freeze setTimeout (lines 219-223)**

Find:
```tsx
setTimeout(() => {
  setIsUltimateActive(false);
  setIsShaking(false);
  setIsFlashing(false);
}, 1000); // 1s di freeze visivo per le supreme
```

Replace with:
```tsx
if (ultimateTimerRef.current) clearTimeout(ultimateTimerRef.current);
ultimateTimerRef.current = window.setTimeout(() => {
  setIsUltimateActive(false);
  setIsShaking(false);
  setIsFlashing(false);
}, Math.max(600, speed * 1.5)); // freeze scalato sulla velocità
```

- [ ] **Step 3: Replace crit reset setTimeout (lines 272-276)**

Find:
```tsx
setTimeout(() => {
  setIsShaking(false);
  setIsFlashing(false);
  setIsImpactActive(false);
}, 400);
```

Replace with:
```tsx
if (critTimerRef.current) clearTimeout(critTimerRef.current);
critTimerRef.current = window.setTimeout(() => {
  setIsShaking(false);
  setIsFlashing(false);
  setIsImpactActive(false);
}, Math.max(200, speed * 0.5));
```

- [ ] **Step 4: Replace animation reset setTimeout (lines 318-322)**

Find:
```tsx
setTimeout(() => {
  setActiveActorId(null);
  setActiveTargetId(null);
  setActionType(null);
}, speed * 0.6);
```

Replace with:
```tsx
if (animResetTimerRef.current) clearTimeout(animResetTimerRef.current);
animResetTimerRef.current = window.setTimeout(() => {
  setActiveActorId(null);
  setActiveTargetId(null);
  setActionType(null);
}, Math.max(80, speed * 0.6));
```

- [ ] **Step 5: Clean up timers on unmount**

Find the existing cleanup effect for `timerRef` (if any) or add at the end of the component (before `function handleSkip`):

```tsx
useEffect(() => {
  return () => {
    [timerRef, ultimateTimerRef, critTimerRef, animResetTimerRef].forEach(ref => {
      if (ref.current) clearTimeout(ref.current);
    });
  };
}, []);
```

- [ ] **Step 6: Verify build**

```bash
cd frontend && npm run build
```
Expected: clean build.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/BattleArena.tsx
git commit -m "fix: track all FX timers in refs to avoid stale state at high speed"
```

### Task 1.5: Fix hardcoded ultimate minimum delay

**Files:**
- Modify: `frontend/src/components/BattleArena.tsx:128-130`

The ultimate-name detection at line 128-130 has `nextDelay = Math.max(nextDelay, 1500)`. At 3x, this means ultimates take 10x longer than normal turns, which breaks the "fast playback" expectation.

- [ ] **Step 1: Scale ultimate minimum with speed**

Find:
```tsx
if (entry.action && ultimateNames.some(name => entry.action!.includes(name))) {
  nextDelay = Math.max(nextDelay, 1500);
}
```

Replace with:
```tsx
if (entry.action && ultimateNames.some(name => entry.action!.includes(name))) {
  // Ultimate ha sempre durata extra ma scalata sulla velocità (minimo 700ms)
  nextDelay = Math.max(nextDelay, Math.max(700, speed * 2.5));
}
```

- [ ] **Step 2: Verify + Commit**

```bash
cd frontend && npm run build
git add frontend/src/components/BattleArena.tsx
git commit -m "fix: scale ultimate freeze duration with playback speed"
```

### Task 1.6: Manual smoke test at 3x

- [ ] **Step 1: Start dev server**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: Run a dungeon at 3x speed**

Open in browser, log in as test user, equip 4-hero party, run any zone dungeon at speed 3x.

**Acceptance criteria:**
- ✅ No more than 3-4 floating texts visible simultaneously
- ✅ Battle bubbles disappear within ~500ms at 3x
- ✅ Crit shake doesn't linger into next non-crit turn
- ✅ Ultimate freeze visible but proportional to playback speed
- ✅ No console errors or warnings

- [ ] **Step 3: Build and ship**

```bash
cd frontend && npm run build
# Regenerate zip
powershell -c "Compress-Archive -Path frontend/dist/* -DestinationPath frontend/twitch-extension.zip -Force"
git add frontend/twitch-extension.zip
git commit -m "build: refresh twitch zip with combat speed fixes"
git push origin main
```

User uploads zip to Twitch dashboard.

---

## Phase 2: Gameplay Rebalance

**Goal:** Slow down progression so a casual evening yields ~lv4-5 (not lv9 + 3 stages cleared). Fix shop economy so EXP/energy purchases aren't trivializing.

**This phase needs its own detailed plan when started.** Outline:

### 2.1 Define progression targets (DESIGN, before code)

Document target curve in `docs/superpowers/plans/2026-05-XX-rebalance-targets.md`:
- Casual session (1-2 hours): reach lv3-4 from new
- Active player (1 week): lv15-20
- Dedicated player (1 month): lv40-50
- Endgame: lv60+

### 2.2 Audit current numbers

Read and document:
- `frontend/src/components/MyHero.tsx:32-34` — `expForLevel = floor(150 * level^1.5)`
- `backend/src/services/dungeonService.ts:240-244` — `calculateWaveExp`
- `backend/src/data/zones.ts` — `rewardMultiplier` per zona
- `backend/src/data/dungeonModifiers.ts` — `expMultiplier`
- `backend/src/services/shopService.ts:178-190` — `exp_potion` cost/reward (200 EXP per ~? gold)
- `backend/src/services/channelPointsService.ts:99-107` — `exp_boost` 500 EXP per channel points
- `backend/src/services/channelPointsService.ts:85-97` — `energy_boost` / `energy_full`
- `backend/src/services/userService.ts` — energy regen rate, max_energy

### 2.3 Re-balance EXP curve

Steeper exponent (e.g. `2.0` instead of `1.5`) and higher base (e.g. `300` instead of `150`).
Test that level 10 requires ~10× the EXP of level 2.

### 2.4 Re-balance shop costs

- Raise `exp_potion` cost OR reduce EXP gained per potion
- Cap `energy_full` purchases per day (track in `daily_purchases` table or use existing limits)
- Make `exp_boost` channel-point cost reflect rarity

### 2.5 Adjust dungeon reward multipliers

If zone progression feels too fast even with new curve, reduce `rewardMultiplier` for zones 1-3 (early zones).

### 2.6 Migration script

Write a one-shot SQL migration to bring existing users in line. NOT a level reset (would be punishing) — just acknowledge the new baseline.

### 2.7 Smoke test + commit

Test full progression: new user → lv5 after ~1h of dungeons.

**Exit criteria:** Casual session no longer crosses 3 stages or hits lv9.

---

## Phase 3: Gambit Expansion + Semantic Fixes

**Goal:** Make Gambit a real "feature" — fix the 4 semantic bugs documented in `memory/project_gambit_followup.md`, add new conditions/actions, target guides action selection.

**This phase needs its own detailed plan when started.** Outline:

### 3.1 Fix #2 — Target Gambit guides selectTargets

Add `preferredTarget?: BattleFighter` param to `chooseAbility` return, propagate to `selectTargets`, override default targeting when set. Tests: PVE battles where rule says "attack boss" actually hit the highest-HP enemy.

### 3.2 Fix #3 — has_no_buff filters real buffs

Define `BUFF_STATUS_EFFECTS = [FURIA, BENEDIZIONE, SCUDO, RIGEN, RIFLESSO]`. Change condition check to filter `statusEffects` by inclusion in BUFF_STATUS_EFFECTS.

### 3.3 Fix #4 — hp_lt_X resolves target first

Refactor `chooseAbility` Gambit block: resolve `target` to specific fighter(s) BEFORE checking condition. For `ally_lowest_hp`, find min-HP ally then check that ONE fighter's HP.

### 3.4 Add isBoss flag

`backend/src/services/battleEngine.ts:11` — extend `BattleFighter` with `isBoss?: boolean`. Set from monster `tier === 'boss'` in `createFighter`. `enemy_boss` target now works.

### 3.5 New conditions

- `ultimate_ready` — check cooldowns for any ULTIMATE ability
- `turn_geq_3` — counter from runBattle
- `ally_dead` — `allies.some(a => !a.isAlive)`
- `enemy_count_geq_3` — `enemies.filter(e => e.isAlive).length >= 3`

### 3.6 New actions

- `wait` — return null from chooseAbility (skip turn, save ultimate)
- `buff_ally` — explicit (currently mapped to SUPPORTO power > 0)

### 3.7 UI improvements

`TacticsEditor.tsx`:
- Checkbox `enabled` per rule
- Up/down arrows for priority reordering
- Priority number badge per rule

### 3.8 Backend validation

`backend/src/routes/tactics.ts:50-56` — validate each rule's shape (target, condition, action are in known enums; enabled is boolean).

---

## Phase 4: Monster Sprite Redo

**Goal:** All ~22 monsters at shydanrem-quality SVG. Fix name↔sprite mismatches.

**This phase needs its own detailed plan when started.** Outline:

### 4.1 Audit current monster sprites

Read `frontend/src/components/HeroSprite.tsx` lines 670-1500 (MonsterSprite switch). List all 22 cases with current visual summary.

### 4.2 Identify mismatches

User reports "nemmeno corrispondono" — go through each name (Slime Oscuro, Goblin, Pipistrello Vampiro, etc.) and document which sprite doesn't match.

### 4.3 Redesign per monster (batch of 4-5 per session)

Apply same standards as hero sprites:
- `filter="url(#shadow)"` wrap
- Tier color as accent (minion #666, elite #9c27b0, boss #f44336)
- 4+ animated elements (eyes, idle bounce, particles for boss)
- Distinctive silhouette matching the name

### 4.4 Build + zip + commit per batch

---

## Phase 5: UI Premium Pass

**Goal:** All other component screens match the JRPG card quality of MyHero.

**This phase needs its own detailed plan when started.** Outline:

Components to redesign (in priority by visibility):

**Batch 1 — Combat & Heroes (most visible):**
1. `BattleArena` / `BattleView` — combat HUD, damage popups, victory screen
2. `PvpArena` — opponent display, ELO display, post-battle summary
3. `RaidBoss` — boss HP bar premium, contribution leaderboard

**Batch 2 — Economy & Roster:**
4. `Shop` / `BitShop` — cards for items, hover effects, rarity glow
5. `Inventory` — equipment grid, stat tooltips, equipped indicator
6. `Roster` — hero cards with JRPG mini-frames

**Batch 3 — Social & Progress:**
7. `Leaderboard` — top players with avatars, rank ascend animation
8. `Missions` / `Achievements` — progress bars, claim animations
9. `DailyLogin` — 7-day cycle visualization

**Batch 4 — Specials:**
10. `CaptureMinigame` — capture wheel polish, crit chance bar
11. `HeroReveal` — reveal animation when generating new hero
12. `TacticsEditor` — Gambit UI with the new features (integrated with Phase 3)
13. `TalentTree` — tree visualization improvements
14. `NotificationOverlay`, `StreamOverlay` — overlay polish

Each batch is ~1 session (3-4 hours). Reference style from `MyHero.tsx` + the `.jrpg-*` CSS classes in `styles.css`.

---

## Sprint Self-Review Checklist

- ✅ Each phase has clear goal + exit criteria
- ✅ Phase 1 has bite-sized tasks with exact file paths and code
- ✅ Phase 1 has TDD-style verify steps (build + manual smoke)
- ✅ Phases 2-5 explicitly note they need their own sub-plans
- ✅ No placeholders in Phase 1
- ✅ Order is justified
- ✅ Linked to existing memories (`project-post-test-sprint`, `project-gambit-followup`)

---

## Execution Notes

**Phase 1 execution mode:** Inline (this session). All 6 tasks are small and the user is here to validate.

**Future phases execution mode:** When starting each phase, write its detailed plan first (steal structure from Phase 1), then execute. Subagent-driven for visual work (sprites, UI) where parallelism helps; inline for backend/logic.
