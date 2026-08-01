// Shared bag of per-session state (player name, chosen level, running score,
// special-powers choice) read by GameController/UI code across the setup
// flow and gameplay.
export const gameSession = {
  playerName: '',
  level: null,
  score: 0,
  powersEnabled: false,
  selectedPowerId: null,
};

export function configureSession(playerName, level, powersEnabled = false, selectedPowerId = null) {
  gameSession.playerName = playerName;
  gameSession.level = level;
  gameSession.score = 0;
  gameSession.powersEnabled = powersEnabled;
  gameSession.selectedPowerId = selectedPowerId;
}
