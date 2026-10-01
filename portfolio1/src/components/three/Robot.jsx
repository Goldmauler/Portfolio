import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { on, robotAnchor, robotHandAnchor, robotSay, getState, emit } from '../../lib/store';
import { unlock } from '../../lib/secrets';

const { damp, clamp } = THREE.MathUtils;

export const QUIPS = [
  'Beep. I am VH-01, Vimal’s build bot.',
  'I run on coffee.exe and TFLite Micro.',
  'Vimal hit 95.37% accuracy on a chip smaller than my ear.',
  'Scroll down. There is a whole OS with games in it.',
  'Stop poking me. …okay, one more.',
  'Hint: the terminal knows `sudo hire-vimal`.',
  'I have seen his commit history. Respect.',
  'My antenna picks up good vibes and 2.4 GHz.',
  'Hire Vimal and I come free with the package.',
  'ERROR 418: I am a teapot. Kidding. Mostly.',
];

const ACTION_CYCLE = ['wave', 'spin', 'happy', 'glitch', 'dance', 'nod'];
const ACTION_LENGTH = { wave: 2.2, dance: 3.2, spin: 1.2, glitch: 1.1, happy: 2.2, nod: 1.4, angry: 2 };

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Robot placement for the current viewport: right of the headline on wide screens, above it on tall ones. */
export function getRobotLayout(viewport, size) {
  if (size.width / size.height >= 1) {
    return {
      x: clamp(viewport.width * 0.2, 1.4, 3.6),
      y: 0.25,
      s: clamp(viewport.height / 7.4, 0.55, 1.02),
    };
  }
  // Portrait: the robot owns the top half of the hero (see Hero.css).
  return { x: 0, y: viewport.height * 0.25, s: clamp(viewport.width / 5.4, 0.4, 0.58) };
}

const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

const beamVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const beamFragment = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float fade = pow(1.0 - vUv.y, 1.6);
    float scan = 0.75 + 0.25 * sin(vUv.y * 70.0 - uTime * 5.0);
    gl_FragColor = vec4(vec3(0.42 * fade * scan), 1.0);
  }
