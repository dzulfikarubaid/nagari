import { useState } from 'react';
import { ChartColumn, ChartLine, Wallet, Users, Landmark, ScrollText, Globe, Swords, DoorOpen, TrendingUp, TrendingDown, Check, X, ChevronLeft, ChevronRight, Plane, Handshake, Shield, Gift, Ban, Undo2, Sword, ShieldHalf, Flag } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useStore } from '../store';
import type { GameState, NationKey, SectorKey, MinistryId, Budget } from '../sim/types';
import { Bar, Btn, Card } from './common';
import { NATION_LABEL, SECTOR_LABEL, MINISTRIES, PARTIES, POLICIES, COUNTRIES, ROLE_LABEL } from '../content/data';
import { fiscal, coalitionSeats, ministryEff } from '../sim/nation';
import { ministerCandidates, policyBlock, policyCapital, diploBlock, warPower, legacyScore } from '../sim/presidency';
import { findNpc } from '../sim/core';
import { GOV_STYLES } from '../content/data';
import { BookOpen } from 'lucide-react';
import { RegionPanel } from './RegionPanel';
import type { GovRecord } from '../sim/types';

type P = { g: GameState };

const GROUPS: { title: string; keys: NationKey[] }[] = [
  { title: 'Ekonomi', keys: ['pdb', 'pertumbuhan', 'inflasi', 'utang'] },
  { title: 'Pekerjaan & kesejahteraan', keys: ['pengangguran', 'kemiskinan', 'kebahagiaan'] },
  { title: 'Layanan publik', keys: ['pendidikan', 'kesehatan', 'infrastruktur', 'lingkungan'] },
  { title: 'Hukum & keamanan', keys: ['kriminalitas', 'korupsi', 'stabilitas', 'militer'] },
];

const fmt = (k: NationKey, v: number) => k === 'pdb' ? `${Math.round(v).toLocaleString('id-ID')} T` : `${v.toFixed(['pertumbuhan', 'inflasi', 'pengangguran', 'kemiskinan'].includes(k) ? 1 : 0)}${NATION_LABEL[k].unit}`;

function GovHistory({ g }: P) {
  const now = 2030 + Math.floor(g.turn / 12);
  const row = (label: string, a: number, b: number, goodUp: boolean, unit: string, digits = 1) => {
    const d = b - a;
    return <span key={label} className={`chip ${Math.abs(d) < 0.05 ? '' : (d > 0) === goodUp ? 'good' : 'bad'}`}>{label} {a.toFixed(digits)}{unit} → {b.toFixed(digits)}{unit}</span>;
  };
  const cur = { pdb: g.nation.pdb, pertumbuhan: g.nation.pertumbuhan, inflasi: g.nation.inflasi, pengangguran: g.nation.pengangguran, kemiskinan: g.nation.kemiskinan, korupsi: g.nation.korupsi, utang: g.nation.utang, kebahagiaan: g.nation.kebahagiaan };
  return (
    <Card icon={BookOpen} title="Riwayat presiden" right={<small>Negara yang kamu warisi adalah hasil mereka</small>}>
      {[...g.govHistory].reverse().map((r: GovRecord, i) => {
        const st = GOV_STYLES.find(x => x.id === r.style);
        const party = PARTIES.find(x => x.id === r.party);
        const e = r.end ?? cur;
        return (
          <div key={i} className={`npc ${r.toYear === null ? 'active' : ''}`}>
            <div className="npc-head">
              <div><b>{r.name}</b>{r.player && <span className="tag ok">kamu</span>}{party && <span className="tag" style={{ borderColor: party.color }}>{party.short}</span>}{st && <span className="tag">{st.name}</span>}</div>
              <span className="muted">{r.fromYear}–{r.toYear ?? 'sekarang'} · {r.terms} periode</span>
            </div>
            {st && <p className="muted">{st.desc}</p>}
            <div className="chips">
              <span className={`chip ${e.pdb >= r.start.pdb ? 'good' : 'bad'}`}>PDB {((e.pdb / r.start.pdb - 1) * 100).toFixed(0)}% dalam {Math.max(1, (r.toYear ?? now) - r.fromYear)} thn</span>
              {row('Inflasi', r.start.inflasi, e.inflasi, false, '%')}
              {row('Pengangguran', r.start.pengangguran, e.pengangguran, false, '%')}
              {row('Kemiskinan', r.start.kemiskinan, e.kemiskinan, false, '%')}
              {row('Korupsi', r.start.korupsi, e.korupsi, false, '', 0)}
              {row('Utang', r.start.utang, e.utang, false, '% PDB', 0)}
              {row('Kebahagiaan', r.start.kebahagiaan, e.kebahagiaan, true, '', 0)}
            </div>
            {r.how && <div className="mini">Berakhir: {r.how}.</div>}
          </div>
        );
      })}
    </Card>
  );
}

