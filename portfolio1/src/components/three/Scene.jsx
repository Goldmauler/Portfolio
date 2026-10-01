import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import World, { CameraRig } from './World';
import Robot, { getRobotLayout } from './Robot';
import DitherPass from './DitherPass';
import { initialQuality, prefersReducedMotion } from '../../lib/device';
import { on, subscribe, getState } from '../../lib/store';

function GlitchDriver({ glitchRef }) {
  useEffect(() => {
    const offGlitch = on('scene:glitch', (amount = 1) => {
      glitchRef.current = Math.max(glitchRef.current, amount);
    });
    // A short tear whenever the theme changes.
    let theme = getState().theme;
    const offTheme = subscribe(() => {
      const next = getState().theme;
      if (next !== theme) {
        theme = next;
        glitchRef.current = 0.8;
      }
    });
    return () => {
      offGlitch();
      offTheme();
    };
  }, [glitchRef]);

  useFrame((_, dt) => {
    if (glitchRef.current > 0) glitchRef.current = Math.max(0, glitchRef.current - Math.min(dt, 0.05) * 1.6);
  });
  return null;
}

function Contents({ quality, reducedMotion }) {
  const glitchRef = useRef(0);
  const { viewport, size } = useThree();
  const robot = getRobotLayout(viewport, size);
  return (
    <>
      <CameraRig reducedMotion={reducedMotion} />
      <World quality={quality} robot={robot} />
      <Robot glitchRef={glitchRef} reducedMotion={reducedMotion} />
      <GlitchDriver glitchRef={glitchRef} />
      <DitherPass glitchRef={glitchRef} />
    </>
  );
}

export default function Scene() {
  const quality = useMemo(() => initialQuality(), []);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        flat
        dpr={quality.dpr}
        frameloop={reducedMotion ? 'demand' : 'always'}
        eventSource={document.getElementById('root')}
        eventPrefix="client"
        camera={{ position: [0, 0, 9], fov: 42, near: 0.1, far: 120 }}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor('#000000', 1)}
      >
        <Contents quality={quality} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
