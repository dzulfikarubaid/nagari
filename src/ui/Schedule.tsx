// Jadwal mingguan: 168 jam dibagi antara kewajiban, tidur, dan kegiatan pilihan.
import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Moon, TriangleAlert } from 'lucide-react';
import { useStore } from '../store';
import type { GameState } from '../sim/types';
import { Card, rupiah } from './common';
import { PLAN_ACTIONS, PLAN_GROUPS } from '../content/data';
import { WEEK, SLEEP_MIN, SLEEP_MAX, fixedHours, activityBlock, sideIncome } from '../sim/time';

const BLOCK_COLOR: Record<string, string> = {
  tidur: '#3b4f86', dasar: '#55607a', kuliah: '#2e86c1', kerja: '#c0862b', jabatan: '#c0392b', kampanye: '#d35400',
  jalan: '#7f6a55', rumah: '#5b7a5d', anak: '#a05c8a', penjara: '#444',
};

export function ScheduleCard({ g }: { g: GameState }) {
  const act = useStore(s => s.act);
  const c = g.char;
  const [time, setTimeDraft] = useState<Record<string, number>>(c.time);
  const [sleep, setSleep] = useState(c.sleep);
  const dirty = useRef(false);

  // Simpan ke permainan sesaat setelah slider berhenti digeser.
  useEffect(() => {
    if (!dirty.current) return;
    const id = setTimeout(() => { dirty.current = false; act({ type: 'setTime', time, sleep }); }, 250);
    return () => clearTimeout(id);
  }, [time, sleep, act]);

  const probe = { ...g, char: { ...c, sleep } };
  const fixed = fixedHours(probe);
  const used = fixed.reduce((a, b) => a + b.h, 0);
  const free = Math.max(0, WEEK - used);
  const avail = PLAN_ACTIONS.map(a => ({ a, why: activityBlock(g, a) }));
  const planned = avail.reduce((sum, { a, why }) => sum + (why ? 0 : Math.min(a.max, time[a.id] ?? 0)), 0);
  const over = planned > free;
  const scale = over && planned > 0 ? free / planned : 1;
  const idle = Math.max(0, free - planned);
  const extra = avail.reduce((sum, { a, why }) => sum + (why ? 0 : sideIncome(g, a.id, (time[a.id] ?? 0) * scale)), 0);

  const set = (id: string, h: number) => { dirty.current = true; setTimeDraft(t => ({ ...t, [id]: h })); };

  return (
    <Card icon={CalendarDays} title="Jadwal mingguan" right={<small>Seminggu = {WEEK} jam</small>}>
      <div className="week">
        {fixed.map(b => <div key={b.key} style={{ flex: b.h, background: BLOCK_COLOR[b.key] ?? '#555' }} title={`${b.label}: ${Math.round(b.h)} jam`} />)}
        {planned > 0 && <div style={{ flex: Math.min(planned, free), background: 'var(--gold)' }} title={`Kegiatan pilihan: ${Math.round(Math.min(planned, free))} jam`} />}
        {idle > 0 && <div style={{ flex: idle, background: 'rgba(255,255,255,0.12)' }} title={`Waktu luang: ${Math.round(idle)} jam`} />}
      </div>
      <div className="week-legend">
        {fixed.map(b => <span key={b.key}><i style={{ background: BLOCK_COLOR[b.key] ?? '#555' }} />{b.label} {Math.round(b.h)}j</span>)}
        <span><i style={{ background: 'var(--gold)' }} />Kegiatan {Math.round(Math.min(planned, free))}j</span>
        <span><i style={{ background: 'rgba(255,255,255,0.25)' }} />Luang {Math.round(idle)}j</span>
      </div>

      <div className="hours-row">
        <div className="hours-head"><span className="ic"><Moon size={13} />Tidur per malam</span><b className={sleep < 6 ? 'warn' : ''}>{sleep} jam</b></div>
        <input type="range" min={SLEEP_MIN} max={SLEEP_MAX} step={0.5} value={sleep} onChange={e => { dirty.current = true; setSleep(+e.target.value); }} />
        <p className="muted">{sleep < 6 ? 'Kurang tidur: kesehatan turun, stres naik, IPK ikut jeblok.' : sleep >= 7.5 ? 'Cukup tidur: badan pulih, stres turun pelan-pelan.' : 'Agak kurang, tapi masih bisa ditahan.'}</p>
      </div>

      <p className={over ? 'warn ic' : 'muted'}>{over ? <><TriangleAlert size={13} />Jadwalmu {Math.round(planned)} jam, padahal jam bebasmu cuma {Math.round(free)}. Semua kegiatan akan dikecilkan rata.</> : <>Jam bebas {Math.round(free)} jam/minggu; terpakai {Math.round(planned)}, sisa {Math.round(idle)} jam jadi waktu santai.</>}</p>
      {extra > 0.05 && <p className="mini ok">Perkiraan penghasilan sampingan: ±{rupiah(extra)}/bln</p>}

      {PLAN_GROUPS.map(gr => (
        <div key={gr}>
          <h5>{gr}</h5>
          {avail.filter(x => x.a.group === gr).map(({ a, why }) => {
            const h = Math.min(a.max, time[a.id] ?? 0);
            return (
              <div key={a.id} className={`hours-row ${why ? 'off' : ''}`}>
                <div className="hours-head">
                  <span>{a.name}</span>
                  <b>{why ? <span className="muted">{why}</span> : `${h} jam/mgg${over && h ? ` (efektif ${Math.round(h * scale)})` : ''}`}</b>
                </div>
                {!why && <input type="range" min={0} max={a.max} step={1} value={h} onChange={e => set(a.id, +e.target.value)} />}
                <p className="muted">{a.desc}{a.rate && !why && h > 0 ? ` ±${rupiah(sideIncome(g, a.id, h * scale))}/bln.` : ''}</p>
              </div>
            );
          })}
        </div>
      ))}
    </Card>
  );
}
