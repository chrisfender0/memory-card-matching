// Small canvas-drawn icon set used to preview the Powers carousel (session
// 10.1) before session 10.2 supplies real power art/copy. Deliberately
// abstract (numbered shapes, no gameplay meaning) so nobody mistakes these
// for final content.
const SIZE = 128;

function drawIconBackground(ctx, hue) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  const pad = SIZE * 0.06;
  const bg = ctx.createLinearGradient(0, pad, 0, SIZE - pad);
  bg.addColorStop(0, `hsl(${hue}, 55%, 46%)`);
  bg.addColorStop(1, `hsl(${hue}, 55%, 28%)`);

  ctx.beginPath();
  ctx.roundRect(pad, pad, SIZE - pad * 2, SIZE - pad * 2, SIZE * 0.16);
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.lineWidth = SIZE * 0.025;
  ctx.strokeStyle = `hsl(${hue}, 60%, 20%)`;
  ctx.stroke();
}

function drawCircleGlyph(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawTriangleGlyph(ctx, cx, cy, r) {
  const points = [];
  for (let i = 0; i < 3; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  ctx.beginPath();
  points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawDiamondGlyph(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

const GLYPHS = [drawCircleGlyph, drawTriangleGlyph, drawDiamondGlyph];

function drawGlyph(ctx, shapeFn, hue) {
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = SIZE * 0.24;

  const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  grad.addColorStop(0, `hsl(${hue}, 90%, 78%)`);
  grad.addColorStop(1, `hsl(${hue}, 85%, 62%)`);

  ctx.fillStyle = grad;
  ctx.strokeStyle = `hsl(${hue}, 90%, 25%)`;
  ctx.lineWidth = SIZE * 0.02;
  ctx.lineJoin = 'round';

  shapeFn(ctx, cx, cy, r);
}

const iconCache = new Map();

export function generatePowerIcon(shapeIndex, hue) {
  const key = `${shapeIndex}-${hue}`;
  if (iconCache.has(key)) return iconCache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  drawIconBackground(ctx, hue);
  drawGlyph(ctx, GLYPHS[shapeIndex % GLYPHS.length], hue);

  const dataUrl = canvas.toDataURL();
  iconCache.set(key, dataUrl);
  return dataUrl;
}

// Manifest for the placeholder registry entries — swap out in session 10.2.
export const PLACEHOLDER_POWER_ICONS = [
  { shapeIndex: 0, hue: 210 },
  { shapeIndex: 1, hue: 130 },
  { shapeIndex: 2, hue: 330 },
];
