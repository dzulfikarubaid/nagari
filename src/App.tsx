import { useEffect } from 'react';
import { CalendarDays, GraduationCap, Users, Landmark, Megaphone, Building2, ChartColumn, Globe, Swords, Wallet, ScrollText, Brain, Sparkles, ShieldCheck, HeartPulse, Flame, Network, History, RotateCcw, ChevronRight, FastForward, TrendingUp, Coins, Briefcase, Vote, Crown, Flag, MapPin, Newspaper, Lock, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useStore } from './store';
import { Scene } from './scene/Scene';
import { Bar, Btn, rupiah } from './ui/common';
import { PlanPanel, CareerPanel, RelationPanel, PoliticsPanel, CampaignPanel, OfficePanel } from './ui/LifePanels';
import { NationPanel, BudgetPanel, CabinetPanel, ParliamentPanel, PolicyPanel, DiploPanel } from './ui/PresPanels';
import { NewGame, EventModal, ResultModal, ElectionModal, EndingModal, HistoryModal } from './ui/Modals';
import { blocked, type GameState, type AttrKey, type Level } from './sim';
import { age, dateLabel } from './sim/core';
import { ATTR_LABEL, LEVEL_LABEL, JOBS, PARTIES, officeDef, MAJORS } from './content/data';

const TAB_ICON: Record<string, LucideIcon> = {
  kampanye: Megaphone, negara: ChartColumn, kabinet: Users, anggaran: Wallet, kebijakan: ScrollText, dpr: Landmark, diplomasi: Globe,
  jabatan: Building2, rencana: CalendarDays, karier: GraduationCap, relasi: Network, politik: Flag,
};
const ATTR_ICON: Record<AttrKey, LucideIcon> = { kecerdasan: Brain, karisma: Sparkles, integritas: ShieldCheck, kesehatan: HeartPulse, stres: Flame, jaringan: Network };

function tabsFor(g: GameState): [string, string][] {
  const t: [string, string][] = [];
  if (g.campaign) t.push(['kampanye', 'Kampanye']);
  if (g.pres) t.push(['negara', 'Negara'], ['kabinet', 'Kabinet'], ['anggaran', 'Anggaran'], ['kebijakan', 'Kebijakan'], ['dpr', 'DPR'], ['diplomasi', g.pres.war ? 'Perang' : 'Diplomasi']);
  else if (g.office) t.push(['jabatan', 'Jabatan']);
  t.push(['rencana', 'Rencana']);
  if (!g.pres) t.push(['karier', 'Karier']);
  t.push(['relasi', 'Relasi']);
  t.push(['politik', 'Politik']);
  if (!g.pres) t.push(['negara', 'Negara']);
  return t;
}

function roleLabel(g: GameState): string {
  const c = g.char;
  if (c.jail > 0) return `Narapidana (sisa ${c.jail} bulan)`;
  if (g.office) return officeDef(g.office.id).name;
  if (c.edu) return `Mahasiswa ${MAJORS.find(m => m.id === c.edu!.major)?.name}`;
  return JOBS.find(j => j.id === c.job)?.name ?? 'Belum bekerja';
}

function Sidebar({ g }: { g: GameState }) {
  const c = g.char;
  const party = PARTIES.find(p => p.id === c.party);
  return (
    <aside className="left">
      <div className="card">
        <h3 className="ic">{g.pres ? <Crown size={17} /> : null}{c.name}</h3>
        <div className="mini">{age(g)} tahun · {roleLabel(g)}{party ? ` · ${party.short}` : ''}{c.degree ? ` · ${c.degree}` : ''}</div>
        <div className={`money ic ${c.money < 0 ? 'warn' : ''}`}><Wallet size={19} />{rupiah(c.money)}</div>
        {(Object.keys(c.attr) as AttrKey[]).map(k => (
          <Bar key={k} icon={ATTR_ICON[k]} label={ATTR_LABEL[k]} value={c.attr[k]} tone={k === 'stres' ? (c.attr[k] > 70 ? 'bad' : 'blue') : k === 'kesehatan' && c.attr[k] < 30 ? 'bad' : 'gold'} />
        ))}
        <h5>Popularitas</h5>
        {(Object.keys(c.pop) as Level[]).map(k => <Bar key={k} icon={MapPin} label={LEVEL_LABEL[k]} value={c.pop[k]} tone="good" />)}
      </div>
      <div className="card log">
        <h5 className="ic"><Newspaper size={13} />Kabar terbaru</h5>
        {g.log.length === 0 && <p className="muted">Belum ada kabar.</p>}
        {g.log.slice(0, 7).map((l, i) => <p key={i}>{l}</p>)}
      </div>
    </aside>
  );
}

