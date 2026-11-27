import type { CityTier, Budget, Job, Habit, Major, Campus, Party, Policy, Country, CampaignPromise, MinistryId, OfficeId, Level, Fx, AttrKey, SectorKey, NationKey, RegionKey } from '../sim/types';

// ---------- Latar keluarga ----------
export interface Background { id: string; name: string; desc: string; money: number; family: { fund: number; allowance: number; tuitionCap: number }; attr: Partial<Record<AttrKey, number>>; flags: string[]; home: CityTier }
export const BACKGROUNDS: Background[] = [
  { id: 'petani', name: 'Anak petani desa', desc: 'Hidup pas-pasan, tapi dikenal dan dipercaya warga kampung.', money: 5, family: { fund: 10, allowance: 0.5, tuitionCap: 0.8 }, attr: { integritas: 8, kesehatan: 8, jaringan: -8 }, flags: ['latar:petani'], home: 'desa' },
  { id: 'menengah', name: 'Keluarga pegawai', desc: 'Cukup untuk sekolah, tanpa koneksi istimewa.', money: 40, family: { fund: 90, allowance: 1.5, tuitionCap: 3 }, attr: { kecerdasan: 5 }, flags: ['latar:menengah'], home: 'kabupaten' },
  { id: 'pengusaha', name: 'Anak pengusaha', desc: 'Modal besar dan kenalan bisnis, tapi dianggap jauh dari rakyat.', money: 400, family: { fund: 2500, allowance: 6, tuitionCap: 50 }, attr: { jaringan: 10, integritas: -5, karisma: 3 }, flags: ['latar:kaya'], home: 'provinsi' },
  { id: 'dinasti', name: 'Dinasti politik', desc: 'Nama besar keluarga membuka pintu partai, sekaligus membawa musuh lama.', money: 250, family: { fund: 1500, allowance: 5, tuitionCap: 40 }, attr: { jaringan: 18, karisma: 5, integritas: -8 }, flags: ['latar:dinasti'], home: 'ibukota' },
  { id: 'santri', name: 'Keluarga pesantren', desc: 'Dihormati kalangan religius, jaringan ulama luas.', money: 15, family: { fund: 25, allowance: 0.7, tuitionCap: 1.2 }, attr: { integritas: 10, karisma: 5, jaringan: 4 }, flags: ['latar:santri'], home: 'desa' },
];

// ---------- Pendidikan ----------
export const MAJORS: Major[] = [
  { id: 'hukum', name: 'Hukum', desc: 'Jalan ke pengacara, jaksa, dan pembuat undang-undang.', growth: { kecerdasan: 0.35, karisma: 0.15 }, research: false, topics: [] },
  { id: 'ekonomi', name: 'Ekonomi & Bisnis', desc: 'Paham uang, pasar, dan anggaran.', growth: { kecerdasan: 0.35, jaringan: 0.15 }, research: true, topics: ['Dampak bantuan tunai terhadap konsumsi desa', 'Ekonomi digital dan UMKM', 'Ketimpangan upah antardaerah'] },
  { id: 'teknik', name: 'Teknik', desc: 'Insinyur pembangun; kuat di infrastruktur.', growth: { kecerdasan: 0.45 }, research: true, topics: ['Beton ramah lingkungan dari limbah sawit', 'Jembatan tahan gempa berbiaya rendah', 'Panel surya untuk pulau terpencil'] },
  { id: 'informatika', name: 'Informatika', desc: 'Pemrograman, data, dan kecerdasan buatan. Lowongannya ada di mana-mana.', growth: { kecerdasan: 0.45, jaringan: 0.05 }, research: true, topics: ['Model bahasa untuk bahasa daerah', 'Deteksi hoaks otomatis', 'Sistem peringatan dini banjir berbasis sensor'] },
  { id: 'mipa', name: 'Sains (MIPA)', desc: 'Matematika, fisika, kimia, biologi. Fondasi semua penemuan.', growth: { kecerdasan: 0.5 }, research: true, topics: ['Senyawa antikanker dari tanaman hutan', 'Pemodelan iklim kepulauan', 'Bakteri pengurai plastik'] },
  { id: 'kedokteran', name: 'Kedokteran', desc: 'Lama dan berat, tapi dokter selalu dihormati.', growth: { kecerdasan: 0.45, integritas: 0.1, stres: 0.25 }, research: true, topics: ['Tengkes pada balita di desa', 'Resistansi antibiotik di puskesmas', 'Vaksin demam berdarah'] },
  { id: 'farmasi', name: 'Farmasi', desc: 'Obat, racikan, dan laboratorium.', growth: { kecerdasan: 0.4, integritas: 0.05 }, research: true, topics: ['Obat herbal terstandar', 'Formulasi obat anak', 'Kualitas obat generik'] },
  { id: 'keperawatan', name: 'Keperawatan', desc: 'Garda depan rumah sakit; dibutuhkan sampai luar negeri.', growth: { kecerdasan: 0.25, integritas: 0.15, kesehatan: 0.05 }, research: false, topics: [] },
  { id: 'psikologi', name: 'Psikologi', desc: 'Memahami pikiran dan perilaku manusia.', growth: { kecerdasan: 0.3, karisma: 0.15 }, research: true, topics: ['Kesehatan mental pekerja ojek daring', 'Perundungan di sekolah', 'Kecanduan gawai pada remaja'] },
  { id: 'pendidikan', name: 'Keguruan', desc: 'Mendidik generasi; dekat dengan warga.', growth: { kecerdasan: 0.25, integritas: 0.15, karisma: 0.1 }, research: false, topics: [] },
  { id: 'pertanian', name: 'Pertanian', desc: 'Ilmu pangan dan desa.', growth: { kecerdasan: 0.25, kesehatan: 0.1, integritas: 0.1 }, research: true, topics: ['Padi tahan kekeringan', 'Pupuk hayati dari limbah ternak', 'Pertanian presisi dengan drone'] },
  { id: 'politik', name: 'Ilmu Politik', desc: 'Organisasi kampus, debat, dan jaringan aktivis.', growth: { karisma: 0.35, jaringan: 0.25, kecerdasan: 0.15 }, research: false, topics: [] },
  { id: 'hi', name: 'Hubungan Internasional', desc: 'Diplomasi, geopolitik, dan bahasa asing.', growth: { kecerdasan: 0.3, karisma: 0.2, jaringan: 0.1 }, research: false, topics: [] },
  { id: 'komunikasi', name: 'Komunikasi', desc: 'Media, citra, dan cara bicara ke publik.', growth: { karisma: 0.45, jaringan: 0.15 }, research: false, topics: [] },
  { id: 'seni', name: 'Seni & Desain', desc: 'Desain grafis, film, musik, dan rupa.', growth: { karisma: 0.35, kecerdasan: 0.15, stres: -0.05 }, research: false, topics: [] },
  { id: 'sastra', name: 'Sastra & Bahasa', desc: 'Membaca, menulis, menerjemahkan.', growth: { kecerdasan: 0.3, karisma: 0.15 }, research: false, topics: [] },
  { id: 'militer', name: 'Ilmu Militer', desc: 'Hanya di Akademi Militer. Disiplin dan komando.', growth: { kesehatan: 0.3, karisma: 0.2, kecerdasan: 0.15 }, research: false, topics: [] },
];

