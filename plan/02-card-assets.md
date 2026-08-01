# Session 2 — Procedural Card Assets

## Goal

Generate 32 unique, visually distinct card-face textures plus 1 card-back texture, all drawn procedurally (canvas 2D), no external image files.

## Approach

"CSS-generated" in practice means: draw each face onto an off-screen `<canvas>` using 2D context calls that mirror what you'd do with CSS gradients/shapes (`createLinearGradient`/`createRadialGradient`, `arc`, `roundRect`, `rotate`), then feed the canvas into `new THREE.CanvasTexture(canvas)`.

## Tasks

- `src/assets/cardArt.js` exporting a function `generateCardFace(index)` → returns a `THREE.CanvasTexture`.
- Define a palette: e.g. hue-stepped colors across 32 indices (`hsl(${i * (360/32)}, 70%, 55%)`) so every card is distinguishable.
- Define a small set of shape "glyphs" (circle, triangle, square, star, hexagon, diamond, ring, cross — 8 shapes) combined with the 32 color hues to produce 32 unique combos (shape rotates through the palette, or shape+color pairs are precomputed as a fixed list of 32 entries so it's deterministic).
- Each face: solid rounded-rect background in a base color + a centered glyph in a contrasting/gradient color, drawn at decent resolution (e.g. 256×256) for crisp scaling.
- `generateCardBack()` → one shared back texture (simple pattern/logo, same rounded-rect shape, neutral color).
- Cache generated textures (generate once at startup, reuse `THREE.CanvasTexture` instances rather than regenerating per card).
- Export a manifest: `CARD_FACES` array of 32 texture-generating entries, indexable by id 0–31.

## Files touched

`src/assets/cardArt.js` (new).

## Done when

- A temporary debug script/page can render all 32 face textures + the back texture to `<img>`/plane grid and each is visibly distinct (no two faces look identical).
- Texture generation runs in well under 100ms total (cheap enough to do at game start with no visible stall).
