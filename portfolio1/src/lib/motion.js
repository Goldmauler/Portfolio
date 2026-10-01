import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { prefersReducedMotion } from './device';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);
// Mobile URL-bar show/hide shouldn't trigger full layout refreshes.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };

export const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#01ABCDEFX$%&';

/**
 * Page-wide scroll effects driven by data attributes:
 *  - [data-reveal]        fades/slides in once (values: up | left | right | scale)
 *  - [data-speed="0.7"]   scroll parallax; < 1 is slower than the page, > 1 faster
 * The parallax range is measured against the closest [data-parallax-root].
 */
export function initScrollFX() {
  if (prefersReducedMotion()) {
    document.documentElement.classList.remove('js-motion');
    return () => {};
  }

  const ctx = gsap.context(() => {
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: (els) =>
        gsap.to(els, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.07,
          overwrite: true,
        }),
    });

    gsap.utils.toArray('[data-speed]').forEach((el) => {
      const speed = parseFloat(el.dataset.speed);
      if (!Number.isFinite(speed) || speed === 1) return;
      const root = el.closest('[data-parallax-root]') || el.parentElement;
      const travel = () => (1 - speed) * (window.innerHeight + root.offsetHeight) * 0.5;
      gsap.fromTo(
        el,
        { y: () => -travel() },
        {
          y: () => travel(),
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  });

  return () => ctx.revert();
}

/** Animate a number into an element when it scrolls into view. */
export function countUp(el, { value, decimals = 0, prefix = '', suffix = '' }) {
  const format = (v) =>
    `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  if (prefersReducedMotion()) {
    el.textContent = format(value);
    return () => {};
  }
  el.textContent = format(0);
  const obj = { v: 0 };
  const tween = gsap.to(obj, {
    v: value,
    duration: 2,
    ease: 'expo.out',
    paused: true,
    onUpdate: () => {
      el.textContent = format(obj.v);
    },
  });
  const st = ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => tween.play() });
  return () => {
    st.kill();
    tween.kill();
  };
}

export const randomGlyphs = (len, chars = SCRAMBLE_CHARS) =>
  Array.from({ length: len }, (_, i) => (i % 7 === 3 ? ' ' : chars[(Math.random() * chars.length) | 0])).join('');