export const CAMPUSES: Campus[] = [
  { id: 'negeri_favorit', name: 'Universitas Nagari (negeri favorit)', desc: 'Seleksi ketat, biaya ringan, alumni menguasai birokrasi dan partai.', costPerMonth: 2, quality: 1.3, network: 1.4, need: { kecerdasan: 58 }, months: 48, city: 'pelajar', levels: ['S1', 'S2', 'S3'] },
  { id: 'iup', name: 'Universitas Nagari — Kelas Internasional (IUP)', desc: 'Kuliah berbahasa Inggris; tahun ketiga di kampus mitra luar negeri, lulus dengan dua ijazah.', costPerMonth: 10, quality: 1.35, network: 1.5, months: 48, city: 'pelajar', lang: 6, levels: ['S1'], iup: true },
  { id: 'negeri_daerah', name: 'Universitas Negeri Daerah', desc: 'Dekat rumah, murah, jaringan lokal.', costPerMonth: 1.5, quality: 1.0, network: 0.8, need: { kecerdasan: 42 }, months: 48, city: 'provinsi', levels: ['S1', 'S2'] },
  { id: 'swasta', name: 'Universitas Swasta Kota', desc: 'Siapa saja bisa masuk asal sanggup bayar.', costPerMonth: 6, quality: 0.9, network: 1.0, months: 48, city: 'provinsi', levels: ['S1', 'S2'] },
  { id: 'luar_negeri', name: 'Universitas Atlantika', desc: 'Kampus terbaik dunia di Port Liberty. Mahal sekali kecuali dapat beasiswa.', costPerMonth: 45, quality: 1.55, network: 1.3, months: 48, city: 'atlantika', lang: 6.5, abroad: true, levels: ['S1', 'S2', 'S3'] },
  { id: 'australis_u', name: 'Universitas Sydnea (Australis)', desc: 'Kampus besar yang ramah mahasiswa Nagari; boleh kerja paruh waktu.', costPerMonth: 32, quality: 1.4, network: 1.15, months: 48, city: 'australis', lang: 6.5, abroad: true, levels: ['S1', 'S2', 'S3'] },
  { id: 'temasik_u', name: 'Universitas Nasional Temasik', desc: 'Peringkat atas Asia, dekat rumah, persaingan keras.', costPerMonth: 28, quality: 1.45, network: 1.3, months: 48, city: 'temasik', lang: 6, abroad: true, levels: ['S1', 'S2', 'S3'] },
  { id: 'tiongkara_u', name: 'Universitas Teknologi Jingbei (Tiongkara)', desc: 'Laboratorium raksasa, biaya lebih ringan, kelas internasional berbahasa Inggris.', costPerMonth: 16, quality: 1.3, network: 1.0, months: 48, city: 'tiongkara', lang: 5.5, abroad: true, levels: ['S1', 'S2', 'S3'] },
  { id: 'akmil', name: 'Akademi Militer', desc: 'Gratis, fisik berat. Otomatis jurusan militer dan ikatan dinas tentara.', costPerMonth: 0, quality: 1.1, network: 1.2, need: { kesehatan: 65 }, months: 48, city: 'kabupaten', levels: ['S1'] },
  { id: 'kedinasan', name: 'Sekolah Kedinasan', desc: 'Gratis, langsung jadi PNS setelah lulus.', costPerMonth: 0, quality: 1.0, network: 1.0, need: { kecerdasan: 55 }, months: 48, city: 'ibukota', levels: ['S1'] },
];
export const S2_MONTHS = 24;
export const S3_MONTHS = 48;

