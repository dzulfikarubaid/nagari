// Pemerintahan sebelum (dan sesudah) pemain: presiden AI dengan gaya berbeda, pemilu tiap 5 tahun, dan riwayatnya.
import type { GameState, Gov, GovRecord, GovSnapshot } from './types';
import { rand, range, pick, clamp, log, year } from './core';
import { GOV_STYLES, PARTIES } from '../content/data';
import { randomName } from '../content/npcs';

export const ELECTION_CYCLE = 60;

export const snapshot = (s: GameState): GovSnapshot => {
  const n = s.nation;
  return { pdb: n.pdb, pertumbuhan: n.pertumbuhan, inflasi: n.inflasi, pengangguran: n.pengangguran, kemiskinan: n.kemiskinan, korupsi: n.korupsi, utang: n.utang, kebahagiaan: n.kebahagiaan };
};

export const monthsToElection = (s: GameState) => Math.max(0, s.nextElection - s.turn);

function pickParty(s: GameState, not?: string | null): string {
  const pool = PARTIES.filter(p => p.id !== not);
  let r = rand(s) * pool.reduce((a, p) => a + (s.seats[p.id] ?? 10), 0);
  for (const p of pool) { r -= s.seats[p.id] ?? 10; if (r <= 0) return p.id; }
  return pool[0].id;
}

/** Lantik presiden AI baru dan pasang anggarannya. */
export function installGov(s: GameState, name: string, party: string | null, notStyle?: string) {
  const styles = GOV_STYLES.filter(g => g.id !== notStyle);
  const style = pick(s, styles);
  s.gov = { name, party, style: style.id, since: s.turn, term: 1 };
  s.aiBudget = JSON.parse(JSON.stringify(style.budget));
  s.govHistory.push({ name, party, style: style.id, fromYear: year(s), toYear: null, terms: 1, start: snapshot(s), end: null, how: null, player: false });
  s.nation.approval = clamp(52 + range(s, -4, 8));
}

/** Tutup catatan pemerintahan yang sedang berjalan. */
export function closeRecord(s: GameState, how: string) {
  const rec = s.govHistory[s.govHistory.length - 1];
  if (!rec || rec.toYear !== null) return;
  rec.toYear = year(s); rec.end = snapshot(s); rec.how = how;
}

export function initGov(s: GameState) {
  // Permainan dimulai di tengah masa jabatan seseorang.
  s.nextElection = 14 + Math.floor(rand(s) * 40);
  s.govHistory = [];
  installGov(s, randomName(() => rand(s)), pickParty(s));
  const started = s.nextElection - ELECTION_CYCLE;
  s.gov!.since = started;
  s.govHistory[0].fromYear = 2030 + Math.floor(started / 12);
}

/** Pemilu presiden tanpa pemain, atau setelah pemain kalah (winner diisi). */
export function nationalElection(s: GameState, winner?: { name: string; party: string | null }) {
  const g = s.gov;
  s.nextElection += ELECTION_CYCLE;
  const rec = s.govHistory[s.govHistory.length - 1];
  const reelect = winner ? (!!g && winner.name === g.name) : (!!g && g.term === 1 && s.nation.approval + range(s, -9, 9) >= 46);
  if (g && reelect) {
    g.term = 2;
    if (rec) rec.terms = 2;
    log(s, `Pemilu presiden: ${g.name} terpilih lagi untuk periode kedua.`);
    return;
  }
  const oldStyle = g?.style;
  closeRecord(s, g && g.term >= 2 ? 'Selesai dua periode' : 'Kalah pemilu');
  const party = winner ? winner.party : pickParty(s, g?.party);
  const name = winner ? winner.name : randomName(() => rand(s));
  installGov(s, name, party, oldStyle);
  const st = GOV_STYLES.find(x => x.id === s.gov!.style)!;
  log(s, `Pemilu presiden: ${name}${party ? ` (${PARTIES.find(p => p.id === party)?.short})` : ''} menang. Gaya pemerintahannya: ${st.name.toLowerCase()}.`);
}

/** Dipanggil tiap bulan selama pemain belum presiden. */
export function stepGov(s: GameState) {
  if (s.pres || !s.gov) return;
  const st = GOV_STYLES.find(x => x.id === s.gov!.style);
  // Pemerintahan korup sesekali diguncang skandal.
  if (st && st.integrity < 35 && rand(s) < 0.02) {
    s.nation.approval = clamp(s.nation.approval - range(s, 3, 7));
    log(s, `Skandal korupsi mengguncang pemerintahan ${s.gov.name}.`);
  }
  if (s.turn >= s.nextElection && s.campaign?.office !== 'presiden') nationalElection(s);
}

/** Pemain dilantik: pemerintahan AI berakhir dan masa pemain mulai dicatat. */
export function playerTakesOver(s: GameState) {
  closeRecord(s, s.gov && s.gov.term >= 2 ? 'Selesai dua periode' : 'Dikalahkan kamu');
  s.gov = null;
  s.govHistory.push({ name: s.char.name, party: s.char.party, style: 'pemain', fromYear: year(s), toYear: null, terms: 1, start: snapshot(s), end: null, how: null, player: true });
}

/** Save lama belum punya data pemerintahan. */
export function migrate(s: GameState): GameState {
  if (s.govHistory === undefined || s.nextElection === undefined) {
    s.govHistory = []; s.gov = null; s.nextElection = s.turn + 30;
    if (!s.pres) { installGov(s, randomName(() => rand(s)), pickParty(s)); s.nextElection = s.turn + 12 + Math.floor(rand(s) * 36); }
    else s.govHistory.push({ name: s.char.name, party: s.char.party, style: 'pemain', fromYear: year(s), toYear: null, terms: s.pres.term, start: snapshot(s), end: null, how: null, player: true });
  }
  return s;
}

export type { Gov, GovRecord };
