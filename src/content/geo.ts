// Geografi Nagari: provinsi (kepulauan), kota/kabupaten, kecamatan, kelurahan/desa.
// Garis pantai dibuat dari kerangka tangan lalu dikasarkan secara fraktal (benih tetap,
// jadi bentuknya sama di setiap permainan). Nama kecamatan dan kelurahan dibangkitkan
// dari nama kota, jadi juga selalu sama.

export type Pt = [number, number]; // [x, z] di peta

export interface City {
  id: string;
  name: string;
  kind: 'kota' | 'kabupaten';
  capital?: boolean;
  p: Pt;
  /** penduduk, ribu jiwa */
  pop: number;
  /** selisih kesejahteraan dari rata-rata provinsi */
  bias: number;
}

export interface Kelurahan { name: string; pop: number }
export interface Kecamatan { name: string; pop: number; bias: number; units: Kelurahan[] }

export interface Province {
  id: string;
  name: string;
  bias: number;
  /** pulau-pulau; yang pertama pulau utama */
  islands: Pt[][];
  center: Pt;
  cities: City[];
  /** label satuan wilayah setempat */
  names: { pre: string[]; base: string[] };
  distrik?: boolean;
  nagari?: boolean;
}

function prng(seed: number) {
  let a = seed | 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h | 0;
}

/** Kasarkan garis pantai: tiap sisi dibelah dan titik tengahnya digeser tegak lurus. */
function roughen(pts: Pt[], amp: number, seed: number, depth = 4): Pt[] {
  const r = prng(seed);
  let cur = pts;
  for (let d = 0; d < depth; d++) {
    const next: Pt[] = [];
    for (let i = 0; i < cur.length; i++) {
      const a = cur[i], b = cur[(i + 1) % cur.length];
      const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz) || 1;
      const off = (r() * 2 - 1) * amp * len;
      next.push(a, [(a[0] + b[0]) / 2 - (dz / len) * off, (a[1] + b[1]) / 2 + (dx / len) * off]);
    }
    cur = next;
  }
  return cur;
}

export function inside(p: Pt, poly: Pt[]): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > p[1]) !== (zj > p[1]) && p[0] < ((xj - xi) * (p[1] - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}

/** Jarak titik ke garis pantai terdekat. */
export function coastDist(p: Pt, poly: Pt[]): number {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz));
  }
  return best;
}

export function area(poly: Pt[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; }
  return Math.abs(s) / 2;
}

const centroid = (poly: Pt[]): Pt => [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];

type RawCity = [name: string, kind: 'kota' | 'kabupaten', x: number, z: number, pop: number, capital?: boolean];
interface RawProv { id: string; name: string; bias: number; islands: { pts: Pt[]; amp: number }[]; cities: RawCity[]; pre: string[]; base: string[]; distrik?: boolean; nagari?: boolean }

/** Bulan sabit: busur luar lalu busur dalam (sudut dalam derajat, 90° = utara). */
function crescent(cx: number, cz: number, R: number, r: number, a0: number, a1: number, step = 20): Pt[] {
  const out: Pt[] = [], inn: Pt[] = [];
  for (let a = a0; a <= a1 + 0.01; a += step) {
    const t = (a * Math.PI) / 180;
    out.push([cx + Math.cos(t) * R, cz - Math.sin(t) * R]);
    inn.push([cx + Math.cos(t) * r, cz - Math.sin(t) * r]);
  }
  return [...out, ...inn.reverse()];
}
/** Pulau kecil berbentuk lonjong tak beraturan. */
function blob(cx: number, cz: number, rx: number, rz: number, seed: number, rot = 0, n = 9): Pt[] {
  const r = prng(seed);
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2, k = 0.78 + r() * 0.4;
    const x = Math.cos(t) * rx * k, z = Math.sin(t) * rz * k;
    return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)] as Pt;
  });
}

