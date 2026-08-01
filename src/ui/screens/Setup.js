import { getLastName, setLastName } from '../../storage/leaderboard.js';

const MAX_NAME_LENGTH = 20;

export function initSetup({ onPlay }) {
  const screen = document.getElementById('setup-screen');
  const nameInput = document.getElementById('name-input');
  const tiles = Array.from(document.querySelectorAll('.difficulty-tile'));
  const playButton = document.getElementById('setup-play');

  let selectedLevel = null;

  function isValid() {
    const name = nameInput.value.trim();
    return name.length > 0 && name.length <= MAX_NAME_LENGTH && Boolean(selectedLevel);
  }

  function updatePlayEnabled() {
    playButton.disabled = !isValid();
  }

  nameInput.addEventListener('input', updatePlayEnabled);

  tiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      selectedLevel = tile.dataset.level;
      tiles.forEach((t) => t.classList.toggle('selected', t === tile));
      updatePlayEnabled();
    });
  });

  playButton.addEventListener('click', () => {
    if (!isValid()) return;
    const name = nameInput.value.trim();
    setLastName(name);
    onPlay({ name, level: selectedLevel });
  });

  return {
    show() {
      nameInput.value = getLastName();
      selectedLevel = null;
      tiles.forEach((t) => t.classList.remove('selected'));
      updatePlayEnabled();
      screen.hidden = false;
    },
    hide() {
      screen.hidden = true;
    },
  };
}
