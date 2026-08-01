import { getLastName, setLastName } from '../../storage/leaderboard.js';

const MAX_NAME_LENGTH = 20;

export function initSetup({ onPlay }) {
  const screen = document.getElementById('setup-screen');
  const nameInput = document.getElementById('name-input');
  const tiles = Array.from(document.querySelectorAll('.difficulty-tile'));
  const playButton = document.getElementById('setup-play');
  const powersToggle = document.getElementById('powers-toggle');
  const powerSelectorSlot = document.getElementById('power-selector-slot');

  let selectedLevel = null;
  // Selecting a power is built in session 10.1 — for now the toggle has
  // nothing that can set this, so Play stays disabled while powers are on.
  let selectedPowerId = null;

  function isValid() {
    const name = nameInput.value.trim();
    const nameOk = name.length > 0 && name.length <= MAX_NAME_LENGTH;
    const levelOk = Boolean(selectedLevel);
    const powersOk = !powersToggle.checked || Boolean(selectedPowerId);
    return nameOk && levelOk && powersOk;
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

  powersToggle.addEventListener('change', () => {
    // No stale selection carried across a toggle flip — re-confirm each time.
    selectedPowerId = null;
    powerSelectorSlot.hidden = !powersToggle.checked;
    updatePlayEnabled();
  });

  playButton.addEventListener('click', () => {
    if (!isValid()) return;
    const name = nameInput.value.trim();
    setLastName(name);
    onPlay({
      name,
      level: selectedLevel,
      powersEnabled: powersToggle.checked,
      selectedPowerId,
    });
  });

  return {
    show() {
      nameInput.value = getLastName();
      selectedLevel = null;
      selectedPowerId = null;
      tiles.forEach((t) => t.classList.remove('selected'));
      powersToggle.checked = false;
      powerSelectorSlot.hidden = true;
      updatePlayEnabled();
      screen.hidden = false;
    },
    hide() {
      screen.hidden = true;
    },
  };
}
