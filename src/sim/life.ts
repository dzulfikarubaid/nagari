// Kehidupan pribadi: pendidikan, pekerjaan, kebiasaan, pertemanan, kesehatan, uang.
import type { GameState, Job, AttrKey, Level, Npc, DegreeLevel } from './types';
import { applyFx, gainAttr, gainPop, rand, range, pick, clamp, age, addHistory, log, setFlag, hasFlag, finish, friends, findNpc } from './core';
import { CAMPUS_CRIT, JOB_CRIT, PARTY_CRIT, type Criteria } from '../content/data';
import { JOBS, JOB_LEVEL_MULT, HABITS, HABIT_SLOTS, PLAN_ACTIONS, MAJORS, CAMPUSES, S2_MONTHS, S3_MONTHS, PARTIES, officeDef, rankName } from '../content/data';
import { SCHOLARSHIPS, cityDef } from '../content/life';
import { effectiveTime, unitsOf, freeHours, setPlanSlots, sideIncome } from './time';
import { coversTuition, pay, pay as pay_, parentTuition, tuitionGap, scholarshipFitsCampus, applyScholarship, scholarshipBlock } from './personal';
import { cityOf, cityName, relocate, langScore, scholarshipFits, nextLevel, degRank, cvBonus, gpaTarget, pruneOrgs, stepPersonal, planOk, jobLocationBlock, married } from './personal';

/** Bulan tersisa sebelum boleh mendaftar lagi ke lembaga yang baru menolak. */
export function retryWait(s: GameState, key: string, months: number): number {
  const last = s.flags['tolak:' + key];
  return last === undefined ? 0 : Math.max(0, months - (s.turn - last));
}

/** Seleksi: nilai pelamar melawan ambang lembaga. */
function selection(s: GameState, crit: Criteria | undefined, bonus = 0): boolean {
  if (!crit || crit.auto) return true;
  const c = s.char;
  let sum = 0, wsum = 0;
  for (const [k, w] of Object.entries(crit.w) as [AttrKey, number][]) { sum += c.attr[k] * w; wsum += w; }
  const base = wsum ? sum / wsum : 50;
  const score = base + c.attr.jaringan * (crit.net ?? 0) + bonus + range(s, -7, 7) - (hasFlag(s, 'pernah_dipenjara') ? 14 : 0);
  return score >= crit.bar;
}
function announce(s: GameState, ok: boolean, title: string, text: string) {
  s.result = { title, text, fx: [] };
  addHistory(s, (ok ? 'Diterima: ' : 'Ditolak: ') + title + '.', ok ? 'tonggak' : 'akibat');
}

export const jobOf = (s: GameState): Job | undefined => JOBS.find(j => j.id === s.char.job);

/** Alasan tidak bisa mengambil pekerjaan; null = boleh. */
export function jobBlock(s: GameState, job: Job): string | null {
  const c = s.char;
  if (c.jail > 0) return 'Sedang dipenjara';
  if (s.office) return 'Sedang menjabat';
  if (c.edu) return 'Masih kuliah';
  if (job.id === 'staf_partai' && !c.party) return 'Harus anggota partai';
  const n = job.need;
  if (n?.degree && !c.degree) return 'Butuh gelar sarjana';
  if (n?.level && degRank(c.degree) < degRank(n.level)) return `Butuh gelar ${n.level}`;
  if (n?.majors && !(c.major && n.majors.includes(c.major))) return `Butuh jurusan ${n.majors.map(m => MAJORS.find(x => x.id === m)?.name).join(' / ')}`;
  if (n?.maxAge && age(s) > n.maxAge) return `Batas usia masuk ${n.maxAge} tahun`;
  if (n?.capital && c.money < n.capital) return `Butuh modal ${n.capital} juta`;
  if (job.id === 'tentara' && age(s) > 30 && c.major !== 'militer') return 'Batas usia masuk 30 tahun';
  const loc = jobLocationBlock(s, job);
  if (loc) return loc;
  const wait = retryWait(s, 'job:' + job.id, 8);
  if (wait > 0) return `Baru ditolak; bisa melamar lagi ${wait} bulan lagi`;
  return null;
}

const TOP_CAMPUS = ['negeri_favorit', 'iup', 'luar_negeri', 'australis_u', 'temasik_u', 'tiongkara_u'];

