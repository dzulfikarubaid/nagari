// Kehidupan di luar politik: tempat tinggal, bahasa, beasiswa, riset, organisasi, lomba, asmara, keluarga, dan mencoblos.
import type { Home, GameState, CityTier, HousingId, DegreeLevel, AttrKey, Level, Fx, Job, Character } from './types';
import { rand, range, randInt, pick, clamp, age, addHistory, log, setFlag, hasFlag, gainAttr, gainPop, year } from './core';
import {
  CITIES, cityDef, housingDef, DOMESTIC, URBAN, STREETS, KOS_NAMES, APT_NAMES, DESA_NAMES, KAB_NAMES, PROV_NAMES,
  ORGS, ORG_SLOTS, COMPS, RANK_NAMES, SCHOLARSHIPS, MONTH_SHORT, COVER_LABEL, NAMES_L, NAMES_P, SURNAMES, TRAITS, PARTNER_JOBS, WEDDING,
} from '../content/life';
import { CAMPUSES, MAJORS, JOBS, BACKGROUNDS } from '../content/data';
import { PROVINCES, districts, unitNames, cityLabel, findCity } from '../content/geo';

const DEG_RANK: Record<string, number> = { S1: 1, S2: 2, S3: 3 };
export const degRank = (d: DegreeLevel | null | undefined) => (d ? DEG_RANK[d] : 0);
export const nextLevel = (c: Character): DegreeLevel | null => (c.degree === 'S3' ? null : c.degree === 'S2' ? 'S3' : c.degree === 'S1' ? 'S2' : 'S1');

// =====================================================================
// TEMPAT TINGGAL
// =====================================================================
export const cityOf = (s: GameState) => cityDef(s.char.home.city);
export const isAbroad = (s: GameState) => !!cityOf(s).abroad;

export function cityName(s: GameState, tier: CityTier = s.char.home.city): string {
  const n = s.char.home.names;
  const c = cityDef(tier);
  const kab = findCity(n.kabId), pc = findCity(n.provCityId);
  if (tier === 'desa') return kab ? `${n.desa}, ${n.kec ? `${n.kec}, ` : ''}${cityLabel(kab)}` : `Desa ${n.desa}, Kabupaten ${n.kab}`;
  if (tier === 'kabupaten') return kab ? `${cityLabel(kab)}, ${n.provName}` : `Kota ${n.kab}`;
  if (tier === 'provinsi') return pc ? `${cityLabel(pc)}, ibu kota ${n.provName}` : `${n.prov}, ibu kota provinsi`;
  if (tier === 'pelajar') return 'Kota Cendekia';
  if (tier === 'ibukota') return 'Nagari Raya, ibu kota negara';
  return `${c.short}, ${c.country}`;
}

export function rentOf(s: GameState, tier: CityTier, housing: HousingId): number {
  if (housing === 'ortu' || housing === 'rumah') return 0;
  return cityDef(tier).rent * housingDef(housing).rentMult;
}

function makeAddr(s: GameState, tier: CityTier, housing: HousingId): string {
  const st = pick(s, STREETS);
  const no = randInt(s, 2, 120);
  const place = cityName(s, tier);
  if (cityDef(tier).abroad) {
    if (housing === 'asrama') return `Asrama mahasiswa internasional, kamar ${randInt(s, 101, 640)}, ${place}`;
    return `Unit ${randInt(s, 2, 30)}${pick(s, ['A', 'B', 'C'])}, ${randInt(s, 10, 300)} ${pick(s, ['Maple', 'Harbour', 'Elm', 'Kingsway', 'Garden'])} Street, ${place}`;
  }
  switch (housing) {
    case 'ortu': return `Rumah keluarga, Jl. ${st} No. ${no}, ${place}`;
    case 'kos': return `${pick(s, KOS_NAMES)} kamar ${randInt(s, 1, 24)}, Gg. ${st} ${randInt(s, 1, 9)}, ${place}`;
    case 'kontrakan': return `Rumah petak Jl. ${st} Gg. ${randInt(s, 1, 12)} No. ${no}, ${place}`;
    case 'apartemen': return `${pick(s, APT_NAMES)} lantai ${randInt(s, 3, 32)}, ${place}`;
    case 'asrama': return `Asrama ${pick(s, ['Putra', 'Putri', 'Taruna', 'Mahasiswa'])} blok ${pick(s, ['A', 'B', 'C', 'D'])}, ${place}`;
    case 'rumah': return `Perumahan ${pick(s, ['Griya', 'Taman', 'Bumi', 'Puri'])} ${pick(s, ['Asri', 'Indah', 'Lestari', 'Permai'])} blok ${pick(s, ['A', 'B', 'C', 'D', 'E'])}${randInt(s, 1, 30)}, ${place}`;
  }
}

/** Pindah tanpa pemeriksaan (dipakai sistem: kuliah, pulang, dsb). */
export function relocate(s: GameState, tier: CityTier, housing: HousingId) {
  const h = s.char.home;
  if (housing === 'rumah' && h.house) { h.city = tier; h.housing = 'rumah'; h.addr = h.house.addr; return; }
  h.city = tier; h.housing = housing; h.addr = makeAddr(s, tier, housing);
}

export function moveBlock(s: GameState, tier: CityTier, housing: HousingId): string | null {
  const c = s.char, h = c.home;
  const city = cityDef(tier);
  if (c.jail > 0) return 'Sedang dipenjara';
  if (c.edu) return 'Masih kuliah; tempat tinggal mengikuti kampus';
  if (s.office || s.campaign) return 'Pejabat dan calon wajib tinggal di daerahnya';
  if (tier === h.city && housing === h.housing) return 'Sudah tinggal di sini';
  if (housing === 'asrama') return 'Asrama hanya untuk pelajar';
  if (housing === 'ortu' && (tier !== h.hometown || c.parents === 0)) return 'Orang tuamu tinggal di ' + cityName(s, h.hometown);
  if (housing === 'rumah' && (!h.house || h.house.city !== tier)) return 'Belum punya rumah di sini';
  if (housing === 'apartemen' && tier === 'desa') return 'Tidak ada apartemen di desa';
  if (city.abroad) {
    if (!hasFlag(s, 'pernah_luar_negeri') && langScore(s) < 6.5) return 'Butuh visa kerja: skor bahasa 6.5 atau pernah studi di luar negeri';
    const bond = s.flags['ikatan_dan'];
    if (bond !== undefined && s.turn - bond < 60) return `Ikatan beasiswa: wajib mengabdi di Nagari ${60 - (s.turn - bond)} bulan lagi`;
  }
  const cost = (city.abroad ? 25 : 2) + rentOf(s, tier, housing) * 2;
  if (c.money < cost) return `Butuh ${Math.ceil(cost)} juta untuk pindah dan deposit sewa`;
  return null;
}

export function move(s: GameState, tier: CityTier, housing: HousingId) {
  if (moveBlock(s, tier, housing)) return;
  const c = s.char;
  const city = cityDef(tier);
  const from = c.home.city;
  c.money -= (city.abroad ? 25 : 2) + rentOf(s, tier, housing) * 2;
  relocate(s, tier, housing);
  if (from !== tier) {
    const j = JOBS.find(x => x.id === c.job);
    if (j && jobLocationBlock(s, j)) { addHistory(s, `Berhenti dari pekerjaan sebagai ${j.name.toLowerCase()} karena pindah kota.`, 'pilihan'); c.job = null; c.jobLevel = 0; c.jobMonths = 0; }
    if (c.partner && c.partner.stage === 'menikah') c.partner.city = tier;
    if (city.abroad) setFlag(s, 'pernah_luar_negeri');
    addHistory(s, `Pindah ke ${cityName(s, tier)} (${housingDef(housing).name.toLowerCase()}).`, 'pilihan');
    pruneOrgs(s);
  } else log(s, `Pindah ke ${housingDef(housing).name.toLowerCase()}: ${c.home.addr}.`);
}

/** Harga rumah di kota tertentu. */
export const housePrice = (tier: CityTier) => cityDef(tier).house;
export const KPR_MONTHS = 180;
export const kprMonthly = (price: number) => Math.round(price * 0.8 * 0.0098 * 10) / 10;

export function buyBlock(s: GameState, kpr: boolean): string | null {
  const c = s.char, h = c.home;
  if (c.jail > 0) return 'Sedang dipenjara';
  if (h.house) return 'Sudah punya rumah; jual dulu yang lama';
  if (cityOf(s).abroad) return 'Tidak bisa membeli rumah di luar negeri';
  const price = housePrice(h.city);
  if (!kpr) return c.money < price ? `Butuh ${price} juta tunai` : null;
  if (!c.job && !s.office) return 'Bank hanya memberi KPR pada yang berpenghasilan tetap';
  if (c.money < price * 0.2 + 5) return `Butuh uang muka ${Math.round(price * 0.2)} juta`;
  const income = (JOBS.find(j => j.id === c.job)?.income ?? 6) * 1.5;
  if (kprMonthly(price) > Math.max(income, 4) * 1.6) return 'Penghasilanmu belum cukup untuk cicilan rumah di sini';
  return null;
}

export function buyHouse(s: GameState, kpr: boolean) {
  if (buyBlock(s, kpr)) return;
  const c = s.char, h = c.home;
  const price = housePrice(h.city);
  const addr = makeAddr(s, h.city, 'rumah');
  h.house = { city: h.city, value: price, addr };
  if (kpr) { c.money -= price * 0.2 + 5; h.kpr = { left: KPR_MONTHS, monthly: kprMonthly(price) }; }
  else c.money -= price;
  h.housing = 'rumah'; h.addr = addr;
  setFlag(s, 'punya_rumah');
  addHistory(s, `Membeli rumah di ${cityName(s)}${kpr ? ' dengan KPR 15 tahun' : ' secara tunai'}.`, 'pilihan');
}

