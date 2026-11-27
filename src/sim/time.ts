// Waktu seminggu (168 jam): yang terpakai untuk kewajiban, dan sisa yang bisa dibagi ke kegiatan.
import type { GameState } from './types';
import { age } from './core';
import { JOBS, PLAN_ACTIONS, type PlanAction } from '../content/data';
import { cityDef } from '../content/life';
import { planOk, childAge } from './personal';

export const WEEK = 168;
export const SLEEP_MIN = 4, SLEEP_MAX = 10;

/** Jam kerja normal per minggu tiap pekerjaan. */
export const JOB_HOURS: Record<string, number> = {
  buruh: 48, petani: 35, pedagang: 50, ojol: 45, koki: 50, atlet: 35, programmer: 45, data: 42, insinyur: 45, akuntan: 42, bankir: 48,
  konsultan: 60, pns: 37, tentara: 48, polisi: 48, pengacara: 50, jaksa: 42, diplomat: 45, dokter: 55, perawat: 45, apoteker: 40,
  psikolog: 35, guru: 38, dosen: 40, peneliti: 42, jurnalis: 48, desainer: 40, influencer: 35, musisi: 30, penulis: 30, pengusaha: 55,
  startup: 65, aktivis: 40, staf_partai: 45,
};
const OFFICE_HOURS: Record<string, number> = { kades: 40, bupati: 55, gubernur: 60, presiden: 70 };
const STUDY_HOURS: Record<string, number> = { S1: 30, S2: 30, S3: 40 };
/** Jam perjalanan per minggu menurut kota (macet ibu kota terasa). */
const COMMUTE: Record<string, number> = { desa: 2, kabupaten: 4, provinsi: 6, pelajar: 4, ibukota: 12, atlantika: 5, australis: 5, temasik: 4, tiongkara: 6 };

export interface Block { key: string; label: string; h: number }

/** Jam yang sudah terpakai sebelum kamu memilih apa-apa. */
export function fixedHours(s: GameState): Block[] {
  const c = s.char;
  const out: Block[] = [];
  out.push({ key: 'tidur', label: 'Tidur', h: c.sleep * 7 });
  out.push({ key: 'dasar', label: 'Makan, mandi, ibadah wajib', h: 21 });
  if (c.jail > 0) { out.push({ key: 'penjara', label: 'Di penjara', h: WEEK - c.sleep * 7 - 21 }); return out; }
  if (c.edu) out.push({ key: 'kuliah', label: c.edu.level === 'S3' ? 'Kuliah & disertasi' : 'Kuliah & tugas', h: STUDY_HOURS[c.edu.level] });
  if (c.job) out.push({ key: 'kerja', label: 'Kerja', h: JOB_HOURS[c.job] ?? 40 });
  if (s.office) out.push({ key: 'jabatan', label: 'Menjabat', h: OFFICE_HOURS[s.office.id] ?? 50 });
  if (s.campaign) out.push({ key: 'kampanye', label: 'Kampanye', h: 45 });
  const busy = !!(c.edu || c.job || s.office || s.campaign);
  out.push({ key: 'jalan', label: 'Perjalanan', h: busy ? COMMUTE[c.home.city] ?? 5 : 1 });
  const married = c.partner?.stage === 'menikah';
  if (c.home.housing !== 'ortu') out.push({ key: 'rumah', label: 'Masak, cuci, beres rumah', h: married ? 5 : 7 });
  const kids = c.children.reduce((a, k) => { const y = childAge(s, k.born); return a + (y < 6 ? 16 : y < 18 ? 6 : 0); }, 0);
  if (kids) out.push({ key: 'anak', label: 'Mengurus anak', h: Math.round(kids * (married ? 0.6 : 1)) });
  return out;
}

export const usedHours = (s: GameState) => fixedHours(s).reduce((a, b) => a + b.h, 0);
export const freeHours = (s: GameState) => Math.max(0, WEEK - usedHours(s));

