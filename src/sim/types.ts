// Tipe inti simulasi. Tidak boleh mengimpor React/Three.

export type AttrKey = 'kecerdasan' | 'karisma' | 'integritas' | 'kesehatan' | 'stres' | 'jaringan';
export type Level = 'desa' | 'kabupaten' | 'provinsi' | 'nasional';
export type OfficeId = 'kades' | 'bupati' | 'gubernur' | 'presiden';

export type NationKey =
  | 'pdb' | 'pertumbuhan' | 'inflasi' | 'pengangguran' | 'kemiskinan' | 'utang'
  | 'pendidikan' | 'kesehatan' | 'kriminalitas' | 'korupsi' | 'infrastruktur'
  | 'lingkungan' | 'kebahagiaan' | 'stabilitas' | 'militer' | 'approval';

export type SectorKey = 'pendidikan' | 'kesehatan' | 'infrastruktur' | 'pertahanan' | 'keamanan' | 'sosial' | 'lingkungan';
export type RegionKey = 'kesejahteraan' | 'infrastruktur' | 'keamanan' | 'layanan' | 'kas' | 'kepuasan';

export type MinistryId = 'keuangan' | 'pendidikan' | 'kesehatan' | 'pu' | 'pertahanan' | 'hukum' | 'luar_negeri' | 'sosial';

export type EndingId =
  | 'legenda' | 'dua_periode' | 'satu_periode' | 'dimakzulkan' | 'dikudeta' | 'kalah_perang'
  | 'diktator' | 'mundur_terhormat' | 'penjara' | 'bangkrut' | 'meninggal' | 'wafat_menjabat'
  | 'tokoh_daerah' | 'warga_biasa' | 'revolusi';

/** Efek deklaratif: dipakai konten (event, aksi, kebiasaan) dan dibaca UI untuk menampilkan dampak. */
export interface Fx {
  attr?: Partial<Record<AttrKey, number>>;
  pop?: Partial<Record<Level, number>>;
  /** juta rupiah */
  money?: number;
  nation?: Partial<Record<NationKey, number>>;
  region?: Partial<Record<RegionKey, number>>;
  flags?: string[];
  unflags?: string[];
  /** hubungan dengan NPC yang terkait event */
  rel?: number;
  /** jadwalkan event di masa depan (bulan) */
  schedule?: { id: string; min: number; max: number; chance?: number }[];
  /** paparan skandal tersembunyi, tidak ditampilkan angkanya */
  heat?: number;
  /** modal politik (presiden) */
  capital?: number;
  /** kepuasan semua partai koalisi */
  coalition?: number;
  /** kedekatan dengan partai pemain */
  party?: number;
  /** momentum kampanye */
  momentum?: number;
  /** hubungan dengan semua negara */
  diplo?: number;
  jail?: number;
  end?: EndingId;
  /** petunjuk samar risiko jangka panjang, ditampilkan di UI */
  hint?: string;
}

export interface Cond {
  minAge?: number;
  maxAge?: number;
  /** jabatan yang sedang dipegang; 'none' = tidak menjabat */
  office?: (OfficeId | 'none')[];
  everOffice?: boolean;
  flags?: string[];
  notFlags?: string[];
  attrMin?: Partial<Record<AttrKey, number>>;
  attrMax?: Partial<Record<AttrKey, number>>;
  nationMin?: Partial<Record<NationKey, number>>;
  nationMax?: Partial<Record<NationKey, number>>;
  moneyMin?: number;
  moneyMax?: number;
  heatMin?: number;
  jobs?: string[];
  habits?: string[];
  campaign?: boolean;
  atWar?: boolean;
  student?: boolean;
  /** butuh NPC teman dengan peran ini; NPC itu jadi subjek event ($npc) */
  friendRole?: NpcRole[];
  inParty?: boolean;
}

export interface Outcome { chance: number; text: string; fx: Fx }

export interface Choice {
  label: string;
  need?: Cond;
  fx?: Fx;
  /** teks hasil jika tidak ada outcomes acak */
  result?: string;
  /** hasil acak; sisa peluang = hanya fx dasar */
  outcomes?: Outcome[];
}

