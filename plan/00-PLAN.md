# Memory Card Matching — Build Plan

Three.js-based memory matching game, mobile-first, minimal dependencies.

## Stack

- Vanilla JS (ES modules), three.js as the only runtime dependency, Vite for dev/build.
- No UI framework. HTML/CSS overlay for menus and HUD, three.js for the game board itself.
- Card face art generated procedurally (canvas 2D drawing driven by CSS-style gradients/shapes), converted to `THREE.CanvasTexture` — no external image files.

## Game spec

- Levels: easy (4×4 = 16 cards / 8 pairs), medium (6×6 = 36 cards / 18 pairs), hard (8×8 = 64 cards / 32 pairs).
- 32 unique face assets total (covers the hard level; easy/medium use subsets).
- Flip-to-reveal, two-card match check, mismatch flips back after a short delay, win when all pairs matched.
- Touch-first input (tap to flip), responsive layout that fits portrait mobile viewports without scrolling.
- Flow: landing page (leaderboard + Play) → name + difficulty page → game. All persisted via `localStorage`, no backend.
- Timed scoring: 2-minute countdown; each match = `10 + secondsRemaining`; consecutive matches with no mismatch in between earn a stacking "perfect match" streak bonus (+5 pts), shown as a popup; timeout with unmatched pairs ends the game distinctly from a win.
- Optional Special Powers mode: toggle on the setup page, pick one of 6 powers (Telepathy, Time Traveler, Luck of the Draw, Cold as Ice, Touch of Death, Greasy Fingers) via a swipeable selector; each power hooks into mismatch/match/flip events to alter scoring, timer, board contents, or card state, per session 10.2.

## Session breakdown

Each numbered file is one Claude Code session — small, self-contained, with a clear "done" condition so a session can be picked up independently.

1. **01-project-scaffold.md** — Vite project setup, three.js install, base HTML/CSS shell, renderer/camera/scene boilerplate, mobile viewport meta, resize handling.
2. **02-card-assets.md** — Procedural generation of 32 card-face textures (canvas-drawn shapes/gradients in varied colors) plus one shared card-back texture.
3. **03-card-object.md** — `Card` class: geometry, materials (front/back), flip animation (rotation tween), state (`faceUp`, `matched`).
4. **04-board-layout.md** — Board/grid builder for 4×4, 6×6, 8×8; responsive spacing/scaling so the full grid fits the mobile viewport; card instancing from the asset pool. (Level choice was hardcoded here initially — session 5.1 replaces that with a real setup flow.)
5. **05-game-state.md** — Shuffle/deal logic, turn state machine (selection, match check, mismatch delay, lock during animation), win detection.
5. **05.1-landing-setup-flow.md** — Landing page with leaderboard (read from `localStorage`) + Play button; name-entry + difficulty-select page; `localStorage`-backed leaderboard/name persistence. Supersedes the level-select portion of session 7.
5. **05.2-scoring-system.md** — 2-minute countdown timer, `10 + secondsRemaining` per match, stacking "perfect match" streak bonus (+5 pts) with popup event data, win-vs-timeout distinction.
5. **05.3-reset-data.md** — "Reset Data" button on the landing page (with confirmation) that clears all game `localStorage` keys (leaderboard, last name, etc.) and re-renders the landing page's empty state.
5. **05.4-match-animation.md** — Replaces the placeholder match visual: both matched cards shake in place for ≥1s, then explode outward off-screen and are removed. Supersedes the match-feedback part of session 8.
6. **06-input-raycasting.md** — Pointer/touch raycasting to pick cards, tap-to-flip wired into the state machine, ignores input while a card is animating or already matched.
7. **07-ui-overlay.md** — HTML/CSS overlay, now scoped to: in-game HUD (score, streak/bonus popups, countdown timer) and win/game-over screen (save score to leaderboard via session 5.1's storage module, Play Again / Back to Landing). Level-select is handled by session 5.1 instead.
8. **08-polish-animations.md** — Easing/timing polish, mismatch feedback (pulse/shake distinct from the match animation in 5.4), win celebration, basic sound hooks (optional, mutable/no-op stub if skipped).
9. **09-testing-deploy.md** — Manual test checklist across the 3 levels and viewport sizes, production build config, README with run/build instructions.
9. **09.1-github-pages-deploy.md** — Vite `base` path config (if a project page rather than the root user page), GitHub Actions workflow to build and deploy `dist/` to GitHub Pages on push, repo Pages settings, live verification.
10. **10-special-powers-scaffolding.md** — "Special Powers" toggle on the setup page, `PowerBase`/`NoOpPower`/registry architecture, hook call sites in `GameController` (game start, first flip, match, mismatch, turn resolved), shared `mismatchStreak`/`cardMismatchCounts` tracking. No real power behavior yet.
10. **10.1-powers-selector.md** — Swipeable/scroll-snap carousel on the setup page showing each power's icon, name, and description; confirm-to-select flow; gates Play the same way difficulty selection does.
10. **10.2-powers-icons-and-plumbing.md** — Procedurally generated icons for all 6 powers, real registry entries/copy, and new shared plumbing every power needs (score multiplier, timer adjustment, board pair-injection, frozen-card state, forced-loss path). No power behavior yet — each registry entry still points at `NoOpPower`.
10. **10.2.1-power-telepathy.md** — Telepathy: after 3 mismatches, next flip's match highlights purple; completing it awards half points.
10. **10.2.2-power-time-traveler.md** — Time Traveler: every match adds 5s to the clock; 3 consecutive mismatches add 2s.
10. **10.2.3-power-luck-of-the-draw.md** — Luck of the Draw: random flips sometimes auto-match; 5 consecutive mismatches injects 2 new pairs onto the board.
10. **10.2.4-power-cold-as-ice.md** — Cold as Ice: after 3 mismatches, next flip freezes face-up until matched, escalating to a second frozen card if ignored too long.
10. **10.2.5-power-touch-of-death.md** — Touch of Death: a card mismatched twice auto-matches; triggering it back-to-back or 3 times total instantly loses the game with 0 points.
10. **10.2.6-power-greasy-fingers.md** — Greasy Fingers: matches sometimes trigger a 1-second peek at another card, gated by a cooldown so it can't chain.

## Suggested order

Sessions run roughly in order: 1 → 2 → 3 → 4 → 5 → 5.1 → 5.2 → 5.3 → 5.4 → 6 → 7 → 8 → 9 → 9.1 → 10 → 10.1 → 10.2 → 10.2.1 → 10.2.2 → 10.2.3 → 10.2.4 → 10.2.5 → 10.2.6; each depends on prior sessions' output existing in the repo. Session 8 (polish), 9/9.1 (testing/deploy), and the 10.x special-powers sessions can be reordered or trimmed if time is short — everything through session 7 is a fully playable game without powers, and the six 10.2.x power sessions are independent of each other (any order, or subset, works once 10.2 is done).
