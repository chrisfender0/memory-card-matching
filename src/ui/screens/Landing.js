import { getLeaderboard, resetAllData } from '../../storage/leaderboard.js';

const LEVEL_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export function initLanding({ onPlay }) {
  const screen = document.getElementById('landing-screen');
  const list = document.getElementById('leaderboard-list');
  const emptyState = document.getElementById('leaderboard-empty');
  const playButton = document.getElementById('landing-play');
  const resetButton = document.getElementById('reset-data');
  const resetModal = document.getElementById('reset-confirm');
  const resetCancelButton = document.getElementById('reset-cancel');
  const resetConfirmButton = document.getElementById('reset-confirm-btn');

  function render() {
    const entries = getLeaderboard();
    list.innerHTML = '';
    emptyState.hidden = entries.length > 0;

    entries.forEach((entry, i) => {
      const row = document.createElement('li');
      row.className = 'leaderboard-row';

      const rank = document.createElement('span');
      rank.className = 'lb-rank';
      rank.textContent = `#${i + 1}`;

      const name = document.createElement('span');
      name.className = 'lb-name';
      name.textContent = entry.name;

      const levelBadge = document.createElement('span');
      levelBadge.className = `lb-level lb-level-${entry.level}`;
      levelBadge.textContent = LEVEL_LABELS[entry.level] ?? entry.level;

      const score = document.createElement('span');
      score.className = 'lb-score';
      score.textContent = entry.score;

      const date = document.createElement('span');
      date.className = 'lb-date';
      date.textContent = new Date(entry.date).toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric',
      });

      row.append(rank, name, levelBadge, score, date);
      list.appendChild(row);
    });
  }

  playButton.addEventListener('click', () => onPlay());

  function showResetModal() {
    resetModal.hidden = false;
  }

  function hideResetModal() {
    resetModal.hidden = true;
  }

  resetButton.addEventListener('click', showResetModal);
  resetCancelButton.addEventListener('click', hideResetModal);
  resetModal.addEventListener('click', (event) => {
    if (event.target === resetModal) hideResetModal();
  });

  resetConfirmButton.addEventListener('click', () => {
    resetAllData();
    hideResetModal();
    render();
  });

  return {
    show() {
      render();
      hideResetModal();
      screen.hidden = false;
    },
    hide() {
      screen.hidden = true;
    },
  };
}
