// Pencalonan, kampanye, penghitungan suara, dan jabatan daerah.
import type { GameState, OfficeId, Opponent, Level, RegionKey } from './types';
import { applyFx, rand, range, randInt, clamp, age, addHistory, log, setFlag, hasFlag, friends, gainPop } from './core';
import { OFFICES, officeDef, PARTIES, PROMISES, PROGRAMS } from '../content/data';
import { randomName } from '../content/npcs';
import { initPresidency, presidentReelected } from './presidency';
import { finish } from './core';
import { monthsToElection, nationalElection, ELECTION_CYCLE } from './gov';

const TIER: Record<OfficeId, number> = { kades: 0, bupati: 1, gubernur: 2, presiden: 3 };

export function declareBlock(s: GameState, office: OfficeId, viaParty: boolean): string | null {
  const c = s.char;
  const d = officeDef(office);
  if (c.jail > 0) return 'Sedang dipenjara';
  if (s.campaign) return 'Sedang berkampanye';
  if (c.edu) return 'Selesaikan kuliah dulu';
  if (c.cooldown > 0) return `Baru bisa mencalonkan diri lagi ${c.cooldown} bulan lagi`;
  if (age(s) < d.minAge) return `Usia minimal ${d.minAge} tahun`;
  if (s.office) {
    if (TIER[s.office.id] > TIER[office]) return 'Jabatanmu sekarang lebih tinggi';
    if (s.office.id === office) {
      if (office === 'presiden') return 'Pemilu ulang presiden berjalan otomatis';
      if (s.office.monthsLeft > d.campaignTurns + 2) return 'Masa jabatan belum hampir habis';
      if (s.office.terms >= 2) return 'Sudah dua periode';
    }
  }
  if (office === 'presiden') {
    const until = monthsToElection(s);
    if (until > 8) return `Pendaftaran calon presiden dibuka 8 bulan sebelum pemilu (${until} bulan lagi)`;
    if (until < 1) return 'Pendaftaran sudah ditutup';
  }
  if (hasFlag(s, 'pernah_dipenjara') && office === 'presiden' && c.pop.nasional < 45) return 'Mantan narapidana butuh popularitas nasional 45 untuk lolos verifikasi';
  if (viaParty) {
    if (!c.party) return 'Belum punya partai';
    if (c.partyStanding < d.partyStanding) return `Butuh kedekatan partai ${d.partyStanding}`;
  } else if (c.pop[d.level] < d.indepPop) return `Jalur independen butuh popularitas ${d.level} ${d.indepPop}`;
  const fee = feeOf(office, viaParty);
  if (c.money < fee) return `Butuh biaya pencalonan ${fee} juta`;
  return null;
}
export const feeOf = (office: OfficeId, viaParty: boolean) => Math.round(officeDef(office).fee * (viaParty ? 0.5 : 1));

function makeOpponents(s: GameState, office: OfficeId): Opponent[] {
  const d = officeDef(office);
  const r = () => rand(s);
  const count = office === 'kades' ? 2 : randInt(s, 2, 3);
  const parties = PARTIES.filter(p => p.id !== s.char.party);
  const out: Opponent[] = [];
  // Petahana ikut bertarung bila baru satu periode.
  if (office === 'presiden' && s.gov && s.gov.term === 1) {
    out.push({ name: s.gov.name, party: s.gov.party, strength: 34 + s.nation.approval * 0.45 + range(s, -4, 4) });
  }
  for (let i = out.length; i < count; i++) {
    const strong = i === 0 ? 6 : 0;
    out.push({
      name: randomName(r),
      party: office === 'kades' ? null : parties[(i + randInt(s, 0, 3)) % parties.length].id,
      strength: d.difficulty + strong + range(s, -8, 9),
    });
  }
  return out;
}

export function declare(s: GameState, office: OfficeId, viaParty: boolean) {
  if (declareBlock(s, office, viaParty)) return;
  startCampaign(s, office, viaParty);
}

