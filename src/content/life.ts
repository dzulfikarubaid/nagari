// Isi kehidupan sehari-hari: tempat tinggal, organisasi, lomba, beasiswa, asmara, dan cita-cita.
import type { AttrKey, CityTier, DegreeLevel, Fx, HousingId, Level } from '../sim/types';

// ---------- Kota ----------
export interface City {
  id: CityTier;
  short: string;
  desc: string;
  /** biaya hidup dasar (makan, transport) juta/bulan */
  living: number;
  /** sewa kamar kos standar juta/bulan */
  rent: number;
  /** harga rumah standar (juta) */
  house: number;
  /** pengali gaji */
  pay: number;
  abroad?: boolean;
  /** popularitas level mana yang paling terdongkrak saat tinggal di sini */
  pop: Level | null;
  country?: string;
}
export const CITIES: City[] = [
  { id: 'desa', short: 'Desa', desc: 'Sawah, masjid, balai desa, dan semua orang tahu urusanmu. Murah, tenang, lowongan sedikit.', living: 1.0, rent: 0.35, house: 150, pay: 0.8, pop: 'desa' },
  { id: 'kabupaten', short: 'Kota kabupaten', desc: 'Alun-alun, pasar besar, kantor bupati. Cukup ramai, belum macet.', living: 1.4, rent: 0.7, house: 400, pay: 0.95, pop: 'kabupaten' },
  { id: 'provinsi', short: 'Ibu kota provinsi', desc: 'Mal, kampus, pabrik, dan kantor gubernur. Peluang kerja lebih banyak.', living: 1.8, rent: 1.1, house: 800, pay: 1.05, pop: 'provinsi' },
  { id: 'pelajar', short: 'Kota Cendekia', desc: 'Kota pelajar: kos murah, angkringan, toko buku, dan diskusi sampai subuh.', living: 1.5, rent: 0.9, house: 650, pay: 1.0, pop: 'provinsi' },
  { id: 'ibukota', short: 'Nagari Raya', desc: 'Ibu kota negara. Gaji tinggi, sewa mahal, macet tiga jam sehari, dekat dengan pusat kekuasaan.', living: 2.8, rent: 2.2, house: 2000, pay: 1.3, pop: 'nasional' },
  { id: 'atlantika', short: 'Port Liberty', country: 'Serikat Atlantika', desc: 'Kota kampus terbaik dunia. Semua mahal, termasuk kopi.', living: 9, rent: 8, house: 9000, pay: 3.2, abroad: true, pop: null },
  { id: 'australis', short: 'Sydnea', country: 'Australis', desc: 'Pantai, kampus megah, dan banyak sekali mahasiswa dari Nagari.', living: 7, rent: 6, house: 7000, pay: 2.8, abroad: true, pop: null },
  { id: 'temasik', short: 'Temasik', country: 'Temasik', desc: 'Negara-kota yang rapi, cepat, dan menuntut. Dua jam terbang dari rumah.', living: 7.5, rent: 7, house: 9000, pay: 3.0, abroad: true, pop: null },
  { id: 'tiongkara', short: 'Jingbei', country: 'Tiongkara', desc: 'Kota raksasa dengan laboratorium canggih dan musim dingin yang menusuk.', living: 4, rent: 3, house: 4000, pay: 1.9, abroad: true, pop: null },
];
export const cityDef = (id: CityTier) => CITIES.find(c => c.id === id)!;
export const DOMESTIC: CityTier[] = ['desa', 'kabupaten', 'provinsi', 'pelajar', 'ibukota'];
export const URBAN: CityTier[] = ['kabupaten', 'provinsi', 'pelajar', 'ibukota'];
export const ABROAD: CityTier[] = ['atlantika', 'australis', 'temasik', 'tiongkara'];

// ---------- Hunian ----------
export interface Housing { id: HousingId; name: string; desc: string; rentMult: number; stres: number }
export const HOUSING: Housing[] = [
  { id: 'ortu', name: 'Rumah orang tua', desc: 'Gratis makan, gratis cucian, gratis pertanyaan "kapan nikah?".', rentMult: 0, stres: 0 },
  { id: 'kos', name: 'Kamar kos', desc: 'Tiga kali tiga meter, kamar mandi luar, ibu kos galak.', rentMult: 0.6, stres: 0.1 },
  { id: 'kontrakan', name: 'Rumah kontrakan', desc: 'Rumah kecil sendiri; bayar tahunan, bocor ditanggung sendiri.', rentMult: 1.6, stres: -0.05 },
  { id: 'apartemen', name: 'Apartemen sewa', desc: 'Lift, satpam, kolam renang yang tak pernah sempat dipakai.', rentMult: 3.2, stres: -0.15 },
  { id: 'rumah', name: 'Rumah milik sendiri', desc: 'Sertifikat atas namamu. Cicilan, kalau ada, juga atas namamu.', rentMult: 0, stres: -0.3 },
  { id: 'asrama', name: 'Asrama', desc: 'Kamar berbagi, jam malam, dan teman dari segala penjuru.', rentMult: 0.45, stres: 0.05 },
];
export const housingDef = (id: HousingId) => HOUSING.find(h => h.id === id)!;

