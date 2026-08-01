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

// Defaults for fields added after some entries were already saved, so old
// entries don't break the detail view, toggle, or power filters.
const ENTRY_DEFAULTS = {
  durationSeconds: 0,
  moves: 0,
  highestMatchPoints: 0,
  powerId: null,
};

export function getLeaderboard() {
  const entries = readJSON(LEADERBOARD_KEY, []);
  if (!Array.isArray(entries)) return [];
  return entries.map((entry) => ({ ...ENTRY_DEFAULTS, ...entry }));
}

// entry: { name, score, level, date, durationSeconds, moves, highestMatchPoints, powerId }
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
