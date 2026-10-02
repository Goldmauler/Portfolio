// Retro 8-bit / Chiptune audio synthesizer using Web Audio API
// Generates authentic retro arcade clicks, blips, zaps, coins, and buzzes without any external audio files.

let ctx = null;
let masterGain = null;

const isSoundEnabled = () => {
  try {
    return sessionStorage.getItem('vh-sound') !== '0';
  } catch {
    return true;
  }
};

let enabled = isSoundEnabled();

export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!enabled) return null;
  try {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.22, ctx.currentTime);
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx.state === 'running' ? ctx : null;
  } catch {
    return null;
  }
}

export function isAudioOn() {
  return enabled;
}

export function toggleAudio() {
  setAudio(!enabled);
  return enabled;
}

export function setAudio(on) {
  enabled = Boolean(on);
  try {
    sessionStorage.setItem('vh-sound', on ? '1' : '0');
  } catch {
    /* storage unavailable */
  }
  if (!on && ctx && ctx.state === 'running') {
    ctx.suspend().catch(() => {});
  } else if (on && ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  window.dispatchEvent(new CustomEvent('vh-sound-change', { detail: { enabled } }));
}

/** Pre-warm audio on initial user touch or click */
export function initAudio() {
  getAudioContext();
}

/** Helper: create envelope */
function makeEnv(audioCtx, gainNode, startTime, peak, attack, decay) {
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.linearRampToValueAtTime(peak, startTime + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + attack + decay);
}

/** Standard retro arcade button click / chip blip */
export function playRetroClick(pitch = 640) {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(pitch, t);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.45, t + 0.035);

  makeEnv(c, gain, t, 0.16, 0.002, 0.035);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(t);
  osc.stop(t + 0.04);
}

/** Terminal keyboard click (mechanical + 8-bit tactile transient) */
export function playKeyClick() {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  // 1. High tactile transient click
  const osc = c.createOscillator();
  const oscGain = c.createGain();
  const freq = 1100 + Math.random() * 250;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(320, t + 0.018);
  makeEnv(c, oscGain, t, 0.12, 0.001, 0.018);

  osc.connect(oscGain);
  oscGain.connect(masterGain);
  osc.start(t);
  osc.stop(t + 0.022);
}

/** Terminal Enter / command execute chirp */
export function playEnter() {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const o1 = c.createOscillator();
  const g1 = c.createGain();
  o1.type = 'square';
  o1.frequency.setValueAtTime(587.33, t); // D5
  makeEnv(c, g1, t, 0.14, 0.003, 0.035);
  o1.connect(g1);
  g1.connect(masterGain);
  o1.start(t);
  o1.stop(t + 0.04);

  const o2 = c.createOscillator();
  const g2 = c.createGain();
  o2.type = 'square';
  o2.frequency.setValueAtTime(880, t + 0.035); // A5
  makeEnv(c, g2, t + 0.035, 0.16, 0.003, 0.05);
  o2.connect(g2);
  g2.connect(masterGain);
  o2.start(t + 0.035);
  o2.stop(t + 0.09);
}

/** Retro error buzz */
export function playError() {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.setValueAtTime(110, t + 0.06);

  makeEnv(c, gain, t, 0.18, 0.005, 0.14);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(t);
  osc.stop(t + 0.15);
}

/** Retro success / command complete chime */
export function playSuccess() {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(freq, t + idx * 0.04);
    makeEnv(c, g, t + idx * 0.04, 0.12, 0.004, 0.08);
    o.connect(g);
    g.connect(masterGain);
    o.start(t + idx * 0.04);
    o.stop(t + idx * 0.04 + 0.09);
  });
}

/** Retro quiz coin / correct answer chime */
export function playCoin() {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const o1 = c.createOscillator();
  const g1 = c.createGain();
  o1.type = 'square';
  o1.frequency.setValueAtTime(987.77, t); // B5
  makeEnv(c, g1, t, 0.18, 0.003, 0.05);
  o1.connect(g1);
  g1.connect(masterGain);
  o1.start(t);
  o1.stop(t + 0.06);

  const o2 = c.createOscillator();
  const g2 = c.createGain();
  o2.type = 'square';
  o2.frequency.setValueAtTime(1318.51, t + 0.055); // E6
  makeEnv(c, g2, t + 0.055, 0.22, 0.004, 0.26);
  o2.connect(g2);
  g2.connect(masterGain);
  o2.start(t + 0.055);
  o2.stop(t + 0.33);
}

/** Retro wrong buzzer */
export function playWrong() {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(220, t);
  o.frequency.linearRampToValueAtTime(110, t + 0.18);
  makeEnv(c, g, t, 0.2, 0.005, 0.18);
  o.connect(g);
  g.connect(masterGain);
  o.start(t);
  o.stop(t + 0.2);
}

/** Retro laser zap for Firewall destroy packet */
export function playLaser() {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(1400, t);
  osc.frequency.exponentialRampToValueAtTime(160, t + 0.09);

  makeEnv(c, gain, t, 0.18, 0.002, 0.09);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(t);
  osc.stop(t + 0.1);
}

/** Retro explosion / core damage crunch */
export function playExplosion() {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const bufferSize = Math.floor(c.sampleRate * 0.18);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = c.createBufferSource();
  noise.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(900, t);
  filter.frequency.linearRampToValueAtTime(150, t + 0.18);

  const gain = c.createGain();
  makeEnv(c, gain, t, 0.28, 0.005, 0.18);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  noise.start(t);
  noise.stop(t + 0.19);
}

/** Retro arcade power-up fanfare (starting quiz / starting firewall) */
export function playPowerUp() {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const notes = [330, 392, 494, 659]; // E4, G4, B4, E5
  notes.forEach((freq, idx) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t + idx * 0.06);
    makeEnv(c, g, t + idx * 0.06, 0.18, 0.005, 0.1);
    o.connect(g);
    g.connect(masterGain);
    o.start(t + idx * 0.06);
    o.stop(t + idx * 0.06 + 0.11);
  });
}

/** Retro game over tone */
export function playGameOver() {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const notes = [440, 415, 392, 349];
  notes.forEach((freq, idx) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(freq, t + idx * 0.12);
    makeEnv(c, g, t + idx * 0.12, 0.16, 0.01, 0.12);
    o.connect(g);
    g.connect(masterGain);
    o.start(t + idx * 0.12);
    o.stop(t + idx * 0.12 + 0.14);
  });
}

/** Life / Glider cell toggle pop with varying pitch */
export function playCellPop(row = 0, col = 0) {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const baseFreq = 480 + (col % 10) * 45 + (row % 8) * 35;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(baseFreq, t);
  o.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.025);
  makeEnv(c, g, t, 0.12, 0.002, 0.025);

  o.connect(g);
  g.connect(masterGain);
  o.start(t);
  o.stop(t + 0.03);
}

/** Window open / launch chirp */
export function playWindowOpen() {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(520, t);
  o.frequency.exponentialRampToValueAtTime(1040, t + 0.04);
  makeEnv(c, g, t, 0.12, 0.003, 0.04);

  o.connect(g);
  g.connect(masterGain);
  o.start(t);
  o.stop(t + 0.05);
}

/** Window close blip */
export function playWindowClose() {
  const c = getAudioContext();
  if (!c) return;
  const t = c.currentTime;

  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(780, t);
  o.frequency.exponentialRampToValueAtTime(260, t + 0.035);
  makeEnv(c, g, t, 0.12, 0.002, 0.035);

  o.connect(g);
  g.connect(masterGain);
  o.start(t);
  o.stop(t + 0.04);
}
