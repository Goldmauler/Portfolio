import { useEffect, useRef, useState } from 'react';
import { sections } from '../data/profile';
import { ScrollTrigger } from '../lib/motion';
import { scrollToTarget } from '../lib/smoothScroll';
import { useStore, emit } from '../lib/store';
import { cycleTheme, THEMES } from '../lib/themes';
import { useUnlocked, SECRETS, unlock } from '../lib/secrets';
import './MenuBar.css';

function Clock() {
  const ref = useRef(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
    const update = () => {
      if (ref.current) ref.current.textContent = fmt.format(new Date());
    };
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, []);
  return <span ref={ref} className="mb__clock" />;
}

export default function MenuBar() {
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(false);
  const theme = useStore((s) => s.theme);
  const unlocked = useUnlocked();
  const progressRef = useRef(null);

  useEffect(() => {
    const triggers = sections.map((s) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => {
          if (self.isActive) setActive(s.id);
          else setActive((cur) => (cur === s.id ? null : cur));
        },
      }),
    );

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      triggers.forEach((t) => t.kill());
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id) => {
    setOpen(false);
    if (id === 'top') return scrollToTarget(0);
    const target = sections.find((s) => s.id === id)?.target;
    return target ? scrollToTarget(target, { offset: -46 }) : scrollToTarget(`#${id}`);
  };

  const onTheme = () => {
    cycleTheme();
    unlock('theme');
  };

  return (
    <header className="mb" data-no-robot>
      <nav className="mb__inner" aria-label="Primary">
        <button className="mb__item mb__logo pixel" onClick={() => go('top')} aria-label="Back to top">
          VH.OS
        </button>

        <ul className="mb__nav">
          {sections.map((s) => (
            <li key={s.id}>
              <button
                className={`mb__item${active === s.id ? ' is-active' : ''}`}
                onClick={() => go(s.id)}
                aria-current={active === s.id ? 'true' : undefined}
              >
                <span className="mb__idx">{s.index}</span>
                {s.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="mb__right">
          <button className="mb__item mb__secrets" onClick={() => emit('os:open', 'secrets')} title="Secrets found">
            <span className="accent">★</span> {unlocked.length}/{SECRETS.length}
          </button>
          <button
            className="mb__item mb__theme"
            onClick={onTheme}
            title={`${THEMES[theme]?.stone || 'Paper'} — click to switch stone`}
          >
            <span className="mb__swatch" aria-hidden="true" />
            {THEMES[theme]?.label}
          </button>
          <Clock />
          <button
            className="mb__item mb__menu"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mb-dropdown"
          >
            {open ? 'close' : 'menu'}
          </button>
        </div>
      </nav>
      <div className="mb__progress" ref={progressRef} aria-hidden="true" />

      {open && (
        <div id="mb-dropdown" className="mb__dropdown win">
          <div className="win__bar">
            <span className="win__title">Go to…</span>
            <button className="win__btn" onClick={() => setOpen(false)} aria-label="Close menu">
              ×
            </button>
          </div>
          <ul className="win__body">
            {sections.map((s) => (
              <li key={s.id}>
                <button className={active === s.id ? 'is-active' : ''} onClick={() => go(s.id)}>
                  <span className="mb__idx">{s.index}</span> ~/{s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
