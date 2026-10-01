import { useCallback, useEffect, useRef, useState } from 'react';
import { projects } from '../data/profile';
import { on } from '../lib/store';
import { lockScroll } from '../lib/smoothScroll';
import './DeckViewer.css';

const pad = (n) => String(n).padStart(2, '0');

/** Fullscreen slide viewer. Open with emit('deck:open', projectId). */
export default function DeckViewer() {
  const [project, setProject] = useState(null);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const returnFocus = useRef(null);
  const closeRef = useRef(null);
  const stripRef = useRef(null);
  const swipe = useRef(null);

  const deck = project?.deck;
  const count = deck?.slides || 0;

  const close = useCallback(() => {
    setProject(null);
    lockScroll(false);
    returnFocus.current?.focus?.({ preventScroll: true });
  }, []);

  const go = useCallback((i) => {
    setIndex((cur) => {
      const next = Math.max(0, Math.min(count - 1, i));
      if (next !== cur) setLoaded(false);
      return next;
    });
  }, [count]);

  useEffect(
    () =>
      on('deck:open', (id) => {
        const p = projects.find((x) => x.id === id && x.deck);
        if (!p) return;
        returnFocus.current = document.activeElement;
        setProject(p);
        setIndex(0);
        setLoaded(false);
        lockScroll(true);
      }),
    [],
  );

  // Keyboard controls + initial focus.
  useEffect(() => {
    if (!project) return undefined;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(count - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, index, count, go, close]);

  // Keep the active thumbnail in view; preload neighbours.
  useEffect(() => {
    if (!deck) return;
    const thumb = stripRef.current?.querySelector(`[data-i="${index}"]`);
    thumb?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    [index + 1, index - 1].forEach((i) => {
      if (i >= 0 && i < count) {
        const img = new Image();
        img.src = `${deck.dir}/${pad(i + 1)}.webp`;
      }
    });
  }, [deck, index, count]);

  if (!project) return null;

  const onPointerDown = (e) => {
    swipe.current = { x: e.clientX, t: performance.now() };
  };
  const onPointerUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="deck" role="dialog" aria-modal="true" aria-label={`${project.title} slide deck`} onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="win deck__win">
        <div className="win__bar">
          <button ref={closeRef} className="win__btn" onClick={close} aria-label="Close deck">
            ×
          </button>
          <span className="win__title">
            {project.title.toUpperCase()}_deck.pdf — {deck.title}
          </span>
          <span className="deck__count">
            {pad(index + 1)}/{pad(count)}
          </span>
        </div>

        <div className="deck__stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <img
            key={index}
            className={`deck__slide${loaded ? ' is-loaded' : ''}`}
            src={`${deck.dir}/${pad(index + 1)}.webp`}
            alt={`${project.title} deck — slide ${index + 1} of ${count}`}
            onLoad={() => setLoaded(true)}
            draggable={false}
          />
          {!loaded && <span className="deck__loading pixel">decrypting slide {pad(index + 1)}…</span>}
          <button className="deck__nav deck__nav--prev" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous slide">
            ‹
          </button>
          <button className="deck__nav deck__nav--next" onClick={() => go(index + 1)} disabled={index === count - 1} aria-label="Next slide">
            ›
          </button>
        </div>

        <div className="deck__foot">
          <ol ref={stripRef} className="deck__strip" data-lenis-prevent>
            {Array.from({ length: count }, (_, i) => (
              <li key={i}>
                <button
                  data-i={i}
                  className={i === index ? 'is-active' : ''}
                  onClick={() => go(i)}
                  aria-label={`Slide ${i + 1}`}
                  aria-current={i === index ? 'true' : undefined}
                >
                  <img src={`${deck.dir}/t${pad(i + 1)}.webp`} alt="" loading="lazy" draggable={false} />
                  <span>{pad(i + 1)}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="deck__actions">
            <span className="deck__keys label">← → to flip · esc to close</span>
            <a className="btn btn--solid deck__dl" href={deck.pdf} download>
              {project.id}_deck.pdf ↓
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
