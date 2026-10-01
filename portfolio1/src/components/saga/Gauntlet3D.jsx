import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { makeGem, haloTexture, STONE_COLORS } from './gems';
import { gauntletSocket } from '../../lib/store';

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const easeOutBack = (x) => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2;
const easeIn = (x) => x * x * x;

// Finger layout on the back of the hand: x, phalanx lengths, radius.
const FINGERS = {
  index: { x: -0.31, lens: [0.29, 0.2, 0.16], r: 0.088 },
  middle: { x: -0.1, lens: [0.33, 0.23, 0.17], r: 0.092 },
  ring: { x: 0.11, lens: [0.31, 0.21, 0.16], r: 0.088 },
  pinky: { x: 0.31, lens: [0.23, 0.16, 0.13], r: 0.074 },
};

const STONE_POS = {
  space: [-0.31, 0.3, 0.17, 0.074],
  power: [-0.1, 0.31, 0.17, 0.078],
  reality: [0.11, 0.31, 0.17, 0.078],
  time: [0.31, 0.29, 0.17, 0.07],
  mind: [0, -0.07, 0.19, 0.125],
};

function buildGauntlet() {
  const disposables = [];
  const keep = (x) => {
    disposables.push(x);
    return x;
  };
  const gold = keep(
    new THREE.MeshPhysicalMaterial({
      color: '#e2ad4f',
      metalness: 1,
      roughness: 0.27,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.25,
    }),
  );
  const goldDark = keep(new THREE.MeshStandardMaterial({ color: '#7d4f16', metalness: 1, roughness: 0.42 }));
  const goldBright = keep(new THREE.MeshPhysicalMaterial({ color: '#ffd889', metalness: 1, roughness: 0.16, clearcoat: 1 }));

  const root = new THREE.Group();
  const add = (parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], scale) => {
    keep(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    if (scale) m.scale.set(...scale);
    parent.add(m);
    return m;
  };

  // Back of the hand: layered plates with a raised centre ridge.
  add(root, new RoundedBoxGeometry(0.98, 0.88, 0.24, 4, 0.1), goldDark, [0, 0, -0.03]);
  add(root, new RoundedBoxGeometry(0.92, 0.82, 0.3, 5, 0.12), gold);
  // raised diamond boss that seats the Mind Stone
  add(root, new THREE.CylinderGeometry(0.2, 0.24, 0.06, 4), goldDark, [0, -0.07, 0.15], [Math.PI / 2, Math.PI / 4, 0], [1, 1, 1.25]);
  // engraved ribs converging on the Mind Stone
  Object.values(FINGERS).forEach(({ x }) => {
    const len = Math.hypot(x, 0.3);
    add(root, new THREE.BoxGeometry(0.03, len, 0.03), goldDark, [x / 2, 0.12, 0.165], [0, 0, Math.atan2(x, 0.3)]);
  });
  add(root, new THREE.BoxGeometry(0.7, 0.03, 0.03), goldDark, [0, -0.33, 0.16]);

  // Wrist + cuff.
  add(root, new THREE.CylinderGeometry(0.44, 0.47, 0.14, 40), goldDark, [0, -0.47, 0], [0, 0, 0], [1, 1, 0.62]);
  add(root, new THREE.CylinderGeometry(0.5, 0.56, 0.5, 48), gold, [0, -0.78, 0], [0, 0, 0], [1, 1, 0.62]);
  [-0.56, -0.74, -0.98].forEach((y, i) => {
    add(root, new THREE.TorusGeometry(i === 2 ? 0.565 : 0.515, 0.028, 10, 56), goldBright, [0, y, 0], [Math.PI / 2, 0, 0], [1, 0.62, 1]);
  });

  // Fingers: proximal → middle → distal, each a pivot so they can curl.
  const joints = {};
  Object.entries(FINGERS).forEach(([name, { x, lens, r }]) => {
    add(root, new THREE.SphereGeometry(r * 1.18, 20, 14), goldDark, [x, 0.41, 0.01]);
    let parent = root;
    let y = 0.41;
    joints[name] = lens.map((L, i) => {
      const pivot = new THREE.Group();
      pivot.position.set(i === 0 ? x : 0, i === 0 ? y : lens[i - 1], i === 0 ? 0.01 : 0);
      parent.add(pivot);
      const rr = r * (1 - i * 0.07);
      add(pivot, new THREE.CapsuleGeometry(rr, L - rr, 6, 18), gold, [0, L / 2, 0], [0, 0, 0], i === 2 ? [0.92, 1, 0.92] : undefined);
      add(pivot, new THREE.TorusGeometry(rr * 1.04, 0.016, 6, 22), goldDark, [0, 0.015, 0], [Math.PI / 2, 0, 0]);
      parent = pivot;
      y = L;
      return pivot;
    });
  });

  // Thumb from the side of the hand.
  const thumbBase = new THREE.Group();
  thumbBase.position.set(-0.46, -0.06, 0.05);
  thumbBase.rotation.set(0, -0.35, 0.82);
  root.add(thumbBase);
  add(thumbBase, new THREE.SphereGeometry(0.12, 18, 14), goldDark);
  const t1 = new THREE.Group();
  thumbBase.add(t1);
  add(t1, new THREE.CapsuleGeometry(0.1, 0.16, 6, 18), gold, [0, 0.13, 0]);
  const t2 = new THREE.Group();
  t2.position.y = 0.26;
  t1.add(t2);
  add(t2, new THREE.CapsuleGeometry(0.092, 0.12, 6, 18), gold, [0, 0.1, 0], [0, 0, 0], [0.92, 1, 0.92]);
  add(t2, new THREE.TorusGeometry(0.096, 0.016, 6, 22), goldDark, [0, 0.012, 0], [Math.PI / 2, 0, 0]);
  joints.thumb = [t1, t2];

  // Stones: gem + gold bezel + additive halo.
  const halo = haloTexture();
  const stones = {};
  const placeStone = (id, parent, [x, y, z, r]) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    add(g, new THREE.TorusGeometry(r * 1.12, r * 0.2, 10, 36), goldBright, [0, 0, -r * 0.15], [0, 0, 0], [1, 1.1, 1]);
    add(g, new THREE.CircleGeometry(r * 1.05, 32), keep(new THREE.MeshBasicMaterial({ color: '#050302' })), [0, 0, -r * 0.4], [0, 0, 0], [1, 1.1, 1]);
    const gem = makeGem(STONE_COLORS[id]);
    gem.scale.multiplyScalar(r);
    g.add(gem);
    const sprite = new THREE.Sprite(
      keep(new THREE.SpriteMaterial({ map: halo, color: STONE_COLORS[id], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6 })),
    );
    sprite.scale.setScalar(r * 5);
    sprite.position.z = r * 0.9;
    g.add(sprite);
    stones[id] = { group: g, gem, sprite, r, base: gem.scale.clone() };
    disposables.push({ dispose: gem.userData.dispose });
  };
  Object.entries(STONE_POS).forEach(([id, p]) => placeStone(id, root, p));
  placeStone('soul', t1, [0, 0.12, 0.085, 0.05]);

  // Snap sparks.
  const SPARKS = 48;
  const sparkGeo = keep(new THREE.BufferGeometry());
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
  const sparkMat = keep(
    new THREE.PointsMaterial({ color: '#fff6d8', size: 0.05, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  root.add(sparks);
  const sparkVel = Array.from({ length: SPARKS }, () => new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 1.6, (Math.random() - 0.2) * 1.6));

  return {
    root,
    joints,
    stones,
    sparks,
    sparkVel,
    thumbZ: thumbBase.rotation.z,
    thumbBase,
    dispose: () => disposables.forEach((d) => d.dispose?.()),
  };
}

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    pmrem.dispose();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Hand({ mode }) {
  const g = useMemo(buildGauntlet, []);
  const state = useRef({ fullAt: -1, snapAt: -1, sparkAt: -1, last: mode });
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tipTmp = useMemo(() => new THREE.Vector3(), []);
  const { camera, gl } = useThree();

  useEffect(() => () => g.dispose(), [g]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const s = state.current;
    if (mode !== s.last) {
      if (mode === 'full') s.fullAt = t;
      if (mode === 'snap') s.snapAt = t;
      s.last = mode;
    }

    // Idle: a slow, heavy sway like a raised fist.
    g.root.rotation.set(-0.08 + Math.sin(t * 0.9) * 0.03, -0.2 + Math.sin(t * 0.7) * 0.1, 0.08 + Math.sin(t * 0.6) * 0.03);
    g.root.position.set(0.18, Math.sin(t * 1.2) * 0.03, 0);

    // Stones pulse; the Time Stone only exists once handed over.
    Object.entries(g.stones).forEach(([id, st], i) => {
      let k = 1;
      if (id === 'time') {
        k = mode === 'five' ? 0 : s.fullAt < 0 ? 1 : easeOutBack(clamp01((t - s.fullAt) / 0.7));
      }
      st.group.visible = k > 0.001;
      st.gem.scale.copy(st.base).multiplyScalar(Math.max(0.001, k));
      st.gem.rotation.y = Math.sin(t * 0.8 + i) * 0.25;
      const arrive = id === 'time' && s.fullAt > 0 ? Math.max(0, 1 - (t - s.fullAt) / 1.2) * 4 : 0;
      const flare = s.snapAt > 0 ? Math.max(0, 1 - Math.abs(t - s.snapAt - 0.18) / 0.5) * 3 : 0;
      const pulse = 0.85 + Math.sin(t * 2.6 + i * 1.7) * 0.15;
      st.sprite.scale.setScalar(st.r * 5 * (pulse + arrive + flare) * Math.max(0.001, k));
    });

    // The snap: thumb presses, middle finger slips and slams into the palm.
    const fingers = g.joints;
    if (s.snapAt > 0) {
      const p = (t - s.snapAt) / 0.42;
      const press = clamp01(p / 0.3);
      const slam = easeIn(clamp01((p - 0.3) / 0.35));
      const bends = [1.35, 1.15, 0.75];
      fingers.middle.forEach((j, i) => {
        j.rotation.x = -0.12 * press - bends[i] * slam;
      });
      fingers.thumb[0].rotation.z = -0.25 * press - 0.12 * slam;
      fingers.thumb[1].rotation.z = -0.2 * press;
      g.thumbBase.rotation.z = g.thumbZ - 0.25 * press;
      if (p > 0.42 && s.sparkAt < 0) {
        s.sparkAt = t;
        fingers.thumb[1].getWorldPosition(tipTmp);
        g.root.worldToLocal(tipTmp);
        const pos = g.sparks.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) pos.setXYZ(i, tipTmp.x + 0.12, tipTmp.y + 0.12, tipTmp.z + 0.05);
        pos.needsUpdate = true;
      }
    } else {
      // a slight, relaxed curl
      Object.entries(fingers).forEach(([name, js]) => {
        if (name === 'thumb') return;
        js.forEach((j, i) => {
          j.rotation.x = -0.06 * (i + 1) + Math.sin(t * 1.3 + i) * 0.015;
        });
      });
    }
    if (s.sparkAt > 0) {
      const age = t - s.sparkAt;
      const pos = g.sparks.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const v = g.sparkVel[i];
        pos.setXYZ(i, pos.getX(i) + v.x * 0.016, pos.getY(i) + v.y * 0.016, pos.getZ(i) + v.z * 0.016);
      }
      pos.needsUpdate = true;
      g.sparks.material.opacity = Math.max(0, 1 - age / 0.7);
    }

    // Where the Time Stone socket is on screen (the visitor's stone flies there).
    g.stones.time.group.getWorldPosition(tmp);
    tmp.project(camera);
    const rect = gl.domElement.getBoundingClientRect();
    gauntletSocket.x = rect.left + (tmp.x * 0.5 + 0.5) * rect.width;
    gauntletSocket.y = rect.top + (-tmp.y * 0.5 + 0.5) * rect.height;
    gauntletSocket.ok = true;
  });

  return <primitive object={g.root} />;
}

export default function Gauntlet3D({ mode }) {
  useEffect(
    () => () => {
      gauntletSocket.ok = false;
    },
    [],
  );
  return (
    <Canvas
      className="gauntlet3d"
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, position: [0, 0.12, 5], near: 0.1, far: 30 }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.15;
      }}
    >
      <Env />
      <ambientLight intensity={0.25} />
      <directionalLight position={[-2.5, 3, 4]} intensity={2.4} />
      <pointLight position={[2.2, 1.2, -2]} intensity={28} color="#ffb366" />
      <pointLight position={[0, -1.5, 3]} intensity={8} color="#ffe2b0" />
      <Hand mode={mode} />
    </Canvas>
  );
}
