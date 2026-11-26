// Model statistik negara. Tiap statistik bergerak pelan menuju "target" yang ditentukan
// anggaran, kebijakan, menteri, dan kondisi lain; jadi keputusan terasa bertahap, bukan seketika.
import type { GameState, NationKey, Budget, MinistryId, SectorKey } from './types';
import { rand, range, clampNation, findNpc, log, hasFlag } from './core';
import { POLICIES } from '../content/data';

export const DEFAULT_BUDGET: Budget = {
  pajak: 22,
  belanja: { pendidikan: 3, kesehatan: 2, infrastruktur: 2.5, pertahanan: 1.5, keamanan: 1.5, sosial: 2, lingkungan: 0.5 },
};

export function initNation(r: () => number): Record<NationKey, number> {
  const j = (v: number, d: number) => v + (r() * 2 - 1) * d;
  return {
    pdb: j(20000, 1500), pertumbuhan: j(4.2, 0.8), inflasi: j(3.5, 0.8), pengangguran: j(6.2, 0.8), kemiskinan: j(10, 1.5), utang: j(40, 5),
    pendidikan: j(46, 4), kesehatan: j(46, 4), kriminalitas: j(48, 5), korupsi: j(62, 5), infrastruktur: j(42, 4),
    lingkungan: j(46, 5), kebahagiaan: j(50, 4), stabilitas: j(56, 4), militer: j(44, 4), approval: j(50, 5),
  };
}

/** Efektivitas kementerian: tergantung kompetensi menterinya. */
export function ministryEff(s: GameState, m: MinistryId): number {
  if (!s.pres) return 0.95;
  const n = findNpc(s, s.pres.cabinet[m]);
  if (!n) return 0.55;
  const fit = n.expertise === m ? 1 : 0.85;
  return (0.6 + (n.competence / 100) * 0.7) * fit;
}

export function coalitionSeats(s: GameState): number {
  if (!s.pres) return 55;
  return Object.keys(s.pres.coalition).reduce((a, p) => a + (s.seats[p] ?? 0), 0);
}

export function budgetOf(s: GameState): Budget { return s.pres ? s.pres.budget : s.aiBudget; }

export function policyCost(s: GameState): number {
  if (!s.pres) return 0;
  return s.pres.policies.reduce((a, id) => a + (POLICIES.find(p => p.id === id)?.cost ?? 0), 0);
}

/** Penerimaan, belanja, dan saldo anggaran dalam % PDB. */
export function fiscal(s: GameState) {
  const b = budgetOf(s);
  const n = s.nation;
  const revenue = b.pajak * 0.62 * (1 - n.korupsi / 300);
  const spend = (Object.values(b.belanja) as number[]).reduce((a, v) => a + v, 0);
  const interest = n.utang * 0.04;
  const extra = policyCost(s) + (s.pres?.war ? 2.5 : 0);
  const balance = revenue - spend - interest - extra;
  return { revenue, spend, interest, extra, balance };
}

function mods(s: GameState): Partial<Record<NationKey, number>> {
  const out: Partial<Record<NationKey, number>> = {};
  if (!s.pres) return out;
  for (const id of s.pres.policies) {
    const p = POLICIES.find(x => x.id === id);
    if (!p) continue;
    for (const [k, v] of Object.entries(p.mods) as [NationKey, number][]) out[k] = (out[k] ?? 0) + v;
  }
  return out;
}

