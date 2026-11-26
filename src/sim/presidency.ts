// Kepresidenan: kabinet, koalisi, kebijakan, diplomasi, perang, krisis.
import type { GameState, Npc, MinistryId, Budget, NationKey, SectorKey, CountryState } from './types';
import { applyFx, rand, range, pick, clamp, addHistory, log, setFlag, hasFlag, finish, findNpc, friends } from './core';
import { PARTIES, POLICIES, COUNTRIES, MINISTRIES, officeDef } from '../content/data';
import { randomName } from '../content/npcs';
import { coalitionSeats, ministryEff } from './nation';
import { startCampaign, resolvePromises } from './election';

export function initPresidency(s: GameState) {
  const c = s.char;
  const r = () => rand(s);
  const pool: Npc[] = [];
  let i = 0;
  const exps = MINISTRIES.map(m => m.id);
  for (const p of PARTIES) for (let k = 0; k < 2; k++) {
    pool.push({
      id: `kader_${i++}`, name: randomName(r), role: 'politisi', desc: `Kader ${p.short}`, influence: 40 + Math.floor(r() * 30),
      integrity: 20 + Math.floor(r() * 50), competence: 35 + Math.floor(r() * 40), loyalty: 30 + Math.floor(r() * 40),
      expertise: pick(s, exps), party: p.id, rel: 0, met: true, memory: [],
    });
  }
  for (const e of exps) {
    pool.push({
      id: `pro_${i++}`, name: randomName(r), role: 'birokrat', desc: 'Profesional nonpartai', influence: 25 + Math.floor(r() * 20),
      integrity: 55 + Math.floor(r() * 40), competence: 65 + Math.floor(r() * 30), loyalty: 45 + Math.floor(r() * 30),
      expertise: e, party: null, rel: 0, met: true, memory: [],
    });
  }
  const countries: CountryState[] = COUNTRIES.map(k => ({
    id: k.id, rel: Math.round(clamp(25 - k.aggressive * 0.5 + range(s, -15, 15), -100, 100)), dagang: k.id === 'temasik' || k.id === 'tiongkara', aliansi: false, sanksi: false, power: k.power,
  }));
  const coalition: Record<string, number> = {};
  if (c.party) coalition[c.party] = 80;
  s.pres = {
    term: 1, monthsLeft: officeDef('presiden').term, capital: 45, budget: JSON.parse(JSON.stringify(s.aiBudget)) as Budget,
    cabinet: {}, coalition, policies: [], countries, war: null, baseline: { ...s.nation }, crisisMonths: 0, diploDone: false, pool,
  };
  s.nation.approval = clamp(52 + (c.pop.nasional - 40) * 0.3);
  addHistory(s, 'Mengucap sumpah sebagai Presiden Republik Nagari.');
}

export function presidentReelected(s: GameState) {
  const p = s.pres!;
  p.term = 2; p.monthsLeft = officeDef('presiden').term; p.capital = clamp(p.capital + 20);
  s.office!.monthsLeft = p.monthsLeft; s.office!.terms = 2;
}

export const ministerCandidates = (s: GameState): Npc[] =>
  s.pres ? [...s.npcs.filter(n => n.met && n.rel >= 15), ...s.pres.pool] : [];

export function appoint(s: GameState, ministry: MinistryId, npcId: string | null) {
  const p = s.pres;
  if (!p) return;
  const old = findNpc(s, p.cabinet[ministry]);
  if (npcId && Object.values(p.cabinet).includes(npcId)) return;
  if (old) {
    if (p.capital < 3) return;
    p.capital -= 3;
    if (old.party && p.coalition[old.party] !== undefined) p.coalition[old.party] = clamp(p.coalition[old.party] - 10);
    if (s.npcs.includes(old)) { old.rel -= 20; old.memory.push('dicopot'); }
    delete p.cabinet[ministry];
  }
  if (!npcId) return;
  const n = findNpc(s, npcId);
  if (!n) return;
  p.cabinet[ministry] = npcId;
  if (n.party && p.coalition[n.party] !== undefined) p.coalition[n.party] = clamp(p.coalition[n.party] + 9);
  if (s.npcs.includes(n)) { n.rel = clamp(n.rel + 15, -100, 100); if (!hasFlag(s, 'kabinet_teman')) setFlag(s, 'kabinet_teman'); }
}

