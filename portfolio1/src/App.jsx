import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import BootScreen from './components/BootScreen';
import MenuBar from './components/MenuBar';
import Overlays from './components/Overlays';
import DeckViewer from './components/DeckViewer';
import Saga from './components/saga/Saga';
import Hero from './sections/Hero';
import About from './sections/About';
import Stack from './sections/Stack';
import Desktop from './sections/Desktop';
import Missions from './sections/Missions';
import Logs from './sections/Logs';
import Connect from './sections/Connect';
import Footer from './sections/Footer';
import { initSmoothScroll, scrollToTarget } from './lib/smoothScroll';
import { initScrollFX, ScrollTrigger } from './lib/motion';
import { getWebGLSupport } from './lib/device';
import { legacyRoutes } from './data/profile';

const loadScene = () => import('./components/three/Scene');
const Scene = lazy(loadScene);

export default function App() {
  const sceneReady = useRef(false);
  const [webgl] = useState(getWebGLSupport);

  // Fetch the 3D chunk right away; the boot screen waits (briefly) for it.
  useEffect(() => {
    if (!webgl) {
      sceneReady.current = true;
      return;
    }
    loadScene().then(() => {
      sceneReady.current = true;
    });
  }, [webgl]);

  // Lenis must exist before the boot screen's effect asks it to lock scrolling.
  useLayoutEffect(() => initSmoothScroll(), []);

  useEffect(() => {
    const stopFX = initScrollFX();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    let alive = true;
    document.fonts?.ready.then(() => alive && ScrollTrigger.refresh());

    // Deep links, including the old multi-page routes (/about, /projects …).
    const path = window.location.pathname.replace(/\/$/, '');
    const id = legacyRoutes[path] || window.location.hash.slice(1);
    if (id && document.getElementById(id)) {
      if (legacyRoutes[path]) window.history.replaceState(null, '', `/#${id}`);
      setTimeout(() => scrollToTarget(`#${id}`, { immediate: true }), 60);
    }

    return () => {
      alive = false;
      stopFX();
    };
  }, []);

  return (
    <div className="app">
      <a href="#about" className="skip-link">
        Skip to content
      </a>
      {webgl ? (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      ) : (
        <div className="scene-fallback" aria-hidden="true" />
      )}
      <MenuBar />
      <main className="main" id="main">
        <Hero />
        <About />
        <Stack />
        <Desktop />
        <Missions />
        <Logs />
        <Connect />
      </main>
      <Footer />
      <Overlays />
      <DeckViewer />
      <Saga />
      <BootScreen ready={sceneReady} />
    </div>
  );
}
