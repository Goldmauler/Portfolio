// An original, heroic orchestral cue synthesized live with Web Audio —
// detuned brass with filter swells, a string pad, pitched timpani, a cymbal
// swell and a generated hall reverb. No audio files, no borrowed melody.

import { audioGraph } from './sfx';

const BPM = 96;
const BEAT = 60 / BPM;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

// Melody: [startBeat, beats, midi]. D minor, rising arpeggios → A major → D major.
const THEME = [
  [0, 0.5, 62], [0.5, 0.5, 65], [1, 0.5, 69], [1.5, 1.5, 74], [3, 0.5, 72], [3.5, 0.5, 69],
  [4, 1.5, 70], [5.5, 0.5, 69], [6, 1, 67], [7, 1, 65],
  [8, 0.5, 67], [8.5, 0.5, 70], [9, 0.5, 74], [9.5, 1.5, 79], [11, 0.5, 77], [11.5, 0.5, 76],
  [12, 1, 76], [13, 1, 73], [14, 2, 69],
  [16, 5, 74],
];
// Harmony per bar: [startBeat, beats, notes]
const CHORDS = [
  [0, 4, [50, 57, 62, 65]], // Dm
  [4, 4, [46, 53, 58, 62]], // Bb
  [8, 4, [43, 50, 55, 58]], // Gm
  [12, 4, [45, 52, 57, 61]], // A
  [16, 6, [38, 50, 57, 62, 66, 69]], // D major
];

function makeReverb(c) {
  const len = Math.floor(c.sampleRate * 2.8);
  const ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3.2;
  }
  const conv = c.createConvolver();
  conv.buffer = ir;
  return conv;
}

function bus(graph, level = 0.42) {
  const { c, master } = graph;
  const out = c.createGain();
  out.gain.value = level;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 3;
  const dry = c.createGain();
  dry.gain.value = 0.8;
  const wet = c.createGain();
  wet.gain.value = 0.45;
  const rev = makeReverb(c);
  out.connect(dry).connect(comp);
  out.connect(rev).connect(wet).connect(comp);
  comp.connect(master);
  return out;
}

function brass(c, out, freq, t, dur, vel = 1) {
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(420, t);
  f.frequency.linearRampToValueAtTime(700 + 2600 * vel, t + 0.12);
  f.frequency.exponentialRampToValueAtTime(1300 + 500 * vel, t + 0.5);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.16 * vel, t + 0.06);
  g.gain.linearRampToValueAtTime(0.12 * vel, t + 0.3);
  g.gain.setValueAtTime(0.12 * vel, t + Math.max(0.3, dur - 0.05));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.35);
  const vib = c.createOscillator();
  const vibG = c.createGain();
  vib.frequency.value = 5.4;
  vibG.gain.setValueAtTime(0, t);
  vibG.gain.linearRampToValueAtTime(freq * 0.004, t + 0.45);
  vib.connect(vibG);
  [-7, 0, 7].forEach((cents) => {
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = freq;
    o.detune.value = cents;
    vibG.connect(o.frequency);
    o.connect(f);
    o.start(t);
    o.stop(t + dur + 0.4);
  });
  f.connect(g).connect(out);
  vib.start(t);
  vib.stop(t + dur + 0.4);
}

function strings(c, out, notes, t, dur, level = 0.05) {
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 1500;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(level, t + 0.6);
  g.gain.setValueAtTime(level, t + dur);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.9);
  notes.forEach((m) => {
    [-9, 9].forEach((cents) => {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = hz(m);
      o.detune.value = cents;
      o.connect(f);
      o.start(t);
      o.stop(t + dur + 1);
    });
  });
  f.connect(g).connect(out);
}

function timpani(c, out, freq, t, vel = 1) {
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq * 1.5, t);
  o.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.7 * vel, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 1.5);
  const n = noiseSrc(c, 0.2);
  const nf = c.createBiquadFilter();
  nf.type = 'lowpass';
  nf.frequency.value = 500;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.4 * vel, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  n.connect(nf).connect(ng).connect(out);
  n.start(t);
}

function roll(c, out, freq, t, dur) {
  for (let x = 0; x < dur; x += 0.07) timpani(c, out, freq, t + x, 0.08 + (x / dur) * 0.55);
}

function cymbal(c, out, t, dur) {
  const n = noiseSrc(c, dur + 2);
  const f = c.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 5500;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + dur);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 2);
  n.connect(f).connect(g).connect(out);
  n.start(t);
}

function noiseSrc(c, secs) {
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * secs), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource();
  s.buffer = buf;
  return s;
}