export function coalitionAct(s: GameState, party: string, join: boolean) {
  const p = s.pres;
  if (!p || !PARTIES.some(x => x.id === party)) return;
  if (join) {
    if (p.coalition[party] !== undefined || p.capital < 8) return;
    p.capital -= 8; p.coalition[party] = 50;
    log(s, `${PARTIES.find(x => x.id === party)!.short} masuk koalisi. Mereka menunggu jatah kursi menteri.`);
  } else {
    if (p.coalition[party] === undefined) return;
    delete p.coalition[party];
    for (const [m, id] of Object.entries(p.cabinet) as [MinistryId, string][]) if (findNpc(s, id)?.party === party) delete p.cabinet[m];
    log(s, `${PARTIES.find(x => x.id === party)!.short} dikeluarkan dari koalisi; menterinya ikut mundur.`);
  }
}

export function policyCapital(s: GameState, id: string, enact: boolean): number {
  const pol = POLICIES.find(x => x.id === id);
  if (!pol) return 999;
  const mult = coalitionSeats(s) >= 50 ? 1 : 1.8;
  return Math.round(pol.capital * mult * (enact ? 1 : 0.5));
}
export function policyBlock(s: GameState, id: string, enact: boolean): string | null {
  const p = s.pres;
  if (!p) return 'Bukan presiden';
  const has = p.policies.includes(id);
  if (enact === has) return enact ? 'Sudah berlaku' : 'Tidak berlaku';
  if (id === 'tiga_periode') {
    if (!enact) return 'Tidak bisa dicabut';
    if (coalitionSeats(s) < 67) return 'Butuh koalisi 67% kursi DPR';
  }
  if (id === 'kpk_lemah' && enact && p.policies.includes('kpk_kuat')) return 'Cabut dulu penguatan komisi';
  if (id === 'kpk_kuat' && enact && p.policies.includes('kpk_lemah')) return 'Cabut dulu pelemahan komisi';
  const cost = policyCapital(s, id, enact);
  if (p.capital < cost) return `Butuh modal politik ${cost}`;
  return null;
}
export function policyAct(s: GameState, id: string, enact: boolean) {
  if (policyBlock(s, id, enact)) return;
  const p = s.pres!;
  const pol = POLICIES.find(x => x.id === id)!;
  p.capital -= policyCapital(s, id, enact);
  const sign = enact ? 1 : -0.5;
  for (const pid of Object.keys(p.coalition)) {
    const party = PARTIES.find(x => x.id === pid)!;
    if (party.likes.includes(pol.tag)) p.coalition[pid] = clamp(p.coalition[pid] + 6 * sign);
    if (party.hates.includes(pol.tag)) p.coalition[pid] = clamp(p.coalition[pid] - 10 * sign);
  }
  if (enact) {
    p.policies.push(id);
    applyFx(s, pol.instant);
    setFlag(s, `uu:${id}`);
    addHistory(s, `Mengesahkan: ${pol.name}.`, 'pilihan');
  } else {
    p.policies = p.policies.filter(x => x !== id);
    addHistory(s, `Mencabut: ${pol.name}.`, 'pilihan');
  }
}

export function setBudget(s: GameState, b: Budget) {
  const p = s.pres;
  if (!p) return;
  const dTax = b.pajak - p.budget.pajak;
  p.budget.pajak = clamp(b.pajak, 10, 40);
  for (const k of Object.keys(p.budget.belanja) as SectorKey[]) p.budget.belanja[k] = clamp(b.belanja[k] ?? 0, 0, 6);
  if (dTax > 0) s.nation.approval = clamp(s.nation.approval - dTax * 0.6);
}

