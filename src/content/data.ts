import type { Budget, Job, Habit, Major, Campus, Party, Policy, Country, CampaignPromise, MinistryId, OfficeId, Level, Fx, AttrKey, SectorKey, NationKey, RegionKey } from '../sim/types';

// ---------- Latar keluarga ----------
export interface Background { id: string; name: string; desc: string; money: number; attr: Partial<Record<AttrKey, number>>; flags: string[] }
export const BACKGROUNDS: Background[] = [
  { id: 'petani', name: 'Anak petani desa', desc: 'Hidup pas-pasan, tapi dikenal dan dipercaya warga kampung.', money: 5, attr: { integritas: 8, kesehatan: 8, jaringan: -8 }, flags: ['latar:petani'] },
  { id: 'menengah', name: 'Keluarga pegawai', desc: 'Cukup untuk sekolah, tanpa koneksi istimewa.', money: 40, attr: { kecerdasan: 5 }, flags: ['latar:menengah'] },
  { id: 'pengusaha', name: 'Anak pengusaha', desc: 'Modal besar dan kenalan bisnis, tapi dianggap jauh dari rakyat.', money: 400, attr: { jaringan: 10, integritas: -5, karisma: 3 }, flags: ['latar:kaya'] },
  { id: 'dinasti', name: 'Dinasti politik', desc: 'Nama besar keluarga membuka pintu partai, sekaligus membawa musuh lama.', money: 250, attr: { jaringan: 18, karisma: 5, integritas: -8 }, flags: ['latar:dinasti'] },
  { id: 'santri', name: 'Keluarga pesantren', desc: 'Dihormati kalangan religius, jaringan ulama luas.', money: 15, attr: { integritas: 10, karisma: 5, jaringan: 4 }, flags: ['latar:santri'] },
];

// ---------- Pendidikan ----------
export const MAJORS: Major[] = [
  { id: 'hukum', name: 'Hukum', desc: 'Jalan ke pengacara, jaksa, dan pembuat undang-undang.', growth: { kecerdasan: 0.35, karisma: 0.15 } },
  { id: 'ekonomi', name: 'Ekonomi & Bisnis', desc: 'Paham uang, pasar, dan anggaran.', growth: { kecerdasan: 0.35, jaringan: 0.15 } },
  { id: 'teknik', name: 'Teknik', desc: 'Insinyur pembangun; kuat di infrastruktur.', growth: { kecerdasan: 0.45 } },
  { id: 'kedokteran', name: 'Kedokteran', desc: 'Lama dan berat, tapi dokter selalu dihormati.', growth: { kecerdasan: 0.45, integritas: 0.1, stres: 0.25 } },
  { id: 'pendidikan', name: 'Keguruan', desc: 'Mendidik generasi; dekat dengan warga.', growth: { kecerdasan: 0.25, integritas: 0.15, karisma: 0.1 } },
  { id: 'pertanian', name: 'Pertanian', desc: 'Ilmu pangan dan desa.', growth: { kecerdasan: 0.25, kesehatan: 0.1, integritas: 0.1 } },
  { id: 'politik', name: 'Ilmu Politik', desc: 'Organisasi kampus, debat, dan jaringan aktivis.', growth: { karisma: 0.35, jaringan: 0.25, kecerdasan: 0.15 } },
  { id: 'komunikasi', name: 'Komunikasi', desc: 'Media, citra, dan cara bicara ke publik.', growth: { karisma: 0.45, jaringan: 0.15 } },
  { id: 'militer', name: 'Ilmu Militer', desc: 'Hanya di Akademi Militer. Disiplin dan komando.', growth: { kesehatan: 0.3, karisma: 0.2, kecerdasan: 0.15 } },
];

export const CAMPUSES: Campus[] = [
  { id: 'negeri_favorit', name: 'Universitas Nagari (negeri favorit)', desc: 'Seleksi ketat, biaya ringan, alumni menguasai birokrasi dan partai.', costPerMonth: 2, quality: 1.3, network: 1.4, need: { kecerdasan: 58 }, months: 48 },
  { id: 'negeri_daerah', name: 'Universitas Negeri Daerah', desc: 'Dekat rumah, murah, jaringan lokal.', costPerMonth: 1.5, quality: 1.0, network: 0.8, need: { kecerdasan: 42 }, months: 48 },
  { id: 'swasta', name: 'Universitas Swasta Kota', desc: 'Siapa saja bisa masuk asal sanggup bayar.', costPerMonth: 6, quality: 0.9, network: 1.0, months: 48 },
  { id: 'luar_negeri', name: 'Kampus luar negeri', desc: 'Mahal sekali atau beasiswa (kecerdasan 75+). Gengsi nasional, tapi jauh dari akar rumput.', costPerMonth: 30, quality: 1.5, network: 1.2, months: 48 },
  { id: 'akmil', name: 'Akademi Militer', desc: 'Gratis, fisik berat. Otomatis jurusan militer dan ikatan dinas tentara.', costPerMonth: 0, quality: 1.1, network: 1.2, need: { kesehatan: 65 }, months: 48 },
  { id: 'kedinasan', name: 'Sekolah Kedinasan', desc: 'Gratis, langsung jadi PNS setelah lulus.', costPerMonth: 0, quality: 1.0, network: 1.0, need: { kecerdasan: 55 }, months: 48 },
];
export const S2_MONTHS = 24;

