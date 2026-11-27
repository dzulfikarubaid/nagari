import type { GameEvent } from '../sim/types';

/**
 * Kehidupan sehari-hari: asmara, keluarga, rumah, kampus, riset, organisasi, kerja.
 * Teks boleh memuat $pasangan, $anak, $kota.
 */
export const EVENTS_PERSONAL: GameEvent[] = [
  // ---------------- Asmara ----------------
  {
    id: 'p_ldr',
    title: 'Beda Zona Waktu',
    text: 'Kamu di $kota, $pasangan di rumah. Telepon jam sebelas malam di sana berarti jam empat pagi di sini. Pesan terakhirnya: "Kita masih baik-baik saja, kan?"',
    when: { partner: ['pacaran', 'tunangan'], abroad: true },
    weight: 5,
    choices: [
      { label: 'Pasang alarm dan telepon tiap malam', fx: { love: 12, attr: { stres: 4, kesehatan: -1 } }, result: 'Kantung matamu menebal. Hubungan kalian juga.' },
      { label: 'Beli tiket pulang saat liburan (15 juta)', need: { moneyMin: 15 }, fx: { money: -15, love: 20, attr: { stres: -4 } }, result: 'Dua minggu yang terasa dua hari. Bandara jadi tempat paling sedih di dunia.' },
      { label: 'Jujur: kamu butuh fokus kuliah dulu', fx: { love: -15, attr: { stres: -2 } }, outcomes: [{ chance: 0.4, text: '$pasangan bilang mengerti. Lalu berhenti membalas pesan.', fx: { endPartner: true } }] , result: '$pasangan diam lama, lalu berkata "oke". Kata itu terasa sangat panjang.' },
    ],
  },
  {
    id: 'p_ultah_pasangan',
    title: 'Tanggal yang Terlupa',
    text: 'Pukul sebelas malam. Ponselmu berbunyi: foto kue ulang tahun dengan satu lilin, dikirim $pasangan. Tanpa kata-kata. Kamu lupa.',
    when: { partner: ['pacaran', 'tunangan', 'menikah'] },
    weight: 3,
    choices: [
      { label: 'Ngebut cari kado dan datang malam itu juga', need: { moneyMin: 3 }, fx: { money: -3, love: 6, attr: { stres: 2 } }, result: 'Toko yang masih buka hanya minimarket. Tapi kamu datang, dan itu yang dihitung.' },
      { label: 'Minta maaf panjang lewat pesan', fx: { love: -6 }, result: '"Iya." Dua huruf, tanpa emoji.' },
      { label: 'Pura-pura sudah menyiapkan kejutan untuk besok', fx: { love: 2, attr: { integritas: -1, stres: 3 } }, outcomes: [{ chance: 0.4, text: 'Kejutan dadakanmu ketahuan dadakan. $pasangan tertawa, lalu menangis, lalu tertawa lagi.', fx: { love: -8 } }], result: 'Kamu begadang menyiapkan kejutan. Untungnya berhasil.' },
    ],
  },
  {
    id: 'p_mertua',
    title: 'Makan Malam dengan Calon Mertua',
    text: 'Ayah $pasangan meletakkan sendok, menatapmu, dan bertanya pelan: "Jadi, rencanamu ke depan apa?"',
    when: { partner: ['pacaran', 'tunangan'], minAge: 22 },
    weight: 3,
    once: true,
    choices: [
      { label: 'Jawab jujur, apa adanya', fx: { attr: { integritas: 1 } }, outcomes: [{ chance: 0.6, text: 'Beliau mengangguk. "Yang penting jujur dan mau kerja keras."', fx: { love: 8 } }, { chance: 0.4, text: 'Beliau diam lama. Ibunya mengambilkanmu lauk, sebagai bentuk kasihan.', fx: { love: -5 } }] },
      { label: 'Lebih-lebihkan sedikit soal karier dan gaji', fx: { love: 5, attr: { integritas: -2 }, flags: ['bohong_mertua'] }, result: 'Mata calon mertuamu berbinar. Kebohongan kecil itu akan ikut duduk di setiap acara keluarga.' },
      { label: 'Alihkan ke obrolan soal sepak bola', fx: { attr: { karisma: 1 } }, result: 'Ternyata beliau pendukung klub yang sama. Rencana masa depan bisa dibahas lain kali.' },
    ],
  },
  {
    id: 'p_godaan',
    title: 'Pesan Larut Malam',
    text: 'Rekan kerja yang selama ini akrab mengirim pesan pukul sebelas malam: "Kamu kelihatan capek akhir-akhir ini. Mau ngobrol? Aku dengerin kok." $pasangan sudah tidur di sebelahmu.',
    when: { partner: ['menikah'], minAge: 28 },
    weight: 2,
    choices: [
      { label: 'Tidak dibalas. Tidur.', fx: { attr: { integritas: 1 } }, result: 'Besoknya kalian bersikap biasa. Kamu lega.' },
      { label: 'Balas, sekadar ngobrol', fx: { attr: { stres: -3, integritas: -3 }, heat: 2, flags: ['selingkuh'], schedule: [{ id: 'p_selingkuh_ketahuan', min: 4, max: 30, chance: 0.6 }], hint: 'Riwayat percakapan tidak pernah benar-benar terhapus.' }, result: 'Obrolannya ringan dan menyenangkan. Itulah masalahnya.' },
      { label: 'Ceritakan pada $pasangan', fx: { love: 6 }, result: '$pasangan memelukmu. "Makasih sudah jujur."' },
    ],
  },
  {
    id: 'p_selingkuh_ketahuan',
    title: 'Layar Ponsel yang Menyala',
    text: 'Ponselmu tertinggal di meja makan. Notifikasi muncul. $pasangan membacanya, lalu menatapmu tanpa berkata apa-apa.',
    choices: [
      { label: 'Akui dan minta kesempatan kedua', fx: { love: -30, attr: { stres: 10, integritas: 2 } }, result: 'Malam terpanjang dalam hidupmu. Pagi datang; kalian masih satu rumah, untuk sekarang.' },
      { label: 'Menyangkal semuanya', fx: { love: -20, attr: { integritas: -4, stres: 6 } }, outcomes: [{ chance: 0.5, text: '$pasangan menemukan percakapan lain. Koper sudah dikemas sebelum magrib.', fx: { endPartner: true } }] },
      { label: 'Sudahi saja pernikahan ini', fx: { endPartner: true, money: -20, attr: { stres: 6 } }, result: 'Sidang cerai berlangsung singkat dan dingin.' },
    ],
  },
  // ---------------- Keluarga ----------------
  {
    id: 'p_ortu_sakit',
    title: 'Telepon dari Kampung',
    text: 'Kakakmu menelepon dengan suara serak: ayah masuk rumah sakit. Kata dokter perlu operasi, dan kamar kelas tiga sudah penuh.',
    when: { minAge: 26 },
    weight: 3,
    choices: [
      { label: 'Tanggung biaya rumah sakit (30 juta)', need: { moneyMin: 30 }, fx: { money: -30, attr: { stres: 3, integritas: 2 }, pop: { desa: 2 } }, result: 'Operasinya berhasil. Ayahmu memegang tanganmu dan tidak berkata apa-apa. Tidak perlu.' },
      { label: 'Pulang menemani, biaya patungan saudara', fx: { money: -8, attr: { stres: 5 } }, result: 'Seminggu tidur di kursi lorong rumah sakit. Pekerjaanmu menumpuk, hatimu tenang.' },
      { label: 'Kirim sedikit uang, kerjaan tidak bisa ditinggal', fx: { money: -3, attr: { stres: 6, integritas: -1 } }, result: 'Ayahmu pulih. Ibumu bilang dia sering menanyakanmu.' },
    ],
  },
  {
    id: 'p_anak_demam',
    title: 'Demam Tengah Malam',
    text: '$anak menggigil dengan suhu 40 derajat. Jam dua pagi. Besok ada rapat penting yang tidak boleh kamu lewatkan.',
    when: { kids: true },
    weight: 3,
    choices: [
      { label: 'Bawa ke IGD dan jaga sampai pagi', fx: { attr: { stres: 4, kesehatan: -1 }, money: -2, love: 4 }, result: 'Demam berdarah, kata dokter, tapi tertangani tepat waktu. Rapatnya kamu ikuti lewat ponsel dari lorong rumah sakit.' },
      { label: 'Kompres, beri obat, dan tetap berangkat rapat', fx: { attr: { stres: 3 }, love: -4 }, outcomes: [{ chance: 0.25, text: 'Sore harinya kondisi $anak memburuk dan harus dirawat inap. Kamu menyesal sepanjang jalan ke rumah sakit.', fx: { money: -10, attr: { stres: 8 } } }], result: 'Pagi harinya demamnya turun. Kamu lega, sedikit malu.' },
    ],
  },
  {
    id: 'p_sekolah_anak',
    title: 'Mau Sekolah di Mana?',
    text: '$anak sudah waktunya masuk sekolah. Pilihannya: sekolah negeri dekat rumah, sekolah swasta internasional yang mahal, atau pesantren.',
    when: { kids: true, minAge: 30 },
    weight: 2,
    once: true,
    choices: [
      { label: 'Sekolah negeri dekat rumah', fx: { pop: { desa: 1 } }, result: '$anak berangkat jalan kaki bersama anak-anak tetangga.' },
      { label: 'Sekolah swasta internasional (60 juta)', need: { moneyMin: 60 }, fx: { money: -60, attr: { jaringan: 3 }, pop: { desa: -1 } }, result: 'Seragamnya bagus, teman-temannya anak pejabat dan pengusaha. Termasuk anak saingan bisnismu.' },
      { label: 'Pesantren', fx: { attr: { integritas: 1 }, pop: { desa: 2 } }, result: '$anak menangis di hari pertama, lalu menelepon minggu depannya dengan bangga hafal surat baru.' },
    ],
  },
  // ---------------- Rumah ----------------
  {
    id: 'p_banjir',
    title: 'Air Masuk Rumah',
    text: 'Hujan semalaman. Pukul tiga pagi air sudah setinggi lutut di $kota, termasuk di dalam tempat tinggalmu.',
    when: { housing: ['kos', 'kontrakan', 'rumah'], city: ['ibukota', 'provinsi', 'kabupaten'] },
    weight: 2,
    choices: [
      { label: 'Selamatkan barang, lalu bantu tetangga mengungsi', fx: { money: -4, attr: { kesehatan: -1, integritas: 1 }, pop: { kabupaten: 1 } }, result: 'Kasurmu tidak tertolong. Tapi nenek di sebelah sempat dievakuasi.' },
      { label: 'Fokus selamatkan barang berharga sendiri', fx: { money: -2 }, result: 'Laptop dan surat-surat selamat. Selebihnya urusan nanti.' },
    ],
  },
  {
    id: 'p_ibu_kos',
    title: 'Ibu Kos Naik Pitam',
    text: 'Ibu kos mengetuk pintu kamarmu keras-keras: "Jangan bawa teman menginap! Listrik naik, kamu tambah dua ratus ribu bulan ini."',
    when: { housing: ['kos'] },
    weight: 2,
    choices: [
      { label: 'Bayar dan minta maaf', fx: { money: -0.2 }, result: 'Ibu kos mendadak ramah dan menawarimu gorengan.' },
      { label: 'Protes: listrik sudah termasuk sewa', fx: { attr: { karisma: 1, stres: 2 } }, outcomes: [{ chance: 0.5, text: 'Ibu kos mengalah, tapi kini menatapmu curiga setiap kamu pulang malam.', fx: {} }, { chance: 0.5, text: 'Ibu kos memberimu waktu sebulan untuk mencari tempat lain.', fx: { attr: { stres: 3 } } }] },
    ],
  },
  {
    id: 'p_kpr_naik',
    title: 'Bunga KPR Naik',
    text: 'Surat dari bank: suku bunga KPR-mu naik mengikuti bunga acuan. Cicilan bulan depan bertambah.',
    when: { housing: ['rumah'], moneyMax: 400 },
    weight: 2,
    choices: [
      { label: 'Telan saja, kencangkan ikat pinggang', fx: { money: -12, attr: { stres: 4 } }, result: 'Makan di luar jadi kemewahan. Tapi rumah tetap milikmu.' },
      { label: 'Ajukan restrukturisasi ke bank', fx: { money: -3, attr: { stres: 2 } }, result: 'Tenor diperpanjang. Kamu akan membayar lebih lama, tapi bisa bernapas.' },
    ],
  },
  {
    id: 'p_tetangga',
    title: 'Tetangga Baru',
    text: 'Tetangga baru di $kota mengetuk pintu membawa sepiring kue: "Salam kenal, saya baru pindah. Kalau butuh apa-apa, bilang saja."',
    weight: 2,
    choices: [
      { label: 'Ajak masuk dan ngobrol', fx: { attr: { jaringan: 2, stres: -1 } }, result: 'Ternyata dia bekerja di kantor yang selama ini ingin kamu masuki.' },
      { label: 'Terima kuenya, basa-basi sebentar', fx: { attr: { karisma: 0.5 } }, result: 'Kuenya enak. Kamu tidak sempat menanyakan namanya.' },
    ],
  },
  // ---------------- Kampus, riset, organisasi ----------------
  {
    id: 'p_data_riset',
    title: 'Data yang Membangkang',
    text: 'Enam bulan pengumpulan data, dan hasilnya tidak mendukung hipotesismu. Sama sekali. Tenggat jurnal dua minggu lagi.',
    when: { research: true },
    weight: 4,
    choices: [
      { label: 'Laporkan apa adanya; hasil negatif juga ilmu', fx: { attr: { integritas: 3, kecerdasan: 2, stres: 3 } }, result: 'Pembimbingmu terkejut, lalu tersenyum: "Ini justru menarik." Naskahmu perlu ditulis ulang, dengan cara yang lebih jujur.' },
      { label: '"Rapikan" sedikit angkanya', fx: { attr: { integritas: -6, stres: -2 }, heat: 3, flags: ['fabrikasi_data'], schedule: [{ id: 'p_retraksi', min: 18, max: 90, chance: 0.55 }], hint: 'Data asli masih tersimpan di laptop laboratorium.' }, result: 'Grafiknya kini cantik. Kamu tidak menatapnya terlalu lama.' },
      { label: 'Ulang eksperimen dari awal', fx: { attr: { stres: 6, kecerdasan: 3, kesehatan: -1 } }, result: 'Tiga bulan tambahan di laboratorium. Hasil keduanya lebih masuk akal.' },
    ],
  },
  {
    id: 'p_retraksi',
    title: 'Surel dari Editor Jurnal',
    text: 'Seorang peneliti dari luar negeri gagal mereplikasi hasilmu dan menemukan kejanggalan pada datamu. Editor jurnal meminta data mentah dalam tujuh hari.',
    choices: [
      { label: 'Akui kesalahan dan tarik makalahnya', fx: { attr: { integritas: 2, stres: 8 }, pop: { nasional: -2 }, flags: ['pernah_retraksi'] }, result: 'Makalahmu ditarik. Malu, tapi kariermu masih bisa diselamatkan.' },
      { label: 'Bersikeras datanya benar', fx: { attr: { stres: 6 } }, outcomes: [{ chance: 0.7, text: 'Investigasi kampus membuktikan pemalsuan. Namamu masuk daftar hitam jurnal, dan berita menyebarkannya.', fx: { attr: { integritas: -8 }, pop: { nasional: -5, provinsi: -4 }, heat: 8, flags: ['pernah_retraksi', 'plagiat'] } }], result: 'Editor tidak bisa membuktikan apa-apa. Untuk sekarang.' },
    ],
  },
  {
    id: 'p_pembimbing',
    title: 'Nama di Urutan Pertama',
    text: 'Profesor pembimbingmu membaca draf makalahmu, lalu berkata ringan: "Bagus. Nama saya taruh di depan, ya. Biar cepat tembus."',
    when: { eduLevel: ['S2', 'S3'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Setuju; politik kampus memang begitu', fx: { attr: { jaringan: 3, integritas: -1 } }, result: 'Profesor puas. Surat rekomendasinya nanti akan sangat murah hati.' },
      { label: 'Tolak dengan sopan', fx: { attr: { integritas: 2, stres: 4 } }, outcomes: [{ chance: 0.4, text: 'Profesor tersinggung. Bimbinganmu mendadak sering dibatalkan.', fx: { attr: { stres: 4, jaringan: -2 } } }], result: 'Profesor tertawa: "Bagus, kamu punya prinsip." Namamu tetap di depan.' },
    ],
  },
  {
    id: 'p_dana_org',
    title: 'Kas Organisasi',
    text: 'Bendahara organisasimu menghilang seminggu. Saat rapat, ketahuan kas acara besar tinggal separuh. Semua mata tertuju padamu sebagai pengurus.',
    when: { orgs: ['bem', 'hima', 'gerakan', 'karang_taruna', 'ormas', 'relawan', 'hipmi', 'ppn', 'alumni'] },
    weight: 2,
    choices: [
      { label: 'Usut tuntas dan laporkan terbuka', fx: { attr: { integritas: 3, karisma: 1, stres: 4 }, pop: { kabupaten: 1 } }, result: 'Bendahara mengembalikan sebagian uang. Anggota mulai menyebutmu "si lurus".' },
      { label: 'Tutup lubangnya pakai uang sendiri (5 juta)', need: { moneyMin: 5 }, fx: { money: -5, attr: { jaringan: 2 } }, result: 'Acaranya selamat. Tidak ada yang tahu, kecuali kamu dan bendahara itu.' },
      { label: 'Diamkan; bukan urusanmu', fx: { attr: { integritas: -2 } }, result: 'Acaranya batal. Gosipnya tidak.' },
    ],
  },
  {
    id: 'p_tawaran_luar',
    title: 'Pesan dari Pemburu Kepala',
    text: 'Seorang perekrut dari perusahaan di Temasik mengirim pesan: "Profil Anda menarik. Kami punya posisi dengan gaji tiga kali lipat. Tertarik ngobrol?"',
    when: { degreeMin: 'S1', langMin: 55, minAge: 24, maxAge: 45, abroad: false },
    weight: 2,
    once: true,
    choices: [
      { label: 'Tertarik; pasang target pindah ke luar negeri', fx: { attr: { stres: 2 }, flags: ['tawaran_luar'] }, result: 'Kamu menyimpan kontaknya. Untuk pindah, buka tab Hidup (butuh skor bahasa 6.5).' },
      { label: 'Tolak; hidupmu di sini', fx: { attr: { integritas: 1 } }, result: 'Kamu menghapus pesannya. Rasanya seperti menutup jendela di hari panas.' },
    ],
  },
  {
    id: 'p_reuni',
    title: 'Reuni SMA',
    text: 'Grup alumni SMA ramai: reuni dua puluh tahun. Ada yang jadi pengusaha, ada yang jadi pejabat, ada yang sudah tidak ada.',
    when: { minAge: 36 },
    weight: 2,
    once: true,
    choices: [
      { label: 'Datang dan bernostalgia', fx: { attr: { jaringan: 3, stres: -3 }, money: -1 }, result: 'Teman sebangkumu dulu kini bekerja di kementerian. Dia menyelipkan kartu namanya.' },
      { label: 'Datang dengan mobil terbaru (pamer)', need: { moneyMin: 500 }, fx: { attr: { karisma: 1, integritas: -1 }, pop: { desa: -1 } }, result: 'Semua memotret mobilmu. Beberapa sambil berbisik.' },
      { label: 'Tidak datang', fx: {}, result: 'Kamu melihat foto-fotonya di grup, sambil tersenyum sendiri.' },
    ],
  },
  {
    id: 'p_burnout',
    title: 'Pagi yang Berat',
    text: 'Alarm berbunyi. Kamu menatap langit-langit kamar selama satu jam dan tidak bisa memaksa diri bangun.',
    when: { attrMin: { stres: 75 } },
    weight: 5,
    choices: [
      { label: 'Ambil cuti dan temui psikolog (3 juta)', need: { moneyMin: 3 }, fx: { money: -3, attr: { stres: -15, kesehatan: 2 } }, result: 'Psikolognya tidak memberi jawaban ajaib, tapi pertanyaannya membantu.' },
      { label: 'Pulang ke kampung seminggu', fx: { money: -1, attr: { stres: -10 }, pop: { desa: 1 } }, result: 'Masakan ibu, suara jangkrik, dan tidak ada sinyal. Kamu tidur dua belas jam.' },
      { label: 'Paksakan; banyak yang lebih susah', fx: { attr: { stres: 3, kesehatan: -3 } }, result: 'Kamu berangkat. Tidak ada yang sadar ada yang salah, termasuk kamu.' },
    ],
  },
];
