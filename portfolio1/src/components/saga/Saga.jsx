import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/motion';
import { on, emit, getState, setState, useStore, robotSay, robotDo, robotHandAnchor, gauntletSocket } from '../../lib/store';
import { applyTheme } from '../../lib/themes';
import { lockScroll } from '../../lib/smoothScroll';
import { unlock } from '../../lib/secrets';
import { prefersReducedMotion } from '../../lib/device';
import { EyeOfAgamotto, MysticRings, GauntletArt } from './Artwork';
import { runButterflies, runDust } from './engines';
import { getSagaStage, setSagaStage, hasTimeStone, setTimeStone, restartTimeline, undoSnap } from './sagaState';
import * as sfx from './sfx';
import * as score from './score';

// The 3D gauntlet and gem renders pull in three.js, so they load on demand.
const Gauntlet3D = lazy(() => import('./Gauntlet3D'));

/** A rendered Time Stone (spinning sprite sheet, or a still), or null while it renders. */
function useGemSheet(id = 'time', still = false, size = 256) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let alive = true;
    import('./gems').then((m) => {
      if (!alive) return;
      try {
        setUrl(still ? m.gemStill(id, size) : m.gemSheet(id));
      } catch {
        /* no WebGL: keep the CSS gem */
      }
    });
    return () => {
      alive = false;
    };
  }, [id, still, size]);
  return url;
}

const gemStyle = (url) => (url ? { '--gem': `url(${url})` } : undefined);
const gemClass = (url) => `ts-gem${url ? ' ts-gem--sprite' : ''}`;
import './Saga.css';

/** Promise-based timeline helper that dies with the component. */
function useTimeline() {
  const alive = useRef(true);
  const timers = useRef([]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      timers.current.forEach(clearTimeout);
    };
  }, []);
  return useCallback(
    (ms) =>
      new Promise((resolve, reject) => {
        timers.current.push(setTimeout(() => (alive.current ? resolve() : reject(new Error('cancelled'))), ms));
      }),
    [],
  );
}

/* ------------------------------------------------------------------------ */
/* HUD bits                                                                 */
/* ------------------------------------------------------------------------ */

function TimeStoneBadge() {
  const sheet = useGemSheet('time');
  return (
    <div className="ts-badge" role="status" aria-label="You hold the Time Stone">
      <span className={gemClass(sheet)} style={gemStyle(sheet)} />
      <span className="ts-badge__txt">
        <b>TIME STONE</b>
        <i>in your possession</i>
      </span>
    </div>
  );
}

