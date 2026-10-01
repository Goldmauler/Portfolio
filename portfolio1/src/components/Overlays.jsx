import { useEffect, useRef, useState } from 'react';
import { on, useStore, robotAnchor, setState, robotDo, toast, emit, getState } from '../lib/store';
import { setTheme } from '../lib/themes';
import { unlock } from '../lib/secrets';
import { prefersReducedMotion } from '../lib/device';
import './Overlays.css';

/* ------------------------------------------------------------------------ */

function Toasts() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let id = 0;
    return on('toast', ({ message, kind }) => {
      const key = ++id;
      setItems((list) => [...list.slice(-2), { key, message, kind }]);
      setTimeout(() => setItems((list) => list.filter((t) => t.key !== key)), 3800);
    });
  }, []);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.key} className={`toast win toast--${t.kind}`}>
          <div className="win__bar">
            <span className="win__title">{t.kind === 'secret' ? 'Secret.sys' : 'SYS.MSG'}</span>
          </div>
          <div className="win__body">{t.message}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------ */

function RobotBubble() {
  const [msg, setMsg] = useState(null);
  const [typed, setTyped] = useState('');
  const ref = useRef(null);

  useEffect(
    () =>
      on('robot:say', ({ text, ms }) => {
        setMsg({ text, ms, id: Math.random() });
      }),
    [],
  );

  // Typewriter + auto-hide.
  useEffect(() => {
    if (!msg) return undefined;
    let i = 0;
    setTyped('');
    const typer = setInterval(() => {
      i += 2;
      setTyped(msg.text.slice(0, i));
      if (i >= msg.text.length) clearInterval(typer);
    }, 22);
    const hide = setTimeout(() => setMsg(null), msg.ms);
    return () => {
      clearInterval(typer);
      clearTimeout(hide);
    };
  }, [msg]);

  // Follow the robot's head on screen.
  useEffect(() => {
    if (!msg) return undefined;
    let raf;
    const loop = () => {
      const el = ref.current;
      if (el) {
        const w = el.offsetWidth;
        const flip = !!getState().gauntlet || robotAnchor.x + w + 24 > window.innerWidth;
        const x = flip ? robotAnchor.x - w - 12 : robotAnchor.x + 12;
        const y = Math.max(46, robotAnchor.y - el.offsetHeight);
        el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
        el.style.opacity = robotAnchor.visible ? '1' : '0';
        el.classList.toggle('is-flipped', flip);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [msg]);

  if (!msg) return null;
  return (
    <div ref={ref} className="bubble win" aria-live="polite" data-no-robot>
      <div className="win__bar">
        <span className="win__title">VH-01 says</span>
      </div>
      <div className="win__body">
        {typed}
        <span className="caret" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/{}[]$#';

function MatrixRain() {
  const enabled = useStore((s) => s.matrix);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 16;
    let cols = [];
    let raf;
    let last = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Array.from({ length: Math.ceil(canvas.width / size) }, () => Math.random() * -50);
    };
    resize();
    window.addEventListener('resize', resize);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00ff9d';
    const draw = (t) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 45) return;
      last = t;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${size}px "JetBrains Mono", monospace`;
      cols.forEach((y, i) => {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        ctx.fillStyle = Math.random() > 0.975 ? '#ffffff' : accent;
        ctx.fillText(ch, i * size, y * size);
        cols[i] = y * size > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} className="matrix" aria-hidden="true" />;
}

/* ------------------------------------------------------------------------ */

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function activateGodMode() {
  setState({ godMode: true, matrix: true });
  setTheme('redteam');
  emit('scene:glitch', 1.6);
  robotDo('glitch');
  toast('GOD MODE ENABLED. Type `godmode off` in the shell to restore.', 'secret');
  unlock('konami');
}

function useKonami() {
  useEffect(() => {
    let i = 0;
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = key === KONAMI[i] ? i + 1 : key === KONAMI[0] ? 1 : 0;
      if (i === KONAMI.length) {
        i = 0;
        if (!getState().godMode) activateGodMode();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/* ------------------------------------------------------------------------ */

export default function Overlays() {
  const crt = useStore((s) => s.crt);
  useKonami();
  return (
    <>
      <MatrixRain />
      <RobotBubble />
      <Toasts />
      {crt && <div className="crt" aria-hidden="true" />}
      {!prefersReducedMotion() && <div className="grain" aria-hidden="true" />}
    </>
  );
}
