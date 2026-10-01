import { useCallback, useEffect, useRef, useState } from 'react';
import { COMMANDS, COMMAND_NAMES } from './commands';
import { unlock } from '../../lib/secrets';
import './Terminal.css';

let lineId = 0;
const mk = (content, kind = 'out') => ({ id: ++lineId, content, kind });

const intro = () => [
  mk('VH.OS 1.0 (tty1)', 'dim'),
  mk(`Last login: ${new Date().toDateString()} from 127.0.0.1`, 'dim'),
  mk(''),
  mk('Welcome, visitor. Type `help` to see what this shell can do.', 'accent'),
  mk('Try: neofetch · hack mainframe · sudo hire-vimal · open quiz', 'dim'),
  mk(''),
];

const QUICK = ['help', 'neofetch', 'projects', 'hack mainframe', 'sudo hire-vimal', 'open quiz'];

function Prompt({ cwd }) {
  return (
    <span className="t-prompt">
      <span className="accent">visitor@vh.os</span>:<span className="accent-2">{cwd}</span>$
    </span>
  );
}

export default function Terminal({ close }) {
  const [lines, setLines] = useState(intro);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('~');
  const [busy, setBusy] = useState(false);
  const history = useRef([]);
  const histIdx = useRef(-1);
  const outRef = useRef(null);
  const inputRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    const el = outRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const print = useCallback((content, kind = 'out') => {
    const arr = Array.isArray(content) ? content : [content];
    setLines((l) => [...l, ...arr.map((c) => mk(c, kind))].slice(-400));
  }, []);

  const sequence = useCallback(
    (items, delay = 360) => {
      setBusy(true);
      items.forEach(([content, kind], i) => {
        timers.current.push(
          setTimeout(() => {
            print(content, kind);
            if (i === items.length - 1) setBusy(false);
          }, delay * (i + 1)),
        );
      });
    },
    [print],
  );

  const run = (raw) => {
    const cmdline = raw.trim();
    print(
      <span>
        <Prompt cwd={cwd} /> {raw}
      </span>,
      'in',
    );
    if (!cmdline) return;
    history.current.push(cmdline);
    histIdx.current = -1;
    unlock('terminal');
    const [name, ...args] = cmdline.split(/\s+/);
    const cmd = COMMANDS[name.toLowerCase()];
    if (!cmd) {
      print(`command not found: ${name}. Type 'help'.`, 'err');
      return;
    }
    try {
      cmd.run(args, {
        print,
        sequence,
        clear: () => setLines([]),
        close: close || (() => {}),
        cwd,
        setCwd,
        history: history.current,
      });
    } catch (err) {
      print(`segfault in ${name}: ${err.message}`, 'err');
    }
  };

  const complete = () => {
    const parts = input.split(/\s+/);
    const last = parts[parts.length - 1].toLowerCase();
    const options = parts.length <= 1 ? COMMAND_NAMES.filter((n) => !COMMANDS[n].hidden) : COMMANDS[parts[0]]?.args?.() || [];
    const matches = options.filter((o) => o.startsWith(last));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      setInput(`${parts.join(' ')} `);
    } else if (matches.length > 1) {
      print(matches.join('   '), 'dim');
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (busy) return;
      run(input);
      setInput('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      let i = histIdx.current;
      if (e.key === 'ArrowUp') i = i < 0 ? h.length - 1 : Math.max(0, i - 1);
      else i = i < 0 ? -1 : i + 1 >= h.length ? -1 : i + 1;
      histIdx.current = i;
      setInput(i < 0 ? '' : h[i]);
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key.toLowerCase() === 'c' && e.ctrlKey && !window.getSelection()?.toString()) {
      print(
        <span>
          <Prompt cwd={cwd} /> {input}^C
        </span>,
        'in',
      );
      setInput('');
    }
  };

  const focusInput = () => {
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="term" onClick={focusInput}>
      <div ref={outRef} className="term__out" data-lenis-prevent>
        {lines.map((l) => (
          <div key={l.id} className={`t-line t-line--${l.kind}`}>
            {l.content === '' ? ' ' : l.content}
          </div>
        ))}
        <label className="term__row">
          <Prompt cwd={cwd} />
          <input
            ref={inputRef}
            className="term__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label="Terminal input"
            enterKeyHint="send"
          />
        </label>
      </div>
      <div className="term__chips">
        {QUICK.map((q) => (
          <button
            key={q}
            className="term__chip"
            onClick={(e) => {
              e.stopPropagation();
              if (!busy) run(q);
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
