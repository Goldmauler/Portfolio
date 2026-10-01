import { useCallback, useEffect, useRef, useState } from 'react';
import { quizQuestions, quizOpener } from '../../data/profile';
import { unlock } from '../../lib/secrets';
import { emit, robotDo } from '../../lib/store';
import { primeAudio } from '../saga/sfx';
import { scrollToTarget } from '../../lib/smoothScroll';
import './KnowVimal.css';

const ROUNDS = 10;
const SECONDS = 20;
const BEST_KEY = 'vh-quiz-best';

const RANKS = [
  { min: 10, title: 'Basically Vimal', line: 'You know him better than his commit history.' },
  { min: 8, title: 'Hackathon Teammate', line: 'You have clearly been reading the logs.' },
  { min: 6, title: 'LinkedIn Connection', line: 'Solid. A few more scrolls and you are in the inner circle.' },
  { min: 3, title: 'Recruiter Skim', line: 'You skimmed. The whoami and missions sections have the answers.' },
  { min: 0, title: 'Stranger.exe', line: 'Fresh install. Explore the site, then run it again.' },
];

const SECTION_LABEL = { about: '~/whoami', skills: '~/research', projects: '~/missions', experience: '~/logs', top: '~/home' };

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const prep = (q) => ({ ...q, answer: q.options[0], options: shuffle(q.options) });

// The Doctor Strange question always opens the round.
const newRound = () => [prep(quizOpener), ...shuffle(quizQuestions).slice(0, ROUNDS - 1).map(prep)];