export function NationPanel({ g }: P) {
  const [sel, setSel] = useState<NationKey>('approval');
  const n = g.nation;
  const h = g.nationHist;
  const prev = h[Math.max(0, h.length - 13)];
  const data = h.map((x, i) => ({ t: i - h.length + 1, v: +x[sel].toFixed(2) }));
  const f = fiscal(g);
  return (
    <>
      <RegionPanel g={g} />
      <Card icon={ChartColumn} title="Statistik negara" right={g.pres ? <small>Skor warisan sementara: <b>{legacyScore(g)}</b></small> : <small>Kamu belum presiden; ini kondisi Nagari saat ini</small>}>
        {g.pres && <Bar label="Kepuasan publik" value={n.approval} tone={n.approval < 30 ? 'bad' : 'good'} />}
        {GROUPS.map(gr => (
          <div key={gr.title}>
            <h5>{gr.title}</h5>
            <div className="stats">
              {gr.keys.map(k => {
                const d = n[k] - prev[k];
                const good = (d >= 0) === NATION_LABEL[k].goodUp;
                return (
                  <button key={k} className={`stat ${sel === k ? 'on' : ''}`} onClick={() => setSel(k)}>
                    <span>{NATION_LABEL[k].name}</span>
                    <b>{fmt(k, n[k])}</b>
                    <i className={`ic ${Math.abs(d) < 0.05 ? 'muted' : good ? 'ok' : 'warn'}`}>{d >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{Math.abs(k === 'pdb' ? d / prev[k] * 100 : d).toFixed(1)}{k === 'pdb' ? '%' : ''} /thn</i>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Card>
      <Card icon={ChartLine} title={`Grafik: ${NATION_LABEL[sel].name}`} right={<small>{h.length} bulan terakhir</small>}>
        <div style={{ height: 170 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="t" tick={{ fill: '#9fb0c8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9fb0c8', fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#101a2c', border: '1px solid #33435e', fontSize: 12 }} labelFormatter={(t) => `${t} bulan`} />
              <Line type="monotone" dataKey="v" name={NATION_LABEL[sel].name} stroke="#e8b84a" dot={false} strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <GovHistory g={g} />
      <Card icon={Wallet} title="Anggaran (% PDB)">
        <div className="mini">Penerimaan {f.revenue.toFixed(1)} · Belanja {f.spend.toFixed(1)} · Bunga utang {f.interest.toFixed(1)} · Program/perang {f.extra.toFixed(1)}</div>
        <p>Saldo: <b className={f.balance < -3 ? 'warn' : 'ok'}>{f.balance.toFixed(1)}%</b></p>
      </Card>
    </>
  );
}

export function BudgetPanel({ g }: P) {
  const act = useStore(s => s.act);
  const p = g.pres!;
  const [b, setB] = useState<Budget>(() => JSON.parse(JSON.stringify(p.budget)));
  const dirty = JSON.stringify(b) !== JSON.stringify(p.budget);
  const f = fiscal({ ...g, pres: { ...p, budget: b } });
  return (
    <Card icon={Wallet} title="Anggaran negara">
      <label className="slider">
        <span>Tarif pajak <b>{b.pajak}%</b></span>
        <input type="range" min={10} max={40} step={1} value={b.pajak} onChange={e => setB({ ...b, pajak: +e.target.value })} />
      </label>
      {(Object.keys(b.belanja) as SectorKey[]).map(k => (
        <label key={k} className="slider">
          <span>{SECTOR_LABEL[k]} <b>{b.belanja[k].toFixed(2)}% PDB</b></span>
          <input type="range" min={0} max={6} step={0.25} value={b.belanja[k]} onChange={e => setB({ ...b, belanja: { ...b.belanja, [k]: +e.target.value } })} />
        </label>
      ))}
      <p>Perkiraan saldo: <b className={f.balance < -3 ? 'warn' : 'ok'}>{f.balance.toFixed(1)}% PDB</b> · Utang sekarang {g.nation.utang.toFixed(0)}% PDB</p>
      <div className="row">
        <Btn kind="primary" disabled={!dirty} onClick={() => act({ type: 'setBudget', budget: b })}>Sahkan anggaran</Btn>
        <Btn kind="ghost" disabled={!dirty} onClick={() => setB(JSON.parse(JSON.stringify(p.budget)))}>Batal</Btn>
      </div>
    </Card>
  );
}

export function CabinetPanel({ g }: P) {
  const act = useStore(s => s.act);
  const p = g.pres!;
  const [open, setOpen] = useState<MinistryId | null>(null);
  const used = new Set(Object.values(p.cabinet));
  const cands = ministerCandidates(g);
  return (
    <Card icon={Users} title="Kabinet" right={<small>Mengganti menteri: 3 modal politik</small>}>
      {MINISTRIES.map(m => {
        const cur = findNpc(g, p.cabinet[m.id]);
        return (
          <div key={m.id} className="npc">
            <div className="npc-head">
              <div><b>{m.name}</b></div>
              <span className={cur ? 'ok' : 'warn'}>{cur ? 'terisi' : 'kosong'}</span>
            </div>
            {cur ? (
              <div className="mini">{cur.name} — kompetensi {cur.competence}, integritas {cur.integrity}, loyalitas {cur.loyalty}{cur.party ? `, ${PARTIES.find(x => x.id === cur.party)?.short}` : ', nonpartai'}{cur.expertise !== m.id ? ' · bukan bidangnya' : ''}</div>
            ) : <div className="mini warn">Belum ada menteri.</div>}
            <div className="row">
              <Btn small onClick={() => setOpen(open === m.id ? null : m.id)}>{open === m.id ? 'Tutup' : cur ? 'Ganti' : 'Pilih menteri'}</Btn>
              {cur && <Btn small kind="ghost" onClick={() => act({ type: 'appoint', ministry: m.id, npcId: null })}>Copot</Btn>}
            </div>
            {open === m.id && (
              <div className="cands">
                {cands.filter(n => !used.has(n.id)).sort((a, b) => (b.expertise === m.id ? 100 : 0) + b.competence - ((a.expertise === m.id ? 100 : 0) + a.competence)).map(n => (
                  <button key={n.id} className="pick" onClick={() => { act({ type: 'appoint', ministry: m.id, npcId: n.id }); setOpen(null); }}>
                    <b>{n.name} {n.expertise === m.id && <span className="tag ok">ahli</span>} {g.npcs.some(x => x.id === n.id) && <span className="tag">temanmu</span>}</b>
                    <span>{ROLE_LABEL[n.role]} · {n.party ? PARTIES.find(x => x.id === n.party)?.short : 'nonpartai'} · {n.desc}</span>
                    <span className="muted">Kompetensi {n.competence} · Integritas {n.integrity} · Loyalitas {n.loyalty}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}

export function ParliamentPanel({ g }: P) {
  const act = useStore(s => s.act);
  const p = g.pres!;
  const seats = coalitionSeats(g);
  return (
    <>
      <Card icon={Landmark} title="DPR & koalisi" right={<small>Modal politik: <b>{Math.round(p.capital)}</b></small>}>
        <Bar label={`Kursi koalisi: ${seats}%`} value={seats} tone={seats >= 50 ? 'good' : 'bad'} />
        <div className="seatbar">{PARTIES.map(x => <div key={x.id} style={{ width: `${g.seats[x.id]}%`, background: x.color, opacity: p.coalition[x.id] !== undefined ? 1 : 0.3 }} title={`${x.short} ${g.seats[x.id]}%`} />)}</div>
        {PARTIES.map(x => {
          const sat = p.coalition[x.id];
          const inC = sat !== undefined;
          return (
            <div key={x.id} className="npc">
              <div className="npc-head">
                <div><b style={{ color: x.color }}>{x.short}</b> {x.name} <span className="muted">· {x.ideology} · {g.seats[x.id]}%</span></div>
                {inC ? <span className={sat < 35 ? 'warn' : 'ok'}>kepuasan {Math.round(sat)}</span> : <span className="muted">oposisi</span>}
              </div>
              <div className="row">
                {inC ? (x.id !== g.char.party && <Btn small kind="ghost" onClick={() => act({ type: 'coalition', party: x.id, join: false })}>Keluarkan</Btn>)
                  : <Btn small why={p.capital < 8 ? 'Butuh modal politik 8' : null} onClick={() => act({ type: 'coalition', party: x.id, join: true })}>Ajak koalisi (8 modal)</Btn>}
              </div>
            </div>
          );
        })}
      </Card>
      <Card icon={DoorOpen} title="Jalan keluar">
        <p className="muted">Masa jabatan ke-{p.term}, sisa {p.monthsLeft} bulan.</p>
        <Btn kind="ghost" small onClick={() => { if (confirm('Mundur dari jabatan presiden? Permainan berakhir.')) act({ type: 'resign' }); }}>Mengundurkan diri</Btn>
      </Card>
    </>
  );
}

export function PolicyPanel({ g }: P) {
  const act = useStore(s => s.act);
  const p = g.pres!;
  return (
    <Card icon={ScrollText} title="Kebijakan & undang-undang" right={<small>Modal politik: <b>{Math.round(p.capital)}</b></small>}>
      {POLICIES.map(pol => {
        const on = p.policies.includes(pol.id);
        const why = policyBlock(g, pol.id, !on);
        return (
          <div key={pol.id} className={`npc ${on ? 'active' : ''}`}>
            <div className="npc-head">
              <div><b>{pol.name}</b> <span className="tag">{pol.tag}</span>{on && <span className="tag ok">berlaku</span>}</div>
              <Btn small kind={on ? 'ghost' : 'primary'} why={why} onClick={() => act({ type: 'policy', id: pol.id, enact: !on })}>{on ? <X size={13} /> : <Check size={13} />}{on ? 'Cabut' : 'Sahkan'} ({policyCapital(g, pol.id, !on)})</Btn>
            </div>
            <p className="muted">{pol.desc}{pol.cost ? ` Anggaran ${pol.cost > 0 ? '+' : ''}${pol.cost}% PDB.` : ''}</p>
            {why && !on && <small className="warn">{why}</small>}
          </div>
        );
      })}
    </Card>
  );
}

const DIPLO: { id: 'kunjungan' | 'dagang' | 'aliansi' | 'bantuan' | 'sanksi' | 'cabut_sanksi' | 'perang'; name: string; kind?: string; icon: typeof Plane }[] = [
  { id: 'kunjungan', name: 'Kunjungan', icon: Plane }, { id: 'dagang', name: 'Perjanjian dagang', icon: Handshake }, { id: 'aliansi', name: 'Aliansi', icon: Shield },
  { id: 'bantuan', name: 'Kirim bantuan', icon: Gift }, { id: 'sanksi', name: 'Sanksi', icon: Ban }, { id: 'cabut_sanksi', name: 'Cabut sanksi', icon: Undo2 }, { id: 'perang', name: 'Nyatakan perang', kind: 'danger', icon: Swords },
];

export function DiploPanel({ g }: P) {
  const act = useStore(s => s.act);
  const p = g.pres!;
  const w = p.war;
  return (
    <>
      {w && (() => {
        const def = COUNTRIES.find(c => c.id === w.enemy)!;
        const pw = warPower(g);
        return (
          <Card icon={Swords} title={`Perang melawan ${def.name}`} tone="danger" right={<small>Bulan ke-{w.months}</small>}>
            <div className="warbar"><div style={{ width: `${(w.progress + 100) / 2}%` }} /></div>
            <div className="mini ic">Kalah<ChevronLeft size={12} />{Math.round(w.progress)}<ChevronRight size={12} />Menang · Kekuatan kita {Math.round(pw.mine)} vs mereka {Math.round(pw.theirs)} · Kelelahan perang {Math.round(w.lelah)}</div>
            <div className="row">
              <Btn small kind={w.stance === 'serang' ? 'primary' : ''} onClick={() => act({ type: 'war', act: 'serang' })}><Sword size={13} />Menyerang</Btn>
              <Btn small kind={w.stance === 'bertahan' ? 'primary' : ''} onClick={() => act({ type: 'war', act: 'bertahan' })}><ShieldHalf size={13} />Bertahan</Btn>
              <Btn small why={p.diploDone ? 'Langkah diplomasi bulan ini sudah dipakai' : null} onClick={() => act({ type: 'war', act: 'damai' })}><Flag size={13} />Tawarkan damai</Btn>
            </div>
          </Card>
        );
      })()}
      <Card icon={Globe} title="Hubungan luar negeri" right={<small>{p.diploDone ? 'Langkah bulan ini sudah dipakai' : '1 langkah per bulan'}</small>}>
        {p.countries.map(cs => {
          const def = COUNTRIES.find(c => c.id === cs.id)!;
          return (
            <div key={cs.id} className="npc">
              <div className="npc-head">
                <div><b style={{ color: def.color }}>{def.name}</b> {cs.dagang && <span className="tag ok">dagang</span>}{cs.aliansi && <span className="tag ok">sekutu</span>}{cs.sanksi && <span className="tag warn">disanksi</span>}{w?.enemy === cs.id && <span className="tag warn">perang</span>}</div>
                <span className={cs.rel >= 25 ? 'ok' : cs.rel < -35 ? 'warn' : 'muted'}>hubungan {Math.round(cs.rel)}</span>
              </div>
              <p className="muted">{def.desc}</p>
              <div className="mini">Kekuatan militer {Math.round(cs.power)} (Nagari {Math.round(g.nation.militer)}) · Agresivitas {def.aggressive}</div>
              <div className="row wrap">
                {DIPLO.map(d => {
                  const why = diploBlock(g, cs.id, d.id);
                  if ((d.id === 'cabut_sanksi') !== cs.sanksi && (d.id === 'cabut_sanksi' || d.id === 'sanksi')) return null;
                  return <Btn key={d.id} small kind={d.kind} why={why} onClick={() => { if (d.id !== 'perang' || confirm(`Nyatakan perang terhadap ${def.name}?`)) act({ type: 'diplo', country: cs.id, act: d.id }); }}><d.icon size={13} />{d.name}</Btn>;
                })}
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
