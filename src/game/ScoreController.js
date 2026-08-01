const BASE_POINTS_FLOOR = 10;
export const STREAK_BONUS_POINTS = 5;
const STREAK_BONUS_THRESHOLD = 2; // this match is at least the 2nd consecutive one

// Move-count threshold T per level for the end-of-game bonus multiplier.
const MOVE_THRESHOLDS = { easy: 20, medium: 40, hard: 60 };

export class ScoreController {
  constructor() {
    this.score = 0;
    this.currentStreak = 0;
    this.highestMatchPoints = 0;
  }

  // The accumulated in-play score, before the end-of-game move-threshold
  // bonus (session 10.4) is applied.
  get rawScore() {
    return this.score;
  }

  // Applies the move-threshold bonus multiplier at game end. Doesn't mutate
  // `this.score` — the raw score keeps accumulating live during play (HUD,
  // etc.), and this is a one-time derived value for the win screen/leaderboard.
  applyMoveThresholdBonus(level, moves) {
    const threshold = MOVE_THRESHOLDS[level];
    const half = threshold / 2;

    let multiplier;
    if (moves <= half) {
      multiplier = 2;
    } else if (moves >= threshold) {
      multiplier = 1;
    } else {
      multiplier = Math.round((2 - (moves - half) / (threshold - half)) * 100) / 100;
    }

    return { multiplier, finalScore: Math.round(this.score * multiplier) };
  }

  recordMatch(secondsRemaining, { multiplier = 1 } = {}) {
    const basePoints = Math.round((BASE_POINTS_FLOOR + secondsRemaining) * multiplier);
    this.currentStreak += 1;

    const streakBonus =
      this.currentStreak >= STREAK_BONUS_THRESHOLD ? Math.round(STREAK_BONUS_POINTS * multiplier) : 0;
    const totalAwarded = basePoints + streakBonus;
    this.score += totalAwarded;
    this.highestMatchPoints = Math.max(this.highestMatchPoints, totalAwarded);

    return { basePoints, streakBonus, totalAwarded };
  }

  recordMismatch() {
    this.currentStreak = 0;
  }
}
