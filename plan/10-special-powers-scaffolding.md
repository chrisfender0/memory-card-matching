# Session 10 — Special Powers Scaffolding

## Goal

Add the on/off toggle and underlying architecture for an optional "Special Powers" mode, without implementing any specific power's behavior yet (that's sessions 10.1/10.2). After this session, powers can be turned on but the actual selector UI and power effects are still placeholders.

## Depends on

Session 5.1 (setup page — name + difficulty), session 5 (`GameController`), session 5.2 (`Timer`/`ScoreController`), session 5.4 (match animation flow).

## Tasks

### Setup page changes

- On the name + difficulty setup page (session 5.1), add a **"Special Powers"** toggle switch below the difficulty selector.
- When off (default): behaves exactly as today — Play is enabled once name + difficulty are valid.
- When on: reveal a power-selection area. For this scaffolding session, a simple placeholder is fine (e.g. a disabled "Select a power" prompt, or if 10.1 is being done immediately after, leave a `<div id="power-selector-slot"></div>` mount point) — Play stays disabled while the toggle is on and no power is chosen.
- Extend the shared `GameSession` object (from 5.1) with `powersEnabled: boolean` and `selectedPowerId: string | null`.

### Power architecture

- `src/game/powers/PowerBase.js`: a base class (or plain object factory) defining the hook contract every power implements, all as no-ops by default:
  - `onGameStart(ctx)`
  - `onFlipFirstCard(card, ctx)` — called when a card is selected as the first pick of a new turn, before match/mismatch is known.
  - `onMatch(cardA, cardB, ctx)` — called once a match is confirmed, before scoring/animation finish.
  - `onMismatch(cardA, cardB, ctx)` — called once a mismatch is confirmed.
  - `onTurnResolved(ctx)` — called after a turn (match or mismatch) has fully resolved (animation done, board unlocked again).
  - `ctx` should expose whatever a power needs to act: references to `GameController`, `Timer`, `ScoreController`, `Board`, and the shared tracking values below — pass a single `ctx` object rather than many params so adding new hooks/data later doesn't break existing power implementations.
- `src/game/powers/NoOpPower.js`: trivial power used whenever `powersEnabled` is false — every hook does nothing. This guarantees zero behavior change to existing gameplay when powers are off.
- `src/game/powers/registry.js`: exports `POWERS` (empty array for now — populated in session 10.2) and `getPower(id)` (returns `NoOpPower` if `id` isn't found, so the game never crashes on a bad/missing selection).

### GameController wiring

- At game start, instantiate `this.activePower = gameSession.powersEnabled ? getPower(gameSession.selectedPowerId) : new NoOpPower()`.
- Call the corresponding hook at each existing point in the flow: first-card selection (session 6 input → session 5 turn logic), match confirmation (session 5, before/around session 5.2 scoring and session 5.4 animation), mismatch confirmation, and turn-resolved (after session 5.4's animation/unlock completes).
- Add two shared tracking values to `GameController` that powers will read/use later, updated regardless of whether a power is active (cheap to maintain, needed by multiple future powers):
  - `mismatchStreak`: increments on every mismatch, resets to 0 on every match.
  - `cardMismatchCounts`: a `Map` from card instance (or a stable card id) → number of times that specific card has been part of a mismatch.
- These trackers should update unconditionally (not just when a power is active) so 10.2's powers have accurate history from turn 1 even though this scaffolding session ships before them.

### HUD placeholder

- Reserve a small spot in the in-game HUD (session 7) to show the active power's name/icon during play once one exists — can be an empty/hidden element for now if 10.1/10.2 aren't done yet, just make sure the layout has room for it.

## Files touched

`src/ui/screens/Setup.js` (toggle + placeholder slot), `src/game/powers/PowerBase.js` (new), `src/game/powers/NoOpPower.js` (new), `src/game/powers/registry.js` (new), `src/game/GameController.js` (hook call sites, `mismatchStreak`, `cardMismatchCounts`), `src/storage/leaderboard.js` or wherever `GameSession` is defined (extended fields).

## Done when

- Toggling "Special Powers" on the setup page correctly enables/disables the placeholder selection area and gates the Play button (on = requires a power id to be set, even if nothing can actually select one yet).
- With the toggle off, a full playthrough behaves identically to before this session (confirms `NoOpPower` truly no-ops).
- `mismatchStreak` and `cardMismatchCounts` update correctly across a manual test playthrough (verify via console logging) regardless of whether powers are enabled.
- Hook call sites exist at all four points (game start, first flip, match, mismatch, turn resolved) even though no real power consumes them yet.
