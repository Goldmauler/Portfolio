// Canvas effects for the saga. Both work the same way: the page is painted
// over cell-by-cell in the background colour along a noisy wave, and every
// covered cell releases particles — so the page itself seems to turn into
// butterflies (Time Stone) or blow away as dust (the snap).

function readTheme() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n, fb) => cs.getPropertyValue(n).trim() || fb;
  return {
    bg: v('--bg', '#030605'),
    fg: v('--fg', '#cdeedc'),
    accent: v('--accent', '#00ff9d'),
    accent2: v('--accent-2', '#00d4ff'),
    light: document.documentElement.dataset.mode === 'light',
  };
}

function setup(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cover = document.createElement('canvas');
  cover.width = canvas.width;
  cover.height = canvas.height;
  const cctx = cover.getContext('2d');
  cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, cover, cctx, W, H, dpr };
}

/** Cells sorted by when they dissolve (threshold 0..1). */
function makeCells(W, H, size, threshold) {
  const cols = Math.ceil(W / size);
  const rows = Math.ceil(H / size);
  const n = cols * rows;
  const th = new Float32Array(n);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) th[r * cols + c] = threshold((c + 0.5) * size, (r + 0.5) * size);
  }
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => th[a] - th[b]);
  return { cols, n, th, order, ptr: 0, size };
}

function advance(cells, p, cctx, onCell) {
  const { cols, n, th, order, size } = cells;
  while (cells.ptr < n && th[order[cells.ptr]] <= p) {
    const i = order[cells.ptr++];
    const x = (i % cols) * size;
    const y = Math.floor(i / cols) * size;
    cctx.fillRect(x, y, size + 0.6, size + 0.6);
    onCell(x + size / 2, y + size / 2);
  }
  return cells.ptr >= n;
}

/* ------------------------------------------------------------------------ */
/* Butterflies                                                              */
/* ------------------------------------------------------------------------ */

const FRAMES = 10;

function butterflySprites(colors, glow, bodyColor) {
  return colors.map((col) =>
    Array.from({ length: FRAMES }, (_, f) => {
      const S = 64;
      const c = document.createElement('canvas');
      c.width = S;
      c.height = S;
      const g = c.getContext('2d');
      const open = 0.1 + 0.9 * Math.abs(Math.cos((f / FRAMES) * Math.PI));
      g.translate(S / 2, S / 2);
      if (glow) {
        g.shadowColor = col;
        g.shadowBlur = 9;
      }
      [1, -1].forEach((side) => {
        g.save();
        g.scale(side * open, 1);
        g.fillStyle = col;
        // forewing
        g.globalAlpha = 0.95;
        g.beginPath();
        g.moveTo(0, -2);
        g.bezierCurveTo(7, -22, 27, -25, 25, -8);
        g.bezierCurveTo(23, -1, 10, 2, 0, 1);
        g.closePath();
        g.fill();
        // hindwing
        g.globalAlpha = 0.78;
        g.beginPath();
        g.moveTo(0, 2);
        g.bezierCurveTo(12, 3, 21, 14, 14, 22);
        g.bezierCurveTo(8, 27, 2, 15, 0, 6);
        g.closePath();
        g.fill();
        // wing eye-spot
        g.shadowBlur = 0;
        g.globalAlpha = 0.55;
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(15, -11, 3, 0, Math.PI * 2);
        g.fill();
        g.restore();
      });
      g.shadowBlur = 0;
      g.globalAlpha = 1;
      g.fillStyle = bodyColor;
      g.fillRect(-1.2, -9, 2.4, 19);
      g.strokeStyle = bodyColor;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, -9);
      g.quadraticCurveTo(-3, -15, -6, -16);
      g.moveTo(0, -9);
      g.quadraticCurveTo(3, -15, 6, -16);
      g.stroke();
      return c;
    }),
  );
}

