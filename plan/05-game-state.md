# Session 5 — Game State / Match Logic

## Goal

Drive actual gameplay rules on top of the board: selecting cards, checking matches, handling mismatches, detecting win. No input/rendering wiring yet beyond a programmatic trigger (session 6 wires real taps).

## Depends on

Session 4's `Board`/`Card`.

## Tasks

- `src/game/GameController.js` exporting class `GameController(board)`:
  - Tracks `selected` (0–2 cards currently face-up and unmatched), `moves` (count), `matchedPairs`, `totalPairs`, `locked` (bool — true while resolving a pair, blocks new selections).
  - `selectCard(card)`:
    - No-op if `locked`, or card is already `matched`/`faceUp`.
    - Flip the card face-up, push to `selected`.
    - If `selected.length === 1`: wait for next selection.
    - If `selected.length === 2`: increment `moves`, set `locked = true`; compare `faceId`s:
      - Match: call `setMatched()` on both, increment `matchedPairs`, clear `selected`, unlock.
      - Mismatch: after a short delay (~700–900ms) flip both back down, clear `selected`, unlock.
  - `isWon()`: `matchedPairs === totalPairs`.
  - Emit simple events (callback props or a tiny EventTarget-based emitter — no external event lib) for `onMove`, `onMatch`, `onWin` so the UI layer (session 7) can hook in without tight coupling.
- Provide a temporary debug trigger (e.g. click anywhere cycles through cards calling `selectCard` in order) to verify logic end-to-end before real raycasting exists.

## Files touched

`src/game/GameController.js` (new), `src/main.js` (temporary debug wiring).

## Done when

- Programmatically driving `selectCard` calls through a full board correctly matches all pairs, correctly reverts mismatches after the delay, correctly blocks input while `locked`, and fires `onWin` exactly once when the last pair is matched, for all three level sizes.
