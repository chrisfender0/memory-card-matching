import { PowerBase } from './PowerBase.js';

const FREEZE_MOVE_INTERVAL = 3;
const ESCALATION_MOVE_INTERVAL = 3;

// Only one card can be frozen face-up at a time. The 3-move countdown to the
// next freeze only runs while nothing is currently frozen. Once a card is
// frozen, every 3 more moves it stays unmatched locks another random
// face-down card (never the frozen card's own match) — locks stack
// indefinitely. Any match, frozen or ordinary, clears every active lock;
// matching the frozen card itself also restarts the freeze countdown.
export class ColdAsIce extends PowerBase {
  constructor() {
    super();
    this.frozenCard = null;
    this.nextEscalationMove = 0;
    this.freezeEligibleFromMove = 0;
    this.lockedCards = new Set();
  }

  onTurnResolved(ctx) {
    const moves = ctx.controller.moves;

    if (!this.frozenCard && moves - this.freezeEligibleFromMove >= FREEZE_MOVE_INTERVAL) {
      this._freezeRandomCard(moves, ctx);
    }

    if (this.frozenCard && moves >= this.nextEscalationMove) {
      this._lockRandomCard(ctx);
      this.nextEscalationMove += ESCALATION_MOVE_INTERVAL;
    }
  }

  onMatch(cardA, cardB, ctx) {
    if (this.frozenCard === cardA || this.frozenCard === cardB) {
      this.frozenCard = null;
      this.freezeEligibleFromMove = ctx.controller.moves;
    }
    this._clearLocks();
  }

  _freezeRandomCard(moves, ctx) {
    const candidates = ctx.board.cards.filter((c) => !c.matched && !c.faceUp && !c.iceLocked);
    if (candidates.length === 0) return;

    const card = candidates[Math.floor(Math.random() * candidates.length)];
    card.flip();
    card.setFrozen(true);
    this.frozenCard = card;
    this.nextEscalationMove = moves + ESCALATION_MOVE_INTERVAL;
  }

  _lockRandomCard(ctx) {
    const candidates = ctx.board.cards.filter(
      (c) => !c.matched && !c.faceUp && !c.iceLocked && c.faceId !== this.frozenCard.faceId
    );
    if (candidates.length === 0) return;

    const card = candidates[Math.floor(Math.random() * candidates.length)];
    card.setIceLocked(true);
    this.lockedCards.add(card);
  }

  _clearLocks() {
    this.lockedCards.forEach((card) => card.setIceLocked(false));
    this.lockedCards.clear();
  }
}