export function takeJob(s: GameState, id: string) {
  const job = JOBS.find(j => j.id === id);
  if (!job || jobBlock(s, job) || s.char.job === id) return;
  const c = s.char;
  // Ekonomi lesu = lowongan sedikit; lulusan kampus bagus, IPK tinggi, dan prestasi lebih dilirik.
  const bonus = -(s.nation.pengangguran - 6) * 1.5 + (degRank(c.degree) >= 2 ? 4 : 0) + (c.degree === 'S3' ? 2 : 0) + (TOP_CAMPUS.includes(c.campus ?? '') ? 4 : 0)
    + cvBonus(s) * 0.6 + (['konsultan', 'diplomat', 'peneliti', 'dosen'].includes(id) && langScore(s) >= 6.5 ? 4 : 0)
    + (cityOf(s).abroad ? -4 : 0) + (id === 'staf_partai' ? c.partyStanding * 0.3 : 0);
  const lower = job.name.toLowerCase();
  if (!selection(s, JOB_CRIT[id], bonus)) {
    s.flags['tolak:job:' + id] = s.turn;
    c.attr.stres = clamp(c.attr.stres + 3);
    announce(s, false, 'Lamaran ' + lower, `Lamaranmu sebagai ${lower} ditolak. ${JOB_CRIT[id]?.note ?? ''} Kamu bisa mencoba lagi 8 bulan lagi, atau melamar ke tempat lain.`);
    return;
  }
  if (!JOB_CRIT[id]?.auto) announce(s, true, 'Lamaran ' + lower, `Kamu diterima bekerja sebagai ${lower} di ${cityName(s)}.`);
  if (job.need?.capital) c.money -= job.need.capital;
  c.job = id; c.jobLevel = 0; c.jobMonths = 0;
  if (['musisi', 'penulis', 'influencer', 'desainer', 'koki', 'atlet'].includes(id)) setFlag(s, 'pernah_kreatif');
  addHistory(s, `Mulai bekerja sebagai ${job.name.toLowerCase()} di ${cityName(s)}.`, 'pilihan');
}

export function quitJob(s: GameState) {
  const j = jobOf(s);
  if (!j) return;
  if (hasFlag(s, 'ikatan_dinas') && (s.char.job === 'tentara' || s.char.job === 'pns') && s.char.jobMonths < 60) {
    s.char.money -= 30; s.char.pop.kabupaten = clamp(s.char.pop.kabupaten - 2);
    log(s, 'Melanggar ikatan dinas: denda 30 juta.');
  }
  s.char.job = null; s.char.jobLevel = 0; s.char.jobMonths = 0;
  addHistory(s, `Berhenti dari pekerjaan sebagai ${j.name.toLowerCase()}.`, 'pilihan');
}

const monthsFor = (level: DegreeLevel, campusMonths: number) => level === 'S3' ? S3_MONTHS : level === 'S2' ? S2_MONTHS : campusMonths;

export function enrollBlock(s: GameState, campusId: string, majorId: string, withScholarship?: string): string | null {
  const c = s.char;
  const campus = CAMPUSES.find(x => x.id === campusId);
  const major = MAJORS.find(x => x.id === majorId);
  if (!campus || !major) return 'Pilihan tidak valid';
  if (c.jail > 0) return 'Sedang dipenjara';
  if (c.edu) return 'Sudah kuliah';
  if (s.office) return 'Sedang menjabat';
  const level = nextLevel(c);
  if (!level) return 'Sudah S3; tidak ada jenjang lagi';
  if (!campus.levels.includes(level)) return `Kampus ini tidak membuka ${level}`;
  if (level === 'S1' && age(s) > 30) return 'Terlalu tua untuk S1';
  if (level === 'S2' && (c.gpa ?? 0) < 2.75) return 'S2 butuh IPK S1 minimal 2.75';
  if (level === 'S3' && (c.gpa ?? 0) < 3.0) return 'S3 butuh IPK S2 minimal 3.00';
  if (level === 'S3' && c.pubs.length < 1 && c.attr.kecerdasan < 70) return 'S3 butuh publikasi atau kecerdasan 70';
  if (campusId === 'akmil') {
    if (age(s) > 22) return 'Batas usia Akmil 22 tahun';
    if (majorId !== 'militer') return 'Akmil hanya jurusan militer';
  } else if (majorId === 'militer') return 'Hanya ada di Akademi Militer';
  if (level !== 'S1' && c.major && majorId !== c.major && level === 'S3') return 'S3 harus linier dengan jurusan S2';
  if (campusId === 'kedinasan' && age(s) > 22) return 'Kedinasan hanya untuk lulusan SMA (maks. 22 tahun)';
  if (campus.lang && langScore(s) < campus.lang) return `Butuh skor tes bahasa Inggris ${campus.lang.toFixed(1)} (tes di tab Studi)`;
  const wait = retryWait(s, 'kampus:' + campusId, 12);
  if (wait > 0) return `Seleksi berikutnya ${wait} bulan lagi`;
  const covered = (scholarshipFits(s, campusId) && coversTuition(c.scholarship?.id)) || (!!withScholarship && !c.scholarship && scholarshipFitsCampus(withScholarship, campusId) && coversTuition(withScholarship));
  if (!covered) {
    const gap = tuitionGap(s, campusId);
    const need = Math.ceil(gap * (campus.abroad ? 12 : 6));
    if (gap > 0 && c.money + Math.max(0, c.family.fund) * 0.5 < need) {
      return c.parents ? `Orang tua hanya sanggup ${parentTuition(s).toFixed(1)} jt/bln; butuh tabungan ${need} jt atau beasiswa` : `Butuh tabungan ${need} jt atau beasiswa`;
    }
  }
  return null;
}

