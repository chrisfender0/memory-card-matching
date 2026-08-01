import * as THREE from 'three';
import { Card } from './Card.js';
import { CARD_FACES } from '../assets/cardArt.js';

export const LEVELS = {
  easy: { cols: 4, rows: 4 },
  medium: { cols: 6, rows: 6 },
  hard: { cols: 8, rows: 8 },
};

const GRID_MARGIN = 0.92; // fraction of the available frustum the grid may use
const CARD_FILL = 0.88; // fraction of each cell a card occupies (rest is gap)

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export class Board {
  constructor(level) {
    if (!LEVELS[level]) throw new Error(`Unknown level: ${level}`);

    this.level = level;
    this.cols = LEVELS[level].cols;
    this.rows = LEVELS[level].rows;
    this.group = new THREE.Group();
    this.cards = this._buildDeck().map((faceId) => {
      const card = new Card(faceId, { x: 0, y: 0, z: 0 });
      this.group.add(card.mesh);
      return card;
    });
  }

  _buildDeck() {
    const pairCount = (this.cols * this.rows) / 2;
    const faceIds = CARD_FACES.slice(0, pairCount).map((face) => face.id);
    const deck = shuffle([...faceIds, ...faceIds]);

    const counts = new Map();
    deck.forEach((id) => counts.set(id, (counts.get(id) || 0) + 1));
    const allPaired = [...counts.values()].every((count) => count === 2);
    console.log(
      `[Board] ${this.level}: ${deck.length} cards, ${counts.size} unique faces, all paired: ${allPaired}`
    );

    return deck;
  }

  // Fits the grid within the given world-space width/height (the camera's
  // current visible frustum size), called on build and again on every resize.
  layout(worldWidth, worldHeight) {
    const availableWidth = worldWidth * GRID_MARGIN;
    const availableHeight = worldHeight * GRID_MARGIN;

    const cellSize = Math.min(availableWidth / this.cols, availableHeight / this.rows);
    const cardSize = cellSize * CARD_FILL;

    this.cards.forEach((card, i) => {
      // Matched cards are mid-animation (or already removed) and should keep
      // their gap in the grid rather than be repositioned/resized.
      if (card.matched) return;

      const col = i % this.cols;
      const row = Math.floor(i / this.cols);

      const x = (col - (this.cols - 1) / 2) * cellSize;
      const y = ((this.rows - 1) / 2 - row) * cellSize;

      card.mesh.position.set(x, y, 0);
      card.setSize(cardSize);
    });
  }

  dispose() {
    this.cards.forEach((card) => {
      this.group.remove(card.mesh);
      card.dispose();
    });
    this.cards = [];
  }
}
