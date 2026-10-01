import { useEffect, useRef, useState } from 'react';
import { SECRETS, useUnlocked, resetSecrets } from '../../lib/secrets';

const STEPS = [
  ['Open an app', 'Double-click a desktop icon (tap on phones) — or click it in the taskbar at the bottom.'],
  ['Move windows', 'Drag the green title bar. Click a window to bring it front. × closes it, ? shows its rules.'],
  ['Terminal', 'Click inside and type help. Try neofetch, hack mainframe or sudo hire-vimal.'],
  ['KnowVimal.exe', '10 quick questions about Vimal, 20s each. Press 1–4 to answer — every answer is somewhere on this site.'],
  ['Firewall.exe', 'Press Start, then type the word on each packet before it hits your core. Backspace fixes, Esc clears.'],
  ['Glider', 'Click cells to draw life, ▶ to run it, +glider to spawn one.'],
];

/** HOW_TO_PLAY.txt — opens automatically the first time the cursor enters the desk. */
export function Readme({ api }) {
  return (
    <div className="guide">
      <p className="pixel guide__h">WELCOME TO VH.OS — HOW TO PLAY</p>
      <ol className="guide__steps">
        {STEPS.map(([k, v], i) => (
          <li key={k}>
            <span className="guide__n">{i + 1}</span>
            <span>
              <b>{k}</b> — {v}
            </span>
          </li>
        ))}
      </ol>
      <p className="guide__secret">
        <span className="accent">★</span> {SECRETS.length} secrets are hidden across the site. The ★ counter in the menu
        bar tracks them.
      </p>
      {api && (
        <div className="guide__actions">
          <button className="btn btn--solid" onClick={() => api.open('quiz')}>
            ▶ Play Know Vimal
          </button>
          <button className="btn" onClick={() => api.open('firewall')}>
            ▶ Play Firewall
          </button>
          <button className="btn btn--quiet" onClick={() => api.focus('terminal')}>
            Use terminal
          </button>
        </div>
      )}
    </div>
  );
}

export const HELP = {
  terminal: [
    'Click inside the window and type a command, then press Enter.',
    'help lists everything. Tab autocompletes, ↑/↓ recall history.',
    'Fun ones: neofetch · hack mainframe · sudo hire-vimal · matrix · theme paper · robot dance',
    'open quiz / open firewall launch the games.',
  ],
  quiz: [
    '10 random questions about Vimal, drawn from everything on this site.',
    'Click an answer or press 1–4. You have 20 seconds per question.',
    'Faster answers score more, and streaks add a bonus.',
    'After each answer you get the real story — plus a link to where it lives on the site.',
    'Score 8+/10 to unlock the Inner Circle secret.',
  ],
  firewall: [
    'Press Start (or Enter). Packets carrying words fly toward your core on the left.',
    'Type a packet’s word to destroy it — the matching packet lights up as you type.',
    'Backspace fixes a letter, Esc clears the line. Combos multiply your score.',
    'Each packet that reaches the core costs 20% integrity. Score 300+ for a secret.',
  ],
  life: [
    'Conway’s Game of Life: cells live or die based on their neighbours.',
    'Click or drag on the board to draw cells. ❚❚ / ▶ pauses and runs.',
    'step advances one generation, rand fills the board, +glider spawns a glider.',
  ],
};

export function ClockApp() {
  const ref = useRef(null);
  const upRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    const tfmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tick = () => {
      const now = new Date();
      if (ref.current) ref.current.textContent = `${fmt.format(now)}\n${tfmt.format(now)}`;
      const s = Math.floor((performance.now() - start) / 1000);
      if (upRef.current)
        upRef.current.textContent = `uptime ${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="clock-app pixel">
      <div ref={ref} className="clock-app__now" />
      <div ref={upRef} className="clock-app__up" />
    </div>
  );
}

export function Secrets() {
  const unlocked = useUnlocked();
  const pct = Math.round((unlocked.length / SECRETS.length) * 100);
  return (
    <div className="secrets">
      <div className="secrets__head">
        <span className="pixel secrets__count">
          {unlocked.length}/{SECRETS.length}
        </span>
        <span className="secrets__bar">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </span>
      </div>
      <ul className="secrets__list" data-lenis-prevent>
        {SECRETS.map((s) => {
          const got = unlocked.includes(s.id);
          return (
            <li key={s.id} className={got ? 'is-got' : ''}>
              <span className="secrets__mark">{got ? '★' : '·'}</span>
              <span>
                <b>{got ? s.name : '???'}</b>
                <span className="secrets__hint">{s.hint}</span>
              </span>
            </li>
          );
        })}
      </ul>
      {unlocked.length > 0 && (
        <button className="secrets__reset" onClick={resetSecrets}>
          reset progress
        </button>
      )}
    </div>
  );
}

export function Trash() {
  const [msg, setMsg] = useState('Trash is empty. Vimal doesn’t ship throwaway code.');
  return (
    <div className="trash-app">
      <p>{msg}</p>
      <button
        className="btn btn--quiet"
        onClick={() => setMsg('rm: cannot remove ‘Trash’: it is already empty, you monster.')}
      >
        Empty Trash
      </button>
    </div>
  );
}