export function enroll(s: GameState, campusId: string, majorId: string, scholarship?: string) {
  const c = s.char;
  // Daftar beasiswa sekalian.
  let schText = '';
  if (scholarship && !c.scholarship && !enrollBlock(s, campusId, majorId, scholarship) && !scholarshipBlock(s, scholarship) && scholarshipFitsCampus(scholarship, campusId)) {
    applyScholarship(s, scholarship);
    schText = s.result?.text ?? '';
    s.result = null;
    if (enrollBlock(s, campusId, majorId)) {
      s.result = { title: 'Pendaftaran kuliah', text: `${schText} Tanpa beasiswa itu, biaya kuliahnya di luar kemampuan keluargamu, jadi pendaftaran dibatalkan.`, fx: [] };
      return;
    }
  }
  if (enrollBlock(s, campusId, majorId)) return;
  const campus = CAMPUSES.find(x => x.id === campusId)!;
  const level = nextLevel(c)!;
  const major0 = MAJORS.find(m => m.id === majorId)!;
  // Kedokteran paling diperebutkan; jenjang lanjut menimbang IPK dan publikasi.
  const bonus = (majorId === 'kedokteran' ? -7 : majorId === 'hukum' || majorId === 'teknik' || majorId === 'informatika' ? -2 : 0)
    + (level !== 'S1' ? -3 + cvBonus(s) : 0) + (level === 'S3' ? -4 : 0) + (hasFlag(s, 'latar:dinasti') && campusId === 'akmil' ? 4 : 0)
    + (level === 'S1' ? Math.min(4, c.awards.length * 2) : 0);
  if (!selection(s, CAMPUS_CRIT[campusId], bonus)) {
    s.flags['tolak:kampus:' + campusId] = s.turn;
    c.attr.stres = clamp(c.attr.stres + 5);
    announce(s, false, 'Seleksi ' + campus.name, `Namamu tidak ada di daftar yang lolos ${level} ${major0.name}. ${CAMPUS_CRIT[campusId]?.note ?? ''} Seleksi berikutnya tahun depan; kamu bisa mencoba kampus lain atau bekerja dulu.`);
    return;
  }
  const funding = scholarshipFits(s, campusId) ? c.scholarship!.id : null;
  const sname = funding ? SCHOLARSHIPS.find(b => b.id === funding)!.name : null;
  if (funding) c.scholarship = null;
  // Kekurangan biaya ditalangi tabungan keluarga sebisanya.
  if (!coversTuition(funding)) {
    const gap = tuitionGap(s, campusId) * (campus.abroad ? 12 : 6);
    const fromFamily = Math.min(Math.max(0, c.family.fund) * 0.5, Math.max(0, gap - Math.max(0, c.money)));
    if (fromFamily > 0) { c.family.fund -= fromFamily; c.money += fromFamily; log(s, `Orang tua menjual simpanan dan mengirim ${Math.round(fromFamily)} juta untuk biaya kuliah.`); }
  }
  announce(s, true, 'Seleksi ' + campus.name, `${schText ? schText + ' ' : ''}Selamat, kamu diterima di ${level} ${major0.name}, ${campus.name}${sname ? `, dibiayai ${sname}` : ''}.${campus.iup ? ' Tahun ketiga kamu akan kuliah di kampus mitra luar negeri.' : ''}`);
  if (c.job) { c.job = null; c.jobLevel = 0; c.jobMonths = 0; }
  const total = monthsFor(level, campus.months);
  const e = { campus: campusId, major: majorId, monthsLeft: total, total, level, gpa: 0, funding, ext: 0, pubs0: c.pubs.length } as NonNullable<typeof c.edu>;
  if (campus.iup) e.away = { city: pick(s, ['atlantika', 'australis', 'temasik'] as const), from: 24, to: 12, kind: 'iup' };
  c.edu = e;
  e.gpa = gpaTarget(s, unitsOf(effectiveTime(s)));
  // Pindah ke kota kampus.
  const h = c.home;
  if (campus.city !== h.city || campusId === 'akmil' || campusId === 'kedinasan' || campus.abroad) {
    const housing = campus.abroad || campusId === 'akmil' || campusId === 'kedinasan' ? 'asrama' : campus.city === h.hometown && c.parents > 0 ? 'ortu' : h.house?.city === campus.city ? 'rumah' : 'kos';
    relocate(s, campus.city, housing);
    if (campus.abroad) setFlag(s, 'pernah_luar_negeri');
  }
  addHistory(s, `Mulai kuliah ${level} ${major0.name} di ${campus.name} (${cityName(s)}).`, 'pilihan');
}

/** Pulang dari IUP/pertukaran ke tempat tinggal semula. */
function comeBack(s: GameState) {
  const b = s.char.home.back;
  if (!b) return;
  s.char.home.city = b.city; s.char.home.housing = b.housing; s.char.home.addr = b.addr;
  delete s.char.home.back;
}

export function dropOut(s: GameState) {
  const c = s.char;
  if (!c.edu) return;
  comeBack(s);
  c.edu = null;
  setFlag(s, 'putus_kuliah');
  addHistory(s, 'Berhenti kuliah sebelum lulus.', 'pilihan');
  pruneOrgs(s);
}