// ---------- Pekerjaan ----------
export const JOBS: Job[] = [
  { id: 'buruh', name: 'Buruh pabrik', desc: 'Kerja keras, upah kecil, solidaritas serikat.', income: 3.5, growth: { kesehatan: -0.03, stres: 0.1 }, pop: { desa: 0.05 } },
  { id: 'petani', name: 'Petani', desc: 'Akar rumput sejati. Penghasilan kecil, dicintai desa.', income: 3, growth: { kesehatan: 0.05, integritas: 0.03 }, pop: { desa: 0.2 } },
  { id: 'pedagang', name: 'Pedagang', desc: 'Kenal semua orang di pasar.', income: 6, growth: { jaringan: 0.12, karisma: 0.05 }, pop: { desa: 0.1, kabupaten: 0.05 } },
  { id: 'guru', name: 'Guru', desc: 'Dihormati orang tua murid satu kecamatan.', income: 5, growth: { kecerdasan: 0.08, integritas: 0.05 }, pop: { desa: 0.15, kabupaten: 0.06 }, need: { degree: true, majors: ['pendidikan', 'pertanian', 'politik', 'komunikasi', 'ekonomi', 'hukum', 'teknik'] } },
  { id: 'pns', name: 'Pegawai negeri', desc: 'Stabil, paham birokrasi dari dalam.', income: 7, growth: { kecerdasan: 0.05, jaringan: 0.08 }, pop: { kabupaten: 0.05 }, need: { degree: true } },
  { id: 'tentara', name: 'Tentara', desc: 'Disiplin, wibawa, dan jaringan komando.', income: 7, growth: { kesehatan: 0.1, karisma: 0.08 }, pop: { kabupaten: 0.04, nasional: 0.02 }, need: { attr: { kesehatan: 60 } } },
  { id: 'pengacara', name: 'Pengacara', desc: 'Uang bagus, pandai bicara, kenal aparat hukum.', income: 14, growth: { kecerdasan: 0.08, karisma: 0.1, jaringan: 0.08 }, pop: { kabupaten: 0.05, provinsi: 0.03 }, need: { degree: true, majors: ['hukum'] } },
  { id: 'jurnalis', name: 'Jurnalis', desc: 'Tahu rahasia banyak orang; namamu dikenal pembaca.', income: 6, growth: { kecerdasan: 0.08, jaringan: 0.1 }, pop: { provinsi: 0.06, nasional: 0.05 }, need: { attr: { kecerdasan: 50 } } },
  { id: 'aktivis', name: 'Aktivis LSM', desc: 'Miskin tapi lantang. Dicintai rakyat, dibenci pejabat.', income: 3, growth: { karisma: 0.12, integritas: 0.08, stres: 0.08 }, pop: { kabupaten: 0.1, provinsi: 0.06, nasional: 0.04 } },
  { id: 'dokter', name: 'Dokter', desc: 'Penghasilan tinggi dan kepercayaan warga.', income: 18, growth: { kecerdasan: 0.06, integritas: 0.04, stres: 0.1 }, pop: { desa: 0.12, kabupaten: 0.1 }, need: { degree: true, majors: ['kedokteran'] } },
  { id: 'insinyur', name: 'Insinyur', desc: 'Membangun jalan dan pabrik; gaji layak.', income: 12, growth: { kecerdasan: 0.1 }, pop: { kabupaten: 0.03 }, need: { degree: true, majors: ['teknik'] } },
  { id: 'dosen', name: 'Dosen', desc: 'Pakar yang sering diundang media. Butuh S2.', income: 9, growth: { kecerdasan: 0.15, karisma: 0.04 }, pop: { provinsi: 0.05, nasional: 0.04 }, need: { degree: true, attr: { kecerdasan: 65 } } },
  { id: 'pengusaha', name: 'Pengusaha', desc: 'Butuh modal 200 juta. Untung besar, godaan besar.', income: 25, growth: { jaringan: 0.15, integritas: -0.04, stres: 0.1 }, pop: { kabupaten: 0.04, provinsi: 0.03 }, need: { attr: { jaringan: 45 } }, heat: 0.05 },
  { id: 'influencer', name: 'Selebritas media sosial', desc: 'Terkenal se-Nagari, dianggap tak serius oleh elite.', income: 8, growth: { karisma: 0.15, kecerdasan: -0.03 }, pop: { nasional: 0.22, provinsi: 0.1 }, need: { attr: { karisma: 60 } } },
  { id: 'staf_partai', name: 'Staf partai', desc: 'Kerja di dapur politik. Harus anggota partai.', income: 5, growth: { jaringan: 0.18, karisma: 0.05, integritas: -0.03 }, pop: { kabupaten: 0.04 }, need: {} },
];
export const JOB_LEVEL_MULT = [1, 1.6, 2.6, 4.2, 6.5];
export const JOB_LEVEL_NAMES = ['pemula', 'berpengalaman', 'senior', 'pimpinan', 'tokoh puncak'];

// ---------- Aksi bulanan ----------
export interface PlanAction { id: string; name: string; desc: string; fx: Fx; need?: 'job' | 'party' | 'money' }
export const PLAN_ACTIONS: PlanAction[] = [
  { id: 'kerja_keras', name: 'Kerja keras', desc: 'Lembur dan ambil pekerjaan tambahan di kantor.', fx: { attr: { stres: 1.2 } }, need: 'job' },
  { id: 'belajar', name: 'Belajar', desc: 'Baca, kursus, diskusi.', fx: { attr: { kecerdasan: 0.35, stres: 0.2 } } },
  { id: 'sosialisasi', name: 'Bergaul', desc: 'Datang ke acara, kenalan dengan orang baru.', fx: { attr: { jaringan: 0.35, karisma: 0.1 }, money: -0.5 } },
  { id: 'blusukan', name: 'Kegiatan warga', desc: 'Gotong royong, hadir di hajatan, ikut rapat RT.', fx: { pop: { desa: 0.5, kabupaten: 0.15 }, attr: { karisma: 0.1 } } },
  { id: 'istirahat', name: 'Istirahat', desc: 'Tidur cukup, libur, tidak memikirkan apa-apa.', fx: { attr: { stres: -2.5, kesehatan: 0.3 } } },
  { id: 'usaha', name: 'Usaha sampingan', desc: 'Jualan kecil-kecilan di luar pekerjaan utama.', fx: { attr: { stres: 0.5, jaringan: 0.05 } } },
  { id: 'partai', name: 'Kegiatan partai', desc: 'Rapat, kaderisasi, bantu acara partai.', fx: { party: 0.8, attr: { jaringan: 0.15, stres: 0.3 } }, need: 'party' },
  { id: 'citra', name: 'Olah citra media', desc: 'Bayar 2 juta/bulan untuk tampil di media.', fx: { money: -2, pop: { provinsi: 0.25, nasional: 0.2 } }, need: 'money' },
];

