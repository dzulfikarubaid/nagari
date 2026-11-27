// Panggung 3D. Model: paket CC0 Kenney (Mini Characters, City Kit Commercial/Suburban, Nature Kit),
// lihat public/models/LICENSE-kenney.txt. Istana dan peta dibuat prosedural.
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, useGLTF, useAnimations, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { GameState } from '../sim/types';
import { COUNTRIES } from '../content/data';
import { PROVINCES, inside, coastDist, area, districts, cityLabel, type Pt } from '../content/geo';
import { useStore } from '../store';
import { welfare, provState, cityState } from '../sim/regions';

export type SceneKind = 'desa' | 'kota' | 'metropolis' | 'istana' | 'peta' | 'dunia' | 'penjara';
type V3 = [number, number, number];

function prng(seed: number) {
  let a = seed | 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const M = ({ c, e }: { c: string; e?: string }) => <meshStandardMaterial color={c} flatShading emissive={e ?? '#000'} emissiveIntensity={e ? 0.6 : 0} />;

const CHARS_M = ['male-a', 'male-b', 'male-c', 'male-d', 'male-e', 'male-f', 'male-g'];
const CHARS_F = ['female-a', 'female-b', 'female-c', 'female-d', 'female-e', 'female-f'];
const charUrl = (id: string) => `/models/chars/character-${id}.glb`;
const HOUSES = 'abcdefgh'.split('').map(l => `/models/sub/building-type-${l}.glb`);
const SHOPS = 'abcdefghijklmn'.split('').map(l => `/models/city/building-${l}.glb`);
const TOWERS = 'abcde'.split('').map(l => `/models/city/building-skyscraper-${l}.glb`);
const nat = (n: string) => `/models/nature/${n}.glb`;
const TREES = ['tree_palmTall', 'tree_palmDetailedTall', 'tree_palmBend', 'tree_oak', 'tree_default', 'tree_detailed', 'tree_fat'].map(nat);

/** Model statis (boleh dipakai berkali-kali). */
function Model({ url, p = [0, 0, 0], r = 0, s = 1 }: { url: string; p?: V3; r?: number; s?: number }) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => {
    const o = scene.clone(true);
    o.traverse(x => { if ((x as THREE.Mesh).isMesh) { x.castShadow = true; x.receiveShadow = true; } });
    return o;
  }, [scene]);
  return <primitive object={obj} position={p} rotation={[0, r, 0]} scale={s} />;
}

/** Karakter beranimasi. */
function Person({ id, p, r = 0, s = 1.9, anim = 'idle', offset = 0 }: { id: string; p: V3; r?: number; s?: number; anim?: string; offset?: number }) {
  const { scene, animations } = useGLTF(charUrl(id));
  const obj = useMemo(() => {
    const o = cloneSkinned(scene);
    o.traverse(x => { if ((x as THREE.Mesh).isMesh) { x.castShadow = true; x.frustumCulled = false; } });
    return o;
  }, [scene]);
  const ref = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, ref);
  useEffect(() => {
    const a = actions[anim] ?? actions['idle'];
    if (!a) return;
    a.reset().fadeIn(0.3).play();
    a.time = offset;
    return () => { a.fadeOut(0.3); };
  }, [actions, anim, offset]);
  return <group ref={ref} position={p} rotation={[0, r, 0]} scale={s}><primitive object={obj} /></group>;
}

function Rig({ radius, height, speed = 0.05, target = [0, 1, 0] as V3 }: { radius: number; height: number; speed?: number; target?: V3 }) {
  const size = useThree(st => st.size);
  const look = useRef<THREE.Vector3 | null>(null);
  useFrame(({ camera, clock }) => {
    // Geser pandangan ke kiri supaya tokoh tidak tertutup panel kanan.
    const cam = camera as THREE.PerspectiveCamera;
    if (size.width > 900) cam.setViewOffset(size.width, size.height, size.width * 0.14, 0, size.width, size.height); else cam.clearViewOffset();
    const t = clock.elapsedTime * speed + 0.6;
    const tg = new THREE.Vector3(...target);
    if (!look.current) look.current = tg.clone();
    look.current.lerp(tg, 0.05);
    camera.position.lerp(new THREE.Vector3(look.current.x + Math.sin(t) * radius, height, look.current.z + Math.cos(t) * radius), 0.04);
    camera.lookAt(look.current);
  });
  return null;
}

