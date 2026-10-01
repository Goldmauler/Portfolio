import { useEffect, useRef } from 'react';
import { subscribe, getState } from '../lib/store';
import { prefersReducedMotion, hasFinePointer } from '../lib/device';
import './HoloPortrait.css';

// Brightness ramp for regions lighter than the photo's backdrop (face, shirt),
// a sparse set for dark clothing, and a dense "strand" set for the beard.
// The hair is drawn GitHub-README style: a single `#` contour, empty inside.
const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const DARK = ' .,:;-~=+*';
const HAIR = '~^"\'/\\|()}{][%&#@$8';
const GLITCH = '01<>/\\{}[]#$%&@*+=?';
// Head-and-shoulders crop of the avatar (fractions of the image).
const CROP = { x0: 0.22, x1: 0.84, y0: 0.07, y1: 0.69 };
// Where the head silhouette (hair + face) can be, and where the beard is.
const HEAD = { cx: 0.555, cy: 0.29, rx: 0.17, ry: 0.21 };
const BEARD = { cx: 0.535, cy: 0.505, rx: 0.085, ry: 0.04 };
const inEllipse = (x, y, z) => ((x - z.cx) / z.rx) ** 2 + ((y - z.cy) / z.ry) ** 2 < 1;
// Outline limits (image y): top edges only on the crown, side edges down to the jaw.
const CROWN_Y = 0.27;
const JAW_Y = 0.43;
const HAIR_Y = 0.36;

// Two passes of a separable box blur ≈ gaussian.
function blur(src, w, h, r) {
  let a = src;
  for (let pass = 0; pass < 2; pass++) {
    const tmp = new Float32Array(w * h);
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let s = 0;
        let n = 0;
        for (let k = -r; k <= r; k++) {
          const xx = x + k;
          if (xx >= 0 && xx < w) {
            s += a[y * w + xx];
            n++;
          }
        }
        tmp[y * w + x] = s / n;
      }
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let s = 0;
        let n = 0;
        for (let k = -r; k <= r; k++) {
          const yy = y + k;
          if (yy >= 0 && yy < h) {
            s += tmp[yy * w + x];
            n++;
          }
        }
        out[y * w + x] = s / n;
      }
    }
    a = out;
  }
  return a;
}

/**
 * Convert a circular-cropped portrait into ASCII cells. The backdrop of the
 * photo is a radial gradient, so we fit it (a + b·d²) and classify each cell
 * by how much lighter or darker than the backdrop it is.
 */
