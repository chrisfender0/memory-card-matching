import * as THREE from 'three';
import { generateCardFace, generateCardBack } from '../assets/cardArt.js';

const CARD_WIDTH = 1;
const CARD_HEIGHT = 1;
const CARD_DEPTH = 0.05;
const FLIP_DURATION = 0.3; // seconds
const MATCHED_SCALE = 0.92;

const SHAKE_DURATION = 1.1; // seconds — plan requires >=1000ms
const SHAKE_STEP = 0.07; // seconds between jitter direction flips
const SHAKE_POSITION_AMPLITUDE = 0.03;
const SHAKE_ROTATION_AMPLITUDE = THREE.MathUtils.degToRad(4);
const EXPLODE_DURATION = 0.5; // seconds
const EXPLODE_DISTANCE = 7; // world units — clears the board/frustum
const MATCH_GLOW_COLOR = new THREE.Color(0x2ecc71); // green, distinct from a future red mismatch flash
const TELEPATHY_GLOW_COLOR = new THREE.Color(0x9b59b6); // purple, matches the Telepathy power's icon
const NO_GLOW_COLOR = new THREE.Color(0x000000);

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

// Shared by every card — BoxGeometry side faces are never textured.
const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a22 });

export class Card {
  constructor(faceId, position = { x: 0, y: 0, z: 0 }, size = 1) {
    this.faceId = faceId;
    this.faceUp = false;
    this.matched = false;
    this.isAnimating = false;
    this.telepathyFlagged = false;

    this._flipElapsed = 0;
    this._flipFrom = 0;
    this._flipTo = 0;
    this._baseScale = size;
    this._matchAnim = null;

    const geometry = new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH);

