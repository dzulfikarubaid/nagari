import { useState } from 'react';
import { CalendarDays, Repeat, GraduationCap, Briefcase, Network, Flag, Vote, Megaphone, Building2, ScrollText, TriangleAlert, HeartHandshake, HandCoins, ThumbsUp, UserX, Send } from 'lucide-react';
import { useStore } from '../store';
import type { GameState, OfficeId } from '../sim/types';
import { Bar, Btn, Card, rupiah } from './common';
import { PLAN_ACTIONS, HABITS, HABIT_SLOTS, JOBS, JOB_LEVEL_NAMES, CAMPUSES, MAJORS, PARTIES, OFFICES, PROGRAMS, PROMISES, REGION_LABEL, ROLE_LABEL, LEVEL_LABEL, officeDef, CAMPUS_CRIT, JOB_CRIT, PARTY_CRIT } from '../content/data';
import { jobBlock, enrollBlock, monthlyIncome, danaCooldown, partyBlock } from '../sim/life';
import { declareBlock, feeOf, CAMPAIGN_ACTS, campaignActBlock, programBlock } from '../sim/election';
import { age } from '../sim/core';
import { monthsToElection } from '../sim/gov';
import { GOV_STYLES } from '../content/data';
import { Crown } from 'lucide-react';

type P = { g: GameState };

export function PlanPanel({ g }: P) {
  const act = useStore(s => s.act);
  const c = g.char;
  const busy = !!g.office || !!g.campaign;
  const slots = busy ? 1 : 3;
  const setSlot = (i: number, id: string) => { const p = [...c.plan]; p[i] = id; act({ type: 'setPlan', plan: p }); };
  const toggleHabit = (id: string) => {
    const has = c.habits.includes(id);
    if (!has && c.habits.length >= HABIT_SLOTS) return;
    act({ type: 'setHabits', habits: has ? c.habits.filter(h => h !== id) : [...c.habits, id] });
  };
  return (
    <>
      <Card icon={CalendarDays} title="Rencana bulanan" right={<small>{busy ? 'Menjabat/kampanye: hanya 1 slot waktu pribadi' : '3 slot waktu tiap bulan'}</small>}>
        {Array.from({ length: slots }).map((_, i) => {
          const cur = PLAN_ACTIONS.find(a => a.id === c.plan[i]);
          return (
            <div key={i} className="slot">
              <select value={c.plan[i] ?? ''} onChange={e => setSlot(i, e.target.value)}>
                {PLAN_ACTIONS.map(a => {
                  const off = (a.need === 'job' && !c.job) || (a.need === 'party' && !c.party);
                  return <option key={a.id} value={a.id} disabled={off}>{a.name}{off ? ' (belum bisa)' : ''}</option>;
                })}
              </select>
              {cur && <p className="muted">{cur.desc}</p>}
            </div>
          );
        })}
        <p className="muted">Rencana berlaku terus sampai kamu ubah.</p>
      </Card>
      <Card icon={Repeat} title={`Kebiasaan (${c.habits.length}/${HABIT_SLOTS})`}>
        <div className="grid2">
          {HABITS.map(h => {
            const on = c.habits.includes(h.id);
            return (
              <button key={h.id} className={`pick ${on ? 'on' : ''}`} onClick={() => toggleHabit(h.id)} disabled={!on && c.habits.length >= HABIT_SLOTS}>
                <b>{h.name}</b>
                <span>{h.desc}</span>
              </button>
            );
          })}
        </div>
      </Card>
    </>
  );
}