// ---------- Diplomasi ----------
type DiploAct = 'kunjungan' | 'dagang' | 'aliansi' | 'bantuan' | 'sanksi' | 'cabut_sanksi' | 'perang';
export function diploBlock(s: GameState, country: string, act: DiploAct): string | null {
  const p = s.pres;
  if (!p) return 'Bukan presiden';
  const cs = p.countries.find(c => c.id === country);
  if (!cs) return 'Tidak ada';
  if (p.diploDone) return 'Satu langkah diplomasi per bulan';
  const atWar = p.war?.enemy === country;
  if (atWar) return 'Sedang berperang dengan negara ini';
  switch (act) {
    case 'kunjungan': return p.capital < 2 ? 'Butuh modal politik 2' : null;
    case 'dagang': return cs.dagang ? 'Sudah ada perjanjian' : cs.sanksi ? 'Sedang disanksi' : cs.rel < 25 ? 'Butuh hubungan 25' : null;
    case 'aliansi': return cs.aliansi ? 'Sudah beraliansi' : cs.rel < 55 ? 'Butuh hubungan 55' : null;
    case 'bantuan': return null;
    case 'sanksi': return cs.sanksi ? 'Sudah disanksi' : null;
    case 'cabut_sanksi': return cs.sanksi ? null : 'Tidak ada sanksi';
    case 'perang': return p.war ? 'Sudah ada perang' : p.capital < 15 ? 'Butuh modal politik 15' : null;
  }
}
export function diploAct(s: GameState, country: string, act: DiploAct) {
  if (diploBlock(s, country, act)) return;
  const p = s.pres!;
  const cs = p.countries.find(c => c.id === country)!;
  const def = COUNTRIES.find(c => c.id === country)!;
  const eff = ministryEff(s, 'luar_negeri');
  p.diploDone = true;
  switch (act) {
    case 'kunjungan': p.capital -= 2; cs.rel = clamp(cs.rel + 8 * eff, -100, 100); break;
    case 'dagang': cs.dagang = true; cs.rel = clamp(cs.rel + 5, -100, 100); addHistory(s, `Perjanjian dagang dengan ${def.name}.`, 'pilihan'); break;
    case 'aliansi':
      cs.aliansi = true; cs.rel = clamp(cs.rel + 8, -100, 100);
      for (const o of p.countries) if (o.id !== country && COUNTRIES.find(c => c.id === o.id)!.aggressive >= 40) o.rel = clamp(o.rel - 6, -100, 100);
      addHistory(s, `Aliansi pertahanan dengan ${def.name}.`, 'pilihan'); break;
    case 'bantuan': s.nation.utang += 0.3; cs.rel = clamp(cs.rel + 12 * eff, -100, 100); break;
    case 'sanksi': cs.sanksi = true; cs.dagang = false; cs.aliansi = false; cs.rel = clamp(cs.rel - 30, -100, 100); addHistory(s, `Menjatuhkan sanksi pada ${def.name}.`, 'pilihan'); break;
    case 'cabut_sanksi': cs.sanksi = false; cs.rel = clamp(cs.rel + 10, -100, 100); break;
    case 'perang': {
      p.capital -= 15;
      const justified = cs.rel <= -50;
      startWar(s, country);
      s.nation.approval = clamp(s.nation.approval + (justified ? 6 : -8));
      for (const o of p.countries) if (o.id !== country) o.rel = clamp(o.rel - (justified ? 6 : 22), -100, 100);
      if (!justified) setFlag(s, 'agresor');
      addHistory(s, `Menyatakan perang terhadap ${def.name}.`, 'pilihan');
      break;
    }
  }
}

function startWar(s: GameState, country: string) {
  const p = s.pres!;
  const cs = p.countries.find(c => c.id === country)!;
  cs.rel = -100; cs.dagang = false; cs.aliansi = false;
  p.war = { enemy: country, progress: 0, months: 0, stance: 'bertahan', lelah: 0 };
  setFlag(s, 'pernah_perang');
}

