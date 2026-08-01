# Session 6 — Touch/Pointer Input

## Goal

Replace the debug trigger from session 5 with real tap-to-flip input via raycasting, mobile-first (touch), also supporting mouse for desktop testing.

## Depends on

Session 5's `GameController`, session 4's `Board`.

## Tasks

- Use `pointerdown`/`pointerup` (unified pointer events cover touch + mouse) on the renderer's canvas — avoid separate touch/mouse listeners.
- On tap: convert client coords → normalized device coords → `THREE.Raycaster` from the camera → intersect against the board group's card meshes → resolve to the owning `Card` instance (store a back-reference, e.g. `mesh.userData.card = this`, in the `Card` constructor).
- Call `gameController.selectCard(card)` with the resolved card if a hit is found.
- Guard against tap-drag-release firing as a false tap (only treat as a tap if pointerup happens near pointerdown position, small threshold e.g. 10px) so scrolling/dragging gestures don't misfire — should be moot given `touch-action: none` from session 1, but keep the guard cheap insurance.
- Make sure raycasting still resolves correctly after a resize (camera/frustum changes from session 1/4).

## Files touched

`src/main.js` or new `src/game/InputController.js`.

## Done when

- On a real or emulated mobile device (Chrome devtools touch emulation at minimum), tapping a card flips it, tapping a matched or already-face-up card does nothing, tapping during the mismatch-resolution lock does nothing, and this works correctly across all three grid sizes and after device rotation.
