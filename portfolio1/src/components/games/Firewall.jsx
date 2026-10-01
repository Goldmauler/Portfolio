import { useEffect, useRef, useState } from 'react';
import { unlock } from '../../lib/secrets';
import { emit, subscribe, getState } from '../../lib/store';
import './Firewall.css';

const WORDS = [
  'ping', 'sudo', 'grep', 'ssh', 'root', 'kernel', 'daemon', 'proxy', 'packet', 'socket', 'cipher', 'buffer',
  'stack', 'heap', 'cache', 'token', 'lambda', 'docker', 'react', 'tensor', 'vector', 'neural', 'async', 'await',
  'mutex', 'thread', 'commit', 'merge', 'rebase', 'deploy', 'crdt', 'webrtc', 'bedrock', 'tflite', 'arduino',
  'sensor', 'python', 'binary', 'hash', 'salt', 'nonce', 'exploit', 'patch', 'router', 'subnet', 'botnet',
  'malware', 'trojan', 'phish', 'worm', 'overflow', 'segfault', 'null', 'regex', 'json', 'yaml', 'kube', 'shell',
  'chmod', 'curl', 'nmap', 'payload', 'firmware', 'gradient', 'epoch', 'inference', 'quantize',
];

const HS_KEY = 'vh-firewall-hs';
const CORE_W = 26;

const readColors = () => {
  const cs = getComputedStyle(document.documentElement);
  const v = (n, fb) => cs.getPropertyValue(n).trim() || fb;
  return {
    bg: v('--panel', '#08110d'),
    fg: v('--fg', '#cdeedc'),
    accent: v('--accent', '#00ff9d'),
    accent2: v('--accent-2', '#00d4ff'),
    onAccent: v('--on-accent', '#021009'),
    danger: '#ff2a6d',
    dim: `rgba(${v('--fg-rgb', '205,238,220')}, 0.35)`,
  };
};

