import { describe, it, expect } from 'vitest';
import { newGame } from './index';
import { stepNation } from './nation';
import { applyFx } from './core';
import { aggregateOf, provState, cityState, reconcile, REG_KEYS } from './regions';
import { PROVINCES } from '../content/geo';
import type { GameState } from './types';

const game = (seed = 7) => newGame({ name: 'Uji', gender: 'L', background: 'pegawai', seed });
const cities = (s: GameState) => PROVINCES.flatMap(p => p.cities.map(c => cityState(s, c.id)));
function expectSynced(s: GameState) {
  const a = aggregateOf(cities(s));
  for (const k of REG_KEYS) expect(s.nation[k], k).toBeCloseTo(a[k], 6);
}

describe('statistik wilayah', () => {
  it('nasional = agregat kota sejak awal dan tetap sinkron setelah 10 tahun', () => {
    const s = game();
    expectSynced(s);
    for (let i = 0; i < 120; i++) stepNation(s);
    expectSynced(s);
    // provinsi = agregat kotanya
    for (const pv of PROVINCES) {
      const a = aggregateOf(pv.cities.map(c => cityState(s, c.id)));
      expect(provState(s, pv.id).stats.kemiskinan).toBeCloseTo(a.kemiskinan, 9);
    }
  });

  it('karakter daerah bertahan: Kencana lebih maju dari Arunika', () => {
    const s = game(11);
    for (let i = 0; i < 120; i++) stepNation(s);
    const k = provState(s, 'kencana').stats, a = provState(s, 'arunika').stats;
    expect(k.pendidikan).toBeGreaterThan(a.pendidikan + 10);
    expect(k.kemiskinan).toBeLessThan(a.kemiskinan);
    expect(k.pdb / provState(s, 'kencana').pop).toBeGreaterThan(a.pdb / provState(s, 'arunika').pop);
  });

  it('efek event pada angka nasional diteruskan ke semua kota', () => {
    const s = game(3);
    const before = cities(s).map(c => c.stats.pendidikan);
    const nBefore = s.nation.pendidikan;
    applyFx(s, { nation: { pendidikan: 2 } });
    reconcile(s);
    cities(s).forEach((c, i) => expect(c.stats.pendidikan).toBeCloseTo(before[i] + 2, 6));
    expect(s.nation.pendidikan).toBeCloseTo(nBefore + 2, 6);
    s.nation.pdb *= 1.03;
    reconcile(s);
    expectSynced(s);
  });

  it('simpanan lama tanpa data wilayah dibangun ulang dari angka nasional', () => {
    const s = game(5);
    const n = { ...s.nation };
    delete s.regions;
    reconcile(s);
    for (const k of REG_KEYS) expect(s.nation[k], k).toBeCloseTo(n[k], 6);
    expectSynced(s);
  });
});
