import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Camera descends this many world units per pixel of page scroll.
// Near objects therefore slide past faster than far ones: real parallax.
export const WORLD_PER_PX = 0.0055;

/* ------------------------------------------------------------------------ */
/* Halftone planets — lit spheres the dither pass turns into dot shading.   */
/* ------------------------------------------------------------------------ */

const PLANETS = [
  { p: [1.4, 1.6, -9], r: 3.1, followRobot: true },
  { p: [-12, -12.5, -12], r: 2.4 },
  { p: [13.5, -21, -15], r: 3.4 },
  { p: [-11.5, -31, -11], r: 2.2, ring: true },
  { p: [12.5, -41, -13], r: 2.8 },
  { p: [-13.5, -51, -15], r: 3.4 },
  { p: [11, -61, -11], r: 2.3 },
];

function Planets({ narrow, robot }) {
  const group = useRef();
  const assets = useMemo(
    () => ({
      sphere: new THREE.SphereGeometry(1, 64, 40),
      ring: new THREE.RingGeometry(1.45, 2.05, 96, 1),
      hero: new THREE.MeshStandardMaterial({ color: '#474c4a', roughness: 0.95, metalness: 0 }),
      // Planets further down sit behind body text, so they stay sparse.
      mat: new THREE.MeshStandardMaterial({ color: '#1e2221', roughness: 0.95, metalness: 0 }),
      ringMat: new THREE.MeshStandardMaterial({ color: '#2a2e2d', roughness: 1, side: THREE.DoubleSide }),
    }),
    [],
  );

  useEffect(() => () => Object.values(assets).forEach((a) => a.dispose()), [assets]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    group.current?.children.forEach((child, i) => {
      const base = PLANETS[i];
      const baseY = base.followRobot ? robot.y + (narrow ? 1.3 : 1.35) : base.p[1];
      child.position.y = baseY + Math.sin(t * 0.25 + i) * 0.35;
      child.rotation.y = t * 0.05 * (i % 2 ? 1 : -1);
    });
  });

  return (
    <group ref={group}>
      {PLANETS.map((pl, i) => {
        const x = pl.followRobot ? robot.x + (narrow ? 0.9 : pl.p[0]) : pl.p[0] * (narrow ? 0.5 : 1);
        const r = pl.followRobot && narrow ? pl.r * 0.75 : pl.r;
        return (
          <group key={i} position={[x, pl.p[1], pl.p[2]]} scale={r}>
            <mesh geometry={assets.sphere} material={pl.followRobot ? assets.hero : assets.mat} />
            {pl.ring && <mesh geometry={assets.ring} material={assets.ringMat} rotation={[1.2, 0.3, 0.2]} />}
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------------ */
/* Wireframe landmarks                                                      */
/* ------------------------------------------------------------------------ */

const LANDMARKS = [
  { geo: 'ico', p: [-7.4, -8, -5], s: 1.1 },
  { geo: 'oct', p: [7.6, -15, -6], s: 1.3 },
  { geo: 'box', p: [-7.6, -25, -7], s: 1.2 },
  { geo: 'knot', p: [7.4, -35, -6], s: 0.9 },
  { geo: 'ico', p: [-7.2, -45, -6], s: 1.4 },
  { geo: 'oct', p: [7, -56, -5], s: 1.1 },
];

function Landmarks({ narrow }) {
  const group = useRef();
  const assets = useMemo(() => {
    const edges = (geo) => new THREE.EdgesGeometry(geo, 1);
    return {
      ico: edges(new THREE.IcosahedronGeometry(1, 1)),
      oct: edges(new THREE.OctahedronGeometry(1.2, 0)),
      box: edges(new THREE.BoxGeometry(1.4, 1.4, 1.4, 2, 2, 2)),
      knot: new THREE.WireframeGeometry(new THREE.TorusKnotGeometry(0.9, 0.22, 64, 6)),
      mat: new THREE.LineBasicMaterial({ color: '#484848' }),
    };
  }, []);

  useEffect(() => () => Object.values(assets).forEach((a) => a.dispose()), [assets]);

  useFrame((state, dt) => {
    group.current?.children.forEach((child, i) => {
      child.rotation.x += dt * 0.12 * (i % 2 ? 1 : -1);
      child.rotation.y += dt * 0.18;
    });
  });

  return (
    <group ref={group}>
      {LANDMARKS.map((l, i) => (
        <lineSegments
          key={i}
          geometry={assets[l.geo]}
          material={assets.mat}
          position={[l.p[0] * (narrow ? 0.45 : 1), l.p[1], l.p[2]]}
          scale={l.s}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------------ */
/* Twinkling dust                                                           */
/* ------------------------------------------------------------------------ */

const dustVertex = /* glsl */ `
  uniform float uTime;
  attribute float aPhase;
  varying float vBright;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(22.0 / -mv.z, 1.0, 3.0);
    vBright = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (1.0 + aPhase * 2.0) + aPhase * 40.0));
  }
`;
const dustFragment = /* glsl */ `
  varying float vBright;
  void main() {
    gl_FragColor = vec4(vec3(vBright), 1.0);
  }
`;

function Dust({ count }) {
  const assets = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34;
      pos[i * 3 + 1] = 10 - Math.random() * 78;
      pos[i * 3 + 2] = -22 + Math.random() * 24;
      phase[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      uniforms: { uTime: { value: 0 } },
      depthWrite: false,
    });
    return { geo, mat };
  }, [count]);

  useEffect(() => () => Object.values(assets).forEach((a) => a.dispose()), [assets]);

  useFrame((state) => {
    assets.mat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <points geometry={assets.geo} material={assets.mat} frustumCulled={false} />;
}

/* ------------------------------------------------------------------------ */
/* Grid wall far behind everything                                          */
/* ------------------------------------------------------------------------ */

const gridVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const gridFragment = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  // Lines ~1.6 render-pixels wide so they survive the low-res dither without aliasing.
  float grid(vec2 p, float size) {
    vec2 g = abs(fract(p / size - 0.5) - 0.5) / (fwidth(p / size) * 1.6);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    float g = grid(vWorld.xy, 5.0);
    float sweep = smoothstep(0.9, 1.0, sin(vWorld.y * 0.12 + uTime * 0.6));
    gl_FragColor = vec4(vec3(g * (0.0075 + sweep * 0.03)), 1.0);
  }
`;

function GridWall() {
  const assets = useMemo(
    () => ({
      geo: new THREE.PlaneGeometry(260, 140),
      mat: new THREE.ShaderMaterial({
        vertexShader: gridVertex,
        fragmentShader: gridFragment,
        uniforms: { uTime: { value: 0 } },
        depthWrite: false,
      }),
    }),
    [],
  );
  useEffect(() => () => Object.values(assets).forEach((a) => a.dispose()), [assets]);
  useFrame((state) => {
    assets.mat.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return <mesh geometry={assets.geo} material={assets.mat} position={[0, -28, -34]} renderOrder={-1} />;
}

/* ------------------------------------------------------------------------ */
/* Camera rig: page scroll -> descent, pointer -> sway                      */
/* ------------------------------------------------------------------------ */

export function CameraRig({ reducedMotion }) {
  const sway = useRef({ x: 0, y: 0 });
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const cam = state.camera;
    const y = reducedMotion ? 0 : -window.scrollY * WORLD_PER_PX;
    const s = sway.current;
    if (!reducedMotion) {
      s.x = THREE.MathUtils.damp(s.x, state.pointer.x, 2.2, dt);
      s.y = THREE.MathUtils.damp(s.y, state.pointer.y, 2.2, dt);
    }
    cam.position.set(s.x * 0.5, y + s.y * 0.3, 9);
    cam.lookAt(s.x * 0.15, y, 0);
  });
  return null;
}

/* ------------------------------------------------------------------------ */

export default function World({ quality, robot }) {
  const { size, gl, scene, invalidate } = useThree();
  const narrow = size.width / size.height < 1;

  useEffect(() => {
    scene.fog = new THREE.Fog('#000000', 14, 46);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  // Cheap one-off environment map for metallic reflections on the robot.
  useEffect(() => {
    let cancelled = false;
    let env;
    import('three/examples/jsm/environments/RoomEnvironment.js').then(({ RoomEnvironment }) => {
      if (cancelled) return;
      const pmrem = new THREE.PMREMGenerator(gl);
      env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      scene.environmentIntensity = 0.45;
      pmrem.dispose();
      invalidate(); // on-demand (reduced-motion) rendering needs a nudge
    });
    return () => {
      cancelled = true;
      scene.environment = null;
      env?.dispose();
    };
  }, [gl, scene, invalidate]);

  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight position={[5, 6, 7]} intensity={2.6} />
      <pointLight position={[-4, 3, -3]} intensity={40} distance={30} decay={2} />
      <pointLight position={[5, -2, -2]} intensity={22} distance={30} decay={2} />
      <GridWall />
      <Planets narrow={narrow} robot={robot} />
      <Landmarks narrow={narrow} />
      <Dust count={quality.dust} />
    </>
  );
}
