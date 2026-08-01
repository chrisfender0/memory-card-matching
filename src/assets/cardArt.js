import * as THREE from 'three';

const SIZE = 256;
const HUE_STEP = 360 / 32;

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function regularPolygonPoints(cx, cy, radius, sides, rotation = -Math.PI / 2) {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (i * 2 * Math.PI) / sides;
    points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  return points;
}

function starPoints(cx, cy, outerRadius, innerRadius, spikes) {
  const points = [];
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (i * Math.PI) / spikes;
    points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  return points;
}

function crossPoints(cx, cy, armLength, armHalfWidth) {
  const l = armLength;
  const w = armHalfWidth;
  return [
    [-w, -l], [w, -l], [w, -w], [l, -w], [l, w], [w, w],
    [w, l], [-w, l], [-w, w], [-l, w], [-l, -w], [-w, -w],
  ].map(([x, y]) => [cx + x, cy + y]);
}

function fillAndStrokePolygon(ctx, points) {
  ctx.beginPath();
  points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// 8 distinct glyph shapes, indexed 0-7 and cycled across the 32 face ids.
const GLYPHS = [
  (ctx, cx, cy, r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  },
  (ctx, cx, cy, r) => fillAndStrokePolygon(ctx, regularPolygonPoints(cx, cy, r, 3)),
  (ctx, cx, cy, r) => {
    const s = r * 1.5;
    roundRectPath(ctx, cx - s / 2, cy - s / 2, s, s, s * 0.15);
    ctx.fill();
    ctx.stroke();
  },
  (ctx, cx, cy, r) => fillAndStrokePolygon(ctx, starPoints(cx, cy, r, r * 0.45, 5)),
  (ctx, cx, cy, r) => fillAndStrokePolygon(ctx, regularPolygonPoints(cx, cy, r, 6, 0)),
  (ctx, cx, cy, r) => fillAndStrokePolygon(ctx, regularPolygonPoints(cx, cy, r, 4, 0)),
  (ctx, cx, cy, r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    ctx.stroke();
  },
  (ctx, cx, cy, r) => fillAndStrokePolygon(ctx, crossPoints(cx, cy, r, r * 0.32)),
];

function drawFaceBackground(ctx, hue) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  const pad = SIZE * 0.05;
  const w = SIZE - pad * 2;
  const h = SIZE - pad * 2;

  const bg = ctx.createLinearGradient(0, pad, 0, SIZE - pad);
  bg.addColorStop(0, `hsl(${hue}, 55%, 46%)`);
  bg.addColorStop(1, `hsl(${hue}, 55%, 30%)`);

  roundRectPath(ctx, pad, pad, w, h, SIZE * 0.1);
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.lineWidth = SIZE * 0.02;
  ctx.strokeStyle = `hsl(${hue}, 60%, 20%)`;
  ctx.stroke();
}

function drawGlyph(ctx, shapeFn, hue) {
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = SIZE * 0.26;

  const glyphGradient = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  glyphGradient.addColorStop(0, `hsl(${hue}, 90%, 78%)`);
  glyphGradient.addColorStop(1, `hsl(${hue}, 85%, 62%)`);

  ctx.fillStyle = glyphGradient;
  ctx.strokeStyle = `hsl(${hue}, 90%, 25%)`;
  ctx.lineWidth = SIZE * 0.018;
  ctx.lineJoin = 'round';

  shapeFn(ctx, cx, cy, r);
}

// Small corner dots (dice-style, 1-4) so a card's identity never depends on
// hue alone — shape + pip count together already uniquely cover all 32 ids.
function drawPips(ctx, count) {
  const pipRadius = SIZE * 0.026;
  const spacing = pipRadius * 2.8;
  const startX = SIZE * 0.155;
  const y = SIZE * 0.155;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = pipRadius * 0.4;

  for (let i = 0; i < count; i++) {
    const x = startX + i * spacing;
    ctx.beginPath();
    ctx.arc(x, y, pipRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawBackPattern(ctx) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  const pad = SIZE * 0.05;
  const w = SIZE - pad * 2;
  const h = SIZE - pad * 2;
  const hue = 225;

  const bg = ctx.createLinearGradient(0, pad, 0, SIZE - pad);
  bg.addColorStop(0, `hsl(${hue}, 28%, 22%)`);
  bg.addColorStop(1, `hsl(${hue}, 32%, 12%)`);

  roundRectPath(ctx, pad, pad, w, h, SIZE * 0.1);
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.save();
  ctx.clip();
  ctx.strokeStyle = `hsla(${hue}, 40%, 55%, 0.25)`;
  ctx.lineWidth = SIZE * 0.015;
  const step = SIZE * 0.14;
  for (let x = -SIZE; x < SIZE * 2; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, -SIZE * 0.5);
    ctx.lineTo(x + SIZE * 1.5, SIZE * 1.5);
    ctx.stroke();
  }
  ctx.restore();

  ctx.lineWidth = SIZE * 0.02;
  ctx.strokeStyle = `hsl(${hue}, 40%, 8%)`;
  ctx.stroke();

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = SIZE * 0.22;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2, true);
  ctx.fillStyle = `hsla(${hue}, 45%, 70%, 0.85)`;
  ctx.fill('evenodd');
}

function makeCanvasTexture(draw) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  draw(ctx);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

const faceCache = new Map();
let backCache = null;

export function generateCardFace(index) {
  if (faceCache.has(index)) return faceCache.get(index);

  const hue = (index * HUE_STEP) % 360;
  const shapeFn = GLYPHS[index % GLYPHS.length];
  const pipCount = Math.floor(index / GLYPHS.length) + 1;

  const texture = makeCanvasTexture((ctx) => {
    drawFaceBackground(ctx, hue);
    drawGlyph(ctx, shapeFn, hue);
    drawPips(ctx, pipCount);
  });

  faceCache.set(index, texture);
  return texture;
}

export function generateCardBack() {
  if (backCache) return backCache;
  backCache = makeCanvasTexture(drawBackPattern);
  return backCache;
}

// Deterministic manifest: 32 face descriptors, indexable by id 0-31.
export const CARD_FACES = Array.from({ length: 32 }, (_, id) => ({
  id,
  hue: (id * HUE_STEP) % 360,
  shape: id % GLYPHS.length,
  pips: Math.floor(id / GLYPHS.length) + 1,
}));