export const STREETS = ['Melati', 'Kenanga', 'Flamboyan', 'Cempaka', 'Merdeka', 'Sudirman', 'Pahlawan', 'Kaliurang', 'Diponegoro', 'Mawar', 'Anggrek', 'Veteran', 'Pemuda', 'Gajah Mada', 'Teuku Umar', 'Sisingamangaraja'];
export const KOS_NAMES = ['Kos Putra Barokah', 'Kos Bu Darmi', 'Wisma Asri', 'Kos Pelangi', 'Graha Mahasiswa', 'Kos Hijau', 'Pondok Sejahtera'];
export const APT_NAMES = ['Menara Kencana', 'Residence Sudirman', 'Puri Lestari Tower', 'Apartemen Taman Kota', 'Signature Park'];
export const DESA_NAMES = ['Sukamaju', 'Karangrejo', 'Tanjung Sari', 'Lubuk Raya', 'Wonosari', 'Sidomulyo', 'Batu Gajah', 'Pematang Tinggi', 'Mekarsari', 'Air Tenang'];
export const KAB_NAMES = ['Lembah Hijau', 'Tanah Datar', 'Muara Indah', 'Bukit Barisan', 'Kali Bening', 'Gunung Sari', 'Pesisir Selatan'];
export const PROV_NAMES = ['Bandar Andalas', 'Mahakam Raya', 'Selebes Kota', 'Pura Timur', 'Tanjung Emas'];