export function sellHouse(s: GameState) {
  const c = s.char, h = c.home;
  if (!h.house || c.jail > 0) return;
  const debt = h.kpr ? h.kpr.left * h.kpr.monthly * 0.75 : 0;
  c.money += h.house.value * 0.95 - debt;
  addHistory(s, `Menjual rumah di ${cityName(s, h.house.city)} seharga ${Math.round(h.house.value)} juta.`, 'pilihan');
  const living = h.housing === 'rumah';
  const tier = h.house.city;
  h.house = null; h.kpr = null;
  if (living) relocate(s, tier, tier === h.hometown && c.parents > 0 ? 'ortu' : 'kontrakan');
}

export function netWorth(s: GameState): number {
  const h = s.char.home;
  return s.char.money + (h.house?.value ?? 0) - (h.kpr ? h.kpr.left * h.kpr.monthly * 0.75 : 0);
}

// =====================================================================
// BAHASA & BEASISWA
// =====================================================================
/** Skor tes bahasa yang masih berlaku (2 tahun). */
export function langScore(s: GameState): number {
  const t = s.char.langTest;
  return t && s.turn - t.turn <= 24 ? t.score : 0;
}
export const LANG_TEST_COST = 3;
export function langTestBlock(s: GameState): string | null {
  if (s.char.jail > 0) return 'Sedang dipenjara';
  if (s.char.money < LANG_TEST_COST) return `Butuh ${LANG_TEST_COST} juta`;
  const t = s.char.langTest;
  if (t && s.turn - t.turn < 2) return 'Baru saja tes; tunggu sebulan lagi';
  return null;
}
export function langTest(s: GameState) {
  if (langTestBlock(s)) return;
  const c = s.char;
  c.money -= LANG_TEST_COST;
  const raw = clamp(2.8 + c.lang * 0.065 + range(s, -0.45, 0.45), 1, 9);
  const score = Math.round(raw * 2) / 2;
  c.langTest = { score, turn: s.turn };
  s.result = { title: 'Hasil tes bahasa Inggris', text: `Skormu ${score.toFixed(1)} dari 9. ${score >= 7 ? 'Cukup untuk kampus dan beasiswa paling bergengsi.' : score >= 6.5 ? 'Cukup untuk sebagian besar kampus luar negeri.' : score >= 6 ? 'Cukup untuk IUP, Temasik, dan pertukaran pelajar.' : 'Belum cukup untuk kuliah di luar negeri. Ambil kursus dan coba lagi.'} Skor berlaku dua tahun.`, fx: [] };
  log(s, `Skor tes bahasa Inggris: ${score.toFixed(1)}.`);
}

/** Daftar syarat beasiswa dan apakah sudah terpenuhi (untuk ditampilkan dan diperiksa). */
export function scholarshipReqs(s: GameState, id: string): { text: string; ok: boolean }[] {
  const c = s.char, b = SCHOLARSHIPS.find(x => x.id === id)!, e = c.edu;
  const now = ongoing(s, id);
  const lvl = nextLevel(c);
  const out: { text: string; ok: boolean }[] = [];
  const forNext = !b.ongoingOnly && !!lvl && b.levels.includes(lvl) && (!e || e.monthsLeft <= 12);
  out.push({ text: b.ongoingOnly ? `Sedang kuliah ${b.levels.join('/')}` : `Untuk ${b.levels.join('/')} (daftar sebelum masuk, atau sambil kuliah)`, ok: now || forNext });
  out.push({ text: b.only ? `Hanya di ${CAMPUSES.find(x => x.id === b.only)?.name}` : b.where === 'luar' ? 'Kampus luar negeri' : b.where === 'dalam' ? 'Kampus dalam negeri' : 'Kampus dalam atau luar negeri', ok: e ? (now || forNext) : true });
  out.push({ text: `Pendaftaran dibuka ${b.open.length === 12 ? 'sepanjang tahun' : b.open.map(m => MONTH_SHORT[m]).join(', ')}`, ok: b.open.includes(s.turn % 12) });
  if (b.minMonths) out.push({ text: `Sudah kuliah minimal ${b.minMonths} bulan`, ok: !!e && e.total - e.monthsLeft >= b.minMonths });
  if (b.maxAge) out.push({ text: `Usia maksimal ${b.maxAge} tahun`, ok: age(s) <= b.maxAge });
  if (b.poor) out.push({ text: 'Keluarga kurang mampu (surat keterangan tidak mampu)', ok: c.family.fund <= 60 && c.family.tuitionCap <= 1.5 });
  if (b.notRich) out.push({ text: 'Bukan dari keluarga kaya', ok: c.family.fund <= 400 });
  if (b.gpaMin) { const g = e ? e.gpa : c.gpa; out.push({ text: `IPK minimal ${b.gpaMin.toFixed(2)}${g === null ? ' (untuk lulusan SMA: nilai rapor)' : ''}`, ok: g === null ? c.attr.kecerdasan >= 50 : (g ?? 0) >= b.gpaMin }); }
  if (b.langMin) out.push({ text: `Skor tes bahasa Inggris ${b.langMin.toFixed(1)}`, ok: langScore(s) >= b.langMin });
  if (b.pubsMin) out.push({ text: `Minimal ${b.pubsMin} publikasi`, ok: c.pubs.length >= b.pubsMin });
  if (b.org) out.push({ text: 'Aktif di organisasi', ok: c.orgs.length > 0 || hasFlag(s, 'pernah_ketua') });
  if (b.leader) out.push({ text: 'Pernah memimpin organisasi atau bekerja 2 tahun', ok: hasFlag(s, 'pernah_ketua') || c.everOffice.length > 0 || (!!c.job && (c.jobLevel > 0 || c.jobMonths >= 24)) });
  if (b.prestasi) out.push({ text: 'Punya prestasi (juara lomba) atau nilai sangat tinggi', ok: c.awards.length > 0 || c.attr.kecerdasan >= 72 });
  if (b.majors) out.push({ text: `Jurusan ${b.majors.map(m => MAJORS.find(x => x.id === m)?.name).join(' / ')}`, ok: b.majors.includes(e?.major ?? c.major ?? '') });
  if (b.attrMin) for (const [k, v] of Object.entries(b.attrMin) as [AttrKey, number][]) out.push({ text: `${k[0].toUpperCase() + k.slice(1)} minimal ${v}`, ok: c.attr[k] >= v });
  return out;
}

export function scholarshipBlock(s: GameState, id: string): string | null {
  const c = s.char;
  const b = SCHOLARSHIPS.find(x => x.id === id);
  if (!b) return 'Tidak dikenal';
  if (c.jail > 0) return 'Sedang dipenjara';
  if (c.scholarship) return 'Sudah memegang beasiswa yang belum dipakai';
  if (c.edu?.funding && b.levels.includes(c.edu.level)) return 'Kuliahmu sudah dibiayai beasiswa (tidak boleh ganda)';
  const miss = scholarshipReqs(s, id).find(r => !r.ok);
  if (miss) return miss.text.startsWith('Pendaftaran') ? `Belum dibuka: ${miss.text.replace('Pendaftaran dibuka ', '')}` : `Belum memenuhi: ${miss.text}`;
  const wait = waitFor(s, 'bea:' + id, 12);
  if (wait > 0) return `Baru ditolak; coba lagi ${wait} bulan lagi`;
  return null;
}

function waitFor(s: GameState, key: string, months: number) {
  const last = s.flags['tolak:' + key];
  return last === undefined ? 0 : Math.max(0, months - (s.turn - last));
}

/** Rata-rata tertimbang atribut. */
function wavg(s: GameState, w: Partial<Record<AttrKey, number>>): number {
  let sum = 0, ws = 0;
  for (const [k, v] of Object.entries(w) as [AttrKey, number][]) { sum += s.char.attr[k] * v; ws += v; }
  return ws ? sum / ws : 50;
}

/** Nilai tambah dari prestasi: IPK, publikasi, lomba, kepemimpinan. */
export function cvBonus(s: GameState): number {
  const c = s.char;
  return (c.gpa ? (c.gpa - 3) * 8 : 0) + Math.min(10, c.pubs.length * 2.5) + Math.min(6, c.awards.length * 1.5)
    + (c.orgs.some(o => o.role === 2) || hasFlag(s, 'pernah_ketua') ? 3 : 0) + (hasFlag(s, 'gelar_ganda') ? 3 : 0) + (hasFlag(s, 'pengalaman_magang') ? 3 : 0);
}

/** Uang bulanan dari beasiswa di kota ini: biaya hidup dasar (bila menanggung penuh) atau uang saku. */
export function scholarshipLiving(tier: CityTier, id: string): number {
  const b = SCHOLARSHIPS.find(x => x.id === id);
  if (!b) return 0;
  if (b.covers === 'penuh') return cityDef(tier).living * 0.85 + cityDef(tier).rent * 0.6 + b.stipend * 0.3;
  return b.stipend;
}
/** Beasiswa ini menanggung uang kuliah? */
export const coversTuition = (id: string | null | undefined) => { const b = SCHOLARSHIPS.find(x => x.id === id); return !!b && b.covers !== 'saku'; };

/** Beasiswa ini bisa langsung membiayai kuliah yang sedang berjalan? */
export function ongoing(s: GameState, id: string): boolean {
  const e = s.char.edu, b = SCHOLARSHIPS.find(x => x.id === id);
  return !!e && !!b && !e.funding && b.levels.includes(e.level) && scholarshipFitsCampus(id, e.campus);
}

