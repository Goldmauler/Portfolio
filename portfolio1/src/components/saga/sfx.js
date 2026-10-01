// Tiny Web Audio synth for the saga — no audio files.
// Browsers only allow sound after a user gesture; until then calls are no-ops.

let ctx = null;
let master = null;
let enabled = (() => {
  try {
    return sessionStorage.getItem('vh-sound') !== '0';
  } catch {
    return true;
  }
})();

export const soundOn = () => enabled;
export function setSound(on) {
  enabled = on;
  try {
    sessionStorage.setItem('vh-sound', on ? '1' : '0');
  } catch {
    /* storage unavailable */
  }
  if (!on && ctx) ctx.suspend();
}

function ac() {
  if (!enabled) return null;
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx.state === 'running' ? ctx : null;
  } catch {
    return null;
  }
}

/** Shared context + master bus for the music module (null when muted/blocked). */
export function audioGraph() {
  const c = ac();
  return c ? { c, master } : null;
}

/** Call from any user gesture so later cues are allowed to play. */
export function primeAudio() {
  ac();
}

function noise(c, secs) {
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * secs), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

function env(c, g, t, peak, attack, decay) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

/** Bell-like shimmer: the Time Stone. */
export function chime() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  [523.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    env(c, g, t + i * 0.08, 0.09, 0.02, 2.2);
    o.connect(g).connect(master);
    o.start(t + i * 0.08);
    o.stop(t + i * 0.08 + 2.4);
  });
}

/** Airy sweep. */
export function whoosh(dur = 1.2) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const n = noise(c, dur);
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 0.9;
  f.frequency.setValueAtTime(300, t);
  f.frequency.exponentialRampToValueAtTime(3200, t + dur * 0.6);
  f.frequency.exponentialRampToValueAtTime(600, t + dur);
  const g = c.createGain();
  env(c, g, t, 0.35, dur * 0.35, dur * 0.65);
  n.connect(f).connect(g).connect(master);
  n.start(t);
  n.stop(t + dur);
}

/** Tape-rewind warble. */
export function rewind(dur = 2) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(1400, t);
  o.frequency.exponentialRampToValueAtTime(90, t + dur);
  const lfo = c.createOscillator();
  const lg = c.createGain();
  lfo.frequency.value = 18;
  lg.gain.value = 60;
  lfo.connect(lg).connect(o.frequency);
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 1800;
  const g = c.createGain();
  env(c, g, t, 0.09, 0.05, dur);
  o.connect(f).connect(g).connect(master);
  o.start(t);
  lfo.start(t);
  o.stop(t + dur + 0.1);
  lfo.stop(t + dur + 0.1);
}

/** Low menace. */
export function rumble(dur = 3) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = 'triangle';
  o.frequency.setValueAtTime(55, t);
  o.frequency.linearRampToValueAtTime(38, t + dur);
  const g = c.createGain();
  env(c, g, t, 0.35, 0.4, dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.5);
}

/** The snap: a sharp click, then a sub-bass boom. */
export function snap() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const n = noise(c, 0.12);
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800;
  const g = c.createGain();
  env(c, g, t, 0.9, 0.002, 0.08);
  n.connect(hp).connect(g).connect(master);
  n.start(t);
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(90, t + 0.03);
  o.frequency.exponentialRampToValueAtTime(30, t + 1.8);
  const og = c.createGain();
  env(c, og, t + 0.03, 0.6, 0.02, 1.9);
  o.connect(og).connect(master);
  o.start(t + 0.03);
  o.stop(t + 2.1);
}

/** Wind carrying the dust away. */
export function wind(dur = 6) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const n = noise(c, dur);
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(400, t);
  f.frequency.linearRampToValueAtTime(1400, t + dur * 0.5);
  f.frequency.linearRampToValueAtTime(300, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.28, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(f).connect(g).connect(master);
  n.start(t);
  n.stop(t + dur);
}
