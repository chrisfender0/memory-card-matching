import { getLeaderboard, resetAllData } from '../../storage/leaderboard.js';
import { POWERS } from '../../game/powers/registry.js';
import { formatDuration } from '../../utils/format.js';

const LEVEL_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const VIEW_STORAGE_KEY = 'mcm.leaderboardView';

function formatDetailDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function findPower(powerId) {
  return POWERS.find((power) => power.id === powerId) ?? null;
}

export function initLanding({ onPlay }) {
  const screen = document.getElementById('landing-screen');
  const list = document.getElementById('leaderboard-list');
  const emptyState = document.getElementById('leaderboard-empty');
  const playButton = document.getElementById('landing-play');
  const resetButton = document.getElementById('reset-data');
  const resetModal = document.getElementById('reset-confirm');
  const resetCancelButton = document.getElementById('reset-cancel');
  const resetConfirmButton = document.getElementById('reset-confirm-btn');
  const viewRegularButton = document.getElementById('lb-view-regular');
  const viewPowersButton = document.getElementById('lb-view-powers');
  const powerFiltersEl = document.getElementById('lb-power-filters');

  let view = localStorage.getItem(VIEW_STORAGE_KEY) === 'powers' ? 'powers' : 'regular';
  let powerFilter = 'all';
  let expandedIndex = null;

  function renderPowerFilters() {
    powerFiltersEl.hidden = view !== 'powers';
    powerFiltersEl.innerHTML = '';
    if (view !== 'powers') return;

    const allChip = document.createElement('button');
    allChip.type = 'button';
    allChip.className = 'lb-power-chip';
    allChip.classList.toggle('lb-power-chip--active', powerFilter === 'all');
    allChip.textContent = 'All Powers';
    allChip.addEventListener('click', () => {
      powerFilter = 'all';
      expandedIndex = null;
      render();
    });
    powerFiltersEl.appendChild(allChip);

    POWERS.forEach((power) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'lb-power-chip';
      chip.classList.toggle('lb-power-chip--active', powerFilter === power.id);

      const icon = document.createElement('img');
      icon.className = 'lb-power-chip-icon';
      icon.src = power.icon;
      icon.alt = '';

      chip.append(icon, document.createTextNode(power.name));
      chip.addEventListener('click', () => {
        powerFilter = power.id;
        expandedIndex = null;
        render();
      });
      powerFiltersEl.appendChild(chip);
    });
  }

  function renderDetailRow(entry) {
    const detail = document.createElement('li');
    detail.className = 'lb-detail';

    const fields = [
      ['Date', formatDetailDate(entry.date)],
      ['Time', formatDuration(entry.durationSeconds)],
      ['Moves', String(entry.moves ?? 0)],
      ['Best Match', String(entry.highestMatchPoints ?? 0)],
    ];

    fields.forEach(([label, value]) => {
      const item = document.createElement('div');
      item.className = 'lb-detail-item';

      const labelEl = document.createElement('span');
      labelEl.className = 'lb-detail-label';
      labelEl.textContent = label;

      const valueEl = document.createElement('span');
      valueEl.className = 'lb-detail-value';
      valueEl.textContent = value;

      item.append(labelEl, valueEl);
      detail.appendChild(item);
    });

    return detail;
  }

  function render() {
    viewRegularButton.classList.toggle('lb-view-btn--active', view === 'regular');
    viewPowersButton.classList.toggle('lb-view-btn--active', view === 'powers');
    renderPowerFilters();

    const entries = getLeaderboard().filter((entry) => {
      if (view === 'regular') return !entry.powerId;
      if (powerFilter === 'all') return Boolean(entry.powerId);
      return entry.powerId === powerFilter;
    });

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

      const power = entry.powerId ? findPower(entry.powerId) : null;
      if (power) {
        const badge = document.createElement('img');
        badge.className = 'lb-power-badge';
        badge.src = power.icon;
        badge.alt = power.name;
        name.appendChild(badge);
      }
      name.appendChild(document.createTextNode(entry.name));

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
      row.addEventListener('click', () => {
        expandedIndex = expandedIndex === i ? null : i;
        render();
      });
      list.appendChild(row);

      if (expandedIndex === i) {
        list.appendChild(renderDetailRow(entry));
      }
    });
  }

  playButton.addEventListener('click', () => onPlay());

  function setView(nextView) {
    if (view === nextView) return;
    view = nextView;
    powerFilter = 'all';
    expandedIndex = null;
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // Storage unavailable — the toggle just won't survive a reload.
    }
    render();
  }

  viewRegularButton.addEventListener('click', () => setView('regular'));
  viewPowersButton.addEventListener('click', () => setView('powers'));

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
    expandedIndex = null;
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
