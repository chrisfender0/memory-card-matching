import { Emitter } from '../utils/Emitter.js';
import { Timer } from './Timer.js';
import { ScoreController } from './ScoreController.js';

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

    this.timer = new Timer(durationSeconds);
    this.scoreController = new ScoreController();
    // Starts on the first real flip rather than at construction, so idle
    // time spent studying a freshly-dealt board doesn't burn the clock.
    this._timerStarted = false;

    this.timer.on('tick', (secondsRemaining) => this.emit('tick', { secondsRemaining }));
    this.timer.on('timeout', () => this._handleTimeout());
  }

  get score() {
    return this.scoreController.score;
  }

  selectCard(card) {
    if (this.locked) return;
    if (card.matched || card.faceUp || card.isAnimating) return;
    if (this.selected.includes(card)) return;

    if (!this._timerStarted) {
      this._timerStarted = true;
      this.timer.start();
    }

    card.flip();
    this.selected.push(card);

    if (this.selected.length < 2) return;

    this.moves += 1;
    this.locked = true;
    this.emit('move', { moves: this.moves });

    const [a, b] = this.selected;
    if (a.faceId === b.faceId) {
      this._resolveMatch(a, b);
    } else {
      setTimeout(() => this._resolveMismatch(a, b), MISMATCH_DELAY);
    }
  }

  _resolveMatch(a, b) {
    this.matchedPairs += 1;
    this.selected = [];
    // locked stays true through the shake+explode animation — unlocked in
    // onCardAnimDone below once both cards have fully left the board.

    const secondsRemaining = this.timer.getSecondsRemaining();
    const breakdown = this.scoreController.recordMatch(secondsRemaining);

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

      this.locked = false;
      if (isFinalPair) {
        this.timer.pause();
        this.emit('win', { won: true, moves: this.moves, score: this.score });
      }
    };

    a.playMatchAnimation(onCardAnimDone);
    b.playMatchAnimation(onCardAnimDone);
  }

  _resolveMismatch(a, b) {
    a.flip();
    b.flip();
    this.selected = [];
    this.locked = false;
    this.scoreController.recordMismatch();
    this.emit('mismatch', { a, b });
  }

  _handleTimeout() {
    if (this.isWon()) return; // last match landed on the same tick as timeout
    this.locked = true;
    this.emit('timeout', { won: false, moves: this.moves, score: this.score });
  }

  isWon() {
    return this.matchedPairs === this.totalPairs;
  }
}
