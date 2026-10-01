// Session flags that let the Time Stone saga survive a real page restart.

const STAGE = 'vh-saga';
const STONE = 'vh-timestone';

const get = (k) => {
  try {
    return sessionStorage.getItem(k);
  } catch {
    return null;
  }
};
const set = (k, v) => {
  try {
    if (v === null) sessionStorage.removeItem(k);
    else sessionStorage.setItem(k, v);
  } catch {
    /* storage unavailable */
  }
};

export const getSagaStage = () => get(STAGE);
export const setSagaStage = (v) => set(STAGE, v);
export const hasTimeStone = () => get(STONE) === '1';
export const setTimeStone = (v) => set(STONE, v ? '1' : null);

function reloadAtTop() {
  try {
    window.history.scrollRestoration = 'manual';
  } catch {
    /* unsupported */
  }
  window.history.replaceState(null, '', '/');
  window.scrollTo(0, 0);
  window.location.reload();
}

/** The Time Stone rewinds the visitor to a freshly booted page. */
export function restartTimeline() {
  setSagaStage('return');
  setTimeStone(true);
  set('vh-booted', null);
  reloadAtTop();
}

/** Reverse the snap: a clean, normal page load. */
export function undoSnap() {
  setSagaStage(null);
  setTimeStone(false);
  reloadAtTop();
}