// Kepulauan Nagari: negeri rekaan, bukan peta negara mana pun.
const RAW: RawProv[] = [
  {
    id: 'wiramarta', name: 'Wiramarta', bias: -4,
    islands: [
      { amp: 0.17, pts: [[-9.5, -4.0], [-8.5, -4.5], [-7.2, -4.8], [-5.8, -4.9], [-4.4, -4.8], [-3.0, -4.6], [-1.8, -4.3], [-0.9, -3.9], [-0.5, -3.2], [-0.6, -2.5], [-1.1, -2.6], [-1.4, -3.2], [-2.2, -3.6], [-3.4, -3.85], [-4.6, -4.0], [-5.9, -4.05], [-7.2, -3.95], [-8.4, -3.6], [-9.3, -3.4]] },
      { amp: 0.12, pts: blob(-10.4, -4.3, 0.35, 0.22, 11, 0.4) },
    ],
    cities: [['Sangkar Bayu', 'kota', -5.8, -4.45, 1350, true], ['Tanjung Wiru', 'kabupaten', -8.6, -4.05, 620], ['Lembah Sunyi', 'kabupaten', -7.2, -4.37, 540], ['Karang Selaka', 'kota', -3.4, -4.25, 480], ['Ujung Rakit', 'kabupaten', -0.9, -3.0, 310], ['Pulau Gading', 'kabupaten', -10.4, -4.3, 90]],
    pre: ['Sungai', 'Tanjung', 'Muara', 'Teluk', 'Batu', 'Kuala', 'Lubuk', 'Padang', 'Bukit', 'Talang'],
    base: ['Rindang', 'Bayan', 'Ulin', 'Damar', 'Seberang', 'Hilir', 'Hulu', 'Pinang', 'Laut', 'Durian', 'Benuang', 'Meranti', 'Pasir', 'Bulan', 'Jelai', 'Kemuning', 'Ilalang', 'Lawas', 'Tinggi', 'Sirih'],
  },
  {
    id: 'bentala', name: 'Bentala', bias: -2, nagari: true,
    islands: [
      { amp: 0.17, pts: [[-10.2, -2.2], [-8.8, -2.6], [-7.4, -2.4], [-6.0, -2.0], [-4.9, -1.3], [-4.6, -0.4], [-5.4, 0.0], [-6.4, 0.1], [-6.7, 0.5], [-5.6, 0.9], [-4.7, 1.2], [-4.6, 2.0], [-5.3, 2.8], [-6.6, 3.2], [-8.0, 3.0], [-9.2, 2.4], [-10.1, 1.4], [-10.6, 0.2], [-10.6, -1.2]] },
    ],
    cities: [['Teluk Gemilang', 'kota', -7.3, 0.4, 1600, true], ['Padang Ranai', 'kabupaten', -9.0, -1.3, 760], ['Batu Rangkai', 'kota', -6.0, -1.2, 690], ['Gunung Sembilan', 'kabupaten', -8.4, -0.1, 430], ['Hulu Senja', 'kabupaten', -8.8, 1.7, 520], ['Pesisir Laras', 'kabupaten', -5.9, 2.2, 580]],
    pre: ['Koto', 'Lubuk', 'Batang', 'Pematang', 'Air', 'Bukit', 'Padang', 'Pasar', 'Simpang', 'Muaro', 'Kampung'],
    base: ['Tinggi', 'Baru', 'Alam', 'Gadang', 'Panjang', 'Kubang', 'Sirih', 'Durian', 'Kemuning', 'Rajo', 'Tuo', 'Pinang', 'Laweh', 'Saiyo', 'Batu', 'Jambu', 'Tabek', 'Manggis', 'Ranai', 'Senja'],
  },
  {
    id: 'kencana', name: 'Kencana', bias: 10,
    islands: [
      { amp: 0.15, pts: [[-3.4, 0.2], [-2.8, -0.4], [-1.9, -0.5], [-1.1, -0.1], [-0.9, 0.6], [-1.3, 1.3], [-2.1, 1.7], [-2.9, 1.6], [-3.5, 1.0]] },
      { amp: 0.12, pts: blob(-0.3, 1.7, 0.32, 0.22, 23, -0.3) },
    ],
    cities: [['Puri Kencana', 'kota', -2.6, 0.45, 10400, true], ['Merdika', 'kota', -1.55, 0.05, 2900], ['Sukaraya', 'kabupaten', -1.65, 1.1, 2100], ['Tanjung Kemala', 'kota', -2.95, 1.15, 1350], ['Gili Sari', 'kabupaten', -0.3, 1.7, 260]],
    pre: ['Ci-', 'Sido-', 'Wono-', 'Purwo-', 'Suka-', 'Karang', 'Tegal', 'Kebon', 'Sumber', 'Pasir', 'Kali', 'Mekar'],
    base: ['mulyo', 'rejo', 'harjo', 'asri', 'jaya', 'sari', 'makmur', 'wangi', 'agung', 'kerto', 'manis', 'luhur', 'tani', 'legi', 'dadi', 'raharja', 'ndaru', 'kembang', 'anyar', 'gede'],
  },
  {
    id: 'lintang', name: 'Lintang', bias: -5,
    islands: [{ amp: 0.1, pts: crescent(2.6, -0.4, 2.1, 1.0, -60, 240) }],
    cities: [['Lintang Raya', 'kota', 2.6, -1.95, 1250, true], ['Muara Bening', 'kota', 1.05, -0.4, 640], ['Bukit Sarang', 'kabupaten', 3.7, -1.5, 380], ['Kuala Seruni', 'kabupaten', 4.15, -0.4, 420], ['Ujung Kemuning', 'kabupaten', 1.5, 0.7, 350], ['Pantai Arum', 'kabupaten', 3.7, 0.7, 300]],
    pre: ['Bonto', 'Tana', 'Watan', 'Bulu', 'Lembang', 'Ujung', 'Tompo', 'Lalo', 'Ranta', 'Wawo'],
    base: ['Lempangan', 'Rannu', 'Soppa', 'Bulo', 'Tinggi', 'Kassi', 'Ballang', 'Sallo', 'Matoa', 'Langi', 'Batu', 'Raya', 'Bila', 'Mario', 'Lamba', 'Seruni', 'Arum', 'Bening', 'Sarang', 'Teduh'],
  },
  {
    id: 'saka', name: 'Kepulauan Saka', bias: -10,
    islands: [
      { amp: 0.12, pts: blob(0.0, 3.3, 0.85, 0.45, 31, 0.2, 10) },
      { amp: 0.12, pts: blob(-2.6, 3.4, 0.6, 0.36, 32, -0.4) },
      { amp: 0.12, pts: blob(-1.2, 4.25, 0.45, 0.3, 33, 0.6) },
      { amp: 0.12, pts: blob(1.45, 4.3, 0.5, 0.4, 34, -0.2) },
      { amp: 0.12, pts: blob(2.7, 3.05, 0.55, 0.35, 35, 0.5) },
      { amp: 0.12, pts: blob(3.9, 4.0, 0.75, 0.4, 36, -0.3, 10) },
      { amp: 0.1, pts: blob(0.3, 4.85, 0.25, 0.16, 37) },
    ],
    cities: [['Sakala', 'kota', 0.0, 3.3, 880, true], ['Labuan Teduh', 'kabupaten', -2.6, 3.4, 520], ['Pulau Mandi', 'kabupaten', -1.2, 4.25, 260], ['Wai Lumba', 'kabupaten', 1.45, 4.3, 330], ['Nusa Dapa', 'kabupaten', 2.7, 3.05, 380], ['Oe Lerang', 'kota', 3.9, 4.0, 410]],
    pre: ['Oe-', 'Wai-', 'Lewo-', 'Nai-', 'Labuan', 'Nusa', 'Kampung', 'Pantai', 'Bukit'],
    base: ['mataru', 'rinding', 'lamatu', 'kenari', 'bunga', 'tobi', 'lolong', 'nggela', 'sape', 'lerang', 'leba', 'pura', 'kolo', 'wona', 'sina', 'manu', 'tada', 'dapa', 'lumba', 'mandi'],
  },
  {
    id: 'arunika', name: 'Arunika', bias: -14, distrik: true,
    islands: [
      { amp: 0.17, pts: [[6.6, -3.8], [7.8, -4.3], [9.0, -4.0], [9.6, -3.0], [10.6, -2.6], [11.3, -1.6], [10.9, -0.8], [9.9, -0.6], [9.7, 0.2], [10.4, 1.0], [10.6, 2.2], [9.8, 3.3], [8.6, 3.6], [7.6, 3.0], [7.2, 2.0], [7.6, 1.0], [7.0, 0.2], [6.3, -0.6], [6.0, -1.8], [6.1, -2.9]] },
      { amp: 0.12, pts: blob(5.2, -3.6, 0.4, 0.26, 41, 0.5) },
    ],
    cities: [['Fajar Raya', 'kota', 6.9, -2.6, 560, true], ['Lembah Kabut', 'kabupaten', 8.3, -1.5, 410], ['Teluk Cendana', 'kabupaten', 10.3, -1.7, 260], ['Danau Biru', 'kabupaten', 8.4, 0.6, 300], ['Waraji', 'kota', 9.0, 2.4, 380], ['Kepulauan Sorai', 'kabupaten', 5.2, -3.6, 110]],
    pre: ['Wa-', 'Ka-', 'Ari-', 'Ma-', 'Yo-', 'Teluk', 'Lembah', 'Bukit', 'Sungai', 'Danau'],
    base: ['menda', 'rumi', 'fak', 'kopa', 'nire', 'bora', 'wesi', 'sapi', 'tobo', 'mamor', 'yaki', 'kimi', 'sena', 'dowa', 'beri', 'napi', 'kuri', 'oba', 'reme', 'tani'],
  },
];