export function startCampaign(s: GameState, office: OfficeId, viaParty: boolean, free = false) {
  const d = officeDef(office);
  if (!free) s.char.money -= feeOf(office, viaParty);
  const turns = office === 'presiden' && !s.pres ? Math.max(1, monthsToElection(s)) : d.campaignTurns;
  s.campaign = { office, turnsLeft: turns, momentum: 0, opponents: makeOpponents(s, office), actionsLeft: 2, round: 1, viaParty };
  addHistory(s, `Mencalonkan diri sebagai ${d.name}${viaParty ? ` lewat ${PARTIES.find(p => p.id === s.char.party)?.short}` : ' jalur independen'}.`, 'pilihan');
}

export interface CampaignAct { id: string; name: string; desc: string; dirty?: boolean }
export const CAMPAIGN_ACTS: CampaignAct[] = [
  { id: 'blusukan', name: 'Blusukan', desc: 'Datangi pasar dan kampung. Murah, melelahkan.' },
  { id: 'iklan', name: 'Pasang iklan & baliho', desc: 'Bayar untuk dikenal.' },
  { id: 'debat', name: 'Debat terbuka', desc: 'Untung besar bila cerdas dan karismatik; rugi bila tidak.' },
  { id: 'galang_dana', name: 'Galang dana', desc: 'Kumpulkan sumbangan pendukung.' },
  { id: 'lobi', name: 'Lobi elite partai', desc: 'Gerakkan mesin partai.' },
  { id: 'janji', name: 'Umbar janji kampanye', desc: 'Dongkrak suara. Janji dicatat dan ditagih.' },
  { id: 'serangan_fajar', name: 'Serangan fajar', desc: 'Bagi-bagi amplop menjelang coblosan.', dirty: true },
  { id: 'kampanye_hitam', name: 'Kampanye hitam', desc: 'Sebar fitnah tentang lawan terkuat.', dirty: true },
];

export function campaignActBlock(s: GameState, act: string, promise?: string): string | null {
  const cp = s.campaign;
  if (!cp) return 'Tidak sedang kampanye';
  if (cp.actionsLeft <= 0) return 'Aksi bulan ini habis';
  const d = officeDef(cp.office);
  if (act === 'iklan' && s.char.money < d.adCost) return `Butuh ${d.adCost} juta`;
  if (act === 'serangan_fajar' && s.char.money < d.adCost * 2) return `Butuh ${d.adCost * 2} juta`;
  if (act === 'lobi' && !cp.viaParty) return 'Hanya untuk calon partai';
  if (act === 'janji') {
    const made = s.promises.filter(p => p.office === cp.office && p.madeTurn >= s.turn - 12 && !p.resolved);
    if (made.length >= 2) return 'Sudah dua janji';
    if (promise && made.some(p => p.id === promise)) return 'Sudah dijanjikan';
    if (promise && !PROMISES.find(p => p.id === promise)?.levels.includes(cp.office)) return 'Tidak cocok';
  }
  return null;
}

