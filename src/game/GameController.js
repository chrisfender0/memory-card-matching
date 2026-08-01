import { Emitter } from '../utils/Emitter.js';
import { Timer } from './Timer.js';
import { ScoreController } from './ScoreController.js';
import { gameSession } from './GameSession.js';
import { getPower } from './powers/registry.js';
import { NoOpPower } from './powers/NoOpPower.js';
import { playFlip, playMatch, playMismatch, playWin } from '../audio/sfx.js';

const MISMATCH_DELAY = 800; // ms
const GAME_DURATION_SECONDS = 120;

export class GameController extends Emitter {
  constructor(board, durationSeconds = GAME_DURATION_SECONDS) {
    super();
    this.board = board;
    this.selected = [];
    this.moves = 0;
    this.matchedPairs = 0;
    this.totalPairs = board.cards.length / 2;
    this.locked = false;
    // Set once the game has reached any end state (win, timeout, or a
    // power's forced loss) so a still-in-flight async callback (e.g. a match
    // animation completing after a forced loss already fired) can't emit a
    // second, conflicting end-of-game event.
    this._gameEnded = false;

    this.timer = new Timer(durationSeconds);
    this.scoreController = new ScoreController();
    // Starts on the first real flip rather than at construction, so idle
    // time spent studying a freshly-dealt board doesn't burn the clock.
    this._timerStarted = false;
    this._startedAt = null;

    // Shared power-tracking state — updated unconditionally regardless of
    // whether a power is active, so a power has accurate history from turn 1.
    this.mismatchStreak = 0;
    this.cardMismatchCounts = new Map();

    this.activePower = gameSession.powersEnabled ? getPower(gameSession.selectedPowerId) : new NoOpPower();
    this.activePower.onGameStart(this._powerContext());

    this.timer.on('tick', (secondsRemaining) => this.emit('tick', { secondsRemaining }));
    this.timer.on('adjust', (delta) => this.emit('timeAdjust', { delta }));
    this.timer.on('timeout', () => this._handleTimeout());
  }

  get score() {
    return this.scoreController.score;
  }

  _powerContext() {
    return {
      controller: this,
      timer: this.timer,
      scoreController: this.scoreController,
      board: this.board,
      mismatchStreak: this.mismatchStreak,
      cardMismatchCounts: this.cardMismatchCounts,
    };
  }

  selectCard(card) {
    if (this.locked) return;
    if (card.matched || card.isAnimating) return;
    // A Cold as Ice escalation lock makes a face-down card unselectable
    // outright until every active lock clears.
    if (card.iceLocked) return;
    // A Greasy Fingers mismatch-lock makes a face-down card unselectable
    // until any match wipes every currently-greasy card clean.
    if (card.greasy) return;
    // A frozen (Cold as Ice) card stays permanently face-up but remains
    // targetable for matching — every other face-up card is mid-turn and
    // off-limits until it resolves.
    if (card.faceUp && !card.frozen) return;
    if (this.selected.includes(card)) return;

    if (!this._timerStarted) {
      this._timerStarted = true;
      this._startedAt = performance.now();
      this.timer.start();
    }

    if (!card.faceUp) {
      card.flip();
      playFlip();
    }
    this.selected.push(card);

    if (this.selected.length === 1) {
      this.activePower.onFlipFirstCard(card, this._powerContext());
    }

    if (this.selected.length < 2) return;

    this.moves += 1;
    this.locked = true;
    this.emit('move', { moves: this.moves });

    const [a, b] = this.selected;
    if (a.faceId === b.faceId) {
      this._resolveMatch(a, b);
    } else {
      // Shake/flash immediately (while still face-up) so the mismatch reads
      // as distinct from a match, rather than waiting for the flip-back.
      a.playMismatchShake();
      b.playMismatchShake();
      playMismatch();
      setTimeout(() => this._resolveMismatch(a, b), MISMATCH_DELAY);
    }
  }

