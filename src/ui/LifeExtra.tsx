// Panel kehidupan: studi, pekerjaan, kegiatan (organisasi & lomba), dan hidup (rumah, asmara, keluarga, cita-cita).
import { useState } from 'react';
import {
  GraduationCap, Briefcase, Languages, Award, Plane, FlaskConical, UsersRound, Trophy, Medal, House, MapPinHouse, Heart, HeartCrack,
  Baby, Target, Send, KeyRound, Gem, LogOut, Vote, CheckCircle2, Circle, Wallet, HandCoins,
} from 'lucide-react';
import { useStore } from '../store';
import type { GameState, CityTier, HousingId } from '../sim/types';
import { Bar, Btn, Card, Select, rupiah } from './common';
import { JOBS, JOB_GROUPS, CAMPUSES, MAJORS, CAMPUS_CRIT, JOB_CRIT, rankName } from '../content/data';
import { COVER_LABEL, CITIES, HOUSING, ORGS, ORG_SLOTS, COMPS, SCHOLARSHIPS, LOVE_VIA, WEDDING, TRAITS, ASPIRATIONS, cityDef } from '../content/life';
import { jobBlock, enrollBlock, monthlyIncome } from '../sim/life';
import {
  cityName, rentOf, moveBlock, buyBlock, housePrice, kprMonthly, netWorth, langScore, langTestBlock, LANG_TEST_COST, scholarshipBlock,
  exchangeBlock, researchBlock, researchMajor, orgBlock, orgRoleName, runOrgBlock, compBlock, compFee, findLoveBlock, loveBlock,
  partnerAge, childAge, childCost, aspirationGoals, nextLevel, scholarshipFits, DOMESTIC,
  scholarshipFitsCampus, ongoing, scholarshipReqs, parentTuition, tuitionGap, parentAllowance, askParentsBlock, askParentsAmount,
} from '../sim/personal';
import { age } from '../sim/core';

type P = { g: GameState };

