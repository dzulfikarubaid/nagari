import { describe, it, expect } from 'vitest';
import { autoplay, type Strategy } from './autoplay';
import { newGame, dispatch } from './index';
import { ALL_EVENTS, EVENT_MAP } from './events';
import { JOBS, HABITS } from '../content/data';
import type { Fx, GameState } from './types';

const allFx = (): Fx[] => ALL_EVENTS.flatMap(e => e.choices.flatMap(c => [c.fx, ...(c.outcomes ?? []).map(o => o.fx)])).filter(Boolean) as Fx[];

describe('konten', () => {
  it('id event unik', () => {
    expect(new Set(ALL_EVENTS.map(e => e.id)).size).toBe(ALL_EVENTS.length);
  });
  it('semua event terjadwal ada', () => {
    const missing = allFx().flatMap(f => f.schedule ?? []).filter(sc => !EVENT_MAP[sc.id]).map(sc => sc.id);
    expect(missing).toEqual([]);
  });
  it('tidak ada event yang tak terjangkau', () => {
    const scheduled = new Set(allFx().flatMap(f => (f.schedule ?? []).map(x => x.id)));
    const engine = new Set(['skandal_terbongkar', 'kpk_panggil', 'tagih_budi', 'balas_dendam']);
    const orphan = ALL_EVENTS.filter(e => !e.weight && !scheduled.has(e.id) && !engine.has(e.id)).map(e => e.id);
    expect(orphan).toEqual([]);
  });
  it('syarat merujuk pekerjaan dan kebiasaan yang ada; peluang ≤ 1', () => {
    for (const e of ALL_EVENTS) {
      for (const j of e.when?.jobs ?? []) expect(JOBS.some(x => x.id === j), `${e.id}: job ${j}`).toBe(true);
      for (const h of e.when?.habits ?? []) expect(HABITS.some(x => x.id === h), `${e.id}: habit ${h}`).toBe(true);
      expect(e.choices.length, e.id).toBeGreaterThanOrEqual(2);
      for (const c of e.choices) expect((c.outcomes ?? []).reduce((a, o) => a + o.chance, 0), e.id).toBeLessThanOrEqual(1.0001);
    }
  });
});

function sane(s: GameState) {
  for (const [k, v] of Object.entries(s.nation)) expect(Number.isFinite(v), `nation.${k}`).toBe(true);
  for (const [k, v] of Object.entries(s.char.attr)) { expect(v, `attr.${k}`).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(100); }
  expect(Number.isFinite(s.char.money)).toBe(true);
  expect(s.nation.pengangguran).toBeLessThan(35);
  expect(s.nation.inflasi).toBeLessThan(55);
}

describe('auto-play', () => {
  const SEEDS = Array.from({ length: 24 }, (_, i) => 1000 + i * 37);
  const runs: Record<Strategy, ReturnType<typeof autoplay>[]> = { terencana: [], ceroboh: [], nekat: [], lalim: [] };
  it('semua permainan tamat tanpa crash dan angka tetap wajar', () => {
    for (const st of Object.keys(runs) as Strategy[]) for (const seed of SEEDS) {
      const bg = ['menengah', 'petani', 'pengusaha', 'dinasti', 'santri'][seed % 5];
      const r = autoplay(seed, st, bg);
      expect(r.state.ending, `seed ${seed} ${st} tidak tamat`).not.toBeNull();
      sane(r.state);
      runs[st].push(r);
    }
  }, 300000);

  it('perencanaan berarti: terencana lebih sering jadi presiden daripada ceroboh', () => {
    const rate = (st: Strategy) => runs[st].filter(r => r.reachedPresident).length / runs[st].length;
    const ends: Record<string, number> = {};
    for (const st of Object.keys(runs) as Strategy[]) for (const r of runs[st]) { const k = `${st}:${r.state.ending!.id}`; ends[k] = (ends[k] ?? 0) + 1; }
    console.log('presiden:', { terencana: rate('terencana'), ceroboh: rate('ceroboh'), nekat: rate('nekat'), lalim: rate('lalim') });
    console.log('skor presiden terencana:', runs.terencana.filter(r => r.reachedPresident).map(r => r.state.ending!.score));
    console.log(ends);
    console.log('lalim:', runs.lalim.filter(r => r.reachedPresident).map(r => [r.state.ending!.id, r.state.ending!.score, Math.round(r.state.nation.approval), Math.round(r.state.nation.stabilitas), Math.round(r.state.nation.utang), r.state.pres!.term, r.state.pres!.monthsLeft].join('/')));
    expect(rate('terencana')).toBeGreaterThan(0.2);
    expect(rate('terencana')).toBeLessThan(0.95);
    expect(rate('terencana')).toBeGreaterThan(rate('ceroboh'));
    const kinds = new Set(Object.values(runs).flat().map(r => r.state.ending!.id));
    expect(kinds.size).toBeGreaterThanOrEqual(6);
  });

  it('deterministik untuk seed yang sama', () => {
    const a = autoplay(4242, 'terencana'), b = autoplay(4242, 'terencana');
    expect(a.turns).toBe(b.turns);
    expect(a.state.ending!.id).toBe(b.state.ending!.id);
    expect(a.state.char.money).toBe(b.state.char.money);
  });
});

