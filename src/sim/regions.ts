// Statistik kewilayahan berjenjang: kota/kabupaten → provinsi → nasional.
//
// Kota/kabupaten adalah unit yang disimulasikan dan menjadi sumber kebenaran. Provinsi adalah
// agregat kota-kotanya, dan angka nasional adalah agregat seluruh kota (rata-rata tertimbang
// penduduk, PDB dijumlah, pertumbuhan ditimbang PDB). Statistik yang memang nasional (inflasi,
// utang, korupsi, stabilitas, militer, kepuasan publik) hanya ada di tingkat nasional.
// Kecamatan dan kelurahan tidak disimulasikan; nilainya kota ± selisih tetap.
//
// Kode lama yang mengubah s.nation langsung (event, perang, kebijakan) tetap berlaku:
// reconcile() menganggap selisih antara s.nation dan agregat kota sebagai guncangan nasional,
// meneruskannya ke semua kota, lalu menghitung ulang angka nasional.
import type { GameState, NationKey } from './types';
import { PROVINCES, type City, type Province } from '../content/geo';
import { boundsOf } from './core';

export type RegKey = 'pdb' | 'pertumbuhan' | 'pengangguran' | 'kemiskinan' | 'pendidikan' | 'kesehatan' | 'kriminalitas' | 'infrastruktur' | 'lingkungan' | 'kebahagiaan';
export const REG_KEYS: RegKey[] = ['pdb', 'pertumbuhan', 'pengangguran', 'kemiskinan', 'pendidikan', 'kesehatan', 'kriminalitas', 'infrastruktur', 'lingkungan', 'kebahagiaan'];
export const isReg = (k: NationKey): k is RegKey => (REG_KEYS as string[]).includes(k);

export type RegStats = Record<RegKey, number>;
export interface CityState { pop: number; stats: RegStats }
export interface RegionState {
  cities: Record<string, CityState>;
  /** riwayat kuartalan agregat provinsi per statistik, dibulatkan (maks. 40 kuartal) */
  provHist: Record<string, Record<RegKey, number[]>>;
}

/** Riwayat provinsi dicatat per kuartal, 40 titik (10 tahun): cukup untuk grafik, ringan disalin. */
const HIST_MAX = 40;
export const HIST_EVERY = 3;
type Char = Partial<Record<RegKey, number>>;

/** Karakter provinsi: selisih target jangka panjang terhadap rumus nasional. */
const PROV_RAW: Record<string, Char> = {
  kencana: { pendidikan: 14, kesehatan: 10, infrastruktur: 18, kemiskinan: -5, pengangguran: -1, kriminalitas: 8, lingkungan: -14, kebahagiaan: 2, pertumbuhan: 0.6 },
  bentala: { pendidikan: 2, infrastruktur: 2, kemiskinan: -1, lingkungan: 2, pertumbuhan: 0.2 },
  wiramarta: { pendidikan: -2, infrastruktur: -4, kemiskinan: 2, lingkungan: 4, pertumbuhan: 0.3 },
  lintang: { pendidikan: -4, kesehatan: -4, infrastruktur: -6, kemiskinan: 3, kriminalitas: -3, lingkungan: 6 },
  saka: { pendidikan: -8, kesehatan: -8, infrastruktur: -12, kemiskinan: 8, pengangguran: 1.5, kriminalitas: -6, lingkungan: 10, kebahagiaan: 2 },
  arunika: { pendidikan: -14, kesehatan: -12, infrastruktur: -18, kemiskinan: 12, pengangguran: 2, kriminalitas: 4, lingkungan: 14, kebahagiaan: -6, pertumbuhan: 0.8 },
};
/** Karakter kota menurut jenisnya (lalu dinormalisasi di dalam provinsi). */
function cityRaw(c: City): Char {
  if (c.capital) return { pendidikan: 8, kesehatan: 6, infrastruktur: 10, kemiskinan: -3, pengangguran: 0.5, kriminalitas: 6, lingkungan: -8, pertumbuhan: 0.4 };
  if (c.kind === 'kota') return { pendidikan: 4, kesehatan: 3, infrastruktur: 5, kemiskinan: -1.5, pengangguran: 0.8, kriminalitas: 4, lingkungan: -5, pertumbuhan: 0.2 };
  return { pendidikan: -3, kesehatan: -2, infrastruktur: -4, kemiskinan: 2, pengangguran: -0.5, kriminalitas: -3, lingkungan: 5, kebahagiaan: 1 };
}
/** PDB per kapita relatif, untuk membagi PDB awal. */
const PER_CAPITA: Record<string, number> = { kencana: 1.8, bentala: 1.0, wiramarta: 0.9, lintang: 0.8, saka: 0.6, arunika: 0.95 };
const cityCap = (pv: Province, c: City) => PER_CAPITA[pv.id] * (c.capital ? 1.5 : c.kind === 'kota' ? 1.2 : 0.8);

