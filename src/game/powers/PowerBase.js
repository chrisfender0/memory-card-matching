// Hook contract every power implements. All hooks are no-ops by default so a
// concrete power only needs to override what it actually cares about.
//
// ctx (built fresh per call by GameController) exposes:
//   { controller, timer, scoreController, board, mismatchStreak, cardMismatchCounts }
export class PowerBase {
  // Called once when a game starts.
  onGameStart(ctx) {}

  // Called when a card is selected as the first pick of a new turn, before
  // match/mismatch is known.
  onFlipFirstCard(card, ctx) {}

  // Called once a match is confirmed, before scoring/animation finish.
  // May return a score multiplier (e.g. 0.5 for a discounted match) —
  // GameController applies it to this match's ScoreController.recordMatch
  // call. Returning undefined (the default) awards full value.
  onMatch(cardA, cardB, ctx) {}

  // Called once a mismatch is confirmed.
  onMismatch(cardA, cardB, ctx) {}

  // Called after a turn (match or mismatch) has fully resolved — animation
  // done, board unlocked again.
  onTurnResolved(ctx) {}
}
