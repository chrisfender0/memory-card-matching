import { generateCardFace, generateCardBack, CARD_FACES } from '../assets/cardArt.js';

// Mirrors the GLYPHS order in cardArt.js.
const SHAPE_NAMES = [
  'circle', 'triangle', 'square', 'star',
  'hexagon', 'diamond', 'ring', 'cross',
];

const facesEl = document.getElementById('faces');
const backEl = document.getElementById('back');
const timingEl = document.getElementById('timing');

const t0 = performance.now();
const faceTextures = CARD_FACES.map(({ id }) => generateCardFace(id));
const backTexture = generateCardBack();
const genElapsed = performance.now() - t0;

CARD_FACES.forEach(({ id, hue, shape, pips }, i) => {
  const tile = document.createElement('div');
  tile.className = 'tile';

  const img = document.createElement('img');
  img.src = faceTextures[i].image.toDataURL();
  img.alt = `face ${id}`;

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = `#${id} · ${SHAPE_NAMES[shape]} · ${pips}pip\nhue ${Math.round(hue)}°`;

  tile.append(img, label);
  facesEl.appendChild(tile);
});

const backImg = document.createElement('img');
backImg.src = backTexture.image.toDataURL();
backImg.alt = 'card back';
backEl.appendChild(backImg);

timingEl.textContent = `Generated 32 faces + 1 back in ${genElapsed.toFixed(2)}ms (excludes PNG export for this preview).`;