export function campaignAct(s: GameState, act: string, promise?: string) {
  const cp = s.campaign;
  if (!cp || campaignActBlock(s, act, promise)) return;
  const c = s.char;
  const d = officeDef(cp.office);
  cp.actionsLeft--;
  switch (act) {
    case 'blusukan': cp.momentum += 2 + c.attr.karisma / 35; c.attr.stres = clamp(c.attr.stres + 2.5); gainPop(s, d.level, 0.8); break;
    case 'iklan': c.money -= d.adCost; cp.momentum += 4; gainPop(s, d.level, 0.5); break;
    case 'debat': {
      const score = (c.attr.karisma + c.attr.kecerdasan) / 2 + range(s, -22, 22);
      if (score >= 52) { cp.momentum += 6; log(s, 'Debat: jawabanmu tajam, lawan gelagapan.'); }
      else { cp.momentum -= 4; log(s, 'Debat: kamu terbata-bata. Potongan videonya viral.'); }
      break;
    }
    case 'galang_dana': {
      const amt = Math.round(d.adCost * (0.5 + c.pop[d.level] / 50 + c.attr.jaringan / 100));
      c.money += amt; log(s, `Galang dana menghasilkan ${amt} juta.`); break;
    }
    case 'lobi': c.partyStanding = clamp(c.partyStanding + 3); cp.momentum += 2.5; break;
    case 'janji': {
      const p = PROMISES.find(x => x.id === promise);
      if (!p) { cp.actionsLeft++; return; }
      cp.momentum += p.momentum;
      s.promises.push({ id: p.id, office: cp.office, madeTurn: s.turn, baseline: 0 });
      addHistory(s, `Janji kampanye: "${p.name}".`, 'pilihan');
      break;
    }
    case 'serangan_fajar':
      c.money -= d.adCost * 2; cp.momentum += 9;
      applyFx(s, { heat: 12, attr: { integritas: -4 }, flags: ['serangan_fajar'] });
      addHistory(s, 'Membagi amplop "serangan fajar" ke pemilih.', 'pilihan');
      break;
    case 'kampanye_hitam':
      applyFx(s, { heat: 7, attr: { integritas: -3 }, flags: ['kampanye_hitam'] });
      if (rand(s) < 0.28) { cp.momentum -= 6; log(s, 'Fitnahmu terbongkar. Pemilih muak.'); }
      else { cp.momentum += 3; cp.opponents.sort((a, b) => b.strength - a.strength)[0].strength -= 5; }
      addHistory(s, 'Menjalankan kampanye hitam terhadap lawan.', 'pilihan');
      break;
  }
}

function playerScore(s: GameState): number {
  const cp = s.campaign!;
  const c = s.char;
  const d = officeDef(cp.office);
  const seats = c.party ? s.seats[c.party] ?? 0 : 0;
  const fr = Math.min(14, friends(s).reduce((a, n) => a + n.influence * 0.035, 0));
  return Math.max(5,
    c.pop[d.level] * 0.9 + cp.momentum * 0.65
    + (cp.viaParty ? c.partyStanding * 0.12 + seats * 0.22 : 0)
    + fr + c.attr.karisma * 0.1 + c.attr.integritas * 0.04
    - (hasFlag(s, 'ingkar_janji') ? 6 : 0) - (hasFlag(s, 'pernah_dipenjara') ? 8 : 0)
    + range(s, -6, 6));
}

function takeOffice(s: GameState, office: OfficeId) {
  const c = s.char;
  const d = officeDef(office);
  const reelect = s.office?.id === office;
  if (s.office) resolvePromises(s, s.office.id);
  if (office === 'presiden') {
    if (reelect) presidentReelected(s);
    else {
      s.office = { id: 'presiden', monthsLeft: d.term, terms: 1, region: blankRegion(s), lowMonths: 0, programDone: false };
      initPresidency(s);
    }
  } else {
    s.office = {
      id: office, monthsLeft: d.term, terms: reelect ? s.office!.terms + 1 : 1,
      region: reelect ? s.office!.region : blankRegion(s), lowMonths: 0, programDone: false,
    };
  }
  c.job = null; c.jobLevel = 0; c.jobMonths = 0;
  if (!c.everOffice.includes(office)) c.everOffice.push(office);
  setFlag(s, `menang:${office}`);
  gainPop(s, d.level, 8);
  // Catat titik awal untuk janji.
  for (const p of s.promises) if (p.office === office && !p.resolved) p.baseline = promiseValue(s, p.id);
  addHistory(s, reelect ? `Terpilih lagi sebagai ${d.name}.` : `Dilantik sebagai ${d.name}.`);
}

function blankRegion(s: GameState) {
  const v = () => range(s, 32, 50);
  return { kesejahteraan: v(), infrastruktur: v(), keamanan: v(), layanan: v(), kas: 30, kepuasan: 50 };
}

function promiseValue(s: GameState, id: string): number {
  const r = s.office?.region;
  switch (id) {
    case 'jalan_mulus': return r?.infrastruktur ?? 0;
    case 'warga_sejahtera': return r?.kesejahteraan ?? 0;
    case 'kampung_aman': return r?.keamanan ?? 0;
    case 'layanan_gratis': return r?.layanan ?? 0;
    case 'sekolah_gratis': return s.nation.pendidikan;
    case 'lapangan_kerja': return s.nation.pengangguran;
    case 'berantas_korupsi': return s.nation.korupsi;
    case 'harga_murah': return s.nation.inflasi;
    case 'ekonomi_meroket': return s.nation.pdb;
  }
  return 0;
}

