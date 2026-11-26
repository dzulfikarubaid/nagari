// Pintu masuk simulasi: newGame() dan dispatch(state, action) → state baru.
import type { GameState, Action, AttrKey, Npc } from './types';
import './endings';
import { rand, clamp, addHistory, setFlag } from './core';
import { initNation, stepNation, DEFAULT_BUDGET } from './nation';
import { stepLife, setPlan, setHabits, takeJob, quitJob, enroll, dropOut, joinParty, leaveParty, npcAction } from './life';
import { declare, campaignAct, stepCampaign, runProgram, stepOffice } from './election';
import { stepPresidency, appoint, coalitionAct, policyAct, setBudget, diploAct, warAct, resign } from './presidency';
import { processScheduled, rollEvent, chooseEvent, pruneDead } from './events';
import { BACKGROUNDS, PARTIES } from '../content/data';
import { NPC_TEMPLATES } from '../content/npcs';

export interface NewGameOpts { name: string; gender: 'L' | 'P'; background: string; seed?: number; boost?: AttrKey }

export function newGame(o: NewGameOpts): GameState {
  const seed = o.seed ?? Math.floor(Math.random() * 2 ** 31);
  const s: GameState = {
    version: 1, seed, rng: seed, turn: 0,
    char: {
      name: o.name || 'Tanpa Nama', gender: o.gender, ageMonths: 18 * 12,
      attr: { kecerdasan: 45, karisma: 45, integritas: 55, kesehatan: 75, stres: 15, jaringan: 20 },
      pop: { desa: 8, kabupaten: 1, provinsi: 0, nasional: 0 },
      money: 0, job: null, jobLevel: 0, jobMonths: 0, habits: [], plan: ['belajar', 'sosialisasi', 'istirahat'],
      degree: null, major: null, campus: null, edu: null, party: null, partyStanding: 0,
      heat: 0, jail: 0, debtMonths: 0, everOffice: [], cooldown: 0,
    },
    npcs: [], seats: {}, office: null, campaign: null, lastElection: null, pres: null,
    nation: {} as GameState['nation'], nationHist: [], aiBudget: JSON.parse(JSON.stringify(DEFAULT_BUDGET)),
    flags: {}, history: [], scheduled: [], promises: [], pending: [], result: null, seen: {}, log: [], socialLeft: 2, ending: null,
  };
  const r = () => rand(s);
  s.nation = initNation(r);
  s.nationHist.push({ ...s.nation });
  for (const k of Object.keys(s.char.attr) as AttrKey[]) if (k !== 'stres') s.char.attr[k] = clamp(s.char.attr[k] + (r() * 16 - 8));
  const bg = BACKGROUNDS.find(b => b.id === o.background) ?? BACKGROUNDS[1];
  s.char.money = bg.money;
  for (const [k, v] of Object.entries(bg.attr) as [AttrKey, number][]) s.char.attr[k] = clamp(s.char.attr[k] + v);
  bg.flags.forEach(f => setFlag(s, f));
  if (o.boost) s.char.attr[o.boost] = clamp(s.char.attr[o.boost] + 12);

  // Kursi DPR sedikit berbeda tiap permainan.
  let total = 0;
  for (const p of PARTIES) { s.seats[p.id] = Math.max(4, p.seats + Math.round(r() * 10 - 5)); total += s.seats[p.id]; }
  for (const p of PARTIES) s.seats[p.id] = Math.round(s.seats[p.id] / total * 100);

  // Tokoh: semua ketua partai + 15 tokoh acak lain.
  const chairs = NPC_TEMPLATES.filter(n => n.id.startsWith('ketum_'));
  const rest = NPC_TEMPLATES.filter(n => !n.id.startsWith('ketum_')).map(n => ({ n, k: r() })).sort((a, b) => a.k - b.k).slice(0, 16).map(x => x.n);
  s.npcs = [...chairs, ...rest].map(n => JSON.parse(JSON.stringify(n)) as Npc);
  const know = (role: string) => { const n = s.npcs.find(x => x.role === role && !x.met); if (n) { n.met = true; n.rel = 35; } };
  if (bg.id === 'dinasti') know('politisi');
  if (bg.id === 'santri') know('ulama');
  if (bg.id === 'pengusaha') know('pengusaha');
  addHistory(s, `${s.char.name}, 18 tahun, ${bg.name.toLowerCase()}, lulus SMA dan bermimpi jadi presiden.`);
  return s;
}

/** Ada sesuatu yang harus dijawab pemain sebelum waktu boleh maju? */
export const blocked = (s: GameState) => !!s.ending || s.pending.length > 0 || !!s.result || !!s.lastElection;

function next(s: GameState) {
  if (blocked(s)) return;
  s.turn++;
  stepNation(s);
  stepLife(s);
  if (s.ending) return;
  stepCampaign(s);
  if (s.ending) return;
  stepOffice(s);
  stepPresidency(s);
  if (s.ending) return;
  processScheduled(s);
  rollEvent(s);
}

export function dispatch(state: GameState, a: Action): GameState {
  const s: GameState = structuredClone(state);
  if (s.ending && a.type !== 'dismissResult' && a.type !== 'dismissElection') return s;
  switch (a.type) {
    case 'setPlan': setPlan(s, a.plan); break;
    case 'setHabits': setHabits(s, a.habits); break;
    case 'takeJob': takeJob(s, a.job); break;
    case 'quitJob': quitJob(s); break;
    case 'enroll': enroll(s, a.campus, a.major); break;
    case 'dropOut': dropOut(s); break;
    case 'joinParty': joinParty(s, a.party); break;
    case 'leaveParty': leaveParty(s); break;
    case 'npc': npcAction(s, a.npcId, a.act); break;
    case 'declare': declare(s, a.office, a.viaParty); break;
    case 'campaignAct': campaignAct(s, a.act, a.promise); break;
    case 'program': runProgram(s, a.program); break;
    case 'choose': chooseEvent(s, a.index); break;
    case 'dismissResult': s.result = null; break;
    case 'dismissElection': s.lastElection = null; break;
    case 'setBudget': setBudget(s, a.budget); break;
    case 'appoint': appoint(s, a.ministry, a.npcId); break;
    case 'coalition': coalitionAct(s, a.party, a.join); break;
    case 'policy': policyAct(s, a.id, a.enact); break;
    case 'diplo': diploAct(s, a.country, a.act); break;
    case 'war': warAct(s, a.act); break;
    case 'resign': resign(s); break;
    case 'next': next(s); break;
  }
  pruneDead(s);
  return s;
}

export * from './types';
