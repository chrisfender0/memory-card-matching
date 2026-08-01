# Memory Card Matching

A mobile-first memory matching game built with three.js. Flip cards, find pairs, race the clock.

Play it live: **https://chrisfender0.github.io/memory-card-matching/**

## Stack

- Vanilla JavaScript (ES modules), [three.js](https://threejs.org/) for the 3D card board, [Vite](https://vitejs.dev/) for dev/build.
- No UI framework — the menus/HUD are plain HTML/CSS overlaid on the WebGL canvas.
- All card art is generated procedurally on a `<canvas>` at runtime (gradients, shapes, pip counts) — no image assets.
- No backend. The leaderboard and last-used name persist in the browser's `localStorage`.

## Running it

```bash
npm install
npm run dev
```

Opens a dev server (default `http://localhost:5173`) with hot reload.

## Building for production

```bash
npm run build
```

Outputs a static bundle to `dist/`. To preview that exact build locally before deploying:

```bash
npm run preview
```

## How to play

1. **Landing screen** — shows the leaderboard (top scores across all players/levels). Tap **Play**.
2. **Setup screen** — enter a name and pick a difficulty (Easy 4×4, Medium 6×6, Hard 8×8). Tap **Play**.
3. **Game** — tap two cards to flip them. Matching pairs score points (more if matched quickly, plus a streak bonus for consecutive matches) and shake-then-explode off the board. You have 2 minutes; match every pair before the clock runs out to win.
4. **Result screen** — shows your final score and move count, saved to the leaderboard. **Play Again** restarts the same level; **Menu** returns to the landing screen.

**Reset Data** on the landing screen wipes the saved leaderboard and name (with a confirmation step) — useful for starting fresh.

## Project structure

```
index.html              Screen markup (landing/setup/HUD/result) + canvas
src/
  main.js               Boots three.js, wires screens together, render loop
  style.css              All styling (dark theme, mobile-safe-area aware)
  assets/
    cardArt.js            Procedural canvas-drawn card face/back textures
  game/
    Card.js                Single card: flip tween, match shake/explode animation
    Board.js                Deck building/shuffling, grid layout for a level
    GameController.js       Turn logic: selection, match/mismatch, win/timeout
    Timer.js                 Countdown clock (starts on first flip)
    ScoreController.js       Scoring formula + streak bonus
    GameSession.js           Shared per-game state (player name, level, score)
  storage/
    leaderboard.js         localStorage read/write, reset
  ui/
    screenManager.js       Minimal show/hide screen router
    hud.js                  In-game moves/timer/score display
    screens/
      Landing.js, Setup.js, Result.js   Each screen's DOM wiring
  utils/
    Emitter.js              Tiny pub/sub used by GameController and Timer
  debug/
    assetsGallery.js       Dev-only card art preview (visit /assets-gallery.html)
plan/                    Session-by-session build plan this project followed
```

## Deployment

Deployed automatically to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml` (builds with `npm run build`, publishes `dist/`). See `plan/09.1-github-pages-deploy.md` for details.