function stepEducation(s: GameState, u: Record<string, number>) {
  const c = s.char;
  const e = c.edu;
  if (!e) return;
  const campus = CAMPUSES.find(x => x.id === e.campus)!;
  const major = MAJORS.find(x => x.id === e.major)!;
  if (!coversTuition(e.funding) && campus.costPerMonth) {
    pay(s, 'Biaya kuliah', -campus.costPerMonth);
    pay(s, 'Orang tua (biaya kuliah)', Math.min(campus.costPerMonth, parentTuition(s)));
  }
  for (const [k, v] of Object.entries(major.growth) as [AttrKey, number][]) gainAttr(s, k, v * campus.quality);
  gainAttr(s, 'jaringan', 0.12 * campus.network);
  if (campus.abroad || campus.iup) c.lang = clamp(c.lang + 0.5 * (1 - c.lang / 125));
  e.gpa = clamp(e.gpa + (gpaTarget(s, u) - e.gpa) * 0.1, 0, 4);
  if (c.money < -90 && !e.funding) {
    comeBack(s);
    c.edu = null; setFlag(s, 'putus_kuliah');
    addHistory(s, 'Terpaksa putus kuliah karena tak sanggup membayar.', 'akibat');
    pruneOrgs(s);
    return;
  }
  e.monthsLeft--;
  // IUP / pertukaran: berangkat dan pulang.
  if (e.away) {
    if (e.monthsLeft === e.away.from && !c.home.back) {
      c.home.back = { city: c.home.city, housing: c.home.housing, addr: c.home.addr };
      relocate(s, e.away.city, 'asrama');
      setFlag(s, 'pernah_luar_negeri');
      addHistory(s, `Berangkat ${e.away.kind === 'iup' ? 'kuliah setahun' : 'pertukaran pelajar'} di ${cityName(s)}.`);
    } else if (e.monthsLeft === e.away.to && c.home.back) {
      comeBack(s);
      gainAttr(s, 'jaringan', 3); gainAttr(s, 'karisma', 2);
      log(s, 'Pulang ke kampus asal dengan koper penuh oleh-oleh dan cerita.');
    }
  }
  if (e.monthsLeft > 0) return;
  // Syarat lulus: IPK 2.00 dan, untuk S3, satu publikasi.
  const noPub = e.level === 'S3' && c.pubs.length <= e.pubs0;
  if (e.gpa < 2 || noPub) {
    if (e.ext >= 4) {
      comeBack(s); c.edu = null; setFlag(s, 'putus_kuliah');
      addHistory(s, 'Dikeluarkan dari kampus: masa studi habis.', 'akibat');
      pruneOrgs(s);
      return;
    }
    e.ext++; e.monthsLeft = 6;
    c.attr.stres = clamp(c.attr.stres + 5);
    log(s, noPub ? 'Disertasi belum bisa diuji: butuh satu publikasi. Masa studi diperpanjang 6 bulan.' : `IPK ${e.gpa.toFixed(2)} belum cukup untuk lulus. Masa studi molor 6 bulan.`);
    return;
  }
  comeBack(s);
  c.degree = e.level; c.major = e.major; c.campus = e.campus; c.gpa = Math.round(e.gpa * 100) / 100; c.edu = null;
  const cum = c.gpa >= 3.51;
  setFlag(s, `lulus:${e.level}`); setFlag(s, `alumni:${e.campus}`); setFlag(s, `jurusan:${e.major}`);
  if (cum) setFlag(s, 'cumlaude');
  if (campus.iup) setFlag(s, 'gelar_ganda');
  const bf = SCHOLARSHIPS.find(b => b.id === e.funding)?.bondFlag;
  if (bf) s.flags[bf] = s.turn;
  addHistory(s, `Lulus ${e.level} ${major.name} dari ${campus.name}, IPK ${c.gpa.toFixed(2)}${cum ? ' (cum laude)' : ''}.`);
  if (campus.abroad) { gainPop(s, 'nasional', 3); gainAttr(s, 'karisma', 2); }
  if (e.campus === 'negeri_favorit' || campus.iup) gainAttr(s, 'jaringan', 5);
  if (e.level === 'S2') { gainPop(s, 'nasional', 2); gainPop(s, 'provinsi', 3); }
  if (e.level === 'S3') { gainPop(s, 'nasional', 3); gainAttr(s, 'kecerdasan', 3); setFlag(s, 'doktor'); }
  if (e.campus === 'akmil') { setFlag(s, 'ikatan_dinas'); c.job = 'tentara'; c.jobLevel = 1; c.jobMonths = 0; log(s, 'Dilantik sebagai perwira muda.'); }
  if (e.campus === 'kedinasan') { setFlag(s, 'ikatan_dinas'); c.job = 'pns'; c.jobLevel = 0; c.jobMonths = 0; log(s, 'Langsung diangkat jadi pegawai negeri.'); }
  pruneOrgs(s);
  // Teman seangkatan: kenal satu tokoh baru.
  meetSomeone(s, 15);
}

