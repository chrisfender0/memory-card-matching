function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function initHud() {
  const hud = document.getElementById('hud');
  const movesEl = document.getElementById('hud-moves');
  const timerEl = document.getElementById('hud-timer');
  const scoreEl = document.getElementById('hud-score');
  const menuButton = document.getElementById('hud-menu');

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
  };
}
