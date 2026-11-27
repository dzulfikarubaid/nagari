import { useState } from 'react';
import { Landmark, ChevronRight, History, RotateCcw, Hourglass, Vote, Trophy, Play } from 'lucide-react';
import { useStore } from '../store';
import type { GameState, AttrKey } from '../sim/types';
import { Btn, Modal, Select, rupiah } from './common';
import { EVENT_MAP, eventText } from '../sim/events';
import { check } from '../sim/core';
import { BACKGROUNDS, ATTR_LABEL, officeDef, PARTIES, GOV_STYLES } from '../content/data';
import { ASPIRATIONS, CITIES } from '../content/life';

type P = { g: GameState };

export function NewGame() {
  const start = useStore(s => s.start);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [bg, setBg] = useState('menengah');
  const [boost, setBoost] = useState<AttrKey>('karisma');
  const [asp, setAsp] = useState('bebas');
  return (
    <Modal wide>
      <div className="title-block">
        <h1 className="ic center"><Landmark size={30} />NAGARI</h1>
        <p>Satu kehidupan, dari lulus SMA sampai usia senja. Jadi presiden, profesor, pengusaha, seniman, atau sekadar orang yang bahagia.</p>
      </div>
      <label className="field"><span>Nama</span><input value={name} maxLength={28} onChange={e => setName(e.target.value)} placeholder="Nama tokohmu" autoFocus /></label>
      <div className="row">
        <Btn kind={gender === 'L' ? 'primary' : ''} onClick={() => setGender('L')}>Laki-laki</Btn>
        <Btn kind={gender === 'P' ? 'primary' : ''} onClick={() => setGender('P')}>Perempuan</Btn>
      </div>
      <h4>Latar keluarga</h4>
      <div className="grid2">
        {BACKGROUNDS.map(b => (
          <button key={b.id} className={`pick ${bg === b.id ? 'on' : ''}`} onClick={() => setBg(b.id)}>
            <b>{b.name}</b><span>{b.desc}</span>
            <span className="crit">Uang saku {rupiah(b.family.allowance)}/bln · sanggup biayai kuliah {rupiah(b.family.tuitionCap)}/bln · tumbuh di {CITIES.find(x => x.id === b.home)?.short.toLowerCase()}</span>
          </button>
        ))}
      </div>
      <h4>Cita-cita</h4>
      <div className="grid2">
        {ASPIRATIONS.map(a => (
          <button key={a.id} className={`pick ${asp === a.id ? 'on' : ''}`} onClick={() => setAsp(a.id)}>
            <b>{a.name}</b><span>{a.desc}</span><span className="crit">{a.goal}</span>
          </button>
        ))}
      </div>
      <h4>Bakat menonjol</h4>
      <div className="row wrap">
        {(['kecerdasan', 'karisma', 'integritas', 'kesehatan', 'jaringan'] as AttrKey[]).map(k => (
          <Btn key={k} small kind={boost === k ? 'primary' : ''} onClick={() => setBoost(k)}>{ATTR_LABEL[k]}</Btn>
        ))}
      </div>
      <div className="row end">
        <Btn kind="primary" onClick={() => start({ name: name.trim() || 'Raka Nagari', gender, background: bg, boost, aspiration: asp })}><Play size={15} />Mulai hidup</Btn>
      </div>
      <p className="muted">Setiap pilihan dicatat. Sebagian akibatnya baru datang bertahun-tahun kemudian.</p>
    </Modal>
  );
}

export function EventModal({ g }: P) {
  const act = useStore(s => s.act);
  const pe = g.pending[0];
  const ev = EVENT_MAP[pe.id];
  if (!ev) return null;
  return (
    <Modal tone={pe.delayed ? 'delayed' : ''}>
      {pe.delayed && <div className="ribbon ic"><Hourglass size={12} />Akibat keputusan lama</div>}
      <h2>{eventText(g, ev.title, pe.npcId)}</h2>
      <p className="event-text">{eventText(g, ev.text, pe.npcId)}</p>
      <div className="choices">
        {ev.choices.map((c, i) => {
          // check() bisa memakai RNG; kembalikan supaya tampilan tidak mengubah jalannya permainan.
          const probe = { ...g };
          const ok = check(probe, c.need, pe.npcId) !== false;
          return (
            <button key={i} className="choice" disabled={!ok} onClick={() => act({ type: 'choose', index: i })}>
              <b>{c.label}</b>
              {!ok && <span className="warn">Syarat tidak terpenuhi</span>}
            </button>
          );
        })}
      </div>
      {g.pending.length > 1 && <p className="muted">{g.pending.length - 1} kejadian lain menunggu.</p>}
    </Modal>
  );
}

export function ResultModal({ g }: P) {
  const act = useStore(s => s.act);
  const r = g.result!;
  return (
    <Modal>
      <h2>{r.title}</h2>
      <p className="event-text">{r.text}</p>
      <div className="row end"><Btn kind="primary" onClick={() => act({ type: 'dismissResult' })}>Lanjut<ChevronRight size={15} /></Btn></div>
    </Modal>
  );
}

