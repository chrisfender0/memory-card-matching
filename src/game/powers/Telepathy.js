import { PowerBase } from './PowerBase.js';

const MISMATCH_TRIGGER = 3;
const DISCOUNT_MULTIPLIER = 0.5;

// After 3 consecutive mismatches, the next card flipped reveals its
// still-face-down match elsewhere on the board with a purple glow — a free
// hint for this turn's second pick. Whether it's used right away or the
// card gets matched some other way later, that specific card is always
// worth half points once matched.
export class Telepathy extends PowerBase {
  constructor() {
    super();
    this.charged = false;
    this.highlightedCard = null;
  }

  onMismatch(cardA, cardB, ctx) {
    if (this.charged) return;
    if (ctx.mismatchStreak >= MISMATCH_TRIGGER) {
      this.charged = true;
      ctx.controller.mismatchStreak = 0;
    }
  }

  onFlipFirstCard(card, ctx) {
    if (!this.charged) return;
    this.charged = false;

    const partner = ctx.board.cards.find(
      (c) => c !== card && c.faceId === card.faceId && !c.matched && !c.faceUp
    );
    if (!partner) return;

    partner.telepathyFlagged = true;
    partner.setTelepathyHighlight(true);
    this.highlightedCard = partner;
  }

  // Returning a multiplier here lets GameController apply it to this match's
  // score without every power needing to touch ScoreController directly.
  onMatch(cardA, cardB, ctx) {
    const flagged = [cardA, cardB].find((card) => card.telepathyFlagged);
    if (!flagged) return undefined;

    flagged.telepathyFlagged = false;
    if (this.highlightedCard === flagged) this.highlightedCard = null;
    return DISCOUNT_MULTIPLIER;
  }

  onTurnResolved(ctx) {
    // The hint only covers this turn's second pick — clear the visual once
    // the turn resolves either way (the discount flag itself survives on
    // the card regardless, in case it's matched some other way later).
    if (this.highlightedCard && !this.highlightedCard.matched) {
      this.highlightedCard.setTelepathyHighlight(false);
    }
    this.highlightedCard = null;
  }
}
