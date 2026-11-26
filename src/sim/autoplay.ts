// Pemain otomatis untuk uji dan penyeimbangan. Tidak dipakai UI.
import type { GameState, Action, Choice, Fx, MinistryId, OfficeId, RegionKey } from './types';
import { dispatch, newGame, blocked } from './index';
import { check, age } from './core';
import { EVENT_MAP } from './events';
import { declareBlock, campaignActBlock, programBlock } from './election';
import { jobBlock, enrollBlock } from './life';
import { ministerCandidates, policyBlock, diploBlock } from './presidency';
import { coalitionSeats, fiscal } from './nation';
import { JOBS, MINISTRIES, PARTIES, PROMISES, POLICIES } from '../content/data';

/** lalim = meniti karier dengan rapi, lalu memerintah seenaknya. */
export type Strategy = 'terencana' | 'ceroboh' | 'nekat' | 'lalim';

const fxRisk = (f?: Fx) => !f ? 0 : (f.heat ?? 0) + (f.jail ?? 0) * 2 + (f.end ? 200 : 0) + (f.hint ? 4 : 0) - (f.attr?.integritas ?? 0);
function choiceRisk(c: Choice): number {
  return fxRisk(c.fx) + (c.outcomes ?? []).reduce((a, o) => a + o.chance * fxRisk(o.fx), 0);
}
const fxGreed = (f?: Fx) => !f ? 0 : (f.money ?? 0) + (f.momentum ?? 0) * 5;

function chooseIndex(s: GameState, strat: Strategy): number {
  const pe = s.pending[0];
  const ev = EVENT_MAP[pe.id];
  const rng = s.rng;
  const ok = ev.choices.map((c, i) => ({ c, i })).filter(x => check(s, x.c.need, pe.npcId) !== false);
  s.rng = rng;
  if (!ok.length) return -1;
  if (strat === 'terencana') return ok.sort((a, b) => choiceRisk(a.c) - choiceRisk(b.c))[0].i;
  return ok.sort((a, b) => (fxGreed(b.c.fx) + choiceRisk(b.c)) - (fxGreed(a.c.fx) + choiceRisk(a.c)))[0].i;
}

function act(s: GameState, a: Action): GameState { return dispatch(s, a); }

function planned(s: GameState): GameState {
  const c = s.char;
  const a = age(s);
  if (c.jail > 0) return s;
  if (c.habits.length === 0) s = act(s, { type: 'setHabits', habits: ['olahraga', 'membaca', 'relawan'] });
  // Pendidikan dulu.
  if (!c.degree && !c.edu && a < 20) {
    for (const campus of ['negeri_favorit', 'negeri_daerah', 'swasta']) {
      if (!enrollBlock(s, campus, 'politik')) { s = act(s, { type: 'enroll', campus, major: 'politik' }); break; }
    }
  }
  if (!s.char.edu && !s.char.job && !s.office) {
    const prefs = ['pengacara', 'pns', 'guru', 'jurnalis', 'pedagang', 'petani'];
    for (const j of prefs) { const job = JOBS.find(x => x.id === j)!; if (!jobBlock(s, job)) { s = act(s, { type: 'takeJob', job: j }); break; } }
  }
  if (!s.char.party && a >= 22) s = act(s, { type: 'joinParty', party: 'pbn' });
  const plan = s.char.edu ? ['belajar', 'sosialisasi', 'blusukan']
    : s.char.attr.stres > 60 ? ['istirahat', 'blusukan', 'istirahat']
    : s.char.party ? ['kerja_keras', 'blusukan', 'partai'] : ['kerja_keras', 'blusukan', 'sosialisasi'];
  if (s.office) plan.unshift(s.char.attr.stres > 55 ? 'istirahat' : s.char.party ? 'partai' : 'blusukan');
  s = act(s, { type: 'setPlan', plan });
  // Rawat teman.
  for (const n of s.npcs.filter(n => n.met && n.rel < 70 && n.integrity >= 50).slice(0, 2)) s = act(s, { type: 'npc', npcId: n.id, act: 'akrab' });
  return s;
}

function reckless(s: GameState): GameState {
  const c = s.char;
  if (c.jail > 0) return s;
  if (c.habits.length === 0) s = act(s, { type: 'setHabits', habits: ['judi', 'minum', 'begadang'] });
  if (!c.job && !s.office && !c.edu) {
    for (const j of ['influencer', 'pengusaha', 'pedagang', 'buruh']) { const job = JOBS.find(x => x.id === j)!; if (!jobBlock(s, job)) { s = act(s, { type: 'takeJob', job: j }); break; } }
  }
  if (!c.party && age(s) >= 20) s = act(s, { type: 'joinParty', party: 'pkr' });
  s = act(s, { type: 'setPlan', plan: ['kerja_keras', 'usaha', 'sosialisasi'] });
  for (const n of s.npcs.filter(n => n.met && n.rel < 70).slice(0, 2)) s = act(s, { type: 'npc', npcId: n.id, act: 'akrab' });
  return s;
}

