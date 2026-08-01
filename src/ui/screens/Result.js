const CONFETTI_COLORS = ['#4f8ef7', '#2ecc71', '#f7c948', '#e74c3c', '#9b59b6'];
const CONFETTI_COUNT = 100;
const CONFETTI_DURATION = 2200; // ms
const GRAVITY = 60; // world units/s^2, in canvas-pixel space

function launchConfetti(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const particles = Array.from({ length: CONFETTI_COUNT }, () => ({
    x: Math.random() * width,
    y: -20 - Math.random() * height * 0.4,
    size: 4 + Math.random() * 5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    vx: (Math.random() - 0.5) * 60,
    vy: 120 + Math.random() * 160,
    rotation: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 8,
  }));

  const start = performance.now();
  let lastTime = start;

  function frame(now) {
    const deltaTime = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vy += GRAVITY * deltaTime;
      p.rotation += p.vr * deltaTime;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });

    if (now - start < CONFETTI_DURATION) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }

  requestAnimationFrame(frame);
}

export function initResult({ onPlayAgain, onMenu }) {
  const screen = document.getElementById('result-screen');
  const title = document.getElementById('result-title');
  const scoreEl = document.getElementById('result-score');
  const movesEl = document.getElementById('result-moves');
  const playAgainButton = document.getElementById('result-play-again');
  const menuButton = document.getElementById('result-menu');
  const confettiCanvas = document.getElementById('confetti-canvas');

  playAgainButton.addEventListener('click', () => onPlayAgain());
  menuButton.addEventListener('click', () => onMenu());

  return {
    setResult({ won, score, moves }) {
      title.textContent = won ? 'You Win!' : "Time's Up!";
      scoreEl.textContent = score;
      movesEl.textContent = moves;

      // Restart the pop animation even if it's still playing from a previous result.
      title.classList.remove('result-title--celebrate');
      void title.offsetWidth;

      if (won) {
        title.classList.add('result-title--celebrate');
        launchConfetti(confettiCanvas);
      }
    },
    show() {
      screen.hidden = false;
    },
    hide() {
      screen.hidden = true;
    },
  };
}