    // alphaTest hard-discards the fully-transparent corner pixels baked into
    // the rounded-rect card texture, so the rounded shape is genuinely cut
    // out (rather than just relying on near-black corners blending into a
    // dark background) — otherwise an emissive tint (e.g. the match glow)
    // washes uniformly across the full square face, corners included.
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: generateCardFace(faceId),
      alphaTest: 0.5,
    });
    const backMaterial = new THREE.MeshStandardMaterial({
      map: generateCardBack(),
      alphaTest: 0.5,
    });

    // BoxGeometry material slot order: +x, -x, +y, -y, +z (front), -z (back).
    const materials = [
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      frontMaterial,
      backMaterial,
    ];

    this.mesh = new THREE.Mesh(geometry, materials);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.scale.setScalar(size);
    // Start rotated so the back face (-z) points at the camera, i.e. face-down.
    this.mesh.rotation.y = Math.PI;
    this.mesh.userData.card = this;
  }

  // Board layout scale — separate from the matched-state pulse so the two compose
  // instead of one clobbering the other.
  setSize(size) {
    this._baseScale = size;
    this.mesh.scale.setScalar(size * (this.matched ? MATCHED_SCALE : 1));
  }

  // Tints the card back (the side actually visible while face-down) so a
  // Telepathy hint reads as "this card, right there" without revealing the
  // face art underneath.
  setTelepathyHighlight(active) {
    const backMaterial = this.mesh.material[5];
    backMaterial.emissive = active ? TELEPATHY_GLOW_COLOR : NO_GLOW_COLOR;
    backMaterial.emissiveIntensity = active ? 0.7 : 0;
  }

  flip() {
    if (this.matched) return;

    if (this.isAnimating) {
      // A revert flip can be triggered while the original up-flip is still
      // mid-tween (e.g. a mismatch resolving right at the edge of its
      // delay). Snap the in-progress tween to completion first instead of
      // silently dropping this call, which would otherwise strand the card
      // face-up forever.
      this.mesh.rotation.y = this._flipTo;
      this.faceUp = !this.faceUp;
    }

    this.isAnimating = true;
    this._flipElapsed = 0;
    this._flipFrom = this.mesh.rotation.y;
    this._flipTo = this._flipFrom + Math.PI;
  }

  // Shake-in-place (>=1s) then explode outward and fade away, then invoke
  // onComplete once the mesh is fully removed from the scene.
  playMatchAnimation(onComplete) {
    // A match can be detected in the same tick as the 2nd card's flip() call,
    // before that flip has had a single update() frame to progress. Snap it
    // to its completed face-up state so the match animation never starts
    // mid-rotation (which would otherwise strand the card showing its back).
    if (this.isAnimating) {
      this.mesh.rotation.y = this._flipTo;
      this.isAnimating = false;
      this.faceUp = true;
    }
    this.mesh.rotation.y %= Math.PI * 2;

    this.matched = true;

    const frontMaterial = this.mesh.material[4];
    const backMaterial = this.mesh.material[5];
    frontMaterial.emissive = MATCH_GLOW_COLOR;
    frontMaterial.emissiveIntensity = 0.6;
    frontMaterial.transparent = true;
    backMaterial.transparent = true;

    const explodeDirection = new THREE.Vector2(this.mesh.position.x, this.mesh.position.y);
    if (explodeDirection.lengthSq() === 0) {
      explodeDirection.set(Math.random() < 0.5 ? -1 : 1, Math.random() < 0.5 ? -1 : 1);
    }
    explodeDirection.normalize();

    this._matchAnim = {
      phase: 'shake',
      elapsed: 0,
      onComplete,
      basePosition: this.mesh.position.clone(),
      startScale: this._baseScale * MATCHED_SCALE,
      explodeDirection,
    };
  }

  update(deltaTime) {
    if (this._matchAnim) {
      this._updateMatchAnimation(deltaTime);
      return;
    }

    if (!this.isAnimating) return;

    this._flipElapsed += deltaTime;
    const t = Math.min(this._flipElapsed / FLIP_DURATION, 1);
    const eased = easeInOutCubic(t);
    this.mesh.rotation.y = this._flipFrom + (this._flipTo - this._flipFrom) * eased;

    if (t >= 1) {
      this.isAnimating = false;
      this.faceUp = !this.faceUp;
      this.mesh.rotation.y %= Math.PI * 2;
    }
  }

  _updateMatchAnimation(deltaTime) {
    const anim = this._matchAnim;
    anim.elapsed += deltaTime;

    if (anim.phase === 'shake') {
      const step = Math.floor(anim.elapsed / SHAKE_STEP);
      const dirX = step % 2 === 0 ? 1 : -1;
      const dirY = step % 3 === 0 ? -1 : 1;

      this.mesh.position.x = anim.basePosition.x + dirX * SHAKE_POSITION_AMPLITUDE;
      this.mesh.position.y = anim.basePosition.y + dirY * SHAKE_POSITION_AMPLITUDE * 0.6;
      this.mesh.rotation.z = dirX * SHAKE_ROTATION_AMPLITUDE;

      if (anim.elapsed >= SHAKE_DURATION) {
        anim.phase = 'explode';
        anim.elapsed = 0;
        this.mesh.position.copy(anim.basePosition);
        this.mesh.rotation.z = 0;
      }
      return;
    }

    // explode
    const t = Math.min(anim.elapsed / EXPLODE_DURATION, 1);
    const eased = t * t; // ease-in — accelerates outward

    this.mesh.position.x = anim.basePosition.x + anim.explodeDirection.x * EXPLODE_DISTANCE * eased;
    this.mesh.position.y = anim.basePosition.y + anim.explodeDirection.y * EXPLODE_DISTANCE * eased;
    this.mesh.scale.setScalar(anim.startScale * (1 + eased * 1.5));

    const frontMaterial = this.mesh.material[4];
    const backMaterial = this.mesh.material[5];
    frontMaterial.opacity = 1 - eased;
    backMaterial.opacity = 1 - eased;

    if (t >= 1) {
      this._finishMatchAnimation();
    }
  }

  _finishMatchAnimation() {
    const { onComplete } = this._matchAnim;
    this.mesh.visible = false;
    this.mesh.removeFromParent();
    this._matchAnim = null;
    onComplete?.();
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material[4].dispose();
    this.mesh.material[5].dispose();
  }
}