describe('konsekuensi', () => {
  it('efek tertunda jatuh di bulan yang benar dan dicatat sebagai akibat', () => {
    let s = newGame({ name: 'A', gender: 'P', background: 'menengah', seed: 7 });
    s = { ...s, scheduled: [{ id: 'kpk_panggil', due: s.turn + 3 }] };
    for (let i = 0; i < 2; i++) { s = dispatch(s, { type: 'next' }); while (s.pending.length || s.result) s = s.result ? dispatch(s, { type: 'dismissResult' }) : dispatch(s, { type: 'choose', index: 0 }); }
    expect(s.scheduled.some(x => x.id === 'kpk_panggil')).toBe(true);
    s = dispatch(s, { type: 'next' });
    expect(s.pending.some(p => p.id === 'kpk_panggil' && p.delayed)).toBe(true);
    const idx = s.pending.findIndex(p => p.id === 'kpk_panggil');
    while (s.pending[0].id !== 'kpk_panggil') { s = dispatch(s, { type: 'choose', index: 0 }); s = dispatch(s, { type: 'dismissResult' }); }
    expect(idx).toBeGreaterThanOrEqual(0);
    s = dispatch(s, { type: 'choose', index: 0 });
    expect(s.history.some(h => h.kind === 'akibat' && h.text.includes('Akibat keputusan lama'))).toBe(true);
  });

  it('janji yang diingkari menurunkan popularitas dan meninggalkan jejak', () => {
    let s = newGame({ name: 'B', gender: 'L', background: 'petani', seed: 11 });
    s.char.ageMonths = 25 * 12; s.char.pop.desa = 80; s.char.money = 100;
    s = dispatch(s, { type: 'declare', office: 'kades', viaParty: false });
    s = dispatch(s, { type: 'campaignAct', act: 'janji', promise: 'jalan_mulus' });
    let guard = 0;
    while (!s.ending && guard++ < 400 && !s.flags['ingkar_janji']) {
      if (s.result) s = dispatch(s, { type: 'dismissResult' });
      else if (s.lastElection) s = dispatch(s, { type: 'dismissElection' });
      else if (s.pending.length) { const ev = EVENT_MAP[s.pending[0].id]; const i = ev.choices.findIndex(c => !c.need && !c.fx?.end && !c.fx?.jail && !c.outcomes); s = dispatch(s, { type: 'choose', index: i < 0 ? 0 : i }); }
      else s = dispatch(s, { type: 'next' });
    }
    expect(s.char.everOffice).toContain('kades');
    expect(s.flags['ingkar_janji']).toBeDefined();
    expect(s.history.some(h => h.text.startsWith('Janji diingkari'))).toBe(true);
  });
});

describe('pemerintahan AI', () => {
  it('presiden berganti lewat pemilu 5 tahunan dan riwayatnya tercatat', () => {
    let s = newGame({ name: 'C', gender: 'L', background: 'menengah', seed: 21 });
    expect(s.gov).not.toBeNull();
    expect(s.govHistory.length).toBe(1);
    const first = s.gov!.name;
    for (let i = 0; i < 260 && !s.ending; i++) {
      if (s.result) s = dispatch(s, { type: 'dismissResult' });
      else if (s.pending.length) { const ev = EVENT_MAP[s.pending[0].id]; const k = ev.choices.findIndex(c => !c.need && !c.fx?.end && !c.fx?.jail && !c.outcomes); s = dispatch(s, { type: 'choose', index: k < 0 ? 0 : k }); }
      else s = dispatch(s, { type: 'next' });
    }
    expect(s.govHistory.length).toBeGreaterThanOrEqual(2);
    expect(s.govHistory[0].name).toBe(first);
    expect(s.govHistory[0].end).not.toBeNull();
    expect(s.govHistory[0].how).toBeTruthy();
    expect(s.govHistory[s.govHistory.length - 1].toYear).toBeNull();
    expect(s.nextElection).toBeGreaterThan(s.turn);
  });
});
