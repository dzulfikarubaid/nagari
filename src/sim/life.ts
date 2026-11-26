// Kehidupan pribadi: pendidikan, pekerjaan, kebiasaan, pertemanan, kesehatan, uang.
import type { GameState, Job, AttrKey, Level, Npc } from './types';
import { applyFx, gainAttr, gainPop, rand, range, pick, clamp, age, addHistory, log, setFlag, hasFlag, finish, friends, findNpc } from './core';
import { CAMPUS_CRIT, JOB_CRIT, PARTY_CRIT, type Criteria } from '../content/data';
import { JOBS, JOB_LEVEL_MULT, JOB_LEVEL_NAMES, HABITS, HABIT_SLOTS, PLAN_ACTIONS, MAJORS, CAMPUSES, S2_MONTHS, PARTIES, officeDef } from '../content/data';

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
  if (job.id === 'pengusaha' && c.money < 200) return 'Butuh modal 200 juta';
  if (job.id === 'dosen' && c.degree !== 'S2') return 'Butuh gelar S2';
  if (job.need?.degree && !c.degree) return 'Butuh gelar sarjana';
  if (job.need?.majors && !(c.major && job.need.majors.includes(c.major))) return `Butuh jurusan ${job.need.majors.map(m => MAJORS.find(x => x.id === m)?.name).join(' / ')}`;
  if (job.id === 'tentara' && age(s) > 30 && c.major !== 'militer') return 'Batas usia masuk 30 tahun';
  const wait = retryWait(s, 'job:' + job.id, 8);
  if (wait > 0) return `Baru ditolak; bisa melamar lagi ${wait} bulan lagi`;
  return null;
}