export function applyScholarship(s: GameState, id: string) {
  if (scholarshipBlock(s, id)) return;
  const c = s.char;
  const b = SCHOLARSHIPS.find(x => x.id === id)!;
  const now = ongoing(s, id);
  const fail = (stage: string, why: string) => {
    s.flags['tolak:bea:' + id] = s.turn;
    c.attr.stres = clamp(c.attr.stres + 4);
    s.result = { title: b.name, text: `Gugur di tahap ${stage}. ${why} Tahapan seleksi: ${b.note} Kamu bisa mencoba lagi tahun depan.`, fx: [] };
    addHistory(s, `Gugur seleksi ${b.name} (tahap ${stage}).`, 'akibat');
  };
  // Tahap 2: tes tertulis / esai.
  const test = wavg(s, b.w) + cvBonus(s) + (now ? (c.edu!.gpa - 3) * 8 : 0) + range(s, -7, 7) - (hasFlag(s, 'pernah_dipenjara') ? 15 : 0);
  if (test < b.bar) return fail('tes & esai', 'Nilaimu kalah bersaing dengan pendaftar lain.');
  // Tahap 3: wawancara / survei.
  const talk = wavg(s, { karisma: 2, integritas: 1 }) + (hasFlag(s, 'pernah_ketua') ? 3 : 0) + range(s, -9, 9);
  if (talk < b.interview) return fail(b.poor ? 'survei & wawancara' : 'wawancara', 'Panel belum yakin padamu.');
  const bond = b.bond ? ` Kewajiban: ${b.bond}` : '';
  if (now) {
    c.edu!.funding = id;
    s.result = { title: b.name, text: `Lolos semua tahap! ${b.name} mulai berlaku bulan ini: ${COVER_LABEL[b.covers].toLowerCase()}${b.covers !== 'kuliah' ? `, sekitar ${scholarshipLiving(c.home.city, id).toFixed(1)} juta per bulan` : ''}.${bond}`, fx: [] };
    addHistory(s, `Lolos ${b.name} untuk kuliah yang sedang berjalan.`);
    return;
  }
  c.scholarship = { id, level: nextLevel(c)!, turn: s.turn };
  s.result = { title: b.name, text: `Lolos semua tahap! ${b.name} (${COVER_LABEL[b.covers].toLowerCase()}) berlaku untuk pendaftaran ${c.scholarship.level} dalam 18 bulan${b.only ? ` di ${CAMPUSES.find(x => x.id === b.only)?.name}` : b.where === 'luar' ? ' di kampus luar negeri' : b.where === 'dalam' ? ' di kampus dalam negeri' : ''}.${bond}`, fx: [] };
  addHistory(s, `Lolos ${b.name}.`);
}

/** Apakah beasiswa yang dipegang bisa dipakai di kampus ini? */
export function scholarshipFits(s: GameState, campusId: string): boolean {
  const sc = s.char.scholarship;
  if (!sc || sc.level !== nextLevel(s.char)) return false;
  return scholarshipFitsCampus(sc.id, campusId);
}

/** Apakah beasiswa jenis ini berlaku di kampus ini? */
export function scholarshipFitsCampus(id: string, campusId: string): boolean {
  const b = SCHOLARSHIPS.find(x => x.id === id)!;
  const campus = CAMPUSES.find(x => x.id === campusId)!;
  if (b.only && b.only !== campusId) return false;
  if (b.where === 'luar' && !campus.abroad) return false;
  if (b.where === 'dalam' && campus.abroad) return false;
  return true;
}

// =====================================================================
// PERTUKARAN PELAJAR & IPK
// =====================================================================
export function exchangeBlock(s: GameState): string | null {
  const e = s.char.edu;
  if (!e) return 'Hanya untuk mahasiswa';
  if (e.level !== 'S1') return 'Hanya untuk mahasiswa S1';
  const campus = CAMPUSES.find(x => x.id === e.campus)!;
  if (campus.abroad || campus.iup) return 'Kampusmu sudah internasional';
  if (e.away || hasFlag(s, 'pertukaran')) return 'Sudah pernah ikut pertukaran';
  if (e.monthsLeft > 36 || e.monthsLeft < 12) return 'Dibuka untuk mahasiswa tahun kedua dan ketiga';
  if (e.gpa < 3.2) return 'IPK minimal 3.20';
  if (langScore(s) < 6) return 'Skor bahasa Inggris minimal 6.0';
  const wait = waitFor(s, 'pertukaran', 6);
  if (wait > 0) return `Seleksi berikutnya ${wait} bulan lagi`;
  return null;
}
export function applyExchange(s: GameState) {
  if (exchangeBlock(s)) return;
  const e = s.char.edu!;
  const score = wavg(s, { kecerdasan: 2, karisma: 1 }) + (e.gpa - 3) * 12 + range(s, -6, 6);
  if (score < 56) {
    s.flags['tolak:pertukaran'] = s.turn;
    s.result = { title: 'Seleksi pertukaran pelajar', text: 'Kuotanya hanya lima orang dari seluruh kampus, dan namamu bukan salah satunya. Ada seleksi lagi semester depan.', fx: [] };
    return;
  }
  const dest = pick(s, ['atlantika', 'australis', 'temasik', 'tiongkara'] as CityTier[]);
  e.away = { city: dest, from: e.monthsLeft - 1, to: e.monthsLeft - 7, kind: 'pertukaran' };
  setFlag(s, 'pertukaran');
  s.result = { title: 'Seleksi pertukaran pelajar', text: `Kamu terpilih ikut pertukaran satu semester ke ${cityName(s, dest)}, dibiayai penuh. Berangkat bulan depan.`, fx: [] };
  addHistory(s, `Terpilih pertukaran pelajar ke ${cityDef(dest).country}.`);
}

/** IPK bergerak pelan menuju target yang ditentukan kecerdasan, cara belajar, dan beban hidup. */
export function gpaTarget(s: GameState, u: Record<string, number>): number {
  const c = s.char, e = c.edu!;
  const campus = CAMPUSES.find(x => x.id === e.campus)!;
  return clamp(1.55 + c.attr.kecerdasan * 0.028 + Math.min(0.45, (u['belajar'] ?? 0) * 0.2) - (c.sleep < 6 ? 0.25 : 0) - Math.max(0, (u['ojol'] ?? 0) + (u['freelance'] ?? 0) + (u['les'] ?? 0) + (u['usaha'] ?? 0) - 2) * 0.08 + (c.habits.includes('membaca') ? 0.05 : 0)
    - (c.attr.stres > 65 ? 0.35 : 0) - Math.max(0, c.orgs.length - 1) * 0.06 - (c.job ? 0.2 : 0)
    - (campus.quality >= 1.35 ? 0.12 : 0) + (e.level !== 'S1' ? 0.15 : 0), 0, 4);
}

// =====================================================================
// RISET
// =====================================================================
const RESEARCH_JOBS = ['dosen', 'peneliti', 'dokter', 'insinyur', 'data', 'apoteker', 'psikolog'];
export function researchMajor(s: GameState) {
  const id = s.char.edu?.major ?? s.char.major;
  return MAJORS.find(m => m.id === id);
}
export function researchBlock(s: GameState): string | null {
  const c = s.char;
  if (c.jail > 0) return 'Sedang dipenjara';
  if (c.research) return 'Masih ada riset berjalan';
  const m = researchMajor(s);
  if (!c.edu && !RESEARCH_JOBS.includes(c.job ?? '')) return 'Butuh status mahasiswa, atau bekerja sebagai dosen/peneliti/dokter/insinyur/analis';
  if (!m || !m.research) return m ? `Jurusan ${m.name} tidak punya jalur riset laboratorium` : 'Belum punya jurusan';
  if (c.edu && c.edu.level === 'S1' && c.edu.total - c.edu.monthsLeft < 12) return 'Mahasiswa baru belum boleh ikut riset; tunggu tahun kedua';
  return null;
}
export function startResearch(s: GameState, topic: string, scope: 'kecil' | 'besar') {
  if (researchBlock(s)) return;
  const m = researchMajor(s)!;
  if (!m.topics.includes(topic)) return;
  s.char.research = { topic, major: m.id, scope, progress: 0, need: scope === 'besar' ? 150 : 60, quality: 0 };
  addHistory(s, `Memulai riset "${topic}".`, 'pilihan');
}
export function dropResearch(s: GameState) {
  if (!s.char.research) return;
  addHistory(s, `Menghentikan riset "${s.char.research.topic}".`, 'pilihan');
  s.char.research = null;
}