/** Pastikan kota berada di darat dan tidak terlalu mepet pantai. */
function settle(p: Pt, islands: Pt[][]): Pt {
  let best = islands[0], bd = Infinity;
  for (const isl of islands) { const c = centroid(isl); const d = Math.hypot(c[0] - p[0], c[1] - p[1]); if (inside(p, isl)) { best = isl; bd = -1; break; } if (d < bd) { bd = d; best = isl; } }
  const c = centroid(best);
  let q: Pt = p;
  for (let i = 0; i < 30 && !(inside(q, best) && coastDist(q, best) > 0.12); i++) q = [q[0] + (c[0] - q[0]) * 0.12, q[1] + (c[1] - q[1]) * 0.12];
  return q;
}

export const PROVINCES: Province[] = RAW.map((rp, pi) => {
  const islands = rp.islands.map((isl, k) => roughen(isl.pts, isl.amp, 1009 + pi * 97 + k * 13));
  return {
    id: rp.id, name: rp.name, bias: rp.bias, islands, distrik: rp.distrik, nagari: rp.nagari,
    center: centroid(rp.islands[0].pts),
    names: { pre: rp.pre, base: rp.base },
    cities: rp.cities.map(([name, kind, x, z, pop, capital]) => ({
      id: `${rp.id}:${name}`, name, kind, capital, pop, p: settle([x, z], islands),
      bias: capital ? 6 : (((hash(name) >>> 0) % 13) - 6),
    })),
  };
});

