function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const TIME_ADJUST_POPUP_DURATION_MS = 1000;

export function initHud() {
  const hud = document.getElementById('hud');
  const movesEl = document.getElementById('hud-moves');
  const timerEl = document.getElementById('hud-timer');
  const scoreEl = document.getElementById('hud-score');
  const menuButton = document.getElementById('hud-menu');
  const timeAdjustEl = document.getElementById('time-adjust-popup');
  let timeAdjustHideTimer = null;

  return {
    show() {
      hud.hidden = false;
    },
    hide() {
      hud.hidden = true;
    },
    reset(durationSeconds) {
      movesEl.textContent = '0';
      scoreEl.textContent = '0';
      timerEl.textContent = formatTime(durationSeconds);
    },
    setMoves(moves) {
      movesEl.textContent = moves;
    },
    setSeconds(seconds) {
      timerEl.textContent = formatTime(seconds);
    },
    setScore(score) {
      scoreEl.textContent = score;
    },
    onMenu(handler) {
      menuButton.addEventListener('click', handler);
    },
    // Center-screen callout for a power-driven timer change (e.g. Time
    // Traveler's +5s match bonus / -2s mismatch-streak penalty).
    showTimeAdjust(delta) {
      if (!delta) return;
      const positive = delta > 0;

      timeAdjustEl.textContent = `${positive ? '+' : ''}${delta}s`;
      timeAdjustEl.classList.toggle('positive', positive);
      timeAdjustEl.classList.toggle('negative', !positive);
      timeAdjustEl.hidden = false;

      // Restart the animation even if it's still playing from a previous call.
      timeAdjustEl.classList.remove('playing');
      void timeAdjustEl.offsetWidth;
      timeAdjustEl.classList.add('playing');

      clearTimeout(timeAdjustHideTimer);
      timeAdjustHideTimer = setTimeout(() => {
        timeAdjustEl.hidden = true;
      }, TIME_ADJUST_POPUP_DURATION_MS);
    },
  };
}