export function warPower(s: GameState) {
  const p = s.pres!;
  const w = p.war!;
  const allies = p.countries.filter(c => c.aliansi).reduce((a, c) => a + c.power * 0.3, 0);
  const mine = (s.nation.militer + allies) * (w.stance === 'serang' ? 1.1 : 0.95) * (0.8 + ministryEff(s, 'pertahanan') * 0.25);
  const theirs = p.countries.find(c => c.id === w.enemy)!.power * (w.stance === 'bertahan' ? 0.8 : 1);
  return { mine, theirs };
}

export function warAct(s: GameState, act: 'serang' | 'bertahan' | 'damai') {
  const p = s.pres;
  const w = p?.war;
  if (!p || !w) return;
  if (act !== 'damai') { w.stance = act; return; }
  if (p.diploDone) return;
  p.diploDone = true;
  const def = COUNTRIES.find(c => c.id === w.enemy)!;
  const cs = p.countries.find(c => c.id === w.enemy)!;
  const accept = w.progress >= 30 ? 0.9 : w.progress > -30 ? 0.55 : 0.5;
  if (rand(s) > accept) { log(s, `${def.name} menolak berunding.`); return; }
  if (w.progress >= 30) {
    applyFx(s, { nation: { approval: 6, stabilitas: 3 } });
    addHistory(s, `Perang dengan ${def.name} berakhir damai dengan syarat menguntungkan.`, 'akibat');
  } else if (w.progress > -30) {
    applyFx(s, { nation: { approval: -3 } });
    addHistory(s, `Gencatan senjata dengan ${def.name}. Tak ada yang menang.`, 'akibat');
  } else {
    applyFx(s, { nation: { approval: -15, stabilitas: -10, utang: 5 }, flags: ['damai_memalukan'] });
    addHistory(s, `Menandatangani perdamaian yang memalukan dengan ${def.name}: wilayah dan ganti rugi diserahkan.`, 'akibat');
  }
  cs.rel = -50; p.war = null;
}

function stepWar(s: GameState) {
  const p = s.pres!;
  const w = p.war;
  if (!w) return;
  const def = COUNTRIES.find(c => c.id === w.enemy)!;
  const cs = p.countries.find(c => c.id === w.enemy)!;
  const { mine, theirs } = warPower(s);
  const swing = w.stance === 'serang' ? 1.5 : 0.8;
  w.progress += ((mine - theirs) / 5 + range(s, -4, 4)) * swing;
  w.months++; w.lelah += w.stance === 'serang' ? 1.5 : 1;
  s.nation.militer = clamp(s.nation.militer - (w.stance === 'serang' ? 0.9 : 0.4));
  s.nation.utang += 0.35;
  s.char.attr.stres = clamp(s.char.attr.stres + 1);
  if (w.progress >= 100) {
    applyFx(s, { nation: { approval: 15, stabilitas: 5 }, capital: 20, flags: ['menang_perang'] });
    s.nation.pdb *= 1.03; cs.power *= 0.6; cs.rel = -60; p.war = null;
    for (const o of p.countries) if (o.id !== cs.id) o.rel = clamp(o.rel - 5, -100, 100);
    addHistory(s, `Menang perang melawan ${def.name} setelah ${w.months} bulan.`, 'akibat');
  } else if (w.progress <= -100) {
    addHistory(s, `Kalah perang melawan ${def.name}. Ibu kota jatuh.`, 'akibat');
    finish(s, 'kalah_perang');
  } else if (w.months % 6 === 0) {
    log(s, w.progress > 20 ? `Front ${def.name}: pasukan Nagari maju.` : w.progress < -20 ? `Front ${def.name}: pasukan Nagari terdesak.` : `Front ${def.name}: buntu, korban terus bertambah.`);
  }
}