function Ground({ r, c }: { r: number; c: string }) {
  return <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[r, 40]} /><meshStandardMaterial color={c} /></mesh>;
}

function Flag({ p, h = 3 }: { p: V3; h?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.25; });
  return (
    <group position={p}>
      <mesh position={[0, h / 2, 0]} castShadow><cylinderGeometry args={[0.03, 0.04, h, 6]} /><M c="#ddd" /></mesh>
      <group position={[0, h - 0.3, 0]}>
        <mesh ref={ref} position={[0.42, 0, 0]}><boxGeometry args={[0.84, 0.54, 0.02]} /><meshStandardMaterial color="#e8b84a" /></mesh>
      </group>
    </group>
  );
}

function playerModel(g: GameState): string {
  const c = g.char;
  if (!g.office && c.job === 'tentara') return 'soldier';
  if (!g.office && (c.job === 'buruh' || c.job === 'insinyur')) return 'worker';
  if (c.gender === 'P') return 'female-a';
  // Pejabat memakai jas.
  return g.office || c.job === 'pengacara' || c.job === 'pengusaha' || c.job === 'pns' ? 'male-d' : 'male-a';
}

function Player({ g, p, r = 0 }: { g: GameState; p: V3; r?: number }) {
  const anim = g.char.jail > 0 ? 'sit' : g.campaign ? 'emote-yes' : 'idle';
  return (
    <>
      {g.campaign && <mesh position={[p[0], p[1] + 0.12, p[2]]} castShadow><cylinderGeometry args={[0.75, 0.85, 0.24, 12]} /><M c="#8b1e1e" /></mesh>}
      <Person id={playerModel(g)} p={[p[0], p[1] + (g.campaign ? 0.24 : 0), p[2]]} r={r} s={2.2} anim={anim} />
    </>
  );
}

function Crowd({ n, seed, radius, z = 2.4 }: { n: number; seed: number; radius: number; z?: number }) {
  const items = useMemo(() => {
    const r = prng(seed);
    const all = [...CHARS_M, ...CHARS_F];
    return Array.from({ length: n }, () => {
      const a = r() * Math.PI * 1.3 - Math.PI * 0.65, d = 1.2 + r() * radius;
      return { id: all[Math.floor(r() * all.length)], p: [Math.sin(a) * d, 0, z + Math.cos(a) * d] as V3, r: Math.PI + a, o: r() * 2, cheer: r() < 0.3 };
    });
  }, [n, seed, radius, z]);
  return <>{items.map((it, i) => <Person key={i} id={it.id} p={it.p} r={it.r} s={1.7} offset={it.o} anim={it.cheer ? 'emote-yes' : 'idle'} />)}</>;
}

