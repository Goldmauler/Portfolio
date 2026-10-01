import { getState, setState } from './store';

// Every theme drives both the CSS tokens and the 1-bit dither shader
// (paper = empty pixels, ink = mid tones, ink2 = highlights).
// Colour themes are named after the Infinity Stones.
export const THEMES = {
  time: {
    label: 'time',
    stone: 'Time Stone',
    bg: '#030605',
    fg: '#cdeedc',
    accent: '#2bff88',
    accent2: '#9dffcc',
    panel: '#08110d',
    onAccent: '#021009',
    ink: '#14c86a',
    ink2: '#c4ffdf',
  },
  space: {
    label: 'space',
    stone: 'Space Stone',
    bg: '#02040b',
    fg: '#d6e4ff',
    accent: '#3d8bff',
    accent2: '#8fd0ff',
    panel: '#070d1a',
    onAccent: '#00102a',
    ink: '#2b6fe6',
    ink2: '#dfeaff',
  },
  reality: {
    label: 'reality',
    stone: 'Reality Stone',
    bg: '#080203',
    fg: '#ffdcdd',
    accent: '#ff2e3e',
    accent2: '#ff8a5c',
    panel: '#150608',
    onAccent: '#1a0003',
    ink: '#d81c2c',
    ink2: '#ffd6d9',
  },
  soul: {
    label: 'soul',
    stone: 'Soul Stone',
    bg: '#080402',
    fg: '#ffe4cc',
    accent: '#ff8c1a',
    accent2: '#ffcf5a',
    panel: '#150b04',
    onAccent: '#1a0b00',
    ink: '#e06f00',
    ink2: '#ffe6c8',
  },
  paper: {
    label: 'paper',
    light: true,
    bg: '#f2879f',
    fg: '#2a2024',
    accent: '#231b1e',
    accent2: '#ffffff',
    panel: '#e7e5e5',
    onAccent: '#ffffff',
    ink: '#2a1d22',
    ink2: '#ffffff',
  },
};

// Saved preferences from before the rename.
const LEGACY = { phosphor: 'time', ice: 'space', redteam: 'reality', amber: 'soul' };

export const THEME_KEYS = Object.keys(THEMES);
export const DEFAULT_THEME = 'time';

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

// 1-bit arrow, drawn at 2x: '#' outline, 'o' fill.
const ARROW = [
  '#........',
  '##.......',
  '#o#......',
  '#oo#.....',
  '#ooo#....',
  '#oooo#...',
  '#ooooo#..',
  '#oooooo#.',
  '#ooooooo#',
  '#ooo#####',
  '#o#o#....',
  '##.#o#...',
  '#..#o#...',
  '....##...',
];

function pixelCursor(rows, outline, fill, hotspot, fallback) {
  const w = rows[0].length;
  const h = rows.length;
  let rects = '';
  rows.forEach((row, y) => {
    // Merge horizontal runs of the same color into one rect.
    let x = 0;
    while (x < w) {
      const c = row[x];
      let end = x;
      while (end < w && row[end] === c) end++;
      if (c !== '.') rects += `<rect x='${x}' y='${y}' width='${end - x}' height='1' fill='${c === '#' ? outline : fill}'/>`;
      x = end;
    }
  });
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w * 2}' height='${h * 2}' viewBox='0 0 ${w} ${h}' shape-rendering='crispEdges'>${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotspot[0]} ${hotspot[1]}, ${fallback}`;
}

export function applyTheme(key) {
  const t = THEMES[key] || THEMES[DEFAULT_THEME];
  const cursorFill = t.light ? '#ffffff' : t.accent;
  const pointerFill = t.light ? '#ffd23f' : t.accent2;
  document.documentElement.style.setProperty('--cursor', pixelCursor(ARROW, '#000000', cursorFill, [1, 1], 'auto'));
  document.documentElement.style.setProperty(
    '--cursor-pointer',
    pixelCursor(ARROW, '#000000', pointerFill, [1, 1], 'pointer'),
  );
  const root = document.documentElement;
  root.dataset.theme = key;
  root.dataset.mode = t.light ? 'light' : 'dark';
  const vars = {
    '--bg': t.bg,
    '--bg-rgb': hexToRgb(t.bg),
    '--fg': t.fg,
    '--fg-rgb': hexToRgb(t.fg),
    '--accent': t.accent,
    '--accent-rgb': hexToRgb(t.accent),
    '--accent-2': t.accent2,
    '--accent-2-rgb': hexToRgb(t.accent2),
    '--panel': t.panel,
    '--on-accent': t.onAccent,
  };
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.bg);
}

export function setTheme(key) {
  if (!THEMES[key]) return false;
  applyTheme(key);
  setState({ theme: key });
  try {
    localStorage.setItem('vh-theme', key);
  } catch {
    /* storage unavailable */
  }
  return true;
}

export function cycleTheme() {
  const i = THEME_KEYS.indexOf(getState().theme);
  const next = THEME_KEYS[(i + 1) % THEME_KEYS.length];
  setTheme(next);
  return next;
}

export function restoreTheme() {
  let saved = DEFAULT_THEME;
  try {
    saved = localStorage.getItem('vh-theme') || DEFAULT_THEME;
  } catch {
    /* storage unavailable */
  }
  saved = LEGACY[saved] || saved;
  if (!THEMES[saved]) saved = DEFAULT_THEME;
  applyTheme(saved);
  setState({ theme: saved });
}
