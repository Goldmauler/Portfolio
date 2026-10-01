const mq = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches;

export const prefersReducedMotion = () => mq('(prefers-reduced-motion: reduce)');
export const hasFinePointer = () => mq('(hover: hover) and (pointer: fine)');
export const isSmallScreen = () => typeof window !== 'undefined' && window.innerWidth < 768;

export function getWebGLSupport() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Quality settings for the 3D scene. The scene is rendered at a fraction of
 * the device resolution and upscaled with `image-rendering: pixelated`, so
 * each rendered pixel becomes a crisp block of whole device pixels. That is
 * both the 1-bit look and the main performance trick.
 */
export function initialQuality() {
  const small = isSmallScreen();
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  const weak = cores <= 4 || memory <= 4;
  const deviceDpr = window.devicePixelRatio || 1;
  const block = Math.max(2, Math.round(deviceDpr * (small ? 1.25 : 1.5)));
  return {
    weak,
    small,
    dpr: deviceDpr / block,
    dust: weak || small ? 700 : 1500,
  };
}
