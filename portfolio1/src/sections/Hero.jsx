import { useEffect, useRef, useState } from 'react';
import { profile } from '../data/profile';
import { scrollToTarget } from '../lib/smoothScroll';
import { useStore } from '../lib/store';
import { unlock } from '../lib/secrets';
import { gsap } from '../lib/motion';
import { prefersReducedMotion, hasFinePointer } from '../lib/device';
import './Hero.css';

function Typer({ words }) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (prefersReducedMotion()) {
      setText(words[0]);
      return undefined;
    }
    let w = 0;
    let i = 0;
    let deleting = false;
    let timer;
    const step = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      setText(word.slice(0, i));
      let delay = deleting ? 22 : 48;
      if (!deleting && i === word.length) {
        deleting = true;
        delay = 1700;
      } else if (deleting && i === 0) {
        deleting = false;
        w = (w + 1) % words.length;
        delay = 280;
      }
      timer = setTimeout(step, delay);
    };
    timer = setTimeout(step, 900);
    return () => clearTimeout(timer);
  }, [words]);
  return (
    <span className="hero__typer">
      {text}
      <span className="caret" aria-hidden="true" />
    </span>
  );
}

function ClockWidget() {
  const dateRef = useRef(null);
  const timeRef = useRef(null);
  useEffect(() => {
    const d = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tick = () => {
      const now = new Date();
      if (dateRef.current) dateRef.current.textContent = d.format(now);
      if (timeRef.current) timeRef.current.textContent = t.format(now);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="win hero-widget hero-widget--clock">
      <div className="win__bar">
        <span className="win__title">Clock Tool 1.1</span>
      </div>
      <div className="win__body pixel">
        <div ref={dateRef} />
        <div ref={timeRef} className="hero-widget__time" />
      </div>
    </div>
  );
}

const METERS = ['CPU', 'GPU', 'COFFEE', 'CURIOSITY'];

function SysMonitor() {
  const bars = useRef([]);
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const id = setInterval(() => {
      bars.current.forEach((b, i) => {
        if (!b) return;
        const v = i === 3 ? 0.92 + Math.random() * 0.08 : 0.25 + Math.random() * 0.7;
        b.style.transform = `scaleX(${v.toFixed(2)})`;
      });
    }, 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="win hero-widget hero-widget--mon">
      <div className="win__bar">
        <span className="win__title">sys.monitor</span>
      </div>
      <div className="win__body">
        {METERS.map((m, i) => (
          <div key={m} className="meter">
            <span className="meter__label">{m}</span>
            <span className="meter__track dots">
              <span className="meter__fill" ref={(el) => (bars.current[i] = el)} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const booted = useStore((s) => s.booted);
  const rootRef = useRef(null);
  const nameRef = useRef(null);

  // Entrance once the boot screen clears.
  useEffect(() => {
    if (!booted) return undefined;
    const root = rootRef.current;
    if (prefersReducedMotion()) {
      root.classList.add('is-in');
      return undefined;
    }
    const ctx = gsap.context(() => {
      gsap
        .timeline({ onComplete: () => root.classList.add('is-in') })
        .fromTo(
          '.hero__line > span',
          { yPercent: 110, y: 0 },
          { yPercent: 0, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09 },
        )
        .fromTo(
          '[data-hero-in]',
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06 },
          0.25,
        )
        .fromTo(
          '.hero-widget',
          { autoAlpha: 0, scale: 0.9 },
          { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'steps(4)', stagger: 0.12 },
          0.5,
        );
    }, root);
    return () => ctx.revert();
  }, [booted]);

  // Occasional RGB-split glitch on the name.
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const lines = nameRef.current.querySelectorAll('.glitch');
    const id = setInterval(() => {
      const el = lines[(Math.random() * lines.length) | 0];
      el.classList.add('is-glitching');
      setTimeout(() => el.classList.remove('is-glitching'), 240);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  // Mouse parallax for [data-depth] layers.
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return undefined;
    const layers = [...rootRef.current.querySelectorAll('[data-depth]')];
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf;
    const onMove = (e) => {
      target.x = e.clientX / window.innerWidth - 0.5;
      target.y = e.clientY / window.innerHeight - 0.5;
    };
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      layers.forEach((el) => {
        const d = parseFloat(el.dataset.depth);
        el.style.transform = `translate3d(${(cur.x * d * 60).toFixed(2)}px, ${(cur.y * d * 40).toFixed(2)}px, 0)`;
      });
      raf = requestAnimationFrame(loop);
    };
    // Only run while the hero is on screen.
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(rootRef.current);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="top" ref={rootRef} className="hero" data-parallax-root aria-label="Introduction">
      <div className="hero__floats" aria-hidden="true">
        <div className="hero__float hero__float--clock" data-speed="1.35">
          <div data-depth="-0.6">
            <ClockWidget />
          </div>
        </div>
        <div className="hero__float hero__float--mon" data-speed="1.6">
          <div data-depth="0.9">
            <SysMonitor />
          </div>
        </div>
      </div>

      <div className="container hero__content" data-speed="0.82">
        <div className="hero__kicker" data-hero-in>
          <span className="tag">PORTFOLIO v3</span>
          <span className="label">
            <span className="live-dot" /> online — {profile.location}
          </span>
        </div>

        <h1 ref={nameRef} className="hero__name display" aria-label={profile.name}>
          <span className="hero__line" aria-hidden="true">
            <span className="glitch" data-text={profile.firstName}>
              {profile.firstName}
            </span>
          </span>
          <span className="hero__line hero__line--outline" aria-hidden="true">
            <span className="glitch" data-text={profile.lastName}>
              {profile.lastName}
            </span>
          </span>
        </h1>

        <div className="hero__bottom">
          <p className="hero__role" data-hero-in>
              <span className="faint">$ whoami →</span> <Typer words={profile.roles} />
            </p>
            <p className="hero__tagline lead" data-hero-in>
              {profile.tagline}
            </p>
            <div className="hero__ctas" data-hero-in>
              <button className="btn btn--solid" onClick={() => scrollToTarget('#desk', { offset: -46 })}>
                Enter VH.OS ↘
              </button>
              <button className="btn" onClick={() => scrollToTarget('#projects')}>
                Missions
              </button>
              <a className="btn btn--quiet" href={profile.resume} download onClick={() => unlock('resume')}>
                resume.pdf ↓
              </a>
            </div>
          <dl className="hero__facts" data-hero-in>
            <div>
              <dt className="label">edu</dt>
              <dd>B.Tech CSE · Amrita ’27</dd>
            </div>
            <div>
              <dt className="label">recent</dt>
              <dd>SWE &amp; AI Intern · Innoboon</dd>
            </div>
            <div>
              <dt className="label">status</dt>
              <dd className="accent">open to SWE / AI roles</dd>
            </div>
          </dl>
        </div>
      </div>

      <button className="hero__cue pixel" onClick={() => scrollToTarget('#about')} data-hero-in>
        scroll to jack in <span aria-hidden="true">↓</span>
      </button>
    </section>
  );
}