export default function App() {
  const { game: g, tab, setTab, act, skip, showHistory, setShowHistory, reset } = useStore();
  const tabs = g ? tabsFor(g) : [];
  const cur = tabs.some(t => t[0] === tab) ? tab : tabs[0]?.[0] ?? 'rencana';

  // Fase baru: arahkan ke panel yang relevan.
  const phaseKey = g ? `${!!g.campaign}|${g.office?.id ?? ''}` : '';
  useEffect(() => {
    if (!g) return;
    if (g.campaign) setTab('kampanye');
    else if (g.pres) setTab('kabinet');
    else if (g.office) setTab('jabatan');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseKey]);

  const isBlocked = g ? blocked(g) : true;
  const needProgram = g?.office && g.office.id !== 'presiden' && !g.office.programDone;
  const campaignLeft = g?.campaign?.actionsLeft ?? 0;

  return (
    <div className="app">
      <Scene g={g} tab={cur} />
      {g && (
        <>
          <header className="hud">
            <div className="brand ic"><Landmark size={17} />NAGARI</div>
            <div className="hud-mid">
              <b className="ic"><CalendarDays size={15} />{dateLabel(g)}</b>
              <span className="ic"><TrendingUp size={14} />PDB tumbuh {g.nation.pertumbuhan.toFixed(1)}%</span>
              <span className="ic"><Coins size={14} />Inflasi {g.nation.inflasi.toFixed(1)}%</span>
              <span className="ic"><Briefcase size={14} />Pengangguran {g.nation.pengangguran.toFixed(1)}%</span>
              {g.pres && <span className={`ic ${g.nation.approval < 30 ? 'warn' : 'ok'}`}><Vote size={14} />Kepuasan {Math.round(g.nation.approval)}%</span>}
              {g.pres?.war && <span className="warn ic"><Swords size={14} />PERANG</span>}
            </div>
            <div className="row">
              <Btn small onClick={() => setShowHistory(true)}><History size={14} />Jejak hidup</Btn>
              <Btn small kind="ghost" onClick={() => { if (confirm('Mulai hidup baru? Permainan ini dihapus.')) reset(); }}><RotateCcw size={14} />Hidup baru</Btn>
            </div>
          </header>
          <Sidebar g={g} />
          <aside className="right">
            <nav className="tabs">
              {tabs.map(([id, label]) => { const Icon = id === 'diplomasi' && g.pres?.war ? Swords : TAB_ICON[id]; return <button key={id} className={`ic ${cur === id ? 'on' : ''}`} onClick={() => setTab(id)}>{Icon && <Icon size={14} />}{label}</button>; })}
            </nav>
            <div className="panel">
              {g.char.jail > 0 && <div className="card danger"><h4 className="ic"><Lock size={16} />Di penjara</h4><p>Sisa hukuman {g.char.jail} bulan. Tak ada yang bisa dilakukan selain menunggu.</p></div>}
              {cur === 'rencana' && <PlanPanel g={g} />}
              {cur === 'karier' && <CareerPanel g={g} />}
              {cur === 'relasi' && <RelationPanel g={g} />}
              {cur === 'politik' && <PoliticsPanel g={g} />}
              {cur === 'kampanye' && g.campaign && <CampaignPanel g={g} />}
              {cur === 'jabatan' && g.office && g.office.id !== 'presiden' && <OfficePanel g={g} />}
              {cur === 'negara' && <NationPanel g={g} />}
              {cur === 'kabinet' && g.pres && <CabinetPanel g={g} />}
              {cur === 'anggaran' && g.pres && <BudgetPanel key={g.turn} g={g} />}
              {cur === 'kebijakan' && g.pres && <PolicyPanel g={g} />}
              {cur === 'dpr' && g.pres && <ParliamentPanel g={g} />}
              {cur === 'diplomasi' && g.pres && <DiploPanel g={g} />}
            </div>
          </aside>
          <footer className="bottom">
            <div className="notes">
              {needProgram && <span className="warn ic"><TriangleAlert size={13} />Belum memilih program bulan ini</span>}
              {campaignLeft > 0 && <span className="warn ic"><TriangleAlert size={13} />{campaignLeft} aksi kampanye belum dipakai</span>}
              {g.pres && Object.keys(g.pres.cabinet).length < 8 && <span className="warn ic"><TriangleAlert size={13} />{8 - Object.keys(g.pres.cabinet).length} kursi menteri kosong</span>}
            </div>
            <Btn kind="primary big" disabled={isBlocked} onClick={() => act({ type: 'next' })}>Bulan berikutnya<ChevronRight size={18} /></Btn>
            <Btn disabled={isBlocked} onClick={() => skip(6)}><FastForward size={14} />6 bulan</Btn>
            <Btn disabled={isBlocked} onClick={() => skip(12)}><FastForward size={14} />1 tahun</Btn>
          </footer>
        </>
      )}
      {!g && <NewGame />}
      {g && !g.ending && !showHistory && (g.lastElection ? <ElectionModal g={g} /> : g.result ? <ResultModal g={g} /> : g.pending.length > 0 ? <EventModal g={g} /> : null)}
      {g?.ending && !showHistory && <EndingModal g={g} />}
      {g && showHistory && <HistoryModal g={g} />}
    </div>
  );
}
