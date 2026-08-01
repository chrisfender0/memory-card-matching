# Session 4 — Board Layout

## Goal

Build the grid of `Card` instances for a given level and lay them out so the whole board fits within the mobile viewport at all three sizes.

## Depends on

Session 3's `Card` class.

## Tasks

- `src/game/Board.js` exporting class `Board`:
  - Config per level: `{ easy: { cols: 4, rows: 4 }, medium: { cols: 6, rows: 6 }, hard: { cols: 8, rows: 8 } }`.
  - `buildDeck(level)`: pick `cols*rows/2` unique `faceId`s from the 32-entry pool (easy needs 8, medium 18, hard 32 — hard uses the full pool), duplicate each, shuffle (Fisher-Yates) into a flat array of length `cols*rows`.
  - `layout(cols, rows, viewportWidth, viewportHeight)`: compute card size + spacing so the full grid fits within the visible camera frustum with margin, accounting for portrait aspect ratio (grid should scale down uniformly, never overflow or require scrolling). Recompute on resize.
  - Instantiate one `Card` per deck slot at its grid position, add all to a `THREE.Group` (the board group) added to the scene.
  - `dispose()`: remove all cards from the group and free geometries/materials/textures references as needed when switching levels.
- Wire into `main.js`: on level choice (hardcode "easy" for now — real menu comes in session 7), build and render a board.

## Files touched

`src/game/Board.js` (new), `src/main.js` (updated).

## Done when

- Each of the three level configs renders a correctly-sized grid (4×4, 6×6, 8×8) that fits on a simulated mobile viewport (test via browser devtools device toolbar) in portrait orientation, no cards clipped or off-screen, and re-fitting correctly on resize/orientation change.
- Every card starts face-down; deck contents are correctly paired and shuffled (verify via console log of `faceId` counts).