// ---------- Organisasi ----------
export interface Org {
  id: string;
  name: string;
  desc: string;
  kind: 'kampus' | 'umum';
  /** efek bulanan sebagai anggota biasa */
  fx: Fx;
  lang?: number;
  research?: number;
  need?: { majors?: string[]; jobs?: string[]; money?: number; perantau?: boolean; hometown?: boolean; degree?: boolean; abroad?: boolean; attr?: Partial<Record<AttrKey, number>> };
  joinFlag?: string;
  chairFlag?: string;
  /** nama jabatan ketua */
  chair: string;
}
export const ORGS: Org[] = [
  { id: 'bem', name: 'Dewan Pemerintahan Mahasiswa', desc: 'Pemerintahan mahasiswa: rapat, advokasi, dan politik kampus.', kind: 'kampus', fx: { attr: { karisma: 0.12, jaringan: 0.15 }, pop: { kabupaten: 0.03 } }, joinFlag: 'anak_bem', chairFlag: 'ketua_bem', chair: 'Presiden mahasiswa' },
  { id: 'hima', name: 'Himpunan mahasiswa jurusan', desc: 'Ospek jurusan, seminar, dan malam keakraban.', kind: 'kampus', fx: { attr: { jaringan: 0.12, kecerdasan: 0.04 } }, chair: 'Ketua himpunan' },
  { id: 'persma', name: 'Pers mahasiswa', desc: 'Majalah kampus yang sering bikin rektorat gerah.', kind: 'kampus', fx: { attr: { kecerdasan: 0.1, integritas: 0.05, jaringan: 0.05 } }, joinFlag: 'pers_kampus', chair: 'Pemimpin redaksi' },
  { id: 'debat', name: 'UKM Debat Bahasa Inggris', desc: 'Mosi, rebuttal, dan latihan sampai suara habis.', kind: 'kampus', fx: { attr: { karisma: 0.12, kecerdasan: 0.06 } }, lang: 0.35, chair: 'Ketua UKM' },
  { id: 'riset', name: 'Kelompok Studi & Riset', desc: 'Klub ilmiah: jurnal, lab, dan lomba karya tulis.', kind: 'kampus', fx: { attr: { kecerdasan: 0.14 } }, research: 0.4, chair: 'Ketua kelompok studi' },
  { id: 'coding', name: 'Komunitas teknologi kampus', desc: 'Ngoding bareng, hackathon, dan pizza tengah malam.', kind: 'kampus', fx: { attr: { kecerdasan: 0.12, jaringan: 0.05 } }, chair: 'Lead komunitas' },
  { id: 'olahraga', name: 'UKM Olahraga', desc: 'Futsal, badminton, basket. Latihan sore tiga kali seminggu.', kind: 'kampus', fx: { attr: { kesehatan: 0.2, stres: -0.3, karisma: 0.03 } }, chair: 'Kapten' },
  { id: 'seni', name: 'UKM Seni & Paduan Suara', desc: 'Teater, band, dan paduan suara untuk wisuda.', kind: 'kampus', fx: { attr: { karisma: 0.1, stres: -0.3 } }, chair: 'Ketua UKM' },
  { id: 'mapala', name: 'Mahasiswa Pecinta Alam', desc: 'Naik gunung, susur sungai, dan tim SAR kampus.', kind: 'kampus', fx: { attr: { kesehatan: 0.15, integritas: 0.05, stres: -0.15 } }, chair: 'Ketua umum' },
  { id: 'rohani', name: 'Lembaga dakwah & kerohanian kampus', desc: 'Kajian, mentoring, dan kegiatan sosial keagamaan.', kind: 'kampus', fx: { attr: { integritas: 0.12, stres: -0.2, jaringan: 0.04 } }, chair: 'Ketua umum' },
  { id: 'gerakan', name: 'Barisan Mahasiswa Merdeka', desc: 'Organisasi ekstra kampus: kaderisasi, diskusi ideologi, dan jalur ke partai.', kind: 'kampus', fx: { attr: { karisma: 0.1, jaringan: 0.18 }, pop: { kabupaten: 0.04 } }, joinFlag: 'aktivis_kampus', chairFlag: 'ketua_gerakan', chair: 'Ketua cabang' },
  { id: 'wirausaha', name: 'UKM Kewirausahaan', desc: 'Bazar, jualan di kantin, dan mimpi jadi unicorn.', kind: 'kampus', fx: { attr: { jaringan: 0.1 }, money: 0.3 }, chair: 'Ketua UKM' },
  { id: 'karang_taruna', name: 'Ikatan Pemuda Kampung', desc: 'Organisasi pemuda kampung: tujuh belasan, ronda, kerja bakti.', kind: 'umum', fx: { pop: { desa: 0.3, kabupaten: 0.04 }, attr: { karisma: 0.05 } }, need: { hometown: true }, chair: 'Ketua ikatan pemuda' },
  { id: 'ormas', name: 'Jamiyah Umat Nagari', desc: 'Ormas keagamaan terbesar: pengajian, sekolah, rumah sakit.', kind: 'umum', fx: { attr: { integritas: 0.08, jaringan: 0.1 }, pop: { desa: 0.12, kabupaten: 0.08 } }, chair: 'Ketua wilayah' },
  { id: 'relawan', name: 'Relawan Tanggap Bencana', desc: 'Dapur umum, evakuasi, dan posko pengungsian.', kind: 'umum', fx: { attr: { integritas: 0.1, kesehatan: -0.02 }, pop: { kabupaten: 0.06 } }, chair: 'Koordinator' },
  { id: 'lari', name: 'Komunitas lari', desc: 'Lari pagi tiap Minggu, lalu sarapan bubur.', kind: 'umum', fx: { attr: { kesehatan: 0.2, stres: -0.3, jaringan: 0.04 } }, chair: 'Kapten' },
  { id: 'penulis', name: 'Komunitas penulis', desc: 'Bedah buku, kelas menulis, dan antologi yang dicetak seratus eksemplar.', kind: 'umum', fx: { attr: { kecerdasan: 0.1 }, pop: { provinsi: 0.03 } }, chair: 'Ketua' },
  { id: 'teknologi', name: 'Komunitas teknologi & open source', desc: 'Meetup bulanan para pengembang perangkat lunak.', kind: 'umum', fx: { attr: { kecerdasan: 0.1, jaringan: 0.08 } }, need: { attr: { kecerdasan: 50 } }, chair: 'Organizer' },
  { id: 'lingkungan', name: 'Komunitas peduli lingkungan', desc: 'Bersih sungai, tanam mangrove, dan petisi.', kind: 'umum', fx: { attr: { integritas: 0.08 }, pop: { provinsi: 0.03, kabupaten: 0.03 } }, chair: 'Koordinator' },
  { id: 'profesi', name: 'Ikatan profesi', desc: 'Asosiasi dokter, insinyur, advokat, dan profesi lain: seminar, sertifikasi, lobi.', kind: 'umum', fx: { attr: { jaringan: 0.12, kecerdasan: 0.05 }, money: -0.2 }, need: { jobs: ['dokter', 'insinyur', 'pengacara', 'jaksa', 'akuntan', 'perawat', 'apoteker', 'psikolog', 'dosen', 'peneliti', 'guru'] }, chair: 'Ketua cabang' },
  { id: 'hipmi', name: 'Perkumpulan Saudagar Muda', desc: 'Klub para pengusaha muda: jejaring proyek dan lobi.', kind: 'umum', fx: { attr: { jaringan: 0.25 }, money: -0.5, heat: 0.02 }, need: { jobs: ['pengusaha', 'startup', 'pedagang'] }, chair: 'Ketua umum' },
  { id: 'paguyuban', name: 'Paguyuban perantau', desc: 'Sesama orang sekampung di kota rantau: arisan, makan bersama, saling bantu.', kind: 'umum', fx: { attr: { jaringan: 0.12, stres: -0.2 } }, need: { perantau: true }, chair: 'Ketua paguyuban' },
  { id: 'ppn', name: 'Perhimpunan Pelajar Nagari', desc: 'Organisasi pelajar dan perantau Nagari di luar negeri: diskusi, masak bersama, dan lobi ke kedutaan.', kind: 'umum', fx: { attr: { jaringan: 0.2, karisma: 0.06, stres: -0.2 }, pop: { nasional: 0.02 } }, need: { abroad: true }, chair: 'Ketua PPN' },
  { id: 'alumni', name: 'Ikatan alumni kampus', desc: 'Reuni, mentoring, dan grup percakapan yang berisi lowongan kerja.', kind: 'umum', fx: { attr: { jaringan: 0.15 } }, need: { degree: true }, chair: 'Ketua ikatan alumni' },
  { id: 'sosialita', name: 'Klub golf & sosialita', desc: 'Lapangan golf, jamuan malam, dan obrolan yang menentukan proyek.', kind: 'umum', fx: { attr: { jaringan: 0.3, integritas: -0.03 }, money: -3 }, need: { money: 500 }, chair: 'Ketua klub' },
];
export const ORG_SLOTS = 3;
export const ORG_ROLE = ['Anggota', 'Pengurus'];

