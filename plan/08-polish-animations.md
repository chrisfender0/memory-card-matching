# Session 8 — Polish & Animation Pass

## Goal

Take the functionally complete game (post session 7) and polish feel: easing, feedback, celebration. Purely additive — no game-logic changes.

## Depends on

Sessions 3–7 all functioning.

## Tasks

- Replace/upgrade the flip tween from session 3 with proper easing (ease-in-out cubic or similar) if it was linear.
- Add a subtle "pop"/scale bounce on successful match (e.g. scale up then settle) and a brief shake or color pulse on mismatch before flipping back down.
- Board entrance: cards animate in (staggered fade/scale-in) when a level starts, instead of popping in instantly.
- Win celebration: simple effect on the win screen (e.g. confetti via basic canvas particles, or a scale/opacity flourish) — keep it dependency-free, hand-rolled with canvas or CSS animation.
- Optional sound: stub a `src/audio/sfx.js` with `playFlip()`, `playMatch()`, `playWin()` no-ops or simple `AudioContext`-based beeps (no audio library, no external audio files unless the user supplies them) — acceptable to leave as silent stubs if audio is out of scope.
- Perf check: confirm animations stay smooth (60fps target) on the 8×8 board on a mid-tier mobile device/emulation — reduce simultaneous tweens or simplify effects if janky.

## Files touched

`src/game/Card.js`, `src/ui/UI.js`, new `src/audio/sfx.js` (optional).

## Done when

- Flips, matches, and mismatches all have visibly polished motion (not just instant snaps), win screen has a celebratory moment, and the hard (8×8) level stays smooth during rapid play on a throttled/emulated mobile profile.
