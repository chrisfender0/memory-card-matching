export function initResult({ onPlayAgain, onMenu }) {
  const screen = document.getElementById('result-screen');
  const title = document.getElementById('result-title');
  const scoreEl = document.getElementById('result-score');
  const movesEl = document.getElementById('result-moves');
  const playAgainButton = document.getElementById('result-play-again');
  const menuButton = document.getElementById('result-menu');

  playAgainButton.addEventListener('click', () => onPlayAgain());
  menuButton.addEventListener('click', () => onMenu());

  return {
    setResult({ won, score, moves }) {
      title.textContent = won ? 'You Win!' : "Time's Up!";
      scoreEl.textContent = score;
      movesEl.textContent = moves;
    },
    show() {
      screen.hidden = false;
    },
    hide() {
      screen.hidden = true;
    },
  };
}