function Desa({ g }: { g: GameState }) {
  const things = useMemo(() => {
    const r = prng(g.seed);
    const trees = Array.from({ length: 46 }, () => { const a = r() * Math.PI * 2, d = 10.5 + r() * 7; return { p: [Math.cos(a) * d, 0, Math.sin(a) * d] as V3, s: 2.2 + r() * 1.6, url: TREES[Math.floor(r() * TREES.length)], r: r() * 6 }; });
    const near = Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2 + 0.5, d = 7 + r() * 1.5; return { p: [Math.cos(a) * d, 0, Math.sin(a) * d] as V3, s: 2 + r(), url: TREES[Math.floor(r() * 3)], r: r() * 6 }; });
    const houses = Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2 + r() * 0.3, d = 4.6 + r() * 1.2; return { p: [Math.cos(a) * d, 0, Math.sin(a) * d] as V3, r: -a - Math.PI / 2, url: HOUSES[Math.floor(r() * HOUSES.length)] }; });
    const crops: { p: V3; url: string }[] = [];
    for (const [cx, cz] of [[-7.5, 6.5], [8, -6], [7.5, 7]]) for (let x = 0; x < 5; x++) for (let z = 0; z < 4; z++) crops.push({ p: [cx + x * 0.7 - 1.4, 0, cz + z * 0.7 - 1], url: nat((x + z) % 2 ? 'crops_wheatStageB' : 'crops_cornStageC') });
    const villagers = Array.from({ length: 5 }, (_, i) => { const a = r() * 6.28, d = 2.4 + r() * 1.6; return { id: [...CHARS_M, ...CHARS_F][(g.seed + i * 3) % 13], p: [Math.cos(a) * d, 0, Math.sin(a) * d] as V3, r: r() * 6, o: r() * 2 }; });
    return { trees, near, houses, crops, villagers };
  }, [g.seed]);
  return (
    <>
      <Ground r={22} c="#6fae5a" />
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0.4]} receiveShadow><planeGeometry args={[1.5, 30]} /><meshStandardMaterial color="#c8ab7a" /></mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[2.6, 24]} /><meshStandardMaterial color="#c8ab7a" /></mesh>
      <mesh position={[-11, 2.6, -15]}><coneGeometry args={[7, 6.5, 6]} /><M c="#5d7f8c" /></mesh>
      <mesh position={[-2, 2, -18]}><coneGeometry args={[6, 5, 6]} /><M c="#6b8f9c" /></mesh>
      {things.houses.map((h, i) => <Model key={i} url={h.url} p={h.p} r={h.r} s={2.1} />)}
      {things.trees.map((t, i) => <Model key={i} url={t.url} p={t.p} s={t.s} r={t.r} />)}
      {things.near.map((t, i) => <Model key={i} url={t.url} p={t.p} s={t.s} r={t.r} />)}
      {things.crops.map((c, i) => <Model key={i} url={c.url} p={c.p} s={1.5} />)}
      <Model url={nat('rock_largeA')} p={[5.5, 0, 3.5]} s={1.6} />
      <Model url={nat('plant_bushLarge')} p={[-4, 0, 3.6]} s={2} />
      {g.office?.id === 'kades' && <Flag p={[1.6, 0, -1.2]} h={3} />}
      {!g.campaign && things.villagers.map((v, i) => <Person key={i} id={v.id} p={v.p} r={v.r} s={1.7} offset={v.o} />)}
      <Player g={g} p={[0, 0, 0.6]} />
      {g.campaign && <Crowd n={14} seed={g.seed + 3} radius={2.4} />}
      <Rig radius={13} height={8.5} target={[0, 0.6, 0]} />
    </>
  );
}

function Kota({ g, big }: { g: GameState; big?: boolean }) {
  const b = useMemo(() => {
    const r = prng(g.seed + (big ? 9 : 5));
    const out: { p: V3; url: string; r: number; s: number }[] = [];
    const n = big ? 5 : 3;
    const step = 3.1;
    for (let x = -n; x <= n; x++) for (let z = -n; z <= n; z++) {
      if (Math.abs(x) <= 1 && Math.abs(z) <= 1) continue;
      const dist = Math.hypot(x, z);
      const tower = big && dist < 3.6 && r() < 0.6;
      const url = tower ? TOWERS[Math.floor(r() * TOWERS.length)] : SHOPS[Math.floor(r() * SHOPS.length)];
      out.push({ p: [x * step, 0, z * step], url, r: Math.round(r() * 4) * Math.PI / 2, s: tower ? 2.1 : 2.3 });
    }
    const trees = Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return { p: [Math.cos(a) * 3.4, 0, Math.sin(a) * 3.4] as V3, url: TREES[i % 3] }; });
    const walkers = Array.from({ length: big ? 9 : 6 }, (_, i) => { const a = r() * 6.28, d = 1.6 + r() * 2.2; return { id: [...CHARS_M, ...CHARS_F][(g.seed + i * 5) % 13], p: [Math.cos(a) * d, 0, Math.sin(a) * d] as V3, r: r() * 6, o: r() * 2 }; });
    return { out, trees, walkers };
  }, [g.seed, big]);
  return (
    <>
      <Ground r={big ? 30 : 22} c="#8a9299" />
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[4.2, 28]} /><meshStandardMaterial color="#7fb56a" /></mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[1.8, 24]} /><meshStandardMaterial color="#d9cdb4" /></mesh>
      {b.out.map((x, i) => <Model key={i} url={x.url} p={x.p} r={x.r} s={x.s} />)}
      {b.trees.map((t, i) => <Model key={i} url={t.url} p={t.p} s={2.4} />)}
      <Flag p={[1.3, 0, -1.2]} h={3.4} />
      {!g.campaign && b.walkers.map((v, i) => <Person key={i} id={v.id} p={v.p} r={v.r} s={1.7} offset={v.o} />)}
      <Player g={g} p={[0, 0, 0.4]} />
      {g.campaign && <Crowd n={big ? 30 : 20} seed={g.seed + 4} radius={2.8} />}
      <Rig radius={big ? 14 : 12} height={big ? 11 : 9} target={[0, 0.8, 0]} />
    </>
  );
}

