import * as THREE from 'three';
import { Board } from './game/Board.js';
import { GameController } from './game/GameController.js';
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

// Temporary debug wiring: routes taps through GameController so the match
// rules can be exercised end-to-end before session 6 formalizes input.
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerDown(event) {
  if (!controller) return;

  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const targets = board.cards.filter((card) => !card.matched).map((card) => card.mesh);
  const hits = raycaster.intersectObjects(targets);
  if (hits.length > 0) {
    controller.selectCard(hits[0].object.userData.card);
  }
}

canvas.addEventListener('pointerdown', onPointerDown);

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
  });

  resultScreen.setResult(payload);
  showScreen('result');
}

function startGame(playerName, level) {
  configureSession(playerName, level);

  if (board) {
    scene.remove(board.group);
    board.dispose();
  }

  board = new Board(level);
  scene.add(board.group);
  board.layout(FRUSTUM_HEIGHT * aspect, FRUSTUM_HEIGHT);

  controller = new GameController(board);
  controller.on('move', ({ moves }) => hud.setMoves(moves));
  controller.on('tick', ({ secondsRemaining }) => hud.setSeconds(secondsRemaining));
  controller.on('match', ({ score }) => hud.setScore(score));
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
    onPlay: ({ name, level }) => startGame(name, level),
  })
);

const resultScreen = initResult({
  onPlayAgain: () => startGame(gameSession.playerName, gameSession.level),
  onMenu: () => showScreen('landing'),
});
registerScreen('result', resultScreen);

hud.onMenu(() => {
  if (controller) controller.timer.pause();
  hud.hide();
  showScreen('landing');
});

showScreen('landing');
