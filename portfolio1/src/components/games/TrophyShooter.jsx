import { useCallback, useEffect, useRef, useState } from 'react';
import { lossQuotes } from '../../data/profile';
import { unlock } from '../../lib/secrets';
import { emit, subscribe, getState } from '../../lib/store';
import { prefersReducedMotion } from '../../lib/device';
import './TrophyShooter.css';

const COUNT = 10;
const HIT_RADIUS = 28;
const ROCKET_SCALE = 1.4;

const readColors = () => {
  const cs = getComputedStyle(document.documentElement);
  const v = (n, fb) => cs.getPropertyValue(n).trim() || fb;
  return {
    fg: v('--fg', '#cdeedc'),
    accent: v('--accent', '#00ff9d'),
    accent2: v('--accent-2', '#00d4ff'),
    panel: v('--panel', '#08110d'),
    light: document.documentElement.dataset.mode === 'light',
  };
};

/** Point at arc-length `s` along a rounded rectangle, travelling clockwise. */
function pathPoint(s, x0, y0, w, h, R) {
  const sw = Math.max(0, w - 2 * R);
  const sh = Math.max(0, h - 2 * R);
  const arc = (Math.PI * R) / 2;
  const L = 2 * sw + 2 * sh + 4 * arc;
  let d = ((s % L) + L) % L;
  const corner = (cx, cy, start) => {
    const th = start + d / R;
    return { x: cx + R * Math.cos(th), y: cy + R * Math.sin(th), a: th + Math.PI / 2 };
  };
  if (d < sw) return { x: x0 + R + d, y: y0, a: 0 };
  d -= sw;
  if (d < arc) return corner(x0 + w - R, y0 + R, -Math.PI / 2);
  d -= arc;
  if (d < sh) return { x: x0 + w, y: y0 + R + d, a: Math.PI / 2 };
  d -= sh;
  if (d < arc) return corner(x0 + w - R, y0 + h - R, 0);
  d -= arc;
  if (d < sw) return { x: x0 + w - R - d, y: y0 + h, a: Math.PI };
  d -= sw;
  if (d < arc) return corner(x0 + R, y0 + h - R, Math.PI / 2);
  d -= arc;
  if (d < sh) return { x: x0, y: y0 + h - R - d, a: -Math.PI / 2 };
  d -= sh;
  return corner(x0 + R, y0 + R, Math.PI);
}

function makeRockets(reduced) {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    quote: lossQuotes[i % lossQuotes.length],
    s: (i / COUNT) * 2300 + Math.random() * 60, // ≈ even spread round a typical case
    dir: i % 3 === 0 ? -1 : 1,
    speed: reduced ? 0 : 55 + Math.random() * 45,
    lane: i % 4,
    wobble: Math.random() * Math.PI * 2,
    alive: true,
    x: -100,
    y: -100,
    a: 0,
    trail: [],
  }));
}

