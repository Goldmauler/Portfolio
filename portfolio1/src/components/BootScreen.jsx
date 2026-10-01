import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/motion';
import { setState, getState } from '../lib/store';
import { lockScroll } from '../lib/smoothScroll';
import { prefersReducedMotion } from '../lib/device';
import './BootScreen.css';

const ITEMS = ['Kernel modules', 'Robot firmware', 'Projects.db', 'Image Assets, Copy', 'Secrets (shh)'];
const NORMAL_LOG = [
  '[ OK ] Mounted /dev/creativity',
  '[ OK ] Started edge-inference.service',
  '[ OK ] Reached target multi-agent.target',
  '[ OK ] Dithering the universe 1-bit',
];
// After the Time Stone rewinds the page.
const SAGA_LOG = [
  '[ OK ] Timeline restored from checkpoint',
  '[WARN] Memory wipe applied: visitor',
  '[FAIL] Memory wipe failed: VH-01',
  '[WARN] Unknown entity approaching',
];


const MIN_MS = 1500;
const MAX_WAIT_MS = 3500;

/**
 * Retro loader window. Waits for the 3D chunk (up to a cap) so the robot
 * materializes right as the screen clears. Click or any key skips it.
 */
export default function BootScreen({ ready }) {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem('vh-booted') && !prefersReducedMotion();
    } catch {
      return !prefersReducedMotion();
    }
  });
  const LOG = getState().sagaReturn ? SAGA_LOG : NORMAL_LOG;
  const [pct, setPct] = useState(0);
  const [lines, setLines] = useState(0);
  const rootRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      setState({ booted: true });
      return undefined;
    }
    lockScroll(true);
    const start = performance.now();
    let raf;
    const tick = () => {
      const elapsed = performance.now() - start;
      const isReady = ready.current || elapsed > MAX_WAIT_MS;
      // Ease toward 90% on time alone; the last stretch waits for the 3D chunk.
      const timeP = Math.min(1, elapsed / MIN_MS);
      const p = isReady ? timeP * 100 : timeP * 90;
      setPct(Math.round(p));
      setLines(Math.min(LOG.length, Math.floor(elapsed / 320)));
      if (elapsed >= MIN_MS && isReady) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);

    // Animation frames don't run in background tabs. A plain timer guarantees
    // the boot screen never blocks the site, however the page was opened.
    const failsafe = setTimeout(() => finish(true), MAX_WAIT_MS + 1500);

    function done() {
      setState({ booted: true });
      lockScroll(false);
      setVisible(false);
    }

    function finish(instant = false) {
      if (doneRef.current) return;
      doneRef.current = true;
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
      setPct(100);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      try {
        sessionStorage.setItem('vh-booted', '1');
      } catch {
        /* storage unavailable */
      }
      if (instant || document.hidden) {
        done();
        return;
      }
      const el = rootRef.current;
      gsap
        .timeline({ onComplete: done })
        .to(el.querySelector('.boot__win'), { scale: 1.06, autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0.12)
        .add(() => setState({ booted: true }), 0.2)
        .to(el, { clipPath: 'inset(50% 0 50% 0)', duration: 0.45, ease: 'expo.inOut' }, 0.25);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);

  if (!visible) return null;

  const item = ITEMS[Math.min(ITEMS.length - 1, Math.floor((pct / 100) * ITEMS.length))];

  return (
    <div ref={rootRef} className="boot" role="status" aria-label="Loading portfolio">
      <div className="boot__win win">
        <div className="win__bar">
          <span className="win__title">VH.OS 1.0</span>
        </div>
        <div className="win__body boot__body">
          <p className="pixel">Loading ...</p>
          <p className="pixel boot__item">{item}</p>
          <div className="boot__bar" aria-hidden="true">
            <div className="boot__fill" style={{ transform: `scaleX(${pct / 100})` }} />
            <span className="boot__pct">{pct}%</span>
            <span className="boot__pct boot__pct--inv" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
              {pct}%
            </span>
          </div>
        </div>
      </div>
      <ul className="boot__log" aria-hidden="true">
        {LOG.slice(0, lines).map((l) => (
          <li key={l}>
            <span className="accent">{l.slice(0, 6)}</span>
            {l.slice(6)}
          </li>
        ))}
      </ul>
      <p className="boot__skip faint">click or press any key to skip</p>
    </div>
  );
}