function promiseKept(s: GameState, id: string, base: number): boolean {
  const v = promiseValue(s, id);
  switch (id) {
    case 'jalan_mulus': return v - base >= 15;
    case 'warga_sejahtera': case 'kampung_aman': case 'layanan_gratis': return v - base >= 12;
    case 'sekolah_gratis': return v - base >= 8;
    case 'lapangan_kerja': return base - v >= 1.5;
    case 'berantas_korupsi': return base - v >= 10;
    case 'harga_murah': return v < 4;
    case 'ekonomi_meroket': return v >= base * 1.3;
  }
  return false;
}

/** Tagih janji di akhir masa jabatan. */
export function resolvePromises(s: GameState, office: OfficeId) {
  const d = officeDef(office);
  for (const p of s.promises) {
    if (p.office !== office || p.resolved) continue;
    const def = PROMISES.find(x => x.id === p.id);
    if (promiseKept(s, p.id, p.baseline)) {
      p.resolved = 'tepati';
      gainPop(s, d.level, 7); s.char.attr.integritas = clamp(s.char.attr.integritas + 2);
      addHistory(s, `Janji ditepati: "${def?.name}". Warga mengingatnya.`, 'akibat');
    } else {
      p.resolved = 'ingkar';
      s.char.pop[d.level] = clamp(s.char.pop[d.level] - 9); s.char.attr.integritas = clamp(s.char.attr.integritas - 3);
      setFlag(s, 'ingkar_janji');
      addHistory(s, `Janji diingkari: "${def?.name}". Lawan politik akan terus mengungkitnya.`, 'akibat');
    }
  }
}

function resolveElection(s: GameState) {
  const cp = s.campaign!;
  const c = s.char;
  const d = officeDef(cp.office);
  const ps = playerScore(s);
  const opps = cp.opponents.map(o => ({ name: o.name, sc: Math.max(5, o.strength + range(s, -6, 6)) }));
  const pow = (x: number) => x * x;
  const total = pow(ps) + opps.reduce((a, o) => a + pow(o.sc), 0);
  const shares = [{ name: c.name, share: pow(ps) / total, player: true }, ...opps.map(o => ({ name: o.name, share: pow(o.sc) / total, player: false }))]
    .sort((a, b) => b.share - a.share);
  const mine = shares.find(x => x.player)!;
  const top = shares[0];

  // Presiden: dua putaran bila tak ada yang lewat 50%.
  if (cp.office === 'presiden' && cp.round === 1 && top.share <= 0.5 && shares.length > 2) {
    const inTop2 = shares[0].player || shares[1].player;
    if (inTop2) {
      const rival = shares.find(x => !x.player)!;
      cp.opponents = cp.opponents.filter(o => o.name === rival.name);
      cp.round = 2; cp.turnsLeft = 2; cp.actionsLeft = 2;
      s.lastElection = { office: cp.office, shares, won: false, runoff: true };
      log(s, 'Tak ada yang meraih 50%. Pemilu lanjut ke putaran kedua.');
      return;
    }
  }
  const won = top.player;
  s.lastElection = { office: cp.office, shares, won, runoff: false };
  const wasIncumbentPres = s.pres !== null && cp.office === 'presiden';
  s.campaign = null;
  if (cp.office === 'presiden' && !wasIncumbentPres) {
    if (won) s.nextElection += ELECTION_CYCLE;
    else { const w = shares.find(x => !x.player)!; nationalElection(s, { name: w.name, party: cp.opponents.find(o => o.name === w.name)?.party ?? null }); }
  }
  if (won) {
    takeOffice(s, cp.office);
  } else {
    setFlag(s, 'kalah_pemilu');
    s.promises = s.promises.filter(p => !(p.office === cp.office && !p.resolved && p.baseline === 0 && p.madeTurn >= s.turn - 12));
    c.cooldown = 12; c.pop[d.level] = clamp(c.pop[d.level] - 4); c.attr.stres = clamp(c.attr.stres + 12);
    addHistory(s, `Kalah dalam pemilihan ${d.name} (${Math.round(mine.share * 100)}% suara).`, 'akibat');
    if (wasIncumbentPres) { resolvePromises(s, 'presiden'); finish(s, 'satu_periode'); }
  }
}