function stepResearch(s: GameState, u: Record<string, number>) {
  const c = s.char, r = c.research;
  if (!r) return;
  const n = (u['riset'] ?? 0);
  const inOrg = c.orgs.some(o => o.id === 'riset');
  const base = (c.edu ? (c.edu.level === 'S1' ? 2 : 4) : RESEARCH_JOBS.includes(c.job ?? '') ? 3 : 0) + (inOrg ? 2 : 0);
  r.progress += base + n * (6 + c.attr.kecerdasan / 12);
  if (r.progress < r.need) return;
  const campus = CAMPUSES.find(x => x.id === (c.edu?.campus ?? c.campus));
  const q = c.attr.kecerdasan * 0.62 + (campus?.quality ?? 1) * 10 + (r.scope === 'besar' ? 6 : 0) + (['dosen', 'peneliti'].includes(c.job ?? '') ? 5 : 0)
    + (c.edu && c.edu.level !== 'S1' ? 4 : 0) + range(s, -12, 12) + (r.fabricated ? 14 : 0);
  const venue = r.scope === 'besar' && q >= 63 ? 'internasional' : q >= 40 ? 'nasional' : null;
  if (!venue) {
    r.progress = r.need * 0.65;
    c.attr.stres = clamp(c.attr.stres + 4);
    s.result = { title: 'Naskah ditolak', text: `Reviewer jurnal menolak naskah "${r.topic}". Komentarnya panjang dan pedas. Kamu bisa merevisi (lanjutkan riset) atau menyerah.`, fx: [] };
    return;
  }
  c.pubs.push({ title: r.topic, venue, year: year(s) });
  gainAttr(s, 'kecerdasan', venue === 'internasional' ? 3 : 1.5);
  gainPop(s, 'nasional', venue === 'internasional' ? 2.5 : 0.6);
  gainPop(s, 'provinsi', 1);
  if (venue === 'internasional') setFlag(s, 'publikasi_internasional');
  if (r.fabricated) setFlag(s, 'publikasi_palsu');
  c.research = null;
  s.result = { title: 'Terbit!', text: `Risetmu "${r.topic}" terbit di jurnal ${venue}. ${venue === 'internasional' ? 'Namamu kini muncul di basis data ilmiah dunia.' : 'Satu baris baru di CV-mu.'}`, fx: [] };
  addHistory(s, `Publikasi ${venue}: "${r.topic}".`);
}

// =====================================================================
// ORGANISASI
// =====================================================================
export const orgDef = (id: string) => ORGS.find(o => o.id === id)!;
export const orgRoleName = (id: string, role: number) => role === 2 ? orgDef(id).chair : role === 1 ? 'Pengurus' : 'Anggota';

function orgLocationOk(s: GameState, id: string): boolean {
  const o = orgDef(id), h = s.char.home;
  if (o.kind === 'kampus') return !!s.char.edu;
  if (o.need?.hometown && !(h.city === h.hometown && (h.city === 'desa' || h.city === 'kabupaten'))) return false;
  if (o.need?.perantau && !(h.city !== h.hometown && !cityDef(h.city).abroad)) return false;
  if (o.need?.abroad && !cityDef(h.city).abroad) return false;
  return true;
}

export function orgBlock(s: GameState, id: string): string | null {
  const c = s.char, o = orgDef(id);
  if (c.jail > 0) return 'Sedang dipenjara';
  if (c.orgs.some(m => m.id === id)) return 'Sudah jadi anggota';
  if (c.orgs.length >= ORG_SLOTS) return `Maksimal ${ORG_SLOTS} organisasi sekaligus`;
  if (o.kind === 'kampus' && !c.edu) return 'Khusus mahasiswa';
  if (o.need?.hometown && !orgLocationOk(s, id)) return 'Hanya di kampung halaman (desa atau kota kabupaten asal)';
  if (o.need?.perantau && !orgLocationOk(s, id)) return 'Untuk perantau di kota lain';
  if (o.need?.abroad && !orgLocationOk(s, id)) return 'Hanya untuk yang tinggal di luar negeri';
  if (o.need?.jobs && !o.need.jobs.includes(c.job ?? '')) return 'Khusus profesi tertentu';
  if (o.need?.money && c.money < o.need.money) return `Butuh kekayaan ${o.need.money} juta`;
  if (o.need?.degree && !c.degree) return 'Khusus alumni (sudah lulus)';
  if (o.need?.attr) for (const [k, v] of Object.entries(o.need.attr) as [AttrKey, number][]) if (c.attr[k] < v) return `Butuh ${k} ${v}`;
  return null;
}
export function joinOrg(s: GameState, id: string) {
  if (orgBlock(s, id)) return;
  const o = orgDef(id);
  s.char.orgs.push({ id, role: 0, months: 0 });
  if (o.joinFlag) setFlag(s, o.joinFlag);
  addHistory(s, `Bergabung dengan ${o.name}.`, 'pilihan');
}
export function leaveOrg(s: GameState, id: string, why?: string) {
  const c = s.char;
  const m = c.orgs.find(x => x.id === id);
  if (!m) return;
  c.orgs = c.orgs.filter(x => x.id !== id);
  addHistory(s, why ?? `Keluar dari ${orgDef(id).name}.`, why ? 'tonggak' : 'pilihan');
}
export function runOrgBlock(s: GameState, id: string): string | null {
  const m = s.char.orgs.find(x => x.id === id);
  if (!m) return 'Bukan anggota';
  if (s.char.jail > 0) return 'Sedang dipenjara';
  if (m.role === 2) return 'Sudah jadi ketua';
  if (m.role === 0) return 'Jadi pengurus dulu (aktif berorganisasi beberapa bulan)';
  if (m.months < 6) return `Baru ${m.months} bulan jadi pengurus; tunggu ${6 - m.months} bulan`;
  const wait = waitFor(s, 'org:' + id, 12);
  if (wait > 0) return `Kalah pemilihan; coba lagi ${wait} bulan lagi`;
  return null;
}
export function runOrg(s: GameState, id: string) {
  if (runOrgBlock(s, id)) return;
  const m = s.char.orgs.find(x => x.id === id)!;
  const o = orgDef(id);
  const score = wavg(s, { karisma: 2, jaringan: 1, integritas: 1 }) + Math.min(8, m.months * 0.4) + range(s, -9, 9);
  if (score < 55) {
    s.flags['tolak:org:' + id] = s.turn;
    s.char.attr.stres = clamp(s.char.attr.stres + 3);
    s.result = { title: `Pemilihan ${o.chair}`, text: `Kamu kalah suara di musyawarah ${o.name}. Lawanmu lebih rajin menyapa anggota baru.`, fx: [] };
    return;
  }
  m.role = 2; m.months = 0;
  if (o.chairFlag) setFlag(s, o.chairFlag);
  setFlag(s, 'pernah_ketua');
  gainAttr(s, 'karisma', 2); gainAttr(s, 'jaringan', 3);
  s.result = { title: `Pemilihan ${o.chair}`, text: `Kamu terpilih sebagai ${o.chair.toLowerCase()} ${o.name}. Ponselmu tak akan pernah sepi lagi.`, fx: [] };
  addHistory(s, `Terpilih sebagai ${o.chair.toLowerCase()} ${o.name}.`);
}

/** Lepas organisasi yang syarat tempatnya tak lagi terpenuhi. */
export function pruneOrgs(s: GameState) {
  for (const m of [...s.char.orgs]) {
    if (orgLocationOk(s, m.id)) continue;
    const o = orgDef(m.id);
    leaveOrg(s, m.id, o.kind === 'kampus' ? `Purna dari ${o.name}${m.role === 2 ? ` sebagai ${o.chair.toLowerCase()}` : ''}.` : `Tidak lagi aktif di ${o.name} karena pindah.`);
  }
}

function scaleFx(s: GameState, fx: Fx, k: number) {
  if (fx.attr) for (const [a, v] of Object.entries(fx.attr) as [AttrKey, number][]) gainAttr(s, a, v * (v > 0 || a === 'stres' ? k : 1));
  if (fx.pop) for (const [l, v] of Object.entries(fx.pop) as [Level, number][]) gainPop(s, l, v * k);
  if (fx.money) s.char.money += fx.money * (fx.money < 0 ? 1 : k);
  if (fx.heat) s.char.heat = clamp(s.char.heat + fx.heat * k);
}

function stepOrgs(s: GameState, u: Record<string, number>) {
  const c = s.char;
  const active = (u['organisasi'] ?? 0);
  for (const m of c.orgs) {
    const o = orgDef(m.id);
    m.months++;
    const k = [1, 1.5, 2.2][m.role] * (1 + active * 0.4) / Math.max(1, c.orgs.length * 0.75);
    scaleFx(s, o.fx, k);
    if (o.lang) c.lang = clamp(c.lang + o.lang * k * (1 - c.lang / 130));
    c.attr.stres = clamp(c.attr.stres + 0.22 * (m.role + 1) - (active ? 0.05 : 0));
    if (m.role === 0 && m.months >= 5 && rand(s) < 0.06 + active * 0.12 + c.attr.karisma / 900) {
      m.role = 1; m.months = 0;
      log(s, `Diangkat jadi pengurus ${o.name}.`);
    }
    if (m.role === 2 && o.kind === 'kampus' && m.months >= 12) {
      m.role = 1; m.months = 0;
      addHistory(s, `Masa bakti sebagai ${o.chair.toLowerCase()} ${o.name} selesai.`);
    }
  }
}