export interface GameEvent {
  id: string;
  title: string;
  /** boleh memuat $npc */
  text: string;
  when?: Cond;
  /** bobot di kolam acak; 0/undefined = hanya lewat jadwal */
  weight?: number;
  once?: boolean;
  choices: Choice[];
}

export type NpcRole = 'pengusaha' | 'ulama' | 'jurnalis' | 'jenderal' | 'akademisi' | 'preman' | 'aktivis' | 'birokrat' | 'artis' | 'politisi';

export interface Npc {
  id: string;
  name: string;
  role: NpcRole;
  desc: string;
  influence: number;
  integrity: number;
  competence: number;
  loyalty: number;
  expertise: MinistryId;
  party: string | null;
  rel: number;
  met: boolean;
  /** ingatan: perlakuan pemain */
  memory: string[];
}

export interface Job {
  id: string;
  name: string;
  desc: string;
  /** juta/bulan di level 1 */
  income: number;
  growth: Partial<Record<AttrKey, number>>;
  pop: Partial<Record<Level, number>>;
  need?: { attr?: Partial<Record<AttrKey, number>>; majors?: string[]; degree?: boolean };
  heat?: number;
}

export interface Habit { id: string; name: string; desc: string; fx: Fx; cost?: number; good: boolean }

export interface Major { id: string; name: string; desc: string; growth: Partial<Record<AttrKey, number>> }
export interface Campus { id: string; name: string; desc: string; costPerMonth: number; quality: number; network: number; need?: Partial<Record<AttrKey, number>>; months: number }

export interface Party { id: string; name: string; short: string; ideology: string; color: string; seats: number; likes: string[]; hates: string[] }

export interface Policy {
  id: string;
  name: string;
  desc: string;
  tag: string;
  capital: number;
  /** pergeseran target statistik selama aktif */
  mods: Partial<Record<NationKey, number>>;
  /** biaya anggaran % PDB */
  cost: number;
  instant?: Fx;
  hint?: string;
}

export interface Country { id: string; name: string; desc: string; power: number; aggressive: number; color: string; pos: [number, number] }

export interface CampaignPromise { id: string; name: string; desc: string; levels: OfficeId[]; momentum: number }

export interface PromiseState { id: string; office: OfficeId; madeTurn: number; baseline: number; resolved?: 'tepati' | 'ingkar' }

export interface Opponent { name: string; party: string | null; strength: number }

export interface Campaign {
  office: OfficeId;
  turnsLeft: number;
  momentum: number;
  opponents: Opponent[];
  actionsLeft: number;
  round: 1 | 2;
  viaParty: boolean;
}

export interface ElectionResult {
  office: OfficeId;
  shares: { name: string; share: number; player: boolean }[];
  won: boolean;
  runoff: boolean;
}

export interface Region {
  kesejahteraan: number; infrastruktur: number; keamanan: number; layanan: number; kas: number; kepuasan: number;
}

export interface OfficeState {
  id: OfficeId;
  monthsLeft: number;
  terms: number;
  region: Region;
  lowMonths: number;
  programDone: boolean;
}

export interface Budget { pajak: number; belanja: Record<SectorKey, number> }

export interface Minister { npcId: string }

export interface CountryState { id: string; rel: number; dagang: boolean; aliansi: boolean; sanksi: boolean; power: number }

export interface War { enemy: string; progress: number; months: number; stance: 'serang' | 'bertahan'; lelah: number }

export interface Presidency {
  term: number;
  monthsLeft: number;
  capital: number;
  budget: Budget;
  cabinet: Partial<Record<MinistryId, string>>;
  coalition: Record<string, number>; // partyId -> kepuasan
  policies: string[];
  countries: CountryState[];
  war: War | null;
  baseline: Record<NationKey, number>;
  crisisMonths: number;
  diploDone: boolean;
  pool: Npc[]; // calon menteri non-teman
}

