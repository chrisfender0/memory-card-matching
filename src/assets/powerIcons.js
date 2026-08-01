// Canvas-drawn power icons — one glyph per power, badge-style (rounded
// gradient background + a centered shape), rendered in the DOM carousel
// (not the three.js scene). Each power exports its own generateXIcon().
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

function drawGlyph(ctx, drawShape, hue) {
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

  drawShape(ctx, cx, cy, r);
}

const iconCache = new Map();

function generateIcon(cacheKey, hue, drawShape) {
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  drawIconBackground(ctx, hue);
  drawGlyph(ctx, drawShape, hue);

  const dataUrl = canvas.toDataURL();
  iconCache.set(cacheKey, dataUrl);
  return dataUrl;
}

function drawRingsGlyph(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2, true);
  ctx.fill('evenodd');
  ctx.stroke();
}

const TELEPATHY_HUE = 285; // purple

export function generateTelepathyIcon() {
  return generateIcon('telepathy', TELEPATHY_HUE, drawRingsGlyph);
}

function drawHourglassGlyph(ctx, cx, cy, r) {
  ctx.beginPath();
  // top bulb, pinching to a point at center
  ctx.moveTo(cx - r, cy - r);
  ctx.lineTo(cx + r, cy - r);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  // bottom bulb, pinching to a point at center
  ctx.moveTo(cx - r, cy + r);
  ctx.lineTo(cx + r, cy + r);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

const TIME_TRAVELER_HUE = 190; // teal/blue

export function generateTimeTravelerIcon() {
  return generateIcon('time-traveler', TIME_TRAVELER_HUE, drawHourglassGlyph);
}

function drawDiceFaceGlyph(ctx, cx, cy, r) {
  const offset = r * 0.55;
  const dotRadius = r * 0.22;
  const positions = [
    [cx - offset, cy - offset],
    [cx + offset, cy - offset],
    [cx, cy],
    [cx - offset, cy + offset],
    [cx + offset, cy + offset],
  ];
  positions.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

const LUCK_HUE = 130; // green

export function generateLuckOfTheDrawIcon() {
  return generateIcon('luck-of-the-draw', LUCK_HUE, drawDiceFaceGlyph);
}

function drawSnowflakeGlyph(ctx, cx, cy, r) {
  ctx.lineCap = 'round';
  for (let arm = 0; arm < 3; arm++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((arm * Math.PI) / 3);

    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.stroke();

    // Branch ticks along each arm, mirrored on both sides.
    [-0.55, 0.55].forEach((along) => {
      const y = along * r;
      const branch = r * 0.32;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(-branch, y - branch * Math.sign(along));
      ctx.moveTo(0, y);
      ctx.lineTo(branch, y - branch * Math.sign(along));
      ctx.stroke();
    });

    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
}

const COLD_AS_ICE_HUE = 195; // ice-blue

export function generateColdAsIceIcon() {
  return generateIcon('cold-as-ice', COLD_AS_ICE_HUE, drawSnowflakeGlyph);
}

function drawSkullGlyph(ctx, cx, cy, r) {
  // Cranium
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.1, r * 0.82, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Jaw
  ctx.beginPath();
  ctx.roundRect(cx - r * 0.42, cy + r * 0.35, r * 0.84, r * 0.42, r * 0.12);
  ctx.fill();
  ctx.stroke();

  // Eye sockets, nasal cavity and jaw teeth are carved out in a dark
  // overlay on top of the cranium/jaw shapes drawn above.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';

  const eyeOffset = r * 0.32;
  const eyeY = cy - r * 0.12;
  const eyeRadius = r * 0.2;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.arc(cx + side * eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.08);
  ctx.lineTo(cx - r * 0.13, cy + r * 0.28);
  ctx.lineTo(cx + r * 0.13, cy + r * 0.28);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.lineWidth = r * 0.06;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * r * 0.2, cy + r * 0.4);
    ctx.lineTo(cx + i * r * 0.2, cy + r * 0.62);
    ctx.stroke();
  }
}

const TOUCH_OF_DEATH_HUE = 355; // dark red

export function generateTouchOfDeathIcon() {
  return generateIcon('touch-of-death', TOUCH_OF_DEATH_HUE, drawSkullGlyph);
}

function drawFingerprintGlyph(ctx, cx, cy, r) {
  ctx.lineCap = 'round';
  const loops = 4;
  for (let i = 0; i < loops; i++) {
    const loopR = r * (0.35 + i * 0.16);
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.1, loopR, Math.PI * 1.15, Math.PI * 2.75);
    ctx.stroke();
  }
}

const GREASY_FINGERS_HUE = 42; // amber/yellow

export function generateGreasyFingersIcon() {
  return generateIcon('greasy-fingers', GREASY_FINGERS_HUE, drawFingerprintGlyph);
}