// =====================================================================
// LOMBA
// =====================================================================
export const compDef = (id: string) => COMPS.find(x => x.id === id)!;
export function compFee(id: string, intl: boolean) { return compDef(id).fee * (intl ? 6 : 1) + (intl ? 6 : 0); }
export function compBlock(s: GameState, id: string, intl: boolean): string | null {
  const c = s.char, k = compDef(id);
  if (c.jail > 0) return 'Sedang dipenjara';
  if (c.comp) return 'Sedang ikut lomba lain';
  if (k.student && !c.edu) return 'Khusus mahasiswa';
  const major = c.edu?.major ?? c.major ?? '';
  if ((k.majors || k.jobs) && !((k.majors ?? []).includes(major) || (k.jobs ?? []).includes(c.job ?? ''))) return 'Butuh jurusan atau pekerjaan yang sesuai';
  if (k.maxAge && age(s) > k.maxAge) return `Usia maksimal ${k.maxAge}`;
  if (k.attrMin) for (const [a, v] of Object.entries(k.attrMin) as [AttrKey, number][]) if (c.attr[a] < v) return `Butuh ${a} ${v}`;
  if (intl) {
    if (!k.intlName) return 'Tidak ada tingkat internasional';
    if (!hasFlag(s, 'juara:' + id)) return 'Harus juara 1 tingkat nasional dulu';
    if (langScore(s) < 6) return 'Butuh skor bahasa Inggris 6.0';
  }
  const last = s.flags['lomba:' + id + (intl ? ':intl' : '')];
  if (last !== undefined && s.turn - last < 12) return `Diadakan setahun sekali; ${12 - (s.turn - last)} bulan lagi`;
  if (c.money < compFee(id, intl)) return `Butuh ${compFee(id, intl)} juta`;
  return null;
}
export function enterComp(s: GameState, id: string, intl: boolean) {
  if (compBlock(s, id, intl)) return;
  const k = compDef(id);
  s.char.money -= compFee(id, intl);
  s.flags['lomba:' + id + (intl ? ':intl' : '')] = s.turn;
  s.char.comp = { id, intl, monthsLeft: k.months, prep: 0 };
  addHistory(s, `Mendaftar ${intl ? k.intlName : k.name}.`, 'pilihan');
}
function stepComp(s: GameState, u: Record<string, number>) {
  const c = s.char, e = c.comp;
  if (!e) return;
  const k = compDef(e.id);
  e.prep += 1 + (u['latihan'] ?? 0) * (3 + c.attr.kecerdasan / 40);
  e.monthsLeft--;
  if (e.monthsLeft > 0) return;
  c.comp = null;
  const name = e.intl ? k.intlName! : k.name;
  const major = c.edu?.major ?? c.major ?? '';
  const score = wavg(s, k.w) + (k.lang ? (c.lang - 50) * 0.25 * k.lang : 0) + Math.min(14, e.prep * 1.1)
    + ((k.majors ?? []).includes(major) ? 3 : 0) + (k.pubBonus ? Math.min(8, c.pubs.length * 2) + (c.research ? 2 : 0) : 0) + range(s, -12, 12);
  const bar = e.intl ? 80 : 66;
  const rank = score >= bar + 14 ? 0 : score >= bar + 8 ? 1 : score >= bar + 3 ? 2 : score >= bar ? 3 : -1;
  if (rank < 0) {
    c.attr.stres = clamp(c.attr.stres + 2);
    s.result = { title: name, text: 'Kamu tidak lolos ke babak final. Juri bilang karyamu "menjanjikan"; artinya belum cukup. Latihan lebih lama lain kali.', fx: [] };
    log(s, `Tidak lolos final ${name}.`);
    return;
  }
  const prize = rank < 3 ? (k.prize as number[])[rank] * (e.intl ? 4 : 1) : 0;
  c.money += prize;
  const title = `${RANK_NAMES[rank]} ${name} ${year(s)}`;
  c.awards.push(title);
  gainPop(s, k.pop, [4, 3, 2, 1][rank] * (e.intl ? 2 : 1));
  if (e.intl) gainPop(s, 'nasional', 3 - Math.min(2, rank));
  gainAttr(s, 'karisma', rank < 3 ? 1.5 : 0.5);
  if (rank === 0) setFlag(s, 'juara:' + e.id);
  if (rank === 0 && e.intl) setFlag(s, 'juara_dunia');
  s.result = { title: name, text: `${RANK_NAMES[rank]}! ${prize ? `Hadiah ${prize} juta masuk rekeningmu. ` : ''}${rank === 0 && !e.intl && k.intlName ? `Kamu berhak mewakili Nagari di ${k.intlName}.` : rank === 0 && e.intl ? 'Bendera Nagari berkibar; wajahmu ada di berita malam.' : 'Satu piagam lagi untuk dibingkai.'}`, fx: [] };
  addHistory(s, `${title}.`);
}

// =====================================================================
// ASMARA & KELUARGA
// =====================================================================
export const partnerAge = (s: GameState) => { const p = s.char.partner!; return p.age + Math.floor((s.turn - p.since) / 12); };
export const married = (s: GameState) => s.char.partner?.stage === 'menikah';

export function findLoveBlock(s: GameState, via: string): string | null {
  const c = s.char;
  if (c.jail > 0) return 'Sedang dipenjara';
  if (c.partner) return 'Sudah punya pasangan';
  if (c.prospect) return 'Ada yang sedang menunggu jawabanmu';
  if (c.loveLeft > 0) return `Beri waktu ${c.loveLeft} bulan lagi`;
  if (s.socialLeft <= 0) return 'Waktu bergaul bulan ini habis';
  if (via === 'kampus' && !c.edu) return 'Bukan mahasiswa';
  if (via === 'kantor' && !c.job && !s.office) return 'Belum bekerja';
  if (via === 'organisasi' && !c.orgs.length) return 'Belum ikut organisasi';
  if (via === 'dijodohkan' && (age(s) < 22 || c.parents === 0)) return age(s) < 22 ? 'Orang tua merasa kamu masih terlalu muda' : 'Tak ada lagi orang tua yang menjodohkan';
  return null;
}

function traitFit(s: GameState, trait: string): number {
  const c = s.char;
  switch (trait) {
    case 'religius': return (c.attr.integritas - 50) / 8 + (c.habits.includes('ibadah') ? 3 : 0) - (c.habits.some(h => ['minum', 'judi'].includes(h)) ? 6 : 0);
    case 'ambisius': return (c.attr.kecerdasan - 50) / 9 + (c.job ? 1 : -3);
    case 'humoris': return (c.attr.karisma - 50) / 10 + 1;
    case 'boros': return c.money > 200 ? 3 : c.habits.includes('menabung') ? -3 : 0;
    case 'idealis': return (c.attr.integritas - 55) / 7;
    case 'mandiri': return 1;
    case 'perhatian': return 2;
    case 'cemburuan': return c.orgs.length > 1 ? -3 : 0;
    default: return 0;
  }
}

export function findLove(s: GameState, via: string) {
  if (findLoveBlock(s, via)) return;
  const c = s.char;
  s.socialLeft--;
  c.loveLeft = 2;
  const p = 0.32 + c.attr.karisma / 220 + (via === 'dijodohkan' ? 0.4 : via === 'aplikasi' ? 0.12 : via === 'teman' ? 0.08 : 0) + (c.attr.kesehatan > 70 ? 0.05 : 0);
  if (rand(s) > p) {
    s.result = { title: 'Belum ada yang cocok', text: pick(s, ['Obrolannya garing dan berhenti di "hehe".', 'Kalian janjian, lalu dia membatalkan sejam sebelumnya.', 'Orangnya baik, tapi rasanya seperti ngobrol dengan sepupu.', 'Dia ternyata sudah punya pacar. Dari tadi.']), fx: [] };
    return;
  }
  const gender: 'L' | 'P' = c.gender === 'L' ? 'P' : 'L';
  const name = `${pick(s, gender === 'L' ? NAMES_L : NAMES_P)} ${pick(s, SURNAMES)}`;
  const opts = PARTNER_JOBS.filter(j => j.via.includes(via));
  const pj = via === 'kampus' ? PARTNER_JOBS[0] : pick(s, opts.length ? opts : PARTNER_JOBS);
  const trait = pick(s, TRAITS);
  c.prospect = {
    name, gender, age: Math.max(18, age(s) + randInt(s, -3, 4)),
    job: via === 'kantor' && c.job ? `Rekan kerja (${pj.job.toLowerCase()})` : pj.job,
    trait: trait.id, income: pj.income * range(s, 0.8, 1.3), fit: range(s, -6, 8) + traitFit(s, trait.id), via,
  };
  log(s, `Berkenalan dengan ${name}.`);
}

export const LOVE_ACTS = ['dekati', 'abaikan', 'kencan', 'tembak', 'lamar', 'putus', 'nikah'] as const;
export function loveBlock(s: GameState, act: string, size?: keyof typeof WEDDING): string | null {
  const c = s.char, p = c.partner;
  if (c.jail > 0 && act !== 'putus') return 'Sedang dipenjara';
  switch (act) {
    case 'dekati': case 'abaikan': return c.prospect ? null : 'Tidak ada kenalan baru';
    case 'kencan': return !p ? 'Belum punya pasangan' : s.socialLeft <= 0 ? 'Waktu bergaul bulan ini habis' : c.money < 1 ? 'Tidak ada uang untuk kencan' : null;
    case 'tembak': return !p || p.stage !== 'pdkt' ? 'Hanya saat pendekatan' : p.love < 35 ? 'Belum cukup dekat' : null;
    case 'lamar':
      if (!p || p.stage !== 'pacaran') return 'Harus pacaran dulu';
      if (age(s) < 21) return 'Usia minimal 21';
      if (p.months < 12) return `Baru ${p.months} bulan pacaran; minimal setahun`;
      if (p.love < 60) return 'Hubungan belum cukup kuat';
      if (c.money < 10) return 'Butuh 10 juta untuk cincin dan seserahan';
      return null;
    case 'nikah': {
      if (!p || p.stage !== 'tunangan') return 'Harus bertunangan dulu';
      const w = WEDDING[size ?? 'sederhana'];
      return c.money < w.cost * 0.5 ? `Butuh minimal ${Math.ceil(w.cost * 0.5)} juta (sisanya utang)` : null;
    }
    case 'putus': return p ? null : 'Tidak punya pasangan';
  }
  return 'Tidak dikenal';
}

function endPartner(s: GameState, text: string, kind: 'pilihan' | 'akibat') {
  const c = s.char, p = c.partner;
  if (!p) return;
  if (p.stage === 'menikah') setFlag(s, 'pernah_cerai');
  c.exes.push(p.name);
  c.partner = null;
  c.loveLeft = 4;
  c.attr.stres = clamp(c.attr.stres + (p.stage === 'menikah' ? 14 : 7));
  addHistory(s, text, kind);
}

