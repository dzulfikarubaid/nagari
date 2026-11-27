import { useState } from 'react';
import { Map as MapIcon, ChevronRight, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useStore } from '../store';
import type { GameState } from '../sim/types';
import { Card } from './common';
import { PROVINCES, districts, cityLabel, unitNames, jiwa } from '../content/geo';
import { NATION_LABEL } from '../content/data';
import { welfare, provState, cityState, REG_KEYS, HIST_EVERY, type RegKey, type RegStats } from '../sim/regions';

const fmt = (k: RegKey, v: number) => k === 'pdb' ? `${Math.round(v).toLocaleString('id-ID')} T` : `${v.toFixed(k === 'pertumbuhan' || k === 'pengangguran' || k === 'kemiskinan' ? 1 : 0)}${NATION_LABEL[k].unit}`;

function Row({ title, sub, v, onClick, star }: { title: string; sub: string; v?: number; onClick?: () => void; star?: boolean }) {
  const body = (
    <>
      <div className="reg-main">
        <b className="ic">{star && <Star size={12} className="gold" />}{title}</b>
        <span>{sub}</span>
      </div>
      {v !== undefined && <div className="reg-score"><span><i style={{ width: `${v}%`, background: v < 35 ? 'var(--bad)' : v < 55 ? 'var(--gold)' : 'var(--good)' }} /></span><em>{Math.round(v)}</em></div>}
      {onClick && <ChevronRight size={15} className="muted" />}
    </>
  );
  return onClick ? <button className="reg-row" onClick={onClick}>{body}</button> : <div className="reg-row flat">{body}</div>;
}