const ALL: { pv: Province; c: City }[] = PROVINCES.flatMap(pv => pv.cities.map(c => ({ pv, c })));

/** Rata-rata tertimbang nol supaya agregat jangka panjang tetap sama dengan rumus di atasnya. */
function zeroMean(items: { w: number; ch: Char }[]): Char[] {
  const W = items.reduce((a, x) => a + x.w, 0);
  return items.map(x => {
    const o: Char = {};
    for (const k of REG_KEYS) {
      if (k === 'pdb') continue;
      const mean = items.reduce((a, y) => a + (y.ch[k] ?? 0) * y.w, 0) / W;
      o[k] = (x.ch[k] ?? 0) - mean;
    }
    return o;
  });
}
/** Karakter akhir tiap kota = karakter provinsi + karakter kota. */
export const CITY_CHAR: Record<string, Char> = (() => {
  const provPop = (pv: Province) => pv.cities.reduce((a, c) => a + c.pop, 0);
  const pz = zeroMean(PROVINCES.map(pv => ({ w: provPop(pv), ch: PROV_RAW[pv.id] })));
  const out: Record<string, Char> = {};
  PROVINCES.forEach((pv, i) => {
    const cz = zeroMean(pv.cities.map(c => ({ w: c.pop, ch: cityRaw(c) })));
    pv.cities.forEach((c, j) => {
      const o: Char = {};
      for (const k of REG_KEYS) if (k !== 'pdb') o[k] = (pz[i][k] ?? 0) + (cz[j][k] ?? 0);
      out[c.id] = o;
    });
  });
  return out;
})();

// Batas nasional berlaku per kota, kecuali PDB (PDB kota jauh lebih kecil dari batas bawah nasional).
const clampK = (k: NationKey, v: number) => { if (k === 'pdb') return Math.max(0.01, v); const [a, b] = boundsOf(k); return Math.max(a, Math.min(b, v)); };

/** Agregat sekumpulan kota. */
export function aggregateOf(units: CityState[]): RegStats {
  const W = units.reduce((a, u) => a + u.pop, 0);
  const pdb = units.reduce((a, u) => a + u.stats.pdb, 0);
  const out = { pdb } as RegStats;
  for (const k of REG_KEYS) {
    if (k === 'pdb') continue;
    out[k] = k === 'pertumbuhan'
      ? units.reduce((a, u) => a + u.stats[k] * u.stats.pdb, 0) / pdb
      : units.reduce((a, u) => a + u.stats[k] * u.pop, 0) / W;
  }
  return out;
}
const allUnits = (s: GameState) => ALL.map(x => s.regions!.cities[x.c.id]);
export const cityState = (s: GameState, cityId: string) => s.regions!.cities[cityId];
export function provState(s: GameState, provId: string): CityState {
  const pv = PROVINCES.find(p => p.id === provId)!;
  const units = pv.cities.map(c => s.regions!.cities[c.id]);
  return { pop: units.reduce((a, u) => a + u.pop, 0), stats: aggregateOf(units) };
}

/** Tulis agregat kota ke s.nation (tanpa meneruskan apa pun ke bawah). */
export function pullUp(s: GameState) {
  const a = aggregateOf(allUnits(s));
  for (const k of REG_KEYS) s.nation[k] = a[k];
}

function clampUnit(u: CityState) { for (const k of REG_KEYS) u.stats[k] = clampK(k, u.stats[k]); }

