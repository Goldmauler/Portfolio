import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Terminal from '../components/terminal/Terminal';
import KnowVimal from '../components/games/KnowVimal';
import Firewall from '../components/games/Firewall';
import Life from '../components/games/Life';
import { Readme, ClockApp, Secrets, Trash, HELP } from '../components/os/OsApps';
import PixelIcon from '../components/os/Icons';
import SectionMeta from '../components/SectionMeta';
import { on } from '../lib/store';
import { unlock, SECRETS } from '../lib/secrets';
import { gsap } from '../lib/motion';
import { scrollToTarget } from '../lib/smoothScroll';
import { prefersReducedMotion, hasFinePointer } from '../lib/device';
import { profile } from '../data/profile';
import './Desktop.css';

const APPS = {
  readme: {
    title: 'HOW_TO_PLAY.txt',
    w: 500,
    h: 500,
    pos: (W) => [Math.round(W / 2 - 235), 20],
    Comp: Readme,
  },
  terminal: {
    title: 'Terminal — visitor@vh.os',
    w: 620,
    h: 400,
    pos: (W, H) => [Math.round(W * 0.24), Math.round(H * 0.16)],
    Comp: Terminal,
    flush: true,
  },
  clock: { title: 'Clock Tool 1.1', w: 214, h: 104, pos: (W) => [W - 234, 18], Comp: ClockApp },
  life: { title: 'Glider 1.1', w: 256, h: 290, pos: (W, H) => [W - 276, H - 334], Comp: Life },
  quiz: { title: 'KNOW_VIMAL.exe — how well do you know Vimal?', w: 640, h: 450, pos: (W) => [Math.round(W / 2 - 300), 18], Comp: KnowVimal },
  firewall: { title: 'FIREWALL.exe', w: 660, h: 460, pos: (W) => [Math.round(W / 2 - 280), 40], Comp: Firewall },
  secrets: { title: 'Secrets.app', w: 340, h: 420, pos: (W) => [W - 380, 56], Comp: Secrets },
  trash: { title: 'Trash', w: 300, h: 150, pos: (W, H) => [Math.round(W / 2 - 150), Math.round(H / 2 - 75)], Comp: Trash },
};

const ICONS = [
  { id: 'readme', label: 'How to play', icon: 'doc', desc: 'Start here: controls & rules' },
  { id: 'terminal', label: 'Terminal', icon: 'terminal', desc: 'A real shell — type help' },
  { id: 'quiz', label: 'KnowVimal.exe', icon: 'quiz', desc: 'How well do you know Vimal? · 10 Qs' },
  { id: 'firewall', label: 'Firewall.exe', icon: 'firewall', desc: 'Typing defense arcade' },
  { id: 'life', label: 'Glider', icon: 'glider', desc: 'Game of Life sandbox' },
  { id: 'secrets', label: 'Secrets', icon: 'star', desc: `${SECRETS.length} hidden achievements` },
  { id: 'resume', label: 'resume.pdf', icon: 'pdf', desc: 'Download Vimal’s resume' },
  { id: 'missions', label: 'Missions', icon: 'folder', desc: 'Jump to the projects' },
  { id: 'trash', label: 'Trash', icon: 'trash', desc: 'Nothing to see here…' },
];

const TASKBAR = ['terminal', 'quiz', 'firewall', 'life', 'secrets'];
const TASK_LABEL = { terminal: 'Terminal', quiz: 'Know Vimal', firewall: 'Firewall', life: 'Glider', secrets: 'Secrets' };
const TASK_ICON = { terminal: 'terminal', quiz: 'quiz', firewall: 'firewall', life: 'glider', secrets: 'star' };

const DEFAULT_OPEN = ['clock', 'life', 'terminal'];
const COMPACT_BELOW = 760;
const TASKBAR_H = 44;
const GUIDE_KEY = 'vh-guide-seen';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const guideSeen = () => {
  try {
    return sessionStorage.getItem(GUIDE_KEY) === '1';
  } catch {
    return false;
  }
};
const markGuideSeen = () => {
  try {
    sessionStorage.setItem(GUIDE_KEY, '1');
  } catch {
    /* storage unavailable */
  }
};