export function meetSomeone(s: GameState, rel = 10): Npc | null {
  const cap = 45 + s.char.attr.jaringan * 0.6 + Math.max(...Object.values(s.char.pop)) * 0.3;
  const pool = s.npcs.filter(n => !n.met && n.influence <= cap);
  if (!pool.length) return null;
  const n = pick(s, pool);
  n.met = true; n.rel = Math.max(n.rel, rel);
  log(s, `Berkenalan dengan ${n.name} (${n.desc})`);
  return n;
}

export function monthlyIncome(s: GameState, hard = 0): number {
  const j = jobOf(s);
  if (!j) return 0;
  const econ = 1 + (s.nation.pertumbuhan - 4) * 0.03;
  return j.income * JOB_LEVEL_MULT[s.char.jobLevel] * (1 + 0.25 * hard) * econ * cityOf(s).pay;
}

const RETIRE: Record<string, number> = { pns: 58, tentara: 58, polisi: 58, guru: 60, dosen: 65, peneliti: 65, diplomat: 60, jaksa: 60, bankir: 56, atlet: 35 };

function stepJob(s: GameState, hard: number) {
  const c = s.char;
  const j = jobOf(s);
  if (!j) return 0;
  let inc = monthlyIncome(s, hard);
  if (j.volatile) inc *= Math.max(0, 1.05 + range(s, -j.volatile, j.volatile));
  pay(s, 'Gaji', inc);
  for (const [k, v] of Object.entries(j.growth) as [AttrKey, number][]) gainAttr(s, k, v);
  for (const [k, v] of Object.entries(j.pop) as [Level, number][]) gainPop(s, k, v * (1 + c.jobLevel * 0.35));
  if (j.heat) c.heat = clamp(c.heat + j.heat);
  c.jobMonths += 1 + hard * 0.7 + c.attr.kecerdasan / 120;
  if (c.jobLevel < 4 && c.jobMonths >= 42 * (c.jobLevel + 1)) {
    const g = j.gate?.find(x => x.level === c.jobLevel + 1 && ((x.degree && degRank(c.degree) < degRank(x.degree)) || (x.pubs && c.pubs.length < x.pubs)));
    if (g) {
      if (!hasFlag(s, `gate:${j.id}:${g.level}`)) { setFlag(s, `gate:${j.id}:${g.level}`); log(s, `Kariermu tertahan: ${g.note}.`); }
    } else {
      c.jobLevel++; c.jobMonths = 0; if (c.jobLevel === 4) setFlag(s, 'puncak_karier');
      addHistory(s, `Naik jenjang: ${rankName(j, c.jobLevel).toLowerCase()}.`);
    }
  }
  // Startup: bisa tutup, bisa dibeli raksasa.
  if (j.id === 'startup') {
    if (c.jobLevel <= 1 && rand(s) < 0.012) {
      c.job = null; c.jobLevel = 0; c.jobMonths = 0; c.attr.stres = clamp(c.attr.stres + 12);
      addHistory(s, 'Startup-mu kehabisan dana dan tutup.', 'akibat');
      return inc;
    }
    if (c.jobLevel >= 3 && rand(s) < 0.006) {
      const exit = Math.round(range(s, 1500, 9000) * (c.jobLevel - 2));
      c.money += exit; c.job = null; c.jobLevel = 0; c.jobMonths = 0;
      setFlag(s, 'exit_startup');
      addHistory(s, `Startup-mu diakuisisi perusahaan raksasa. Bagianmu: ${exit} juta.`);
      return inc;
    }
  }
  // Pensiun.
  const ret = RETIRE[j.id];
  if (ret && age(s) >= ret) {
    if (j.id !== 'atlet') c.pension = Math.round(j.income * JOB_LEVEL_MULT[c.jobLevel] * 0.4 * 10) / 10;
    addHistory(s, `Pensiun sebagai ${rankName(j, c.jobLevel).toLowerCase()}.`);
    c.job = null; c.jobLevel = 0; c.jobMonths = 0;
    return inc;
  }
  // PHK saat ekonomi buruk.
  if (s.nation.pengangguran > 9.5 && ['buruh', 'insinyur', 'jurnalis', 'pedagang', 'programmer', 'bankir', 'ojol', 'koki', 'desainer'].includes(j.id) && rand(s) < 0.012) {
    c.job = null; c.jobLevel = 0; c.jobMonths = 0; c.attr.stres = clamp(c.attr.stres + 10);
    addHistory(s, `Kehilangan pekerjaan sebagai ${j.name.toLowerCase()} karena krisis ekonomi.`, 'akibat');
  }
  return inc;
}

export function setPlan(s: GameState, plan: string[]) {
  setPlanSlots(s, plan.filter(p => PLAN_ACTIONS.some(a => a.id === p)));
}
export function setHabits(s: GameState, habits: string[]) {
  const valid = [...new Set(habits)].filter(h => HABITS.some(x => x.id === h)).slice(0, HABIT_SLOTS);
  const old = s.char.habits;
  const dropped = old.filter(h => !valid.includes(h) && !HABITS.find(x => x.id === h)!.good);
  // Melepas kebiasaan buruk itu berat.
  if (dropped.length) s.char.attr.stres = clamp(s.char.attr.stres + 8 * dropped.length);
  s.char.habits = valid;
}