/** Statistik sebuah wilayah dibanding wilayah di atasnya. */
function StatGrid({ st, ref_, refName, sel, onSel }: { st: RegStats; ref_: RegStats; refName: string; sel?: RegKey; onSel?: (k: RegKey) => void }) {
  return (
    <div className="stats reg-stats">
      {REG_KEYS.filter(k => k !== 'pdb').map(k => {
        const d = st[k] - ref_[k];
        const good = (d >= 0) === NATION_LABEL[k].goodUp;
        const small = Math.abs(d) < (k === 'pertumbuhan' || k === 'pengangguran' || k === 'kemiskinan' ? 0.1 : 0.5);
        return (
          <button key={k} className={`stat ${sel === k ? 'on' : ''}`} onClick={() => onSel?.(k)} style={onSel ? undefined : { cursor: 'default' }}>
            <span>{NATION_LABEL[k].name}</span>
            <b>{fmt(k, st[k])}</b>
            <i className={`ic ${small ? 'muted' : good ? 'ok' : 'warn'}`} title={`Dibanding ${refName}`}>{d >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{d >= 0 ? '+' : '−'}{Math.abs(d).toFixed(1)} vs {refName}</i>
          </button>
        );
      })}
    </div>
  );
}

/** Peta wilayah: Nagari › provinsi › kota/kabupaten › kecamatan › kelurahan/desa. */
export function RegionPanel({ g }: { g: GameState }) {
  const sel = useStore(s => s.mapSel);
  const setSel = useStore(s => s.setMapSel);
  const [key, setKey] = useState<RegKey>('kemiskinan');
  if (!g.regions) return null;
  const pv = PROVINCES.find(p => p.id === sel[0]);
  const city = pv?.cities.find(c => c.id === sel[1]);
  const kecs = city ? districts(city) : [];
  const kec = city && sel[2] !== undefined ? kecs[+sel[2]] : undefined;
  const un = pv && city ? unitNames(pv, city) : null;
  const ps = pv ? provState(g, pv.id) : null;
  const cs = city ? cityState(g, city.id) : null;
  // Kecamatan/kelurahan tidak disimulasikan: penduduk ikut skala pertumbuhan kota.
  const scale = city && cs ? cs.pop / city.pop : 1;
  const nat = g.nation as unknown as RegStats;
  const totalPop = PROVINCES.reduce((a, p) => a + provState(g, p.id).pop, 0);

  const crumbs: { label: string; path: string[] }[] = [{ label: 'Nagari', path: [] }];
  if (pv) crumbs.push({ label: pv.name, path: [pv.id] });
  if (city) crumbs.push({ label: cityLabel(city), path: [pv!.id, city.id] });
  if (kec && un) crumbs.push({ label: `${un.kec} ${kec.name}`, path: sel });

  const hist = pv ? g.regions.provHist[pv.id]?.[key] ?? [] : [];
  // Titik riwayat provinsi per kuartal; garis nasional diambil dari bulan yang sama.
  const data = hist.map((v, i) => {
    const ago = (hist.length - 1 - i) * HIST_EVERY + (g.turn % HIST_EVERY);
    const nh = g.nationHist[g.nationHist.length - 1 - ago];
    return { t: -ago, v, n: nh ? +nh[key].toFixed(2) : undefined };
  });

  return (
    <>
      <Card icon={MapIcon} title="Wilayah" right={<small>Klik pulau atau kota di peta</small>}>
        <nav className="crumbs">
          {crumbs.map((c, i) => (
            <span key={i} className="ic">
              {i > 0 && <ChevronRight size={12} className="muted" />}
              {i < crumbs.length - 1 ? <button onClick={() => setSel(c.path)}>{c.label}</button> : <b>{c.label}</b>}
            </span>
          ))}
        </nav>

        {!pv && (
          <>
            <div className="mini">{PROVINCES.length} provinsi · {PROVINCES.reduce((s, p) => s + p.cities.length, 0)} kota/kabupaten · {jiwa(totalPop)}. Angka nasional adalah gabungan semua kota/kabupaten.</div>
            {PROVINCES.map(p => {
              const st = provState(g, p.id);
              const capital = p.cities.find(c => c.capital)!;
              return <Row key={p.id} title={p.name} sub={`Ibu kota ${capital.name} · ${p.cities.length} kota/kab. · kemiskinan ${st.stats.kemiskinan.toFixed(1)}% · ${jiwa(st.pop)}`} v={welfare(st.stats)} onClick={() => setSel([p.id])} />;
            })}
          </>
        )}

        {pv && ps && !city && (
          <>
            <div className="mini">{pv.cities.filter(c => c.kind === 'kota').length} kota · {pv.cities.filter(c => c.kind === 'kabupaten').length} kabupaten · {jiwa(ps.pop)} · PDB {fmt('pdb', ps.stats.pdb)} ({(ps.stats.pdb / nat.pdb * 100).toFixed(1)}% nasional) · tumbuh {ps.stats.pertumbuhan.toFixed(1)}%</div>
            <h5>Statistik provinsi</h5>
            <StatGrid st={ps.stats} ref_={nat} refName="nasional" sel={key} onSel={setKey} />
            <h5>Kota & kabupaten</h5>
            {[...pv.cities].sort((a, b) => Number(!!b.capital) - Number(!!a.capital) || cityState(g, b.id).pop - cityState(g, a.id).pop).map(c => {
              const u = unitNames(pv, c), st = cityState(g, c.id);
              return <Row key={c.id} star={c.capital} title={cityLabel(c)} sub={`${c.capital ? 'Ibu kota provinsi · ' : ''}${districts(c).length} ${u.kecs} · kemiskinan ${st.stats.kemiskinan.toFixed(1)}% · ${jiwa(st.pop)}`} v={welfare(st.stats)} onClick={() => setSel([pv.id, c.id])} />;
            })}
          </>
        )}

        {city && cs && ps && un && !kec && (
          <>
            <div className="mini">{kecs.length} {un.kecs} · {kecs.reduce((s, k) => s + k.units.length, 0)} {un.kels} · {jiwa(cs.pop)} · PDB {fmt('pdb', cs.stats.pdb)} · tumbuh {cs.stats.pertumbuhan.toFixed(1)}%</div>
            <h5>Statistik {city.kind}</h5>
            <StatGrid st={cs.stats} ref_={ps.stats} refName="provinsi" />
            <h5>{un.kec}</h5>
            {kecs.map((k, i) => <Row key={k.name} title={`${un.kec} ${k.name}`} sub={`${k.units.length} ${un.kels} · ${jiwa(k.pop * scale)}`} v={Math.max(0, Math.min(100, welfare(cs.stats) + k.bias))} onClick={() => setSel([pv!.id, city.id, String(i)])} />)}
          </>
        )}

        {kec && un && cs && (
          <>
            <div className="mini">{kec.units.length} {un.kels} · {jiwa(kec.pop * scale)}</div>
            {kec.units.map(u => <Row key={u.name} title={`${un.kel} ${u.name}`} sub={jiwa(u.pop * scale)} />)}
          </>
        )}
      </Card>

      {pv && !city && data.length > 1 && (
        <Card title={`${pv.name}: ${NATION_LABEL[key].name}`} right={<small>{data.length * HIST_EVERY} bulan terakhir · garis putus = nasional</small>}>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="t" tick={{ fill: '#9fb0c8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9fb0c8', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#101a2c', border: '1px solid #33435e', fontSize: 12 }} labelFormatter={(t) => `${t} bulan`} />
                <Line type="monotone" dataKey="v" name={pv.name} stroke="#e8b84a" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="n" name="Nasional" stroke="#9fb0c8" dot={false} strokeWidth={1.5} strokeDasharray="4 3" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </>
  );
}