export interface Education {
  campus: string;
  major: string;
  monthsLeft: number;
  level: 'S1' | 'S2';
}

export interface Character {
  name: string;
  gender: 'L' | 'P';
  ageMonths: number;
  attr: Record<AttrKey, number>;
  pop: Record<Level, number>;
  money: number;
  job: string | null;
  jobLevel: number;
  jobMonths: number;
  habits: string[];
  plan: string[]; // 3 aksi bulanan
  degree: null | 'S1' | 'S2';
  major: string | null;
  campus: string | null;
  edu: Education | null;
  party: string | null;
  partyStanding: number;
  heat: number;
  jail: number;
  debtMonths: number;
  everOffice: OfficeId[];
  cooldown: number; // bulan sampai boleh nyalon lagi
}

export interface HistoryEntry { turn: number; age: number; text: string; kind: 'pilihan' | 'akibat' | 'tonggak' }

export interface Scheduled { id: string; due: number; npcId?: string; tries?: number }

export interface PendingEvent { id: string; npcId?: string; delayed?: boolean }

export interface EventResult { title: string; text: string; fx: Fx[] }

export interface Ending { id: EndingId; title: string; text: string; score: number; causes: string[] }

export type Phase = 'life' | 'ended';

export interface Gov { name: string; party: string | null; style: string; since: number; term: number }
export interface GovSnapshot { pdb: number; pertumbuhan: number; inflasi: number; pengangguran: number; kemiskinan: number; korupsi: number; utang: number; kebahagiaan: number }
export interface GovRecord { name: string; party: string | null; style: string; fromYear: number; toYear: number | null; terms: number; start: GovSnapshot; end: GovSnapshot | null; how: string | null; player: boolean }

export interface GameState {
  version: 1;
  seed: number;
  rng: number;
  turn: number;
  char: Character;
  npcs: Npc[];
  seats: Record<string, number>;
  office: OfficeState | null;
  campaign: Campaign | null;
  lastElection: ElectionResult | null;
  pres: Presidency | null;
  nation: Record<NationKey, number>;
  nationHist: Record<NationKey, number>[];
  aiBudget: Budget;
  /** presiden AI yang sedang menjabat (null bila pemain presiden) */
  gov: Gov | null;
  govHistory: GovRecord[];
  /** giliran pemilu presiden berikutnya */
  nextElection: number;
  flags: Record<string, number>;
  history: HistoryEntry[];
  scheduled: Scheduled[];
  promises: PromiseState[];
  pending: PendingEvent[];
  result: EventResult | null;
  seen: Record<string, number>;
  log: string[];
  socialLeft: number;
  ending: Ending | null;
}

export type Action =
  | { type: 'setPlan'; plan: string[] }
  | { type: 'setHabits'; habits: string[] }
  | { type: 'takeJob'; job: string }
  | { type: 'quitJob' }
  | { type: 'enroll'; campus: string; major: string }
  | { type: 'dropOut' }
  | { type: 'joinParty'; party: string }
  | { type: 'leaveParty' }
  | { type: 'npc'; npcId: string; act: 'akrab' | 'minta_dana' | 'minta_dukungan' | 'putus' }
  | { type: 'declare'; office: OfficeId; viaParty: boolean }
  | { type: 'campaignAct'; act: string; promise?: string }
  | { type: 'program'; program: string }
  | { type: 'choose'; index: number }
  | { type: 'dismissResult' }
  | { type: 'dismissElection' }
  | { type: 'setBudget'; budget: Budget }
  | { type: 'appoint'; ministry: MinistryId; npcId: string | null }
  | { type: 'coalition'; party: string; join: boolean }
  | { type: 'policy'; id: string; enact: boolean }
  | { type: 'diplo'; country: string; act: 'kunjungan' | 'dagang' | 'aliansi' | 'bantuan' | 'sanksi' | 'cabut_sanksi' | 'perang' }
  | { type: 'war'; act: 'serang' | 'bertahan' | 'damai' }
  | { type: 'resign' }
  | { type: 'next' };
