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
  | 'tokoh_daerah' | 'warga_biasa' | 'revolusi' | 'pensiun';

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
  /** rasa sayang pasangan */
  love?: number;
  /** pasangan pergi (putus/cerai) */
  endPartner?: boolean;
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
  /** tahap hubungan asmara; 'none' = tidak punya pasangan */
  partner?: (PartnerStage | 'none')[];
  kids?: boolean;
  /** anggota salah satu organisasi ini */
  orgs?: string[];
  research?: boolean;
  abroad?: boolean;
  housing?: string[];
  city?: CityTier[];
  /** sedang kuliah di jenjang ini */
  eduLevel?: DegreeLevel[];
  degreeMin?: DegreeLevel;
  langMin?: number;
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
  need?: { attr?: Partial<Record<AttrKey, number>>; majors?: string[]; degree?: boolean; level?: DegreeLevel; maxAge?: number; capital?: number };
  heat?: number;
  /** kelompok untuk tampilan */
  group: string;
  /** kota tempat pekerjaan ini ada; kosong = semua kota di dalam negeri kecuali desa */
  where?: CityTier[];
  /** bisa dikerjakan di luar negeri */
  abroadOk?: boolean;
  /** penghasilan naik-turun (0 = tetap) */
  volatile?: number;
  /** nama jenjang khusus (5 tingkat) */
  ranks?: string[];
  /** syarat naik ke jenjang tertentu */
  gate?: { level: number; degree?: DegreeLevel; pubs?: number; note: string }[];
}

export interface Habit { id: string; name: string; desc: string; fx: Fx; cost?: number; good: boolean }

export interface Major { id: string; name: string; desc: string; growth: Partial<Record<AttrKey, number>>; research: boolean; topics: string[] }
export interface Campus {
  id: string; name: string; desc: string; costPerMonth: number; quality: number; network: number; need?: Partial<Record<AttrKey, number>>; months: number;
  city: CityTier;
  /** skor tes bahasa Inggris minimum (skala 0-9) */
  lang?: number;
  abroad?: boolean;
  /** jenjang yang dibuka */
  levels: DegreeLevel[];
  /** program kelas internasional: setahun di kampus mitra luar negeri */
  iup?: boolean;
}

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

export type DegreeLevel = 'S1' | 'S2' | 'S3';
export type CityTier = 'desa' | 'kabupaten' | 'provinsi' | 'pelajar' | 'ibukota' | 'atlantika' | 'australis' | 'temasik' | 'tiongkara';
export type HousingId = 'ortu' | 'kos' | 'kontrakan' | 'apartemen' | 'rumah' | 'asrama';
export type PartnerStage = 'pdkt' | 'pacaran' | 'tunangan' | 'menikah';

export interface Education {
  campus: string;
  major: string;
  monthsLeft: number;
  /** total lama studi (untuk progres) */
  total: number;
  level: DegreeLevel;
  /** IPK berjalan 0-4 */
  gpa: number;
  /** beasiswa yang membiayai (id) */
  funding: string | null;
  /** IUP / pertukaran: kota luar negeri dan bulan berangkat-pulang (sisa monthsLeft) */
  away?: { city: CityTier; from: number; to: number; kind: 'iup' | 'pertukaran' };
  /** berapa kali masa studi diperpanjang */
  ext: number;
  /** jumlah publikasi saat mulai studi */
  pubs0: number;
}

export interface Home {
  city: CityTier;
  housing: HousingId;
  addr: string;
  /** nama tempat: desa asal, kabupaten, provinsi */
  /** nama tempat; kabId/provCityId merujuk kota di peta (content/geo.ts) */
  names: { desa: string; kab: string; prov: string; provName?: string; kabId?: string; provCityId?: string; kec?: string };
  hometown: CityTier;
  house: { city: CityTier; value: number; addr: string } | null;
  kpr: { left: number; monthly: number } | null;
  /** tempat tinggal sebelum berangkat IUP/pertukaran */
  back?: { city: CityTier; housing: HousingId; addr: string };
}

export interface OrgMember { id: string; role: 0 | 1 | 2; months: number }