// ---------- Kebiasaan ----------
export const HABITS: Habit[] = [
  { id: 'olahraga', name: 'Olahraga rutin', desc: 'Badan bugar, stres turun.', fx: { attr: { kesehatan: 0.25, stres: -0.5 } }, good: true },
  { id: 'membaca', name: 'Membaca buku', desc: 'Wawasan bertambah terus.', fx: { attr: { kecerdasan: 0.2 } }, good: true },
  { id: 'ibadah', name: 'Taat beribadah', desc: 'Hati tenang, dipercaya kalangan religius.', fx: { attr: { integritas: 0.12, stres: -0.4 } }, good: true },
  { id: 'bangun_pagi', name: 'Bangun pagi', desc: 'Disiplin kecil yang menumpuk.', fx: { attr: { kesehatan: 0.1, kecerdasan: 0.06, stres: -0.15 } }, good: true },
  { id: 'menabung', name: 'Menabung & investasi', desc: 'Uang bekerja untukmu (bunga dari tabungan).', fx: {}, good: true },
  { id: 'menulis', name: 'Menulis opini', desc: 'Namamu muncul di koran dan media daring.', fx: { attr: { kecerdasan: 0.08 }, pop: { provinsi: 0.08, nasional: 0.08 } }, good: true },
  { id: 'relawan', name: 'Jadi relawan', desc: 'Turun tangan saat warga susah.', fx: { attr: { integritas: 0.1 }, pop: { desa: 0.2, kabupaten: 0.08 } }, good: true },
  { id: 'nongkrong', name: 'Nongkrong di warung kopi', desc: 'Kenal semua orang, tapi waktu habis.', fx: { attr: { jaringan: 0.2, kecerdasan: -0.05 }, money: -0.3 }, good: true },
  { id: 'medsos', name: 'Aktif di media sosial', desc: 'Pengikut bertambah, begitu pula pembenci.', fx: { attr: { stres: 0.3 }, pop: { nasional: 0.12, provinsi: 0.06 } }, good: true },
  { id: 'begadang', name: 'Begadang', desc: 'Waktu lebih banyak, badan lebih rusak.', fx: { attr: { kesehatan: -0.25, jaringan: 0.08, stres: 0.2 } }, good: false },
  { id: 'merokok', name: 'Merokok', desc: 'Teman ngobrol di pos ronda. Paru-paru menagih nanti.', fx: { attr: { kesehatan: -0.3, jaringan: 0.06, stres: -0.2 }, money: -0.4 }, good: false },
  { id: 'judi', name: 'Berjudi', desc: 'Kadang menang besar. Biasanya tidak.', fx: { attr: { stres: 0.3, integritas: -0.15 }, heat: 0.15 }, good: false },
  { id: 'foya', name: 'Hidup mewah', desc: 'Tampil wah; disegani sebagian, dicibir sebagian.', fx: { attr: { karisma: 0.12, jaringan: 0.12, integritas: -0.08 }, pop: { desa: -0.1 } }, good: false },
  { id: 'minum', name: 'Mabuk-mabukan', desc: 'Akrab dengan orang-orang tertentu. Hati dan nama baik rusak.', fx: { attr: { kesehatan: -0.3, jaringan: 0.1, integritas: -0.1, stres: -0.3 }, money: -0.8, heat: 0.08 }, good: false },
  { id: 'dukun', name: 'Rajin ke orang pintar', desc: 'Percaya diri naik. Kalau ketahuan, jadi bahan tertawaan.', fx: { attr: { stres: -0.5, kecerdasan: -0.05 }, money: -1, heat: 0.03 }, good: false },
];
export const HABIT_SLOTS = 3;

// ---------- Partai ----------
export const PARTIES: Party[] = [
  { id: 'pbn', name: 'Partai Banteng Nagari', short: 'PBN', ideology: 'Nasionalis', color: '#c0392b', seats: 28, likes: ['nasionalis', 'rakyat'], hates: ['liberal'] },
  { id: 'pku', name: 'Partai Kebangkitan Umat', short: 'PKU', ideology: 'Religius', color: '#1e8449', seats: 22, likes: ['religius', 'rakyat'], hates: ['liberal', 'otoriter'] },
  { id: 'pkr', name: 'Partai Karya Raya', short: 'PKR', ideology: 'Pembangunan & bisnis', color: '#d4ac0d', seats: 24, likes: ['bisnis', 'otoriter'], hates: ['hijau', 'rakyat'] },
  { id: 'pbt', name: 'Partai Buruh Tani', short: 'PBT', ideology: 'Kerakyatan', color: '#d35400', seats: 16, likes: ['rakyat', 'reformis'], hates: ['bisnis'] },
  { id: 'phm', name: 'Partai Hijau Muda', short: 'PHM', ideology: 'Reformis & lingkungan', color: '#2e86c1', seats: 10, likes: ['hijau', 'reformis', 'liberal'], hates: ['otoriter', 'nasionalis'] },
];

