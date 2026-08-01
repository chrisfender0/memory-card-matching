// Shared bag of per-session state (player name, chosen level, running score)
// read by GameController/UI code across the setup flow, gameplay, and — once
// session 5.2 lands — scoring.
export const gameSession = {
  playerName: '',
  level: null,
  score: 0,
};

export function configureSession(playerName, level) {
  gameSession.playerName = playerName;
  gameSession.level = level;
  gameSession.score = 0;
}
