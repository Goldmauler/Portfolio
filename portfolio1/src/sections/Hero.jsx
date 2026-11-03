import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { profile } from '../data/profile';
import { scrollToTarget } from '../lib/smoothScroll';
import { useStore, subscribe, getState } from '../lib/store';
import { unlock } from '../lib/secrets';
import { gsap } from '../lib/motion';
import { prefersReducedMotion, getWebGLSupport, isSmallScreen } from '../lib/device';
import HoloPortrait from '../components/HoloPortrait';
import './Hero.css';

const NAME = profile.name; // "Vimal Harihar"

function LocalTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return <span className="hero__time">({time} IST)</span>;
}

const readColors = () => {
  const cs = getComputedStyle(document.documentElement);
  const light = document.documentElement.dataset.mode === 'light';
  return {
    a: (light ? cs.getPropertyValue('--fg') : cs.getPropertyValue('--accent')).trim() || '#2bff88',
    b: cs.getPropertyValue('--accent-2').trim() || '#9dffcc',
    hot: light ? '#000000' : '#ffffff',
    light,
  };
};

/**
 * Opening scene: the ASCII portrait as a 3D glyph cloud, a circuit trace
 * drawn over it, the name set huge along the bottom. Scrolling through the
 * hero's runway blasts the cloud past the camera.
 */