export function stepNation(s: GameState) {
  const n = s.nation;
  const b = budgetOf(s);
  const sp: Record<SectorKey, number> = b.belanja;
  const m = mods(s);
  const md = (k: NationKey) => m[k] ?? 0;
  const pres = s.pres;
  const war = pres?.war ?? null;
  const leak = 1 - n.korupsi / 250;
  const f = fiscal(s);
  const eKeu = ministryEff(s, 'keuangan');
  const eHukum = ministryEff(s, 'hukum');

  let cabinetIntegrity = 50;
  if (pres) {
    const ms = Object.values(pres.cabinet).map(id => findNpc(s, id)).filter(Boolean);
    if (ms.length) cabinetIntegrity = ms.reduce((a, x) => a + x!.integrity, 0) / ms.length;
  }
  const leaderIntegrity = pres ? s.char.attr.integritas : 50;
  const deals = pres ? pres.countries.filter(c => c.dagang).length : 2;
  const sanctions = pres ? pres.countries.filter(c => c.sanksi).length : 0;
  const broken = pres ? s.promises.filter(p => p.office === 'presiden' && p.resolved === 'ingkar').length : 0;

  const T: Record<NationKey, number> = {
    pdb: n.pdb,
    utang: n.utang,
    pendidikan: 15 + sp.pendidikan * 14 * ministryEff(s, 'pendidikan') * leak + md('pendidikan'),
    kesehatan: 18 + sp.kesehatan * 18 * ministryEff(s, 'kesehatan') * leak + md('kesehatan'),
    infrastruktur: 15 + sp.infrastruktur * 14 * ministryEff(s, 'pu') * leak + md('infrastruktur'),
    militer: 10 + sp.pertahanan * 24 * ministryEff(s, 'pertahanan') + md('militer'),
    kriminalitas: 62 - sp.keamanan * 11 * eHukum - n.pendidikan * 0.2 + n.pengangguran * 1.2 + n.kemiskinan * 0.4 + md('kriminalitas'),
    korupsi: 72 - sp.keamanan * 4 * eHukum - (leaderIntegrity - 50) * 0.25 - (cabinetIntegrity - 50) * 0.2 + md('korupsi'),
    lingkungan: 40 + sp.lingkungan * 14 - (n.pertumbuhan - 4) * 2 + md('lingkungan'),
    pertumbuhan: 2.2 + n.infrastruktur * 0.035 + n.pendidikan * 0.025 - Math.max(0, b.pajak - 22) * 0.12 + Math.max(0, 22 - b.pajak) * 0.04
      - n.korupsi * 0.02 - Math.max(0, n.inflasi - 6) * 0.25 - Math.max(0, n.utang - 60) * 0.04 + (deals - 2) * 0.25 - sanctions * 0.3
      + (n.stabilitas - 50) * 0.02 - (war ? 2 : 0) + (eKeu - 0.95) * 1.5 + md('pertumbuhan'),
    inflasi: 3 + Math.max(0, -f.balance - 3) * 0.5 + Math.max(0, n.pertumbuhan - 6) * 0.5 + (war ? 2 : 0) - (eKeu - 0.95) + md('inflasi'),
    pengangguran: 9 - n.pertumbuhan * 0.7 - n.infrastruktur * 0.01 + md('pengangguran'),
    kemiskinan: 7 + n.pengangguran * 0.9 + n.inflasi * 0.4 - sp.sosial * 1.6 * ministryEff(s, 'sosial') - n.pendidikan * 0.03 + md('kemiskinan'),
    kebahagiaan: 68 - n.kemiskinan * 1.2 - n.pengangguran + (n.kesehatan - 45) * 0.3 - (n.kriminalitas - 45) * 0.25
      - Math.max(0, n.inflasi - 4) * 2 + (n.lingkungan - 45) * 0.1 - (war ? war.lelah * 0.6 : 0) + md('kebahagiaan'),
    stabilitas: 30 + n.kebahagiaan * 0.5 - (n.kriminalitas - 45) * 0.3 + (coalitionSeats(s) - 50) * 0.15 - (war ? 8 : 0) + md('stabilitas'),
    approval: 20 + n.kebahagiaan * 0.5 + (n.pertumbuhan - 4) * 3 - Math.max(0, n.inflasi - 5) * 2 - Math.max(0, b.pajak - 24) * 0.7
      + (pres ? (s.char.attr.karisma - 50) * 0.12 : 0) - broken * 4 - (war ? war.lelah * 0.5 : 0) + md('approval'),
  };

  const RATE: Partial<Record<NationKey, number>> = {
    pendidikan: 0.015, kesehatan: 0.025, infrastruktur: 0.02, militer: 0.04, kriminalitas: 0.03, korupsi: 0.02, lingkungan: 0.02,
    pertumbuhan: 0.1, inflasi: 0.1, pengangguran: 0.06, kemiskinan: 0.04, kebahagiaan: 0.06, stabilitas: 0.06, approval: 0.08,
  };
  for (const k of Object.keys(RATE) as NationKey[]) {
    const noise = (k === 'pertumbuhan' || k === 'inflasi') ? range(s, -0.08, 0.08) : range(s, -0.12, 0.12);
    n[k] += (T[k] - n[k]) * RATE[k]! + noise;
  }

  // Guncangan global sesekali.
  if (rand(s) < 0.012) {
    n.pertumbuhan -= range(s, 1, 2.5); n.inflasi += range(s, 0.5, 2); n.pengangguran += 0.5;
    log(s, 'Guncangan ekonomi global memukul Nagari: ekspor anjlok, harga naik.');
  }

  n.pdb *= 1 + n.pertumbuhan / 1200;
  n.utang += -f.balance / 12 - n.utang * (n.pertumbuhan + n.inflasi) / 1200;
  if (n.utang > 110) { n.pertumbuhan -= 0.15; n.inflasi += 0.2; }
  if (hasFlag(s, 'diktator')) n.korupsi += 0.05;
  clampNation(s);

  s.nationHist.push({ ...n });
  if (s.nationHist.length > 360) s.nationHist.shift();
}