export function partyBlock(s: GameState, id: string): string | null {
  if (s.char.jail > 0) return 'Sedang dipenjara';
  const wait = retryWait(s, 'partai:' + id, 12);
  return wait > 0 ? `Baru ditolak; coba lagi ${wait} bulan lagi` : null;
}

export function joinParty(s: GameState, id: string) {
  const c = s.char;
  if (!PARTIES.some(p => p.id === id) || c.party === id || s.pres || partyBlock(s, id)) return;
  const pname = PARTIES.find(p => p.id === id)!.name;
  const pb = (id === 'pbn' && hasFlag(s, 'latar:dinasti') ? 15 : 0) + (id === 'pku' && hasFlag(s, 'latar:santri') ? 12 : 0)
    + (id === 'pkr' ? Math.min(12, Math.max(0, c.money) / 40) + (c.degree ? 4 : 0) : 0)
    + (id === 'pbt' ? (['buruh', 'petani', 'guru', 'aktivis'].includes(c.job ?? '') ? 12 : 0) - (hasFlag(s, 'latar:kaya') ? 10 : 0) : 0)
    + (id === 'phm' ? (age(s) < 35 ? 5 : -5) + (c.degree ? 5 : 0) : 0)
    + Math.max(...Object.values(c.pop)) * 0.2 - (c.party || hasFlag(s, 'pernah_keluar_partai') ? 10 : 0);
  if (!selection(s, PARTY_CRIT[id], pb)) {
    s.flags['tolak:partai:' + id] = s.turn;
    announce(s, false, 'Pendaftaran ' + pname, `Pengurus ${pname} menolak permohonanmu. ${PARTY_CRIT[id]?.note ?? ''} Coba lagi tahun depan setelah namamu lebih dikenal.`);
    return;
  }
  announce(s, true, 'Pendaftaran ' + pname, `Kartu anggota ${pname} kini di tanganmu.`);
  if (c.party) { setFlag(s, 'kutu_loncat'); for (const l of Object.keys(c.pop) as Level[]) c.pop[l] = clamp(c.pop[l] - 2); }
  c.party = id;
  c.partyStanding = hasFlag(s, 'latar:dinasti') ? 30 : 8 + c.attr.jaringan * 0.1;
  addHistory(s, `Bergabung dengan ${PARTIES.find(p => p.id === id)!.name}.`, 'pilihan');
}
export function leaveParty(s: GameState) {
  if (!s.char.party || s.pres) return;
  addHistory(s, `Keluar dari ${PARTIES.find(p => p.id === s.char.party)!.name}.`, 'pilihan');
  s.char.party = null; s.char.partyStanding = 0; setFlag(s, 'pernah_keluar_partai');
}

/** Bulan tersisa sebelum tokoh ini mau memberi dana lagi. */
export function danaCooldown(s: GameState, npcId: string): number {
  const last = s.flags['dana:' + npcId];
  return last === undefined ? 0 : Math.max(0, 30 - (s.turn - last));
}

export function npcAction(s: GameState, npcId: string, act: 'akrab' | 'minta_dana' | 'minta_dukungan' | 'putus') {
  const n = findNpc(s, npcId);
  const c = s.char;
  if (!n || !n.met || c.jail > 0) return;
  if (act !== 'putus' && s.socialLeft <= 0) return;
  if (act === 'akrab') {
    s.socialLeft--; c.money -= 1;
    const fit = n.integrity > 60 ? (c.attr.integritas - 50) * 0.08 : (50 - c.attr.integritas) * 0.04;
    n.rel = clamp(n.rel + 5 + c.attr.karisma / 18 + fit, -100, 100);
  } else if (act === 'minta_dana') {
    if (n.rel < 45 || danaCooldown(s, npcId) > 0) return;
    s.socialLeft--;
    s.flags['dana:' + npcId] = s.turn;
    const base = s.campaign ? officeDef(s.campaign.office).adCost * 2.5 : 10 + c.attr.jaringan * 0.2;
    const amount = Math.round(base * (n.influence / 50) * (n.role === 'pengusaha' ? 2 : 0.7));
    c.money += amount; n.rel -= 12; n.memory.push('diberi_dana');
    log(s, `${n.name} memberi ${amount} juta.`);
    addHistory(s, `Menerima dana ${amount} juta dari ${n.name}.`, 'pilihan');
    if (n.integrity < 55) {
      setFlag(s, 'hutang_budi'); c.heat = clamp(c.heat + (55 - n.integrity) / 6);
      s.scheduled.push({ id: 'tagih_budi', due: s.turn + Math.floor(range(s, 12, 48)), npcId });
    }
  } else if (act === 'minta_dukungan') {
    if (n.rel < 50 || !s.campaign) return;
    s.socialLeft--;
    s.campaign.momentum += n.influence / 11; n.rel -= 8; n.memory.push('mendukung');
    log(s, `${n.name} menyatakan dukungan terbuka.`);
    if (n.role === 'preman') { c.heat = clamp(c.heat + 7); setFlag(s, 'didukung_preman'); }
    if (n.integrity < 60 && rand(s) < 0.6) { setFlag(s, 'hutang_budi'); s.scheduled.push({ id: 'tagih_budi', due: s.turn + Math.floor(range(s, 10, 40)), npcId }); }
  } else {
    n.rel = Math.min(n.rel, -30); n.memory.push('ditinggalkan');
    addHistory(s, `Memutus hubungan dengan ${n.name}.`, 'pilihan');
    if (n.integrity < 45 || n.memory.includes('diberi_dana')) s.scheduled.push({ id: 'balas_dendam', due: s.turn + Math.floor(range(s, 6, 36)), npcId });
  }
}