// ---------- Lomba ----------
export interface Comp {
  id: string;
  name: string;
  intlName?: string;
  desc: string;
  w: Partial<Record<AttrKey, number>>;
  /** bobot kemampuan bahasa */
  lang?: number;
  student?: boolean;
  majors?: string[];
  jobs?: string[];
  attrMin?: Partial<Record<AttrKey, number>>;
  maxAge?: number;
  fee: number;
  months: number;
  prize: [number, number, number];
  pop: Level;
  pubBonus?: boolean;
}
export const COMPS: Comp[] = [
  { id: 'olimpiade', name: 'Olimpiade Sains Mahasiswa', intlName: 'Olimpiade Sains Internasional', desc: 'Soal matematika, fisika, kimia, biologi, dan komputer tingkat nasional.', w: { kecerdasan: 1 }, student: true, majors: ['mipa', 'teknik', 'informatika', 'kedokteran', 'farmasi', 'ekonomi', 'pertanian'], fee: 0, months: 3, prize: [15, 10, 7], pop: 'provinsi' },
  { id: 'kti', name: 'Lomba Karya Tulis Ilmiah', desc: 'Makalah dan presentasi di depan juri profesor.', w: { kecerdasan: 2, integritas: 1 }, student: true, fee: 0.5, months: 3, prize: [10, 7, 5], pop: 'provinsi', pubBonus: true },
  { id: 'debat', name: 'Kejuaraan Debat Bahasa Inggris', intlName: 'Kejuaraan Debat Dunia', desc: 'Mosi diumumkan lima belas menit sebelum bertanding.', w: { karisma: 2, kecerdasan: 1 }, lang: 1.2, student: true, fee: 1, months: 3, prize: [12, 8, 5], pop: 'nasional' },
  { id: 'pkm', name: 'Gelar Karya Mahasiswa', desc: 'Proposal didanai, lalu bertanding di pekan ilmiah nasional.', w: { kecerdasan: 2, karisma: 1 }, student: true, fee: 0, months: 5, prize: [12, 8, 6], pop: 'provinsi', pubBonus: true },
  { id: 'hackathon', name: 'Hackathon Nasional', intlName: 'Hackathon Global', desc: 'Empat puluh delapan jam membuat aplikasi tanpa tidur.', w: { kecerdasan: 3, jaringan: 1 }, majors: ['informatika', 'teknik', 'mipa'], jobs: ['programmer', 'data', 'startup'], fee: 0.5, months: 2, prize: [50, 25, 10], pop: 'nasional' },
  { id: 'bisnis', name: 'Kompetisi Rencana Bisnis', intlName: 'Kompetisi Startup Asia', desc: 'Pitching ide usaha di depan investor.', w: { kecerdasan: 1, karisma: 1, jaringan: 1 }, fee: 1, months: 3, prize: [40, 20, 10], pop: 'provinsi' },
  { id: 'desain', name: 'Lomba Desain Poster Nasional', desc: 'Satu tema, satu poster, ribuan peserta.', w: { karisma: 1, kecerdasan: 1 }, majors: ['seni', 'komunikasi', 'teknik', 'informatika'], fee: 0.3, months: 2, prize: [8, 5, 3], pop: 'provinsi' },
  { id: 'pidato', name: 'Lomba Pidato Kebangsaan', desc: 'Tujuh menit di podium tentang masa depan Nagari.', w: { karisma: 2, integritas: 1 }, fee: 0.2, months: 2, prize: [7, 5, 3], pop: 'kabupaten' },
  { id: 'maraton', name: 'Maraton Nagari', intlName: 'Maraton Internasional Port Liberty', desc: '42 kilometer di jalanan kota.', w: { kesehatan: 3, integritas: 1 }, attrMin: { kesehatan: 55 }, fee: 0.6, months: 4, prize: [20, 10, 5], pop: 'provinsi' },
  { id: 'bakat', name: 'Ajang Pencarian Bakat TV', desc: 'Audisi, karantina, dan sorot lampu stasiun televisi nasional.', w: { karisma: 3 }, maxAge: 35, fee: 0, months: 4, prize: [150, 40, 15], pop: 'nasional' },
  { id: 'novel', name: 'Sayembara Novel', desc: 'Naskah terbaik diterbitkan penerbit besar.', w: { kecerdasan: 2, karisma: 1 }, fee: 0, months: 6, prize: [30, 15, 10], pop: 'nasional' },
  { id: 'inovator', name: 'Penghargaan Inovator Muda', intlName: 'Penghargaan Inovator Muda Asia', desc: 'Untuk peneliti dan pembuat solusi di bawah 40 tahun.', w: { kecerdasan: 2, jaringan: 1 }, maxAge: 40, fee: 0, months: 4, prize: [60, 30, 15], pop: 'nasional', pubBonus: true },
];
export const RANK_NAMES = ['Juara 1', 'Juara 2', 'Juara 3', 'Finalis'];