export function asciiFromImage(img, cols) {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const cw = CROP.x1 - CROP.x0;
  const ch = CROP.y1 - CROP.y0;
  const rows = Math.round(cols * ((ch * H) / (cw * W)) * 0.5);
  // Halve repeatedly so the final step averages pixels instead of skipping them.
  let srcCanvas = document.createElement('canvas');
  srcCanvas.width = Math.round(cw * W);
  srcCanvas.height = Math.round(ch * H);
  let sctx = srcCanvas.getContext('2d');
  sctx.drawImage(img, CROP.x0 * W, CROP.y0 * H, cw * W, ch * H, 0, 0, srcCanvas.width, srcCanvas.height);
  while (srcCanvas.width / 2 > cols * 1.5) {
    const half = document.createElement('canvas');
    half.width = Math.round(srcCanvas.width / 2);
    half.height = Math.round(srcCanvas.height / 2);
    sctx = half.getContext('2d');
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(srcCanvas, 0, 0, half.width, half.height);
    srcCanvas = half;
  }
  const cv = document.createElement('canvas');
  cv.width = cols;
  cv.height = rows;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(srcCanvas, 0, 0, cols, rows);
  const px = ctx.getImageData(0, 0, cols, rows).data;
  const n = cols * rows;
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = (px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114) / 255;
  const b = blur(s, cols, rows, 2);

  const dist = new Float32Array(n);
  const imgY = new Float32Array(n);
  const headZone = new Uint8Array(n);
  const beardZone = new Uint8Array(n);
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  let cnt = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const x = CROP.x0 + ((c + 0.5) / cols) * cw - 0.5;
      const y = CROP.y0 + ((r + 0.5) / rows) * ch - 0.5;
      const d = Math.hypot(x, y);
      dist[i] = d;
      imgY[i] = y + 0.5;
      headZone[i] = inEllipse(x + 0.5, y + 0.5, HEAD) ? 1 : 0;
      beardZone[i] = inEllipse(x + 0.5, y + 0.5, BEARD) ? 1 : 0;
      if (d < 0.44 && y < 0 && Math.abs(x) > 0.2) {
        const d2 = d * d;
        sx += d2;
        sy += s[i];
        sxx += d2 * d2;
        sxy += d2 * s[i];
        cnt++;
      }
    }
  }
  const slope = cnt > 2 ? (cnt * sxy - sx * sy) / (cnt * sxx - sx * sx) : 0;
  const base = cnt > 2 ? (sy - slope * sx) / cnt : 0.15;
  const bgAt = (i) => base + slope * dist[i] * dist[i];

  // Head silhouette = hair (darker than backdrop) or face (lighter), smoothed,
  // then filled row-wise so only the outer contour survives.
  const raw = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const d = s[i] - bgAt(i);
    raw[i] = headZone[i] && (d < -0.025 || d > 0.05) ? 1 : 0;
  }
  const soft = blur(raw, cols, rows, 1);
  const filled = new Uint8Array(n);
  for (let r = 0; r < rows; r++) {
    let lo = -1;
    let hi = -1;
    for (let c = 0; c < cols; c++) {
      if (soft[r * cols + c] > 0.42) {
        if (lo < 0) lo = c;
        hi = c;
      }
    }
    for (let c = lo; c >= 0 && c <= hi; c++) filled[r * cols + c] = 1;
  }
  const isFilled = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && filled[r * cols + c] === 1;

  const cells = new Array(n);
  const lines = [];
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      let cell = { ch: ' ', kind: 0, t: 0 };
      if (dist[i] < 0.47) {
        const bg = bgAt(i);
        const detail = s[i] - b[i];
        const v = s[i] + 0.8 * detail - bg;
        // Demand a stronger signal near the rim, where the backdrop vignettes.
        const edge = Math.min(1, Math.max(0, (dist[i] - 0.3) / 0.15));
        const y = imgY[i];
        const outline =
          filled[i] &&
          ((y < CROWN_Y && !isFilled(r - 1, c)) || (y < JAW_Y && (!isFilled(r, c - 1) || !isFilled(r, c + 1))));
        if (outline) {
          cell = { ch: '#', kind: 4, t: 1 };
        } else if (v > 0.07 + 0.2 * edge) {
          const t = Math.min(1, (v - 0.07) / 0.7) ** 1.35;
          cell = { ch: RAMP[Math.max(2, Math.round(t * (RAMP.length - 1)))], kind: 1, t };
        } else if (filled[i] && y < HAIR_Y) {
          // Inside the hair contour: leave it empty, like the README art.
        } else if (beardZone[i] && s[i] - bg < -0.025) {
          // Beard: density from darkness, glyph shape from local texture.
          const dark = Math.min(1, (bg - s[i]) / 0.12);
          const tex = Math.min(1, Math.max(0, 0.5 + detail * 7));
          const t = Math.min(1, Math.max(0, 0.35 + 0.45 * dark + 0.35 * (tex - 0.5)));
          cell = { ch: HAIR[Math.round(t * (HAIR.length - 1))], kind: 3, t };
        } else if (v < -(0.05 + 0.14 * edge)) {
          const t = Math.min(1, (-0.05 - v) / 0.12);
          if (t > 0.18) cell = { ch: DARK[Math.max(1, Math.round(t * (DARK.length - 1)))], kind: 2, t };
        }
      }
      cells[i] = cell;
      line += cell.ch;
    }
    lines.push(line);
  }
  return { cols, rows, cells, lines };
}

const readColors = () => {
  const cs = getComputedStyle(document.documentElement);
  return {
    a: cs.getPropertyValue('--accent').trim() || '#00ff9d',
    b: cs.getPropertyValue('--accent-2').trim() || '#00d4ff',
    light: document.documentElement.dataset.mode === 'light',
  };
};

// On light themes a glow can't read, so the portrait is printed in solid ink.
const INK = '#2b1219';

