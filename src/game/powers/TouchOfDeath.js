import { PowerBase } from './PowerBase.js';

const TRIGGER_MISMATCH_COUNT = 2;
const TOTAL_TRIGGER_LOSS_THRESHOLD = 3;

// A card mismatched twice auto-matches with its real partner for normal
// points — but leaning on the ability is a liability: trigger it twice in a
// row, or a 3rd time total in a single game, and the game ends instantly
// with the score wiped to zero.
export class TouchOfDeath extends PowerBase {
  constructor() {
    super();
    this.touchOfDeathCount = 0;
    this.lastTurnWasTouchOfDeath = false;
    this._triggeredThisTurn = false;
  }

  onMismatch(cardA, cardB, ctx) {
    const { controller, board, cardMismatchCounts } = ctx;

    // If both cards happen to reach the threshold on the exact same
    // mismatch, only the first is force-matched this turn — the other stays
    // eligible to trigger on its own next time it's mismatched.
    const trigger = [cardA, cardB].find(
      (card) => cardMismatchCounts.get(card) === TRIGGER_MISMATCH_COUNT
    );
    if (!trigger) return;

    const partner = board.cards.find(
      (c) => c !== trigger && c.faceId === trigger.faceId && !c.matched && !c.faceUp
    );
    if (!partner) return;

    partner.flip();
    controller._resolveMatch(trigger, partner);

    this._triggeredThisTurn = true;
    this.touchOfDeathCount += 1;

    const isBackToBack = this.lastTurnWasTouchOfDeath;
    const hitTotalCap = this.touchOfDeathCount >= TOTAL_TRIGGER_LOSS_THRESHOLD;
    if (isBackToBack || hitTotalCap) {
      controller.forceLoss('touch-of-death');
    }
  }

  onTurnResolved() {
    this.lastTurnWasTouchOfDeath = this._triggeredThisTurn;
    this._triggeredThisTurn = false;
  }
}