// ---------- Beasiswa ----------
export interface Scholarship {
  id: string;
  name: string;
  /** penyelenggara */
  provider: string;
  desc: string;
  levels: DegreeLevel[];
  where: 'dalam' | 'luar' | 'bebas';
  /** hanya berlaku di kampus ini */
  only?: string;
  /** penuh = uang kuliah + biaya hidup; kuliah = uang kuliah saja; saku = uang saku bulanan saja */
  covers: 'penuh' | 'kuliah' | 'saku';
  /** uang saku tambahan (penuh) atau uang saku utama (saku), juta/bulan */
  stipend: number;
  /** bulan pendaftaran dibuka (0 = Januari) */
  open: number[];
  /** hanya untuk yang sedang kuliah */
  ongoingOnly?: boolean;
  /** minimal sudah kuliah sekian bulan */
  minMonths?: number;
  maxAge?: number;
  /** khusus keluarga miskin */
  poor?: boolean;
  /** bukan keluarga kaya */
  notRich?: boolean;
  gpaMin?: number;
  langMin?: number;
  pubsMin?: number;
  /** aktif di organisasi */
  org?: boolean;
  /** pernah memimpin organisasi atau bekerja minimal 2 tahun */
  leader?: boolean;
  /** pernah juara lomba atau kecerdasan sangat tinggi */
  prestasi?: boolean;
  majors?: string[];
  attrMin?: Partial<Record<AttrKey, number>>;
  /** bobot tes tertulis/esai dan ambang lolosnya */
  w: Partial<Record<AttrKey, number>>;
  bar: number;
  /** ambang lolos wawancara */
  interview: number;
  /** gambaran persaingan */
  quota: string;
  /** kewajiban setelah lulus */
  bond?: string;
  bondFlag?: string;
  /** tahapan seleksi */
  note: string;
}
const ALL_YEAR = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const SCHOLARSHIPS: Scholarship[] = [
  { id: 'kip', name: 'Beasiswa Asa Nagari', provider: 'Departemen Pendidikan Nagari', desc: 'Bantuan negara untuk anak keluarga prasejahtera: uang kuliah dan biaya hidup ditanggung sampai lulus.', levels: ['S1'], where: 'dalam', covers: 'penuh', stipend: 0.5, open: [1, 2, 3, 4], maxAge: 22, poor: true, w: { kecerdasan: 2, integritas: 1 }, bar: 46, interview: 40, quota: 'Sekitar 1 dari 3 pendaftar', note: 'Berkas & surat keterangan tidak mampu → verifikasi nilai → survei ke rumah.' },
  { id: 'pemda', name: 'Beasiswa Pemerintah Provinsi', provider: 'Pemerintah provinsi asal', desc: 'Uang kuliah ditanggung pemda untuk putra-putri daerah. Biaya hidup cari sendiri.', levels: ['S1', 'S2'], where: 'dalam', covers: 'kuliah', stipend: 0, open: [6, 7], ongoingOnly: true, notRich: true, gpaMin: 3.0, minMonths: 6, w: { kecerdasan: 2, integritas: 1 }, bar: 50, interview: 42, quota: 'Kuota terbatas per kabupaten', bond: 'Diharapkan mengabdi di daerah asal.', note: 'Berkas & KTP daerah → tes potensi akademik → wawancara dinas.' },
  { id: 'unggulan', name: 'Beasiswa Bintang Nagari', provider: 'Departemen Pendidikan Nagari', desc: 'Untuk lulusan SMA berprestasi: kuliah dalam negeri ditanggung penuh.', levels: ['S1'], where: 'dalam', covers: 'penuh', stipend: 1, open: [3, 4, 5], maxAge: 21, prestasi: true, w: { kecerdasan: 3, karisma: 1 }, bar: 63, interview: 50, quota: 'Sekitar 1 dari 10 pendaftar', note: 'Berkas & sertifikat prestasi → tes akademik → esai & wawancara.' },
  { id: 'korporasi', name: 'Beasiswa Bakti Korporasi', provider: 'Yayasan grup perusahaan swasta', desc: 'Uang saku bulanan plus pelatihan kepemimpinan untuk mahasiswa aktif mulai semester 4.', levels: ['S1'], where: 'dalam', covers: 'saku', stipend: 1.8, open: [8, 9], ongoingOnly: true, minMonths: 18, gpaMin: 3.2, org: true, w: { kecerdasan: 2, karisma: 1, jaringan: 1 }, bar: 58, interview: 55, quota: 'Sekitar 1 dari 15 pendaftar', note: 'Berkas & IPK → tes psikologi & diskusi kelompok → wawancara direksi.' },
  { id: 'zakat', name: 'Beasiswa Lembaga Zakat', provider: 'Lembaga Zakat & Wakaf Umat', desc: 'Uang saku untuk mahasiswa dari keluarga tidak mampu yang berakhlak baik. Bisa daftar kapan saja.', levels: ['S1'], where: 'dalam', covers: 'saku', stipend: 1.2, open: ALL_YEAR, poor: true, attrMin: { integritas: 55 }, w: { integritas: 2, kecerdasan: 1 }, bar: 45, interview: 45, quota: 'Dana terbatas, antre', note: 'Berkas & rekomendasi tokoh agama → wawancara → pembinaan rutin.' },
  { id: 'bank', name: 'Beasiswa Ikatan Dinas Bank Samudra', provider: 'Bank Samudra', desc: 'Kuliah ditanggung penuh mulai tahun ketiga, asal mau langsung bekerja di bank setelah lulus.', levels: ['S1'], where: 'dalam', covers: 'penuh', stipend: 1, open: [9, 10], ongoingOnly: true, minMonths: 24, gpaMin: 3.0, majors: ['ekonomi', 'hukum', 'informatika', 'mipa'], w: { kecerdasan: 2, karisma: 1 }, bar: 55, interview: 50, quota: 'Sekitar 1 dari 6 pendaftar', bond: 'Wajib bekerja di Bank Samudra 2 tahun setelah lulus.', bondFlag: 'ikatan_bank', note: 'Berkas & IPK → tes potensi & psikotes → wawancara HR.' },
  { id: 'sarjana_global', name: 'Beasiswa Sarjana Global', provider: 'Lembaga Dana Pelita Bangsa', desc: 'Kuliah S1 di luar negeri, ditanggung penuh. Kursinya sangat sedikit.', levels: ['S1'], where: 'luar', covers: 'penuh', stipend: 1.5, open: [9, 10, 11], maxAge: 21, langMin: 7, prestasi: true, w: { kecerdasan: 3, karisma: 1 }, bar: 72, interview: 60, quota: 'Puluhan kursi untuk ribuan pendaftar', bond: 'Wajib pulang dan mengabdi di Nagari.', bondFlag: 'ikatan_dan', note: 'Berkas & tes bahasa 7.0 → esai → wawancara panel.' },
  { id: 'temasik_hibah', name: 'Hibah Kuliah Temasik', provider: 'Kementerian Pendidikan Temasik', desc: 'Uang kuliah di Universitas Nasional Temasik dipotong besar. Biaya hidup tanggung sendiri.', levels: ['S1', 'S2'], where: 'luar', only: 'temasik_u', covers: 'kuliah', stipend: 0, open: ALL_YEAR, langMin: 6.5, w: { kecerdasan: 3 }, bar: 60, interview: 45, quota: 'Otomatis untuk yang diterima dan lolos tes', bond: 'Wajib bekerja di Temasik 3 tahun setelah lulus.', note: 'Diterima di kampus → tes akademik → tanda tangan perjanjian kerja.' },
  { id: 'dan', name: 'Beasiswa Pelita Bangsa', provider: 'Lembaga Dana Pelita Bangsa', desc: 'Beasiswa S2/S3 dalam dan luar negeri dari negara: kuliah, biaya hidup, tiket pesawat.', levels: ['S2', 'S3'], where: 'bebas', covers: 'penuh', stipend: 2, open: [0, 1, 6, 7], gpaMin: 3.0, maxAge: 35, w: { kecerdasan: 2, integritas: 1, karisma: 1 }, bar: 58, interview: 55, quota: 'Sekitar 1 dari 5 pendaftar', bond: 'Wajib pulang dan mengabdi di Nagari dua kali masa studi.', bondFlag: 'ikatan_dan', note: 'Berkas & IPK 3.0 → tes skolastik & esai kontribusi → wawancara & diskusi kelompok.' },
  { id: 'atlantika_f', name: 'Atlantika Fellowship', provider: 'Pemerintah Serikat Atlantika', desc: 'Beasiswa S2 bergengsi ke Universitas Atlantika. Alumninya menteri dan rektor.', levels: ['S2'], where: 'luar', only: 'luar_negeri', covers: 'penuh', stipend: 3, open: [1, 2], langMin: 7, gpaMin: 3.3, leader: true, w: { kecerdasan: 2, karisma: 2, jaringan: 1 }, bar: 66, interview: 62, quota: 'Sekitar 1 dari 25 pendaftar', bond: 'Wajib pulang ke Nagari dua tahun.', note: 'Berkas & tes bahasa 7.0 → esai kepemimpinan → wawancara di kedutaan.' },
  { id: 'tiongkara_gov', name: 'Beasiswa Pemerintah Tiongkara', provider: 'Pemerintah Tiongkara', desc: 'S2/S3 di Jingbei ditanggung penuh, termasuk asrama.', levels: ['S2', 'S3'], where: 'luar', only: 'tiongkara_u', covers: 'penuh', stipend: 1.5, open: [2, 3], gpaMin: 3.0, langMin: 5.5, w: { kecerdasan: 3 }, bar: 55, interview: 45, quota: 'Sekitar 1 dari 4 pendaftar', note: 'Berkas & surat rekomendasi → seleksi kampus → wawancara kedutaan.' },
  { id: 'riset_s3', name: 'Beasiswa Riset Doktoral', provider: 'Hibah profesor pembimbing', desc: 'Kamu dibiayai dari hibah riset profesor dan bekerja sebagai asisten risetnya.', levels: ['S3'], where: 'bebas', covers: 'penuh', stipend: 1, open: ALL_YEAR, gpaMin: 3.3, pubsMin: 1, w: { kecerdasan: 3 }, bar: 60, interview: 45, quota: 'Tergantung ada profesor yang mau', note: 'Kirim proposal & publikasi → profesor menilai → wawancara riset.' },
];
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const COVER_LABEL: Record<Scholarship['covers'], string> = { penuh: 'Uang kuliah + biaya hidup', kuliah: 'Uang kuliah saja', saku: 'Uang saku bulanan' };

