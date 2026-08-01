import { NoOpPower } from './NoOpPower.js';
import { Telepathy } from './Telepathy.js';
import { TimeTraveler } from './TimeTraveler.js';
import { LuckOfTheDraw } from './LuckOfTheDraw.js';
import { ColdAsIce } from './ColdAsIce.js';
import {
  generateTelepathyIcon,
  generateTimeTravelerIcon,
  generateLuckOfTheDrawIcon,
  generateColdAsIceIcon,
} from '../../assets/powerIcons.js';

// Populated in full across sessions 10.2.1-10.2.6, each entries shaped:
// { id, name, description, icon, PowerClass }
export const POWERS = [
  {
    id: 'telepathy',
    name: 'Telepathy',
    description:
      'After 3 mismatches, your next flip reveals its match with a purple glow — but that match is worth half points.',
    icon: generateTelepathyIcon(),
    PowerClass: Telepathy,
  },
  {
    id: 'time-traveler',
    name: 'Time Traveler',
    description: 'Every match adds 5 seconds to the clock. 3 mismatches in a row costs you 2 seconds.',
    icon: generateTimeTravelerIcon(),
    PowerClass: TimeTraveler,
  },
  {
    id: 'luck-of-the-draw',
    name: 'Luck of the Draw',
    description: 'Random flips sometimes auto-match. 5 mismatches in a row deals 2 fresh pairs onto the board.',
    icon: generateLuckOfTheDrawIcon(),
    PowerClass: LuckOfTheDraw,
  },
  {
    id: 'cold-as-ice',
    name: 'Cold as Ice',
    description:
      'Every 3rd move freezes a random card face-up — only one at a time. Left unmatched, another card locks face-down every 3 moves after that, until any match breaks the ice.',
    icon: generateColdAsIceIcon(),
    PowerClass: ColdAsIce,
  },
];

// Falls back to NoOpPower for an unknown/missing id so a bad or stale
// selection can never crash the game.
export function getPower(id) {
  const entry = POWERS.find((power) => power.id === id);
  return entry ? new entry.PowerClass() : new NoOpPower();
}