`;

function useRobotAssets() {
  return useMemo(() => {
    const g = {
      torso: new RoundedBoxGeometry(1.75, 1.2, 1.05, 4, 0.32),
      chest: new RoundedBoxGeometry(0.9, 0.62, 0.1, 2, 0.05),
      coreRing: new THREE.TorusGeometry(0.2, 0.045, 10, 40),
      coreDisc: new THREE.CircleGeometry(0.12, 24),
      led: new THREE.BoxGeometry(0.075, 0.04, 0.02),
      shoulder: new THREE.SphereGeometry(0.25, 24, 16),
      neck: new THREE.CylinderGeometry(0.17, 0.21, 0.22, 16),
      thruster: new THREE.CylinderGeometry(0.36, 0.22, 0.3, 24),
      flame: new THREE.ConeGeometry(0.2, 0.75, 16, 1, true),
      skull: new RoundedBoxGeometry(1.56, 1.16, 1.2, 4, 0.3),
      visor: new RoundedBoxGeometry(1.3, 0.66, 0.14, 3, 0.07),
      eye: new THREE.ShapeGeometry(roundedRectShape(0.24, 0.32, 0.09), 6),
      mouth: new THREE.BoxGeometry(0.045, 0.05, 0.012),
      ear: new THREE.CylinderGeometry(0.2, 0.2, 0.14, 24),
      earRing: new THREE.TorusGeometry(0.13, 0.03, 8, 32),
      antenna: new THREE.CylinderGeometry(0.022, 0.022, 0.42, 8),
      tip: new THREE.SphereGeometry(0.075, 16, 12),
      stripe: new RoundedBoxGeometry(0.08, 0.04, 0.95, 1, 0.015),
      palm: new RoundedBoxGeometry(0.36, 0.4, 0.18, 2, 0.07),
      finger: new RoundedBoxGeometry(0.085, 0.2, 0.12, 2, 0.04),
      thumb: new RoundedBoxGeometry(0.08, 0.18, 0.12, 2, 0.035),
      cuff: new THREE.TorusGeometry(0.15, 0.035, 8, 24),
      base: new THREE.CylinderGeometry(1.15, 1.3, 0.16, 48),
      baseRing: new THREE.TorusGeometry(1.02, 0.03, 8, 72),
      spinner: new THREE.TorusGeometry(0.84, 0.025, 6, 48, Math.PI * 1.3),
      beam: new THREE.CylinderGeometry(1.25, 0.95, 2.3, 32, 1, true),
      orbit: new THREE.TorusGeometry(2.25, 0.016, 6, 140),
      hit: new THREE.BoxGeometry(2.9, 4.4, 1.8),
    };
    const m = {
      body: new THREE.MeshStandardMaterial({ color: '#8f9b96', metalness: 0.55, roughness: 0.36, envMapIntensity: 0.8 }),
      bodyLight: new THREE.MeshStandardMaterial({ color: '#b5c0bb', metalness: 0.4, roughness: 0.42 }),
      dark: new THREE.MeshStandardMaterial({ color: '#15191a', metalness: 0.7, roughness: 0.25, envMapIntensity: 0.6 }),
      glow: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      mid: new THREE.MeshBasicMaterial({ color: '#8a8a8a' }),
      outline: new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.BackSide }),
      beam: new THREE.ShaderMaterial({
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      hidden: new THREE.MeshBasicMaterial({ visible: false }),
    };
    return { g, m };
  }, []);
}

function Hand({ g, m, side, handRef }) {
  // side: 1 = right, -1 = left. Mirroring by scale keeps the thumb inward.
  return (
    <group ref={handRef} position={[1.32 * side, -0.9, 0.12]} scale={[side, 1, 1]}>
      <mesh geometry={g.palm} material={m.body} position={[0, 0.2, 0]} />
      <mesh geometry={g.palm} material={m.outline} position={[0, 0.2, 0]} scale={1.08} />
      {[-0.11, 0, 0.11].map((x) => (
        <mesh key={x} geometry={g.finger} material={m.body} position={[x, 0.47, 0]} />
      ))}
      <mesh geometry={g.thumb} material={m.body} position={[-0.21, 0.26, 0]} rotation={[0, 0, 0.7]} />
      <mesh geometry={g.cuff} material={m.glow} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

export default function Robot({ glitchRef, reducedMotion }) {
  const { g, m } = useRobotAssets();
  const { viewport, size, camera } = useThree();

  const root = useRef();
  const body = useRef();
  const head = useRef();
  const eyes = useRef();
  const eyeL = useRef();
  const eyeR = useRef();
  const mouth = useRef();
  const handL = useRef();
  const handR = useRef();
  const core = useRef();
  const tip = useRef();
  const flame = useRef();
  const spinner = useRef();
  const orbitA = useRef();
  const orbitB = useRef();
  const leds = useRef([]);

  const sim = useRef({
    appear: reducedMotion ? 1 : 0,
    action: null,
    actionStart: 0,
    talkUntil: 0,
    nextBlink: 2,
    blink: 0,
    lastPointer: new THREE.Vector2(9, 9),
    lastMove: -10,
    clicks: 0,
    hovered: false,
    greeted: false,
    eye: { sx: 1, sy: 1, rot: 0, y: 0 },
  });

  const tmp = useMemo(
    () => ({
      dir: new THREE.Vector3(),
      target: new THREE.Vector3(),
      headPos: new THREE.Vector3(),
      anchor: new THREE.Vector3(),
      hand: new THREE.Vector3(),
      handUp: new THREE.Vector3(),
    }),
    [],
  );

  const layout = useMemo(
    () => getRobotLayout(viewport, size),
    [viewport.width, viewport.height, size.width, size.height],
  );

  useEffect(() => {
    const startAction = (name) => {
      const s = sim.current;
      if (name === 'reset') {
        s.action = null;
        return;
      }
      if (!ACTION_LENGTH[name]) return;
      s.action = name;
      s.actionStart = performance.now() / 1000;
      if (name === 'glitch' && glitchRef) glitchRef.current = 1;
    };
    const offAction = on('robot:action', startAction);
    const offSay = on('robot:say', ({ text, ms }) => {
      sim.current.talkUntil = performance.now() / 1000 + Math.min(ms / 1000, 2.6) + text.length * 0.004;
    });
    return () => {
      offAction();
      offSay();
    };
  }, [glitchRef]);

  useEffect(
    () => () => {
      Object.values(g).forEach((x) => x.dispose());
      Object.values(m).forEach((x) => x.dispose());
      document.documentElement.classList.remove('cursor-robot');
    },
    [g, m],
  );

  const onClick = (e) => {
    const target = e.nativeEvent?.target;
    if (target?.closest?.('a, button, input, textarea, .win, [data-no-robot]')) return;
    e.stopPropagation();
    const s = sim.current;
    s.clicks += 1;
    if (s.clicks >= 5) unlock('robot');
    const action = ACTION_CYCLE[(s.clicks - 1) % ACTION_CYCLE.length];
    emit('robot:action', action);
    robotSay(QUIPS[(s.clicks - 1) % QUIPS.length]);
  };

  const onOver = () => {
    sim.current.hovered = true;
    document.documentElement.classList.add('cursor-robot');
  };
  const onOut = () => {
    sim.current.hovered = false;
    document.documentElement.classList.remove('cursor-robot');
  };

  useFrame((state, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const now = performance.now() / 1000;
    if (!root.current) return;

    // Skip the expensive bits once the robot is far out of view.
    const far = state.camera.position.y < -9;

    // Materialize after the boot screen.
    if (s.appear < 1 && getState().booted) {
      s.appear = Math.min(1, s.appear + dt / 1.3);
      if (s.appear >= 1 && !s.greeted) {
        s.greeted = true;
        // After a Time Stone rewind the saga script does the talking.
        if (!getState().sagaReturn) {
          s.action = 'wave';
          s.actionStart = now;
          robotSay('Hey! I’m VH-01. Click me — or scroll to jack in.', 4200);
        }
      }
    }
    const appearScale = s.appear <= 0 ? 0.0001 : easeOutBack(s.appear);
    root.current.visible = s.appear > 0 && !(s.appear < 0.45 && Math.random() < 0.35);

    const action = s.action;
    const at = action ? now - s.actionStart : 0;
    if (action && at > ACTION_LENGTH[action]) s.action = null;

    // Root placement, idle bob, action offsets.
    let bob = reducedMotion ? 0 : Math.sin(t * 1.3) * 0.08;
    let roll = 0;
    let spin = 0;
    let jitterX = 0;
    if (action === 'dance') {
      bob += Math.abs(Math.sin(at * 7)) * 0.25;
      roll = Math.sin(at * 7) * 0.12;
    } else if (action === 'spin') {
      spin = THREE.MathUtils.smootherstep(at / ACTION_LENGTH.spin, 0, 1) * Math.PI * 2;
    } else if (action === 'glitch') {
      jitterX = (Math.random() - 0.5) * 0.18;
    }
    root.current.position.set(layout.x + jitterX, layout.y + bob, 0);
    root.current.scale.setScalar(layout.s * appearScale);
    root.current.rotation.z = roll;

    if (far) {
      robotAnchor.visible = false;
      robotHandAnchor.visible = false;
      return;
    }

    // Where should the head look? Ray from the camera through the pointer,
    // intersected with a plane in front of the robot.
    const p = state.pointer;
    if (Math.abs(p.x - s.lastPointer.x) > 0.001 || Math.abs(p.y - s.lastPointer.y) > 0.001) {
      s.lastPointer.copy(p);
      s.lastMove = t;
    }
    let yaw;
    let pitch;
    if (t - s.lastMove < 3.5 && !reducedMotion) {
      tmp.dir.set(p.x, p.y, 0.5).unproject(state.camera).sub(state.camera.position).normalize();
      const k = (3.2 - state.camera.position.z) / tmp.dir.z;
      tmp.target.copy(state.camera.position).addScaledVector(tmp.dir, k);
      head.current.getWorldPosition(tmp.headPos);
      const dx = tmp.target.x - tmp.headPos.x;
      const dy = tmp.target.y - (tmp.headPos.y + 0.6 * layout.s);
      const dz = tmp.target.z - tmp.headPos.z;
      yaw = clamp(Math.atan2(dx, dz), -0.85, 0.85);
      pitch = clamp(-Math.atan2(dy, Math.hypot(dx, dz)), -0.45, 0.5);
    } else {
      yaw = reducedMotion ? -0.2 : Math.sin(t * 0.45) * 0.45 - 0.15;
      pitch = reducedMotion ? 0 : Math.sin(t * 0.7) * 0.08;
    }
    // Peek down at the page as the visitor starts scrolling.
    pitch += clamp(window.scrollY / window.innerHeight, 0, 1) * 0.35;
    if (action === 'nod') pitch += Math.sin(at * 11) * 0.22;

    body.current.rotation.y = damp(body.current.rotation.y, yaw * 0.32 + spin, action === 'spin' ? 30 : 4, dt);
    head.current.rotation.y = damp(head.current.rotation.y, yaw * 0.68, 6, dt);
    head.current.rotation.x = damp(head.current.rotation.x, pitch, 6, dt);
    head.current.rotation.z = damp(head.current.rotation.z, action === 'dance' ? Math.sin(at * 7) * 0.15 : 0, 8, dt);
    eyes.current.position.x = damp(eyes.current.position.x, yaw * 0.07, 8, dt);
    eyes.current.position.y = 0.7 + damp(eyes.current.position.y - 0.7, -pitch * 0.05, 8, dt);

    // Expressions.
    const happy = s.hovered || action === 'happy' || action === 'dance' || action === 'wave';
    const angry = action === 'glitch' || action === 'angry' || getState().godMode || getState().evil;
    const target = angry
      ? { sx: 1.05, sy: 0.55, rot: 0.42, y: -0.02 }
      : happy
        ? { sx: 1.15, sy: 0.38, rot: 0, y: 0.04 }
        : action === 'spin'
          ? { sx: 1.3, sy: 1.25, rot: 0, y: 0 }
          : { sx: 1, sy: 1, rot: 0, y: 0 };
    const e = s.eye;
    e.sx = damp(e.sx, target.sx, 12, dt);
    e.sy = damp(e.sy, target.sy, 12, dt);
    e.rot = damp(e.rot, target.rot, 12, dt);
    e.y = damp(e.y, target.y, 12, dt);

    if (t > s.nextBlink) {
      s.blink = 0.14;
      s.nextBlink = t + 2 + Math.random() * 3.5;
    }
    s.blink = Math.max(0, s.blink - dt);
    const blinkScale = s.blink > 0 ? 0.08 : 1;
    eyeL.current.scale.set(e.sx, e.sy * blinkScale, 1);
    eyeR.current.scale.set(e.sx, e.sy * blinkScale, 1);
    eyeL.current.rotation.z = -e.rot;
    eyeR.current.rotation.z = e.rot;
    eyeL.current.position.y = e.y;
    eyeR.current.position.y = e.y;

    // Mouth LEDs: equalizer while talking.
    const talking = now < s.talkUntil;
    mouth.current.children.forEach((bar, i) => {
      const h = talking ? 0.4 + Math.abs(Math.sin(t * 18 + i * 1.7)) * 2.2 : 0.6;
      bar.scale.y = damp(bar.scale.y, h, 20, dt);
    });

    // Hands: idle float, wave, dance.
    const hr = handR.current;
    const hl = handL.current;
    const gauntlet = getState().gauntlet;
    // With the Infinity Gauntlet on (a DOM sprite), the real hand is raised and hidden.
    hr.visible = !gauntlet;
    if (gauntlet) {
      hr.position.y = damp(hr.position.y, 0.15, 6, dt);
      hr.position.x = damp(hr.position.x, 1.55, 6, dt);
      hr.rotation.z = damp(hr.rotation.z, 0, 6, dt);
    } else if (action === 'wave') {
      const k = Math.min(1, at * 4) * Math.min(1, (ACTION_LENGTH.wave - at) * 4);
      hr.position.y = damp(hr.position.y, -0.9 + 1.15 * k, 10, dt);
      hr.position.x = damp(hr.position.x, 1.32 + 0.25 * k, 10, dt);
      hr.rotation.z = -0.25 * k + Math.sin(at * 12) * 0.45 * k;
    } else if (action === 'dance') {
      hr.position.y = -0.5 + Math.sin(at * 7) * 0.45;
      hl.position.y = -0.5 - Math.sin(at * 7) * 0.45;
      hr.rotation.z = Math.sin(at * 7) * 0.3;
      hl.rotation.z = -Math.sin(at * 7) * 0.3;
    } else {
      hr.position.y = damp(hr.position.y, -0.9 + Math.sin(t * 1.6 + 1) * 0.06, 6, dt);
      hr.position.x = damp(hr.position.x, 1.32, 6, dt);
      hr.rotation.z = damp(hr.rotation.z, Math.sin(t * 1.2) * 0.06, 6, dt);
    }
    if (action !== 'dance') {
      hl.position.y = damp(hl.position.y, -0.9 + Math.sin(t * 1.6) * 0.06, 6, dt);
      hl.rotation.z = damp(hl.rotation.z, -Math.sin(t * 1.2) * 0.06, 6, dt);
    }

    // Little lights.
    const pulse = 0.85 + Math.sin(t * 3) * 0.15;
    core.current.scale.setScalar(pulse);
    tip.current.scale.setScalar(0.8 + Math.abs(Math.sin(t * 2.2)) * 0.5);
    flame.current.scale.set(1, 0.75 + Math.random() * 0.45, 1);
    leds.current.forEach((led, i) => {
      if (led) led.visible = Math.sin(t * (2 + i) + i * 2) > -0.2;
    });
    spinner.current.rotation.z = t * 0.9;
    orbitA.current.rotation.z = t * 0.25;
    orbitB.current.rotation.z = -t * 0.18;
    m.beam.uniforms.uTime.value = t;

    // Screen anchor for the DOM speech bubble.
    tmp.anchor.set(0.75, 1.45, 0);
    head.current.localToWorld(tmp.anchor);
    tmp.anchor.project(state.camera);
    robotAnchor.x = (tmp.anchor.x * 0.5 + 0.5) * state.size.width;
    robotAnchor.y = (-tmp.anchor.y * 0.5 + 0.5) * state.size.height;
    robotAnchor.visible = s.appear >= 1 && robotAnchor.y > 40 && robotAnchor.y < state.size.height - 40;

    // Screen anchor for the gauntlet sprite: the wrist, plus pixels per robot unit.
    tmp.hand.set(0, 0, 0);
    hr.localToWorld(tmp.hand);
    tmp.handUp.set(0, 1, 0);
    hr.localToWorld(tmp.handUp);
    tmp.hand.project(state.camera);
    tmp.handUp.project(state.camera);
    const hx = (tmp.hand.x * 0.5 + 0.5) * state.size.width;
    const hy = (-tmp.hand.y * 0.5 + 0.5) * state.size.height;
    const ux = (tmp.handUp.x * 0.5 + 0.5) * state.size.width;
    const uy = (-tmp.handUp.y * 0.5 + 0.5) * state.size.height;
    robotHandAnchor.x = hx;
    robotHandAnchor.y = hy;
    robotHandAnchor.unit = Math.hypot(ux - hx, uy - hy);
    robotHandAnchor.visible = s.appear >= 1;
  });

  return (
    <group ref={root}>
      <mesh
        geometry={g.hit}
        material={m.hidden}
        position={[0, -0.6, 0]}
        onClick={onClick}
        onPointerOver={onOver}
        onPointerOut={onOut}
      />

      <group ref={body}>
        {/* Torso */}
        <mesh geometry={g.torso} material={m.body} position={[0, -1.0, 0]} />
        <mesh geometry={g.torso} material={m.outline} position={[0, -1.0, 0]} scale={1.035} />
        <mesh geometry={g.chest} material={m.dark} position={[0, -0.95, 0.5]} />
        <group position={[0, -0.95, 0.57]}>
          <mesh geometry={g.coreRing} material={m.glow} />
          <mesh ref={core} geometry={g.coreDisc} material={m.mid} position={[0, 0, 0.01]} />
        </group>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            ref={(el) => (leds.current[i] = el)}
            geometry={g.led}
            material={m.glow}
            position={[-0.3 + i * 0.3, -0.73, 0.56]}
          />
        ))}
        <mesh geometry={g.shoulder} material={m.bodyLight} position={[-0.98, -0.55, 0]} />
        <mesh geometry={g.shoulder} material={m.bodyLight} position={[0.98, -0.55, 0]} />
        <mesh geometry={g.neck} material={m.dark} position={[0, -0.36, 0]} />
        <mesh geometry={g.thruster} material={m.dark} position={[0, -1.73, 0]} />
        <mesh ref={flame} geometry={g.flame} material={m.glow} position={[0, -2.25, 0]} rotation={[Math.PI, 0, 0]} />

        {/* Head */}
        <group ref={head} position={[0, -0.32, 0]}>
          <mesh geometry={g.skull} material={m.body} position={[0, 0.62, 0]} />
          <mesh geometry={g.skull} material={m.outline} position={[0, 0.62, 0]} scale={1.035} />
          <mesh geometry={g.visor} material={m.dark} position={[0, 0.66, 0.55]} />
          <group ref={eyes} position={[0, 0.7, 0.63]}>
            <mesh ref={eyeL} geometry={g.eye} material={m.glow} position={[-0.28, 0, 0]} />
            <mesh ref={eyeR} geometry={g.eye} material={m.glow} position={[0.28, 0, 0]} />
          </group>
          <group ref={mouth} position={[0, 0.44, 0.63]}>
            {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
              <mesh key={i} geometry={g.mouth} material={m.mid} position={[i * 0.066, 0, 0]} />
            ))}
          </group>
          <mesh geometry={g.ear} material={m.dark} position={[-0.82, 0.62, 0]} rotation={[0, 0, Math.PI / 2]} />
          <mesh geometry={g.ear} material={m.dark} position={[0.82, 0.62, 0]} rotation={[0, 0, Math.PI / 2]} />
          <mesh geometry={g.earRing} material={m.glow} position={[-0.9, 0.62, 0]} rotation={[0, Math.PI / 2, 0]} />
          <mesh geometry={g.earRing} material={m.glow} position={[0.9, 0.62, 0]} rotation={[0, Math.PI / 2, 0]} />
          <mesh geometry={g.antenna} material={m.bodyLight} position={[0, 1.4, 0]} />
          <mesh ref={tip} geometry={g.tip} material={m.glow} position={[0, 1.64, 0]} />
          <mesh geometry={g.stripe} material={m.bodyLight} position={[0, 1.2, 0]} />
        </group>

        <Hand g={g} m={m} side={1} handRef={handR} />
        <Hand g={g} m={m} side={-1} handRef={handL} />
      </group>

      {/* Hologram projector */}
      <group position={[0, -3.1, 0]}>
        <mesh geometry={g.base} material={m.dark} />
        <mesh geometry={g.baseRing} material={m.glow} position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <mesh ref={spinner} geometry={g.spinner} material={m.mid} position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <mesh geometry={g.beam} material={m.beam} position={[0, 1.22, 0]} />
      </group>

      <mesh ref={orbitA} geometry={g.orbit} material={m.mid} position={[0, -0.6, 0]} rotation={[1.25, 0.2, 0]} />
      <mesh ref={orbitB} geometry={g.orbit} material={m.mid} position={[0, -0.6, 0]} rotation={[1.9, -0.35, 0]} scale={0.88} />
    </group>
  );
}