/** Satu bulan kehidupan. */
export function stepLife(s: GameState) {
  const c = s.char;
  c.ageMonths++;
  s.socialLeft = 2;
  if (c.cooldown > 0) c.cooldown--;

  if (c.jail > 0) {
    c.jail--; c.attr.stres = clamp(c.attr.stres + 0.5); c.attr.kesehatan = clamp(c.attr.kesehatan - 0.15);
    if (c.jail === 0) addHistory(s, 'Bebas dari penjara. Nama baik harus dibangun dari nol.');
    healthAndAge(s);
    return;
  }

  // Waktu seminggu: kewajiban dulu, sisanya dibagi ke kegiatan pilihanmu.
  const time = effectiveTime(s);
  const u = unitsOf(time);
  stepEducation(s, u);

  let social = false;
  let income = 0;
  const pay = cityOf(s).pay;
  for (const [id, h] of Object.entries(time)) {
    const a = PLAN_ACTIONS.find(x => x.id === id);
    if (!a) continue;
    // Makin banyak jam, makin kecil tambahan per jamnya.
    const k = Math.pow(h / 10, 0.85);
    applyScaled(s, a.fx, k, h / 10);
    if (id === 'sosialisasi') { social = true; if (rand(s) < 0.13 * Math.min(2, h / 10)) meetSomeone(s); }
    if (id === 'usaha') pay_(s, 'Jualan daring', range(s, -0.15, 0.6) * h * (1 + c.attr.jaringan / 100) * (1 + Math.max(0, c.money) / 400));
    if (id === 'ojol') pay_(s, 'Ojek daring', sideIncome(s, id, h) * range(s, 0.8, 1.15));
    if (id === 'les') pay_(s, 'Les privat', sideIncome(s, id, h) * range(s, 0.7, 1.1));
    if (id === 'freelance') pay_(s, 'Kerja lepas', sideIncome(s, id, h) * range(s, 0.2, 1.6));
    if (id === 'magang') {
      pay_(s, 'Uang magang', sideIncome(s, id, h));
      s.flags['jam_magang'] = (s.flags['jam_magang'] ?? 0) + h * 4.3;
      if (s.flags['jam_magang'] >= 300 && !hasFlag(s, 'pengalaman_magang')) { setFlag(s, 'pengalaman_magang'); log(s, 'Pengalaman magangmu kini cukup untuk dicantumkan di CV.'); }
    }
  }
  // Jam bebas yang tak dipakai: santai seadanya.
  const idle = freeHours(s) - Object.values(time).reduce((x, y) => x + y, 0);
  if (idle > 5) applyScaled(s, PLAN_ACTIONS.find(x => x.id === 'istirahat')!.fx, Math.pow(Math.min(30, idle) / 10, 0.85) * 0.4, 0);
  sleepEffects(s);
  income = stepJob(s, u['kerja_keras'] ?? 0);
  void pay;

  for (const id of c.habits) {
    const h = HABITS.find(x => x.id === id);
    if (!h) continue;
    applyFx(s, h.fx, undefined, true);
    if (id === 'menabung' && c.money > 0) c.money += c.money * 0.004;
    if (id === 'judi') c.money += range(s, -7, 5) * Math.max(1, c.money / 80);
    if (id === 'foya') c.money -= 2 + Math.max(0, income) * 0.3;
  }

  // Biaya hidup, sewa, cicilan, anak, riset, organisasi, lomba, asmara.
  stepPersonal(s, u, income);
  if (s.ending) return;

  // Pertemanan: manfaat pasif, dan hubungan memudar kalau tak dirawat.
  for (const n of s.npcs) {
    if (!n.met) continue;
    if (n.rel > 15 && !social) n.rel -= 0.35;
    if (n.rel < 0) n.rel += 0.2;
    if (n.rel < 40) continue;
    const w = n.influence / 60;
    if (n.role === 'ulama') { gainPop(s, 'desa', 0.08 * w); gainPop(s, 'kabupaten', 0.06 * w); }
    if (n.role === 'artis') { gainPop(s, 'nasional', 0.07 * w); }
    if (n.role === 'jurnalis') { gainPop(s, 'provinsi', 0.04 * w); if (n.integrity < 50) c.heat = clamp(c.heat - 0.1); }
    if (n.role === 'politisi' && c.party && n.party === c.party) c.partyStanding = clamp(c.partyStanding + 0.15 * w);
    if (n.role === 'akademisi') gainAttr(s, 'kecerdasan', 0.04);
    if (n.role === 'aktivis') gainPop(s, 'kabupaten', 0.05 * w);
    if (n.role === 'preman') c.heat = clamp(c.heat + 0.06);
    if (n.role === 'pengusaha' && n.integrity < 40) c.heat = clamp(c.heat + 0.03);
  }

  // Popularitas memudar bila tidak dirawat; popularitas bawah merembes ke atas.
  const lv: Level[] = ['desa', 'kabupaten', 'provinsi', 'nasional'];
  for (const l of lv) c.pop[l] *= 0.9965;
  for (let i = 0; i < 3; i++) if (c.pop[lv[i]] > c.pop[lv[i + 1]] + 25) c.pop[lv[i + 1]] += 0.05;

  // Utang.
  if (c.money < 0) {
    c.debtMonths++; c.attr.stres = clamp(c.attr.stres + 0.6); c.money *= 1.008;
    if (c.debtMonths === 6) log(s, 'Utang menumpuk. Penagih mulai datang ke rumah.');
    const limit = 60 + monthlyIncome(s) * 30 + (s.office ? 400 : 0) + Math.max(...Object.values(c.pop)) * 3 + (c.home.house?.value ?? 0) * 0.6 + (married(s) ? c.partner!.income * 10 : 0);
    if (c.money < -limit || c.debtMonths >= 60) { finish(s, 'bangkrut'); return; }
  } else c.debtMonths = Math.max(0, c.debtMonths - 2);

  // Paparan skandal: makin tinggi jabatan, makin disorot.
  c.heat = clamp(c.heat - 0.12);
  const spot = s.campaign ? 3 : s.pres ? 2.5 : s.office ? 1.8 : 1;
  const shield = (hasFlag(s, 'bungkam_pers') ? 0.5 : 1) * (hasFlag(s, 'lemahkan_kpk') ? 0.7 : 1);
  if (c.heat > 12 && rand(s) < (c.heat / 100) * 0.022 * spot * shield && !s.pending.some(p => p.id === 'skandal_terbongkar')) {
    s.pending.push({ id: 'skandal_terbongkar', delayed: true });
  }

  healthAndAge(s);
}

