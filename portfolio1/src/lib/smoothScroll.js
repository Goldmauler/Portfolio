import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './device';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

export function initSmoothScroll() {
  if (prefersReducedMotion()) return () => {};
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

const NAV_OFFSET = -64;

export function scrollToTarget(target, { immediate = false, offset = NAV_OFFSET } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (target !== 0 && !el) return;
  if (lenis) {
    lenis.scrollTo(target === 0 ? 0 : el, { offset: target === 0 ? 0 : offset, immediate, force: immediate, duration: 1.4 });
    return;
  }
  const top = target === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' });
}

export function lockScroll(locked) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.classList.toggle('scroll-locked', locked);
}