export function ElectionModal({ g }: P) {
  const act = useStore(s => s.act);
  const e = g.lastElection!;
  const d = officeDef(e.office);
  return (
    <Modal tone={e.runoff ? '' : e.won ? 'win' : 'lose'}>
      <h2 className="ic"><Vote size={20} />Hasil pemilihan {d.name}</h2>
      {e.shares.map(sh => (
        <div key={sh.name} className={`vote ${sh.player ? 'me' : ''}`}>
          <div className="bar-head"><span>{sh.name}{sh.player ? ' (kamu)' : ''}</span><b>{(sh.share * 100).toFixed(1)}%</b></div>
          <div className="bar-track"><div className={`bar-fill ${sh.player ? 'gold' : 'blue'}`} style={{ width: `${sh.share * 100}%` }} /></div>
        </div>
      ))}
      <p className="event-text">{e.runoff ? 'Tak ada yang melewati 50%. Dua suara terbanyak maju ke putaran kedua; kamu punya dua bulan lagi.' : e.won ? `Kamu menang. Sekarang janji-janji itu harus dibuktikan.` : 'Kamu kalah. Uang kampanye hangus, tapi jalan belum tertutup selama umur masih ada.'}</p>
      <div className="row end"><Btn kind="primary" onClick={() => act({ type: 'dismissElection' })}>Lanjut<ChevronRight size={15} /></Btn></div>
    </Modal>
  );
}

export function EndingModal({ g }: P) {
  const reset = useStore(s => s.reset);
  const setShowHistory = useStore(s => s.setShowHistory);
  const e = g.ending!;
  return (
    <Modal wide tone="ending">
      <div className="title-block">
        <small>TAMAT · usia {Math.floor(g.char.ageMonths / 12)}</small>
        <h1>{e.title}</h1>
        <p>{e.text}</p>
      </div>
      <div className="score"><Trophy size={18} /> Skor warisan <b>{e.score}</b><span>/100</span></div>
      {e.causes.length > 0 && (
        <>
          <h4>Yang membawamu ke sini</h4>
          <ul className="causes">{e.causes.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </>
      )}
      <div className="row end">
        <Btn onClick={() => setShowHistory(true)}><History size={14} />Lihat jejak hidup</Btn>
        <Btn kind="primary" onClick={reset}><RotateCcw size={14} />Hidup baru</Btn>
      </div>
    </Modal>
  );
}

export function HistoryModal({ g }: P) {
  const setShowHistory = useStore(s => s.setShowHistory);
  const [filter, setFilter] = useState<'semua' | 'pilihan' | 'akibat' | 'tonggak'>('semua');
  const list = g.history.filter(h => filter === 'semua' || h.kind === filter);
  return (
    <Modal wide>
      <div className="card-head"><h2 className="ic"><History size={20} />Jejak hidup {g.char.name}</h2><Btn small onClick={() => setShowHistory(false)}>Tutup</Btn></div>
      <div className="row wrap">
        {(['semua', 'tonggak', 'pilihan', 'akibat'] as const).map(f => <Btn key={f} small kind={filter === f ? 'primary' : ''} onClick={() => setFilter(f)}>{f}</Btn>)}
      </div>
      <div className="timeline">
        {list.length === 0 && <p className="muted">Belum ada catatan.</p>}
        {[...list].reverse().map((h, i) => (
          <div key={i} className={`tl ${h.kind}`}>
            <span className="tl-age">{h.age} thn</span>
            <span className="tl-text">{h.text}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export function BallotModal({ g }: P) {
  const act = useStore(s => s.act);
  const b = g.ballot!;
  const [pick, setPick] = useState(0);
  const [party, setParty] = useState<string | null>(g.char.party);
  const [endorse, setEndorse] = useState(false);
  return (
    <Modal tone="">
      <h2 className="ic"><Vote size={20} />Hari pencoblosan</h2>
      <p className="event-text">TPS di dekat tempat tinggalmu sudah dibuka sejak pukul tujuh. Pemilu serentak: presiden dan DPR. Siapa pilihanmu?</p>
      <div className="choices">
        {b.cands.map((c, i) => {
          const st = GOV_STYLES.find(x => x.id === c.style);
          const pt = PARTIES.find(p => p.id === c.party);
          return (
            <button key={i} className={`choice ${pick === i ? 'on' : ''}`} onClick={() => setPick(i)}>
              <b>{c.name}{c.incumbent ? ' (petahana)' : ''} · <span style={{ color: pt?.color }}>{pt?.short ?? 'independen'}</span></b>
              <span className="muted">Visi {st?.name.toLowerCase()}: {st?.desc}</span>
            </button>
          );
        })}
        <button className={`choice ${pick === -1 ? 'on' : ''}`} onClick={() => setPick(-1)}><b>Golput</b><span className="muted">Tidak memilih siapa pun.</span></button>
      </div>
      <div className="slot">
        <label className="muted">Partai untuk DPR: </label>
        <Select value={party ?? ''} onChange={v => setParty(v || null)} options={[{ value: '', label: 'Tidak memilih' }, ...PARTIES.map(p => ({ value: p.id, label: <><span style={{ color: p.color }}>{p.short}</span> · {p.name}</>, hint: `${p.ideology} · ${g.seats[p.id]}% kursi DPR` }))]} />
      </div>
      {g.char.pop.nasional >= 25 && pick >= 0 && <label className="row"><input type="checkbox" checked={endorse} onChange={e => setEndorse(e.target.checked)} /> Umumkan dukungan secara terbuka (kamu cukup dikenal)</label>}
      <div className="row end"><Btn kind="primary" onClick={() => act({ type: 'vote', index: pick, party, endorse })}>{pick === -1 ? 'Tidak datang ke TPS' : 'Coblos'}<ChevronRight size={15} /></Btn></div>
    </Modal>
  );
}