function SkipBar({ onSkip }) {
  const [sound, setSoundState] = useState(sfx.soundOn);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onSkip();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSkip]);
  return (
    <div className="saga-skip">
      <button
        onClick={() => {
          sfx.setSound(!sound);
          setSoundState(!sound);
        }}
      >
        sound: {sound ? 'on' : 'off'}
      </button>
      <button onClick={onSkip}>skip scene ✕</button>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Act I — the Time Stone unlocks, the page becomes butterflies, time rewinds */
/* ------------------------------------------------------------------------ */

function RewindClock() {
  const ref = useRef(null);
  useEffect(() => {
    const total = Math.max(5, Math.floor(performance.now() / 1000));
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 2000);
      const left = Math.round(total * (1 - p * p));
      const mm = String(Math.floor(left / 60)).padStart(2, '0');
      const ss = String(left % 60).padStart(2, '0');
      if (ref.current) ref.current.textContent = `T+${mm}:${ss}`;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="rewind">
      <div className="rewind__dial">
        <MysticRings reverse />
        <div className="rewind__face">
          <span className="rewind__hand rewind__hand--h" />
          <span className="rewind__hand rewind__hand--m" />
        </div>
      </div>
      <p className="pixel rewind__label">REWINDING TIMELINE</p>
      <p ref={ref} className="rewind__time">T+00:00</p>
    </div>
  );
}

function UnlockSequence({ onBadge }) {
  const [phase, setPhase] = useState('enter'); // enter → open → unlocked → burst → rewind → flash
  const canvasRef = useRef(null);
  const eyeRef = useRef(null);
  const engine = useRef(null);
  const music = useRef(null);
  const wait = useTimeline();
  const stoneImg = useGemSheet('time', true, 256);

  useEffect(() => {
    lockScroll(true);
    const reduced = prefersReducedMotion();
    sfx.whoosh(0.9);
    (async () => {
      try {
        await wait(700);
        setPhase('open');
        sfx.chime();
        music.current = score.rise();
        await wait(1000);
        setPhase('unlocked');
        await wait(2200);
        setPhase('burst');
        sfx.whoosh(1.8);
        const r = eyeRef.current.getBoundingClientRect();
        engine.current = runButterflies(canvasRef.current, {
          cx: r.left + r.width / 2,
          cy: r.top + r.height / 2,
          reduced,
        });
        // The stone shrinks into the visitor's pocket (bottom-right badge).
        gsap.to(eyeRef.current, {
          x: window.innerWidth - 60 - (r.left + r.width / 2),
          y: window.innerHeight - 40 - (r.top + r.height / 2),
          scale: 0.08,
          duration: 1.6,
          delay: 0.6,
          ease: 'power3.in',
          onComplete: onBadge,
        });
        await wait(3600);
        setPhase('rewind');
        sfx.rewind(2.2);
        await wait(2400);
        setPhase('flash');
        music.current?.stop(0.4);
        await wait(450);
        restartTimeline();
      } catch {
        /* skipped */
      }
    })();
    return () => {
      engine.current?.stop();
      music.current?.stop(0.3);
    };
  }, [wait, onBadge]);

  const open = phase !== 'enter';
  return (
    <div className="saga-unlock" data-phase={phase}>
      <div className="saga-dim" />
      <canvas ref={canvasRef} className="saga-canvas" />
      <div ref={eyeRef} className="saga-eye">
        <MysticRings />
        <div className="saga-eye__amulet">
          <EyeOfAgamotto open={open} stoneSrc={stoneImg} />
        </div>
        <div className="saga-shock" />
      </div>
      <div className="saga-title">
        <p className="pixel saga-title__kicker">THE EYE OF AGAMOTTO</p>
        <p className="saga-title__main">TIME STONE UNLOCKED</p>
        <p className="saga-title__quote">“Dormammu, I’ve come to bargain.”</p>
      </div>
      {phase === 'rewind' && <RewindClock />}
      {phase === 'flash' && <div className="saga-flash saga-flash--green" />}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Act II — the robot remembers, Thanos is coming, the snap                 */
/* ------------------------------------------------------------------------ */

function GauntletFollower({ mode }) {
  const ref = useRef(null);
  useEffect(() => {
    let raf;
    const loop = () => {
      const el = ref.current;
      if (el) {
        const h = Math.max(150, Math.min(340, robotHandAnchor.unit * 2.1));
        const w = h * 0.78;
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        el.style.transform = `translate3d(${(robotHandAnchor.x - w * 0.55).toFixed(1)}px, ${(robotHandAnchor.y - h * 0.8).toFixed(1)}px, 0)`;
        el.style.opacity = robotHandAnchor.visible ? '1' : '0';
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={ref} className={`gauntlet gauntlet--${mode}`} aria-hidden="true">
      <Suspense fallback={<GauntletArt full={mode === 'full' || mode === 'snap'} />}>
        <Gauntlet3D mode={mode} />
      </Suspense>
    </div>
  );
}

const WRONG_LINES = [
  'Wrong. Think bigger… and purpler.',
  'Hint: he is inevitable.',
  'Hint: “Fine. I’ll do it myself.”',
  'It is T-H-A-N-O-S. Type it, human.',
];

function Interrogation({ onAnswer, shake }) {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');
  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 300);
    return () => clearTimeout(id);
  }, []);
  return (
    <form
      className={`win interro${shake ? ' is-shake' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        sfx.primeAudio();
        onAnswer(value);
        setValue('');
      }}
      data-no-robot
    >
      <div className="win__bar">
        <span className="win__title">VH-01 :: INTERROGATION</span>
      </div>
      <div className="win__body">
        <p className="interro__q">Who collected all the Infinity Stones first?</p>
        <label className="interro__row">
          <span className="accent">&gt;</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={sfx.primeAudio}
            placeholder="type your answer…"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Your answer"
          />
          <button type="submit" className="btn btn--solid">
            Answer ↵
          </button>
        </label>
      </div>
    </form>
  );
}

function Credits() {
  useEffect(() => {
    unlock('snap');
    const music = score.fanfare();
    return () => music.stop(0.5);
  }, []);
  return (
    <div className="credits" role="dialog" aria-label="End credits">
      <p className="credits__name">VIMAL HARIHAR</p>
      <p className="credits__will">WILL RETURN</p>
      <p className="credits__year">IN 2027</p>
      <div className="credits__actions">
        <button className="btn btn--quiet" onClick={undoSnap}>
          ↺ Undo the snap
        </button>
        <button className="btn btn--quiet" onClick={restartTimeline}>
          ▶ Watch again
        </button>
      </div>
    </div>
  );
}

function ReturnSequence({ onDropStone }) {
  const booted = useStore((s) => s.booted);
  const [scene, setScene] = useState(false); // letterbox bars
  const [sub, setSub] = useState('');
  const [evil, setEvil] = useState(false);
  const [gauntlet, setGauntlet] = useState(null);
  const [asking, setAsking] = useState(false);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const [phase, setPhase] = useState('scene'); // scene → dust → black → credits
  const dustRef = useRef(null);
  const engine = useRef(null);
  const wrong = useRef(0);
  const prevTheme = useRef(getState().theme);
  const resolveAnswer = useRef(null);
  const wait = useTimeline();

  const say = (text, ms) => {
    robotSay(text, ms);
    setSub(text);
  };
  const goEvil = (onOff) => {
    if (onOff) {
      applyTheme('reality');
      setState({ theme: 'reality', evil: true });
    } else {
      applyTheme(prevTheme.current);
      setState({ theme: prevTheme.current, evil: false });
    }
    setEvil(onOff);
  };

  useEffect(() => {
    if (!booted) return undefined;
    lockScroll(true);
    window.scrollTo(0, 0);
    score.preloadCredits();
    (async () => {
      try {
        await wait(1900); // let VH-01 materialise
        setScene(true);
        await wait(600);
        say('Human memory may get erased…', 2600);
        robotDo('nod');
        await wait(2700);
        say('…but not mine.', 2400);
        await wait(2600);
        say('I know this is not your first time here.', 3000);
        robotDo('happy');
        await wait(3300);

        // Five seconds of evil.
        goEvil(true);
        emit('scene:glitch', 1.6);
        robotDo('glitch');
        setGauntlet('five');
        setState({ gauntlet: 'five' });
        sfx.rumble(4);
        score.threat();
        say('THANOS IS COMING FOR YOU.', 4800);
        await wait(5000);
        goEvil(false);

        say('Answer me, human. Who collected all the Infinity Stones first?', 600000);
        setAsking(true);
        await new Promise((resolve) => {
          resolveAnswer.current = resolve;
        });
        setAsking(false);

        say('Correct. Now… hand over the Time Stone.', 2600);
        await wait(700);
        // The visitor's stone flies into the empty socket.
        const badgeGem = document.querySelector('.ts-badge .ts-gem');
        const from = badgeGem?.getBoundingClientRect();
        const svgSocket = document.querySelector('.gauntlet [data-socket="time"]')?.getBoundingClientRect();
        const to = gauntletSocket.ok
          ? { left: gauntletSocket.x - 1, top: gauntletSocket.y - 1, width: 2, height: 2 }
          : svgSocket;
        if (from && to) {
          const fly = document.createElement('span');
          fly.className = `${badgeGem.className} ts-fly`;
          fly.style.cssText = badgeGem.style.cssText;
          fly.style.left = `${from.left}px`;
          fly.style.top = `${from.top}px`;
          document.body.appendChild(fly);
          onDropStone();
          sfx.whoosh(1.3);
          await new Promise((resolve) =>
            gsap.to(fly, {
              x: to.left + to.width / 2 - (from.left + from.width / 2),
              y: to.top + to.height / 2 - (from.top + from.height / 2),
              scale: 0.45,
              duration: 1.3,
              ease: 'power2.inOut',
              onComplete: () => {
                fly.remove();
                resolve();
              },
            }),
          );
        } else {
          onDropStone();
        }
        setGauntlet('full');
        setState({ gauntlet: 'full' });
        sfx.chime();
        await wait(900);

        goEvil(true);
        emit('scene:glitch', 1.2);
        say('I am… inevitable.', 2300);
        await wait(2400);

        // *snap*
        setGauntlet('snap');
        setState({ gauntlet: 'snap' });
        await wait(220);
        sfx.snap();
        setFlash(true);
        await wait(380);
        goEvil(false); // the world dusts away in its own colours
        setSub('');
        setPhase('dust');
        await wait(30);
        sfx.wind(6.5);
        engine.current = runDust(dustRef.current, { reduced: prefersReducedMotion() });
        await engine.current.promise;
        setScene(false);
        setPhase('black');
        await wait(2400);
        setPhase('credits');
      } catch {
        /* skipped */
      }
    })();
    return () => engine.current?.stop();
    // The script runs exactly once, when the boot screen clears.
  }, [booted]);

  const onAnswer = (value) => {
    if (/thanos/i.test(value)) {
      unlock('timestone');
      resolveAnswer.current?.();
      return;
    }
    const line = WRONG_LINES[Math.min(wrong.current, WRONG_LINES.length - 1)];
    wrong.current += 1;
    say(line, 600000);
    robotDo('angry');
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  return (
    <>
      {gauntlet && <GauntletFollower mode={gauntlet} />}
      {evil && <div className="saga-evil" aria-hidden="true" />}
      <div className={`letterbox${scene ? ' is-on' : ''}`} aria-hidden={!scene}>
        <div className="letterbox__bar letterbox__bar--top" />
        <div className="letterbox__bar letterbox__bar--bot">
          <p className="letterbox__sub" key={sub}>
            {sub}
          </p>
        </div>
      </div>
      {asking && <Interrogation onAnswer={onAnswer} shake={shake} />}
      {flash && <div className="saga-flash" onAnimationEnd={() => setFlash(false)} />}
      {(phase === 'dust' || phase === 'black' || phase === 'credits') && <canvas ref={dustRef} className="saga-canvas saga-canvas--dust" />}
      {(phase === 'black' || phase === 'credits') && <div className="saga-black" />}
      {phase === 'credits' && <Credits />}
    </>
  );
}

/* ------------------------------------------------------------------------ */

export default function Saga() {
  const [stage, setStage] = useState(() => (getSagaStage() === 'return' ? 'return' : null));
  const [badge, setBadge] = useState(hasTimeStone);

  useEffect(
    () =>
      on('saga:timestone', () => {
        setStage((s) => {
          if (s) return s;
          unlock('timestone');
          return 'unlock';
        });
      }),
    [],
  );

  const showBadge = useCallback(() => {
    setTimeStone(true);
    setBadge(true);
  }, []);
  const dropStone = useCallback(() => {
    setTimeStone(false);
    setBadge(false);
  }, []);

  const skip = useCallback(() => {
    const dusted = document.querySelector('.saga-canvas--dust, .saga-black');
    setSagaStage(null);
    if (dusted || stage === 'return') {
      // Restore a clean world rather than leave it half-snapped.
      undoSnap();
      return;
    }
    lockScroll(false);
    setStage(null);
    showBadge();
  }, [stage, showBadge]);

  useEffect(() => {
    if (stage) return undefined;
    // Leaving the saga: make sure the robot and theme are back to normal.
    setState({ evil: false, gauntlet: null });
    return undefined;
  }, [stage]);

  return (
    <>
      {badge && <TimeStoneBadge />}
      {stage === 'unlock' && <UnlockSequence onBadge={showBadge} />}
      {stage === 'return' && <ReturnSequence onDropStone={dropStone} />}
      {stage && <SkipBar onSkip={skip} />}
    </>
  );
}
