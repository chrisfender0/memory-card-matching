# Session 7 — UI Overlay (Menus/HUD)

## Goal

Wrap the three.js canvas with an HTML/CSS overlay for level select, in-game HUD, and win screen — the last piece needed for a fully playable game.

## Depends on

Session 4 (`Board` — needs a way to (re)build for a chosen level), session 5 (`GameController` events: `onMove`, `onMatch`, `onWin`), session 6 (input, so gameplay is testable end to end).

## Tasks

- Plain HTML/CSS overlays layered above the canvas (`position: fixed`/`absolute`, `z-index`), no framework.
- **Level select screen** (shown on load and after returning from a game): 3 buttons — Easy (4×4), Medium (6×6), Hard (8×8). Tapping builds the board for that level and hides this screen.
- **In-game HUD**: small fixed header/footer showing move count and elapsed timer (start on first flip, stop on win), plus a "Menu" button to abandon and return to level select (disposing the current board via `Board.dispose()`).
- **Win screen**: overlay shown on `onWin` with final moves/time, "Play Again" (rebuild same level) and "Level Select" buttons.
- Wire all of this from a small `src/ui/UI.js` (or directly in `main.js` if it stays small) that owns overlay DOM refs and listens to `GameController` events to update HUD/win screen.
- Style overlay for mobile: large tap targets (min ~44px), readable at small viewport widths, safe-area padding for notched devices (`env(safe-area-inset-*)`).

## Files touched

`index.html` (overlay markup), `src/style.css` (overlay styling), `src/ui/UI.js` (new), `src/main.js` (wiring).

## Done when

- From a cold load: level select appears, choosing any level starts a working game with live move/timer HUD, winning shows the win screen with correct stats, and both "Play Again" and "Level Select" correctly rebuild/reset state with no leftover cards or event listeners from the previous game.