export default function Hero() {
  const booted = useStore((s) => s.booted);
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const fieldRef = useRef(null);
  const nameRef = useRef(null);
  const ctrlRef = useRef(null);
  const [webgl] = useState(getWebGLSupport);

  // Mount the WebGL field (three.js is shared with the background scene chunk).
  useEffect(() => {
    if (!webgl) return undefined;
    let alive = true;
    let unsub = () => {};
    let io;
    import('../components/portraitField').then(async ({ createPortraitField }) => {
      if (!alive) return;
      let ctrl;
      try {
        ctrl = await createPortraitField(fieldRef.current, {
          src: profile.photo,
          mask: '/vimal-mask.png',
          reduced: prefersReducedMotion(),
          small: isSmallScreen(),
          colors: readColors(),
        });
      } catch {
        return;
      }
      if (!alive) {
        ctrl.dispose();
        return;
      }
      ctrlRef.current = ctrl;
      fieldRef.current.classList.add('is-ready');
      if (getState().booted) ctrl.start();
      let theme = getState().theme;
      unsub = subscribe(() => {
        const s = getState();
        if (s.theme !== theme) {
          theme = s.theme;
          // Theme tokens are applied synchronously before listeners run.
          requestAnimationFrame(() => ctrl.setColors(readColors()));
        }
      });
      io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? ctrl.play() : ctrl.pause()));
      io.observe(rootRef.current);
    });
    return () => {
      alive = false;
      unsub();
      io?.disconnect();
      ctrlRef.current?.dispose();
      ctrlRef.current = null;
    };
  }, [webgl]);

  // Scroll runway → explosion progress (also drives the DOM fades via --p).
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const reduced = prefersReducedMotion();
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = root.getBoundingClientRect();
      const runway = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / runway));
      stage.style.setProperty('--p', reduced ? Math.min(1, p * 1.4).toFixed(3) : p.toFixed(3));
      ctrlRef.current?.setScroll(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Fit the name to the full width of the stage.
  useLayoutEffect(() => {
    const el = nameRef.current;
    const fit = () => {
      const avail = el.parentElement.clientWidth;
      el.style.fontSize = '100px';
      const w = el.firstElementChild.getBoundingClientRect().width;
      if (w) el.style.fontSize = `${((avail / w) * 100 * 0.995).toFixed(2)}px`;
      stageRef.current?.style.setProperty('--name-h', `${el.offsetHeight}px`);
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, []);

  // Entrance once the boot screen clears.
  useEffect(() => {
    if (!booted) return undefined;
    ctrlRef.current?.start();
    const root = rootRef.current;
    if (prefersReducedMotion()) {
      root.classList.add('is-in');
      return undefined;
    }
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.35, onComplete: () => root.classList.add('is-in') })
        .add(() => root.classList.add('is-drawing'), 0.2)
        .fromTo(
          '.hero__char',
          { yPercent: 115, y: 0, rotate: 6 },
          { yPercent: 0, y: 0, rotate: 0, duration: 1.25, ease: 'expo.out', stagger: 0.045 },
          0.9,
        )
        .fromTo(
          '[data-hero-in]',
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07 },
          1.2,
        );
    }, root);
    return () => ctx.revert();
  }, [booted]);

  // Occasional RGB-split glitch on the name.
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const el = nameRef.current.querySelector('.glitch');
    let off;
    const id = setInterval(() => {
      el.classList.add('is-glitching');
      off = setTimeout(() => el.classList.remove('is-glitching'), 220);
    }, 5200);
    return () => {
      clearInterval(id);
      clearTimeout(off);
    };
  }, []);

  return (
    <section id="top" ref={rootRef} className="hero" aria-label="Introduction">
      <div ref={stageRef} className="hero__stage">
        <div className="hero__glow" aria-hidden="true" />
        {webgl ? (
          <div ref={fieldRef} className="hero__field" role="img" aria-label="ASCII portrait of Vimal Harihar made of green glyphs" />
        ) : (
          <div className="hero__field hero__field--flat">
            <HoloPortrait src={profile.photo} cols={90} label="ASCII portrait of Vimal Harihar" />
          </div>
        )}

        <svg className="hero__trace" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g className="hero__trace-a">
            <path
              className="trace"
              pathLength="1000"
              d="M -40 812 H 150 L 250 712 V 470 L 330 390 H 520 L 600 310 V 168 L 664 104 H 760"
            />
            <path
              className="trace-pulse"
              pathLength="1000"
              d="M -40 812 H 150 L 250 712 V 470 L 330 390 H 520 L 600 310 V 168 L 664 104 H 760"
            />
            <circle className="node" cx="760" cy="104" r="5" />
            <circle className="node node--hollow" cx="330" cy="390" r="7" />
          </g>
          <g className="hero__trace-b">
            <path
              className="trace"
              pathLength="1000"
              d="M 1640 196 H 1488 L 1404 280 V 360 L 1290 474 H 1110 L 1040 544 V 600"
            />
            <path
              className="trace-pulse trace-pulse--slow"
              pathLength="1000"
              d="M 1640 196 H 1488 L 1404 280 V 360 L 1290 474 H 1110 L 1040 544 V 600"
            />
            <circle className="node" cx="1040" cy="600" r="5" />
            <circle className="node node--hollow" cx="1404" cy="280" r="7" />
          </g>
        </svg>

        <header className="hero__meta">
          <div data-hero-in>
            <span className="hero__k">Currently:</span>
            <span>B.Tech CSE · Amrita ’27</span>
          </div>
          <div data-hero-in>
            <span className="hero__k">Based in:</span>
            <span>
              {profile.location} <LocalTime />
            </span>
          </div>
          <div data-hero-in>
            <span className="hero__k">Status:</span>
            <span className="hero__status">
              <span className="live-dot" /> Open to SWE / AI roles
            </span>
          </div>
        </header>

        <div className="hero__foot">
          <p className="hero__blurb" data-hero-in>
            {profile.tagline} Recently SWE &amp; AI intern at Innoboon.{' '}
            <a href={profile.resume} download onClick={() => unlock('resume')}>
              resume.pdf
            </a>
            . Scroll to jack in.
          </p>
          <button className="hero__explore" onClick={() => scrollToTarget('#projects')} data-hero-in>
            Explore the work
            <span className="hero__explore-ico" aria-hidden="true">
              ↓
            </span>
          </button>
        </div>

        <div className="hero__namebox">
          <h1 ref={nameRef} className="hero__name" aria-label={NAME}>
            <span className="glitch" data-text={NAME} aria-hidden="true">
              {[...NAME].map((ch, i) => (
                <span key={i} className={ch === ' ' ? 'hero__mask hero__mask--space' : 'hero__mask'}>
                  <span className="hero__char">{ch === ' ' ? ' ' : ch}</span>
                </span>
              ))}
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
}