// ---------- Asmara ----------
export const NAMES_L = ['Arif', 'Bagas', 'Dimas', 'Fikri', 'Galih', 'Hafiz', 'Ilham', 'Rizky', 'Reza', 'Yoga', 'Andre', 'Kevin', 'Teguh', 'Rangga', 'Farhan', 'Bima', 'Daffa', 'Gilang'];
export const NAMES_P = ['Ayu', 'Bunga', 'Citra', 'Dewi', 'Fitri', 'Intan', 'Laras', 'Nadia', 'Putri', 'Rara', 'Salsa', 'Tiara', 'Wulan', 'Zahra', 'Anisa', 'Kirana', 'Melati', 'Sekar'];
export const SURNAMES = ['Santoso', 'Pratama', 'Siregar', 'Nasution', 'Wibowo', 'Tanjung', 'Hidayat', 'Saragih', 'Mahendra', 'Lubis', 'Kusuma', 'Halim', 'Permana', 'Rahman', 'Sitompul', 'Harahap'];
export interface Trait { id: string; name: string; desc: string }
export const TRAITS: Trait[] = [
  { id: 'humoris', name: 'humoris', desc: 'Selalu bisa membuatmu tertawa, bahkan saat bertengkar.' },
  { id: 'ambisius', name: 'ambisius', desc: 'Punya rencana lima tahun dan berharap kamu juga punya.' },
  { id: 'religius', name: 'religius', desc: 'Taat beribadah dan menghargai orang yang jujur.' },
  { id: 'penyabar', name: 'penyabar', desc: 'Jarang marah, tapi sekali kecewa sulit dilupakan.' },
  { id: 'cemburuan', name: 'cemburuan', desc: 'Sayangnya besar, curiganya juga.' },
  { id: 'mandiri', name: 'mandiri', desc: 'Tidak suka diatur dan tidak mau bergantung.' },
  { id: 'boros', name: 'gemar belanja', desc: 'Hidup itu sekali; diskon itu berkali-kali.' },
  { id: 'perhatian', name: 'perhatian', desc: 'Ingat semua tanggal penting dan menanyakan kabarmu tiap hari.' },
  { id: 'idealis', name: 'idealis', desc: 'Punya prinsip keras soal benar dan salah.' },
  { id: 'pendiam', name: 'pendiam', desc: 'Sedikit bicara, banyak memperhatikan.' },
];
export const PARTNER_JOBS: { via: string[]; job: string; income: number }[] = [
  { via: ['kampus'], job: 'Mahasiswa', income: 0 },
  { via: ['kantor', 'aplikasi', 'teman'], job: 'Pegawai bank', income: 8 },
  { via: ['kantor', 'aplikasi', 'teman', 'dijodohkan'], job: 'Guru', income: 5 },
  { via: ['aplikasi', 'teman', 'organisasi'], job: 'Desainer grafis', income: 7 },
  { via: ['kantor', 'aplikasi', 'dijodohkan'], job: 'Pegawai negeri', income: 7 },
  { via: ['teman', 'aplikasi', 'dijodohkan'], job: 'Dokter', income: 18 },
  { via: ['organisasi', 'teman', 'kampus'], job: 'Aktivis LSM', income: 4 },
  { via: ['aplikasi', 'teman'], job: 'Pemilik kafe', income: 10 },
  { via: ['kantor', 'aplikasi'], job: 'Programmer', income: 14 },
  { via: ['dijodohkan', 'teman'], job: 'Pedagang', income: 6 },
  { via: ['dijodohkan', 'organisasi'], job: 'Perawat', income: 6 },
  { via: ['aplikasi', 'teman'], job: 'Kreator konten', income: 9 },
];
export const LOVE_VIA: { id: string; name: string; desc: string }[] = [
  { id: 'kampus', name: 'Teman kuliah', desc: 'Satu kelas, satu kelompok tugas, satu kantin.' },
  { id: 'kantor', name: 'Rekan kerja', desc: 'Makan siang bareng yang lama-lama jadi kebiasaan.' },
  { id: 'organisasi', name: 'Teman organisasi', desc: 'Rapat sampai malam, pulang searah.' },
  { id: 'teman', name: 'Dikenalkan teman', desc: '"Aku punya teman, orangnya baik banget."' },
  { id: 'aplikasi', name: 'Aplikasi kencan', desc: 'Geser kanan, geser kiri, berharap fotonya jujur.' },
  { id: 'dijodohkan', name: 'Dijodohkan keluarga', desc: 'Orang tua punya kenalan anak orang baik-baik.' },
];
export const WEDDING: Record<'sederhana' | 'sedang' | 'mewah', { name: string; cost: number; desc: string }> = {
  sederhana: { name: 'Akad sederhana', cost: 15, desc: 'Akad di rumah, makan bersama keluarga dekat.' },
  sedang: { name: 'Resepsi gedung', cost: 80, desc: 'Gedung serbaguna, lima ratus tamu, katering prasmanan.' },
  mewah: { name: 'Pesta mewah', cost: 350, desc: 'Hotel bintang lima, dua ribu tamu, liputan media.' },
};

