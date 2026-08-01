# Session 3 — Card Object

## Goal

A reusable `Card` class representing a single physical card mesh with a flip animation, built on top of the textures from session 2.

## Depends on

Session 2's `cardArt.js` (`CARD_FACES`, `generateCardBack`).

## Tasks

- `src/game/Card.js` exporting class `Card`:
  - Geometry: thin `THREE.BoxGeometry` (or `PlaneGeometry` doubled up front/back) sized for grid use, e.g. unit 1×1×0.05.
  - Materials: array of 6 (for BoxGeometry) — front face uses the card's assigned face texture, back face uses the shared back texture, edges use a plain neutral material. (If using two overlapping planes instead of a box, that's acceptable too — pick whichever is simpler to flip convincingly; box is recommended for a believable 3D flip.)
  - Constructor args: `faceId` (0–31), position.
  - State: `faceUp` (bool), `matched` (bool), `isAnimating` (bool).
  - `flip()` method: tweens `mesh.rotation.y` (or `.x`) by 180° over a fixed duration (e.g. 300ms) using a simple manual easing function (no tween library — keep dependencies at zero beyond three.js). Sets `isAnimating` true/false around the tween, flips `faceUp` at completion.
  - `setMatched()`: visual state change for a matched pair (e.g. slight scale-down, emissive tint, or fade — keep simple, polish comes in session 8).
  - `update(deltaTime)` hook if animation is driven by the main render loop rather than an internal RAF.

## Files touched

`src/game/Card.js` (new).

## Done when

- A standalone test scene (temporary, can live in `main.js` behind a flag) instantiates a handful of `Card`s with different `faceId`s, and tapping/calling `.flip()` visibly rotates a card from back to front and back again, smoothly, with `isAnimating` correctly blocking re-triggering mid-flip.