export function loveAct(s: GameState, act: string, size?: keyof typeof WEDDING) {
  if (loveBlock(s, act, size)) return;
  const c = s.char;
  const city = cityOf(s);
  if (act === 'abaikan') { c.prospect = null; return; }
  if (act === 'dekati') {
    const pr = c.prospect!;
    c.partner = { name: pr.name, gender: pr.gender, age: pr.age, job: pr.job, trait: pr.trait, income: pr.income, stage: 'pdkt', love: 22 + Math.max(0, pr.fit), months: 0, fit: pr.fit, since: s.turn, city: c.home.city };
    c.prospect = null;
    log(s, `Mulai pendekatan dengan ${pr.name}.`);
    return;
  }
  const p = c.partner!;
  if (act === 'kencan') {
    s.socialLeft--;
    c.money -= city.living * 0.4;
    p.love = clamp(p.love + 4 + c.attr.karisma / 25 + p.fit * 0.35 + range(s, -3, 3));
    c.attr.stres = clamp(c.attr.stres - 1.5);
    return;
  }
  if (act === 'tembak') {
    if (rand(s) < (p.love - 18) / 55 + p.fit * 0.02) {
      p.stage = 'pacaran'; p.months = 0; p.love = clamp(p.love + 10);
      s.result = { title: 'Diterima!', text: `${p.name} mengangguk sambil menahan senyum. Mulai hari ini kalian resmi pacaran.`, fx: [] };
      addHistory(s, `Mulai pacaran dengan ${p.name}.`);
    } else {
      p.love -= 18; c.attr.stres = clamp(c.attr.stres + 4);
      s.result = { title: 'Ditolak halus', text: `"Kamu baik banget, tapi..." ${p.name} butuh waktu. Atau mungkin tidak pernah.`, fx: [] };
      if (p.love < 12) endPartner(s, `Pendekatan dengan ${p.name} kandas.`, 'akibat');
    }
    return;
  }
  if (act === 'lamar') {
    const ok = 0.5 + (p.love - 60) / 80 + p.fit * 0.03 + (c.job || s.office ? 0.12 : -0.2) + (c.money > 100 ? 0.05 : 0);
    if (rand(s) < ok) {
      c.money -= 10; p.stage = 'tunangan'; p.love = clamp(p.love + 8);
      s.result = { title: 'Lamaran diterima', text: `Keluarga ${p.name} menerima lamaranmu. Tanggal pernikahan tinggal dicari; biayanya juga.`, fx: [] };
      addHistory(s, `Bertunangan dengan ${p.name}.`);
    } else {
      p.love -= 10; c.attr.stres = clamp(c.attr.stres + 5);
      s.result = { title: 'Lamaran ditunda', text: `Orang tua ${p.name} bilang: "Mapan dulu, Nak." Kalian sepakat menunggu.`, fx: [] };
    }
    return;
  }
  if (act === 'nikah') {
    const w = WEDDING[size ?? 'sederhana'];
    c.money -= w.cost;
    p.stage = 'menikah'; p.love = clamp(p.love + 12); p.city = c.home.city; p.months = 0;
    if (size === 'sedang') gainAttr(s, 'jaringan', 3);
    if (size === 'mewah') { gainAttr(s, 'jaringan', 6); gainPop(s, 'kabupaten', 2); gainPop(s, 'desa', -1); }
    setFlag(s, 'menikah');
    s.result = { title: 'Sah!', text: `${w.desc} Kamu dan ${p.name} resmi menjadi suami istri.`, fx: [] };
    addHistory(s, `Menikah dengan ${p.name} (${w.name.toLowerCase()}).`);
    return;
  }
  if (act === 'putus') {
    if (p.stage === 'menikah') { c.money -= 20; endPartner(s, `Bercerai dengan ${p.name}.`, 'pilihan'); }
    else endPartner(s, `Putus dengan ${p.name}.`, 'pilihan');
  }
}

export function childAge(s: GameState, born: number) { return Math.floor((s.turn - born) / 12); }
export function childCost(s: GameState): number {
  const living = cityOf(s).living;
  return s.char.children.reduce((a, k) => {
    const y = childAge(s, k.born);
    return a + (y < 6 ? 1.2 : y < 18 ? 1.5 + living * 0.35 : y < 23 ? 3 : 0);
  }, 0);
}

function stepLove(s: GameState, u: Record<string, number>) {
  const c = s.char;
  if (c.loveLeft > 0) c.loveLeft--;
  if (c.prospect && rand(s) < 0.25) { log(s, `${c.prospect.name} tidak lagi membalas pesan.`); c.prospect = null; }
  const p = c.partner;
  if (p) {
    p.months++;
    if (p.stage === 'menikah' && !cityDef(c.home.city).abroad) p.city = c.home.city;
    const ldr = p.city !== c.home.city;
    let d = p.stage === 'menikah' ? -0.55 : -1.1;
    if (ldr) d *= 2.2;
    d += (u['pasangan'] ?? 0) * (4 + p.fit * 0.2);
    if (p.stage === 'menikah') d += (u['keluarga'] ?? 0) * 2;
    if (c.attr.stres > 70) d -= 0.6;
    if (p.trait === 'cemburuan' && (c.orgs.length > 1 || s.campaign)) d -= 0.5;
    if (p.trait === 'boros' && c.money < 0) d -= 0.8;
    if (p.trait === 'religius' && c.attr.integritas < 40) d -= 0.5;
    if (p.trait === 'idealis' && c.heat > 30) d -= 0.6;
    if (p.trait === 'perhatian') d += 0.3;
    if (p.trait === 'ambisius' && !c.job && !c.edu && !s.office) d -= 0.6;
    p.love = clamp(p.love + d);
    if (p.love > 55) c.attr.stres = clamp(c.attr.stres - 0.4);
    if (p.love < 8) {
      if (p.stage === 'menikah') endPartner(s, `${p.name} menggugat cerai. Rumah tangga kalian berakhir.`, 'akibat');
      else endPartner(s, `${p.name} memutuskan hubungan kalian.`, 'akibat');
      log(s, 'Hubungan asmaramu berakhir.');
    } else if (p.stage === 'menikah' && c.wantKids && c.children.length < 5) {
      const womanAge = c.gender === 'P' ? age(s) : partnerAge(s);
      const ch = womanAge < 33 ? 0.035 : womanAge < 38 ? 0.022 : womanAge < 43 ? 0.008 : 0;
      if (rand(s) < ch) {
        const g: 'L' | 'P' = rand(s) < 0.5 ? 'L' : 'P';
        const kid = { name: `${pick(s, g === 'L' ? NAMES_L : NAMES_P)} ${c.name.split(' ').slice(-1)[0]}`, gender: g, born: s.turn };
        c.children.push(kid);
        c.attr.stres = clamp(c.attr.stres + 3);
        setFlag(s, 'punya_anak');
        addHistory(s, `Anak ke-${c.children.length} lahir: ${kid.name}.`);
      }
    }
  }
  for (const k of c.children) {
    const m = s.turn - k.born;
    if (m === 18 * 12) addHistory(s, `${k.name} lulus SMA.`);
    if (m === 7 * 12) log(s, `${k.name} masuk sekolah dasar.`);
  }
  if (c.children.some(k => childAge(s, k.born) < 6)) c.attr.stres = clamp(c.attr.stres + 0.25);
  if (c.children.length) c.attr.stres = clamp(c.attr.stres - 0.15 - (u['keluarga'] ?? 0) * 0.5);

  // Orang tua menua.
  if (s.turn % 12 === 0) c.parentAge++;
  if (c.parents > 0 && c.parentAge >= 62 && rand(s) < (c.parentAge - 58) * 0.0007) {
    c.parents--;
    c.attr.stres = clamp(c.attr.stres + 15);
    addHistory(s, c.parents === 1 ? 'Salah satu orang tuamu meninggal dunia.' : 'Orang tuamu yang tersisa meninggal dunia.', 'akibat');
    if (c.parents === 0) inherit(s);
  }
}

function inherit(s: GameState) {
  const c = s.char, h = c.home;
  const cash = Math.round(Math.max(0, c.family.fund) * 0.8);
  pay(s, 'Warisan', cash);
  c.family = { fund: 0, allowance: 0, tuitionCap: 0, asked: c.family.asked };
  let text = `Warisan ${cash} juta dibagi untukmu.`;
  if (!h.house) {
    h.house = { city: h.hometown, value: housePrice(h.hometown) * 0.7, addr: `Rumah peninggalan orang tua, ${cityName(s, h.hometown)}` };
    text += ' Rumah keluarga di kampung kini atas namamu.';
    if (h.housing === 'ortu') { h.housing = 'rumah'; h.addr = h.house.addr; }
  } else if (h.housing === 'ortu') relocate(s, h.city, 'kontrakan');
  log(s, text);
}