function Istana({ g }: { g: GameState }) {
  const unrest = g.nation.stabilitas < 35;
  const guards = [[-2.2, 2.2], [2.2, 2.2], [-2.2, 5], [2.2, 5]];
  return (
    <>
      <Ground r={26} c="#6aa85c" />
      <mesh position={[0, 0.012, 5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[3, 14]} /><meshStandardMaterial color="#e0d6c2" /></mesh>
      <mesh position={[0, 0.25, -2]} castShadow receiveShadow><boxGeometry args={[11, 0.5, 4.6]} /><meshStandardMaterial color="#ece7da" /></mesh>
      <mesh position={[0, 0.1, 0.9]} receiveShadow><boxGeometry args={[5, 0.2, 1.2]} /><meshStandardMaterial color="#e3ddcd" /></mesh>
      <mesh position={[0, 1.75, -2.6]} castShadow><boxGeometry args={[9.6, 2.5, 2.8]} /><meshStandardMaterial color="#faf7ef" /></mesh>
      {[-4.2, -3, -1.8, -0.6, 0.6, 1.8, 3, 4.2].map(x => (
        <group key={x} position={[x, 0.5, -0.7]}>
          <mesh position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[0.16, 0.19, 2.4, 12]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position={[0, 0.06, 0]}><boxGeometry args={[0.5, 0.12, 0.5]} /><meshStandardMaterial color="#e8e2d2" /></mesh>
          <mesh position={[0, 2.42, 0]}><boxGeometry args={[0.46, 0.12, 0.46]} /><meshStandardMaterial color="#e8e2d2" /></mesh>
        </group>
      ))}
      {[-3.6, -1.2, 1.2, 3.6].map(x => <mesh key={x} position={[x, 1.7, -1.19]}><boxGeometry args={[0.7, 1.3, 0.04]} /><meshStandardMaterial color="#39506b" /></mesh>)}
      <mesh position={[0, 1.35, -1.19]}><boxGeometry args={[1, 1.7, 0.05]} /><meshStandardMaterial color="#6b4a2b" /></mesh>
      <mesh position={[0, 3.15, -1.9]} castShadow><boxGeometry args={[10.4, 0.34, 4.2]} /><meshStandardMaterial color="#f1ecdf" /></mesh>
      <mesh position={[0, 3.75, -0.7]} rotation={[0, Math.PI / 6, 0]} scale={[1, 1, 0.35]}><coneGeometry args={[2.6, 0.9, 3]} /><meshStandardMaterial color="#faf7ef" /></mesh>
      <mesh position={[0, 3.3, -2.8]} castShadow><cylinderGeometry args={[1.5, 1.6, 0.7, 20]} /><meshStandardMaterial color="#f1ecdf" /></mesh>
      <mesh position={[0, 3.65, -2.8]} castShadow><sphereGeometry args={[1.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#d2a93f" metalness={0.5} roughness={0.35} /></mesh>
      <Flag p={[0, 0, 2.6]} h={5} />
      {[-7, -5, 5, 7].map(x => [1.5, 4.5, 7.5].map(z => <Model key={`${x}${z}`} url={TREES[(x + z + 20) % 2]} p={[x, 0, z]} s={3} />))}
      {[-9.5, 9.5].map(x => [-6, -3, 0].map(z => <Model key={`${x}${z}`} url={TREES[3 + ((z + 9) % 3)]} p={[x, 0, z]} s={3.2} />))}
      {[-3.4, 3.4].map(x => <Model key={x} url={nat('plant_bushLarge')} p={[x, 0, 1.4]} s={2.2} />)}
      {guards.map(([x, z], i) => <Person key={i} id="soldier" p={[x, 0, z]} r={x < 0 ? Math.PI / 2 : -Math.PI / 2} s={1.8} offset={i * 0.4} />)}
      <Player g={g} p={[0, 0.2, 1]} />
      {(g.campaign || unrest) && <Crowd n={unrest ? 40 : 28} seed={g.seed + 8} radius={3.6} z={5} />}
      {g.pres?.war && <mesh position={[0, 7, -12]}><sphereGeometry args={[2, 8, 6]} /><M c="#5a1a1a" e="#ff3b1f" /></mesh>}
      <Rig radius={15} height={7.5} target={[0, 1.4, 0]} />
    </>
  );
}

const heat = (v: number) => new THREE.Color().setHSL(Math.max(0, Math.min(0.36, ((v - 25) / 50) * 0.36)), 0.6, 0.45).getStyle();
/** Warna daratan: makin sejahtera makin hijau subur, makin miskin makin kering. */
const landColor = (v: number) => new THREE.Color().setHSL(0.1 + Math.max(0, Math.min(1, (v - 20) / 50)) * 0.2, 0.48, 0.33).getStyle();

const LAND_Y = 0.05, LAND_D = 0.16, LAND_TOP = LAND_Y + LAND_D + 0.02;

function extrude(poly: Pt[], depth: number, bevel: number, thick = bevel * 0.6) {
  const shape = new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(x, -z)));
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: thick, bevelSize: bevel, bevelSegments: 1, curveSegments: 1, steps: 1 });
}