  _resolveMatch(a, b) {
    this.mismatchStreak = 0;
    playMatch();
    // A power's onMatch can return a score multiplier (e.g. Telepathy's
    // discounted matches) — defaults to a plain full-value match.
    const multiplier = this.activePower.onMatch(a, b, this._powerContext()) ?? 1;

    this.matchedPairs += 1;
    this.selected = [];
    // locked stays true through the shake+explode animation — unlocked in
    // onCardAnimDone below once both cards have fully left the board.

    const secondsRemaining = this.timer.getSecondsRemaining();
    const breakdown = this.scoreController.recordMatch(secondsRemaining, { multiplier });

    // Points are awarded immediately on match detection — only the visual
    // removal (and, if this was the last pair, the win event) is deferred.
    this.emit('match', {
      a,
      b,
      matchedPairs: this.matchedPairs,
      totalPairs: this.totalPairs,
      score: this.score,
      ...breakdown,
    });

    if (breakdown.streakBonus > 0) {
      this.emit('bonus', { streakBonus: breakdown.streakBonus });
    }

    const isFinalPair = this.isWon();
    let pending = 2;
    const onCardAnimDone = () => {
      pending -= 1;
      if (pending > 0) return;
      // A power's forced loss (e.g. Touch of Death) may have already ended
      // the game while this match's animation was still playing — don't
      // re-unlock the board or fire a second end-of-game event on top of it.
      if (this._gameEnded) return;

      this.locked = false;
      this.activePower.onTurnResolved(this._powerContext());

      if (isFinalPair) {
        this._gameEnded = true;
        this.timer.pause();
        playWin();
        // Move-threshold bonus, then a flat time-remaining bonus (1 pt per
        // second left on the clock) — both are a final, one-time pass at
        // game end, only on an actual win, never on a timeout/forced loss.
        const { multiplier, finalScore: scoreAfterMultiplier } = this.scoreController.applyMoveThresholdBonus(
          gameSession.level,
          this.moves
        );
        const timeBonus = this.timer.getSecondsRemaining();
        const finalScore = scoreAfterMultiplier + timeBonus;
        this.emit('win', {
          won: true,
          moves: this.moves,
          score: finalScore,
          rawScore: this.scoreController.rawScore,
          multiplier,
          scoreAfterMultiplier,
          timeBonus,
          durationSeconds: this._elapsedSeconds(),
          highestMatchPoints: this.scoreController.highestMatchPoints,
        });
      }
    };

    a.playMatchAnimation(onCardAnimDone);
    b.playMatchAnimation(onCardAnimDone);
  }

  _resolveMismatch(a, b) {
    this.mismatchStreak += 1;
    this.cardMismatchCounts.set(a, (this.cardMismatchCounts.get(a) || 0) + 1);
    this.cardMismatchCounts.set(b, (this.cardMismatchCounts.get(b) || 0) + 1);
    this.activePower.onMismatch(a, b, this._powerContext());

    // Frozen cards (Cold as Ice) skip the flip-back entirely and stay
    // face-up; a card a power just force-matched inside onMismatch above
    // (e.g. Touch of Death) is already `matched`, so flip() is a no-op for
    // it too — only the other, still-genuinely-mismatched card flips back.
    if (!a.frozen) a.flip();
    if (!b.frozen) b.flip();
    this.selected = [];
    this.emit('mismatch', { a, b });

    // A power that force-matched one of these cards mid-hook already owns
    // this turn's scoring/unlock/onTurnResolved via its own (async) match
    // flow (see _resolveMatch) — don't stomp on it with the normal
    // mismatch bookkeeping below.
    if (a.matched || b.matched) return;

    this.locked = false;
    this.scoreController.recordMismatch();
    this.activePower.onTurnResolved(this._powerContext());
  }

  _handleTimeout() {
    if (this._gameEnded || this.isWon()) return; // last match landed on the same tick as timeout
    this._gameEnded = true;
    this.locked = true;
    this.emit('timeout', {
      won: false,
      reason: 'timeout',
      moves: this.moves,
      score: this.score,
      durationSeconds: this._elapsedSeconds(),
      highestMatchPoints: this.scoreController.highestMatchPoints,
    });
  }

  // Shared forced-loss path for powers that can end the game outright (e.g.
  // Touch of Death) — distinct from the timeout path: locks input, zeroes
  // the final score regardless of what was scored this game, and routes to
  // the same game-over/leaderboard flow a timeout uses.
  forceLoss(reason = 'forced-loss') {
    if (this._gameEnded) return;
    this._gameEnded = true;
    this.locked = true;
    this.selected = [];
    this.timer.pause();
    this.emit('loss', {
      won: false,
      reason,
      moves: this.moves,
      score: 0,
      durationSeconds: this._elapsedSeconds(),
      highestMatchPoints: this.scoreController.highestMatchPoints,
    });
  }

  isWon() {
    return this.matchedPairs === this.totalPairs;
  }

  // Real wall-clock time spent playing — used for the leaderboard's
  // durationSeconds rather than deriving it from the countdown, since
  // time-altering powers can add/subtract seconds from the clock.
  _elapsedSeconds() {
    if (this._startedAt == null) return 0;
    return Math.round((performance.now() - this._startedAt) / 1000);
  }
}