/** Alasan kegiatan belum bisa dilakukan; null = bisa. */
export function activityBlock(s: GameState, a: PlanAction): string | null {
  const c = s.char;
  if (c.jail > 0) return 'Sedang dipenjara';
  if (!planOk(s, a.need)) {
    switch (a.need) {
      case 'job': return 'Butuh pekerjaan';
      case 'party': return 'Belum berpartai';
      case 'money': return 'Butuh uang';
      case 'research': return 'Mulai riset dulu (tab Studi)';
      case 'comp': return 'Daftar lomba dulu (tab Kegiatan)';
      case 'partner': return 'Belum punya pasangan';
      case 'family': return 'Belum berkeluarga';
      case 'org': return 'Belum ikut organisasi';
    }
  }
  const abroad = !!cityDef(c.home.city).abroad;
  switch (a.need) {
    case 'student': if (!c.edu) return 'Khusus mahasiswa'; break;
    case 'motor': if (c.home.city === 'desa') return 'Tidak ada pesanan di desa'; if (abroad) return 'Tidak bisa di luar negeri'; if (age(s) < 18) return 'Belum cukup umur'; break;
    case 'tutor': if (!(c.edu || c.degree)) return 'Butuh status mahasiswa atau sarjana'; if (c.attr.kecerdasan < 55) return 'Butuh kecerdasan 55'; break;
    case 'skill': {
      const m = c.edu?.major ?? c.major ?? '';
      if (!['informatika', 'seni', 'sastra', 'komunikasi', 'teknik'].includes(m) && !['programmer', 'desainer', 'penulis', 'jurnalis', 'data'].includes(c.job ?? '')) return 'Butuh keahlian: jurusan informatika/seni/sastra/komunikasi/teknik atau kerja kreatif';
      break;
    }
    case 'rantau': if (c.parents === 0) return 'Orang tua sudah tiada'; if (c.home.city === c.home.hometown) return 'Kamu tinggal di kampung halaman'; if (abroad) return 'Terlalu jauh dari luar negeri'; break;
  }
  return null;
}

/** Jam yang benar-benar dipakai bulan ini: kegiatan terkunci dibuang, dan kalau melebihi jam bebas, semua dikecilkan rata. */
export function effectiveTime(s: GameState): Record<string, number> {
  const out: Record<string, number> = {};
  let sum = 0;
  for (const a of PLAN_ACTIONS) {
    const h = Math.min(a.max, s.char.time[a.id] ?? 0);
    if (h <= 0 || activityBlock(s, a)) continue;
    out[a.id] = h; sum += h;
  }
  const free = freeHours(s);
  if (sum > free && sum > 0) for (const k of Object.keys(out)) out[k] *= free / sum;
  return out;
}

/** Satuan intensitas: 10 jam/minggu = 1. */
export function unitsOf(t: Record<string, number>): Record<string, number> {
  const u: Record<string, number> = {};
  for (const [k, h] of Object.entries(t)) u[k] = h / 10;
  return u;
}

export function setTime(s: GameState, time: Record<string, number>, sleep: number) {
  const t: Record<string, number> = {};
  for (const a of PLAN_ACTIONS) {
    const h = Math.round(time[a.id] ?? 0);
    if (h > 0) t[a.id] = Math.min(a.max, h);
  }
  s.char.time = t;
  s.char.sleep = Math.min(SLEEP_MAX, Math.max(SLEEP_MIN, Math.round(sleep * 2) / 2));
}

/** Rencana lama berbasis slot: tiap slot = 10 jam/minggu. */
export function setPlanSlots(s: GameState, plan: string[]) {
  const t: Record<string, number> = {};
  for (const id of plan.slice(0, 4)) if (PLAN_ACTIONS.some(a => a.id === id)) t[id] = (t[id] ?? 0) + 10;
  s.char.plan = plan.slice(0, 3);
  s.char.time = t;
}

/** Perkiraan hasil kerja sampingan per bulan untuk tampilan. */
export function sideIncome(s: GameState, id: string, hours: number): number {
  const a = PLAN_ACTIONS.find(x => x.id === id);
  if (!a?.rate) return 0;
  const pay = cityDef(s.char.home.city).pay;
  const skill = id === 'freelance' ? s.char.attr.kecerdasan / 60 : id === 'les' ? 0.8 + s.char.attr.kecerdasan / 250 : 1;
  return a.rate * hours * 4.3 * pay * skill;
}

export { JOBS };