function play(build) {
  const graph = audioGraph();
  if (!graph) return { stop() {} };
  const out = bus(graph);
  build(graph.c, out, graph.c.currentTime + 0.05);
  return {
    stop(fade = 0.6) {
      const t = graph.c.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(out.gain.value, t);
      out.gain.linearRampToValueAtTime(0, t + fade);
    },
  };
}

function theme(c, out, t0, upToBeat = Infinity) {
  THEME.filter(([b]) => b < upToBeat).forEach(([b, d, m]) => {
    const t = t0 + b * BEAT;
    brass(c, out, hz(m), t, d * BEAT, 1);
    brass(c, out, hz(m - 12), t, d * BEAT, 0.45);
  });
  CHORDS.filter(([b]) => b < upToBeat).forEach(([b, d, notes], i) => {
    const t = t0 + b * BEAT;
    strings(c, out, notes, t, d * BEAT, i === CHORDS.length - 1 ? 0.07 : 0.045);
    brass(c, out, hz(notes[0] - 12), t, d * BEAT, 0.55);
    timpani(c, out, hz(notes[0] - 12), t, 1);
  });
}

/* ------------------------------------------------------------------------ */
/* Optional end-credits track                                               */
/* ------------------------------------------------------------------------ */

// Drop an audio file you have the rights to at public/audio/saga-theme.mp3
// and it plays over the "WILL RETURN IN 2027" end credits. Every other cue
// stays synthesized.
export const MUSIC_SRC = '/audio/saga-theme.mp3';

let trackCheck = null;
let preloaded = null;

function customTrack() {
  if (!trackCheck) {
    // SPA rewrites answer missing files with index.html, so check the type.
    trackCheck = fetch(MUSIC_SRC, { method: 'HEAD' })
      .then((r) => r.ok && (r.headers.get('content-type') || '').startsWith('audio'))
      .catch(() => false);
  }
  return trackCheck;
}

/** Start buffering the credits track early so it starts right on cue. */
export function preloadCredits() {
  customTrack().then((ok) => {
    if (!ok || preloaded) return;
    preloaded = new Audio(MUSIC_SRC);
    preloaded.preload = 'auto';
    preloaded.load();
  });
}

function playFile(fallback) {
  const graph = audioGraph();
  if (!graph) return { stop() {} };
  let audio = null;
  let gain = null;
  let synth = null;
  let stopped = false;
  customTrack().then((ok) => {
    if (stopped) return;
    if (!ok) {
      synth = fallback();
      return;
    }
    audio = preloaded || new Audio(MUSIC_SRC);
    preloaded = null;
    audio.currentTime = 0;
    gain = graph.c.createGain();
    const t = graph.c.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.9, t + 1.2);
    graph.c.createMediaElementSource(audio).connect(gain).connect(graph.master);
    audio.play().catch(() => {});
  });
  return {
    stop(fade = 0.6) {
      stopped = true;
      synth?.stop(fade);
      if (audio && gain) {
        const t = graph.c.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0, t + fade);
        setTimeout(() => audio.pause(), fade * 1000 + 50);
      }
    },
  };
}

/** Time Stone unlock: a timpani roll into the opening of the theme. */
export function rise() {
  return riseSynth();
}

/** End credits: the custom track if one is present, else the full synthesized cue. */
export function fanfare() {
  return playFile(fanfareSynth);
}

function riseSynth() {
  return play((c, out, t) => {
    roll(c, out, hz(38), t, 1.6);
    cymbal(c, out, t + 0.2, 1.4);
    theme(c, out, t + 1.6, 8);
    strings(c, out, [50, 57, 62, 65, 69], t + 1.6 + 8 * BEAT, 3, 0.06);
  });
}

/** Thanos: low tritone stabs and hits. */
export function threat() {
  return play((c, out, t) => {
    [0, 1, 1.5, 2.5, 3, 3.5].forEach((b, i) => {
      const tt = t + b * BEAT;
      brass(c, out, hz(38), tt, 0.45, 0.9);
      brass(c, out, hz(44), tt, 0.45, 0.7);
      if (i % 2 === 0) timpani(c, out, hz(38 - 12), tt, 1);
    });
    strings(c, out, [38, 44, 50], t, 4.5, 0.05);
  });
}

function fanfareSynth() {
  return play((c, out, t) => {
    roll(c, out, hz(38), t, 1.2);
    theme(c, out, t + 1.2);
    cymbal(c, out, t + 1.2 + 14 * BEAT, 2 * BEAT);
  });
}