export const findProv = (id?: string) => PROVINCES.find(p => p.id === id);
export const findCity = (id?: string) => PROVINCES.flatMap(p => p.cities).find(c => c.id === id);

export const cityLabel = (c: City) => `${c.kind === 'kota' ? 'Kota' : 'Kabupaten'} ${c.name}`;

/** Sebutan setempat untuk tiap tingkat wilayah. */
export function unitNames(pv: Province, c: City): { kec: string; kecs: string; kel: string; kels: string } {
  const kec = pv.distrik ? 'Distrik' : 'Kecamatan';
  const kel = c.kind === 'kota' ? 'Kelurahan' : pv.distrik ? 'Kampung' : pv.nagari ? 'Nagari' : 'Desa';
  return { kec, kecs: kec.toLowerCase(), kel, kels: kel.toLowerCase() };
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
function makeName(pv: Province, r: () => number): string {
  const pre = pv.names.pre[Math.floor(r() * pv.names.pre.length)];
  const base = pv.names.base[Math.floor(r() * pv.names.base.length)];
  if (pre.endsWith('-')) return pre.slice(0, -1) + base.toLowerCase();
  return `${pre} ${cap(base)}`;
}

const cache = new Map<string, Kecamatan[]>();
/** Kecamatan dan kelurahan/desa sebuah kota (deterministik). */
export function districts(c: City): Kecamatan[] {
  const hit = cache.get(c.id);
  if (hit) return hit;
  const pv = PROVINCES.find(p => p.cities.includes(c))!;
  const r = prng(hash(c.id));
  const used = new Set<string>([c.name]);
  const uniq = () => { for (let i = 0; i < 40; i++) { const n = makeName(pv, r); if (!used.has(n)) { used.add(n); return n; } } const n = `${makeName(pv, r)} ${used.size}`; used.add(n); return n; };
  const nk = c.kind === 'kota' ? 4 + Math.floor(r() * 4) + (c.pop > 3000 ? 4 : 0) : 6 + Math.floor(r() * 5);
  const w = Array.from({ length: nk }, () => 0.5 + r());
  const ws = w.reduce((a, b) => a + b, 0);
  const dirs: Kecamatan[] = w.map((wi, i) => {
    const name = i === 0 && c.kind === 'kota' ? `${c.name} Kota` : uniq();
    const pop = Math.max(8, Math.round((c.pop * wi) / ws));
    const nu = c.kind === 'kota' ? 4 + Math.floor(r() * 5) : 6 + Math.floor(r() * 7);
    const uw = Array.from({ length: nu }, () => 0.4 + r());
    const us = uw.reduce((a, b) => a + b, 0);
    return {
      name, pop, bias: Math.round((r() * 2 - 1) * 4),
      units: uw.map((x, k) => ({ name: k === 0 && i === 0 ? c.name : uniq(), pop: Math.max(1, +((pop * x) / us).toFixed(1)) })),
    };
  });
  cache.set(c.id, dirs);
  return dirs;
}

export const clamp100 = (v: number) => Math.max(0, Math.min(100, v));

export function provPop(pv: Province): number { return pv.cities.reduce((s, c) => s + c.pop, 0); }

/** Format ribu jiwa. */
export function jiwa(ribu: number): string {
  if (ribu >= 1000) return `${(ribu / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt jiwa`;
  if (ribu >= 1) return `${Math.round(ribu).toLocaleString('id-ID')} rb jiwa`;
  return `${Math.round(ribu * 1000).toLocaleString('id-ID')} jiwa`;
}