interface Terrain {
  geo: { shallow: THREE.BufferGeometry; beach: THREE.BufferGeometry; land: THREE.BufferGeometry }[][];
  mountains: { p: Pt; r: number; h: number; c: string }[];
  forest: THREE.Matrix4[];
}
let TERRAIN: Terrain | null = null;
/** Bentuk pulau, gunung, dan hutan tidak bergantung pada permainan: dibuat sekali saja. */
function terrain(): Terrain {
  if (TERRAIN) return TERRAIN;
  const mountains: Terrain['mountains'] = [];
  const forest: THREE.Matrix4[] = [];
  const dummy = new THREE.Object3D();
  PROVINCES.forEach((pv, pi) => {
    const r = prng(777 + pi * 31);
    const cities = pv.cities.map(c => c.p);
    const far = (p: Pt, pts: Pt[], d: number) => pts.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > d);
    for (const isl of pv.islands) {
      const xs = isl.map(p => p[0]), zs = isl.map(p => p[1]);
      const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
      const a = area(isl);
      const rnd = (): Pt => [x0 + r() * (x1 - x0), z0 + r() * (z1 - z0)];
      const mine: Pt[] = [];
      const wantM = Math.min(16, Math.round(a * 1.1));
      for (let k = 0; k < 400 && mine.length < wantM; k++) {
        const p = rnd();
        if (!inside(p, isl) || coastDist(p, isl) < 0.28 || !far(p, cities, 0.5) || !far(p, mine, 0.38)) continue;
        mine.push(p);
        const h = 0.18 + r() * 0.32 + (pv.distrik ? 0.15 : 0);
        mountains.push({ p, r: 0.16 + r() * 0.14, h, c: ['#6d8b5e', '#7d9468', '#6a7f62'][Math.floor(r() * 3)] });
      }
      const wantF = Math.round(a * 9);
      for (let k = 0, n = 0; k < wantF * 6 && n < wantF; k++) {
        const p = rnd();
        if (!inside(p, isl) || coastDist(p, isl) < 0.1 || !far(p, cities, 0.32) || !far(p, mine, 0.3)) continue;
        n++;
        const s = 0.6 + r() * 0.7;
        dummy.position.set(p[0], LAND_TOP + 0.07 * s, p[1]);
        dummy.scale.set(s, s, s);
        dummy.rotation.set(0, r() * 6, 0);
        dummy.updateMatrix();
        forest.push(dummy.matrix.clone());
      }
    }
  });
  const geo = PROVINCES.map(pv => pv.islands.map(isl => ({
    shallow: extrude(isl, 0.004, 0.3, 0.002),
    beach: extrude(isl, 0.07, 0.07, 0.03),
    land: extrude(isl, LAND_D, 0.02, 0.02),
  })));
  TERRAIN = { geo, mountains, forest };
  return TERRAIN;
}

function Forest({ mats }: { mats: THREE.Matrix4[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    mats.forEach((x, i) => m.setMatrixAt(i, x));
    m.instanceMatrix.needsUpdate = true;
  }, [mats]);
  return <instancedMesh ref={ref} args={[undefined, undefined, mats.length]} castShadow><coneGeometry args={[0.06, 0.15, 5]} /><meshStandardMaterial color="#2f6b3a" flatShading /></instancedMesh>;
}

const pointer = (on: boolean) => () => { document.body.style.cursor = on ? 'pointer' : ''; };