export function takeJob(s: GameState, id: string) {
  const job = JOBS.find(j => j.id === id);
  if (!job || jobBlock(s, job) || s.char.job === id) return;
  const c = s.char;
  // Ekonomi lesu = lowongan sedikit; lulusan kampus bagus dan S2 lebih dilirik.
  const bonus = -(s.nation.pengangguran - 6) * 1.5 + (c.degree === 'S2' ? 5 : 0) + (c.campus === 'negeri_favorit' || c.campus === 'luar_negeri' ? 4 : 0)
    + (id === 'staf_partai' ? c.partyStanding * 0.3 : 0);
  const lower = job.name.toLowerCase();
  if (!selection(s, JOB_CRIT[id], bonus)) {
    s.flags['tolak:job:' + id] = s.turn;
    c.attr.stres = clamp(c.attr.stres + 3);
    announce(s, false, 'Lamaran ' + lower, `Lamaranmu sebagai ${lower} ditolak. ${JOB_CRIT[id]?.note ?? ''} Kamu bisa mencoba lagi 8 bulan lagi, atau melamar ke tempat lain.`);
    return;
  }
  if (!JOB_CRIT[id]?.auto) announce(s, true, 'Lamaran ' + lower, `Kamu diterima bekerja sebagai ${lower}.`);
  if (id === 'pengusaha') c.money -= 200;
  c.job = id; c.jobLevel = 0; c.jobMonths = 0;
  addHistory(s, `Mulai bekerja sebagai ${job.name.toLowerCase()}.`, 'pilihan');
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

export function enrollBlock(s: GameState, campusId: string, majorId: string): string | null {
  const c = s.char;
  const campus = CAMPUSES.find(x => x.id === campusId);
  const major = MAJORS.find(x => x.id === majorId);
  if (!campus || !major) return 'Pilihan tidak valid';
  if (c.jail > 0) return 'Sedang dipenjara';
  if (c.edu) return 'Sudah kuliah';
  if (s.office) return 'Sedang menjabat';
  if (c.degree === 'S2') return 'Sudah S2';
  if (!c.degree && age(s) > 30) return 'Terlalu tua untuk S1';
  if (campusId === 'akmil') {
    if (c.degree) return 'Akmil hanya untuk lulusan SMA';
    if (age(s) > 22) return 'Batas usia Akmil 22 tahun';
    if (majorId !== 'militer') return 'Akmil hanya jurusan militer';
  } else if (majorId === 'militer') return 'Hanya ada di Akademi Militer';
  if (campusId === 'kedinasan' && c.degree) return 'Kedinasan hanya untuk lulusan SMA';
  const wait = retryWait(s, 'kampus:' + campusId, 12);
  if (wait > 0) return `Seleksi berikutnya ${wait} bulan lagi`;
  if (campus.costPerMonth > 0 && campusId !== 'luar_negeri' && c.money < campus.costPerMonth * 6) return `Butuh tabungan ${campus.costPerMonth * 6} juta`;
  return null;
}

export function enroll(s: GameState, campusId: string, majorId: string) {
  if (enrollBlock(s, campusId, majorId)) return;
  const c = s.char;
  const campus = CAMPUSES.find(x => x.id === campusId)!;
  const level = c.degree ? 'S2' : 'S1';
  const major0 = MAJORS.find(m => m.id === majorId)!;
  // Kedokteran paling diperebutkan; S2 lebih ketat.
  const bonus = (majorId === 'kedokteran' ? -7 : majorId === 'hukum' || majorId === 'teknik' ? -2 : 0) + (level === 'S2' ? -3 : 0) + (hasFlag(s, 'latar:dinasti') && campusId === 'akmil' ? 4 : 0);
  if (!selection(s, CAMPUS_CRIT[campusId], bonus)) {
    s.flags['tolak:kampus:' + campusId] = s.turn;
    c.attr.stres = clamp(c.attr.stres + 5);
    announce(s, false, 'Seleksi ' + campus.name, `Namamu tidak ada di daftar yang lolos ${level} ${major0.name}. ${CAMPUS_CRIT[campusId]?.note ?? ''} Seleksi berikutnya tahun depan; kamu bisa mencoba kampus lain atau bekerja dulu.`);
    return;
  }
  if (campusId === 'luar_negeri') {
    // Beasiswa hanya untuk yang sangat cerdas; sisanya harus bayar sendiri.
    if (c.attr.kecerdasan >= 74) setFlag(s, 'beasiswa');
    else if (c.money < 300) {
      s.flags['tolak:kampus:' + campusId] = s.turn;
      announce(s, false, 'Seleksi ' + campus.name, 'Kamu diterima, tetapi tanpa beasiswa. Biayanya di luar kemampuan keluargamu (butuh tabungan 300 juta), jadi kursi itu terpaksa dilepas.');
      return;
    }
  }
  announce(s, true, 'Seleksi ' + campus.name, `Selamat, kamu diterima di ${level} ${major0.name}${campusId === 'luar_negeri' && hasFlag(s, 'beasiswa') ? ' dengan beasiswa penuh' : ''}.`);
  if (c.job) { c.job = null; c.jobLevel = 0; c.jobMonths = 0; }
  c.edu = { campus: campusId, major: majorId, monthsLeft: level === 'S2' ? S2_MONTHS : campus.months, level };
  addHistory(s, `Mulai kuliah ${level} ${MAJORS.find(m => m.id === majorId)!.name} di ${campus.name}.`, 'pilihan');
}

export function dropOut(s: GameState) {
  if (!s.char.edu) return;
  s.char.edu = null;
  setFlag(s, 'putus_kuliah');
  delete s.flags['beasiswa'];
  addHistory(s, 'Berhenti kuliah sebelum lulus.', 'pilihan');
}

function stepEducation(s: GameState) {
  const c = s.char;
  const e = c.edu;
  if (!e) return;
  const campus = CAMPUSES.find(x => x.id === e.campus)!;
  const major = MAJORS.find(x => x.id === e.major)!;
  const scholarship = hasFlag(s, 'beasiswa') && e.campus === 'luar_negeri';
  if (!scholarship) c.money -= campus.costPerMonth;
  for (const [k, v] of Object.entries(major.growth) as [AttrKey, number][]) gainAttr(s, k, v * campus.quality);
  gainAttr(s, 'jaringan', 0.12 * campus.network);
  if (e.campus === 'luar_negeri') { c.pop.desa = clamp(c.pop.desa - 0.15); }
  if (c.money < -90) {
    c.edu = null; setFlag(s, 'putus_kuliah');
    addHistory(s, 'Terpaksa putus kuliah karena tak sanggup membayar.', 'akibat');
    return;
  }
  e.monthsLeft--;
  if (e.monthsLeft > 0) return;
  c.degree = e.level; c.major = e.major; c.campus = e.campus; c.edu = null;
  setFlag(s, `lulus:${e.level}`); setFlag(s, `alumni:${e.campus}`); setFlag(s, `jurusan:${e.major}`);
  addHistory(s, `Lulus ${e.level} ${major.name} dari ${campus.name}.`);
  if (e.campus === 'luar_negeri') { gainPop(s, 'nasional', 4); gainAttr(s, 'karisma', 3); }
  if (e.campus === 'negeri_favorit') gainAttr(s, 'jaringan', 5);
  if (e.level === 'S2') { gainPop(s, 'nasional', 2); gainPop(s, 'provinsi', 3); }
  if (e.campus === 'akmil') { setFlag(s, 'ikatan_dinas'); c.job = 'tentara'; c.jobLevel = 1; c.jobMonths = 0; log(s, 'Dilantik sebagai perwira muda.'); }
  if (e.campus === 'kedinasan') { setFlag(s, 'ikatan_dinas'); c.job = 'pns'; c.jobLevel = 0; c.jobMonths = 0; log(s, 'Langsung diangkat jadi pegawai negeri.'); }
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
  return j.income * JOB_LEVEL_MULT[s.char.jobLevel] * (1 + 0.25 * hard) * econ;
}

function stepJob(s: GameState, hard: number) {
  const c = s.char;
  const j = jobOf(s);
  if (!j) return 0;
  let inc = monthlyIncome(s, hard);
  if (j.id === 'pengusaha' || j.id === 'pedagang') inc *= range(s, 0.3, 1.8);
  if (j.id === 'influencer') inc *= range(s, 0.5, 1.6);
  c.money += inc;
  for (const [k, v] of Object.entries(j.growth) as [AttrKey, number][]) gainAttr(s, k, v);
  for (const [k, v] of Object.entries(j.pop) as [Level, number][]) gainPop(s, k, v * (1 + c.jobLevel * 0.35));
  if (j.heat) c.heat = clamp(c.heat + j.heat);
  c.jobMonths += 1 + hard * 0.7 + c.attr.kecerdasan / 120;
  if (c.jobLevel < 4 && c.jobMonths >= 42 * (c.jobLevel + 1)) {
    c.jobLevel++; c.jobMonths = 0;
    addHistory(s, `Naik jenjang: ${j.name.toLowerCase()} ${JOB_LEVEL_NAMES[c.jobLevel]}.`);
  }
  // PHK saat ekonomi buruk.
  if (s.nation.pengangguran > 9.5 && ['buruh', 'insinyur', 'jurnalis', 'pedagang'].includes(j.id) && rand(s) < 0.012) {
    c.job = null; c.jobLevel = 0; c.jobMonths = 0; c.attr.stres = clamp(c.attr.stres + 10);
    addHistory(s, `Kehilangan pekerjaan sebagai ${j.name.toLowerCase()} karena krisis ekonomi.`, 'akibat');
  }
  return inc;
}

export function setPlan(s: GameState, plan: string[]) {
  s.char.plan = plan.filter(p => PLAN_ACTIONS.some(a => a.id === p)).slice(0, 3);
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

  stepEducation(s);

  const busy = !!s.office || !!s.campaign;
  let hard = 0, social = false;
  let income = 0;
  // Saat menjabat/kampanye, waktu pribadi tinggal satu aksi.
  const plan = busy ? c.plan.slice(0, 1) : c.plan;
  for (const id of plan) {
    const a = PLAN_ACTIONS.find(x => x.id === id);
    if (!a) continue;
    if (a.need === 'job' && !c.job) continue;
    if (a.need === 'party' && !c.party) continue;
    if (a.need === 'money' && c.money < 2) continue;
    applyFx(s, a.fx, undefined, true);
    if (id === 'kerja_keras') hard++;
    if (id === 'sosialisasi') { social = true; if (rand(s) < 0.13) meetSomeone(s); }
    if (id === 'usaha') c.money += range(s, -1.5, 6) * (1 + c.attr.jaringan / 100) * (1 + Math.max(0, c.money) / 400);
  }
  income = stepJob(s, hard);

  for (const id of c.habits) {
    const h = HABITS.find(x => x.id === id);
    if (!h) continue;
    applyFx(s, h.fx, undefined, true);
    if (id === 'menabung' && c.money > 0) c.money += c.money * 0.004;
    if (id === 'judi') c.money += range(s, -7, 5) * Math.max(1, c.money / 80);
    if (id === 'foya') c.money -= 2 + Math.max(0, income) * 0.3;
  }

  // Biaya hidup; mahasiswa dan anak muda masih dibantu keluarga.
  c.money -= (c.edu ? 1.2 : 2.2) + Math.max(0, income) * 0.3 + (age(s) > 28 ? 1 : 0);
  if (age(s) < 24) c.money += hasFlag(s, 'latar:kaya') || hasFlag(s, 'latar:dinasti') ? 8 : hasFlag(s, 'latar:menengah') ? 3 : 1.2;

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
    const limit = 60 + monthlyIncome(s) * 30 + (s.office ? 400 : 0) + Math.max(...Object.values(c.pop)) * 3;
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
  if (!s.pres && !s.campaign && a >= 70) finish(s, c.everOffice.length ? 'tokoh_daerah' : 'warga_biasa');
}

export { friends };