// ---------- Jabatan ----------
export interface OfficeDef { id: OfficeId; name: string; level: Level; minAge: number; term: number; fee: number; adCost: number; campaignTurns: number; partyStanding: number; indepPop: number; salary: number; difficulty: number }
export const OFFICES: OfficeDef[] = [
  { id: 'kades', name: 'Kepala Desa', level: 'desa', minAge: 21, term: 36, fee: 15, adCost: 5, campaignTurns: 3, partyStanding: 0, indepPop: 0, salary: 6, difficulty: 30 },
  { id: 'bupati', name: 'Bupati', level: 'kabupaten', minAge: 25, term: 48, fee: 150, adCost: 50, campaignTurns: 4, partyStanding: 30, indepPop: 35, salary: 40, difficulty: 42 },
  { id: 'gubernur', name: 'Gubernur', level: 'provinsi', minAge: 30, term: 48, fee: 900, adCost: 260, campaignTurns: 5, partyStanding: 45, indepPop: 35, salary: 100, difficulty: 50 },
  { id: 'presiden', name: 'Presiden', level: 'nasional', minAge: 35, term: 60, fee: 4500, adCost: 1200, campaignTurns: 6, partyStanding: 60, indepPop: 30, salary: 150, difficulty: 56 },
];
export const officeDef = (id: OfficeId) => OFFICES.find(o => o.id === id)!;

// ---------- Program daerah ----------
export interface Program { id: string; name: string; desc: string; cost: number; fx: Fx }
export const PROGRAMS: Program[] = [
  { id: 'infra', name: 'Bangun jalan & irigasi', desc: 'Infrastruktur naik.', cost: 12, fx: { region: { infrastruktur: 3, kepuasan: 1 } } },
  { id: 'bansos', name: 'Bantuan untuk warga miskin', desc: 'Kesejahteraan naik cepat.', cost: 10, fx: { region: { kesejahteraan: 2.5, kepuasan: 1.5 } } },
  { id: 'aman', name: 'Tertibkan keamanan', desc: 'Ronda, CCTV, kerja sama polisi.', cost: 8, fx: { region: { keamanan: 3, kepuasan: 0.8 } } },
  { id: 'layanan', name: 'Benahi layanan publik', desc: 'Puskesmas, sekolah, perizinan.', cost: 10, fx: { region: { layanan: 3, kepuasan: 1 } } },
  { id: 'pad', name: 'Genjot pendapatan daerah', desc: 'Pajak dan retribusi naik; warga menggerutu.', cost: 0, fx: { region: { kas: 18, kepuasan: -1.5 } } },
  { id: 'pencitraan', name: 'Acara seremonial & baliho', desc: 'Kepuasan naik sebentar, kas terkuras.', cost: 10, fx: { region: { kepuasan: 3 }, pop: { provinsi: 0.3, nasional: 0.15 } } },
  { id: 'titipan', name: 'Proyek titipan (mark-up)', desc: 'Sebagian anggaran masuk kantong sendiri.', cost: 15, fx: { region: { infrastruktur: 0.8 }, heat: 5, attr: { integritas: -1.5 }, flags: ['korupsi_proyek'], hint: 'Auditor dan wartawan punya ingatan panjang.' } },
  { id: 'hemat', name: 'Tidak ada program (hemat kas)', desc: 'Kas bertambah dari anggaran rutin.', cost: 0, fx: { region: { kas: 6, kepuasan: -0.4 } } },
];

// ---------- Janji kampanye ----------
export const PROMISES: CampaignPromise[] = [
  { id: 'jalan_mulus', name: 'Jalan mulus sampai pelosok', desc: 'Infrastruktur wilayah harus naik 15 poin sampai akhir jabatan.', levels: ['kades', 'bupati', 'gubernur'], momentum: 7 },
  { id: 'warga_sejahtera', name: 'Tak ada lagi warga kelaparan', desc: 'Kesejahteraan wilayah harus naik 12 poin.', levels: ['kades', 'bupati', 'gubernur'], momentum: 7 },
  { id: 'kampung_aman', name: 'Wilayah bebas begal', desc: 'Keamanan wilayah harus naik 12 poin.', levels: ['kades', 'bupati', 'gubernur'], momentum: 6 },
  { id: 'layanan_gratis', name: 'Berobat dan sekolah gratis', desc: 'Layanan publik wilayah harus naik 12 poin.', levels: ['bupati', 'gubernur'], momentum: 7 },
  { id: 'sekolah_gratis', name: 'Sekolah gratis sampai kuliah', desc: 'Indeks pendidikan nasional harus naik 8 poin.', levels: ['presiden'], momentum: 7 },
  { id: 'lapangan_kerja', name: 'Sepuluh juta lapangan kerja', desc: 'Pengangguran harus turun 1,5 poin persen.', levels: ['presiden'], momentum: 8 },
  { id: 'berantas_korupsi', name: 'Sikat koruptor tanpa pandang bulu', desc: 'Indeks korupsi harus turun 10 poin.', levels: ['presiden'], momentum: 8 },
  { id: 'harga_murah', name: 'Harga sembako murah', desc: 'Inflasi harus di bawah 4% saat masa jabatan berakhir.', levels: ['presiden'], momentum: 7 },
  { id: 'ekonomi_meroket', name: 'Ekonomi meroket', desc: 'PDB harus tumbuh 30% dalam satu periode.', levels: ['presiden'], momentum: 9 },
];