function CityMark({ c, v, showLabel, selected, onPick }: { c: (typeof PROVINCES)[number]['cities'][number]; v: number; showLabel: boolean; selected: boolean; onPick: () => void }) {
  const items = useMemo(() => {
    const r = prng(c.name.length * 131 + c.pop);
    const offs: [number, number][] = c.capital ? [[0, 0], [0.13, 0.07], [-0.12, 0.08], [0.02, -0.13]] : c.kind === 'kota' ? [[0, 0], [0.12, 0.06], [-0.1, 0.07]] : [[0, 0], [0.11, 0.05]];
    return offs.map(([x, z], i) => {
      const pool = c.capital && i < 2 ? TOWERS : c.kind === 'kota' ? SHOPS : HOUSES;
      return { p: [c.p[0] + x, LAND_TOP, c.p[1] + z] as V3, url: pool[Math.floor(r() * pool.length)], r: Math.floor(r() * 4) * Math.PI / 2 };
    });
  }, [c]);
  return (
    <group>
      <mesh position={[c.p[0], LAND_TOP + 0.005, c.p[1]]} receiveShadow><cylinderGeometry args={[c.capital ? 0.26 : 0.2, c.capital ? 0.26 : 0.2, 0.012, 18]} /><meshStandardMaterial color={selected ? '#f2cf74' : '#cfc8b8'} /></mesh>
      {c.capital && <mesh position={[c.p[0], LAND_TOP + 0.012, c.p[1]]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.27, 0.31, 24]} /><meshStandardMaterial color="#e8b84a" side={THREE.DoubleSide} /></mesh>}
      {items.map((it, i) => <Model key={i} url={it.url} p={it.p} r={it.r} s={c.capital && i < 2 ? 0.19 : 0.21} />)}
      <mesh position={[c.p[0], LAND_TOP + 0.15, c.p[1]]} visible={false} onClick={e => { e.stopPropagation(); onPick(); }} onPointerOver={pointer(true)} onPointerOut={pointer(false)}><sphereGeometry args={[0.3, 8, 6]} /></mesh>
      {showLabel && <Html zIndexRange={[1, 0]} center position={[c.p[0], LAND_TOP + 0.75, c.p[1]]} className={`map-label city ${selected ? 'me' : ''}`}><b>{c.capital ? '★ ' : ''}{cityLabel(c)}</b><span>kesejahteraan {Math.round(v)} · {districts(c).length} kec.</span></Html>}
    </group>
  );
}

function PetaNegara({ g }: { g: GameState }) {
  const sel = useStore(s => s.mapSel);
  const setSel = useStore(s => s.setMapSel);
  const T = useMemo(terrain, []);
  const selProv = PROVINCES.find(p => p.id === sel[0]);
  const selCity = selProv?.cities.find(c => c.id === sel[1]);
  useEffect(() => () => { document.body.style.cursor = ''; }, []);

  let cam: { radius: number; height: number; target: V3 } = { radius: 19, height: 25, target: [0.4, 0, 0.6] };
  if (selCity) cam = { radius: 4.2, height: 4.6, target: [selCity.p[0], 0, selCity.p[1]] };
  else if (selProv) {
    const cs = selProv.cities;
    const cx = cs.reduce((s, c) => s + c.p[0], 0) / cs.length, cz = cs.reduce((s, c) => s + c.p[1], 0) / cs.length;
    const spread = Math.max(...cs.map(c => Math.hypot(c.p[0] - cx, c.p[1] - cz)));
    cam = { radius: 5 + spread * 1.9, height: 6.5 + spread * 2.2, target: [cx, 0, cz] };
  }

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={() => setSel([])}><planeGeometry args={[90, 90]} /><meshStandardMaterial color="#1f6aa0" roughness={0.3} /></mesh>
      {PROVINCES.map((pv, i) => {
        const v = g.regions ? welfare(provState(g, pv.id).stats) : 50;
              const col = landColor(v);
        return (
          <group key={pv.id}>
            {T.geo[i].map((gm, k) => (
              <group key={k}>
                <mesh geometry={gm.shallow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}><meshStandardMaterial color="#4f9ccc" transparent opacity={0.55} /></mesh>
                <mesh geometry={gm.beach} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow><meshStandardMaterial color="#e6d6a2" flatShading /></mesh>
                <mesh geometry={gm.land} rotation={[-Math.PI / 2, 0, 0]} position={[0, LAND_Y, 0]} receiveShadow castShadow
                  onClick={e => { e.stopPropagation(); if (sel[0] !== pv.id || sel.length > 1) setSel([pv.id]); }} onPointerOver={pointer(true)} onPointerOut={pointer(false)}>
                  <meshStandardMaterial color={col} flatShading emissive={selProv === pv ? '#14100a' : '#000000'} />
                </mesh>
              </group>
            ))}
            {pv.cities.map(c => (
              <CityMark key={c.id} c={c} v={g.regions ? welfare(cityState(g, c.id).stats) : v} showLabel={selProv === pv} selected={selCity === c} onPick={() => setSel([pv.id, c.id])} />
            ))}
            {!selProv && <Html zIndexRange={[1, 0]} center position={[pv.center[0], 1.4, pv.center[1]]} className="map-label"><b>{pv.name}</b><span>kesejahteraan {Math.round(v)}</span></Html>}
          </group>
        );
      })}
      {T.mountains.map((m, i) => <mesh key={i} position={[m.p[0], LAND_TOP + m.h / 2 - 0.02, m.p[1]]} rotation={[0, i, 0]} castShadow receiveShadow><coneGeometry args={[m.r, m.h, 6]} /><meshStandardMaterial color={m.c} flatShading /></mesh>)}
      <Forest mats={T.forest} />
      <Rig radius={cam.radius} height={cam.height} speed={0.02} target={cam.target} />
    </>
  );
}