function stepDiplomacy(s: GameState) {
  const p = s.pres!;
  for (const cs of p.countries) {
    if (p.war?.enemy === cs.id) continue;
    const def = COUNTRIES.find(c => c.id === cs.id)!;
    cs.rel += (0 - cs.rel) * 0.008 + range(s, -0.6, 0.6);
    if (cs.aliansi) cs.rel += 0.3;
    if (cs.sanksi) cs.rel -= 0.3;
    if (s.nation.militer < 32 && def.aggressive >= 50) cs.rel -= 0.5;
    if (cs.rel < -35 && rand(s) < def.aggressive / 100 * 0.07) {
      cs.rel -= 8;
      log(s, `Insiden perbatasan dengan ${def.name}. Hubungan memburuk.`);
    }
    if (cs.aliansi && cs.rel < 30) { cs.aliansi = false; log(s, `${def.name} membatalkan aliansi.`); }
    if (cs.dagang && cs.rel < -10) { cs.dagang = false; log(s, `${def.name} membekukan perjanjian dagang.`); }
    cs.rel = clamp(cs.rel, -100, 100);
    if (!p.war && cs.rel < -75 && rand(s) < def.aggressive / 100 * 0.12) {
      startWar(s, cs.id);
      s.nation.approval = clamp(s.nation.approval + 5);
      addHistory(s, `${def.name} menyerang Nagari. Perang pecah.`, 'akibat');
    }
  }
}

/** Satu bulan sebagai presiden. */
export function stepPresidency(s: GameState) {
  const p = s.pres;
  if (!p || s.ending) return;
  const c = s.char;
  const n = s.nation;
  p.diploDone = false;
  c.money += officeDef('presiden').salary;

  // Koalisi: partai tanpa kursi menteri makin gelisah.
  const withMinister = new Set(Object.values(p.cabinet).map(id => findNpc(s, id)?.party).filter(Boolean));
  for (const pid of Object.keys(p.coalition)) {
    let sat = p.coalition[pid];
    sat += withMinister.has(pid) ? 0.4 : -1.3;
    sat += (n.approval - 45) * 0.02;
    if (pid === c.party) sat += 0.6;
    p.coalition[pid] = clamp(sat);
    if (sat < 18 && pid !== c.party) {
      delete p.coalition[pid];
      for (const [m, id] of Object.entries(p.cabinet) as [MinistryId, string][]) if (findNpc(s, id)?.party === pid) delete p.cabinet[m];
      p.capital = clamp(p.capital - 6);
      addHistory(s, `${PARTIES.find(x => x.id === pid)!.name} keluar dari koalisi.`, 'akibat');
    }
  }
  const seats = coalitionSeats(s);
  p.capital = clamp(p.capital + 0.8 + n.approval / 45 + seats / 60);

  // Menteri korup dan tidak setia membawa masalah.
  for (const [m, id] of Object.entries(p.cabinet) as [MinistryId, string][]) {
    const mn = findNpc(s, id);
    if (!mn) continue;
    if (mn.integrity < 35 && rand(s) < 0.012 * (hasFlag(s, 'uu:kpk_kuat') ? 2 : 1)) {
      delete p.cabinet[m];
      applyFx(s, { nation: { approval: -5, korupsi: 1 }, heat: 4 });
      addHistory(s, `${mn.name} (${MINISTRIES.find(x => x.id === m)!.name}) ditangkap karena korupsi. Kamu yang memilihnya.`, 'akibat');
    } else if (mn.loyalty < 40 && n.approval < 35 && rand(s) < 0.02) {
      delete p.cabinet[m];
      applyFx(s, { nation: { approval: -3 }, capital: -5 });
      log(s, `${mn.name} mundur dari kabinet sambil mengkritikmu terbuka.`);
    }
  }
  // Kursi kosong menggerus kepercayaan.
  const empty = MINISTRIES.length - Object.keys(p.cabinet).length;
  if (empty > 2) n.approval = clamp(n.approval - 0.15 * empty);

  stepDiplomacy(s);
  stepWar(s);
  if (s.ending) return;

  // Popularitas nasional mengikuti kepuasan publik.
  c.pop.nasional = clamp(c.pop.nasional + (n.approval - c.pop.nasional) * 0.1);

  // Krisis: pemakzulan, kudeta, revolusi.
  if (n.approval < 22 && seats < 34) {
    p.crisisMonths++;
    if (p.crisisMonths === 2) log(s, 'DPR menggalang hak menyatakan pendapat. Pemakzulan di depan mata.');
    if (p.crisisMonths >= 5) { finish(s, 'dimakzulkan'); return; }
  } else p.crisisMonths = Math.max(0, p.crisisMonths - 1);

  if (n.stabilitas < 24) {
    const def = findNpc(s, p.cabinet.pertahanan);
    const guard = (def && def.loyalty >= 60 ? 0.4 : 1) * (friends(s).some(f => f.role === 'jenderal') ? 0.5 : 1) * (n.militer > 55 ? 0.8 : 1);
    if (rand(s) < 0.05 * guard) { finish(s, 'dikudeta'); return; }
    if (n.stabilitas < 12 && n.approval < 18 && rand(s) < 0.12) { finish(s, 'revolusi'); return; }
  }
  if (n.utang > 130 && rand(s) < 0.05) {
    applyFx(s, { nation: { pertumbuhan: -2, inflasi: 3, approval: -6, stabilitas: -4 } });
    log(s, 'Negara gagal bayar utang. Rupiah Nagari terjun bebas.');
  }

  // Masa jabatan.
  p.monthsLeft--;
  s.office!.monthsLeft = p.monthsLeft;
  const turns = officeDef('presiden').campaignTurns;
  if (p.term === 1 && p.monthsLeft === turns && !s.campaign) {
    if (hasFlag(s, 'diktator')) log(s, 'Pemilu ditiadakan. Masa jabatanmu diperpanjang dengan sendirinya.');
    else { startCampaign(s, 'presiden', !!c.party, true); log(s, 'Masa kampanye pemilu presiden dimulai. Kamu petahana.'); }
  }
  if (p.monthsLeft <= 0 && !s.campaign) {
    if (p.term === 1 && hasFlag(s, 'diktator')) { resolvePromises(s, 'presiden'); presidentReelected(s); return; }
    resolvePromises(s, 'presiden');
    if (hasFlag(s, 'diktator')) finish(s, 'diktator');
    else finish(s, legacyScore(s) >= 78 ? 'legenda' : 'dua_periode');
  }
}

