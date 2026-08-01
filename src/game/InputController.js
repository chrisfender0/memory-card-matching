import * as THREE from 'three';

const TAP_DRAG_THRESHOLD = 10; // px — pointerup beyond this from pointerdown is a drag, not a tap

// Tap-to-flip input: unified pointer events (touch + mouse) raycast against
// the board's card meshes and forward hits to the GameController.
export class InputController {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;
    this.board = null;
    this.controller = null;

    this._raycaster = new THREE.Raycaster();
    this._pointer = new THREE.Vector2();
    this._downPosition = null;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);

    canvas.addEventListener('pointerdown', this._onPointerDown);
    canvas.addEventListener('pointerup', this._onPointerUp);
  }

  // Board/controller are (re)created per game, after this InputController exists.
  setTargets(board, controller) {
    this.board = board;
    this.controller = controller;
  }

  _onPointerDown(event) {
    this._downPosition = { x: event.clientX, y: event.clientY };
  }

  _onPointerUp(event) {
    const down = this._downPosition;
    this._downPosition = null;
    if (!down) return;

    const dx = event.clientX - down.x;
    const dy = event.clientY - down.y;
    if (Math.hypot(dx, dy) > TAP_DRAG_THRESHOLD) return; // drag/scroll, not a tap

    this._handleTap(event.clientX, event.clientY);
  }

  _handleTap(clientX, clientY) {
    if (!this.board || !this.controller) return;

    const rect = this.canvas.getBoundingClientRect();
    this._pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this._pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(this._pointer, this.camera);
    const targets = this.board.cards.filter((card) => !card.matched).map((card) => card.mesh);
    const hits = this._raycaster.intersectObjects(targets);
    if (hits.length > 0) {
      this.controller.selectCard(hits[0].object.userData.card);
    }
  }

  dispose() {
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointerup', this._onPointerUp);
  }
}