function healthAndAge(s: GameState) {
  const c = s.char;
  const a = age(s);
  c.attr.stres = clamp(c.attr.stres - 0.4 + (s.office ? 0.5 : 0) + (s.pres ? 0.5 : 0) + (s.campaign ? 1.2 : 0));
  if (c.attr.stres > 75) c.attr.kesehatan = clamp(c.attr.kesehatan - 0.45);
  if (a > 45) c.attr.kesehatan = clamp(c.attr.kesehatan - (a - 45) * 0.006);
  let pDeath = 0;
  if (c.attr.kesehatan < 22) pDeath += (22 - c.attr.kesehatan) / 350;
  if (a > 62) pDeath += (a - 62) * 0.0006;
  if (c.attr.kesehatan <= 0 || rand(s) < pDeath) { finish(s, s.pres ? 'wafat_menjabat' : 'meninggal'); return; }
  if (c.attr.kesehatan < 30 && rand(s) < 0.04) log(s, 'Dokter memperingatkan: kondisimu memburuk. Kurangi beban, perbaiki kebiasaan.');
  if (!s.pres && !s.campaign && a >= 70) {
    if (c.aspiration === 'presiden') finish(s, c.everOffice.length ? 'tokoh_daerah' : 'warga_biasa');
    else finish(s, 'pensiun');
  }
}

export { friends, cityDef };

/** Efek bulanan kegiatan, dikali intensitas. Uang dihitung linear (per jam), atribut dengan hasil yang makin berkurang. */
function applyScaled(s: GameState, fx: import('./types').Fx, k: number, linear: number) {
  const c = s.char;
  if (fx.attr) for (const [a, v] of Object.entries(fx.attr) as [AttrKey, number][]) gainAttr(s, a, v * k);
  if (fx.pop) for (const [l, v] of Object.entries(fx.pop) as [Level, number][]) gainPop(s, l, v * k);
  if (fx.money) c.money += fx.money * linear;
  if (fx.party) c.partyStanding = clamp(c.partyStanding + fx.party * k);
}

/** Kurang tidur menggerus kesehatan dan menaikkan stres; tidur cukup membantu pulih. */
function sleepEffects(s: GameState) {
  const c = s.char;
  if (c.sleep < 6) {
    const d = 6 - c.sleep;
    c.attr.kesehatan = clamp(c.attr.kesehatan - 0.35 * d);
    c.attr.stres = clamp(c.attr.stres + 0.9 * d);
    if (c.sleep <= 5 && rand(s) < 0.05) log(s, 'Kamu nyaris tertidur di jalan. Badanmu protes.');
  } else if (c.sleep >= 7.5) {
    c.attr.stres = clamp(c.attr.stres - 0.3);
    c.attr.kesehatan = clamp(c.attr.kesehatan + 0.05);
  }
}