/** Buat statistik kota dari angka nasional (permainan baru atau simpanan lama). */
export function initRegions(s: GameState) {
  const n = s.nation;
  const cities: Record<string, CityState> = {};
  const capW = ALL.reduce((a, { pv, c }) => a + c.pop * cityCap(pv, c), 0);
  ALL.forEach(({ pv, c }, i) => {
    // variasi kecil per permainan, tanpa memakai rng supaya alur acak permainan tidak bergeser
    const j = (k: number) => ((((s.seed >>> ((i + k) % 24)) % 5) + 5) % 5 - 2) * 0.7;
    const stats = {} as RegStats;
    for (const k of REG_KEYS) {
      stats[k] = k === 'pdb' ? (n.pdb * c.pop * cityCap(pv, c)) / capW
        : n[k] + (CITY_CHAR[c.id][k] ?? 0) + j(k.length) * (k === 'pertumbuhan' || k === 'pengangguran' || k === 'kemiskinan' ? 0.25 : 1);
    }
    cities[c.id] = { pop: c.pop, stats };
  });
  s.regions = { cities, provHist: {} };
  // Samakan agregat dengan angka nasional awal.
  const a = aggregateOf(allUnits(s));
  for (const k of REG_KEYS) if (k !== 'pdb') for (const u of Object.values(cities)) u.stats[k] += n[k] - a[k];
  Object.values(cities).forEach(clampUnit);
  pullUp(s);
  recordRegions(s);
}

/**
 * Teruskan perubahan yang dibuat langsung ke s.nation ke semua kota, lalu hitung ulang
 * angka nasional dari kota.
 */
export function reconcile(s: GameState) {
  if (!s.regions) { initRegions(s); return; }
  const units = allUnits(s);
  const a = aggregateOf(units);
  for (const k of REG_KEYS) {
    const d = s.nation[k] - a[k];
    if (Math.abs(d) < 1e-9) continue;
    for (const u of units) { if (k === 'pdb') u.stats.pdb *= s.nation.pdb / a.pdb; else u.stats[k] += d; }
  }
  units.forEach(clampUnit);
  pullUp(s);
}

/**
 * Langkah bulanan kota. `target` adalah rumus target nasional yang dievaluasi dengan nilai
 * kota untuk statistik kewilayahan dan nilai nasional untuk sisanya.
 */
export function stepRegions(s: GameState, target: (v: Record<NationKey, number>) => Record<NationKey, number>, rate: Partial<Record<NationKey, number>>, common: Partial<Record<NationKey, number>>) {
  ALL.forEach(({ c }, ci) => {
    const u = s.regions!.cities[c.id];
    const T = target({ ...s.nation, ...u.stats });
    for (const k of REG_KEYS) {
      const r = rate[k];
      if (r === undefined) continue;
      u.stats[k] += (T[k] + (CITY_CHAR[c.id][k] ?? 0) - u.stats[k]) * r + (common[k] ?? 0) + localNoise(s, ci, k) * (k === 'pertumbuhan' ? 0.06 : 0.1);
    }
    u.stats.pdb *= 1 + u.stats.pertumbuhan / 1200;
    // Penduduk tumbuh sekitar 1%/tahun, lebih cepat di daerah miskin.
    u.pop *= 1 + (0.9 + (u.stats.kemiskinan - 10) * 0.03) / 1200;
    clampUnit(u);
  });
  pullUp(s);
}

/**
 * Noise khas kota dalam [-1, 1], diturunkan dari seed, bulan, kota, dan statistik. Sengaja tidak
 * memakai rng permainan supaya urutan kejadian acak lainnya tidak bergeser.
 */
function localNoise(s: GameState, ci: number, k: RegKey): number {
  let h = Math.imul(s.seed ^ 0x9e3779b9, 31) ^ Math.imul(s.turn + 1, 0x85ebca6b) ^ Math.imul(ci + 1, 0xc2b2ae35) ^ Math.imul(REG_KEYS.indexOf(k) + 7, 0x27d4eb2f);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d); h = Math.imul(h ^ (h >>> 12), 0x297a2d39); h ^= h >>> 15;
  return ((h >>> 0) / 4294967296) * 2 - 1;
}

/** Catat riwayat agregat provinsi (tiap kuartal). */
export function recordRegions(s: GameState) {
  if (s.turn % HIST_EVERY !== 0) return;
  for (const pv of PROVINCES) {
    const h = (s.regions!.provHist[pv.id] ??= Object.fromEntries(REG_KEYS.map(k => [k, []])) as unknown as Record<RegKey, number[]>);
    const st = provState(s, pv.id).stats;
    for (const k of REG_KEYS) {
      h[k].push(Math.round(st[k] * 100) / 100);
      if (h[k].length > HIST_MAX) h[k].shift();
    }
  }
}

/** Indeks kesejahteraan 0–100 (dipakai peta dan panel Wilayah). */
export function welfare(st: RegStats): number {
  const v = (st.kebahagiaan + st.pendidikan + st.kesehatan + st.infrastruktur + (100 - st.kriminalitas)) / 5 - (st.kemiskinan - 10) * 0.6;
  return Math.max(0, Math.min(100, v));
}