export function stepCampaign(s: GameState) {
  const cp = s.campaign;
  if (!cp) return;
  cp.actionsLeft = 2;
  cp.turnsLeft--;
  if (cp.turnsLeft <= 0) resolveElection(s);
}

// ---------- Jabatan daerah ----------
export function programBlock(s: GameState, id: string): string | null {
  const o = s.office;
  if (!o || o.id === 'presiden') return 'Tidak menjabat di daerah';
  if (o.programDone) return 'Program bulan ini sudah dipilih';
  const p = PROGRAMS.find(x => x.id === id);
  if (!p) return 'Tidak ada';
  if (o.region.kas < p.cost) return 'Kas daerah tidak cukup';
  return null;
}

export function runProgram(s: GameState, id: string) {
  if (programBlock(s, id)) return;
  const o = s.office!;
  const p = PROGRAMS.find(x => x.id === id)!;
  o.region.kas -= p.cost;
  o.programDone = true;
  applyFx(s, p.fx);
  if (id === 'titipan') {
    const cut = [8, 90, 350][TIER[o.id]];
    s.char.money += cut;
    addHistory(s, `Menggelembungkan anggaran proyek; ${cut} juta masuk kantong.`, 'pilihan');
  }
}

export function stepOffice(s: GameState) {
  const o = s.office;
  if (!o || o.id === 'presiden') return;
  const c = s.char;
  const d = officeDef(o.id);
  const r = o.region;
  if (!o.programDone) { r.kas += 6; r.kepuasan -= 0.4; }
  o.programDone = false;
  c.money += d.salary;
  r.kas += 9;
  for (const k of ['kesejahteraan', 'infrastruktur', 'keamanan', 'layanan'] as RegionKey[]) r[k] = clamp(r[k] - 0.28);
  // Ekonomi nasional ikut terasa di daerah.
  r.kesejahteraan = clamp(r.kesejahteraan + (s.nation.pertumbuhan - 4) * 0.05);
  const avg = (r.kesejahteraan + r.infrastruktur + r.keamanan + r.layanan) / 4;
  r.kepuasan = clamp(r.kepuasan + (avg + 8 - r.kepuasan) * 0.06);
  // Kinerja jadi popularitas, dan terdengar sampai tingkat di atasnya.
  c.pop[d.level] = clamp(c.pop[d.level] + (r.kepuasan - c.pop[d.level]) * 0.05);
  const up: Level[] = ['desa', 'kabupaten', 'provinsi', 'nasional'];
  const next = up[up.indexOf(d.level) + 1];
  if (next && r.kepuasan > 50) gainPop(s, next, (r.kepuasan - 50) * 0.012 * (1 + TIER[o.id] * 0.5));
  if (c.party) c.partyStanding = clamp(c.partyStanding + 0.15 + TIER[o.id] * 0.1);

  if (r.kepuasan < 20) {
    o.lowMonths++;
    if (o.lowMonths === 3) log(s, 'Warga mulai menuntutmu mundur.');
    if (o.lowMonths >= 6) {
      resolvePromises(s, o.id);
      s.office = null; setFlag(s, 'dilengserkan'); c.pop[d.level] = clamp(c.pop[d.level] - 15); c.cooldown = 24;
      if (s.campaign) s.campaign = null;
      addHistory(s, `Diberhentikan dari jabatan ${d.name} karena kinerja buruk.`, 'akibat');
      return;
    }
  } else o.lowMonths = 0;

  o.monthsLeft--;
  if (o.monthsLeft <= 0 && s.campaign?.office !== o.id) {
    resolvePromises(s, o.id);
    s.office = null;
    addHistory(s, `Masa jabatan ${d.name} berakhir.`);
  }
}

export { OFFICES, TIER };
