import { useSyncExternalStore } from 'react';

// Tiny global store + event bus. Keeps the 3D scene, terminal, HUD and
// games in sync without pulling in a state library.

const listeners = new Set();

let state = {
  theme: 'phosphor',
  crt: true,
  matrix: false,
  booted: false,
  godMode: false,
  menuOpen: false,
  // Time Stone saga (see components/saga)
  sagaReturn: false,
  evil: false,
  gauntlet: null, // null | 'five' | 'full' | 'snap'
};

export const getState = () => state;

export function setState(patch) {
  const next = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Select a primitive slice of state. Selectors must not build new objects. */
export function useStore(selector) {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

const bus = new EventTarget();

export function emit(type, detail) {
  bus.dispatchEvent(new CustomEvent(type, { detail }));
}

export function on(type, handler) {
  const h = (e) => handler(e.detail);
  bus.addEventListener(type, h);
  return () => bus.removeEventListener(type, h);
}

export const toast = (message, kind = 'info') => emit('toast', { message, kind });

/** Ask the robot to do something: wave | dance | spin | glitch | happy | reset */
export const robotDo = (action) => emit('robot:action', action);

/** Make the robot say something in its speech bubble. */
export const robotSay = (text, ms = 3800) => emit('robot:say', { text, ms });

// Screen-space anchor of the robot head, written by the 3D scene every frame
// and read by the DOM speech bubble. Mutable on purpose: no re-renders.
export const robotAnchor = { x: 0, y: 0, visible: false };
// Screen-space wrist of the robot's right hand + pixels per robot unit.
export const robotHandAnchor = { x: 0, y: 0, unit: 60, visible: false };
// Screen position of the gauntlet's Time Stone socket (written by Gauntlet3D).
export const gauntletSocket = { x: 0, y: 0, ok: false };