export function CareerPanel({ g }: P) {
  const act = useStore(s => s.act);
  const c = g.char;
  const [campus, setCampus] = useState('negeri_daerah');
  const [major, setMajor] = useState('politik');
  const eduWhy = enrollBlock(g, campus, campus === 'akmil' ? 'militer' : major);
  const job = JOBS.find(j => j.id === c.job);
  return (
    <>
      <Card icon={GraduationCap} title="Pendidikan">
        {c.edu ? (
          <>
            <p>Kuliah <b>{c.edu.level} {MAJORS.find(m => m.id === c.edu!.major)?.name}</b> di {CAMPUSES.find(x => x.id === c.edu!.campus)?.name}.</p>
            <Bar label={`Sisa ${c.edu.monthsLeft} bulan`} value={(c.edu.level === 'S2' ? 24 : 48) - c.edu.monthsLeft} max={c.edu.level === 'S2' ? 24 : 48} tone="blue" />
            <Btn kind="ghost" small onClick={() => act({ type: 'dropOut' })}>Berhenti kuliah</Btn>
          </>
        ) : (
          <>
            <p className="muted">{c.degree ? `Gelar: ${c.degree} ${MAJORS.find(m => m.id === c.major)?.name} (${CAMPUSES.find(x => x.id === c.campus)?.name}). Bisa lanjut ${c.degree === 'S1' ? 'S2 (2 tahun)' : '—'}.` : 'Lulusan SMA. Bisa kuliah dulu atau langsung bekerja.'}</p>
            {c.degree !== 'S2' && (
              <>
                <div className="grid2">
                  {CAMPUSES.map(k => (
                    <button key={k.id} className={`pick ${campus === k.id ? 'on' : ''}`} onClick={() => setCampus(k.id)}>
                      <b>{k.name}</b><span>{k.desc}</span>
                      <span className="crit">Seleksi: {CAMPUS_CRIT[k.id]?.note}</span>
                      <span className="muted">{k.costPerMonth ? `${rupiah(k.costPerMonth)}/bln` : 'Gratis'}</span>
                    </button>
                  ))}
                </div>
                {campus !== 'akmil' && (
                  <div className="grid2" style={{ marginTop: 8 }}>
                    {MAJORS.filter(m => m.id !== 'militer').map(m => (
                      <button key={m.id} className={`pick ${major === m.id ? 'on' : ''}`} onClick={() => setMajor(m.id)}>
                        <b>{m.name}</b><span>{m.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="row">
                  <Btn kind="primary" why={eduWhy} onClick={() => act({ type: 'enroll', campus, major: campus === 'akmil' ? 'militer' : major })}><Send size={14} />Ikut seleksi {c.degree ? 'S2' : 'S1'}</Btn>
                  {eduWhy && <small className="warn">{eduWhy}</small>}
                </div>
              </>
            )}
          </>
        )}
      </Card>
      <Card icon={Briefcase} title="Pekerjaan" right={job && <Btn small kind="ghost" onClick={() => act({ type: 'quitJob' })}>Berhenti</Btn>}>
        {job ? <p>Sekarang: <b>{job.name}</b> ({JOB_LEVEL_NAMES[c.jobLevel]}) · sekitar {rupiah(monthlyIncome(g))}/bln</p>
          : <p className="muted">{g.office ? 'Jabatan publik adalah pekerjaanmu sekarang.' : c.edu ? 'Mahasiswa tidak bisa bekerja penuh. Pakai aksi "Usaha sampingan" untuk tambahan uang.' : 'Belum bekerja.'}</p>}
        <div className="grid2">
          {JOBS.map(j => {
            const why = jobBlock(g, j);
            return (
              <button key={j.id} className={`pick ${c.job === j.id ? 'on' : ''}`} disabled={!!why || c.job === j.id} onClick={() => act({ type: 'takeJob', job: j.id })} title={why ?? ''}>
                <b>{j.name}</b><span>{j.desc}</span>
                <span className="crit">{JOB_CRIT[j.id]?.auto ? 'Tanpa seleksi: ' : 'Seleksi: '}{JOB_CRIT[j.id]?.note}</span>
                <span className="muted">{rupiah(j.income)}/bln awal{why ? ` · ${why}` : ''}</span>
              </button>
            );
          })}
        </div>
      </Card>
    </>
  );
}

export function RelationPanel({ g }: P) {
  const act = useStore(s => s.act);
  const met = g.npcs.filter(n => n.met).sort((a, b) => b.rel - a.rel);
  return (
    <Card icon={Network} title="Relasi" right={<small>{g.socialLeft} interaksi tersisa bulan ini · {g.npcs.filter(n => !n.met).length} tokoh belum dikenal</small>}>
      {met.length === 0 && <p className="muted">Belum kenal siapa-siapa. Bergaullah untuk bertemu orang baru.</p>}
      {met.map(n => (
        <div key={n.id} className="npc">
          <div className="npc-head">
            <div><b>{n.name}</b> <span className="tag">{ROLE_LABEL[n.role]}</span>{n.party && <span className="tag" style={{ borderColor: PARTIES.find(p => p.id === n.party)?.color }}>{PARTIES.find(p => p.id === n.party)?.short}</span>}</div>
            <span className={n.rel >= 40 ? 'ok' : n.rel < 0 ? 'warn' : 'muted'}>{n.rel >= 70 ? 'Sahabat' : n.rel >= 40 ? 'Teman' : n.rel >= 0 ? 'Kenalan' : 'Musuh'} ({Math.round(n.rel)})</span>
          </div>
          <p className="muted">{n.desc}</p>
          <div className="mini">Pengaruh {n.influence} · Kompetensi {n.competence}{n.rel >= 40 ? ` · Integritas ${n.integrity}` : ' · Integritas ?'}</div>
          <div className="row">
            <Btn small disabled={g.socialLeft <= 0} onClick={() => act({ type: 'npc', npcId: n.id, act: 'akrab' })}><HeartHandshake size={13} />Akrabkan</Btn>
            <Btn small disabled={g.socialLeft <= 0} why={n.rel < 45 ? 'Butuh hubungan 45' : danaCooldown(g, n.id) > 0 ? ('Baru saja memberi; tunggu ' + danaCooldown(g, n.id) + ' bulan') : null} onClick={() => act({ type: 'npc', npcId: n.id, act: 'minta_dana' })}><HandCoins size={13} />Minta dana</Btn>
            <Btn small disabled={g.socialLeft <= 0} why={!g.campaign ? 'Hanya saat kampanye' : n.rel < 50 ? 'Butuh hubungan 50' : null} onClick={() => act({ type: 'npc', npcId: n.id, act: 'minta_dukungan' })}><ThumbsUp size={13} />Minta dukungan</Btn>
            <Btn small kind="ghost" onClick={() => act({ type: 'npc', npcId: n.id, act: 'putus' })}><UserX size={13} />Putus</Btn>
          </div>
        </div>
      ))}
    </Card>
  );
}

export function PoliticsPanel({ g }: P) {
  const act = useStore(s => s.act);
  const c = g.char;
  const party = PARTIES.find(p => p.id === c.party);
  const open = g.promises.filter(p => !p.resolved);
  const gov = g.gov;
  const gst = gov ? GOV_STYLES.find(x => x.id === gov.style) : null;
  return (
    <>
      {gov && gst && (
        <Card icon={Crown} title="Pemerintahan sekarang" right={<small>Pemilu presiden {monthsToElection(g)} bulan lagi</small>}>
          <p>Presiden <b>{gov.name}</b>{gov.party ? <> (<span style={{ color: PARTIES.find(p => p.id === gov.party)?.color }}>{PARTIES.find(p => p.id === gov.party)?.short}</span>)</> : ' (independen)'} · periode ke-{gov.term}</p>
          <p className="muted"><b>{gst.name}.</b> {gst.desc}</p>
          <Bar label="Kepuasan publik pada presiden" value={g.nation.approval} tone={g.nation.approval < 40 ? 'bad' : 'good'} />
          <p className="muted">{gov.term === 1 ? 'Petahana boleh maju lagi; kalau kamu nyalon, dia salah satu lawanmu.' : 'Sudah dua periode: pemilu berikutnya tanpa petahana.'} Riwayat lengkap ada di tab Negara.</p>
        </Card>
      )}
      <Card icon={Flag} title="Partai">
        {party ? (
          <>
            <p>Anggota <b style={{ color: party.color }}>{party.name}</b> ({party.ideology}).</p>
            <Bar label="Kedekatan dengan partai" value={c.partyStanding} tone="blue" />
            {!g.pres && <Btn small kind="ghost" onClick={() => act({ type: 'leaveParty' })}>Keluar partai</Btn>}
          </>
        ) : <p className="muted">Belum berpartai.</p>}
        {!g.pres && (
          <div className="grid2">
            {PARTIES.filter(p => p.id !== c.party).map(p => (
              <button key={p.id} className="pick" disabled={!!partyBlock(g, p.id)} title={partyBlock(g, p.id) ?? ''} onClick={() => act({ type: 'joinParty', party: p.id })}>
                <b style={{ color: p.color }}>{p.short} · {p.name}</b>
                <span>{p.ideology} · {g.seats[p.id]}% kursi DPR</span>
                <span className="crit">{PARTY_CRIT[p.id]?.note}</span>
                <span className="muted">{partyBlock(g, p.id) ?? (c.party ? 'Ajukan pindah partai' : 'Ajukan keanggotaan')}</span>
              </button>
            ))}
          </div>
        )}
      </Card>
      {!g.pres && (
        <Card icon={Vote} title="Mencalonkan diri">
          {OFFICES.map(o => {
            const wp = declareBlock(g, o.id as OfficeId, true);
            const wi = declareBlock(g, o.id as OfficeId, false);
            return (
              <div key={o.id} className="office">
                <div><b>{o.name}</b> <span className="muted">usia {o.minAge}+ · masa jabatan {o.term / 12} thn · kampanye {o.campaignTurns} bln</span></div>
                <div className="row">
                  <Btn small kind="primary" why={wp} onClick={() => act({ type: 'declare', office: o.id as OfficeId, viaParty: true })}>Lewat partai ({rupiah(feeOf(o.id as OfficeId, true))})</Btn>
                  <Btn small why={wi} onClick={() => act({ type: 'declare', office: o.id as OfficeId, viaParty: false })}>Independen ({rupiah(feeOf(o.id as OfficeId, false))})</Btn>
                </div>
                {(wp || wi) && <small className="warn">{wp === wi ? wp : `Partai: ${wp ?? 'bisa'} · Independen: ${wi ?? 'bisa'}`}</small>}
              </div>
            );
          })}
          <p className="muted">Umurmu {age(g)}. Jalan ke istana tertutup di usia 70.</p>
        </Card>
      )}
      {open.length > 0 && (
        <Card icon={ScrollText} title="Janji yang belum ditagih">
          {open.map((p, i) => { const d = PROMISES.find(x => x.id === p.id)!; return <p key={i}><b>{d.name}</b> — <span className="muted">{d.desc}</span></p>; })}
        </Card>
      )}
    </>
  );
}

export function CampaignPanel({ g }: P) {
  const act = useStore(s => s.act);
  const cp = g.campaign!;
  const d = officeDef(cp.office);
  const [promise, setPromise] = useState('');
  const promises = PROMISES.filter(p => p.levels.includes(cp.office));
  const sel = promise || promises[0]?.id;
  return (
    <>
      <Card icon={Megaphone} title={`Kampanye ${d.name}${cp.round === 2 ? ' — putaran kedua' : ''}`} tone="accent" right={<small>{cp.turnsLeft} bulan lagi · {cp.actionsLeft} aksi bulan ini</small>}>
        <Bar label="Momentum kampanye" value={Math.max(0, cp.momentum)} max={60} />
        <div className="mini">Lawan: {cp.opponents.map(o => `${o.name}${o.party ? ` (${PARTIES.find(p => p.id === o.party)?.short})` : ''}`).join(', ')}</div>
        <div className="grid2" style={{ marginTop: 8 }}>
          {CAMPAIGN_ACTS.map(a => {
            const why = campaignActBlock(g, a.id, a.id === 'janji' ? sel : undefined);
            const cost = a.id === 'iklan' ? d.adCost : a.id === 'serangan_fajar' ? d.adCost * 2 : 0;
            return (
              <button key={a.id} className="pick" disabled={!!why} title={why ?? ''} onClick={() => act({ type: 'campaignAct', act: a.id, promise: a.id === 'janji' ? sel : undefined })}>
                <b>{a.name}</b><span>{a.desc}</span>
                {cost > 0 && <span className="muted">{rupiah(cost)}</span>}
              </button>
            );
          })}
        </div>
        <div className="slot">
          <label className="muted">Janji yang akan diumbar:</label>
          <select value={sel} onChange={e => setPromise(e.target.value)}>
            {promises.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <p className="muted">{PROMISES.find(p => p.id === sel)?.desc}</p>
        </div>
      </Card>
    </>
  );
}

export function OfficePanel({ g }: P) {
  const act = useStore(s => s.act);
  const o = g.office!;
  const d = officeDef(o.id);
  const r = o.region;
  return (
    <Card icon={Building2} title={`${d.name} — periode ke-${o.terms}`} tone="accent" right={<small>Sisa {o.monthsLeft} bulan</small>}>
      <Bar label={REGION_LABEL.kepuasan} value={r.kepuasan} tone={r.kepuasan < 30 ? 'bad' : 'good'} />
      <div className="grid2">
        <Bar label={REGION_LABEL.kesejahteraan} value={r.kesejahteraan} tone="blue" />
        <Bar label={REGION_LABEL.infrastruktur} value={r.infrastruktur} tone="blue" />
        <Bar label={REGION_LABEL.keamanan} value={r.keamanan} tone="blue" />
        <Bar label={REGION_LABEL.layanan} value={r.layanan} tone="blue" />
      </div>
      <p>Kas daerah: <b>{Math.round(r.kas)}</b> poin anggaran {o.programDone && <span className="ok">· program bulan ini sudah berjalan</span>}</p>
      <div className="grid2">
        {PROGRAMS.map(p => {
          const why = programBlock(g, p.id);
          return (
            <button key={p.id} className="pick" disabled={!!why} title={why ?? ''} onClick={() => act({ type: 'program', program: p.id })}>
              <b>{p.name}</b><span>{p.desc}</span>
              <span className="muted">Biaya {p.cost}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