// ---------- Kementerian ----------
export const MINISTRIES: { id: MinistryId; name: string; affects: string }[] = [
  { id: 'keuangan', name: 'Menteri Keuangan', affects: 'Pertumbuhan, inflasi, utang' },
  { id: 'pendidikan', name: 'Menteri Pendidikan', affects: 'Pendidikan' },
  { id: 'kesehatan', name: 'Menteri Kesehatan', affects: 'Kesehatan' },
  { id: 'pu', name: 'Menteri Pekerjaan Umum', affects: 'Infrastruktur' },
  { id: 'pertahanan', name: 'Menteri Pertahanan', affects: 'Militer, risiko kudeta' },
  { id: 'hukum', name: 'Menteri Hukum & Keamanan', affects: 'Kriminalitas, korupsi' },
  { id: 'luar_negeri', name: 'Menteri Luar Negeri', affects: 'Hubungan antarnegara' },
  { id: 'sosial', name: 'Menteri Sosial & Tenaga Kerja', affects: 'Kemiskinan, pengangguran' },
];

// ---------- Kebijakan / UU ----------
export const POLICIES: Policy[] = [
  { id: 'subsidi_bbm', name: 'Subsidi BBM besar-besaran', desc: 'Harga murah hari ini, anggaran jebol besok.', tag: 'rakyat', capital: 10, cost: 1.6, mods: { inflasi: -1.2, kebahagiaan: 5, lingkungan: -6, approval: 5 } },
  { id: 'sekolah_gratis', name: 'Wajib belajar 12 tahun gratis', desc: 'Mahal, hasilnya baru terasa bertahun-tahun kemudian.', tag: 'rakyat', capital: 20, cost: 1.0, mods: { pendidikan: 12, kemiskinan: -1, kriminalitas: -3 } },
  { id: 'jaminan_kesehatan', name: 'Jaminan kesehatan semesta', desc: 'Semua warga berobat gratis.', tag: 'rakyat', capital: 22, cost: 1.2, mods: { kesehatan: 14, kebahagiaan: 4, kemiskinan: -1 } },
  { id: 'kpk_kuat', name: 'Perkuat komisi antikorupsi', desc: 'Korupsi turun; elite (termasuk koalisimu) gelisah.', tag: 'reformis', capital: 30, cost: 0.1, mods: { korupsi: -16, pertumbuhan: 0.2 }, instant: { coalition: -8 }, hint: 'Komisi yang kuat juga bisa memeriksa presidennya.' },
  { id: 'kpk_lemah', name: 'Lemahkan komisi antikorupsi', desc: 'Elite senang, kamu aman dari penyidikan. Rakyat marah.', tag: 'otoriter', capital: 15, cost: 0, mods: { korupsi: 14, approval: -6 }, instant: { coalition: 10, heat: -25, flags: ['lemahkan_kpk'] }, hint: 'Sejarah akan mencatat ini.' },
  { id: 'hilirisasi', name: 'Hilirisasi tambang', desc: 'Larang ekspor mentah, bangun smelter.', tag: 'nasionalis', capital: 20, cost: 0.4, mods: { pertumbuhan: 0.7, pengangguran: -0.6, lingkungan: -8 }, instant: { diplo: -6 } },
  { id: 'moratorium_hutan', name: 'Moratorium tebang hutan', desc: 'Hutan pulih, pengusaha sawit dan tambang melawan.', tag: 'hijau', capital: 18, cost: 0.1, mods: { lingkungan: 16, pertumbuhan: -0.3 } },
  { id: 'upah_naik', name: 'Naikkan upah minimum 20%', desc: 'Buruh bersorak, pabrik mengancam hengkang.', tag: 'rakyat', capital: 14, cost: 0, mods: { kemiskinan: -1.5, pengangguran: 0.8, inflasi: 0.5, kebahagiaan: 3 } },
  { id: 'pajak_progresif', name: 'Pajak tinggi untuk orang kaya', desc: 'Kas negara bertambah, modal sebagian kabur.', tag: 'rakyat', capital: 22, cost: -1.0, mods: { pertumbuhan: -0.3, kemiskinan: -0.5 } },
  { id: 'tax_amnesty', name: 'Pengampunan pajak', desc: 'Uang gelap masuk kas; rasa keadilan terluka.', tag: 'bisnis', capital: 12, cost: -0.6, mods: { korupsi: 4, pertumbuhan: 0.2 } },
  { id: 'omnibus', name: 'UU sapu jagat investasi', desc: 'Izin dipermudah, perlindungan buruh dan lingkungan dipangkas.', tag: 'bisnis', capital: 25, cost: 0, mods: { pertumbuhan: 0.9, pengangguran: -0.8, lingkungan: -7, kebahagiaan: -3, approval: -4 } },
  { id: 'wajib_militer', name: 'Wajib militer', desc: 'Kekuatan cadangan besar; anak muda tidak suka.', tag: 'nasionalis', capital: 18, cost: 0.5, mods: { militer: 14, kebahagiaan: -3, kriminalitas: -2 } },
  { id: 'hukuman_berat', name: 'Hukuman mati bandar narkoba', desc: 'Tegas dan populer; dikecam dunia.', tag: 'otoriter', capital: 10, cost: 0, mods: { kriminalitas: -6, approval: 3 }, instant: { diplo: -8 } },
  { id: 'sensor_media', name: 'UU ketertiban informasi', desc: 'Kritik bisa dipidana. Berita buruk berkurang, begitu pula kebebasan.', tag: 'otoriter', capital: 22, cost: 0, mods: { stabilitas: 6, korupsi: 6, kebahagiaan: -4 }, instant: { flags: ['bungkam_pers'], diplo: -5 }, hint: 'Yang dibungkam tidak hilang; hanya menunggu.' },
  { id: 'otonomi', name: 'Otonomi daerah luas', desc: 'Daerah lebih mandiri; raja-raja kecil bermunculan.', tag: 'reformis', capital: 15, cost: 0.2, mods: { stabilitas: 4, korupsi: 4, infrastruktur: 4 } },
  { id: 'ibu_kota', name: 'Pindahkan ibu kota', desc: 'Megaproyek warisan. Mahal sekali.', tag: 'nasionalis', capital: 30, cost: 1.5, mods: { infrastruktur: 10, pertumbuhan: 0.4, lingkungan: -5 }, hint: 'Megaproyek bisa jadi monumen, bisa jadi kota hantu.' },
  { id: 'swasembada', name: 'Swasembada pangan', desc: 'Cetak sawah, subsidi pupuk.', tag: 'nasionalis', capital: 14, cost: 0.6, mods: { inflasi: -0.8, kemiskinan: -1, lingkungan: -4 } },
  { id: 'digitalisasi', name: 'Birokrasi digital', desc: 'Layanan cepat, pungli berkurang.', tag: 'reformis', capital: 16, cost: 0.3, mods: { korupsi: -7, pertumbuhan: 0.3 } },
  { id: 'bansos', name: 'Bantuan tunai langsung', desc: 'Kemiskinan turun cepat; mahal dan rawan dipolitisasi.', tag: 'rakyat', capital: 10, cost: 1.0, mods: { kemiskinan: -3, kebahagiaan: 4, approval: 4, inflasi: 0.4 } },
  { id: 'energi_hijau', name: 'Transisi energi bersih', desc: 'Investasi besar untuk udara bersih.', tag: 'hijau', capital: 20, cost: 0.8, mods: { lingkungan: 12, kesehatan: 3, pertumbuhan: 0.1 }, instant: { diplo: 5 } },
  { id: 'pasar_bebas', name: 'Buka pasar seluas-luasnya', desc: 'Barang murah dan investasi asing; industri lokal tertekan.', tag: 'liberal', capital: 18, cost: 0, mods: { pertumbuhan: 0.6, inflasi: -0.5, pengangguran: 0.4 }, instant: { diplo: 8 } },
  { id: 'syariah_ekonomi', name: 'Dana abadi umat & zakat negara', desc: 'Pengelolaan dana keagamaan untuk kemiskinan.', tag: 'religius', capital: 12, cost: 0.1, mods: { kemiskinan: -1.2, kebahagiaan: 2 } },
  { id: 'polisi_bersih', name: 'Reformasi kepolisian', desc: 'Gaji naik, pengawasan ketat.', tag: 'reformis', capital: 20, cost: 0.4, mods: { kriminalitas: -8, korupsi: -5 } },
  { id: 'modernisasi_alutsista', name: 'Modernisasi persenjataan', desc: 'Jet tempur dan kapal selam baru.', tag: 'nasionalis', capital: 15, cost: 1.0, mods: { militer: 18 } },
  { id: 'darurat', name: 'Dekrit keadaan darurat', desc: 'Kekuasaan penuh untuk "memulihkan ketertiban".', tag: 'otoriter', capital: 35, cost: 0.3, mods: { stabilitas: 12, kebahagiaan: -8, approval: -8, kriminalitas: -5 }, instant: { flags: ['dekrit_darurat'], diplo: -12 }, hint: 'Kekuasaan yang dipinjam jarang dikembalikan.' },
  { id: 'tiga_periode', name: 'Amandemen: hapus batas masa jabatan', desc: 'Tidak ada lagi pemilu yang bisa menggantimu.', tag: 'otoriter', capital: 60, cost: 0, mods: { stabilitas: -10, kebahagiaan: -8, approval: -12, korupsi: 8 }, instant: { flags: ['diktator'], diplo: -20 }, hint: 'Tidak ada jalan pulang dari keputusan ini.' },
];

