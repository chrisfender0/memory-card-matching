import * as THREE from 'three';
import { Board } from './game/Board.js';
import { GameController } from './game/GameController.js';
import { InputController } from './game/InputController.js';
import { configureSession, gameSession } from './game/GameSession.js';
import { addScore } from './storage/leaderboard.js';
import { registerScreen, showScreen } from './ui/screenManager.js';
import { initLanding } from './ui/screens/Landing.js';
import { initSetup } from './ui/screens/Setup.js';
import { initResult } from './ui/screens/Result.js';
import { initHud } from './ui/hud.js';

const canvas = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0e14);

// Orthographic camera: simplest fit for a flat card grid, no perspective distortion.
const FRUSTUM_HEIGHT = 10;
let aspect = window.innerWidth / window.innerHeight;

const camera = new THREE.OrthographicCamera(
  (-FRUSTUM_HEIGHT * aspect) / 2,
  (FRUSTUM_HEIGHT * aspect) / 2,
  FRUSTUM_HEIGHT / 2,
  -FRUSTUM_HEIGHT / 2,
  0.1,
  100
);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const ambient = new THREE.AmbientLight(0xffffff, 0.8);
const directional = new THREE.DirectionalLight(0xffffff, 0.6);
directional.position.set(2, 3, 5);
scene.add(ambient, directional);

// No board/controller until the setup flow picks a level and starts a game.
let board = null;
let controller = null;

const hud = initHud();

const input = new InputController(canvas, camera);

function resize() {
  aspect = window.innerWidth / window.innerHeight;
  camera.left = (-FRUSTUM_HEIGHT * aspect) / 2;
  camera.right = (FRUSTUM_HEIGHT * aspect) / 2;
  camera.top = FRUSTUM_HEIGHT / 2;
  camera.bottom = -FRUSTUM_HEIGHT / 2;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  if (board) board.layout(FRUSTUM_HEIGHT * aspect, FRUSTUM_HEIGHT);
}

window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);

const clockTimer = new THREE.Timer();

function animate() {
  requestAnimationFrame(animate);
  clockTimer.update();
  const deltaTime = clockTimer.getDelta();
  if (board) board.cards.forEach((card) => card.update(deltaTime));
  renderer.render(scene, camera);
}

animate();

function handleGameEnd(payload) {
  hud.hide();

  addScore({
    name: gameSession.playerName,
    score: payload.score,
    level: gameSession.level,
    date: new Date().toISOString(),
    durationSeconds: payload.durationSeconds,
    moves: payload.moves,
    highestMatchPoints: payload.highestMatchPoints,
    powerId: gameSession.powersEnabled ? gameSession.selectedPowerId : null,
  });

  // Show the screen before setResult() so its confetti canvas reads a
  // non-zero size (result-screen carries `hidden` — and display:none — until now).
  showScreen('result');
  resultScreen.setResult(payload);
}

function disposeBoard() {
  if (board) {
    scene.remove(board.group);
    board.dispose();
    board = null;
  }
  controller = null;
  input.setTargets(null, null);
}

function startGame(playerName, level, powersEnabled = false, selectedPowerId = null) {
  configureSession(playerName, level, powersEnabled, selectedPowerId);

  disposeBoard();

  board = new Board(level);
  scene.add(board.group);
  board.layout(FRUSTUM_HEIGHT * aspect, FRUSTUM_HEIGHT);
  board.playEntrance();

  controller = new GameController(board);
  input.setTargets(board, controller);
  controller.on('move', ({ moves }) => hud.setMoves(moves));
  controller.on('tick', ({ secondsRemaining }) => hud.setSeconds(secondsRemaining));
  controller.on('match', ({ score }) => hud.setScore(score));
  controller.on('timeAdjust', ({ delta }) => hud.showTimeAdjust(delta));
  controller.on('win', (payload) => handleGameEnd(payload));
  controller.on('timeout', (payload) => handleGameEnd(payload));

  hud.reset(controller.timer.durationSeconds);
  showScreen(null);
  hud.show();
}

registerScreen(
  'landing',
  initLanding({
    onPlay: () => showScreen('setup'),
  })
);

registerScreen(
  'setup',
  initSetup({
    onPlay: ({ name, level, powersEnabled, selectedPowerId }) =>
      startGame(name, level, powersEnabled, selectedPowerId),
  })
);

const resultScreen = initResult({
  onPlayAgain: () =>
    startGame(gameSession.playerName, gameSession.level, gameSession.powersEnabled, gameSession.selectedPowerId),
  onMenu: () => {
    disposeBoard();
    showScreen('landing');
  },
});
registerScreen('result', resultScreen);

hud.onMenu(() => {
  if (controller) controller.timer.pause();
  hud.hide();
  disposeBoard();
  showScreen('landing');
});

showScreen('landing');
