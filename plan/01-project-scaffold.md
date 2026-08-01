# Session 1 — Project Scaffold

## Goal

Get a running three.js scene rendering in a mobile-sized viewport, with a build tool in place. No game logic yet.

## Tasks

- Init project with Vite (`npm create vite@latest . -- --template vanilla`), or hand-roll a minimal `package.json` + `index.html` if Vite is undesired — either is fine as long as there's a `dev` and `build` script.
- Add three.js as the only dependency (`npm install three`).
- `index.html`: mobile viewport meta tag (`width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no`), full-height `<body>`/`<canvas>` with no scroll/bounce (CSS: `overflow: hidden`, `touch-action: none`, `overscroll-behavior: none`).
- `src/main.js`: create `THREE.Scene`, `THREE.PerspectiveCamera` (or orthographic — orthographic is simpler for a flat card grid, recommend it), `THREE.WebGLRenderer` with `antialias: true`, sized to `window.innerWidth/innerHeight`.
- Resize handler: update camera + renderer on `window.resize` and `orientationchange`.
- Basic render loop (`requestAnimationFrame`) rendering an empty scene (or a placeholder cube) to confirm the pipeline works.
- `.gitignore` for `node_modules`, `dist`.

## Files touched

`package.json`, `index.html`, `src/main.js`, `src/style.css`, `vite.config.js` (if needed).

## Done when

- `npm run dev` opens a page that renders a three.js scene, resizes correctly on device rotation, and has no page scroll/bounce on mobile Safari/Chrome.
- `npm run build` produces a `dist/` bundle with no errors.