// =====================================================================
// STUDI
// =====================================================================
export function StudyPanel({ g }: P) {
  const act = useStore(s => s.act);
  const c = g.char;
  const lvl = nextLevel(c);
  const [campus, setCampus] = useState(lvl && lvl !== 'S1' ? 'negeri_favorit' : 'negeri_daerah');
  const [major, setMajor] = useState(c.major ?? 'ekonomi');
  const cDef = CAMPUSES.find(x => x.id === campus)!;
  const majorPick = campus === 'akmil' ? 'militer' : major;
  const [sch, setSch] = useState('');
  // Beasiswa yang bisa didaftarkan sekalian untuk kampus ini.
  const schOpts = SCHOLARSHIPS.filter(b => lvl && b.levels.includes(lvl) && scholarshipFitsCampus(b.id, campus));
  const schPick = !c.scholarship && schOpts.some(b => b.id === sch) && !scholarshipBlock(g, sch) ? sch : '';
  const eduWhy = enrollBlock(g, campus, majorPick, schPick || undefined);
  const gap = tuitionGap(g, campus);
  const e = c.edu;
  const test = langScore(g);
  const rm = researchMajor(g);
  const rWhy = researchBlock(g);
  const [topic, setTopic] = useState('');
  const [schView, setSchView] = useState<'cocok' | 'semua'>('semua');
  const tpk = rm?.topics.includes(topic) ? topic : rm?.topics[0] ?? '';
  return (
    <>
      <Card icon={GraduationCap} title="Pendidikan">
        {e ? (
          <>
            <p>Kuliah <b>{e.level} {MAJORS.find(m => m.id === e.major)?.name}</b> di {CAMPUSES.find(x => x.id === e.campus)?.name}{e.funding && <> · <span className="ok">{SCHOLARSHIPS.find(b => b.id === e.funding)?.name}</span></>}.</p>
            <Bar label={`Sisa ${e.monthsLeft} bulan${e.ext ? ` (molor ${e.ext}×)` : ''}`} value={e.total - e.monthsLeft} max={e.total} tone="blue" />
            <Bar label={`IPK ${e.gpa.toFixed(2)}${e.gpa >= 3.51 ? ' · jalur cum laude' : e.gpa < 2 ? ' · terancam tidak lulus' : ''}`} value={e.gpa} max={4} tone={e.gpa < 2.5 ? 'bad' : 'good'} />
            {e.away && <p className="muted ic"><Plane size={13} />{e.away.kind === 'iup' ? 'Tahun di kampus mitra' : 'Pertukaran pelajar'}: {cityName(g, e.away.city)}{c.home.back ? ' (sedang di sana)' : e.monthsLeft > e.away.from ? ` · berangkat ${e.monthsLeft - e.away.from} bulan lagi` : ' · selesai'}</p>}
            {e.level === 'S3' && <p className="muted">Disertasi hanya bisa diuji setelah ada publikasi baru selama S3.</p>}
            <p className="muted">IPK naik dengan aksi Belajar dan kecerdasan; turun bila stres tinggi, terlalu banyak organisasi, atau sambil bekerja.</p>
            <div className="row">
              <Btn small why={exchangeBlock(g)} onClick={() => act({ type: 'exchange' })}><Plane size={13} />Daftar pertukaran pelajar</Btn>
              <Btn small kind="ghost" onClick={() => act({ type: 'dropOut' })}>Berhenti kuliah</Btn>
            </div>
            {exchangeBlock(g) && <small className="muted">Pertukaran: {exchangeBlock(g)}</small>}
          </>
        ) : (
          <>
            <p className="muted">{c.degree ? `Gelar: ${c.degree} ${MAJORS.find(m => m.id === c.major)?.name} (${CAMPUSES.find(x => x.id === c.campus)?.name}), IPK ${c.gpa?.toFixed(2) ?? '-'}.` : 'Lulusan SMA. Bisa kuliah dulu, atau langsung bekerja.'}{lvl ? ` Jenjang berikutnya: ${lvl}.` : ' Sudah doktor.'}</p>
            {lvl && (
              <>
                <div className="step"><span>1</span>Pilih kampus</div>
                <div className="grid2">
                  {CAMPUSES.filter(k => k.levels.includes(lvl)).map(k => (
                    <button key={k.id} className={`pick ${campus === k.id ? 'on' : ''}`} onClick={() => setCampus(k.id)}>
                      <b>{k.abroad && <Plane size={12} />} {k.name}</b><span>{k.desc}</span>
                      <span className="crit">Seleksi: {CAMPUS_CRIT[k.id]?.note}{k.lang ? ` Tes bahasa ${k.lang.toFixed(1)}.` : ''}</span>
                      <span className="muted">{k.costPerMonth ? `${rupiah(k.costPerMonth)}/bln` : 'Gratis'} · {CITIES.find(x => x.id === k.city)?.short}{scholarshipFits(g, k.id) ? ' · beasiswamu berlaku' : ''}</span>
                    </button>
                  ))}
                </div>
                <div className="step"><span>2</span>Pilih jurusan di {cDef.name.split(' (')[0]}</div>
                {campus !== 'akmil' ? (
                  <div className="grid2">
                    {MAJORS.filter(m => m.id !== 'militer').map(m => (
                      <button key={m.id} className={`pick major ${major === m.id ? 'on' : ''}`} onClick={() => setMajor(m.id)}>
                        <b>{m.name}{m.research && <span className="tag">bisa riset</span>}</b><span>{m.desc}</span>
                      </button>
                    ))}
                  </div>
                ) : <p className="muted">Akademi Militer hanya membuka jurusan Ilmu Militer.</p>}
                <div className="step"><span>3</span>Biaya, beasiswa, dan daftar</div>
                <div className="fin">
                  <div><span>Biaya kuliah</span><b>{cDef.costPerMonth ? `${rupiah(cDef.costPerMonth)}/bln` : 'Gratis'}</b></div>
                  <div><span>Sanggup ditanggung orang tua</span><b>{rupiah(Math.min(cDef.costPerMonth, parentTuition(g)))}/bln</b></div>
                  <div><span>Kekurangan per bulan</span><b className={gap > 0 ? 'warn' : 'ok'}>{scholarshipFits(g, campus) ? 'ditanggung beasiswamu' : gap > 0 ? `${rupiah(gap)}/bln` : 'tidak ada'}</b></div>
                </div>
                {c.scholarship ? <p className="mini ok">Beasiswa yang kamu pegang: {SCHOLARSHIPS.find(b => b.id === c.scholarship!.id)?.name}{scholarshipFits(g, campus) ? ' (berlaku di kampus ini)' : ' (tidak berlaku di kampus ini)'}</p> : (
                  <div className="slot">
                    <label className="muted">Sekalian daftar beasiswa: </label>
                    <Select value={schPick} onChange={setSch} options={[
                      { value: '', label: 'Tidak, biaya mandiri/orang tua', hint: 'Orang tua menanggung sesuai kemampuan; kekurangannya dari tabunganmu.' },
                      ...schOpts.map(b => ({ value: b.id, label: b.name, hint: `${COVER_LABEL[b.covers]} · ${b.provider}`, why: scholarshipBlock(g, b.id) })),
                    ]} />
                    {schPick && <p className="muted">{SCHOLARSHIPS.find(b => b.id === schPick)?.desc} Seleksi: {SCHOLARSHIPS.find(b => b.id === schPick)?.note} Kalau beasiswanya gagal dan biaya tak terjangkau, pendaftaran batal.</p>}
                  </div>
                )}
                <div className="row">
                  <Btn kind="primary" why={eduWhy} onClick={() => act({ type: 'enroll', campus, major: majorPick, scholarship: schPick || undefined })}><Send size={14} />Ikut seleksi {lvl} {cDef.name.split(' (')[0]}{schPick ? ' + beasiswa' : ''}</Btn>
                </div>
                {eduWhy && <small className="warn">{eduWhy}</small>}
              </>
            )}
          </>
        )}
      </Card>

      <Card icon={Languages} title="Bahasa Inggris" right={<small>{test ? `Skor tes ${test.toFixed(1)}` : 'Belum ada skor tes yang berlaku'}</small>}>
        <Bar label="Kemampuan bahasa" value={c.lang} tone="blue" />
        <p className="muted">Naik lewat jam kursus bahasa Inggris di tab Jadwal, UKM debat, dan tinggal di luar negeri. Kampus luar negeri, IUP, pertukaran, dan beasiswa butuh skor tes (berlaku 2 tahun).</p>
        <Btn small why={langTestBlock(g)} onClick={() => act({ type: 'langTest' })}>Ikut tes bahasa ({rupiah(LANG_TEST_COST)})</Btn>
      </Card>

      <Card icon={Award} title="Beasiswa" right={c.scholarship ? <small className="ok">Memegang: {SCHOLARSHIPS.find(b => b.id === c.scholarship!.id)?.name} ({c.scholarship.level})</small> : e?.funding ? <small className="ok">Kuliahmu dibiayai {SCHOLARSHIPS.find(b => b.id === e.funding)?.name}</small> : undefined}>
        <p className="muted">Tiap beasiswa punya syarat, jadwal pendaftaran, dan tiga tahap seleksi (berkas, tes/esai, wawancara). Yang cocok dengan kampusmu bisa langsung membiayai kuliah yang sedang berjalan, atau didaftarkan sekalian saat ikut seleksi kampus. Tidak boleh menerima dua beasiswa sekaligus.</p>
        <div className="row wrap">
          <Btn small kind={schView === 'cocok' ? 'primary' : ''} onClick={() => setSchView('cocok')}>Yang bisa didaftar sekarang</Btn>
          <Btn small kind={schView === 'semua' ? 'primary' : ''} onClick={() => setSchView('semua')}>Semua beasiswa</Btn>
        </div>
        {SCHOLARSHIPS.filter(b => schView === 'semua' || !scholarshipBlock(g, b.id)).length === 0 && <p className="muted">Belum ada beasiswa yang bisa didaftar bulan ini. Lihat "Semua beasiswa" untuk jadwal dan syaratnya.</p>}
        {SCHOLARSHIPS.filter(b => schView === 'semua' || !scholarshipBlock(g, b.id)).map(b => {
          const why = scholarshipBlock(g, b.id);
          const reqs = scholarshipReqs(g, b.id);
          return (
            <div key={b.id} className="npc">
              <div className="npc-head"><b>{b.name}</b><span className="tag">{COVER_LABEL[b.covers]}</span></div>
              <p className="mini">{b.provider} · {b.levels.join('/')} · {b.quota}{ongoing(g, b.id) ? ' · berlaku untuk kuliahmu sekarang' : ''}</p>
              <p className="muted">{b.desc}</p>
              <div className="reqs">
                {reqs.map((r, i) => <span key={i} className={`ic ${r.ok ? 'ok' : 'warn'}`}>{r.ok ? <CheckCircle2 size={12} /> : <Circle size={12} />}{r.text}</span>)}
              </div>
              <p className="mini">Seleksi: {b.note}{b.bond ? ` Kewajiban: ${b.bond}` : ''}</p>
              <div className="row">
                <Btn small kind="primary" why={why} onClick={() => act({ type: 'applyScholarship', id: b.id })}><Send size={12} />Daftar</Btn>
                {why && <small className="muted">{why}</small>}
              </div>
            </div>
          );
        })}
      </Card>

      <Card icon={FlaskConical} title="Riset & publikasi" right={<small>{c.pubs.length} publikasi</small>}>
        {c.research ? (
          <>
            <p>Sedang meneliti <b>"{c.research.topic}"</b> ({c.research.scope === 'besar' ? 'riset besar, target jurnal internasional' : 'riset kecil, target jurnal nasional'}).</p>
            <Bar label="Kemajuan" value={c.research.progress} max={c.research.need} tone="blue" />
            <p className="muted">Sediakan jam "Kerjakan riset" di tab Jadwal supaya cepat selesai.</p>
            <Btn small kind="ghost" onClick={() => act({ type: 'dropResearch' })}>Hentikan riset</Btn>
          </>
        ) : rWhy ? <p className="muted">{rWhy}.</p> : (
          <>
            <div className="slot">
              <Select value={tpk} onChange={setTopic} options={rm!.topics.map(t => ({ value: t, label: t }))} />
            </div>
            <div className="row">
              <Btn small onClick={() => act({ type: 'startResearch', topic: tpk, scope: 'kecil' })}>Riset kecil (± setengah tahun)</Btn>
              <Btn small kind="primary" onClick={() => act({ type: 'startResearch', topic: tpk, scope: 'besar' })}>Riset besar (± setahun)</Btn>
            </div>
          </>
        )}
        {c.pubs.length > 0 && <div className="mini" style={{ marginTop: 8 }}>{c.pubs.slice(-5).reverse().map((p, i) => <div key={i}>• {p.title} — jurnal {p.venue}, {p.year}</div>)}</div>}
      </Card>
    </>
  );
}