// =====================================================================
// PEMILU: kamu juga pemilih
// =====================================================================
export function voteAct(s: GameState, index: number, party: string | null, endorse: boolean) {
  const b = s.ballot;
  if (!b) return;
  const c = s.char;
  const shares = b.cands.map(x => Math.max(5, x.base + range(s, -7, 7)));
  if (index >= 0 && index < b.cands.length) {
    shares[index] += 0.15;
    if (endorse && c.pop.nasional >= 25) shares[index] += c.pop.nasional * 0.12;
  }
  const total = shares.reduce((a, v) => a + v, 0);
  const pct = shares.map(v => v / total);
  let win = 0;
  pct.forEach((v, i) => { if (v > pct[win]) win = i; });
  const w = b.cands[win];
  // Pemilu legislatif serentak: kursi bergeser sedikit.
  for (const k of Object.keys(s.seats)) s.seats[k] = Math.max(3, s.seats[k] + range(s, -2.5, 2.5) + (k === w.party ? 2 : 0) + (k === party ? 0.1 : 0));
  const tot = Object.values(s.seats).reduce((a, v) => a + v, 0);
  for (const k of Object.keys(s.seats)) s.seats[k] = Math.round(s.seats[k] / tot * 100);
  c.votes++;
  if (party && c.party === party) c.partyStanding = clamp(c.partyStanding + 1);
  if (endorse && index >= 0) {
    if (index === win) { gainAttr(s, 'jaringan', 2); setFlag(s, 'pendukung_presiden'); }
    gainPop(s, 'nasional', 0.5);
  }
  const chosen = index >= 0 ? b.cands[index].name : null;
  addHistory(s, chosen ? `Mencoblos ${chosen} di pemilu presiden ${year(s)}${endorse ? ' dan mendukungnya terbuka' : ''}.` : `Golput di pemilu presiden ${year(s)}.`, 'pilihan');
  s.result = {
    title: `Hasil pemilu ${year(s)}`,
    text: b.cands.map((x, i) => `${x.name}: ${(pct[i] * 100).toFixed(1)}%`).join(' · ') + `. ${w.name} menang${chosen === w.name ? ', sesuai pilihanmu' : chosen ? '; calonmu kalah' : ''}.`,
    fx: [],
  };
  s.ballot = null;
  return { name: w.name, party: w.party, style: w.style };
}

// =====================================================================
// BULANAN
// =====================================================================
export function planOk(s: GameState, need?: string): boolean {
  const c = s.char;
  switch (need) {
    case 'job': return !!c.job;
    case 'party': return !!c.party;
    case 'money': return c.money >= 2;
    case 'research': return !!c.research;
    case 'comp': return !!c.comp;
    case 'partner': return !!c.partner;
    case 'family': return married(s) || c.children.length > 0;
    case 'org': return c.orgs.length > 0;
    default: return true;
  }
}

/** Belanja rumah tangga, sewa, cicilan, anak, dan efek tempat tinggal. Mengembalikan pengeluaran. */
function household(s: GameState, income: number) {
  const c = s.char, h = c.home;
  const city = cityOf(s);
  const ortu = h.housing === 'ortu';
  const sc = c.edu?.funding ? SCHOLARSHIPS.find(b => b.id === c.edu!.funding) : null;
  pay(s, 'Makan & transport', -city.living * (ortu ? 0.25 : c.edu ? 0.85 : 1) * (married(s) ? 1.5 : 1));
  pay(s, 'Sewa tempat tinggal', -rentOf(s, h.city, h.housing));
  pay(s, 'Gaya hidup', -Math.max(0, income) * 0.27);
  pay(s, 'Anak', -childCost(s));
  // Beasiswa menanggung biaya hidup dasar sesuai kota kuliah, plus sedikit uang saku.
  if (sc) pay(s, sc.covers === 'penuh' ? 'Beasiswa (biaya hidup)' : 'Beasiswa (uang saku)', scholarshipLiving(s.char.home.city, sc.id));
  if (h.kpr) { pay(s, 'Cicilan KPR', -h.kpr.monthly); if (--h.kpr.left <= 0) { h.kpr = null; addHistory(s, 'KPR lunas. Rumah sepenuhnya milikmu.'); } }
  // Pasangan ikut menanggung.
  if (married(s) && c.partner!.city === h.city && !city.abroad) pay(s, 'Penghasilan pasangan', c.partner!.income * 0.55);
  // Rumah: naik harga; disewakan bila tidak ditinggali.
  if (h.house) {
    h.house.value *= 1.0032;
    if (h.housing !== 'rumah') pay(s, 'Sewa rumahmu', h.house.value * 0.0028);
  }
  const hs = housingDef(h.housing);
  c.attr.stres = clamp(c.attr.stres + hs.stres + (ortu && age(s) >= 26 ? 0.25 : 0) + (h.city === 'ibukota' ? 0.15 : 0));
  if (city.pop) gainPop(s, city.pop, 0.02);
  if (city.abroad) { c.pop.desa = clamp(c.pop.desa - 0.12); c.pop.kabupaten = clamp(c.pop.kabupaten - 0.06); }
  // Visa: di luar negeri tanpa kuliah atau kerja tidak bisa lama.
  if (city.abroad && !c.edu && !c.job) {
    s.flags['tanpa_visa'] = (s.flags['tanpa_visa'] ?? 0) + 1;
    if (s.flags['tanpa_visa'] >= 4) {
      relocate(s, h.hometown, c.parents > 0 ? 'ortu' : h.house?.city === h.hometown ? 'rumah' : 'kontrakan');
      addHistory(s, 'Izin tinggal habis; pulang ke kampung halaman.', 'akibat');
      delete s.flags['tanpa_visa'];
    }
  } else delete s.flags['tanpa_visa'];
}

// =====================================================================
// UANG KELUARGA
// =====================================================================
/** Ubah uang sambil mencatat di rincian bulanan. */
export function pay(s: GameState, key: string, amount: number) {
  if (!amount) return;
  s.char.money += amount;
  s.char.ledger[key] = (s.char.ledger[key] ?? 0) + amount;
}
const parentStrength = (s: GameState) => (s.char.parents === 0 ? 0 : s.char.parentAge >= 62 ? 0.55 : 1) * (s.char.parents === 1 ? 0.7 : 1);
/** Berapa juta per bulan orang tua sanggup menanggung biaya kuliah. */
export const parentTuition = (s: GameState) => s.char.family.tuitionCap * parentStrength(s);
/** Uang saku bulanan dari orang tua dalam keadaan sekarang. */
export function parentAllowance(s: GameState): number {
  const c = s.char, f = c.family;
  if (c.parents === 0 || f.fund < -5) return 0;
  const a = age(s);
  let k = c.edu ? 1 : a < 23 && !c.job ? 0.5 : 0;
  return f.allowance * parentStrength(s) * k;
}
/** Kekurangan biaya kuliah per bulan setelah dibantu orang tua (tanpa beasiswa). */
export function tuitionGap(s: GameState, campusId: string): number {
  const campus = CAMPUSES.find(x => x.id === campusId)!;
  return Math.max(0, campus.costPerMonth - parentTuition(s));
}
export function askParentsBlock(s: GameState): string | null {
  const c = s.char;
  if (c.parents === 0) return 'Orang tuamu sudah tiada';
  if (c.jail > 0) return 'Sedang dipenjara';
  if (c.family.asked && s.turn - c.family.asked < 6) return `Baru saja minta; tunggu ${6 - (s.turn - c.family.asked)} bulan`;
  if (c.family.fund < 3) return 'Orang tua sedang tidak punya uang lebih';
  return null;
}
export const askParentsAmount = (s: GameState) => Math.round(Math.min(s.char.family.fund * 0.25, Math.max(3, s.char.family.allowance * 8)));
export function askParents(s: GameState) {
  if (askParentsBlock(s)) return;
  const c = s.char;
  const amt = askParentsAmount(s);
  c.family.fund -= amt; c.family.asked = s.turn;
  c.money += amt;
  const a = age(s);
  if (a >= 25) c.attr.stres = clamp(c.attr.stres + 2);
  s.result = { title: 'Minta uang ke orang tua', text: a >= 25 ? `Ibumu mentransfer ${amt} juta tanpa banyak tanya. Ayahmu cuma bilang, "Sudah umur segini, ya." Kalimatnya lebih berat dari nominalnya.` : `Orang tuamu mengirim ${amt} juta. "Hemat-hemat, ya, Nak."`, fx: [] };
  log(s, `Menerima ${amt} juta dari orang tua.`);
}
function stepFamily(s: GameState) {
  const c = s.char, f = c.family;
  if (c.parents === 0) return;
  // Tabungan orang tua tumbuh dari penghasilan mereka sendiri.
  f.fund += f.allowance * 0.45 * parentStrength(s);
  pay(s, 'Uang saku orang tua', parentAllowance(s));
}

export function stepPersonal(s: GameState, u: Record<string, number>, income: number) {
  const c = s.char;
  stepFamily(s);
  const k = (u['kursus'] ?? 0);
  c.lang = clamp(c.lang + (k * 0.9 + (isAbroad(s) ? 0.8 : 0) + (c.habits.includes('membaca') ? 0.04 : 0)) * (1 - c.lang / 125));
  household(s, income);
  stepResearch(s, u);
  stepOrgs(s, u);
  stepComp(s, u);
  stepLove(s, u);
  if (c.pension > 0) pay(s, 'Pensiun', c.pension);
  if (c.scholarship && s.turn - c.scholarship.turn > 18) {
    log(s, 'Beasiswamu kedaluwarsa karena tak kunjung dipakai.');
    c.scholarship = null;
  }
}

// =====================================================================
// AWAL PERMAINAN & SAVE LAMA
// =====================================================================
/** Kampung halaman di peta: provinsi acak, kabupaten di provinsi itu, dan satu desa di kabupatennya. */
function mapNames(s: GameState): Home['names'] {
  const pv = pick(s, PROVINCES);
  const capital = pv.cities.find(c => c.capital) ?? pv.cities[0];
  const others = pv.cities.filter(c => c !== capital);
  const kab = others.length ? pick(s, others.filter(c => c.kind === 'kabupaten').length ? others.filter(c => c.kind === 'kabupaten') : others) : capital;
  const kec = pick(s, districts(kab));
  const unit = pick(s, kec.units);
  const u = unitNames(pv, kab);
  return { desa: `${u.kel} ${unit.name}`, kab: kab.name, prov: capital.name, provName: pv.name, kabId: kab.id, provCityId: capital.id, kec: `${u.kec} ${kec.name}` };
}