export function resign(s: GameState) {
  if (!s.pres) return;
  resolvePromises(s, 'presiden');
  addHistory(s, 'Mengundurkan diri dari jabatan presiden.', 'pilihan');
  finish(s, 'mundur_terhormat');
}

/** Skor warisan 0–100: seberapa jauh negara membaik sejak dilantik. */
export function legacyScore(s: GameState): number {
  const p = s.pres;
  if (!p) return 0;
  const b = p.baseline, n = s.nation;
  const d = (k: NationKey) => n[k] - b[k];
  let sc = 40;
  sc += (n.pdb / b.pdb - 1) * 18;
  sc += d('pendidikan') * 0.5 + d('kesehatan') * 0.5 + d('infrastruktur') * 0.4 + d('lingkungan') * 0.3 + d('kebahagiaan') * 0.5;
  sc -= d('kemiskinan') * 2 + d('pengangguran') * 2 + d('korupsi') * 0.5 + d('kriminalitas') * 0.4 + Math.max(0, d('utang')) * 0.25;
  const pr = s.promises.filter(x => x.office === 'presiden');
  sc += pr.filter(x => x.resolved === 'tepati').length * 5 - pr.filter(x => x.resolved === 'ingkar').length * 5;
  sc += (s.char.attr.integritas - 50) * 0.15;
  if (hasFlag(s, 'menang_perang')) sc += 4;
  if (hasFlag(s, 'agresor')) sc -= 6;
  if (hasFlag(s, 'diktator')) sc -= 20;
  return Math.round(clamp(sc));
}