export interface Research { topic: string; major: string; scope: 'kecil' | 'besar'; progress: number; need: number; quality: number; fabricated?: boolean }
export interface Publication { title: string; venue: 'nasional' | 'internasional'; year: number }

export interface CompEntry { id: string; intl: boolean; monthsLeft: number; prep: number }

export interface Partner {
  name: string;
  gender: 'L' | 'P';
  age: number;
  job: string;
  trait: string;
  /** juta/bulan */
  income: number;
  stage: PartnerStage;
  love: number;
  months: number;
  /** kecocokan -10..10, tersembunyi */
  fit: number;
  since: number;
  city: CityTier;
}
export interface Prospect { name: string; gender: 'L' | 'P'; age: number; job: string; trait: string; income: number; fit: number; via: string }
export interface Child { name: string; gender: 'L' | 'P'; born: number }

export interface BallotCand { name: string; party: string | null; style: string; incumbent: boolean; base: number }
export interface Ballot { cands: BallotCand[] }

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
  /** rencana lama (slot); diganti `time` */
  plan: string[];
  /** jam per minggu untuk tiap kegiatan */
  time: Record<string, number>;
  /** jam tidur per malam */
  sleep: number;
  degree: null | DegreeLevel;
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
  /** cita-cita hidup */
  aspiration: string;
  home: Home;
  /** kemampuan bahasa Inggris 0-100 */
  lang: number;
  /** skor tes bahasa terakhir (skala 0-9) */
  langTest: { score: number; turn: number } | null;
  /** IPK kelulusan terakhir */
  gpa: number | null;
  /** beasiswa yang sudah didapat tapi belum dipakai */
  scholarship: { id: string; level: DegreeLevel; turn: number } | null;
  orgs: OrgMember[];
  research: Research | null;
  pubs: Publication[];
  comp: CompEntry | null;
  awards: string[];
  partner: Partner | null;
  prospect: Prospect | null;
  exes: string[];
  children: Child[];
  wantKids: boolean;
  parents: number;
  parentAge: number;
  votes: number;
  /** bulan sampai boleh mencari jodoh lagi */
  loveLeft: number;
  /** uang pensiun juta/bulan */
  pension: number;
  /** keuangan orang tua: tabungan keluarga, uang saku bulanan, dan kemampuan bayar kuliah per bulan (juta) */
  family: { fund: number; allowance: number; tuitionCap: number; asked: number };
  /** rincian arus uang bulan terakhir (juta; + masuk, - keluar) */
  ledger: Record<string, number>;
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
  /** statistik kota/kabupaten; provinsi & nasional adalah agregatnya (lihat sim/regions.ts) */
  regions?: import('./regions').RegionState;
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
  ballot: Ballot | null;
}

export type Action =
  | { type: 'setPlan'; plan: string[] }
  | { type: 'setTime'; time: Record<string, number>; sleep: number }
  | { type: 'setHabits'; habits: string[] }
  | { type: 'takeJob'; job: string }
  | { type: 'quitJob' }
  | { type: 'enroll'; campus: string; major: string; scholarship?: string }
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
  | { type: 'move'; city: CityTier; housing: HousingId }
  | { type: 'buyHouse'; kpr: boolean }
  | { type: 'sellHouse' }
  | { type: 'langTest' }
  | { type: 'askParents' }
  | { type: 'applyScholarship'; id: string }
  | { type: 'exchange' }
  | { type: 'startResearch'; topic: string; scope: 'kecil' | 'besar' }
  | { type: 'dropResearch' }
  | { type: 'joinOrg'; id: string }
  | { type: 'leaveOrg'; id: string }
  | { type: 'runOrg'; id: string }
  | { type: 'enterComp'; id: string; intl: boolean }
  | { type: 'findLove'; via: string }
  | { type: 'love'; act: 'dekati' | 'abaikan' | 'kencan' | 'tembak' | 'lamar' | 'putus' | 'nikah'; size?: 'sederhana' | 'sedang' | 'mewah' }
  | { type: 'wantKids'; on: boolean }
  | { type: 'vote'; index: number; party: string | null; endorse: boolean }
  | { type: 'next' };
