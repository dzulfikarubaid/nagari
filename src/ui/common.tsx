import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { TriangleAlert, ChevronDown, Check, type LucideIcon } from 'lucide-react';
import type { Fx, AttrKey, Level, NationKey, RegionKey } from '../sim/types';
import { ATTR_LABEL, LEVEL_LABEL, NATION_LABEL, REGION_LABEL } from '../content/data';

export const rupiah = (juta: number): string => {
  const a = Math.abs(juta);
  const sign = juta < 0 ? '−' : '';
  if (a >= 1000) return `${sign}Rp ${(a / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
  return `${sign}Rp ${a.toLocaleString('id-ID', { maximumFractionDigits: a < 10 ? 1 : 0 })} jt`;
};

export function Bar({ label, value, max = 100, tone = 'gold', hint, icon: Icon }: { label: string; value: number; max?: number; tone?: 'gold' | 'good' | 'bad' | 'blue'; hint?: string; icon?: LucideIcon }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bar" title={hint}>
      <div className="bar-head"><span className="ic">{Icon && <Icon size={13} />}{label}</span><b>{Math.round(value)}</b></div>
      <div className="bar-track"><div className={`bar-fill ${tone}`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export function Btn({ children, onClick, disabled, why, kind = '', small }: { children: ReactNode; onClick?: () => void; disabled?: boolean; why?: string | null; kind?: string; small?: boolean }) {
  const off = disabled || !!why;
  return (
    <button className={`btn ic ${kind} ${small ? 'small' : ''}`} onClick={onClick} disabled={off} title={why ?? undefined}>
      {children}
    </button>
  );
}

export function Card({ title, children, right, tone, icon: Icon }: { title?: ReactNode; children: ReactNode; right?: ReactNode; tone?: string; icon?: LucideIcon }) {
  return (
    <div className={`card ${tone ?? ''}`}>
      {(title || right) && <div className="card-head"><h4 className="ic">{Icon && <Icon size={16} />}{title}</h4>{right}</div>}
      {children}
    </div>
  );
}

const chip = (key: string, label: string, v: number, goodUp = true, digits = 0) => {
  const good = (v > 0) === goodUp;
  const txt = `${v > 0 ? '+' : '−'}${Math.abs(v).toLocaleString('id-ID', { maximumFractionDigits: digits })}`;
  return <span key={key} className={`chip ${good ? 'good' : 'bad'}`}>{label} {txt}</span>;
};

/** Dampak yang terlihat. Paparan skandal, jejak, dan akibat terjadwal sengaja tidak ditampilkan. */
export function FxChips({ fx }: { fx?: Fx | Fx[] }) {
  const list = Array.isArray(fx) ? fx : fx ? [fx] : [];
  const out: ReactNode[] = [];
  const hints: string[] = [];
  list.forEach((f, i) => {
    if (f.attr) for (const [k, v] of Object.entries(f.attr) as [AttrKey, number][]) out.push(chip(`a${i}${k}`, ATTR_LABEL[k], v, k !== 'stres', 1));
    if (f.pop) for (const [k, v] of Object.entries(f.pop) as [Level, number][]) out.push(chip(`p${i}${k}`, `Pop. ${LEVEL_LABEL[k].toLowerCase()}`, v, true, 1));
    if (f.money) out.push(<span key={`m${i}`} className={`chip ${f.money > 0 ? 'good' : 'bad'}`}>{f.money > 0 ? '+' : ''}{rupiah(f.money)}</span>);
    if (f.nation) for (const [k, v] of Object.entries(f.nation) as [NationKey, number][]) out.push(chip(`n${i}${k}`, NATION_LABEL[k].name, v, NATION_LABEL[k].goodUp, 1));
    if (f.region) for (const [k, v] of Object.entries(f.region) as [RegionKey, number][]) out.push(chip(`r${i}${k}`, REGION_LABEL[k], v, true, 1));
    if (f.momentum) out.push(chip(`mo${i}`, 'Momentum', f.momentum));
    if (f.capital) out.push(chip(`c${i}`, 'Modal politik', f.capital));
    if (f.party) out.push(chip(`pt${i}`, 'Kedekatan partai', f.party));
    if (f.coalition) out.push(chip(`co${i}`, 'Koalisi', f.coalition));
    if (f.diplo) out.push(chip(`d${i}`, 'Hubungan luar negeri', f.diplo));
    if (f.rel) out.push(chip(`rl${i}`, 'Hubungan', f.rel));
    if (f.jail) out.push(<span key={`j${i}`} className="chip bad">Penjara {f.jail} bln</span>);
    if (f.hint) hints.push(f.hint);
  });
  if (!out.length && !hints.length) return null;
  return (
    <div className="fx">
      {out.length > 0 && <div className="chips">{out}</div>}
      {hints.map((h, i) => <div key={i} className="hint ic"><TriangleAlert size={13} /> {h}</div>)}
    </div>
  );
}

export function Modal({ children, wide, tone }: { children: ReactNode; wide?: boolean; tone?: string }) {
  return (
    <div className="modal-back">
      <div className={`modal ${wide ? 'wide' : ''} ${tone ?? ''}`}>{children}</div>
    </div>
  );
}

export interface SelectOption<T extends string> { value: T; label: ReactNode; hint?: ReactNode; disabled?: boolean; why?: string | null }

/** Dropdown buatan sendiri (bukan <select> bawaan): bisa menampilkan keterangan dan alasan opsi terkunci. */
export function Select<T extends string>({ value, onChange, options, placeholder = 'Pilih…', grow }: { value: T; onChange: (v: T) => void; options: SelectOption<T>[]; placeholder?: string; grow?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number; max: number }>({ left: 0, width: 0, max: 300 });
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const cur = options.find(o => o.value === value);

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 12, above = r.top - 12;
    const up = below < 220 && above > below;
    setPos({ left: r.left, width: Math.max(r.width, 240), max: Math.min(340, up ? above : below), ...(up ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }) });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => { if (e.type === 'mousedown' && (list.current?.contains(e.target as Node) || btn.current?.contains(e.target as Node))) return; setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onScroll = (e: Event) => { if (!list.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('mousedown', close);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('mousedown', close); window.removeEventListener('resize', close); window.removeEventListener('scroll', onScroll, true); window.removeEventListener('keydown', key); };
  }, [open]);

  return (
    <>
      <button ref={btn} type="button" className={`sel ${open ? 'open' : ''} ${grow ? 'grow' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className="sel-val">{cur ? cur.label : <span className="muted">{placeholder}</span>}</span>
        <ChevronDown size={15} />
      </button>
      {open && createPortal(
        <div ref={list} className="sel-list" role="listbox" style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.max }}>
          {options.map(o => {
            const off = o.disabled || !!o.why;
            return (
              <button key={o.value} type="button" role="option" aria-selected={o.value === value} className={`sel-opt ${o.value === value ? 'on' : ''}`} disabled={off}
                onClick={() => { onChange(o.value); setOpen(false); }}>
                <span className="sel-main">{o.label}{o.value === value && <Check size={13} />}</span>
                {o.hint && <span className="sel-hint">{o.hint}</span>}
                {o.why && <span className="sel-why">{o.why}</span>}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