// ---------- Negara lain ----------
export const COUNTRIES: Country[] = [
  { id: 'malaka', name: 'Malaka Raya', desc: 'Tetangga serumpun dan saingan abadi. Sengketa perbatasan laut.', power: 50, aggressive: 55, color: '#8e44ad', pos: [-5, -3] },
  { id: 'tiongkara', name: 'Tiongkara', desc: 'Raksasa ekonomi di utara. Uangnya banyak, tuntutannya juga.', power: 95, aggressive: 45, color: '#c0392b', pos: [0, -7] },
  { id: 'atlantika', name: 'Serikat Atlantika', desc: 'Adidaya jauh di timur. Suka bicara demokrasi.', power: 100, aggressive: 30, color: '#2e86c1', pos: [8, -5] },
  { id: 'australis', name: 'Australis', desc: 'Benua selatan yang makmur dan curiga.', power: 55, aggressive: 15, color: '#d68910', pos: [5, 6] },
  { id: 'temasik', name: 'Temasik', desc: 'Negara pulau mungil, pusat uang kawasan (termasuk uang koruptormu).', power: 22, aggressive: 5, color: '#17a589', pos: [-3, -5] },
  { id: 'sulu', name: 'Kesultanan Sulu Raya', desc: 'Kecil, miskin, nekat. Perompaknya mengganggu nelayanmu.', power: 30, aggressive: 75, color: '#7b241c', pos: [4, -2] },
];