export function initPersonal(s: GameState, home: CityTier, aspiration: string) {
  const c = s.char;
  const names = mapNames(s);
  c.aspiration = aspiration;
  c.home = { city: home, housing: 'ortu', addr: '', names, hometown: home, house: null, kpr: null };
  c.home.addr = makeAddr(s, home, 'ortu');
  const bgLang = hasFlag(s, 'latar:kaya') || hasFlag(s, 'latar:dinasti') ? 45 : hasFlag(s, 'latar:menengah') ? 30 : 16;
  c.lang = clamp(bgLang + range(s, 0, 14));
  const bg = BACKGROUNDS.find(b => hasFlag(s, b.flags[0]));
  c.family = { fund: bg?.family.fund ?? 40, allowance: bg?.family.allowance ?? 1, tuitionCap: bg?.family.tuitionCap ?? 2, asked: 0 };
  c.ledger = {};
  c.parentAge = age(s) + randInt(s, 24, 32);
}

export function migratePersonal(s: GameState) {
  const c = s.char as Character & Record<string, unknown>;
  if (s.ballot === undefined) s.ballot = null;
  if (s.char.home && !s.char.family) {
    const bg = BACKGROUNDS.find(b => hasFlag(s, b.flags[0]));
    s.char.family = { fund: bg?.family.fund ?? 40, allowance: bg?.family.allowance ?? 1, tuitionCap: bg?.family.tuitionCap ?? 2, asked: 0 };
  }
  if (!s.char.ledger) s.char.ledger = {};
  if (!s.char.time) {
    const t: Record<string, number> = {};
    for (const id of s.char.plan ?? []) t[id] = (t[id] ?? 0) + 10;
    s.char.time = t; s.char.sleep = 7.5;
  }
  if (!c.home) {
    Object.assign(c, {
      aspiration: 'presiden', lang: 30, langTest: null, gpa: null, scholarship: null, orgs: [], research: null, pubs: [], comp: null, awards: [],
      partner: null, prospect: null, exes: [], children: [], wantKids: false, parents: 2, parentAge: age(s) + 28, votes: 0, loveLeft: 0, pension: 0, ledger: {},
    });
    const bg0 = BACKGROUNDS.find(b => hasFlag(s, b.flags[0]));
    c.family = { fund: bg0?.family.fund ?? 40, allowance: bg0?.family.allowance ?? 1, tuitionCap: bg0?.family.tuitionCap ?? 2, asked: 0 };
    const bg = BACKGROUNDS.find(b => hasFlag(s, b.flags[0]));
    const home = bg?.home ?? 'kabupaten';
    c.home = { city: home, housing: 'ortu', addr: '', names: { desa: DESA_NAMES[0], kab: KAB_NAMES[0], prov: PROV_NAMES[0] }, hometown: home, house: null, kpr: null };
    c.home.addr = makeAddr(s, home, 'ortu');
    if (c.edu) {
      const campus = CAMPUSES.find(x => x.id === c.edu!.campus);
      if (campus) relocate(s, campus.city, campus.abroad ? 'asrama' : 'kos');
    } else if (c.campus) {
      const campus = CAMPUSES.find(x => x.id === c.campus);
      if (campus && !campus.abroad) relocate(s, campus.city, 'kos');
    }
  }
  if (c.edu && (c.edu as { gpa?: number }).gpa === undefined) Object.assign(c.edu, { gpa: 3, funding: null, total: c.edu.level === 'S2' ? 24 : 48, ext: 0, pubs0: 0 });
}

// Lokasi pekerjaan dipakai life.ts dan move().
export function jobLocationBlock(s: GameState, j: Job): string | null {
  const tier = s.char.home.city;
  const city = cityDef(tier);
  if (city.abroad) {
    if (!j.abroadOk) return 'Tidak bisa dikerjakan dari luar negeri';
    const bond = s.flags['ikatan_dan'];
    if (bond !== undefined && s.turn - bond < 60) return 'Ikatan beasiswa: wajib bekerja di Nagari';
    return null;
  }
  const where = j.where ?? URBAN;
  if (!where.includes(tier)) {
    const names = where.map(t => CITIES.find(x => x.id === t)!.short.toLowerCase());
    return `Hanya ada di ${names.join(', ')}; pindah dulu (tab Hidup)`;
  }
  return null;
}

export { DOMESTIC };

// =====================================================================
// CITA-CITA & RINGKASAN HIDUP
// =====================================================================
const CREATIVE = ['musisi', 'penulis', 'influencer', 'desainer', 'koki', 'atlet'];
/** Daftar target cita-cita dan apakah sudah tercapai. */
export function aspirationGoals(s: GameState): { text: string; done: boolean }[] {
  const c = s.char;
  const intl = c.pubs.filter(p => p.venue === 'internasional').length;
  switch (c.aspiration) {
    case 'presiden': return [{ text: 'Terpilih jadi presiden', done: c.everOffice.includes('presiden') }];
    case 'pengusaha': return [{ text: `Kekayaan bersih 10 miliar (sekarang ${(netWorth(s) / 1000).toFixed(1)} miliar)`, done: netWorth(s) >= 10000 }];
    case 'ilmuwan': return [
      { text: 'Gelar doktor (S3)', done: c.degree === 'S3' },
      { text: `8 publikasi (sekarang ${c.pubs.length})`, done: c.pubs.length >= 8 },
      { text: `2 publikasi internasional (sekarang ${intl})`, done: intl >= 2 },
    ];
    case 'profesional': return [{ text: 'Mencapai jenjang tertinggi di pekerjaan', done: hasFlag(s, 'puncak_karier') || (!!c.job && c.jobLevel >= 4) }];
    case 'kreator': return [
      { text: 'Pekerjaan kreatif (musisi, penulis, kreator, desainer, koki, atlet)', done: CREATIVE.includes(c.job ?? '') || hasFlag(s, 'pernah_kreatif') },
      { text: `Popularitas nasional 60 (sekarang ${Math.round(c.pop.nasional)})`, done: c.pop.nasional >= 60 },
    ];
    case 'keluarga': return [
      { text: 'Menikah', done: married(s) },
      { text: 'Punya anak', done: c.children.length > 0 },
      { text: 'Punya rumah sendiri', done: !!c.home.house },
      { text: `Stres di bawah 40 (sekarang ${Math.round(c.attr.stres)})`, done: c.attr.stres < 40 },
    ];
    case 'pengabdi': return [
      { text: `Integritas 75 (sekarang ${Math.round(c.attr.integritas)})`, done: c.attr.integritas >= 75 },
      { text: `Popularitas kabupaten 50 (sekarang ${Math.round(c.pop.kabupaten)})`, done: c.pop.kabupaten >= 50 },
    ];
    default: return [];
  }
}
export const aspirationMet = (s: GameState) => { const g = aspirationGoals(s); return g.length > 0 && g.every(x => x.done); };

/** Catatan prestasi untuk layar akhir. */
export function achievements(s: GameState): string[] {
  const c = s.char, out: string[] = [];
  if (c.degree) out.push(`Pendidikan: ${c.degree} ${MAJORS.find(m => m.id === c.major)?.name ?? ''}${c.gpa ? `, IPK ${c.gpa.toFixed(2)}` : ''}${hasFlag(s, 'pernah_luar_negeri') ? ', pernah belajar di luar negeri' : ''}.`);
  if (c.pubs.length) out.push(`${c.pubs.length} publikasi ilmiah (${c.pubs.filter(p => p.venue === 'internasional').length} internasional).`);
  if (c.awards.length) out.push(`Prestasi: ${c.awards.slice(-3).join('; ')}${c.awards.length > 3 ? ` dan ${c.awards.length - 3} lainnya` : ''}.`);
  if (hasFlag(s, 'pernah_ketua')) out.push('Pernah memimpin organisasi.');
  if (hasFlag(s, 'puncak_karier')) out.push('Pernah mencapai jenjang puncak kariernya.');
  if (married(s)) out.push(`Menikah dengan ${c.partner!.name}${c.children.length ? `, ${c.children.length} anak` : ''}.`);
  else if (c.children.length) out.push(`${c.children.length} anak.`);
  out.push(`Kekayaan bersih ${Math.round(netWorth(s))} juta; tinggal di ${cityName(s)}.`);
  if (c.votes) out.push(`Ikut mencoblos ${c.votes} kali.`);
  return out;
}

/** Skor hidup di luar jabatan politik (0-100). */
export function lifeScore(s: GameState): number {
  const c = s.char;
  const wealth = Math.max(0, netWorth(s));
  const v = degRank(c.degree) * 4 + Math.min(15, c.pubs.length * 1.5) + Math.min(10, c.awards.length * 2)
    + (hasFlag(s, 'puncak_karier') ? 16 : (c.job ? c.jobLevel * 3.5 : 0))
    + Math.min(15, Math.log10(1 + wealth) * 3.5) + (married(s) ? 6 : 0) + Math.min(6, c.children.length * 2)
    + (c.attr.integritas - 50) * 0.15 + (40 - c.attr.stres) * 0.1 + (aspirationMet(s) ? 20 : 0) - (hasFlag(s, 'pernah_dipenjara') ? 10 : 0);
  return Math.round(clamp(v));
}
