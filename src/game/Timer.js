import { Emitter } from '../utils/Emitter.js';

const DEFAULT_DURATION_SECONDS = 120;
const TICK_INTERVAL_MS = 200;
const MAX_DURATION_SECONDS = 300; // 5:00 ceiling so a time-adding power can't run the clock forever

export class Timer extends Emitter {
  constructor(durationSeconds = DEFAULT_DURATION_SECONDS) {
    super();
    this.durationSeconds = durationSeconds;
    this._remaining = durationSeconds;
    this._running = false;
    this._intervalId = null;
    this._lastTimestamp = 0;
    this._lastWholeSecond = Math.floor(durationSeconds);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTimestamp = performance.now();
    this._intervalId = setInterval(() => this._tick(), TICK_INTERVAL_MS);
  }

  pause() {
    if (!this._running) return;
    this._running = false;
    clearInterval(this._intervalId);
    this._intervalId = null;
  }

  stop() {
    this.pause();
    this._remaining = this.durationSeconds;
    this._lastWholeSecond = Math.floor(this.durationSeconds);
  }

  getSecondsRemaining() {
    return Math.max(0, Math.floor(this._remaining));
  }

  // Positive or negative — clamped to [0, MAX_DURATION_SECONDS]. Emits
  // 'tick' immediately so the HUD reflects the change right away rather
  // than waiting for the next interval, and 'adjust' (the nominal, requested
  // delta) so the UI can call out a power-driven change distinctly from
  // normal per-second ticking.
  addSeconds(n) {
    this._remaining = Math.min(MAX_DURATION_SECONDS, Math.max(0, this._remaining + n));

    const wholeRemaining = this.getSecondsRemaining();
    if (wholeRemaining !== this._lastWholeSecond) {
      this._lastWholeSecond = wholeRemaining;
      this.emit('tick', wholeRemaining);
    }

    if (n !== 0) this.emit('adjust', n);
  }

  _tick() {
    const now = performance.now();
    const elapsed = (now - this._lastTimestamp) / 1000;
    this._lastTimestamp = now;
    this._remaining = Math.max(0, this._remaining - elapsed);

    const wholeRemaining = this.getSecondsRemaining();
    if (wholeRemaining !== this._lastWholeSecond) {
      this._lastWholeSecond = wholeRemaining;
      this.emit('tick', wholeRemaining);
    }

    if (this._remaining <= 0) {
      this.pause();
      this.emit('timeout');
    }
  }
}