// ---------- Label ----------
export const ATTR_LABEL: Record<AttrKey, string> = { kecerdasan: 'Kecerdasan', karisma: 'Karisma', integritas: 'Integritas', kesehatan: 'Kesehatan', stres: 'Stres', jaringan: 'Jaringan' };
export const LEVEL_LABEL: Record<Level, string> = { desa: 'Desa', kabupaten: 'Kabupaten', provinsi: 'Provinsi', nasional: 'Nasional' };
export const SECTOR_LABEL: Record<SectorKey, string> = { pendidikan: 'Pendidikan', kesehatan: 'Kesehatan', infrastruktur: 'Infrastruktur', pertahanan: 'Pertahanan', keamanan: 'Hukum & keamanan', sosial: 'Bantuan sosial', lingkungan: 'Lingkungan' };
export const REGION_LABEL: Record<RegionKey, string> = { kesejahteraan: 'Kesejahteraan', infrastruktur: 'Infrastruktur', keamanan: 'Keamanan', layanan: 'Layanan publik', kas: 'Kas daerah', kepuasan: 'Kepuasan warga' };
export const NATION_LABEL: Record<NationKey, { name: string; unit: string; goodUp: boolean }> = {
  pdb: { name: 'PDB', unit: ' T', goodUp: true },
  pertumbuhan: { name: 'Pertumbuhan ekonomi', unit: '%', goodUp: true },
  inflasi: { name: 'Inflasi', unit: '%', goodUp: false },
  pengangguran: { name: 'Pengangguran', unit: '%', goodUp: false },
  kemiskinan: { name: 'Kemiskinan', unit: '%', goodUp: false },
  utang: { name: 'Utang negara', unit: '% PDB', goodUp: false },
  pendidikan: { name: 'Pendidikan', unit: '', goodUp: true },
  kesehatan: { name: 'Kesehatan', unit: '', goodUp: true },
  kriminalitas: { name: 'Kriminalitas', unit: '', goodUp: false },
  korupsi: { name: 'Korupsi', unit: '', goodUp: false },
  infrastruktur: { name: 'Infrastruktur', unit: '', goodUp: true },
  lingkungan: { name: 'Lingkungan', unit: '', goodUp: true },
  kebahagiaan: { name: 'Kebahagiaan', unit: '', goodUp: true },
  stabilitas: { name: 'Stabilitas', unit: '', goodUp: true },
  militer: { name: 'Kekuatan militer', unit: '', goodUp: true },
  approval: { name: 'Kepuasan publik', unit: '%', goodUp: true },
};
export const ROLE_LABEL: Record<string, string> = { pengusaha: 'Pengusaha', ulama: 'Tokoh agama', jurnalis: 'Jurnalis', jenderal: 'Perwira', akademisi: 'Akademisi', preman: 'Tokoh jalanan', aktivis: 'Aktivis', birokrat: 'Birokrat', artis: 'Artis', politisi: 'Politisi' };

// ---------- Kriteria seleksi ----------
// Lembaga tidak otomatis menerima. Nilai pelamar = rata-rata tertimbang atribut + sedikit jaringan + keberuntungan,
// dibandingkan dengan ambang (bar). auto = tidak ada seleksi (usaha sendiri).
export interface Criteria { w: Partial<Record<AttrKey, number>>; bar: number; net?: number; note: string; auto?: boolean }
export const CAMPUS_CRIT: Record<string, Criteria> = {
  negeri_favorit: { w: { kecerdasan: 1 }, bar: 62, net: 0.03, note: 'Ujian tulis nasional yang ketat. Hampir murni soal kecerdasan.' },
  negeri_daerah: { w: { kecerdasan: 1 }, bar: 46, net: 0.05, note: 'Ujian masuk tingkat daerah. Saingan lebih sedikit.' },
  swasta: { w: { kecerdasan: 1 }, bar: 20, note: 'Hampir semua pendaftar diterima asal sanggup membayar.' },
  luar_negeri: { w: { kecerdasan: 3, karisma: 1 }, bar: 66, note: 'Esai, wawancara, dan nilai. Beasiswa hanya untuk yang sangat cerdas.' },
  akmil: { w: { kesehatan: 3, kecerdasan: 1, integritas: 1 }, bar: 62, net: 0.1, note: 'Tes fisik berat, psikotes, dan penelusuran latar belakang. Kenalan perwira membantu.' },
  kedinasan: { w: { kecerdasan: 3, integritas: 1 }, bar: 58, net: 0.08, note: 'Tes kompetensi dasar dengan kuota sempit.' },
};
export const JOB_CRIT: Record<string, Criteria> = {
  buruh: { w: { kesehatan: 1 }, bar: 35, note: 'Pabrik butuh badan sehat dan tidak banyak tanya.' },
  petani: { w: {}, bar: 0, auto: true, note: 'Menggarap lahan sendiri atau keluarga. Tidak ada seleksi.' },
  pedagang: { w: {}, bar: 0, auto: true, note: 'Buka lapak sendiri. Tidak ada seleksi.' },
  guru: { w: { kecerdasan: 2, integritas: 1, karisma: 1 }, bar: 50, net: 0.08, note: 'Seleksi guru: penguasaan materi, rekam jejak, cara mengajar.' },
  pns: { w: { kecerdasan: 3, integritas: 1 }, bar: 56, net: 0.15, note: 'Tes CPNS dengan jutaan pelamar. Orang dalam masih berpengaruh.' },
  tentara: { w: { kesehatan: 3, integritas: 1, kecerdasan: 1 }, bar: 60, net: 0.08, note: 'Tes fisik, kesehatan, dan mental ideologi.' },
  pengacara: { w: { kecerdasan: 2, karisma: 2 }, bar: 56, net: 0.15, note: 'Firma hukum mencari yang cerdas, pandai bicara, dan punya kenalan.' },
  jurnalis: { w: { kecerdasan: 2, karisma: 1, integritas: 1 }, bar: 52, net: 0.05, note: 'Tes menulis dan wawancara redaksi.' },
  aktivis: { w: { integritas: 2, karisma: 1 }, bar: 48, note: 'LSM menolak orang yang rekam jejaknya meragukan.' },
  dokter: { w: { kecerdasan: 3, integritas: 1, kesehatan: 1 }, bar: 58, note: 'Uji kompetensi dokter dan penempatan rumah sakit.' },
  insinyur: { w: { kecerdasan: 1 }, bar: 55, net: 0.05, note: 'Tes teknis perusahaan konstruksi dan industri.' },
  dosen: { w: { kecerdasan: 3, karisma: 1 }, bar: 66, net: 0.08, note: 'Senat kampus menilai karya ilmiah dan kemampuan mengajar.' },
  pengusaha: { w: {}, bar: 0, auto: true, note: 'Usaha sendiri. Yang menyeleksi adalah pasar.' },
  influencer: { w: { karisma: 1 }, bar: 58, note: 'Tidak ada yang melamar jadi terkenal; kontenmu harus memikat penonton.' },
  staf_partai: { w: { jaringan: 2, karisma: 1 }, bar: 32, note: 'Pengurus partai memilih kader yang dikenal dan bisa disuruh.' },
};
export const PARTY_CRIT: Record<string, Criteria> = {
  pbn: { w: { karisma: 2, jaringan: 1 }, bar: 40, note: 'Mencari kader yang pandai menggalang massa. Trah politik didahulukan.' },
  pku: { w: { integritas: 3, karisma: 1 }, bar: 52, note: 'Menimbang akhlak dan restu para kiai.' },
  pkr: { w: { jaringan: 2, kecerdasan: 1 }, bar: 40, note: 'Menyukai orang berduit, berpendidikan, dan punya koneksi bisnis.' },
  pbt: { w: { integritas: 2, karisma: 1 }, bar: 46, note: 'Terbuka untuk buruh, petani, guru, dan aktivis; curiga pada orang kaya.' },
  phm: { w: { kecerdasan: 2, integritas: 2 }, bar: 54, note: 'Mencari anak muda terdidik dan bersih.' },
};

