import { useEffect, useRef, useState } from 'react';
import { unlock } from '../../lib/secrets';
import { subscribe, getState } from '../../lib/store';
import { prefersReducedMotion } from '../../lib/device';
import './Life.css';

const COLS = 30;
const ROWS = 24;
const GLIDER = [
  [1, 0],
  [2, 1],
  [0, 2],
  [1, 2],
  [2, 2],
];

const empty = () => new Uint8Array(COLS * ROWS);
const idx = (x, y) => ((y + ROWS) % ROWS) * COLS + ((x + COLS) % COLS);

function seed() {
  const g = empty();
  [
    [2, 2],
    [12, 4],
    [22, 9],
    [6, 14],
    [18, 17],
  ].forEach(([ox, oy]) => GLIDER.forEach(([x, y]) => (g[idx(ox + x, oy + y)] = 1)));
  return g;
}

function step(g) {
  const next = empty();
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += g[idx(x + dx, y + dy)];
      const alive = g[idx(x, y)];
      next[idx(x, y)] = n === 3 || (alive && n === 2) ? 1 : 0;
    }
  }
  return next;
}

export default function Life() {
  const canvasRef = useRef(null);
  const grid = useRef(seed());
  const [running, setRunning] = useState(!prefersReducedMotion());
  const [gen, setGen] = useState(0);
  const view = useRef({ cell: 7, visible: true, colors: null });
  const paint = useRef(null);

  const colors = () => {
    const cs = getComputedStyle(document.documentElement);
    return {
      bg: cs.getPropertyValue('--panel').trim() || '#08110d',
      on: cs.getPropertyValue('--accent').trim() || '#00ff9d',
      dot: `rgba(${cs.getPropertyValue('--fg-rgb').trim() || '205,238,220'}, 0.28)`,
    };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { cell } = view.current;
    const c = view.current.colors || (view.current.colors = colors());
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const g = grid.current;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (g[idx(x, y)]) {
          ctx.fillStyle = c.on;
          ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
        } else {
          ctx.fillStyle = c.dot;
          ctx.fillRect(x * cell + (cell >> 1), y * cell + (cell >> 1), 1, 1);
        }
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ro = new ResizeObserver(([entry]) => {
      const cell = Math.max(4, Math.floor(entry.contentRect.width / COLS));
      view.current.cell = cell;
      canvas.width = cell * COLS;
      canvas.height = cell * ROWS;
      draw();
    });
    ro.observe(canvas.parentElement);
    const io = new IntersectionObserver(([e]) => {
      view.current.visible = e.isIntersecting;
    });
    io.observe(canvas);
    let theme = getState().theme;
    const unsub = subscribe(() => {
      if (getState().theme !== theme) {
        theme = getState().theme;
        view.current.colors = colors();
        draw();
      }
    });
    return () => {
      ro.disconnect();
      io.disconnect();
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      if (!view.current.visible) return;
      grid.current = step(grid.current);
      setGen((n) => n + 1);
      draw();
    }, 110);
    return () => clearInterval(id);
  }, [running]);

  const cellAt = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / rect.width;
    const { cell } = view.current;
    return [Math.floor(((e.clientX - rect.left) * scale) / cell), Math.floor(((e.clientY - rect.top) * scale) / cell)];
  };

  const onDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = cellAt(e);
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
    const value = grid.current[idx(x, y)] ? 0 : 1;
    paint.current = value;
    grid.current[idx(x, y)] = value;
    unlock('life');
    draw();
  };
  const onMove = (e) => {
    if (paint.current === null) return;
    const [x, y] = cellAt(e);
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
    grid.current[idx(x, y)] = paint.current;
    draw();
  };
  const onUp = () => {
    paint.current = null;
  };

  const act = (fn) => () => {
    unlock('life');
    fn();
    draw();
  };

  return (
    <div className="life">
      <div className="life__board">
        <canvas
          ref={canvasRef}
          className="life__canvas"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-label="Conway's Game of Life board. Click cells to toggle them."
        />
      </div>
      <div className="life__bar">
        <button onClick={act(() => setRunning((r) => !r))} aria-label={running ? 'Pause' : 'Play'}>
          {running ? '❚❚' : '▶'}
        </button>
        <button
          onClick={act(() => {
            grid.current = step(grid.current);
            setGen((n) => n + 1);
          })}
        >
          step
        </button>
        <button
          onClick={act(() => {
            const g = empty();
            for (let i = 0; i < g.length; i++) g[i] = Math.random() < 0.22 ? 1 : 0;
            grid.current = g;
            setGen(0);
          })}
        >
          rand
        </button>
        <button
          onClick={act(() => {
            const ox = (Math.random() * COLS) | 0;
            const oy = (Math.random() * ROWS) | 0;
            GLIDER.forEach(([x, y]) => (grid.current[idx(ox + x, oy + y)] = 1));
          })}
        >
          +glider
        </button>
        <button
          onClick={act(() => {
            grid.current = empty();
            setGen(0);
          })}
        >
          clear
        </button>
        <span className="life__gen">gen {gen}</span>
      </div>
    </div>
  );
}
