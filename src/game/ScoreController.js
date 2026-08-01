const BASE_POINTS_FLOOR = 10;
export const STREAK_BONUS_POINTS = 5;
const STREAK_BONUS_THRESHOLD = 2; // this match is at least the 2nd consecutive one

export class ScoreController {
  constructor() {
    this.score = 0;
    this.currentStreak = 0;
  }

  recordMatch(secondsRemaining) {
    const basePoints = BASE_POINTS_FLOOR + secondsRemaining;
    this.currentStreak += 1;

    const streakBonus = this.currentStreak >= STREAK_BONUS_THRESHOLD ? STREAK_BONUS_POINTS : 0;
    const totalAwarded = basePoints + streakBonus;
    this.score += totalAwarded;

    return { basePoints, streakBonus, totalAwarded };
  }

  recordMismatch() {
    this.currentStreak = 0;
  }
}