// ---------- Gaya pemerintahan presiden AI ----------
export interface GovStyle { id: string; name: string; desc: string; budget: Budget; mods: Partial<Record<NationKey, number>>; eff: number; integrity: number }
export const GOV_STYLES: GovStyle[] = [
  { id: 'populis', name: 'Populis', desc: 'Pajak rendah, subsidi dan bantuan melimpah. Rakyat senang hari ini; tagihannya datang nanti.',
    budget: { pajak: 18, belanja: { pendidikan: 2.5, kesehatan: 2, infrastruktur: 2, pertahanan: 1.5, keamanan: 1.5, sosial: 4, lingkungan: 0.3 } },
    mods: { kebahagiaan: 4, approval: 5, inflasi: 0.6, korupsi: 3 }, eff: 0.9, integrity: 45 },
  { id: 'teknokrat', name: 'Teknokrat', desc: 'Anggaran disiplin, menteri profesional. Ekonomi rapi, tapi dingin dan tidak populer.',
    budget: { pajak: 23, belanja: { pendidikan: 3.5, kesehatan: 2.5, infrastruktur: 3, pertahanan: 1.5, keamanan: 1.5, sosial: 1.8, lingkungan: 0.6 } },
    mods: { pertumbuhan: 0.4, korupsi: -8, approval: -4 }, eff: 1.12, integrity: 75 },
  { id: 'oligark', name: 'Oligarkis', desc: 'Proyek besar untuk kawan-kawan penguasa. Jalan terbangun, kas bocor ke mana-mana.',
    budget: { pajak: 21, belanja: { pendidikan: 2.2, kesehatan: 1.6, infrastruktur: 4, pertahanan: 1.5, keamanan: 1.2, sosial: 1.5, lingkungan: 0.2 } },
    mods: { korupsi: 14, pertumbuhan: 0.2, lingkungan: -6, kebahagiaan: -2 }, eff: 0.8, integrity: 20 },
  { id: 'tangan_besi', name: 'Tangan besi', desc: 'Ketertiban di atas segalanya. Jalanan aman, kritik dibungkam.',
    budget: { pajak: 23, belanja: { pendidikan: 2.4, kesehatan: 1.8, infrastruktur: 2.4, pertahanan: 3, keamanan: 2.8, sosial: 1.6, lingkungan: 0.3 } },
    mods: { stabilitas: 6, kriminalitas: -7, kebahagiaan: -5, korupsi: 5 }, eff: 0.95, integrity: 40 },
  { id: 'reformis', name: 'Reformis', desc: 'Berantas korupsi, lindungi lingkungan, benahi pendidikan. Pengusaha besar menggerutu.',
    budget: { pajak: 24, belanja: { pendidikan: 3.8, kesehatan: 2.6, infrastruktur: 2.2, pertahanan: 1.3, keamanan: 2, sosial: 2.2, lingkungan: 1.6 } },
    mods: { korupsi: -12, lingkungan: 6, pertumbuhan: -0.3 }, eff: 1.02, integrity: 80 },
  { id: 'pembangunan', name: 'Pembangunan', desc: 'Kejar pertumbuhan: jalan tol, pelabuhan, pabrik. Utang dan hutan jadi korbannya.',
    budget: { pajak: 20, belanja: { pendidikan: 2.8, kesehatan: 2, infrastruktur: 4.4, pertahanan: 1.5, keamanan: 1.5, sosial: 1.6, lingkungan: 0.2 } },
    mods: { pertumbuhan: 0.7, lingkungan: -9, pengangguran: -0.5 }, eff: 1, integrity: 50 },
];