// ---------- Pekerjaan ----------
const D: CityTier[] = ['desa', 'kabupaten', 'provinsi', 'pelajar', 'ibukota'];
export const JOB_GROUPS = ['Tanpa gelar', 'Profesional & kantor', 'Kesehatan', 'Negara & hukum', 'Akademik & riset', 'Kreatif & media', 'Bisnis', 'Sosial & politik'];
export const JOBS: Job[] = [
  { id: 'buruh', group: 'Tanpa gelar', name: 'Buruh pabrik', desc: 'Kerja sif di pabrik bersama ribuan buruh lain. Bisa juga jadi pekerja migran di luar negeri.', income: 3.5, growth: { kesehatan: -0.03, stres: 0.1 }, pop: { desa: 0.05 }, abroadOk: true },
  { id: 'petani', group: 'Tanpa gelar', name: 'Petani', desc: 'Menggarap sawah dan ladang. Hanya di desa.', income: 3, growth: { kesehatan: 0.05, integritas: 0.03 }, pop: { desa: 0.2 }, where: ['desa'], volatile: 0.3 },
  { id: 'pedagang', group: 'Tanpa gelar', name: 'Pedagang', desc: 'Buka lapak di pasar.', income: 6, growth: { jaringan: 0.12, karisma: 0.05 }, pop: { desa: 0.1, kabupaten: 0.05 }, where: D, volatile: 0.75 },
  { id: 'ojol', group: 'Tanpa gelar', name: 'Pengemudi ojek daring', desc: 'Antar penumpang dan makanan. Jam kerja bebas, penghasilan tergantung aplikasi.', income: 4, growth: { jaringan: 0.05, kesehatan: -0.03, stres: 0.08 }, pop: { kabupaten: 0.03 }, volatile: 0.3 },
  { id: 'koki', group: 'Tanpa gelar', name: 'Juru masak', desc: 'Dari dapur warung sampai dapur hotel. Bisa membawamu ke kapal pesiar.', income: 4.5, growth: { karisma: 0.03, stres: 0.06 }, pop: { kabupaten: 0.02 }, abroadOk: true, ranks: ['Asisten dapur', 'Juru masak', 'Kepala bagian', 'Kepala koki', 'Koki selebritas'] },
  { id: 'atlet', group: 'Tanpa gelar', name: 'Atlet profesional', desc: 'Klub, pelatnas, dan medali. Karier pendek, sorot lampu terang.', income: 6, growth: { kesehatan: 0.15, karisma: 0.06 }, pop: { provinsi: 0.05, nasional: 0.06 }, need: { attr: { kesehatan: 70 }, maxAge: 26 }, ranks: ['Pemain muda', 'Pemain inti', 'Pemain nasional', 'Kapten timnas', 'Legenda'] },
  { id: 'programmer', group: 'Profesional & kantor', name: 'Programmer', desc: 'Membangun aplikasi dan sistem. Banyak yang belajar otodidak.', income: 9, growth: { kecerdasan: 0.1, stres: 0.06 }, pop: {}, need: { attr: { kecerdasan: 55 } }, abroadOk: true, ranks: ['Junior', 'Menengah', 'Senior', 'Lead engineer', 'Kepala teknologi'] },
  { id: 'data', group: 'Profesional & kantor', name: 'Analis data', desc: 'Mengubah angka jadi keputusan.', income: 10, growth: { kecerdasan: 0.1 }, pop: {}, need: { degree: true, majors: ['informatika', 'mipa', 'ekonomi', 'teknik', 'psikologi'] }, abroadOk: true },
  { id: 'insinyur', group: 'Profesional & kantor', name: 'Insinyur', desc: 'Merancang dan mengawasi proyek jalan, gedung, dan pabrik.', income: 12, growth: { kecerdasan: 0.1 }, pop: { kabupaten: 0.03 }, need: { degree: true, majors: ['teknik'] }, abroadOk: true },
  { id: 'akuntan', group: 'Profesional & kantor', name: 'Akuntan', desc: 'Pembukuan, audit, dan pajak.', income: 9, growth: { kecerdasan: 0.07, integritas: 0.02 }, pop: {}, need: { degree: true, majors: ['ekonomi'] }, abroadOk: true },
  { id: 'bankir', group: 'Profesional & kantor', name: 'Bankir', desc: 'Kredit, nasabah, dan target bulanan.', income: 11, growth: { jaringan: 0.1, stres: 0.08 }, pop: {}, need: { degree: true }, abroadOk: true },
  { id: 'konsultan', group: 'Profesional & kantor', name: 'Konsultan manajemen', desc: 'Presentasi untuk direksi, lembur untuk diri sendiri.', income: 16, growth: { kecerdasan: 0.08, jaringan: 0.1, stres: 0.12 }, pop: {}, need: { degree: true, attr: { kecerdasan: 62 } }, where: ['provinsi', 'ibukota'], abroadOk: true },
  { id: 'pns', group: 'Negara & hukum', name: 'Pegawai negeri', desc: 'Pegawai kantor pemerintah, dari kantor desa sampai kementerian.', income: 7, growth: { kecerdasan: 0.05, jaringan: 0.08 }, pop: { kabupaten: 0.05 }, need: { degree: true }, where: D },
  { id: 'tentara', group: 'Negara & hukum', name: 'Tentara', desc: 'Prajurit angkatan bersenjata.', income: 7, growth: { kesehatan: 0.1, karisma: 0.08 }, pop: { kabupaten: 0.04, nasional: 0.02 }, need: { attr: { kesehatan: 60 } }, where: D, ranks: ['Letnan', 'Kapten', 'Mayor', 'Kolonel', 'Jenderal'] },
  { id: 'polisi', group: 'Negara & hukum', name: 'Polisi', desc: 'Menjaga ketertiban. Godaan "uang damai" ada di setiap tikungan.', income: 6.5, growth: { kesehatan: 0.06, karisma: 0.05 }, pop: { kabupaten: 0.05 }, need: { attr: { kesehatan: 58 }, maxAge: 28 }, where: D, heat: 0.02, ranks: ['Inspektur', 'Ajun komisaris', 'Komisaris', 'Komisaris besar', 'Jenderal polisi'] },
  { id: 'pengacara', group: 'Negara & hukum', name: 'Pengacara', desc: 'Membela klien di pengadilan.', income: 14, growth: { kecerdasan: 0.08, karisma: 0.1, jaringan: 0.08 }, pop: { kabupaten: 0.05, provinsi: 0.03 }, need: { degree: true, majors: ['hukum'] } },
  { id: 'jaksa', group: 'Negara & hukum', name: 'Jaksa', desc: 'Penuntut umum. Kasus besar bisa membuatmu terkenal, atau kaya.', income: 9, growth: { kecerdasan: 0.07, integritas: 0.03 }, pop: { provinsi: 0.04 }, need: { degree: true, majors: ['hukum'] } },
  { id: 'diplomat', group: 'Negara & hukum', name: 'Diplomat', desc: 'Kementerian luar negeri; ditempatkan bergantian di kedutaan.', income: 10, growth: { karisma: 0.08, jaringan: 0.12, kecerdasan: 0.05 }, pop: { nasional: 0.03 }, need: { degree: true, majors: ['hi', 'hukum', 'politik', 'ekonomi', 'sastra'] }, where: ['ibukota'], ranks: ['Atase', 'Sekretaris', 'Konselor', 'Minister', 'Duta besar'] },
  { id: 'dokter', group: 'Kesehatan', name: 'Dokter', desc: 'Mengobati pasien di rumah sakit atau puskesmas.', income: 18, growth: { kecerdasan: 0.06, integritas: 0.04, stres: 0.1 }, pop: { desa: 0.12, kabupaten: 0.1 }, need: { degree: true, majors: ['kedokteran'] }, where: D, ranks: ['Dokter umum', 'Dokter senior', 'Dokter spesialis', 'Konsultan', 'Direktur rumah sakit'], gate: [{ level: 2, degree: 'S2', note: 'Jadi spesialis butuh pendidikan spesialis (S2)' }] },
  { id: 'perawat', group: 'Kesehatan', name: 'Perawat', desc: 'Merawat pasien siang malam. Dicari sampai ke luar negeri.', income: 5.5, growth: { integritas: 0.05, stres: 0.08 }, pop: { desa: 0.06 }, need: { degree: true, majors: ['keperawatan'] }, where: D, abroadOk: true },
  { id: 'apoteker', group: 'Kesehatan', name: 'Apoteker', desc: 'Apotek, rumah sakit, atau pabrik obat.', income: 8, growth: { kecerdasan: 0.05 }, pop: {}, need: { degree: true, majors: ['farmasi'] } },
  { id: 'psikolog', group: 'Kesehatan', name: 'Psikolog', desc: 'Konseling dan asesmen. Wajib profesi S2.', income: 9, growth: { kecerdasan: 0.05, karisma: 0.05, stres: 0.04 }, pop: {}, need: { degree: true, majors: ['psikologi'], level: 'S2' } },
  { id: 'guru', group: 'Akademik & riset', name: 'Guru', desc: 'Mengajar di sekolah.', income: 5, growth: { kecerdasan: 0.08, integritas: 0.05 }, pop: { desa: 0.15, kabupaten: 0.06 }, need: { degree: true, majors: ['pendidikan', 'pertanian', 'politik', 'komunikasi', 'ekonomi', 'hukum', 'teknik', 'mipa', 'sastra', 'seni', 'informatika'] }, where: D },
  { id: 'dosen', group: 'Akademik & riset', name: 'Dosen', desc: 'Mengajar dan meneliti di kampus.', income: 9, growth: { kecerdasan: 0.15, karisma: 0.04 }, pop: { provinsi: 0.05, nasional: 0.04 }, need: { degree: true, level: 'S2', attr: { kecerdasan: 65 } }, abroadOk: true, ranks: ['Asisten ahli', 'Lektor', 'Lektor kepala', 'Guru besar', 'Rektor'], gate: [{ level: 2, degree: 'S3', note: 'Lektor kepala butuh gelar doktor (S3)' }, { level: 3, degree: 'S3', pubs: 8, note: 'Guru besar butuh S3 dan 8 publikasi' }] },
  { id: 'peneliti', group: 'Akademik & riset', name: 'Peneliti', desc: 'Pusat Riset Nagari: laboratorium, hibah, dan jurnal.', income: 9, growth: { kecerdasan: 0.15 }, pop: { nasional: 0.02 }, need: { degree: true, level: 'S2', majors: ['teknik', 'informatika', 'mipa', 'kedokteran', 'farmasi', 'pertanian', 'ekonomi', 'psikologi'] }, abroadOk: true, ranks: ['Peneliti pertama', 'Peneliti muda', 'Peneliti madya', 'Peneliti utama', 'Profesor riset'], gate: [{ level: 2, degree: 'S3', note: 'Peneliti madya butuh gelar doktor (S3)' }, { level: 4, pubs: 10, note: 'Profesor riset butuh 10 publikasi' }] },
  { id: 'jurnalis', group: 'Kreatif & media', name: 'Jurnalis', desc: 'Meliput dan menulis berita.', income: 6, growth: { kecerdasan: 0.08, jaringan: 0.1 }, pop: { provinsi: 0.06, nasional: 0.05 }, need: { attr: { kecerdasan: 50 } } },
  { id: 'desainer', group: 'Kreatif & media', name: 'Desainer grafis', desc: 'Logo, kemasan, kampanye iklan.', income: 6, growth: { karisma: 0.06, kecerdasan: 0.04 }, pop: {}, abroadOk: true },
  { id: 'influencer', group: 'Kreatif & media', name: 'Selebritas media sosial', desc: 'Membuat konten untuk jutaan penonton.', income: 8, growth: { karisma: 0.15, kecerdasan: -0.03 }, pop: { nasional: 0.22, provinsi: 0.1 }, need: { attr: { karisma: 60 } }, where: D, abroadOk: true, volatile: 0.55 },
  { id: 'musisi', group: 'Kreatif & media', name: 'Musisi', desc: 'Panggung kafe, lalu festival, lalu (semoga) stadion.', income: 5, growth: { karisma: 0.12, stres: 0.05 }, pop: { provinsi: 0.05, nasional: 0.08 }, need: { attr: { karisma: 52 } }, volatile: 0.8 },
  { id: 'penulis', group: 'Kreatif & media', name: 'Penulis', desc: 'Novel, naskah film, kolom koran. Royalti datang tak menentu.', income: 4, growth: { kecerdasan: 0.12 }, pop: { nasional: 0.05 }, need: { attr: { kecerdasan: 52 } }, where: D, abroadOk: true, volatile: 0.9 },
  { id: 'pengusaha', group: 'Bisnis', name: 'Pengusaha', desc: 'Menjalankan usaha sendiri. Butuh modal 200 juta.', income: 25, growth: { jaringan: 0.15, integritas: -0.04, stres: 0.1 }, pop: { kabupaten: 0.04, provinsi: 0.03 }, need: { attr: { jaringan: 45 }, capital: 200 }, heat: 0.05, volatile: 0.75 },
  { id: 'startup', group: 'Bisnis', name: 'Pendiri startup', desc: 'Bakar uang investor, kejar pertumbuhan, berharap tidak tutup. Modal awal 50 juta.', income: 12, growth: { kecerdasan: 0.08, jaringan: 0.12, stres: 0.2 }, pop: { nasional: 0.04 }, need: { attr: { kecerdasan: 55, jaringan: 35 }, capital: 50 }, where: ['provinsi', 'pelajar', 'ibukota'], abroadOk: true, volatile: 1.1, ranks: ['Tahap ide', 'Seed', 'Seri A', 'Seri B', 'Unicorn'] },
  { id: 'aktivis', group: 'Sosial & politik', name: 'Aktivis LSM', desc: 'Mendampingi warga dan mengkritik pejabat.', income: 3, growth: { karisma: 0.12, integritas: 0.08, stres: 0.08 }, pop: { kabupaten: 0.1, provinsi: 0.06, nasional: 0.04 }, where: D },
  { id: 'staf_partai', group: 'Sosial & politik', name: 'Staf partai', desc: 'Bekerja di kantor partai. Harus anggota partai.', income: 5, growth: { jaringan: 0.18, karisma: 0.05, integritas: -0.03 }, pop: { kabupaten: 0.04 }, need: {} },
];
export const JOB_LEVEL_MULT = [1, 1.6, 2.6, 4.2, 6.5];
export const JOB_LEVEL_NAMES = ['pemula', 'berpengalaman', 'senior', 'pimpinan', 'tokoh puncak'];
export const rankName = (j: Job, lvl: number) => j.ranks ? j.ranks[lvl] : `${j.name} ${JOB_LEVEL_NAMES[lvl]}`;

