import { PowerBase } from './PowerBase.js';

const LUCK_TRIGGER_CHANCE = 0.08;
const MISMATCH_TRIGGER = 5;
const PAIRS_TO_ADD = 2;

// Random flips occasionally auto-complete a match outright (full points, no
// waiting for a second pick); an extended bad streak deals 2 fresh pairs
// onto the board instead of only costing time/points.
export class LuckOfTheDraw extends PowerBase {
  onFlipFirstCard(card, ctx) {
    if (Math.random() >= LUCK_TRIGGER_CHANCE) return;

    const partner = ctx.board.cards.find(
      (c) => c !== card && c.faceId === card.faceId && !c.matched && !c.faceUp
    );
    if (!partner) return;

    // Mirrors exactly what GameController.selectCard does for a normal
    // second-card match — this power is just picking that second card
    // itself instead of waiting for a real click.
    const { controller } = ctx;
    partner.flip();
    controller.moves += 1;
    controller.locked = true;
    controller.emit('move', { moves: controller.moves });
    controller._resolveMatch(card, partner);
  }

  onMismatch(cardA, cardB, ctx) {
    if (ctx.mismatchStreak >= MISMATCH_TRIGGER) {
      ctx.board.addPairs(PAIRS_TO_ADD);
      ctx.controller.mismatchStreak = 0;
    }
  }
}
