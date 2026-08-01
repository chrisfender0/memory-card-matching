import { NoOpPower } from './NoOpPower.js';

// Populated in session 10.2 with entries shaped:
// { id, name, description, icon, PowerClass }
export const POWERS = [];

// Falls back to NoOpPower for an unknown/missing id so a bad or stale
// selection can never crash the game.
export function getPower(id) {
  const entry = POWERS.find((power) => power.id === id);
  return entry ? new entry.PowerClass() : new NoOpPower();
}