export function runButterflies(canvas, { cx, cy, duration = 3600, reduced = false } = {}) {
  const { ctx, cover, cctx, W, H, dpr } = setup(canvas);
  const theme = readTheme();
  cctx.fillStyle = theme.bg;
  const maxD = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));
  const cells = makeCells(W, H, 10, (x, y) => (Math.hypot(x - cx, y - cy) / maxD) * 0.82 + Math.random() * 0.18);
  const palette = theme.light ? ['#120b0e', '#ffffff', '#3a2a30'] : [theme.accent, theme.accent2, '#ffffff'];
  const sprites = butterflySprites(palette, !theme.light, theme.light ? '#120b0e' : '#020403');
  const flock = [];
  const rate = reduced ? 0.02 : 0.075;

  const spawn = (x, y) => {
    if (Math.random() > rate) return;
    const a = Math.atan2(y - cy, x - cx);
    const sp = 50 + Math.random() * 130;
    flock.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 70,
      size: 12 + Math.random() * 18,
      ph: Math.random() * FRAMES,
      fr: 9 + Math.random() * 8,
      k: Math.random() < 0.72 ? 0 : Math.random() < 0.7 ? 1 : 2,
      wob: Math.random() * Math.PI * 2,
    });
  };

  let raf = 0;
  let stopped = false;
  const promise = new Promise((resolve) => {
    const start = performance.now();
    let last = start;
    const loop = (now) => {
      if (stopped) return resolve();
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const covered = advance(cells, Math.min(1.02, (now - start) / (duration * 0.6)), cctx, spawn);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(cover, 0, 0, W, H);
      for (let i = flock.length - 1; i >= 0; i--) {
        const b = flock[i];
        b.vy += (-55 + Math.sin(t * 3.2 + b.wob) * 90) * dt;
        b.vx += Math.cos(t * 2.1 + b.wob) * 45 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.y < -40 || b.x < -40 || b.x > W + 40 || b.y > H + 40) {
          flock.splice(i, 1);
          continue;
        }
        const rot = Math.atan2(b.vy, b.vx) + Math.PI / 2;
        const cos = Math.cos(rot) * dpr;
        const sin = Math.sin(rot) * dpr;
        ctx.setTransform(cos, sin, -sin, cos, b.x * dpr, b.y * dpr);
        const frame = Math.floor(t * b.fr + b.ph) % FRAMES;
        ctx.drawImage(sprites[b.k][frame], -b.size / 2, -b.size / 2, b.size, b.size);
      }
      if ((covered && flock.length === 0) || now - start > duration + 2500) return resolve();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  });
  return {
    promise,
    stop: () => {
      stopped = true;
      cancelAnimationFrame(raf);
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Dust (the snap)                                                          */
/* ------------------------------------------------------------------------ */

const MAX_DUST = 30000;

export function runDust(canvas, { duration = 7000, reduced = false } = {}) {
  const { ctx, cover, cctx, W, H, dpr } = setup(canvas);
  const theme = readTheme();
  cctx.fillStyle = theme.bg;
  // Several "infection" points, like bodies turning to dust from different places.
  const seeds = Array.from({ length: 7 }, () => ({ x: Math.random() * W, y: Math.random() * H, k: 0.55 + Math.random() * 0.6 }));
  const reach = Math.hypot(W, H) * 0.55;
  const CELL = 5;
  // Disintegration sweeps left → right (with the wind), eaten in patches.
  const cells = makeCells(W, H, CELL, (x, y) => {
    let m = 9;
    for (const s of seeds) m = Math.min(m, Math.hypot(x - s.x, y - s.y) / (reach * s.k));
    return (x / W) * 0.58 + Math.min(1, m) * 0.3 + Math.random() * 0.12;
  });

  const palette = theme.light
    ? ['#120b0e', '#4a3038', '#7d5d66', '#2a1d22']
    : [theme.fg, theme.accent, '#7d8783', '#4b4340'];
  const weights = [0.32, 0.22, 0.26, 0.2];
  const pickColor = () => {
    let r = Math.random();
    for (let i = 0; i < weights.length; i++) {
      if ((r -= weights[i]) <= 0) return i;
    }
    return 0;
  };

  const px = new Float32Array(MAX_DUST);
  const py = new Float32Array(MAX_DUST);
  const vx = new Float32Array(MAX_DUST);
  const vy = new Float32Array(MAX_DUST);
  const life = new Float32Array(MAX_DUST);
  const maxLife = new Float32Array(MAX_DUST);
  const col = new Uint8Array(MAX_DUST);
  const size = new Float32Array(MAX_DUST);
  let count = 0;
  const rate = reduced ? 0.15 : 0.5;

  const spawn = (x, y) => {
    if (count >= MAX_DUST || Math.random() > rate) return;
    const i = count++;
    px[i] = x + (Math.random() - 0.5) * CELL;
    py[i] = y + (Math.random() - 0.5) * CELL;
    vx[i] = 30 + Math.random() * 60;
    vy[i] = -14 - Math.random() * 36;
    maxLife[i] = life[i] = 1.8 + Math.random() * 2.4;
    col[i] = pickColor();
    size[i] = 1.4 + Math.random() * 2.4;
  };

  // Buckets: colour × 4 alpha levels, reused each frame.
  const buckets = Array.from({ length: palette.length * 4 }, () => []);

  let raf = 0;
  let stopped = false;
  const promise = new Promise((resolve) => {
    const start = performance.now();
    let last = start;
    const loop = (now) => {
      if (stopped) return resolve();
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const covered = advance(cells, Math.min(1.02, (now - start) / (duration * 0.72)), cctx, spawn);

      const windX = 50 + t * 22;
      for (let i = count - 1; i >= 0; i--) {
        life[i] -= dt;
        if (life[i] <= 0 || px[i] > W + 10 || py[i] < -10) {
          // swap-remove
          const j = --count;
          px[i] = px[j];
          py[i] = py[j];
          vx[i] = vx[j];
          vy[i] = vy[j];
          life[i] = life[j];
          maxLife[i] = maxLife[j];
          col[i] = col[j];
          size[i] = size[j];
          continue;
        }
        vx[i] += (windX * 0.55 + Math.sin(py[i] * 0.013 + t * 1.9) * 38) * dt;
        vy[i] += (Math.cos(px[i] * 0.011 + t * 1.4) * 32 - 22) * dt;
        vx[i] *= 0.985;
        px[i] += vx[i] * dt;
        py[i] += vy[i] * dt;
      }

      buckets.forEach((b) => (b.length = 0));
      for (let i = 0; i < count; i++) {
        const a = life[i] / maxLife[i];
        const level = a > 0.75 ? 3 : a > 0.5 ? 2 : a > 0.25 ? 1 : 0;
        buckets[col[i] * 4 + level].push(i);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(cover, 0, 0, W, H);
      buckets.forEach((b, k) => {
        if (!b.length) return;
        ctx.fillStyle = palette[Math.floor(k / 4)];
        ctx.globalAlpha = [0.18, 0.4, 0.68, 0.95][k % 4];
        for (const i of b) ctx.fillRect(px[i], py[i], size[i], size[i]);
      });
      ctx.globalAlpha = 1;

      if ((covered && count === 0) || now - start > duration + 3500) return resolve();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  });
  return {
    promise,
    stop: () => {
      stopped = true;
      cancelAnimationFrame(raf);
    },
  };
}