export default function HoloPortrait({ src, cols = 100, label }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = prefersReducedMotion();
    let ascii = null;
    let layer = null; // glowing glyphs
    let ghost = null; // chromatic offset copy
    let size = { w: 0, h: 0, dpr: 1, fs: 10, lh: 12, cw: 6 };
    let raf = 0;
    let visible = false;
    let revealStart = 0;
    let revealed = reduced;
    let glitchUntil = 0;
    let nextGlitch = 0;
    let scanStart = 0;
    const pointer = { x: -999, y: -999, active: false };
    let colors = readColors();

    const buildLayers = () => {
      if (!ascii || !size.w) return;
      colors = readColors();
      const { dpr, fs, lh, cw } = size;
      const make = () => {
        const c = document.createElement('canvas');
        c.width = Math.round(size.w * dpr);
        c.height = Math.round(size.h * dpr);
        const g = c.getContext('2d');
        g.scale(dpr, dpr);
        g.font = `${colors.light ? 600 : 500} ${fs}px "JetBrains Mono", ui-monospace, monospace`;
        g.textBaseline = 'top';
        return [c, g];
      };
      const [lc, lg] = make();
      const [gc, gg] = make();
      lg.shadowColor = colors.a;
      lg.shadowBlur = colors.light ? 0 : 5 * dpr;
      ascii.cells.forEach((cell, i) => {
        if (!cell.kind) return;
        const x = (i % ascii.cols) * cw;
        const y = Math.floor(i / ascii.cols) * lh;
        if (colors.light) {
          // Ink on paper is a positive image: bright skin must stay light, so
          // the brightness ramp is inverted (dense glyphs = shadows/features).
          let ch = cell.ch;
          let alpha = 1;
          if (cell.kind === 1) {
            // Barely-brighter-than-backdrop cells fade out instead of inking up.
            const fade = Math.min(1, Math.max(0, (cell.t - 0.02) / 0.2));
            const ink = fade * (1 - cell.t) ** 2;
            if (ink < 0.06) return;
            ch = RAMP[Math.max(1, Math.round(ink * 0.85 * (RAMP.length - 1)))];
            alpha = 0.35 + 0.65 * ink;
          } else if (cell.kind === 2) {
            alpha = 0.55 + 0.35 * cell.t;
          } else if (cell.kind === 3) {
            alpha = 0.7 + 0.3 * cell.t;
          }
          if (ch === ' ') return;
          lg.globalAlpha = alpha;
          lg.fillStyle = INK;
          lg.fillText(ch, x, y);
          return;
        }
        if (cell.kind === 1) {
          lg.globalAlpha = 0.3 + 0.7 * Math.min(1, cell.t * 1.15);
          lg.fillStyle = colors.a;
        } else if (cell.kind === 3) {
          lg.globalAlpha = 0.5 + 0.45 * cell.t;
          lg.fillStyle = colors.a;
        } else if (cell.kind === 4) {
          lg.globalAlpha = 1;
          lg.fillStyle = colors.a;
        } else {
          lg.globalAlpha = 0.42 + 0.4 * cell.t;
          lg.fillStyle = colors.b;
        }
        lg.fillText(cell.ch, x, y);
        gg.globalAlpha = 0.5;
        gg.fillStyle = colors.light ? colors.b : '#ff2a6d';
        gg.fillText(cell.ch, x, y);
      });
      layer = lc;
      ghost = gc;
    };

    const measure = () => {
      if (!ascii) return;
      const w = wrap.clientWidth;
      const cw = w / ascii.cols;
      const fs = cw / 0.6;
      const lh = fs * 1.2;
      const h = lh * ascii.rows;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = { w, h, dpr, fs, lh, cw };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = `${h}px`;
      buildLayers();
      draw(performance.now());
    };

    const draw = (now) => {
      if (!layer) return;
      const { w, h, dpr, lh, cw } = size;
      const W = canvas.width;
      const H = canvas.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);

      // Materialize from the top down the first time it is seen.
      const p = revealed ? 1 : Math.min(1, (now - revealStart) / 1800);
      if (p >= 1) revealed = true;
      const eased = 1 - (1 - p) ** 3;
      const cutRows = Math.ceil(eased * ascii.rows);
      const cutH = Math.min(H, Math.round(cutRows * lh * dpr));

      const flicker = reduced ? 1 : Math.random() < 0.015 ? 0.55 : 0.9 + Math.random() * 0.1;

      // Chromatic ghost (dark themes only), then the main glyph layer.
      if (cutH > 0) {
        if (!colors.light) {
          ctx.globalAlpha = reduced ? 0.1 : 0.1 + Math.random() * 0.05;
          ctx.drawImage(ghost, 0, 0, W, cutH, -1.6 * dpr, 0, W, cutH);
        }
        ctx.globalAlpha = colors.light ? Math.max(0.85, flicker) : flicker;
        const glitching = now < glitchUntil;
        if (glitching) {
          // Tear a few horizontal bands sideways.
          const bands = 7;
          for (let k = 0; k < bands; k++) {
            const y0 = Math.round((k / bands) * cutH);
            const bh = Math.round(cutH / bands);
            const off = Math.random() < 0.45 ? (Math.random() - 0.5) * 26 * dpr : 0;
            ctx.drawImage(layer, 0, y0, W, bh, off, y0, W, bh);
          }
        } else {
          ctx.drawImage(layer, 0, 0, W, cutH, 0, 0, W, cutH);
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${colors.light ? 600 : 500} ${size.fs}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = 'top';

      // Scanning edge while materializing.
      if (!revealed && cutRows < ascii.rows) {
        const r = cutRows;
        ctx.globalAlpha = 1;
        ctx.fillStyle = colors.light ? INK : colors.a;
        for (let c = 0; c < ascii.cols; c++) {
          const cell = ascii.cells[r * ascii.cols + c];
          if (cell && cell.kind && Math.random() < 0.8) ctx.fillText(GLITCH[(Math.random() * GLITCH.length) | 0], c * cw, r * lh);
        }
        ctx.globalAlpha = 0.85;
        ctx.fillRect(0, r * lh + lh, w, 1.5);
      }

      // Periodic bright sweep, only on existing glyph pixels.
      if (!reduced && revealed) {
        const t = ((now - scanStart) % 5200) / 1300;
        if (t < 1) {
          const y = t * h;
          ctx.globalCompositeOperation = 'source-atop';
          const g = ctx.createLinearGradient(0, y - 40, 0, y + 6);
          g.addColorStop(0, 'rgba(255,255,255,0)');
          g.addColorStop(1, colors.light ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)');
          ctx.fillStyle = g;
          ctx.globalAlpha = 1;
          ctx.fillRect(0, y - 40, w, 46);
          ctx.globalCompositeOperation = 'source-over';
        }
      }

      // Cursor scrambles nearby glyphs.
      if (pointer.active && revealed) {
        const R = 62;
        const c0 = Math.max(0, Math.floor((pointer.x - R) / cw));
        const c1 = Math.min(ascii.cols - 1, Math.ceil((pointer.x + R) / cw));
        const r0 = Math.max(0, Math.floor((pointer.y - R) / lh));
        const r1 = Math.min(ascii.rows - 1, Math.ceil((pointer.y + R) / lh));
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const cell = ascii.cells[r * ascii.cols + c];
            if (!cell.kind) continue;
            const dx = c * cw + cw / 2 - pointer.x;
            const dy = r * lh + lh / 2 - pointer.y;
            const dd = Math.hypot(dx, dy);
            if (dd > R || Math.random() > 1 - dd / R + 0.15) continue;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillRect(c * cw, r * lh, cw, lh);
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.fillStyle = colors.light ? INK : colors.b;
            ctx.fillText(GLITCH[(Math.random() * GLITCH.length) | 0], c * cw, r * lh);
          }
        }
      }
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now > nextGlitch) {
        glitchUntil = now + 140;
        nextGlitch = now + 4500 + Math.random() * 5000;
      }
      draw(now);
    };

    const start = () => {
      if (reduced || raf || !visible) return;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    const ready = (document.fonts?.ready || Promise.resolve()).then(
      () =>
        new Promise((resolve, reject) => {
          if (img.complete && img.naturalWidth) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = reject;
          }
        }),
    );
    let alive = true;
    ready
      .then(() => {
        if (!alive) return;
        ascii = asciiFromImage(img, cols);
        measure();
        start();
      })
      .catch(() => {});

    const ro = new ResizeObserver(() => measure());
    ro.observe(wrap);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          if (!revealStart) {
            revealStart = performance.now();
            scanStart = revealStart + 1800;
            nextGlitch = revealStart + 2500;
          }
          start();
        } else stop();
      },
      { threshold: 0.15 },
    );
    io.observe(wrap);

    let theme = getState().theme;
    const unsub = subscribe(() => {
      if (getState().theme !== theme) {
        theme = getState().theme;
        buildLayers();
        draw(performance.now());
      }
    });

    // Pointer: scramble + subtle 3D tilt of the stage.
    const stage = wrap.parentElement;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty('--ry', `${(nx * 14).toFixed(2)}deg`);
      stage.style.setProperty('--rx', `${(-ny * 10).toFixed(2)}deg`);
    };
    const onLeave = () => {
      pointer.active = false;
      stage.style.setProperty('--ry', '0deg');
      stage.style.setProperty('--rx', '0deg');
    };
    const fine = hasFinePointer() && !reduced;
    if (fine) {
      wrap.addEventListener('pointermove', onMove);
      wrap.addEventListener('pointerleave', onLeave);
    }

    return () => {
      alive = false;
      stop();
      ro.disconnect();
      io.disconnect();
      unsub();
      if (fine) {
        wrap.removeEventListener('pointermove', onMove);
        wrap.removeEventListener('pointerleave', onLeave);
      }
    };
  }, [src, cols]);

  return (
    <figure className="holo">
      <div className="holo__stage">
        <div className="holo__beam" aria-hidden="true" />
        <div ref={wrapRef} className="holo__frame">
          <canvas ref={canvasRef} className="holo__canvas" role="img" aria-label={label} />
          <span className="holo__scan" aria-hidden="true" />
        </div>
        <div className="holo__base" aria-hidden="true" />
      </div>
      <figcaption className="holo__cap label">
        <span className="live-dot" /> HOLO.FEED · vimal.jpg → ascii · move your cursor over it
      </figcaption>
    </figure>
  );
}
