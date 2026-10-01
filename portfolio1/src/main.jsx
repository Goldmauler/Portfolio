import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'lenis/dist/lenis.css';
import './styles/global.css';
import App from './App';
import { restoreTheme } from './lib/themes';
import { prefersReducedMotion } from './lib/device';
import { setState } from './lib/store';
import { getSagaStage } from './components/saga/sagaState';

restoreTheme();
if (getSagaStage() === 'return') {
  setState({ sagaReturn: true });
  try {
    window.history.scrollRestoration = 'manual';
  } catch {
    /* unsupported */
  }
  window.scrollTo(0, 0);
}
// Scroll-reveal start states only apply when we're going to animate them.
if (!prefersReducedMotion()) document.documentElement.classList.add('js-motion');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