// ---------- Kegiatan mingguan ----------
// Waktu dibagi dalam jam per minggu. Efek (fx) ditulis per 10 jam/minggu; makin banyak jam, makin kecil tambahan per jamnya.
export type PlanNeed = 'job' | 'party' | 'money' | 'research' | 'comp' | 'partner' | 'family' | 'org' | 'student' | 'tutor' | 'skill' | 'motor' | 'rantau';
export interface PlanAction {
  id: string; name: string; desc: string; fx: Fx; need?: PlanNeed;
  group: 'Belajar & karier' | 'Cari uang tambahan' | 'Sosial & keluarga' | 'Diri sendiri';
  /** jam maksimal per minggu */
  max: number;
  /** perkiraan bayaran per jam (juta), untuk tampilan */
  rate?: number;
}
export const PLAN_ACTIONS: PlanAction[] = [
  { id: 'belajar', group: 'Belajar & karier', max: 40, name: 'Belajar mandiri', desc: 'Mengulang materi, membaca, mengerjakan tugas lebih awal. Menaikkan IPK dan kecerdasan.', fx: { attr: { kecerdasan: 0.35, stres: 0.2 } } },
  { id: 'kursus', group: 'Belajar & karier', max: 15, name: 'Kursus bahasa Inggris', desc: 'Kelas malam dan latihan percakapan. Sekitar 0,5 juta/bulan per 10 jam.', fx: { money: -0.5, attr: { stres: 0.2 } } },
  { id: 'riset', group: 'Belajar & karier', max: 35, name: 'Kerjakan riset', desc: 'Di laboratorium atau perpustakaan sampai larut.', fx: { attr: { kecerdasan: 0.15, stres: 0.4 } }, need: 'research' },
  { id: 'latihan', group: 'Belajar & karier', max: 25, name: 'Latihan untuk lomba', desc: 'Persiapan intensif menjelang hari lomba.', fx: { attr: { stres: 0.3 } }, need: 'comp' },
  { id: 'magang', group: 'Belajar & karier', max: 25, rate: 0.012, name: 'Magang', desc: 'Magang paruh waktu di kantor. Bayarannya kecil, tapi pengalaman kerja dilirik perekrut.', fx: { attr: { jaringan: 0.2, kecerdasan: 0.08, stres: 0.4 } }, need: 'student' },
  { id: 'organisasi', group: 'Belajar & karier', max: 25, name: 'Aktif berorganisasi', desc: 'Rapat, program kerja, dan acara organisasi.', fx: { attr: { jaringan: 0.12, karisma: 0.06, stres: 0.2 } }, need: 'org' },
  { id: 'partai', group: 'Belajar & karier', max: 25, name: 'Kegiatan partai', desc: 'Rapat, kaderisasi, bantu acara partai.', fx: { party: 0.8, attr: { jaringan: 0.15, stres: 0.3 } }, need: 'party' },
  { id: 'kerja_keras', group: 'Cari uang tambahan', max: 25, name: 'Lembur', desc: 'Jam ekstra di pekerjaan utama: gaji lebih besar dan naik jenjang lebih cepat.', fx: { attr: { stres: 1.2 } }, need: 'job' },
  { id: 'ojol', group: 'Cari uang tambahan', max: 40, rate: 0.022, name: 'Ojek daring sampingan', desc: 'Narik sepulang kuliah atau kerja. Pasti dapat uang, tapi capek dan rawan di jalan.', fx: { attr: { kesehatan: -0.08, stres: 0.5, jaringan: 0.03 } }, need: 'motor' },
  { id: 'les', group: 'Cari uang tambahan', max: 20, rate: 0.07, name: 'Mengajar les privat', desc: 'Les matematika atau bahasa untuk anak sekolah. Bayaran per jam lumayan.', fx: { attr: { karisma: 0.05, kecerdasan: 0.05, stres: 0.3 } }, need: 'tutor' },
  { id: 'freelance', group: 'Cari uang tambahan', max: 30, rate: 0.08, name: 'Kerja lepas', desc: 'Proyek desain, ngoding, menulis, atau menerjemahkan dari rumah. Klien kadang ada, kadang hilang.', fx: { attr: { kecerdasan: 0.06, stres: 0.4 } }, need: 'skill' },
  { id: 'usaha', group: 'Cari uang tambahan', max: 40, name: 'Jualan daring', desc: 'Jualan kecil-kecilan lewat media sosial dan lokapasar. Untung-rugi tak menentu.', fx: { attr: { stres: 0.5, jaringan: 0.05 } } },
  { id: 'sosialisasi', group: 'Sosial & keluarga', max: 30, name: 'Bergaul & nongkrong', desc: 'Datang ke acara, ngopi, kenalan dengan orang baru.', fx: { attr: { jaringan: 0.35, karisma: 0.1 }, money: -0.5 } },
  { id: 'blusukan', group: 'Sosial & keluarga', max: 30, name: 'Kegiatan warga', desc: 'Gotong royong, hadir di hajatan, ikut rapat RT.', fx: { pop: { desa: 0.5, kabupaten: 0.15 }, attr: { karisma: 0.1 } } },
  { id: 'pasangan', group: 'Sosial & keluarga', max: 30, name: 'Waktu untuk pasangan', desc: 'Makan malam, jalan-jalan, atau sekadar telepon berjam-jam.', fx: { attr: { stres: -1 }, money: -0.8 }, need: 'partner' },
  { id: 'keluarga', group: 'Sosial & keluarga', max: 40, name: 'Waktu bersama keluarga', desc: 'Antar anak sekolah, makan bersama, libur akhir pekan.', fx: { attr: { stres: -1.4, kesehatan: 0.1 } }, need: 'family' },
  { id: 'pulang', group: 'Sosial & keluarga', max: 12, name: 'Pulang kampung & jenguk orang tua', desc: 'Menengok orang tua dan tetangga di kampung. Ongkosnya tidak gratis.', fx: { attr: { stres: -0.8, integritas: 0.05 }, pop: { desa: 0.3 }, money: -0.6 }, need: 'rantau' },
  { id: 'citra', group: 'Sosial & keluarga', max: 20, name: 'Olah citra media', desc: 'Bayar tim media untuk menampilkan namamu. Sekitar 2 juta/bulan per 10 jam.', fx: { money: -2, pop: { provinsi: 0.25, nasional: 0.2 } }, need: 'money' },
  { id: 'istirahat', group: 'Diri sendiri', max: 40, name: 'Santai & hiburan', desc: 'Nonton, main gim, jalan-jalan, tidak memikirkan apa-apa.', fx: { attr: { stres: -2.5, kesehatan: 0.3 } } },
];
export const PLAN_GROUPS: PlanAction['group'][] = ['Belajar & karier', 'Cari uang tambahan', 'Sosial & keluarga', 'Diri sendiri'];

