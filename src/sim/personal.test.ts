import { describe, it, expect } from 'vitest';
import { newGame, dispatch, type GameState, type Action } from './index';
import { EVENT_MAP } from './events';
import { enrollBlock } from './life';
import { scholarshipBlock, scholarshipReqs } from './personal';
import { freeHours, effectiveTime } from './time';

/** Maju n bulan; jawab event dengan pilihan aman pertama, coblos calon pertama. */
function run(s: GameState, n: number): GameState {
  for (let i = 0; i < n && !s.ending; i++) {
    let guard = 0;
    while (!s.ending && guard++ < 20 && (s.result || s.pending.length || s.ballot || s.lastElection)) {
      if (s.result) s = dispatch(s, { type: 'dismissResult' });
      else if (s.lastElection) s = dispatch(s, { type: 'dismissElection' });
      else if (s.ballot) s = dispatch(s, { type: 'vote', index: 0, party: null, endorse: false });
      else { const ev = EVENT_MAP[s.pending[0].id]; const k = ev.choices.findIndex(c => !c.need && !c.fx?.end && !c.fx?.jail); s = dispatch(s, { type: 'choose', index: Math.max(0, k) }); }
    }
    s = dispatch(s, { type: 'next' });
  }
  return s;
}
const go = (s: GameState, a: Action) => { s = dispatch(s, a); return s.result ? dispatch(s, { type: 'dismissResult' }) : s; };

