// Hand-rolled beeps via the Web Audio API — no audio library, no sound files.
// The AudioContext is created lazily on first use so it's opened during a
// real user gesture (a tap), satisfying browser autoplay policies.

let audioCtx = null;

function getContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function beep({ frequency, duration, type = 'sine', gain = 0.1, delay = 0 }) {
  const ctx = getContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;

  const startTime = ctx.currentTime + delay;
  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playFlip() {
  beep({ frequency: 420, duration: 0.08, type: 'triangle', gain: 0.07 });
}

export function playMatch() {
  beep({ frequency: 660, duration: 0.12, gain: 0.1 });
  beep({ frequency: 880, duration: 0.16, gain: 0.1, delay: 0.08 });
}

export function playMismatch() {
  beep({ frequency: 180, duration: 0.16, type: 'sawtooth', gain: 0.07 });
}

export function playWin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, i) => {
    beep({ frequency, duration: 0.18, gain: 0.1, delay: i * 0.1 });
  });
}
