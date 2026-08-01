import { PowerBase } from './PowerBase.js';

const GREASY_TRIGGER_CHANCE = 0.25;
const PEEK_DURATION_MS = 1000;
const GREASY_MISMATCH_THRESHOLD = 3;

// Matching a pair sometimes flips a different random card face-up for a
// quick peek, then flips it back down on its own — pure information, no
// scoring or persistent state change. A cooldown guarantees a peek-triggering
// match is always followed by one guaranteed-quiet match before normal
// rolling resumes, so it can never chain on two matches in a row.
//
// Separately: a card that's been part of 3+ mismatches gets too greasy to
// keep a grip on — it locks face-down and unselectable — until any match
// (this power's own or otherwise) wipes every currently-greasy card clean.
export class GreasyFingers extends PowerBase {
  constructor() {
    super();
    this.onCooldown = false;
  }

  onMismatch(cardA, cardB, ctx) {
    const { cardMismatchCounts } = ctx;
    [cardA, cardB].forEach((card) => {
      if (!card.greasy && cardMismatchCounts.get(card) >= GREASY_MISMATCH_THRESHOLD) {
        card.setGreasy(true);
      }
    });
  }

  onMatch(cardA, cardB, ctx) {
    ctx.board.cards.forEach((card) => {
      if (card.greasy) card.setGreasy(false);
    });

    // Cooldown blocks exactly the one match immediately following a peek,
    // then clears itself here so the match after that rolls normally again.
    const wasOnCooldown = this.onCooldown;
    this.onCooldown = false;
    if (wasOnCooldown) return;

    if (Math.random() >= GREASY_TRIGGER_CHANCE) return;

    // cardA/cardB are still face-up at this point (not yet flagged
    // `matched` — that happens later in playMatchAnimation), so they're
    // already excluded by the face-down filter below. Greasy cards are
    // excluded too — "can't be flipped" applies to the peek as much as it
    // does to the player.
    const candidates = ctx.board.cards.filter((c) => !c.matched && !c.faceUp && !c.greasy);
    if (candidates.length === 0) return;

    const card = candidates[Math.floor(Math.random() * candidates.length)];
    card.flip();
    this.onCooldown = true;

    setTimeout(() => {
      if (!card.matched) card.flip();
    }, PEEK_DURATION_MS);
  }
}