function tryDeclare(s: GameState, strat: Strategy): GameState {
  if (s.campaign || s.pres) return s;
  const c = s.char;
  const order: OfficeId[] = strat === 'terencana' ? ['kades', 'bupati', 'gubernur', 'presiden'] : ['presiden', 'gubernur', 'bupati', 'kades'];
  const tier: Record<OfficeId, number> = { kades: 0, bupati: 1, gubernur: 2, presiden: 3 };
  const cur = s.office ? tier[s.office.id] : -1;
  for (const o of order) {
    if (strat === 'terencana') {
      // Naik hanya kalau basis cukup kuat.
      if (tier[o] > cur + 1 && !(cur === -1 && c.everOffice.length && tier[o] <= Math.max(...c.everOffice.map(x => tier[x])) + 1)) continue;
      const lvl = ({ kades: 'desa', bupati: 'kabupaten', gubernur: 'provinsi', presiden: 'nasional' } as const)[o];
      const needPop = [28, 30, 32, 34][tier[o]];
      if (tier[o] !== cur && c.pop[lvl] < needPop) continue;
      if (tier[o] === cur && (s.office!.region.kepuasan < 45)) continue;
    }
    for (const via of [true, false]) {
      if (!declareBlock(s, o, via)) return act(s, { type: 'declare', office: o, viaParty: via });
    }
  }
  return s;
}

function campaign(s: GameState, strat: Strategy): GameState {
  let guard = 0;
  while (s.campaign && s.campaign.actionsLeft > 0 && guard++ < 4) {
    const cp = s.campaign;
    const promise = PROMISES.find(p => p.levels.includes(cp.office) && !campaignActBlock(s, 'janji', p.id));
    const supporter = s.npcs.find(n => n.met && n.rel >= 50 && !n.memory.includes('mendukung') && (strat !== 'terencana' || n.role !== 'preman'));
    if (supporter && s.socialLeft > 0) s = act(s, { type: 'npc', npcId: supporter.id, act: 'minta_dukungan' });
    const donor = s.npcs.find(n => n.met && n.rel >= 45 && n.role === 'pengusaha' && (strat !== 'terencana' || n.integrity >= 55));
    if (donor && s.socialLeft > 0 && s.char.money < 500) s = act(s, { type: 'npc', npcId: donor.id, act: 'minta_dana' });
    const prefs = strat === 'terencana'
      ? [promise && s.promises.filter(p => !p.resolved && p.office === cp.office).length < 1 ? 'janji' : '', 'iklan', 'debat', 'blusukan']
      : ['serangan_fajar', 'janji', 'kampanye_hitam', 'iklan', 'blusukan'];
    let done = false;
    for (const p of prefs) {
      if (!p) continue;
      if (p === 'debat' && (s.char.attr.karisma + s.char.attr.kecerdasan) / 2 < 55) continue;
      if (!campaignActBlock(s, p, promise?.id)) { s = act(s, { type: 'campaignAct', act: p, promise: promise?.id }); done = true; break; }
    }
    if (!done) s = act(s, { type: 'campaignAct', act: 'blusukan' });
  }
  return s;
}

function localOffice(s: GameState, strat: Strategy): GameState {
  const o = s.office;
  if (!o || o.id === 'presiden' || o.programDone) return s;
  if (strat !== 'terencana') {
    const p = !programBlock(s, 'titipan') ? 'titipan' : 'pad';
    return act(s, { type: 'program', program: p });
  }
  if (o.region.kas < 14) return act(s, { type: 'program', program: o.region.kepuasan > 45 ? 'pad' : 'hemat' });
  const map: [RegionKey, string][] = [['infrastruktur', 'infra'], ['kesejahteraan', 'bansos'], ['keamanan', 'aman'], ['layanan', 'layanan']];
  // Dahulukan yang dijanjikan.
  const promised: Record<string, string> = { jalan_mulus: 'infra', warga_sejahtera: 'bansos', kampung_aman: 'aman', layanan_gratis: 'layanan' };
  const open = s.promises.find(p => p.office === o.id && !p.resolved);
  if (open && promised[open.id] && s.turn % 2 === 0) return act(s, { type: 'program', program: promised[open.id] });
  const low = map.sort((a, b) => o.region[a[0]] - o.region[b[0]])[0][1];
  return act(s, { type: 'program', program: low });
}