export default function TrophyShooter({ children }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const [hits, setHits] = useState(0);
  const [quote, setQuote] = useState(null); // { text, n }
  const [typed, setTyped] = useState('');
  const sim = useRef(null);

  if (!sim.current) {
    const reduced = prefersReducedMotion();
    sim.current = {
      reduced,
      rockets: makeRockets(reduced),
      particles: [],
      lasers: [],
      floaters: [],
      pointer: { x: 0, y: 0, inside: false },
      aim: -Math.PI / 2,
      box: { w: 0, h: 0, wx: 0, wy: 0, ww: 0, wh: 0 },
      colors: null,
      visible: false,
      kills: 0,
      dirty: true,
    };
  }

  // Typewriter for the latest lesson.
  useEffect(() => {
    if (!quote) return undefined;
    if (sim.current.reduced) {
      setTyped(quote.text);
      return undefined;
    }
    let i = 0;
    setTyped('');
    const id = setInterval(() => {
      i += 2;
      setTyped(quote.text.slice(0, i));
      if (i >= quote.text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [quote]);

  const turret = () => {
    const { w, h } = sim.current.box;
    return { x: w / 2, y: h - 22 };
  };

  const fireAt = useCallback((x, y, forced) => {
    const S = sim.current;
    const t = turret();
    S.aim = Math.atan2(y - t.y, x - t.x);
    const mx = t.x + Math.cos(S.aim) * 24;
    const my = t.y + Math.sin(S.aim) * 24;
    S.lasers.push({ x1: mx, y1: my, x2: x, y2: y, life: 0.14 });
    S.dirty = true;

    let target = forced || null;
    if (!target) {
      let best = HIT_RADIUS;
      S.rockets.forEach((r) => {
        if (!r.alive) return;
        const dd = Math.hypot(r.x - x, r.y - y);
        if (dd < best) {
          best = dd;
          target = r;
        }
      });
    }
    if (!target) {
      for (let k = 0; k < 6; k++) {
        S.particles.push({ x, y, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120, life: 0.25, c: 'fg' });
      }
      return;
    }

    target.alive = false;
    S.kills += 1;
    const n = S.kills;
    for (let k = 0; k < 26; k++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 220;
      S.particles.push({
        x: target.x,
        y: target.y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: 0.5 + Math.random() * 0.4,
        c: k % 3 ? 'accent' : 'accent2',
      });
    }
    S.particles.push({ x: target.x, y: target.y, ring: true, r: 4, life: 0.4, c: 'accent' });
    S.floaters.push({ x: target.x, y: target.y - 10, text: `LESSON ${String(n).padStart(2, '0')}`, life: 1.1 });
    setHits(n);
    setQuote({ text: target.quote, n });
    if (n === COUNT) {
      unlock('losses');
      emit('scene:glitch', 0.5);
    }
  }, []);

  const fireNearest = () => {
    const S = sim.current;
    const alive = S.rockets.filter((r) => r.alive);
    if (!alive.length) return;
    const t = turret();
    alive.sort((a, b) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(b.x - t.x, b.y - t.y));
    fireAt(alive[0].x, alive[0].y, alive[0]);
  };

  const relaunch = () => {
    const S = sim.current;
    S.rockets = makeRockets(S.reduced);
    S.kills = 0;
    S.dirty = true;
    setHits(0);
    setQuote(null);
    setTyped('');
  };

  // Canvas sizing, visibility, theme.
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const S = sim.current;
    S.colors = readColors();
    const measure = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const win = stage.querySelector('.trophies');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      S.box = { w, h, wx: win.offsetLeft, wy: win.offsetTop, ww: win.offsetWidth, wh: win.offsetHeight };
      S.dirty = true;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    const io = new IntersectionObserver(([e]) => {
      S.visible = e.isIntersecting;
      S.dirty = true;
    });
    io.observe(stage);
    let theme = getState().theme;
    const unsub = subscribe(() => {
      if (getState().theme !== theme) {
        theme = getState().theme;
        S.colors = readColors();
        S.dirty = true;
      }
    });
    return () => {
      ro.disconnect();
      io.disconnect();
      unsub();
    };
  }, []);

  // Simulation + render loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const S = sim.current;
    let raf;
    let last = performance.now();

    const lanes = (lane) => 14 + lane * 9;

    const update = (dt, t) => {
      const { wx, wy, ww, wh } = S.box;
      S.rockets.forEach((r) => {
        if (!r.alive) return;
        const m = lanes(r.lane);
        r.s += r.speed * r.dir * dt;
        const p = pathPoint(r.s, wx - m, wy - m, ww + 2 * m, wh + 2 * m, 18 + m * 0.6);
        // Swirl: drift in and out of the lane.
        const off = S.reduced ? 0 : Math.sin(t * 1.6 + r.wobble) * 6;
        r.x = p.x - Math.sin(p.a) * off;
        r.y = p.y + Math.cos(p.a) * off;
        r.a = r.dir > 0 ? p.a : p.a + Math.PI;
        if (!S.reduced) {
          r.trail.push(r.x, r.y);
          if (r.trail.length > 24) r.trail.splice(0, 2);
        }
      });
      S.particles.forEach((p) => {
        p.life -= dt;
        if (p.ring) p.r += dt * 120;
        else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.96;
          p.vy *= 0.96;
        }
      });
      S.particles = S.particles.filter((p) => p.life > 0);
      S.lasers.forEach((l) => (l.life -= dt));
      S.lasers = S.lasers.filter((l) => l.life > 0);
      S.floaters.forEach((f) => {
        f.life -= dt;
        f.y -= dt * 26;
      });
      S.floaters = S.floaters.filter((f) => f.life > 0);
      // Turret follows the pointer.
      if (S.pointer.inside) {
        const tt = turret();
        const want = Math.atan2(S.pointer.y - tt.y, S.pointer.x - tt.x);
        S.aim += (want - S.aim) * Math.min(1, dt * 14);
      }
    };

    const drawRocket = (r, c, t) => {
      // Exhaust trail
      for (let k = 0; k < r.trail.length; k += 2) {
        const alpha = (k / r.trail.length) * 0.5;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = c.accent2;
        ctx.fillRect(r.trail[k] - 1, r.trail[k + 1] - 1, 2, 2);
      }
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.a);
      ctx.scale(ROCKET_SCALE, ROCKET_SCALE);
      // flame
      const fl = 6 + Math.abs(Math.sin(t * 30 + r.id)) * 6;
      ctx.fillStyle = c.light ? '#ffffff' : '#ffb000';
      ctx.beginPath();
      ctx.moveTo(-9, -3);
      ctx.lineTo(-9 - fl, 0);
      ctx.lineTo(-9, 3);
      ctx.fill();
      // fins
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.moveTo(-9, -3);
      ctx.lineTo(-12, -7);
      ctx.lineTo(-5, -3);
      ctx.moveTo(-9, 3);
      ctx.lineTo(-12, 7);
      ctx.lineTo(-5, 3);
      ctx.fill();
      // body + nose
      ctx.fillStyle = c.fg;
      ctx.fillRect(-9, -3.5, 14, 7);
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.moveTo(5, -3.5);
      ctx.lineTo(11, 0);
      ctx.lineTo(5, 3.5);
      ctx.fill();
      // porthole
      ctx.fillStyle = c.light ? c.fg : '#021009';
      ctx.fillRect(-2, -1.5, 3, 3);
      ctx.restore();
    };

    const draw = (t) => {
      const { w, h } = S.box;
      const c = S.colors || readColors();
      ctx.clearRect(0, 0, w, h);

      S.rockets.forEach((r) => r.alive && drawRocket(r, c, t));

      // Particles
      S.particles.forEach((p) => {
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2));
        if (p.ring) {
          ctx.strokeStyle = c[p.c];
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = c[p.c] || c.fg;
          ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        }
      });
      ctx.globalAlpha = 1;

      // Lasers
      S.lasers.forEach((l) => {
        ctx.globalAlpha = Math.min(1, l.life / 0.14);
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 3;
        ctx.shadowColor = c.accent;
        ctx.shadowBlur = c.light ? 0 : 12;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // Floating "LESSON 03" labels
      ctx.font = '18px VT323, monospace';
      ctx.textAlign = 'center';
      S.floaters.forEach((f) => {
        ctx.globalAlpha = Math.min(1, f.life);
        ctx.fillStyle = c.accent;
        ctx.fillText(f.text, f.x, f.y);
      });
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';

      // Turret
      const tt = turret();
      ctx.save();
      ctx.translate(tt.x, tt.y);
      ctx.fillStyle = c.panel;
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-26, 16);
      ctx.lineTo(-18, 0);
      ctx.lineTo(18, 0);
      ctx.lineTo(26, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 11, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.rotate(S.aim);
      ctx.fillStyle = c.accent;
      ctx.fillRect(4, -3, 22, 6);
      ctx.fillStyle = c.fg;
      ctx.fillRect(22, -4, 5, 8);
      ctx.restore();

      // Reticle
      if (S.pointer.inside) {
        const { x, y } = S.pointer;
        const pulse = 9 + Math.sin(t * 8) * 1.5;
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.moveTo(x - 16, y);
        ctx.lineTo(x - 5, y);
        ctx.moveTo(x + 5, y);
        ctx.lineTo(x + 16, y);
        ctx.moveTo(x, y - 16);
        ctx.lineTo(x, y - 5);
        ctx.moveTo(x, y + 5);
        ctx.lineTo(x, y + 16);
        ctx.stroke();
        ctx.fillStyle = c.accent;
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!S.visible) return;
      const busy = S.particles.length || S.lasers.length || S.floaters.length;
      if (S.reduced && !busy && !S.dirty && !S.pointer.inside) return;
      S.dirty = false;
      update(dt, now / 1000);
      draw(now / 1000);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const local = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const p = local(e);
    Object.assign(sim.current.pointer, p, { inside: true });
  };
  const onLeave = () => {
    sim.current.pointer.inside = false;
    sim.current.dirty = true;
  };
  const onDown = (e) => {
    if (e.button !== 0 || sim.current.kills >= COUNT) return;
    const p = local(e);
    fireAt(p.x, p.y);
  };

  const done = hits >= COUNT;

  return (
    <div className="tshoot" data-reveal="pop">
      <div className="tshoot__hud">
        <span className="tag">LOSS_SHOOTER.exe</span>
        <span className="tshoot__hint">10 rockets = 10 lost hackathons. Shoot one down, get its lesson.</span>
        <span className="tshoot__count pixel">
          {hits}/{COUNT}
        </span>
      </div>

      <div ref={stageRef} className="tshoot__stage">
        {children}
        <canvas
          ref={canvasRef}
          className="tshoot__fx"
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          onPointerDown={onDown}
          aria-label="Shooter: click the rockets orbiting the trophy case"
          role="img"
        />
      </div>

      <div className="win tshoot__log" aria-live="polite">
        <div className="win__bar">
          <span className="win__title">LESSONS.log</span>
          <span className="tshoot__pips" aria-hidden="true">
            {Array.from({ length: COUNT }, (_, i) => (
              <i key={i} className={i < hits ? 'is-on' : ''} />
            ))}
          </span>
        </div>
        <div className="win__body">
          {done ? (
            <>
              <p className="tshoot__quote">
                <span className="accent">10/10.</span> Every loss shot down and turned into a lesson — that’s how this
                trophy case got built.
              </p>
              <button className="btn btn--solid tshoot__btn" onClick={relaunch}>
                Relaunch ↻
              </button>
            </>
          ) : quote ? (
            <p className="tshoot__quote">
              <span className="tshoot__n">#{String(quote.n).padStart(2, '0')}</span> “{typed}
              {typed.length >= quote.text.length ? '”' : <span className="caret" />}
            </p>
          ) : (
            <p className="tshoot__quote dim">
              Aim at a rocket circling the case and click to fire. Each one carries a lesson a loss taught me.
            </p>
          )}
          {!done && (
            <button className="tshoot__auto" onClick={fireNearest}>
              ⌖ can’t aim? auto-fire
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
