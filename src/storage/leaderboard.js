const LEADERBOARD_KEY = 'mcm.leaderboard';
const LAST_NAME_KEY = 'mcm.lastName';
const MAX_ENTRIES = 20;

// Every localStorage key this game owns. Keep this list up to date as new
// keys are added so resetAllData() stays a full reset, not a partial one.
export const STORAGE_KEYS = [LEADERBOARD_KEY, LAST_NAME_KEY];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, quota exceeded, etc.) — fail silently.
  }
}

export function getLeaderboard() {
  const entries = readJSON(LEADERBOARD_KEY, []);
  return Array.isArray(entries) ? entries : [];
}

// entry: { name, score, level, date }
export function addScore(entry) {
  const entries = getLeaderboard();
  entries.push(entry);
  entries.sort((a, b) => b.score - a.score);
  const trimmed = entries.slice(0, MAX_ENTRIES);
  writeJSON(LEADERBOARD_KEY, trimmed);
  return trimmed;
}

export function getLastName() {
  return readJSON(LAST_NAME_KEY, '');
}

export function setLastName(name) {
  writeJSON(LAST_NAME_KEY, name);
}

export function resetAllData() {
  STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable — nothing to clear.
    }
  });
}
