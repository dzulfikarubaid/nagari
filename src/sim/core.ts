// Util dasar + sistem konsekuensi: efek, syarat, jejak, jadwal.
import type { GameState, Fx, Cond, AttrKey, Level, NationKey, RegionKey, HistoryEntry, EndingId, Npc } from './types';

export const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

/** RNG ber-seed (mulberry32); state disimpan di GameState supaya deterministik. */
export function rand(s: GameState): number {
  s.rng = (s.rng + 0x6d2b79f5) | 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const range = (s: GameState, lo: number, hi: number) => lo + rand(s) * (hi - lo);
export const randInt = (s: GameState, lo: number, hi: number) => Math.floor(range(s, lo, hi + 1));
export function pick<T>(s: GameState, arr: T[]): T { return arr[Math.floor(rand(s) * arr.length)]; }

export const age = (s: GameState) => Math.floor(s.char.ageMonths / 12);
export const year = (s: GameState) => 2030 + Math.floor(s.turn / 12);
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const dateLabel = (s: GameState) => `${BULAN[s.turn % 12]} ${year(s)}`;

export const hasFlag = (s: GameState, f: string) => s.flags[f] !== undefined;
export function setFlag(s: GameState, f: string) { if (s.flags[f] === undefined) s.flags[f] = s.turn; }

export function addHistory(s: GameState, text: string, kind: HistoryEntry['kind'] = 'tonggak') {
  s.history.push({ turn: s.turn, age: age(s), text, kind });
}
export function log(s: GameState, text: string) {
  s.log.unshift(`${dateLabel(s)} — ${text}`);
  if (s.log.length > 60) s.log.length = 60;
}

export const friends = (s: GameState): Npc[] => s.npcs.filter(n => n.met && n.rel >= 40);
export const findNpc = (s: GameState, id?: string): Npc | undefined =>
  id ? (s.npcs.find(n => n.id === id) ?? s.pres?.pool.find(n => n.id === id)) : undefined;

const NATION_BOUNDS: Partial<Record<NationKey, [number, number]>> = {
  pdb: [100, 1e7], pertumbuhan: [-12, 12], inflasi: [-2, 60], pengangguran: [1, 40], kemiskinan: [1, 60], utang: [0, 250],
};
export const boundsOf = (k: NationKey): [number, number] => NATION_BOUNDS[k] ?? [0, 100];
export function clampNation(s: GameState) {
  for (const k of Object.keys(s.nation) as NationKey[]) {
    const b = NATION_BOUNDS[k] ?? [0, 100];
    s.nation[k] = clamp(s.nation[k], b[0], b[1]);
  }
}

/** Kenaikan atribut makin sulit di angka tinggi. */
export function gainAttr(s: GameState, k: AttrKey, v: number) {
  const cur = s.char.attr[k];
  const eff = v > 0 && k !== 'stres' ? v * Math.max(0.15, 1 - cur / 115) : v;
  s.char.attr[k] = clamp(cur + eff);
}
export function gainPop(s: GameState, k: Level, v: number) {
  const cur = s.char.pop[k];
  const eff = v > 0 ? v * Math.max(0.2, 1 - cur / 120) : v;
  s.char.pop[k] = clamp(cur + eff);
}

// Dipasang oleh endings.ts agar core tidak impor melingkar.
let finishHook: (s: GameState, id: EndingId) => void = () => {};
export function setFinishHook(fn: typeof finishHook) { finishHook = fn; }
export function finish(s: GameState, id: EndingId) { if (!s.ending) finishHook(s, id); }

export function sendToJail(s: GameState, months: number) {
  s.char.jail += months;
  setFlag(s, 'pernah_dipenjara');
  addHistory(s, `Masuk penjara ${months} bulan.`, 'akibat');
  // Presiden yang jadi terpidana langsung diberhentikan.
  if (s.pres) { finish(s, 'dimakzulkan'); return; }
  if (s.char.jail >= 96) { finish(s, 'penjara'); return; }
  if (s.office) { s.office = null; }
  s.campaign = null;
  s.char.job = null; s.char.jobLevel = 0; s.char.jobMonths = 0;
  s.char.edu = null;
  for (const l of Object.keys(s.char.pop) as Level[]) s.char.pop[l] *= 0.45;
  s.char.partyStanding *= 0.4;
}

/** Terapkan efek. scale dipakai untuk efek bulanan (aksi/kebiasaan) yang kecil. */
export function applyFx(s: GameState, fx: Fx | undefined, npcId?: string, soft = false) {
  if (!fx) return;
  const c = s.char;
  if (fx.attr) for (const [k, v] of Object.entries(fx.attr) as [AttrKey, number][]) {
    if (soft) gainAttr(s, k, v); else c.attr[k] = clamp(c.attr[k] + v);
  }
  if (fx.pop) for (const [k, v] of Object.entries(fx.pop) as [Level, number][]) {
    if (soft) gainPop(s, k, v); else c.pop[k] = clamp(c.pop[k] + v);
  }
  if (fx.money) c.money += fx.money;
  if (fx.nation) {
    for (const [k, v] of Object.entries(fx.nation) as [NationKey, number][]) s.nation[k] += v;
    clampNation(s);
  }
  if (fx.region && s.office && s.office.id !== 'presiden') {
    for (const [k, v] of Object.entries(fx.region) as [RegionKey, number][]) {
      s.office.region[k] = k === 'kas' ? s.office.region[k] + v : clamp(s.office.region[k] + v);
    }
  }
  if (fx.flags) fx.flags.forEach(f => setFlag(s, f));
  if (fx.unflags) fx.unflags.forEach(f => { delete s.flags[f]; });
  if (fx.rel && npcId) {
    const n = findNpc(s, npcId);
    if (n) { n.rel = clamp(n.rel + fx.rel, -100, 100); n.met = true; }
  }
  if (fx.schedule) for (const sc of fx.schedule) {
    if (sc.chance !== undefined && rand(s) > sc.chance) continue;
    s.scheduled.push({ id: sc.id, due: s.turn + randInt(s, sc.min, sc.max), npcId });
  }
  if (fx.heat) c.heat = clamp(c.heat + fx.heat);
  if (fx.party) c.partyStanding = clamp(c.partyStanding + fx.party);
  if (fx.momentum && s.campaign) s.campaign.momentum += fx.momentum;
  if (s.pres) {
    if (fx.capital) s.pres.capital = clamp(s.pres.capital + fx.capital);
    if (fx.coalition) for (const p of Object.keys(s.pres.coalition)) s.pres.coalition[p] = clamp(s.pres.coalition[p] + fx.coalition);
    if (fx.diplo) for (const cs of s.pres.countries) cs.rel = clamp(cs.rel + fx.diplo, -100, 100);
  }
  if (fx.jail) sendToJail(s, fx.jail);
  if (fx.love && c.partner) c.partner.love = clamp(c.partner.love + fx.love);
  if (fx.endPartner && c.partner) {
    const p = c.partner;
    if (p.stage === 'menikah') setFlag(s, 'pernah_cerai');
    c.exes.push(p.name); c.partner = null; c.loveLeft = 4;
    addHistory(s, p.stage === 'menikah' ? `Bercerai dengan ${p.name}.` : `Berpisah dengan ${p.name}.`, 'akibat');
  }
  if (fx.end) finish(s, fx.end);
}

/** Cek syarat. Mengembalikan false, atau true / id NPC subjek. */
export function check(s: GameState, c: Cond | undefined, npcId?: string): boolean | string {
  if (!c) return npcId ?? true;
  const ch = s.char;
  const a = age(s);
  if (c.minAge !== undefined && a < c.minAge) return false;
  if (c.maxAge !== undefined && a > c.maxAge) return false;
  if (c.office) {
    const cur = s.office ? s.office.id : 'none';
    if (!c.office.includes(cur)) return false;
  }
  if (c.everOffice !== undefined && (ch.everOffice.length > 0) !== c.everOffice) return false;
  if (c.flags && !c.flags.every(f => hasFlag(s, f))) return false;
  if (c.notFlags && c.notFlags.some(f => hasFlag(s, f))) return false;
  if (c.attrMin) for (const [k, v] of Object.entries(c.attrMin) as [AttrKey, number][]) if (ch.attr[k] < v) return false;
  if (c.attrMax) for (const [k, v] of Object.entries(c.attrMax) as [AttrKey, number][]) if (ch.attr[k] > v) return false;
  if (c.nationMin) for (const [k, v] of Object.entries(c.nationMin) as [NationKey, number][]) if (s.nation[k] < v) return false;
  if (c.nationMax) for (const [k, v] of Object.entries(c.nationMax) as [NationKey, number][]) if (s.nation[k] > v) return false;
  if (c.moneyMin !== undefined && ch.money < c.moneyMin) return false;
  if (c.moneyMax !== undefined && ch.money > c.moneyMax) return false;
  if (c.heatMin !== undefined && ch.heat < c.heatMin) return false;
  if (c.jobs && (!ch.job || !c.jobs.includes(ch.job))) return false;
  if (c.habits && !c.habits.some(h => ch.habits.includes(h))) return false;
  if (c.campaign !== undefined && (s.campaign !== null) !== c.campaign) return false;
  if (c.atWar !== undefined && (!!s.pres?.war) !== c.atWar) return false;
  if (c.student !== undefined && (ch.edu !== null) !== c.student) return false;
  if (c.inParty !== undefined && (ch.party !== null) !== c.inParty) return false;
  if (c.partner && !c.partner.includes(ch.partner ? ch.partner.stage : 'none')) return false;
  if (c.kids !== undefined && (ch.children.length > 0) !== c.kids) return false;
  if (c.orgs && !ch.orgs.some(o => c.orgs!.includes(o.id))) return false;
  if (c.research !== undefined && (ch.research !== null) !== c.research) return false;
  if (c.abroad !== undefined && ['atlantika', 'australis', 'temasik', 'tiongkara'].includes(ch.home.city) !== c.abroad) return false;
  if (c.housing && !c.housing.includes(ch.home.housing)) return false;
  if (c.city && !c.city.includes(ch.home.city)) return false;
  if (c.eduLevel && !(ch.edu && c.eduLevel.includes(ch.edu.level))) return false;
  if (c.degreeMin && (ch.degree ? { S1: 1, S2: 2, S3: 3 }[ch.degree] : 0) < { S1: 1, S2: 2, S3: 3 }[c.degreeMin]) return false;
  if (c.langMin !== undefined && ch.lang < c.langMin) return false;
  if (c.friendRole) {
    if (npcId) { const n = findNpc(s, npcId); return n ? npcId : false; }
    const pool = s.npcs.filter(n => n.met && n.rel >= 30 && c.friendRole!.includes(n.role));
    if (!pool.length) return false;
    return pick(s, pool).id;
  }
  return npcId ?? true;
}