function PetaDunia({ g }: { g: GameState }) {
  const p = g.pres!;
  const pulse = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { if (pulse.current) (pulse.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.elapsedTime * 6) * 0.5; });
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[90, 90]} /><meshStandardMaterial color="#17486e" roughness={0.3} /></mesh>
      <group>
        {[[-1.4, 0.3, 1.5], [0.4, -0.5, 1.7], [1.8, 0.6, 1.1]].map(([x, z, r], i) => <mesh key={i} position={[x, 0.2, z]} rotation={[0, i, 0]} castShadow><cylinderGeometry args={[r * 0.88, r, 0.4, 9]} /><meshStandardMaterial color="#e8b84a" flatShading /></mesh>)}
        <Flag p={[0.3, 0.4, 0]} h={1.8} />
        <Html zIndexRange={[1, 0]} center position={[0, 2.6, 0]} className="map-label me"><b>NAGARI</b><span>militer {Math.round(g.nation.militer)}</span></Html>
      </group>
      {p.countries.map(cs => {
        const base = COUNTRIES.find(c => c.id === cs.id)!;
        const pos: [number, number] = [base.pos[0] * 1.6, base.pos[1] * 1.6];
        const war = p.war?.enemy === cs.id;
        const size = 0.9 + cs.power / 60;
        return (
          <group key={cs.id} position={[pos[0], 0, pos[1]]}>
            <mesh position={[0, 0.2, 0]} castShadow><cylinderGeometry args={[size * 0.88, size, 0.4, 8]} /><meshStandardMaterial color={base.color} flatShading /></mesh>
            <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[size * 0.3, size * 0.45, 0.25 + cs.power / 60, 6]} /><meshStandardMaterial color={heat(cs.rel / 2 + 50)} flatShading /></mesh>
            {war && <mesh ref={pulse} position={[-pos[0] / 2, 0.5, -pos[1] / 2]} rotation={[0, Math.atan2(pos[0], pos[1]), 0]}><boxGeometry args={[0.18, 0.18, Math.hypot(pos[0], pos[1]) - 2]} /><M c="#7a1010" e="#ff2a1a" /></mesh>}
            <Html zIndexRange={[1, 0]} center position={[0, 1.6 + cs.power / 60, 0]} className={`map-label ${war ? 'war' : ''}`}><b>{base.name}</b><span>{war ? 'PERANG' : `hubungan ${Math.round(cs.rel)}`}{cs.aliansi ? ' · sekutu' : ''}{cs.dagang ? ' · dagang' : ''}</span></Html>
          </group>
        );
      })}
      <Rig radius={20} height={27} speed={0.015} target={[2, 0, -1]} />
    </>
  );
}

