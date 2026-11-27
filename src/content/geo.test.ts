import { describe, it, expect } from 'vitest';
import { PROVINCES, inside, districts } from './geo';

describe('geografi', () => {
  it('setiap kota berada di daratan', () => {
    for (const pv of PROVINCES) for (const c of pv.cities) expect(pv.islands.some(isl => inside(c.p, isl)), c.name).toBe(true);
  });
  it('hierarki kecamatan & kelurahan stabil dan bernama unik', () => {
    for (const pv of PROVINCES) for (const c of pv.cities) {
      const d = districts(c);
      expect(d.length).toBeGreaterThan(3);
      const names = d.flatMap(k => [k.name, ...k.units.map(u => u.name)]);
      expect(new Set(names).size).toBe(names.length);
      expect(d.every(k => k.units.length >= 4)).toBe(true);
    }
  });
});