const readHigh = () => {
  try {
    return parseInt(localStorage.getItem(HS_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
};

export default function Firewall({ active }) {
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const [ui, setUi] = useState({ phase: 'idle', score: 0, high: readHigh(), level: 1, hp: 100 });
  const g = useRef(null);

  // Game state lives in a ref; React only renders the HUD overlays.
  if (!g.current) {
    g.current = {
      phase: 'idle',
      packets: [],
      particles: [],
      typed: '',
      score: 0,
      kills: 0,
      level: 1,
      hp: 100,
      combo: 0,
      spawnIn: 0,
      shake: 0,
      flash: 0,
      visible: true,
      needsDraw: true,
      colors: null,
      w: 600,
      h: 340,
    };
  }

  const sync = () => {
    const s = g.current;
    setUi((u) => ({ ...u, phase: s.phase, score: s.score, level: s.level, hp: s.hp }));
  };

  const start = () => {
    const s = g.current;
    Object.assign(s, { phase: 'play', packets: [], particles: [], typed: '', score: 0, kills: 0, level: 1, hp: 100, combo: 0, spawnIn: 0.4 });
    sync();
    inputRef.current?.focus({ preventScroll: true });
  };

  const gameOver = () => {
    const s = g.current;
    s.phase = 'over';
    s.needsDraw = true;
    const high = Math.max(readHigh(), s.score);
    try {
      localStorage.setItem(HS_KEY, String(high));
    } catch {
      /* storage unavailable */
    }
    emit('scene:glitch', 0.5);
    setUi((u) => ({ ...u, phase: 'over', score: s.score, high }));
  };

  // Typing.
  const handleChar = (ch) => {
    const s = g.current;
    if (s.phase !== 'play') return;
    const next = s.typed + ch.toLowerCase();
    if (s.packets.some((p) => p.word.startsWith(next))) {
      s.typed = next;
      const hit = s.packets.find((p) => p.word === next);
      if (hit) {
        hit.dead = true;
        s.kills += 1;
        s.combo += 1;
        s.score += hit.word.length * 10 * Math.min(5, 1 + Math.floor(s.combo / 5));
        if (s.kills % 8 === 0) s.level += 1;
        for (let i = 0; i < 14; i++) {
          s.particles.push({ x: hit.x, y: hit.y, vx: (Math.random() - 0.5) * 260, vy: (Math.random() - 0.5) * 200, life: 0.5 + Math.random() * 0.3 });
        }
        s.typed = '';
        if (s.score >= 300) unlock('firewall');
        sync();
      }
    } else {
      s.combo = 0;
      s.shake = 0.12;
    }
  };

  const onKeyDown = (e) => {
    const s = g.current;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (s.phase !== 'play') start();
      return;
    }
    if (s.phase !== 'play') return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      s.typed = s.typed.slice(0, -1);
    } else if (e.key === 'Escape') {
      s.typed = '';
    } else if (e.key.length === 1 && /[a-z0-9-]/i.test(e.key)) {
      e.preventDefault();
      handleChar(e.key);
    }
  };

  // Mobile keyboards fire input events instead of reliable keydowns.
  const onInput = (e) => {
    const v = e.target.value;
    for (const ch of v) if (/[a-z0-9-]/i.test(ch)) handleChar(ch);
    e.target.value = '';
  };

  // Resize canvas to its box at device resolution.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      g.current.w = width;
      g.current.h = height;
      g.current.needsDraw = true;
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      g.current.visible = e.isIntersecting;
    });
    io.observe(canvas);
    g.current.colors = readColors();
    let theme = getState().theme;
    const unsub = subscribe(() => {
      if (getState().theme !== theme) {
        theme = getState().theme;
        g.current.colors = readColors();
        g.current.needsDraw = true;
      }
    });
    return () => {
      ro.disconnect();
      io.disconnect();
      unsub();
    };
  }, []);

  // Main loop.
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let raf;
    let last = performance.now();

    const update = (dt) => {
      const s = g.current;
      if (s.phase !== 'play') return;
      const speed = 38 + s.level * 9;
      s.spawnIn -= dt;
      if (s.spawnIn <= 0) {
        const pool = WORDS.filter((w) => w.length <= 3 + s.level * 2 && !s.packets.some((p) => p.word[0] === w[0]));
        const word = pool[(Math.random() * pool.length) | 0] || WORDS[(Math.random() * WORDS.length) | 0];
        const lanes = Math.max(3, Math.floor((s.h - 40) / 34));
        s.packets.push({ word, x: s.w + 10, y: 30 + ((Math.random() * lanes) | 0) * ((s.h - 50) / lanes), v: speed * (0.8 + Math.random() * 0.4) });
        s.spawnIn = Math.max(0.65, 2.3 - s.level * 0.18) * (0.75 + Math.random() * 0.5);
      }
      s.packets.forEach((p) => {
        p.x -= p.v * dt;
        if (p.x < CORE_W + 6 && !p.dead) {
          p.dead = true;
          p.breached = true;
          s.hp -= 20;
          s.combo = 0;
          s.shake = 0.3;
          s.flash = 0.25;
          if (s.typed && p.word.startsWith(s.typed)) s.typed = '';
          if (s.hp <= 0) gameOver();
          else setUi((u) => ({ ...u, hp: s.hp }));
        }
      });
      s.packets = s.packets.filter((p) => !p.dead);
      // Drop the typed prefix if its target vanished.
      if (s.typed && !s.packets.some((p) => p.word.startsWith(s.typed))) s.typed = '';
      s.particles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
      });
      s.particles = s.particles.filter((p) => p.life > 0);
      s.shake = Math.max(0, s.shake - dt);
      s.flash = Math.max(0, s.flash - dt);
    };

    const draw = (t) => {
      const s = g.current;
      const c = s.colors || readColors();
      const { w, h } = s;
      ctx.save();
      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, w, h);
      if (s.shake > 0) ctx.translate((Math.random() - 0.5) * 8 * s.shake * 10, (Math.random() - 0.5) * 4);

      // Dot grid
      ctx.fillStyle = c.dim;
      for (let x = 40; x < w; x += 16) for (let y = 8; y < h; y += 16) ctx.fillRect(x, y, 1, 1);

      // Core
      ctx.fillStyle = s.flash > 0 ? c.danger : c.accent;
      ctx.fillRect(0, 0, CORE_W, h);
      ctx.fillStyle = c.onAccent;
      ctx.font = '18px VT323, monospace';
      ctx.save();
      ctx.translate(18, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(`CORE ${Math.max(0, s.hp)}%`, 0, 0);
      ctx.restore();

      // Packets
      ctx.font = '20px VT323, monospace';
      ctx.textBaseline = 'middle';
      s.packets.forEach((p) => {
        const tw = ctx.measureText(p.word).width;
        const target = s.typed && p.word.startsWith(s.typed);
        ctx.fillStyle = target ? c.accent : c.dim;
        ctx.fillRect(p.x - 6, p.y - 12, tw + 12, 24);
        ctx.fillStyle = c.bg;
        ctx.fillRect(p.x - 5, p.y - 11, tw + 10, 22);
        ctx.fillStyle = c.fg;
        ctx.fillText(p.word, p.x, p.y + 1);
        if (target) {
          ctx.fillStyle = c.accent;
          ctx.fillText(s.typed, p.x, p.y + 1);
        }
        // Tail
        ctx.fillStyle = c.dim;
        ctx.fillRect(p.x + tw + 8, p.y - 1, 18, 2);
      });

      // Particles
      ctx.fillStyle = c.accent;
      s.particles.forEach((p) => ctx.fillRect(p.x, p.y, 3, 3));

      // Prompt line
      if (s.phase === 'play') {
        ctx.fillStyle = c.fg;
        ctx.font = '20px VT323, monospace';
        ctx.textBaseline = 'alphabetic';
        const blink = Math.floor(t / 400) % 2 === 0 ? '_' : ' ';
        ctx.fillText(`> ${s.typed}${blink}`, CORE_W + 12, h - 10);
      }
      ctx.restore();
    };

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const s = g.current;
      if (!s.visible) return;
      // Idle/game-over screens are static: draw once, then rest.
      if (s.phase !== 'play' && !s.particles.length && !s.needsDraw) return;
      s.needsDraw = false;
      update(dt);
      draw(t);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keyboard goes to the game while its window is the active one.
  useEffect(() => {
    if (active) inputRef.current?.focus({ preventScroll: true });
    else inputRef.current?.blur();
  }, [active]);

  return (
    <div className="fw" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      <div className="fw__hud">
        <span>
          SCORE <b>{ui.score}</b>
        </span>
        <span>
          LVL <b>{ui.level}</b>
        </span>
        <span>
          HI <b>{Math.max(ui.high, ui.score)}</b>
        </span>
      </div>
      <canvas ref={canvasRef} className="fw__canvas" />
      <input
        ref={inputRef}
        className="fw__input"
        onKeyDown={onKeyDown}
        onInput={onInput}
        aria-label="Type the packet words"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
      />
      {ui.phase !== 'play' && (
        <div className="fw__overlay">
          {ui.phase === 'idle' ? (
            <>
              <p className="pixel fw__title">FIREWALL.exe</p>
              <p>Malicious packets are inbound. Type each packet’s word before it reaches your core.</p>
              <ul className="fw__rules">
                <li>
                  <b>Type</b> a word to destroy its packet — the target lights up as you type
                </li>
                <li>
                  <b>Backspace</b> fixes a letter · <b>Esc</b> clears the line
                </li>
                <li>
                  Each hit on the core costs <b>20%</b> · combos multiply your score
                </li>
              </ul>
              <p className="dim">Score 300+ to unlock a secret.</p>
            </>
          ) : (
            <>
              <p className="pixel fw__title danger">SYSTEM BREACHED</p>
              <p>
                Score <b className="accent">{ui.score}</b> · Best <b>{ui.high}</b>
              </p>
            </>
          )}
          <button
            className="btn btn--solid"
            onClick={(e) => {
              e.stopPropagation();
              start();
            }}
          >
            {ui.phase === 'idle' ? 'Start [Enter]' : 'Retry [Enter]'}
          </button>
        </div>
      )}
    </div>
  );
}