function Window({ id, app, pos, z, active, compact, desk, api, onFocus, onClose, onMove }) {
  const ref = useRef(null);
  const drag = useRef(null);
  const [help, setHelp] = useState(false);
  const w = compact ? undefined : Math.min(app.w, desk.w - 16);
  const h = compact ? undefined : Math.min(app.h, desk.h - TASKBAR_H - 16);
  const helpLines = HELP[id];

  const onBarDown = (e) => {
    if (compact || e.button !== 0 || e.target.closest('.win__btn')) return;
    onFocus(id);
    drag.current = {
      sx: e.clientX,
      sy: e.clientY,
      x: pos.x,
      y: pos.y,
      nx: pos.x,
      ny: pos.y,
      maxX: desk.w - ref.current.offsetWidth,
      maxY: desk.h - TASKBAR_H - ref.current.offsetHeight,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    ref.current.classList.add('is-dragging');
  };
  const onBarMove = (e) => {
    const d = drag.current;
    if (!d) return;
    d.nx = clamp(d.x + e.clientX - d.sx, 0, Math.max(0, d.maxX));
    d.ny = clamp(d.y + e.clientY - d.sy, 0, Math.max(0, d.maxY));
    ref.current.style.transform = `translate3d(${d.nx}px, ${d.ny}px, 0)`;
  };
  const onBarUp = () => {
    const d = drag.current;
    drag.current = null;
    ref.current?.classList.remove('is-dragging');
    if (d) onMove(id, d.nx, d.ny);
  };

  const { Comp } = app;
  return (
    <div
      ref={ref}
      className={`win os-win${active ? '' : ' win--inactive'}${compact ? ' os-win--compact' : ''}`}
      style={compact ? undefined : { width: w, height: h, zIndex: z, transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      onPointerDown={() => onFocus(id)}
      role="dialog"
      aria-label={app.title}
      data-win={id}
      data-no-robot
    >
      <div
        className="win__bar os-win__bar"
        onPointerDown={onBarDown}
        onPointerMove={onBarMove}
        onPointerUp={onBarUp}
        onPointerCancel={onBarUp}
      >
        <button className="win__btn" onClick={() => onClose(id)} aria-label={`Close ${app.title}`}>
          ×
        </button>
        <span className="win__title">{app.title}</span>
        <span className="os-win__grip" aria-hidden="true" />
        {helpLines && (
          <button
            className={`win__btn os-win__help${help ? ' is-on' : ''}`}
            onClick={() => setHelp((v) => !v)}
            aria-label={`How to use ${app.title}`}
            aria-expanded={help}
          >
            ?
          </button>
        )}
      </div>
      <div className={`win__body os-win__body${app.flush ? ' os-win__body--flush' : ''}`}>
        <Comp active={active} close={() => onClose(id)} api={api} />
        {help && (
          <div className="os-help">
            <p className="pixel os-help__h">HOW TO USE · {app.title}</p>
            <ol>
              {helpLines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ol>
            <button className="btn btn--solid" onClick={() => setHelp(false)}>
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Desktop() {
  const deskRef = useRef(null);
  const zoomRef = useRef(null);
  const [desk, setDesk] = useState(null); // { w, h }
  const [pos, setPos] = useState({});
  const [order, setOrder] = useState([]); // open apps, last = top
  const [selected, setSelected] = useState(null);
  const [nudge, setNudge] = useState(() => !guideSeen());
  const compact = desk ? desk.w < COMPACT_BELOW : false;

  const placeFor = useCallback((id, W, H) => {
    const app = APPS[id];
    const [x, y] = app.pos(W, H);
    const w = Math.min(app.w, W - 16);
    const h = Math.min(app.h, H - TASKBAR_H - 16);
    return { x: clamp(x, 0, Math.max(0, W - w)), y: clamp(y, 0, Math.max(0, H - TASKBAR_H - h)) };
  }, []);

  useLayoutEffect(() => {
    const el = deskRef.current;
    const measure = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      setDesk((prev) => (prev && prev.w === W && prev.h === H ? prev : { w: W, h: H }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!desk) return;
    setOrder((o) => (o.length ? o : DEFAULT_OPEN));
    setPos((p) => {
      const next = {};
      Object.keys(APPS).forEach((id) => {
        const app = APPS[id];
        const w = Math.min(app.w, desk.w - 16);
        const h = Math.min(app.h, desk.h - TASKBAR_H - 16);
        const cur = p[id] || placeFor(id, desk.w, desk.h);
        next[id] = {
          x: clamp(cur.x, 0, Math.max(0, desk.w - w)),
          y: clamp(cur.y, 0, Math.max(0, desk.h - TASKBAR_H - h)),
        };
      });
      return next;
    });
  }, [desk, placeFor]);

  const focus = useCallback((id) => {
    setOrder((o) => (o[o.length - 1] === id ? o : [...o.filter((x) => x !== id), id]));
  }, []);

  const zoom = (from, to, onDone) => {
    const z = zoomRef.current;
    if (!z || prefersReducedMotion()) {
      onDone?.();
      return;
    }
    gsap.killTweensOf(z);
    gsap.fromTo(
      z,
      { x: from.x, y: from.y, width: from.w, height: from.h, autoAlpha: 1 },
      {
        x: to.x,
        y: to.y,
        width: to.w,
        height: to.h,
        duration: 0.28,
        ease: 'steps(6)',
        onComplete: () => {
          gsap.set(z, { autoAlpha: 0 });
          onDone?.();
        },
      },
    );
  };

  const rectOf = (el) => {
    const d = deskRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - d.left, y: r.top - d.top, w: r.width, h: r.height };
  };

  const open = useCallback(
    (id, fromEl) => {
      if (id === 'resume') {
        unlock('resume');
        window.open(profile.resume, '_blank', 'noopener');
        return;
      }
      if (id === 'missions') {
        scrollToTarget('#projects');
        return;
      }
      if (!APPS[id] || !desk) return;
      setSelected(null);
      if (id === 'readme') {
        markGuideSeen();
        setNudge(false);
      }
      if (order.includes(id)) {
        focus(id);
        return;
      }
      const finish = () => setOrder((o) => [...o.filter((x) => x !== id), id]);
      if (compact || !fromEl) {
        finish();
        return;
      }
      const p = pos[id] || placeFor(id, desk.w, desk.h);
      const app = APPS[id];
      zoom(
        rectOf(fromEl),
        { x: p.x, y: p.y, w: Math.min(app.w, desk.w - 16), h: Math.min(app.h, desk.h - TASKBAR_H - 16) },
        finish,
      );
    },
    [desk, order, compact, pos, placeFor, focus],
  );

  const close = useCallback(
    (id) => {
      const winEl = deskRef.current?.querySelector(`[data-win="${id}"]`);
      const iconEl = deskRef.current?.querySelector(`[data-icon="${id}"]`);
      if (winEl && iconEl && !compact) zoom(rectOf(winEl), rectOf(iconEl));
      setOrder((o) => o.filter((x) => x !== id));
    },
    [compact],
  );

  const move = useCallback((id, x, y) => setPos((p) => ({ ...p, [id]: { x, y } })), []);

  const taskEl = (id) => deskRef.current?.querySelector(`[data-task="${id}"]`) || deskRef.current?.querySelector(`[data-icon="${id}"]`);
  const api = {
    open: (id) => open(id, taskEl(id)),
    focus: (id) => (order.includes(id) ? focus(id) : open(id, taskEl(id))),
  };

  // Launches from elsewhere on the site (terminal `open`, menu bar ★).
  useEffect(
    () =>
      on('os:open', (id) => {
        const r = deskRef.current?.getBoundingClientRect();
        const inView = r && r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4;
        if (!inView) scrollToTarget('#desk', { offset: -46 });
        open(id, inView ? deskRef.current?.querySelector(`[data-icon="${id}"]`) : null);
      }),
    [open],
  );

  // First visit: pop the how-to guide when the cursor enters the desk
  // (or when the desk scrolls into view on touch screens).
  const openGuideOnce = useCallback(() => {
    if (guideSeen() || !desk) return;
    open('readme', deskRef.current?.querySelector('[data-task="readme"]'));
  }, [desk, open]);

  useEffect(() => {
    if (!desk || guideSeen() || (hasFinePointer() && !compact)) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) openGuideOnce();
      },
      { threshold: 0.45 },
    );
    io.observe(deskRef.current);
    return () => io.disconnect();
  }, [desk, compact, openGuideOnce]);

  const onIconClick = (e, id) => {
    e.stopPropagation();
    // Keyboard activation, touch and compact mode open on a single click.
    if (e.detail === 0 || compact || e.nativeEvent.pointerType === 'touch') open(id, e.currentTarget);
    else setSelected(id);
  };

  const top = order[order.length - 1];
  const compactApp = compact ? (top && APPS[top] ? top : 'terminal') : null;
  const startEl = () => deskRef.current?.querySelector('[data-task="readme"]');

  return (
    <section id="desktop" className="section desktop" data-parallax-root>
      <div className="ghost" data-speed="0.7" aria-hidden="true">
        vh.os
      </div>
      <div className="container">
        <SectionMeta index="03" path="~/vh.os" />
        <div className="desktop__head">
          <h2 className="display" data-reveal>
            Jack In.
          </h2>
          <div className="desktop__intro" data-reveal>
            <p className="lead">
              A tiny operating system living in this page — a how-well-do-you-know-Vimal quiz, a typing game, a real shell and{' '}
              {SECRETS.length} hidden secrets.
            </p>
            <p className="label">
              <span className="live-dot" /> move your cursor onto the desktop for a quick how-to
            </p>
          </div>
        </div>

        <div
          id="desk"
          ref={deskRef}
          className={`os${compact ? ' os--compact' : ''}`}
          onPointerEnter={(e) => e.pointerType === 'mouse' && openGuideOnce()}
          onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <span className="tag os__tag">VH.OS 1.0</span>
          <div className="os__blob os__blob--a" aria-hidden="true" />
          <div className="os__blob os__blob--b" aria-hidden="true" />

          <ul className="os__icons" aria-label="Desktop icons">
            {ICONS.map((ic) => (
              <li key={ic.id}>
                <button
                  data-icon={ic.id}
                  className={`os-icon${selected === ic.id ? ' is-selected' : ''}${order.includes(ic.id) ? ' is-open' : ''}`}
                  onClick={(e) => onIconClick(e, ic.id)}
                  onDoubleClick={(e) => open(ic.id, e.currentTarget)}
                  aria-label={`Open ${ic.label} — ${ic.desc}`}
                >
                  <PixelIcon name={ic.icon} />
                  <span className="os-icon__label">{ic.label}</span>
                  {!compact && (
                    <span className="os-icon__tip" aria-hidden="true">
                      <b>{ic.label}</b>
                      <span>{ic.desc}</span>
                      <i>double-click to open</i>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {desk &&
            !compact &&
            order.map((id) => (
              <Window
                key={id}
                id={id}
                app={APPS[id]}
                pos={pos[id] || placeFor(id, desk.w, desk.h)}
                z={order.indexOf(id) + 10}
                active={id === top}
                compact={false}
                desk={desk}
                api={api}
                onFocus={focus}
                onClose={close}
                onMove={move}
              />
            ))}

          {!compact && nudge && !order.includes('readme') && (
            <button className="os__nudge" onClick={() => open('readme', startEl())}>
              <span className="live-dot" /> New here? Open the how-to-play guide
            </button>
          )}

          {!compact && (
            <nav className="os__taskbar" aria-label="Taskbar">
              <button data-task="readme" className="os__start" onClick={() => open('readme', startEl())}>
                <span className="pixel">▶ VH.OS</span> how to play
              </button>
              <div className="os__tasks">
                {TASKBAR.map((id) => (
                  <button
                    key={id}
                    data-task={id}
                    className={`os__task${order.includes(id) ? ' is-open' : ''}${top === id ? ' is-top' : ''}`}
                    onClick={(e) => (order.includes(id) ? focus(id) : open(id, e.currentTarget))}
                  >
                    <PixelIcon name={TASK_ICON[id]} scale={1} />
                    {TASK_LABEL[id]}
                  </button>
                ))}
              </div>
              <span className="os__hint">double-click icons · drag title bars · ? for rules</span>
            </nav>
          )}

          <div ref={zoomRef} className="os__zoom" aria-hidden="true" />
        </div>

        {compact && desk && (
          <div className="os-compact">
            <Window
              key={compactApp}
              id={compactApp}
              app={APPS[compactApp]}
              pos={{ x: 0, y: 0 }}
              z={1}
              active
              compact
              desk={desk}
              api={api}
              onFocus={() => {}}
              onClose={close}
              onMove={() => {}}
            />
          </div>
        )}
      </div>
    </section>
  );
}