// =====================================================================
// PEKERJAAN
// =====================================================================
export function JobPanel({ g }: P) {
  const act = useStore(s => s.act);
  const c = g.char;
  const job = JOBS.find(j => j.id === c.job);
  const [group, setGroup] = useState(JOB_GROUPS[0]);
  return (
    <Card icon={Briefcase} title="Pekerjaan" right={job && <Btn small kind="ghost" onClick={() => act({ type: 'quitJob' })}>Berhenti</Btn>}>
      {job ? <p>Sekarang: <b>{rankName(job, c.jobLevel)}</b> ({job.name.toLowerCase()}) di {cityName(g)} · sekitar {rupiah(monthlyIncome(g))}/bln{job.volatile ? ', naik-turun' : ''}</p>
        : <p className="muted">{g.office ? 'Jabatan publik adalah pekerjaanmu sekarang.' : c.edu ? 'Mahasiswa tidak bisa bekerja penuh. Cari uang tambahan lewat ojek daring, les privat, kerja lepas, magang, atau jualan daring di tab Jadwal.' : c.pension ? `Pensiunan · uang pensiun ${rupiah(c.pension)}/bln.` : 'Belum bekerja.'}</p>}
      <p className="muted">Kamu tinggal di {cityName(g)}. Gaji di sini ×{cityDef(c.home.city).pay.toFixed(2)}; beberapa pekerjaan hanya ada di kota tertentu.</p>
      <div className="row wrap">
        {JOB_GROUPS.map(gr => <Btn key={gr} small kind={group === gr ? 'primary' : ''} onClick={() => setGroup(gr)}>{gr}</Btn>)}
      </div>
      <div className="grid2" style={{ marginTop: 8 }}>
        {JOBS.filter(j => j.group === group).map(j => {
          const why = jobBlock(g, j);
          return (
            <button key={j.id} className={`pick ${c.job === j.id ? 'on' : ''}`} disabled={!!why || c.job === j.id} onClick={() => act({ type: 'takeJob', job: j.id })} title={why ?? ''}>
              <b>{j.name}</b><span>{j.desc}</span>
              <span className="crit">{JOB_CRIT[j.id]?.auto ? 'Tanpa seleksi: ' : 'Seleksi: '}{JOB_CRIT[j.id]?.note}</span>
              <span className="muted">{rupiah(j.income)}/bln awal{j.ranks ? ` · puncak: ${j.ranks[4]}` : ''}{why ? ` · ${why}` : ''}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// =====================================================================
// KEGIATAN: organisasi & lomba
// =====================================================================
export function ActivityPanel({ g }: P) {
  const act = useStore(s => s.act);
  const c = g.char;
  const [kind, setKind] = useState<'kampus' | 'umum'>(c.edu ? 'kampus' : 'umum');
  return (
    <>
      <Card icon={UsersRound} title={`Organisasi (${c.orgs.length}/${ORG_SLOTS})`}>
        {c.orgs.length === 0 && <p className="muted">Belum ikut organisasi. Sediakan jam "Aktif berorganisasi" di tab Jadwal agar cepat jadi pengurus.</p>}
        {c.orgs.map(m => {
          const o = ORGS.find(x => x.id === m.id)!;
          const why = runOrgBlock(g, m.id);
          return (
            <div key={m.id} className="npc">
              <div className="npc-head"><b>{o.name}</b><span className={m.role === 2 ? 'ok' : 'muted'}>{orgRoleName(m.id, m.role)} · {m.months} bln</span></div>
              <div className="row">
                {m.role < 2 && <Btn small why={why} onClick={() => act({ type: 'runOrg', id: m.id })}>Maju jadi {o.chair.toLowerCase()}</Btn>}
                <Btn small kind="ghost" onClick={() => act({ type: 'leaveOrg', id: m.id })}><LogOut size={12} />Keluar</Btn>
              </div>
            </div>
          );
        })}
        <div className="row">
          <Btn small kind={kind === 'kampus' ? 'primary' : ''} onClick={() => setKind('kampus')}>Organisasi kampus</Btn>
          <Btn small kind={kind === 'umum' ? 'primary' : ''} onClick={() => setKind('umum')}>Masyarakat & profesi</Btn>
        </div>
        <div className="grid2" style={{ marginTop: 8 }}>
          {ORGS.filter(o => o.kind === kind && !c.orgs.some(m => m.id === o.id)).map(o => {
            const why = orgBlock(g, o.id);
            return (
              <button key={o.id} className="pick" disabled={!!why} title={why ?? ''} onClick={() => act({ type: 'joinOrg', id: o.id })}>
                <b>{o.name}</b><span>{o.desc}</span>
                {why && <span className="muted">{why}</span>}
              </button>
            );
          })}
        </div>
      </Card>

      <Card icon={Trophy} title="Lomba" right={c.comp ? <small>{COMPS.find(x => x.id === c.comp!.id)?.[c.comp.intl ? 'intlName' : 'name']} · {c.comp.monthsLeft} bln lagi</small> : undefined}>
        {c.comp && <Bar label="Persiapan (jam latihan lomba di tab Jadwal)" value={c.comp.prep} max={14} tone="blue" />}
        <div className="grid2">
          {COMPS.flatMap(k => [false, true].filter(intl => !intl || k.intlName).map(intl => {
            const why = compBlock(g, k.id, intl);
            if (intl && !g.flags['juara:' + k.id]) return null;
            return (
              <button key={k.id + intl} className="pick" disabled={!!why} title={why ?? ''} onClick={() => act({ type: 'enterComp', id: k.id, intl })}>
                <b>{intl ? k.intlName : k.name}</b><span>{k.desc}</span>
                <span className="muted">{k.months} bln · daftar {rupiah(compFee(k.id, intl))} · hadiah juara 1 {rupiah(k.prize[0] * (intl ? 4 : 1))}{why ? ` · ${why}` : ''}</span>
              </button>
            );
          }))}
        </div>
      </Card>

      <Card icon={Medal} title={`Prestasi (${c.awards.length})`}>
        {c.awards.length === 0 ? <p className="muted">Belum ada piagam di dinding.</p> : c.awards.slice().reverse().map((a, i) => <p key={i} className="mini">• {a}</p>)}
      </Card>
    </>
  );
}

// =====================================================================
// HIDUP: rumah, asmara, keluarga, cita-cita
// =====================================================================
export function HomePanel({ g }: P) {
  const act = useStore(s => s.act);
  const c = g.char, h = c.home;
  const city = cityDef(h.city);
  const [dest, setDest] = useState<CityTier>(h.city);
  const [housing, setHousing] = useState<HousingId>(h.housing === 'asrama' ? 'kos' : h.housing);
  const [size, setSize] = useState<keyof typeof WEDDING>('sederhana');
  const moveWhy = moveBlock(g, dest, housing);
  const p = c.partner;
  const pr = c.prospect;
  const goals = aspirationGoals(g);
  const asp = ASPIRATIONS.find(a => a.id === c.aspiration);
  const destCities = CITIES.filter(x => DOMESTIC.includes(x.id) || x.abroad);
  return (
    <>
      <Card icon={Target} title={`Cita-cita: ${asp?.name ?? '-'}`}>
        <p className="muted">{asp?.desc}</p>
        {goals.map((x, i) => <p key={i} className={`ic ${x.done ? 'ok' : 'muted'}`}>{x.done ? <CheckCircle2 size={13} /> : <Circle size={13} />}{x.text}</p>)}
        <p className="mini">Kekayaan bersih {rupiah(netWorth(g))} · umur {age(g)}</p>
      </Card>

      <FinanceCard g={g} />

      <Card icon={MapPinHouse} title="Tempat tinggal">
        <p><b>{HOUSING.find(x => x.id === h.housing)?.name}</b> — {h.addr}</p>
        <p className="muted">{city.desc} Biaya hidup ±{rupiah(city.living)}/bln{rentOf(g, h.city, h.housing) ? `, sewa ${rupiah(rentOf(g, h.city, h.housing))}/bln` : ''}{h.kpr ? `, cicilan KPR ${rupiah(h.kpr.monthly)}/bln (sisa ${h.kpr.left} bln)` : ''}.</p>
        <p className="mini">Kampung halaman: {cityName(g, h.hometown)} · orang tua: {c.parents === 2 ? 'keduanya sehat' : c.parents === 1 ? 'tinggal satu' : 'sudah tiada'}{c.parents ? ` (±${c.parentAge} th)` : ''}</p>
        {h.house && <p className="mini ic"><House size={12} />Rumahmu: {h.house.addr} · taksiran {rupiah(h.house.value)}{h.housing !== 'rumah' ? ' · disewakan' : ''}</p>}
        <h5>Pindah</h5>
        <div className="row wrap">
          <Select grow value={dest} onChange={setDest} options={destCities.map(x => ({ value: x.id, label: x.abroad ? `${x.short}, ${x.country}` : cityName(g, x.id), hint: `Biaya hidup ±${rupiah(x.living)}/bln · gaji ×${x.pay.toFixed(2)}` }))} />
          <Select grow value={housing} onChange={setHousing} options={HOUSING.filter(x => x.id !== 'asrama').map(x => ({ value: x.id, label: x.name, hint: rentOf(g, dest, x.id) ? `Sewa ${rupiah(rentOf(g, dest, x.id))}/bln` : x.id === 'ortu' ? 'Gratis, di kampung halaman' : 'Tanpa sewa', why: moveBlock(g, dest, x.id)?.match(/orang tua|Belum punya rumah|apartemen di desa/i) ? moveBlock(g, dest, x.id) : null }))} />
          <Btn small kind="primary" why={moveWhy} onClick={() => act({ type: 'move', city: dest, housing })}>Pindah</Btn>
        </div>
        {moveWhy && <small className="muted">{moveWhy}</small>}
        <p className="muted">{HOUSING.find(x => x.id === housing)?.desc}</p>
        <h5>Rumah sendiri di {CITIES.find(x => x.id === h.city)?.short}</h5>
        {h.house ? (
          <Btn small kind="ghost" onClick={() => { if (confirm('Jual rumah?')) act({ type: 'sellHouse' }); }}><KeyRound size={12} />Jual rumah</Btn>
        ) : (
          <div className="row wrap">
            <Btn small why={buyBlock(g, true)} onClick={() => act({ type: 'buyHouse', kpr: true })}><KeyRound size={12} />KPR 15 th (DP {rupiah(housePrice(h.city) * 0.2)}, {rupiah(kprMonthly(housePrice(h.city)))}/bln)</Btn>
            <Btn small why={buyBlock(g, false)} onClick={() => act({ type: 'buyHouse', kpr: false })}>Beli tunai {rupiah(housePrice(h.city))}</Btn>
          </div>
        )}
      </Card>

      <Card icon={Heart} title="Asmara" right={<small>{g.socialLeft} waktu bergaul tersisa</small>}>
        {p ? (
          <>
            <div className="npc-head"><b>{p.name}</b><span className="tag ok">{({ pdkt: 'Pendekatan', pacaran: 'Pacaran', tunangan: 'Tunangan', menikah: 'Menikah' })[p.stage]}</span></div>
            <p className="muted">{partnerAge(g)} tahun · {p.job} · {TRAITS.find(t => t.id === p.trait)?.name}: {TRAITS.find(t => t.id === p.trait)?.desc}{p.city !== h.city ? ` · tinggal di ${cityName(g, p.city)} (hubungan jarak jauh)` : ''}</p>
            <Bar label="Kedekatan" value={p.love} tone={p.love < 25 ? 'bad' : 'good'} />
            <p className="muted">Kedekatan memudar kalau tak dirawat. Jam "Waktu untuk pasangan" di tab Jadwal dan kencan menjaganya.</p>
            <div className="row wrap">
              <Btn small why={loveBlock(g, 'kencan')} onClick={() => act({ type: 'love', act: 'kencan' })}>Ajak kencan</Btn>
              {p.stage === 'pdkt' && <Btn small kind="primary" why={loveBlock(g, 'tembak')} onClick={() => act({ type: 'love', act: 'tembak' })}>Nyatakan perasaan</Btn>}
              {p.stage === 'pacaran' && <Btn small kind="primary" why={loveBlock(g, 'lamar')} onClick={() => act({ type: 'love', act: 'lamar' })}><Gem size={12} />Lamar</Btn>}
              <Btn small kind="ghost" onClick={() => { if (confirm(p.stage === 'menikah' ? 'Ajukan cerai?' : 'Putus?')) act({ type: 'love', act: 'putus' }); }}><HeartCrack size={12} />{p.stage === 'menikah' ? 'Cerai' : 'Putus'}</Btn>
            </div>
            {p.stage === 'tunangan' && (
              <div className="row wrap">
                <Select grow value={size} onChange={setSize} options={(Object.keys(WEDDING) as (keyof typeof WEDDING)[]).map(k => ({ value: k, label: `${WEDDING[k].name} (${rupiah(WEDDING[k].cost)})`, hint: WEDDING[k].desc }))} />
                <Btn small kind="primary" why={loveBlock(g, 'nikah', size)} onClick={() => act({ type: 'love', act: 'nikah', size })}>Menikah</Btn>
              </div>
            )}
            {p.stage === 'menikah' && <p className="mini">Pasangan menyumbang ±{rupiah(p.income * 0.55)}/bln untuk rumah tangga.</p>}
          </>
        ) : pr ? (
          <>
            <p>Kamu berkenalan dengan <b>{pr.name}</b>, {pr.age} tahun, {pr.job.toLowerCase()}. Orangnya {TRAITS.find(t => t.id === pr.trait)?.name}: {TRAITS.find(t => t.id === pr.trait)?.desc}</p>
            <div className="row">
              <Btn small kind="primary" onClick={() => act({ type: 'love', act: 'dekati' })}><Heart size={12} />Dekati</Btn>
              <Btn small kind="ghost" onClick={() => act({ type: 'love', act: 'abaikan' })}>Biarkan saja</Btn>
            </div>
          </>
        ) : (
          <>
            <p className="muted">Sendiri.{c.exes.length ? ` Mantan: ${c.exes.slice(-3).join(', ')}.` : ''} Cari kenalan:</p>
            <div className="grid2">
              {LOVE_VIA.map(v => {
                const why = findLoveBlock(g, v.id);
                return (
                  <button key={v.id} className="pick" disabled={!!why} title={why ?? ''} onClick={() => act({ type: 'findLove', via: v.id })}>
                    <b>{v.name}</b><span>{v.desc}</span>{why && <span className="muted">{why}</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <Card icon={Baby} title={`Anak (${c.children.length})`}>
        {c.children.map((k, i) => <p key={i} className="mini">• {k.name} ({k.gender === 'L' ? 'laki-laki' : 'perempuan'}), {childAge(g, k.born)} tahun</p>)}
        {c.children.length > 0 && <p className="mini">Biaya anak ±{rupiah(childCost(g))}/bln.</p>}
        {p?.stage === 'menikah' ? (
          <label className="row"><input type="checkbox" checked={c.wantKids} onChange={ev => act({ type: 'wantKids', on: ev.target.checked })} /> Program punya anak</label>
        ) : <p className="muted">Menikah dulu untuk punya anak.</p>}
      </Card>
    </>
  );
}

/** Ringkasan pemilu untuk tab Politik. */
export function VoterNote({ g }: P) {
  return <p className="mini ic"><Vote size={12} />Kamu sudah mencoblos {g.char.votes} kali. Surat suara datang otomatis tiap pemilu presiden (5 tahun sekali).</p>;
}

const familyLabel = (fund: number) => fund < 20 ? 'pas-pasan' : fund < 150 ? 'cukup' : fund < 800 ? 'berada' : 'kaya raya';

/** Uang masuk-keluar bulan lalu dan bantuan orang tua. */
function FinanceCard({ g }: P) {
  const act = useStore(s => s.act);
  const c = g.char;
  const rows = Object.entries(c.ledger ?? {}).filter(([, v]) => Math.abs(v) >= 0.05).sort((a, b) => b[1] - a[1]);
  const net = rows.reduce((a, [, v]) => a + v, 0);
  const why = askParentsBlock(g);
  return (
    <Card icon={Wallet} title="Keuangan" right={<small>Saldo {rupiah(c.money)}</small>}>
      {rows.length === 0 ? <p className="muted">Belum ada catatan. Rincian muncul setelah satu bulan berjalan.</p> : (
        <div className="fin">
          {rows.map(([k, v]) => <div key={k}><span>{k}</span><b className={v >= 0 ? 'ok' : 'warn'}>{v >= 0 ? '+' : ''}{rupiah(v)}</b></div>)}
          <div className="total"><span>Bersih bulan lalu</span><b className={net >= 0 ? 'ok' : 'warn'}>{net >= 0 ? '+' : ''}{rupiah(net)}</b></div>
        </div>
      )}
      {c.money < 0 && <p className="warn mini">Saldo minus: kamu berutang. Utang berbunga dan bisa berujung bangkrut. Kerja, usaha sampingan, hemat tempat tinggal, atau minta bantuan.</p>}
      <h5>Orang tua</h5>
      {c.parents === 0 ? <p className="muted">Orang tuamu sudah tiada.</p> : (
        <>
          <p className="mini">Keuangan keluarga: <b>{familyLabel(c.family.fund)}</b> · uang saku sekarang {rupiah(parentAllowance(g))}/bln · sanggup bantu kuliah {rupiah(parentTuition(g))}/bln</p>
          <p className="muted">Uang saku berhenti setelah kamu lulus dan bekerja, atau lewat usia 23. Orang tua yang menua makin sedikit memberi.</p>
          <Btn small why={why} onClick={() => act({ type: 'askParents' })}><HandCoins size={12} />Minta uang ke orang tua{why ? '' : ` (±${rupiah(askParentsAmount(g))})`}</Btn>
        </>
      )}
    </Card>
  );
}