// ---------- Kebiasaan ----------
export const HABITS: Habit[] = [
  { id: 'olahraga', name: 'Olahraga rutin', desc: 'Lari pagi, senam, atau main bola tiap pekan.', fx: { attr: { kesehatan: 0.25, stres: -0.5 } }, good: true },
  { id: 'membaca', name: 'Membaca buku', desc: 'Selalu ada buku di tas.', fx: { attr: { kecerdasan: 0.2 } }, good: true },
  { id: 'ibadah', name: 'Taat beribadah', desc: 'Rajin ke tempat ibadah dan pengajian.', fx: { attr: { integritas: 0.12, stres: -0.4 } }, good: true },
  { id: 'bangun_pagi', name: 'Bangun pagi', desc: 'Sudah beraktivitas sebelum matahari terbit.', fx: { attr: { kesehatan: 0.1, kecerdasan: 0.06, stres: -0.15 } }, good: true },
  { id: 'menabung', name: 'Menabung & investasi', desc: 'Menyisihkan uang dan menaruhnya di tabungan.', fx: {}, good: true },
  { id: 'menulis', name: 'Menulis opini', desc: 'Rutin mengirim tulisan ke koran dan media daring.', fx: { attr: { kecerdasan: 0.08 }, pop: { provinsi: 0.08, nasional: 0.08 } }, good: true },
  { id: 'relawan', name: 'Jadi relawan', desc: 'Ikut kegiatan sosial dan tanggap bencana.', fx: { attr: { integritas: 0.1 }, pop: { desa: 0.2, kabupaten: 0.08 } }, good: true },
  { id: 'nongkrong', name: 'Nongkrong di warung kopi', desc: 'Berjam-jam ngobrol di warung kopi.', fx: { attr: { jaringan: 0.2, kecerdasan: -0.05 }, money: -0.3 }, good: true },
  { id: 'medsos', name: 'Aktif di media sosial', desc: 'Rajin mengunggah dan berkomentar di media sosial.', fx: { attr: { stres: 0.3 }, pop: { nasional: 0.12, provinsi: 0.06 } }, good: true },
  { id: 'begadang', name: 'Begadang', desc: 'Tidur larut hampir tiap malam.', fx: { attr: { kesehatan: -0.25, jaringan: 0.08, stres: 0.2 } }, good: false },
  { id: 'merokok', name: 'Merokok', desc: 'Sebungkus sehari, biasanya sambil ngobrol di pos ronda.', fx: { attr: { kesehatan: -0.3, jaringan: 0.06, stres: -0.2 }, money: -0.4 }, good: false },
  { id: 'judi', name: 'Berjudi', desc: 'Taruhan kartu, bola, atau apa saja.', fx: { attr: { stres: 0.3, integritas: -0.15 }, heat: 0.15 }, good: false },
  { id: 'foya', name: 'Hidup mewah', desc: 'Barang bermerek, restoran mahal, pesta.', fx: { attr: { karisma: 0.12, jaringan: 0.12, integritas: -0.08 }, pop: { desa: -0.1 } }, good: false },
  { id: 'minum', name: 'Mabuk-mabukan', desc: 'Sering minum-minum sampai larut.', fx: { attr: { kesehatan: -0.3, jaringan: 0.1, integritas: -0.1, stres: -0.3 }, money: -0.8, heat: 0.08 }, good: false },
  { id: 'dukun', name: 'Rajin ke orang pintar', desc: 'Rutin minta petunjuk ke orang pintar.', fx: { attr: { stres: -0.5, kecerdasan: -0.05 }, money: -1, heat: 0.03 }, good: false },
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
  { id: 'infra', name: 'Bangun jalan & irigasi', desc: 'Perbaikan jalan, jembatan, dan saluran irigasi.', cost: 12, fx: { region: { infrastruktur: 3, kepuasan: 1 } } },
  { id: 'bansos', name: 'Bantuan untuk warga miskin', desc: 'Sembako dan uang tunai untuk keluarga miskin.', cost: 10, fx: { region: { kesejahteraan: 2.5, kepuasan: 1.5 } } },
  { id: 'aman', name: 'Tertibkan keamanan', desc: 'Ronda, kamera pengawas, kerja sama dengan polisi.', cost: 8, fx: { region: { keamanan: 3, kepuasan: 0.8 } } },
  { id: 'layanan', name: 'Benahi layanan publik', desc: 'Puskesmas, sekolah, dan kantor perizinan.', cost: 10, fx: { region: { layanan: 3, kepuasan: 1 } } },
  { id: 'pad', name: 'Genjot pendapatan daerah', desc: 'Naikkan pajak dan retribusi daerah.', cost: 0, fx: { region: { kas: 18, kepuasan: -1.5 } } },
  { id: 'pencitraan', name: 'Acara seremonial & baliho', desc: 'Peresmian, festival, dan baliho bergambar wajahmu.', cost: 10, fx: { region: { kepuasan: 3 }, pop: { provinsi: 0.3, nasional: 0.15 } } },
  { id: 'titipan', name: 'Proyek titipan (mark-up)', desc: 'Proyek dari rekanan dekat dengan anggaran yang digelembungkan.', cost: 15, fx: { region: { infrastruktur: 0.8 }, heat: 5, attr: { integritas: -1.5 }, flags: ['korupsi_proyek'], hint: 'Auditor dan wartawan punya ingatan panjang.' } },
  { id: 'hemat', name: 'Tidak ada program (hemat kas)', desc: 'Bulan ini tidak ada program baru.', cost: 0, fx: { region: { kas: 6, kepuasan: -0.4 } } },
];

