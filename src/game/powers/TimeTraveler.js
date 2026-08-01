import { PowerBase } from './PowerBase.js';

const MATCH_BONUS_SECONDS = 5;
const MISMATCH_TRIGGER = 3;
const MISMATCH_PENALTY_SECONDS = 2;

// Pure timer manipulation, no scoring changes: every match adds time to
// the clock, and a bad 3-mismatch streak costs a bit of it back.
export class TimeTraveler extends PowerBase {
  onMatch(cardA, cardB, ctx) {
    ctx.timer.addSeconds(MATCH_BONUS_SECONDS);
  }

  onMismatch(cardA, cardB, ctx) {
    if (ctx.mismatchStreak >= MISMATCH_TRIGGER) {
      ctx.timer.addSeconds(-MISMATCH_PENALTY_SECONDS);
      ctx.controller.mismatchStreak = 0;
    }
  }
}