function president(s: GameState, strat: Strategy): GameState {
  const p = s.pres;
  if (!p) return s;
  const smart = strat === 'terencana';
  // Koalisi sampai mayoritas.
  if (coalitionSeats(s) < 55) {
    const cand = PARTIES.filter(x => p.coalition[x.id] === undefined).sort((a, b) => (s.seats[b.id] ?? 0) - (s.seats[a.id] ?? 0))[0];
    if (cand && p.capital >= 8) s = act(s, { type: 'coalition', party: cand.id, join: true });
  }
  // Kabinet.
  for (const m of MINISTRIES) {
    if (s.pres!.cabinet[m.id as MinistryId]) continue;
    const used = new Set(Object.values(s.pres!.cabinet));
    const cands = ministerCandidates(s).filter(n => !used.has(n.id));
    const needParty = Object.keys(s.pres!.coalition).find(pid => !Object.values(s.pres!.cabinet).some(id => cands.concat(ministerCandidates(s)).find(n => n.id === id)?.party === pid));
    let best = smart
      ? cands.filter(n => n.expertise === m.id).sort((a, b) => (b.competence + b.integrity * 0.5) - (a.competence + a.integrity * 0.5))[0]
      : cands.sort((a, b) => b.rel - a.rel || b.influence - a.influence)[0];
    if (smart && needParty) { const pc = cands.filter(n => n.party === needParty).sort((a, b) => b.competence - a.competence)[0]; if (pc) best = pc; }
    if (!best) best = cands[0];
    if (best) s = act(s, { type: 'appoint', ministry: m.id as MinistryId, npcId: best.id });
  }
  if (smart) {
    const f = fiscal(s);
    const b = JSON.parse(JSON.stringify(s.pres!.budget));
    if (s.turn % 6 === 0) {
      if (f.balance < -3.5 && b.pajak < 27) b.pajak += 1;
      if (f.balance > -1.5) { b.belanja.pendidikan = Math.min(4.5, b.belanja.pendidikan + 0.25); b.belanja.kesehatan = Math.min(3.5, b.belanja.kesehatan + 0.25); b.belanja.sosial = Math.min(3, b.belanja.sosial + 0.25); }
      s = act(s, { type: 'setBudget', budget: b });
    }
    for (const id of ['digitalisasi', 'polisi_bersih', 'kpk_kuat', 'pasar_bebas', 'syariah_ekonomi']) {
      if (!policyBlock(s, id, true) && s.pres!.capital > 45) { s = act(s, { type: 'policy', id, enact: true }); break; }
    }
    const low = [...s.pres!.countries].sort((a, b) => a.rel - b.rel)[0];
    if (low && !diploBlock(s, low.id, 'kunjungan') && s.pres!.capital > 20) s = act(s, { type: 'diplo', country: low.id, act: 'kunjungan' });
    for (const cs of s.pres!.countries) if (!diploBlock(s, cs.id, 'dagang')) { s = act(s, { type: 'diplo', country: cs.id, act: 'dagang' }); break; }
  } else {
    for (const pol of POLICIES.filter(x => ['subsidi_bbm', 'bansos', 'kpk_lemah', 'sensor_media', 'ibu_kota', 'tiga_periode', 'modernisasi_alutsista'].includes(x.id))) {
      if (!policyBlock(s, pol.id, true)) { s = act(s, { type: 'policy', id: pol.id, enact: true }); break; }
    }
    const b = JSON.parse(JSON.stringify(s.pres!.budget)); b.pajak = 14; b.belanja.sosial = 5; b.belanja.pertahanan = 4;
    s = act(s, { type: 'setBudget', budget: b });
    const weak = s.pres!.countries.find(c => c.id === 'malaka');
    if (strat === 'nekat' && weak && !s.pres!.war && !diploBlock(s, weak.id, 'perang') && s.turn % 7 === 0) s = act(s, { type: 'diplo', country: weak.id, act: 'perang' });
  }
  if (s.pres?.war) s = act(s, { type: 'war', act: s.pres.war.progress < -40 ? 'damai' : smart ? 'bertahan' : 'serang' });
  return s;
}

export interface RunResult { state: GameState; turns: number; reachedPresident: boolean }

export function autoplay(seed: number, strat: Strategy, background = 'menengah', maxTurns = 900, until?: (s: GameState) => boolean): RunResult {
  let s = newGame({ name: 'Uji', gender: 'L', background, seed });
  let turns = 0;
  let reached = false;
  while (!s.ending && turns < maxTurns) {
    let guard = 0;
    while (blocked(s) && !s.ending && guard++ < 20) {
      if (s.result) s = act(s, { type: 'dismissResult' });
      else if (s.lastElection) s = act(s, { type: 'dismissElection' });
      else if (s.pending.length) {
        const i = chooseIndex(s, strat === 'lalim' ? (s.pres ? 'nekat' : 'terencana') : strat);
        if (i < 0) throw new Error(`Event ${s.pending[0].id} tidak punya pilihan yang bisa diambil`);
        s = act(s, { type: 'choose', index: i });
      }
    }
    if (s.ending || until?.(s)) break;
    s = strat === 'ceroboh' ? reckless(s) : planned(s);
    const pre: Strategy = strat === 'lalim' ? 'terencana' : strat;
    s = tryDeclare(s, pre);
    s = campaign(s, pre);
    s = localOffice(s, pre);
    s = president(s, strat === 'lalim' ? 'nekat' : strat);
    if (s.pres) reached = true;
    s = act(s, { type: 'next' });
    turns++;
  }
  return { state: s, turns, reachedPresident: reached };
}