// ---------- Janji kampanye ----------
export const PROMISES: CampaignPromise[] = [
  { id: 'jalan_mulus', name: 'Jalan mulus sampai pelosok', desc: 'Janji memperbaiki jalan di seluruh wilayah.', levels: ['kades', 'bupati', 'gubernur'], momentum: 7 },
  { id: 'warga_sejahtera', name: 'Tak ada lagi warga kelaparan', desc: 'Janji mengangkat kesejahteraan warga.', levels: ['kades', 'bupati', 'gubernur'], momentum: 7 },
  { id: 'kampung_aman', name: 'Wilayah bebas begal', desc: 'Janji memberantas kejahatan di wilayah.', levels: ['kades', 'bupati', 'gubernur'], momentum: 6 },
  { id: 'layanan_gratis', name: 'Berobat dan sekolah gratis', desc: 'Janji menggratiskan layanan kesehatan dan sekolah.', levels: ['bupati', 'gubernur'], momentum: 7 },
  { id: 'sekolah_gratis', name: 'Sekolah gratis sampai kuliah', desc: 'Janji membiayai pendidikan semua anak.', levels: ['presiden'], momentum: 7 },
  { id: 'lapangan_kerja', name: 'Sepuluh juta lapangan kerja', desc: 'Janji membuka lapangan kerja besar-besaran.', levels: ['presiden'], momentum: 8 },
  { id: 'berantas_korupsi', name: 'Sikat koruptor tanpa pandang bulu', desc: 'Janji menindak semua koruptor.', levels: ['presiden'], momentum: 8 },
  { id: 'harga_murah', name: 'Harga sembako murah', desc: 'Janji menjaga harga kebutuhan pokok.', levels: ['presiden'], momentum: 7 },
  { id: 'ekonomi_meroket', name: 'Ekonomi meroket', desc: 'Janji melipatgandakan ekonomi.', levels: ['presiden'], momentum: 9 },
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
  { id: 'subsidi_bbm', name: 'Subsidi BBM besar-besaran', desc: 'Negara menanggung sebagian besar harga BBM.', tag: 'rakyat', capital: 10, cost: 1.6, mods: { inflasi: -1.2, kebahagiaan: 5, lingkungan: -6, approval: 5 } },
  { id: 'sekolah_gratis', name: 'Wajib belajar 12 tahun gratis', desc: 'Negara membiayai sekolah sampai SMA untuk semua anak.', tag: 'rakyat', capital: 20, cost: 1.0, mods: { pendidikan: 12, kemiskinan: -1, kriminalitas: -3 } },
  { id: 'jaminan_kesehatan', name: 'Jaminan kesehatan semesta', desc: 'Semua warga ditanggung berobat oleh negara.', tag: 'rakyat', capital: 22, cost: 1.2, mods: { kesehatan: 14, kebahagiaan: 4, kemiskinan: -1 } },
  { id: 'kpk_kuat', name: 'Perkuat komisi antikorupsi', desc: 'Tambah wewenang, anggaran, dan penyidik komisi antikorupsi.', tag: 'reformis', capital: 30, cost: 0.1, mods: { korupsi: -16, pertumbuhan: 0.2 }, instant: { coalition: -8 }, hint: 'Komisi yang kuat juga bisa memeriksa presidennya.' },
  { id: 'kpk_lemah', name: 'Lemahkan komisi antikorupsi', desc: 'Pangkas wewenang penyadapan dan penyidikan komisi antikorupsi.', tag: 'otoriter', capital: 15, cost: 0, mods: { korupsi: 14, approval: -6 }, instant: { coalition: 10, heat: -25, flags: ['lemahkan_kpk'] }, hint: 'Sejarah akan mencatat ini.' },
  { id: 'hilirisasi', name: 'Hilirisasi tambang', desc: 'Larang ekspor bahan mentah dan wajibkan pengolahan di dalam negeri.', tag: 'nasionalis', capital: 20, cost: 0.4, mods: { pertumbuhan: 0.7, pengangguran: -0.6, lingkungan: -8 }, instant: { diplo: -6 } },
  { id: 'moratorium_hutan', name: 'Moratorium tebang hutan', desc: 'Hentikan semua izin baru penebangan hutan.', tag: 'hijau', capital: 18, cost: 0.1, mods: { lingkungan: 16, pertumbuhan: -0.3 } },
  { id: 'upah_naik', name: 'Naikkan upah minimum 20%', desc: 'Upah minimum naik 20% di seluruh negeri.', tag: 'rakyat', capital: 14, cost: 0, mods: { kemiskinan: -1.5, pengangguran: 0.8, inflasi: 0.5, kebahagiaan: 3 } },
  { id: 'pajak_progresif', name: 'Pajak tinggi untuk orang kaya', desc: 'Tarif pajak lebih tinggi untuk penghasilan dan kekayaan besar.', tag: 'rakyat', capital: 22, cost: -1.0, mods: { pertumbuhan: -0.3, kemiskinan: -0.5 } },
  { id: 'tax_amnesty', name: 'Pengampunan pajak', desc: 'Harta yang belum dilaporkan diampuni dengan membayar tebusan.', tag: 'bisnis', capital: 12, cost: -0.6, mods: { korupsi: 4, pertumbuhan: 0.2 } },
  { id: 'omnibus', name: 'UU sapu jagat investasi', desc: 'Satu undang-undang yang merombak aturan izin usaha, ketenagakerjaan, dan lingkungan.', tag: 'bisnis', capital: 25, cost: 0, mods: { pertumbuhan: 0.9, pengangguran: -0.8, lingkungan: -7, kebahagiaan: -3, approval: -4 } },
  { id: 'wajib_militer', name: 'Wajib militer', desc: 'Semua pemuda wajib ikut pelatihan militer.', tag: 'nasionalis', capital: 18, cost: 0.5, mods: { militer: 14, kebahagiaan: -3, kriminalitas: -2 } },
  { id: 'hukuman_berat', name: 'Hukuman mati bandar narkoba', desc: 'Bandar narkoba dihukum mati.', tag: 'otoriter', capital: 10, cost: 0, mods: { kriminalitas: -6, approval: 3 }, instant: { diplo: -8 } },
  { id: 'sensor_media', name: 'UU ketertiban informasi', desc: 'Penyebar informasi yang dianggap meresahkan bisa dipidana.', tag: 'otoriter', capital: 22, cost: 0, mods: { stabilitas: 6, korupsi: 6, kebahagiaan: -4 }, instant: { flags: ['bungkam_pers'], diplo: -5 }, hint: 'Yang dibungkam tidak hilang; hanya menunggu.' },
  { id: 'otonomi', name: 'Otonomi daerah luas', desc: 'Wewenang dan anggaran lebih besar diserahkan ke daerah.', tag: 'reformis', capital: 15, cost: 0.2, mods: { stabilitas: 4, korupsi: 4, infrastruktur: 4 } },
  { id: 'ibu_kota', name: 'Pindahkan ibu kota', desc: 'Bangun ibu kota baru di luar pulau utama.', tag: 'nasionalis', capital: 30, cost: 1.5, mods: { infrastruktur: 10, pertumbuhan: 0.4, lingkungan: -5 }, hint: 'Megaproyek bisa jadi monumen, bisa jadi kota hantu.' },
  { id: 'swasembada', name: 'Swasembada pangan', desc: 'Cetak sawah baru dan subsidi pupuk besar-besaran.', tag: 'nasionalis', capital: 14, cost: 0.6, mods: { inflasi: -0.8, kemiskinan: -1, lingkungan: -4 } },
  { id: 'digitalisasi', name: 'Birokrasi digital', desc: 'Semua layanan pemerintah dipindah ke sistem daring.', tag: 'reformis', capital: 16, cost: 0.3, mods: { korupsi: -7, pertumbuhan: 0.3 } },
  { id: 'bansos', name: 'Bantuan tunai langsung', desc: 'Uang tunai dibagikan langsung ke keluarga miskin.', tag: 'rakyat', capital: 10, cost: 1.0, mods: { kemiskinan: -3, kebahagiaan: 4, approval: 4, inflasi: 0.4 } },
  { id: 'energi_hijau', name: 'Transisi energi bersih', desc: 'Ganti pembangkit batu bara dengan energi terbarukan.', tag: 'hijau', capital: 20, cost: 0.8, mods: { lingkungan: 12, kesehatan: 3, pertumbuhan: 0.1 }, instant: { diplo: 5 } },
  { id: 'pasar_bebas', name: 'Buka pasar seluas-luasnya', desc: 'Hapus hambatan impor dan buka semua sektor untuk investor asing.', tag: 'liberal', capital: 18, cost: 0, mods: { pertumbuhan: 0.6, inflasi: -0.5, pengangguran: 0.4 }, instant: { diplo: 8 } },
  { id: 'syariah_ekonomi', name: 'Dana abadi umat & zakat negara', desc: 'Negara mengelola dana zakat dan wakaf secara nasional.', tag: 'religius', capital: 12, cost: 0.1, mods: { kemiskinan: -1.2, kebahagiaan: 2 } },
  { id: 'polisi_bersih', name: 'Reformasi kepolisian', desc: 'Rombak kepolisian: gaji, rekrutmen, dan pengawasan.', tag: 'reformis', capital: 20, cost: 0.4, mods: { kriminalitas: -8, korupsi: -5 } },
  { id: 'modernisasi_alutsista', name: 'Modernisasi persenjataan', desc: 'Beli jet tempur, kapal selam, dan sistem pertahanan baru.', tag: 'nasionalis', capital: 15, cost: 1.0, mods: { militer: 18 } },
  { id: 'darurat', name: 'Dekrit keadaan darurat', desc: 'Presiden mengambil kekuasaan penuh atas nama ketertiban.', tag: 'otoriter', capital: 35, cost: 0.3, mods: { stabilitas: 12, kebahagiaan: -8, approval: -8, kriminalitas: -5 }, instant: { flags: ['dekrit_darurat'], diplo: -12 }, hint: 'Kekuasaan yang dipinjam jarang dikembalikan.' },
  { id: 'tiga_periode', name: 'Amandemen: hapus batas masa jabatan', desc: 'Ubah konstitusi supaya presiden bisa menjabat tanpa batas.', tag: 'otoriter', capital: 60, cost: 0, mods: { stabilitas: -10, kebahagiaan: -8, approval: -12, korupsi: 8 }, instant: { flags: ['diktator'], diplo: -20 }, hint: 'Tidak ada jalan pulang dari keputusan ini.' },
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
  luar_negeri: { w: { kecerdasan: 3, karisma: 1 }, bar: 68, note: 'Esai, rekomendasi, dan wawancara. Salah satu seleksi tersulit di dunia.' },
  australis_u: { w: { kecerdasan: 3, karisma: 1 }, bar: 58, note: 'Nilai akademik dan tes bahasa; esai singkat.' },
  temasik_u: { w: { kecerdasan: 4, karisma: 1 }, bar: 64, note: 'Nilai dan ujian masuk; persaingan se-Asia.' },
  tiongkara_u: { w: { kecerdasan: 3 }, bar: 54, note: 'Nilai akademik; kursi kelas internasional cukup banyak.' },
  iup: { w: { kecerdasan: 3, karisma: 1 }, bar: 58, net: 0.03, note: 'Ujian masuk, tes bahasa Inggris, dan wawancara.' },
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
  ojol: { w: {}, bar: 0, auto: true, note: 'Cukup punya motor dan SIM. Daftar lewat aplikasi.' },
  koki: { w: { kesehatan: 1, kecerdasan: 1 }, bar: 35, note: 'Uji masak di dapur. Tahan panas, tahan dimarahi.' },
  atlet: { w: { kesehatan: 4, karisma: 1 }, bar: 70, note: 'Seleksi klub dan pelatnas. Hanya yang bertubuh prima dan masih muda.' },
  programmer: { w: { kecerdasan: 3, jaringan: 1 }, bar: 56, note: 'Tes ngoding dan wawancara teknis. Ijazah tidak wajib, kemampuan wajib.' },
  data: { w: { kecerdasan: 3 }, bar: 57, note: 'Studi kasus data dan wawancara.' },
  akuntan: { w: { kecerdasan: 2, integritas: 1 }, bar: 52, note: 'Tes akuntansi dan pajak.' },
  bankir: { w: { kecerdasan: 2, karisma: 1, jaringan: 1 }, bar: 54, net: 0.05, note: 'Program pengembangan staf: psikotes dan wawancara berlapis.' },
  konsultan: { w: { kecerdasan: 3, karisma: 2 }, bar: 66, net: 0.05, note: 'Studi kasus bertubi-tubi; lulusan kampus top didahulukan.' },
  polisi: { w: { kesehatan: 3, integritas: 1, kecerdasan: 1 }, bar: 58, net: 0.12, note: 'Tes fisik, psikologi, dan akademik. Katanya bisa "dibantu" orang dalam.' },
  jaksa: { w: { kecerdasan: 3, integritas: 1 }, bar: 60, net: 0.1, note: 'Seleksi calon jaksa: ujian hukum dan pendidikan pembentukan.' },
  diplomat: { w: { kecerdasan: 3, karisma: 2 }, bar: 65, note: 'Seleksi kementerian luar negeri: bahasa asing, wawasan, wawancara.' },
  perawat: { w: { kecerdasan: 1, integritas: 1, kesehatan: 1 }, bar: 45, note: 'Uji kompetensi perawat.' },
  apoteker: { w: { kecerdasan: 2, integritas: 1 }, bar: 52, note: 'Uji kompetensi apoteker.' },
  psikolog: { w: { kecerdasan: 2, karisma: 1 }, bar: 55, note: 'Izin praktik psikolog dari asosiasi profesi.' },
  peneliti: { w: { kecerdasan: 4 }, bar: 62, note: 'Badan riset menilai publikasi dan proposal riset.' },
  desainer: { w: { karisma: 2, kecerdasan: 1 }, bar: 46, note: 'Portofolio adalah segalanya.' },
  musisi: { w: { karisma: 3 }, bar: 52, note: 'Tidak ada lowongan musisi; kamu harus dilirik label atau penonton.' },
  penulis: { w: { kecerdasan: 2, karisma: 1 }, bar: 0, auto: true, note: 'Siapa pun boleh menulis. Yang menyeleksi adalah pembaca.' },
  startup: { w: {}, bar: 0, auto: true, note: 'Dirikan sendiri. Investor dan pasar yang akan menghakimi.' },
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
