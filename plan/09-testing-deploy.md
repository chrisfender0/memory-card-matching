# Session 9 — Testing & Deployment Prep

## Goal

Final pass: verify the whole game across levels/devices, tidy the build, write a README.

## Depends on

All prior sessions complete.

## Tasks

- Manual test checklist (run through and log results, fix anything broken):
  - Each level (easy/medium/hard): deal, flip, match, mismatch-revert, win — all correct.
  - Portrait mobile viewports at a few sizes (e.g. 360×640, 390×844, 428×926 via devtools device emulation); rotation to landscape doesn't break layout or clip the board.
  - Rapid-tap spam doesn't break `locked` state or double-count moves.
  - Level Select → Play Again → Menu round trips leave no leaked cards, listeners, or stuck HUD state.
  - No console errors/warnings across a full playthrough of each level.
- Production build: `npm run build`, confirm `dist/` output loads and plays correctly when served statically (e.g. `npx serve dist` or similar).
- Trim any leftover debug code/flags from earlier sessions (session 3's standalone test scene, session 5's debug trigger) if not already removed.
- Write `README.md`: what the game is, how to run dev (`npm install && npm run dev`), how to build (`npm run build`), how to preview the build, brief file/folder overview.

## Files touched

`README.md` (new), minor cleanup across `src/`.

## Done when

- Full manual checklist passes with no console errors.
- `npm run build` output plays correctly when statically served.
- README is accurate and sufficient for someone else to run the project cold.