describe('kehidupan pribadi', () => {
  it('waktu seminggu: kerja dan macet memakan jam; kerja sampingan menghasilkan uang; kurang tidur merusak', () => {
    let s = newGame({ name: 'W', gender: 'L', background: 'menengah', seed: 12 });
    const freeJobless = freeHours(s);
    s.char.job = 'konsultan'; s.char.home.city = 'ibukota'; s.char.home.housing = 'kos';
    const freeWorker = freeHours(s);
    expect(freeJobless - freeWorker).toBeGreaterThan(60);
    // Jadwal melebihi jam bebas dikecilkan rata.
    s = dispatch(s, { type: 'setTime', time: { belajar: 40, istirahat: 40, sosialisasi: 30 }, sleep: 7 });
    const t = effectiveTime(s);
    expect(Object.values(t).reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(freeHours(s) + 0.01);
    // Mahasiswa narik ojol di kota.
    let m = newGame({ name: 'O', gender: 'L', background: 'menengah', seed: 13 });
    m.char.home.city = 'provinsi'; m.char.home.housing = 'kos';
    m = dispatch(m, { type: 'setTime', time: { ojol: 20 }, sleep: 5 });
    const h0 = m.char.attr.kesehatan;
    m = dispatch(m, { type: 'next' });
    expect(m.char.ledger['Ojek daring']).toBeGreaterThan(1);
    expect(m.char.attr.kesehatan).toBeLessThan(h0);
  });

  it('saldo awal nol; biaya kuliah tergantung orang tua, beasiswa bisa didaftar sekalian', () => {
    let s = newGame({ name: 'D', gender: 'L', background: 'petani', seed: 4 });
    expect(s.char.money).toBe(0);
    expect(enrollBlock(s, 'swasta', 'ekonomi')).toMatch(/Orang tua hanya sanggup/);
    expect(enrollBlock(s, 'swasta', 'ekonomi', 'kip')).toBeNull();
    const rich = newGame({ name: 'E', gender: 'L', background: 'pengusaha', seed: 4 });
    expect(rich.char.money).toBe(0);
    expect(enrollBlock(rich, 'swasta', 'ekonomi')).toBeNull();
    s.char.attr.kecerdasan = 95; s.char.attr.integritas = 95;
    // Beasiswa Asa Nagari baru dibuka Februari; Januari masih tutup.
    expect(scholarshipBlock(s, 'kip')).toMatch(/Belum dibuka/);
    s.turn = 1;
    expect(scholarshipBlock(s, 'kip')).toBeNull();
    expect(scholarshipBlock(rich, 'kip')).not.toBeNull();
    expect(scholarshipReqs(s, 'korporasi').some(r => !r.ok)).toBe(true);
    s = dispatch(s, { type: 'enroll', campus: 'swasta', major: 'ekonomi', scholarship: 'kip' });
    expect(s.char.edu?.funding).toBe('kip');
    s = dispatch(s, { type: 'dismissResult' });
    s = dispatch(s, { type: 'next' });
    expect(s.char.ledger['Uang saku orang tua']).toBeGreaterThan(0);
    expect(s.char.ledger['Beasiswa (biaya hidup)']).toBeGreaterThan(0);
  });

  it('kuliah memindahkan ke kota kampus dan IPK berjalan', () => {
    let s = newGame({ name: 'A', gender: 'P', background: 'petani', seed: 3, aspiration: 'ilmuwan' });
    expect(s.char.home.city).toBe('desa');
    expect(s.char.home.housing).toBe('ortu');
    s.char.attr.kecerdasan = 90; s.char.money = 500;
    s = go(s, { type: 'enroll', campus: 'swasta', major: 'mipa' });
    expect(s.char.edu).not.toBeNull();
    expect(s.char.home.city).toBe('provinsi');
    s = run(s, 14);
    expect(s.char.edu!.gpa).toBeGreaterThan(2.5);
    s = go(s, { type: 'startResearch', topic: s.char.edu ? 'Senyawa antikanker dari tanaman hutan' : '', scope: 'kecil' });
    expect(s.char.research).not.toBeNull();
    s = go(s, { type: 'setPlan', plan: ['riset', 'belajar', 'istirahat'] });
    s = run(s, 12);
    expect(s.char.pubs.length + (s.char.research ? 0 : 1)).toBeGreaterThan(0);
  });

  it('kerja, KPR, pacaran, menikah, dan punya anak', () => {
    let s = newGame({ name: 'B', gender: 'L', background: 'menengah', seed: 9, aspiration: 'keluarga' });
    s.char.ageMonths = 26 * 12; s.char.degree = 'S1'; s.char.major = 'ekonomi'; s.char.gpa = 3.4; s.char.money = 300;
    s.char.attr.kecerdasan = 85; s.char.attr.karisma = 85;
    s = go(s, { type: 'move', city: 'provinsi', housing: 'kos' });
    expect(s.char.home.city).toBe('provinsi');
    for (let i = 0; i < 5 && !s.char.job; i++) { s = go(s, { type: 'takeJob', job: 'akuntan' }); if (!s.char.job) s.flags['tolak:job:akuntan'] = -99; }
    expect(s.char.job).toBe('akuntan');
    s = go(s, { type: 'buyHouse', kpr: true });
    expect(s.char.home.house).not.toBeNull();
    expect(s.char.home.kpr).not.toBeNull();
    for (let i = 0; i < 20 && !s.char.partner; i++) {
      s.char.loveLeft = 0; s.socialLeft = 2;
      s = go(s, { type: 'findLove', via: 'teman' });
      if (s.char.prospect) s = go(s, { type: 'love', act: 'dekati' });
    }
    expect(s.char.partner).not.toBeNull();
    s.char.partner!.love = 90; s.char.partner!.fit = 10;
    for (let i = 0; i < 10 && s.char.partner!.stage === 'pdkt'; i++) s = go(s, { type: 'love', act: 'tembak' });
    expect(s.char.partner!.stage).toBe('pacaran');
    s.char.partner!.months = 13; s.char.partner!.love = 95; s.char.money = 300;
    for (let i = 0; i < 10 && s.char.partner!.stage === 'pacaran'; i++) s = go(s, { type: 'love', act: 'lamar' });
    expect(s.char.partner!.stage).toBe('tunangan');
    s = go(s, { type: 'love', act: 'nikah', size: 'sederhana' });
    expect(s.char.partner!.stage).toBe('menikah');
    s = go(s, { type: 'wantKids', on: true });
    s = go(s, { type: 'setPlan', plan: ['keluarga', 'pasangan', 'kerja_keras'] });
    s = run(s, 72);
    expect(s.char.children.length).toBeGreaterThan(0);
  });

  it('warga ikut mencoblos dan presiden berganti lewat surat suara', () => {
    let s = newGame({ name: 'C', gender: 'L', background: 'menengah', seed: 5 });
    const due = s.nextElection;
    let sawBallot = false;
    for (let i = 0; i < due + 2 && !s.ending; i++) {
      while (s.result || s.pending.length) s = s.result ? dispatch(s, { type: 'dismissResult' }) : dispatch(s, { type: 'choose', index: 0 });
      if (s.ballot) { sawBallot = true; s = dispatch(s, { type: 'vote', index: 1, party: 'phm', endorse: false }); }
      s = dispatch(s, { type: 'next' });
    }
    expect(sawBallot).toBe(true);
    expect(s.char.votes).toBe(1);
    expect(s.nextElection).toBeGreaterThan(due);
  });
});