const readBest = () => {
  try {
    return parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
};

export default function KnowVimal({ active = true }) {
  const [phase, setPhase] = useState('intro'); // intro | play | reveal | done
  const [round, setRound] = useState(newRound);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null); // option text, or '' for timeout
  const [results, setResults] = useState([]); // booleans
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gained, setGained] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS);
  const [best, setBest] = useState(readBest);
  const startedAt = useRef(0);
  const rootRef = useRef(null);

  const q = round[idx];
  const correctCount = results.filter(Boolean).length;

  const start = useCallback(() => {
    setRound(newRound());
    setIdx(0);
    setPicked(null);
    setResults([]);
    setScore(0);
    setStreak(0);
    setGained(0);
    setTimeLeft(SECONDS);
    startedAt.current = performance.now();
    setPhase('play');
  }, []);

  const answer = useCallback(
    (option) => {
      if (phase !== 'play') return;
      primeAudio(); // a click/keypress lets the saga play sound later
      const left = Math.max(0, SECONDS - (performance.now() - startedAt.current) / 1000);
      const ok = option === q.answer;
      if (ok && q.special === 'timestone') {
        setPicked(option);
        setResults((r) => [...r, true]);
        setPhase('saga');
        setTimeout(() => emit('saga:timestone'), 1300);
        return;
      }
      const nextStreak = ok ? streak + 1 : 0;
      const pts = ok ? 100 + Math.round(left * 5) + (nextStreak - 1) * 25 : 0;
      setPicked(option);
      setResults((r) => [...r, ok]);
      setStreak(nextStreak);
      setGained(pts);
      setScore((s) => s + pts);
      setPhase('reveal');
    },
    [phase, q, streak],
  );

  const next = useCallback(() => {
    if (phase !== 'reveal') return;
    if (idx + 1 >= ROUNDS) {
      setPhase('done');
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setTimeLeft(SECONDS);
    startedAt.current = performance.now();
    setPhase('play');
  }, [phase, idx]);

  // Countdown; running out of time counts as a wrong answer.
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const id = setInterval(() => {
      const left = Math.max(0, SECONDS - (performance.now() - startedAt.current) / 1000);
      setTimeLeft(left);
      if (left <= 0) answer('');
    }, 100);
    return () => clearInterval(id);
  }, [phase, answer]);

  // Final tally: best score + rewards.
  useEffect(() => {
    if (phase !== 'done') return;
    if (score > best) {
      setBest(score);
      try {
        localStorage.setItem(BEST_KEY, String(score));
      } catch {
        /* storage unavailable */
      }
    }
    if (correctCount >= 8) unlock('quiz');
    if (correctCount === ROUNDS) {
      emit('scene:glitch', 0.6);
      robotDo('dance');
    }
  }, [phase]);

  // Keyboard: 1–4 answer, Enter continues. Only while this window is active.
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!rootRef.current?.isConnected) return;
      const r = rootRef.current.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if (phase === 'play' && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        answer(q.options[Number(e.key) - 1]);
      } else if (e.key === 'Enter') {
        if (phase === 'reveal') {
          e.preventDefault();
          next();
        } else if (phase === 'intro' || phase === 'done') {
          e.preventDefault();
          start();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, phase, q, answer, next, start]);

  if (phase === 'intro') {
    return (
      <div ref={rootRef} className="kv kv--center">
        <p className="pixel kv__title">HOW WELL DO YOU KNOW VIMAL?</p>
        <ul className="kv__rules">
          <li>
            <b>10</b> random questions about Vimal — every answer is somewhere on this site.
          </li>
          <li>
            <b>20s</b> per question. Faster answers and streaks score more.
          </li>
          <li>
            Click an option or press <kbd>1</kbd>–<kbd>4</kbd>. <kbd>Enter</kbd> moves on.
          </li>
          <li>
            Get <b>8+</b> right to unlock a secret.
          </li>
        </ul>
        {best > 0 && <p className="label">your best: {best} pts</p>}
        <button className="btn btn--solid" onClick={start}>
          Start quiz ↵
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    const rank = RANKS.find((r) => correctCount >= r.min);
    return (
      <div ref={rootRef} className="kv kv--center">
        <p className="label">RESULT</p>
        <p className="kv__big">
          {correctCount}
          <span>/{ROUNDS}</span>
        </p>
        <p className="pixel kv__rank">{rank.title}</p>
        <p className="kv__line">{rank.line}</p>
        <div className="kv__pips kv__pips--lg" aria-label={`${correctCount} of ${ROUNDS} correct`}>
          {results.map((ok, i) => (
            <i key={i} className={ok ? 'is-ok' : 'is-bad'} />
          ))}
        </div>
        <p className="label">
          {score} pts · best {Math.max(best, score)}
        </p>
        <div className="kv__actions">
          <button className="btn btn--solid" onClick={start}>
            Play again ↵
          </button>
          <button className="btn btn--quiet" onClick={() => scrollToTarget('#about')}>
            Study up → whoami
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'saga') {
    return (
      <div ref={rootRef} className="kv kv--center kv--saga">
        <span className="kv__gem" aria-hidden="true" />
        <p className="pixel kv__title">CORRECT. DOCTOR STRANGE.</p>
        <p className="kv__line">The Eye of Agamotto is opening…</p>
      </div>
    );
  }

  const revealed = phase === 'reveal';
  const ok = revealed && picked === q.answer;

  return (
    <div ref={rootRef} className="kv">
      <div className="kv__hud">
        <span className="pixel kv__q">
          Q{String(idx + 1).padStart(2, '0')}/{ROUNDS}
        </span>
        <div className="kv__pips" aria-hidden="true">
          {Array.from({ length: ROUNDS }, (_, i) => (
            <i key={i} className={i < results.length ? (results[i] ? 'is-ok' : 'is-bad') : i === idx ? 'is-now' : ''} />
          ))}
        </div>
        <span className="kv__score">
          {score} pts{streak > 1 && <b> ×{streak} streak</b>}
        </span>
      </div>
      <div className="kv__timer" aria-hidden="true">
        <span
          className={timeLeft < 5 ? 'is-low' : ''}
          style={{ transform: `scaleX(${revealed ? 0 : timeLeft / SECONDS})` }}
        />
      </div>

      <p className="kv__question">{q.q}</p>

      <div className="kv__options">
        {q.options.map((opt, i) => {
          let cls = 'kv__opt';
          if (revealed) {
            if (opt === q.answer) cls += ' is-right';
            else if (opt === picked) cls += ' is-wrong';
            else cls += ' is-dim';
          }
          return (
            <button key={opt} className={cls} onClick={() => answer(opt)} disabled={revealed}>
              <span className="kv__key">{i + 1}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      <div className={`kv__reveal${revealed ? ' is-on' : ''}`} aria-live="polite">
        {revealed && (
          <>
            <p className={`kv__verdict ${ok ? 'accent' : 'danger'}`}>
              {ok ? `✓ CORRECT  +${gained}` : picked === '' ? '⌛ TIME UP' : '✗ NOPE'}
            </p>
            <p className="kv__fact">{q.fact}</p>
            <div className="kv__revealbar">
              {q.where && (
                <button className="kv__where" onClick={() => scrollToTarget(q.where === 'top' ? 0 : `#${q.where}`)}>
                  see {SECTION_LABEL[q.where] || q.where} →
                </button>
              )}
              <button className="btn btn--solid kv__next" onClick={next}>
                {idx + 1 >= ROUNDS ? 'Results ↵' : 'Next ↵'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