function Penjara({ g }: { g: GameState }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#5d6166" /></mesh>
      <mesh position={[0, 1.5, -1.6]} receiveShadow><boxGeometry args={[5, 3, 0.3]} /><meshStandardMaterial color="#70747a" /></mesh>
      <mesh position={[-2.5, 1.5, 0]}><boxGeometry args={[0.3, 3, 3.4]} /><meshStandardMaterial color="#666a70" /></mesh>
      <mesh position={[2.5, 1.5, 0]}><boxGeometry args={[0.3, 3, 3.4]} /><meshStandardMaterial color="#666a70" /></mesh>
      <mesh position={[-1.2, 0.3, -1]} castShadow><boxGeometry args={[2, 0.3, 0.9]} /><meshStandardMaterial color="#8a8f96" /></mesh>
      {Array.from({ length: 11 }, (_, i) => <mesh key={i} position={[-2.2 + i * 0.44, 1.5, 1.6]}><cylinderGeometry args={[0.05, 0.05, 3, 8]} /><meshStandardMaterial color="#2b2d30" metalness={0.6} /></mesh>)}
      <Player g={g} p={[0.6, 0, -0.2]} />
      <Rig radius={7.5} height={2.8} speed={0.03} />
    </>
  );
}

export function sceneKind(g: GameState | null, tab: string): SceneKind {
  if (!g) return 'desa';
  if (g.char.jail > 0) return 'penjara';
  if (g.pres) return tab === 'diplomasi' ? 'dunia' : tab === 'negara' ? 'peta' : 'istana';
  if (tab === 'negara') return 'peta';
  if (g.office?.id === 'gubernur' || g.campaign?.office === 'presiden' || g.campaign?.office === 'gubernur') return 'metropolis';
  if (g.office?.id === 'bupati' || g.campaign?.office === 'bupati') return 'kota';
  if (g.office?.id === 'kades' || g.campaign?.office === 'kades') return 'desa';
  // Selebihnya: pemandangan mengikuti tempat tinggal.
  const city = g.char.home?.city ?? 'desa';
  if (city === 'desa') return 'desa';
  if (city === 'kabupaten' || city === 'provinsi' || city === 'pelajar') return 'kota';
  return 'metropolis';
}

const SKY: Record<SceneKind, string> = { desa: '#a8dcf0', kota: '#b4d0e4', metropolis: '#a3bdd6', istana: '#b9dcf0', peta: '#0f2f4a', dunia: '#0b2238', penjara: '#2a2c30' };

function Intro() {
  return (
    <>
      <Ground r={20} c="#6fae5a" />
      {HOUSES.slice(0, 4).map((u, i) => <Model key={u} url={u} p={[Math.cos(i * 1.6) * 4, 0, Math.sin(i * 1.6) * 4]} r={-i * 1.6 - Math.PI / 2} s={2.1} />)}
      {TREES.map((u, i) => <Model key={u} url={u} p={[Math.cos(i) * 8, 0, Math.sin(i) * 8]} s={3} />)}
      <Person id="male-a" p={[-0.5, 0, 0]} s={2.2} /><Person id="female-a" p={[0.6, 0, 0.2]} s={2.2} offset={1} />
      <Rig radius={9} height={4} />
    </>
  );
}

export function Scene({ g, tab }: { g: GameState | null; tab: string }) {
  const kind = sceneKind(g, tab);
  const map = kind === 'peta' || kind === 'dunia';
  return (
    <Canvas className="scene" shadows camera={{ position: [8, 5, 8], fov: 42 }} dpr={[1, 1.75]}>
      <color attach="background" args={[SKY[kind]]} />
      <fog attach="fog" args={[SKY[kind], map ? 40 : 22, map ? 90 : 52]} />
      <ambientLight intensity={0.9} />
      <hemisphereLight args={['#ffffff', '#6b8a5a', 0.7]} />
      <directionalLight position={[8, 14, 6]} intensity={2.1} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-bias={-0.0004} />
      <Suspense fallback={null}>
        {!g && <Intro />}
        {g && kind === 'desa' && <Desa g={g} />}
        {g && kind === 'kota' && <Kota g={g} />}
        {g && kind === 'metropolis' && <Kota g={g} big />}
        {g && kind === 'istana' && <Istana g={g} />}
        {g && kind === 'peta' && <PetaNegara g={g} />}
        {g && kind === 'dunia' && g.pres && <PetaDunia g={g} />}
        {g && kind === 'penjara' && <Penjara g={g} />}
        {!map && <ContactShadows position={[0, 0.015, 0]} opacity={0.25} scale={30} blur={2.4} far={6} />}
      </Suspense>
    </Canvas>
  );
}

[...HOUSES, ...SHOPS, ...TOWERS, ...TREES].forEach(u => useGLTF.preload(u));
