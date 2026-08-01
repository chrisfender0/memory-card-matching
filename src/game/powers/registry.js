import { NoOpPower } from './NoOpPower.js';
import { generatePowerIcon, PLACEHOLDER_POWER_ICONS } from '../../assets/powerIcons.js';

// Populated in session 10.2 with real entries shaped:
// { id, name, description, icon, PowerClass }
//
// The 3 entries below are placeholders (abstract icon, NoOpPower behavior)
// so the session 10.1 carousel has real shapes to render/scroll/select
// against. Session 10.2 replaces this array — no shape change needed.
export const POWERS = PLACEHOLDER_POWER_ICONS.map(({ shapeIndex, hue }, i) => ({
  id: `placeholder-${i + 1}`,
  name: `Power ${i + 1}`,
  description: 'Placeholder power — real copy and effect arrive in session 10.2.',
  icon: generatePowerIcon(shapeIndex, hue),
  PowerClass: NoOpPower,
}));

// Falls back to NoOpPower for an unknown/missing id so a bad or stale
// selection can never crash the game.
export function getPower(id) {
  const entry = POWERS.find((power) => power.id === id);
  return entry ? new entry.PowerClass() : new NoOpPower();
}