// ---------- Cita-cita ----------
export interface Aspiration { id: string; name: string; desc: string; goal: string }
export const ASPIRATIONS: Aspiration[] = [
  { id: 'presiden', name: 'Jadi presiden', desc: 'Dari kursi kepala desa sampai istana.', goal: 'Terpilih sebagai presiden.' },
  { id: 'pengusaha', name: 'Pengusaha sukses', desc: 'Membangun usaha sendiri dan kaya raya.', goal: 'Kekayaan bersih 10 miliar.' },
  { id: 'ilmuwan', name: 'Ilmuwan / profesor', desc: 'Meneliti, menulis, dan mengajar generasi berikutnya.', goal: 'Gelar S3 dan 8 publikasi (2 internasional).' },
  { id: 'profesional', name: 'Puncak karier', desc: 'Jadi yang terbaik di bidang yang kamu pilih.', goal: 'Mencapai jenjang tertinggi di pekerjaanmu.' },
  { id: 'kreator', name: 'Seniman / kreator terkenal', desc: 'Karya dan wajahmu dikenal di seluruh negeri.', goal: 'Popularitas nasional 60 lewat pekerjaan kreatif.' },
  { id: 'keluarga', name: 'Keluarga bahagia', desc: 'Pasangan yang setia, anak-anak, dan rumah sendiri.', goal: 'Menikah, punya anak, punya rumah, stres rendah.' },
  { id: 'pengabdi', name: 'Mengabdi pada masyarakat', desc: 'Hidup untuk orang banyak, bukan untuk jabatan.', goal: 'Integritas 75 dan dikenal warga kabupaten (popularitas 50).' },
  { id: 'bebas', name: 'Jalani saja', desc: 'Belum tahu mau jadi apa. Hidup akan menunjukkan jalannya.', goal: 'Tidak ada target; nikmati perjalanannya.' },
];
