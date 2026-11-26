import type { GameEvent } from '../sim/types';

/**
 * Event kehidupan sebelum jadi presiden: kuliah, kerja, kebiasaan, keluarga,
 * pertemanan, jabatan daerah, dan kampanye.
 * Event tanpa `weight` hanya muncul lewat `schedule` (lanjutan rantai).
 */
export const EVENTS_LIFE: GameEvent[] = [
  // =====================================================================
  // MASA KULIAH
  // =====================================================================
  {
    id: 'l_ospek_organisasi',
    title: 'Stan Organisasi',
    text: 'Minggu pertama kuliah. Lapangan kampus penuh stan organisasi. Semua menjanjikan "pengalaman", tidak ada yang menjanjikan tidur cukup.',
    when: { student: true },
    weight: 5,
    once: true,
    choices: [
      { label: 'Masuk badan eksekutif mahasiswa', fx: { attr: { karisma: 4, jaringan: 5, stres: 4 }, flags: ['anak_bem'] }, result: 'Kamu belajar rapat sampai subuh dan membagi nasi kotak secara adil. Dua-duanya ilmu politik.' },
      { label: 'Gabung pers mahasiswa', fx: { attr: { kecerdasan: 4, integritas: 2, jaringan: 2 }, flags: ['pers_kampus'] }, result: 'Tulisan pertamamu soal uang parkir kampus dibaca tiga ratus orang. Rektorat termasuk.' },
      { label: 'Fokus kuliah saja', fx: { attr: { kecerdasan: 5, stres: -2 } }, result: 'IPK aman. Namamu hanya dikenal oleh dosen wali dan penjaga perpustakaan.' },
    ],
  },
  {
    id: 'l_demo_mahasiswa',
    title: 'Turun ke Jalan',
    text: 'Harga naik, uang kuliah ikut naik. Aliansi mahasiswa menyerukan demo besar di depan gedung dewan. Mereka butuh orator.',
    when: { student: true },
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Naik ke mobil komando',
        fx: { attr: { karisma: 5, jaringan: 3, stres: 4 }, pop: { kabupaten: 3, provinsi: 2 }, flags: ['aktivis_kampus'], schedule: [{ id: 'l_kawan_demo_sukses', min: 72, max: 160 }], hint: 'Kawan di jalanan hari ini bisa jadi orang penting besok.' },
        outcomes: [
          { chance: 0.25, text: 'Gas air mata, pentungan, dan satu malam di kantor polisi. Fotomu dengan pelipis berdarah tersebar ke mana-mana.', fx: { attr: { kesehatan: -5 }, pop: { nasional: 3 }, heat: 3 } },
          { chance: 0.75, text: 'Suaramu serak tiga hari. Namamu mulai disebut di grup-grup percakapan mahasiswa.', fx: {} },
        ],
      },
      {
        label: 'Terima amplop dari "utusan" untuk membubarkan massa',
        fx: { money: 15, attr: { integritas: -6 }, heat: 5, flags: ['jual_gerakan'], schedule: [{ id: 'l_kawan_lama_membongkar', min: 60, max: 180, chance: 0.75 }], hint: 'Ada yang melihat amplop itu berpindah tangan.' },
        result: 'Massa bubar sebelum zuhur dengan alasan "evaluasi internal". Uang kosmu lunas setahun.',
      },
      { label: 'Ikut di barisan belakang', fx: { attr: { jaringan: 2 }, pop: { kabupaten: 1 } }, result: 'Kamu ikut bernyanyi, lalu pulang sebelum hujan. Tidak ada yang ingat, tidak ada yang lupa.' },
      { label: 'Tetap di kelas', fx: { attr: { kecerdasan: 2 } }, result: 'Kelas kosong. Dosennya ternyata ikut demo.' },
    ],
  },
  {
    id: 'l_joki_skripsi',
    title: 'Skripsi Mandek',
    text: 'Bab dua tidak kunjung selesai. Seorang kakak tingkat menawarkan jasa: tiga puluh hari, terima jadi, dijamin lolos cek plagiasi.',
    when: { student: true },
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Bayar joki (8 juta)',
        need: { moneyMin: 8 },
        fx: { money: -8, attr: { stres: -6, integritas: -5 }, heat: 4, flags: ['skripsi_joki'], schedule: [{ id: 'l_joki_memeras', min: 72, max: 200 }], hint: 'Dia menyimpan semua berkas dan bukti transfer.' },
        result: 'Skripsimu jadi. Kamu bahkan belajar isinya malam sebelum sidang.',
      },
      {
        label: 'Kerjakan sendiri sampai tuntas',
        fx: { attr: { kecerdasan: 5, stres: 7, kesehatan: -2, integritas: 2 }, flags: ['skripsi_asli'] },
        result: 'Tiga bulan hidup dari mi instan dan kopi saset. Tapi setiap halaman memang punyamu.',
      },
      {
        label: 'Minta bimbingan intensif ke dosen',
        need: { attrMin: { karisma: 40 } },
        fx: { attr: { kecerdasan: 3, jaringan: 3, stres: 3 }, flags: ['skripsi_asli'] },
        result: 'Dosenmu galak, tapi coretannya berguna. Dia mulai hafal namamu.',
      },
    ],
  },
  {
    id: 'l_joki_memeras',
    title: 'Pesan dari Masa Lalu',
    text: 'Nomor tak dikenal mengirim foto: halaman pengesahan skripsimu dan bukti transfer bertahun lalu. "Apa kabar, Bos? Sekarang sudah jadi orang ya. Saya lagi butuh modal."',
    choices: [
      {
        label: 'Bayar 40 juta agar diam',
        need: { moneyMin: 40 },
        fx: { money: -40, attr: { stres: 5 }, heat: 3, flags: ['diperas_joki'], schedule: [{ id: 'l_joki_memeras_lagi', min: 18, max: 48 }], hint: 'Orang yang pernah dibayar tahu jalan pulang.' },
        result: 'Dia mengirim stiker jempol. Kamu tidak merasa lebih tenang.',
      },
      {
        label: 'Abaikan dan blokir',
        fx: { attr: { stres: 4 } },
        outcomes: [
          { chance: 0.5, text: 'Sebuah akun anonim mengunggah semuanya. Kampusmu membentuk tim pemeriksa ijazah.', fx: { pop: { kabupaten: -5, provinsi: -4, nasional: -3 }, attr: { karisma: -3 }, heat: 10, flags: ['ijazah_dipersoalkan'], schedule: [{ id: 'skandal_terbongkar', min: 2, max: 8, chance: 0.5 }] } },
          { chance: 0.5, text: 'Sunyi. Mungkin dia hanya menggertak. Mungkin dia sedang menunggu waktu yang lebih mahal.', fx: { heat: 4 } },
        ],
      },
      {
        label: 'Mengaku ke publik lebih dulu',
        fx: { attr: { integritas: 6, stres: 6, karisma: -2 }, pop: { kabupaten: -3, provinsi: -3, nasional: -2 }, heat: -6, unflags: ['skripsi_joki'], flags: ['mengaku_joki'] },
        result: 'Kamu minta maaf di depan kamera. Dihujat seminggu, lalu orang lupa. Pemeras kehilangan dagangannya.',
      },
    ],
  },
  {
    id: 'l_joki_memeras_lagi',
    title: 'Dia Datang Lagi',
    text: 'Pesan yang sama, angka yang berbeda. "Yang kemarin sudah habis, Bos. Kali ini 150 juta, terakhir. Sumpah."',
    choices: [
      { label: 'Bayar lagi', need: { moneyMin: 150 }, fx: { money: -150, attr: { stres: 8 }, heat: 4, schedule: [{ id: 'skandal_terbongkar', min: 24, max: 60, chance: 0.4 }], hint: '"Terakhir" adalah kata yang lentur.' }, result: 'Dia berterima kasih dengan sopan. Kamu mulai menghitung berapa kali lagi sanggup.' },
      { label: 'Laporkan pemerasan ke polisi', fx: { attr: { integritas: 3, stres: 5 }, pop: { kabupaten: -4, provinsi: -4, nasional: -3 }, heat: -4, unflags: ['skripsi_joki'], flags: ['mengaku_joki'] }, result: 'Dia ditangkap. Berkas perkaranya memuat semua cerita skripsimu, dan wartawan membaca berkas perkara.' },
      { label: 'Tantang: "Silakan sebar"', fx: { attr: { stres: 4 } }, outcomes: [
        { chance: 0.7, text: 'Dia menyebar. Lengkap, dengan tangkapan layar percakapan lama.', fx: { pop: { kabupaten: -6, provinsi: -5, nasional: -4 }, heat: 12, flags: ['ijazah_dipersoalkan'], schedule: [{ id: 'skandal_terbongkar', min: 1, max: 6, chance: 0.6 }] } },
        { chance: 0.3, text: 'Dia mundur. Rupanya dia juga takut dipenjara.', fx: { heat: 2 } },
      ] },
    ],
  },
  {
    id: 'l_nyontek_ujian',
    title: 'Kunci Jawaban',
    text: 'Malam sebelum ujian akhir, grup kelas ramai. Seseorang membagikan foto soal besok. Katanya dari asisten dosen.',
    when: { student: true },
    weight: 3,
    choices: [
      { label: 'Pakai kuncinya', fx: { attr: { integritas: -3, stres: -2 } }, outcomes: [
        { chance: 0.2, text: 'Seluruh kelas nilainya identik, termasuk jawaban yang salah. Kamu kena skors satu semester.', fx: { attr: { stres: 8, kecerdasan: -1 }, pop: { desa: -1 }, heat: 2 } },
        { chance: 0.8, text: 'Nilai A tanpa belajar. Kamu tidak ingat satu pun isi mata kuliahnya.', fx: { attr: { kecerdasan: -1 } } },
      ] },
      { label: 'Tutup grup, belajar sendiri', fx: { attr: { kecerdasan: 2, integritas: 2, stres: 3 } }, result: 'Nilaimu B. Rasanya lebih berat dari A milik teman-temanmu.' },
      { label: 'Laporkan kebocoran ke dosen', fx: { attr: { integritas: 4, jaringan: -3, stres: 2 } }, result: 'Ujian diulang. Dosen berterima kasih. Teman sekelas tidak.' },
    ],
  },
  {
    id: 'l_beasiswa',
    title: 'Beasiswa Yayasan',
    text: 'Sebuah yayasan membuka beasiswa penuh. Pamanmu kenal salah satu panitianya. "Tinggal titip nama, beres," katanya.',
    when: { student: true, notFlags: ['latar:kaya'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Ikut seleksi lewat jalur biasa', fx: { attr: { stres: 3 } }, outcomes: [
        { chance: 0.4, text: 'Lolos. Esai yang kamu tulis sampai subuh ternyata dibaca.', fx: { money: 20, attr: { kecerdasan: 2, integritas: 2 }, flags: ['beasiswa_murni'] } },
        { chance: 0.6, text: 'Gagal di tahap wawancara. Yang lolos kebanyakan punya nama belakang yang familier.', fx: { attr: { stres: 3 } } },
      ] },
      { label: 'Titip nama lewat paman', fx: { money: 20, attr: { integritas: -4, jaringan: 2 }, heat: 3, flags: ['beasiswa_titipan'], schedule: [{ id: 'l_beasiswa_ditagih', min: 48, max: 140 }], hint: 'Panitia itu mencatat siapa saja yang berutang budi.' }, result: 'Namamu ada di pengumuman. Seseorang yang lebih layak tidak.' },
      { label: 'Tidak mendaftar', fx: { attr: { stres: -1 } }, result: 'Kamu memilih tidak repot. Uang kuliah tetap datang tiap bulan seperti tagihan listrik.' },
    ],
  },
  {
    id: 'l_beasiswa_ditagih',
    title: 'Tagihan Budi',
    text: 'Panitia beasiswa yang dulu meloloskanmu kini mengurus yayasan lain. Dia menelepon: "Dulu kan saya bantu. Sekarang gantian. Saya perlu surat rekomendasi dan sedikit dana untuk kegiatan."',
    choices: [
      { label: 'Beri 25 juta dan surat rekomendasi', need: { moneyMin: 25 }, fx: { money: -25, attr: { integritas: -2, jaringan: 2 }, heat: 3 }, result: 'Yayasannya ternyata hanya punya kop surat. Namamu kini tercantum sebagai pembina.' },
      { label: 'Tolak dengan halus', fx: { attr: { jaringan: -3, stres: 2 }, heat: 3 }, result: 'Dia tertawa kecil. "Ya sudah. Saya masih simpan daftar penerima yang dulu, lho."' },
      { label: 'Kembalikan nilai beasiswa itu ke kampus', need: { moneyMin: 20 }, fx: { money: -20, attr: { integritas: 5 }, heat: -3, unflags: ['beasiswa_titipan'] }, result: 'Kampus bingung menerimanya. Kamu tidak bingung lagi saat ditelepon orang itu.' },
    ],
  },
  {
    id: 'l_dosen_laporan',
    title: 'Proyek Dosen',
    text: 'Dosen pembimbingmu punya proyek riset dari pemerintah daerah. Dia minta kamu menandatangani daftar hadir survei lapangan yang tidak pernah ada.',
    when: { student: true },
    weight: 3,
    once: true,
    choices: [
      { label: 'Tanda tangan, terima honor', fx: { money: 6, attr: { integritas: -3, jaringan: 3 }, heat: 3, hint: 'Tanda tanganmu kini ada di laporan fiktif.' }, result: 'Honor cair. Nilai mata kuliahnya juga, kebetulan, A.' },
      { label: 'Tawarkan survei sungguhan', fx: { attr: { kecerdasan: 3, integritas: 3, stres: 4, kesehatan: -1 } }, result: 'Dua minggu keliling desa dengan motor pinjaman. Datamu jelek, tapi nyata. Dosenmu agak malu.' },
      { label: 'Menolak', fx: { attr: { integritas: 3, jaringan: -3, stres: 3 } }, result: 'Bimbinganmu mendadak sulit dijadwalkan. Dosen itu selalu "sedang di luar kota".' },
    ],
  },
  {
    id: 'l_uang_kos',
    title: 'Akhir Bulan',
    text: 'Kiriman dari rumah telat. Ibu kos sudah dua kali mengetuk pintu. Iklan pinjaman daring muncul di ponselmu seperti tahu segalanya.',
    when: { student: true, moneyMax: 6 },
    weight: 3,
    choices: [
      { label: 'Kerja paruh waktu jaga warung kopi', fx: { money: 3, attr: { stres: 4, jaringan: 2, kesehatan: -1 } }, result: 'Kuliah pagi, kerja malam. Kamu hafal pesanan semua pelanggan dan lupa jadwal kuis.' },
      { label: 'Ambil pinjaman daring 5 juta', fx: { money: 5, attr: { stres: 2 }, flags: ['pinjol'], schedule: [{ id: 'l_pinjol_teror', min: 3, max: 8 }], hint: 'Bunganya dihitung harian. Kontak ponselmu sudah mereka salin.' }, result: 'Cair dalam sepuluh menit. Syarat dan ketentuannya tidak kamu baca.' },
      { label: 'Pulang, jujur ke orang tua', fx: { money: 2, attr: { integritas: 1, stres: -2 } }, result: 'Ayahmu menjual seekor kambing tanpa banyak bicara. Kamu berjanji dalam hati akan membayarnya.' },
    ],
  },
  {
    id: 'l_pinjol_teror',
    title: 'Penagih Daring',
    text: 'Utang lima juta sudah jadi empat belas. Penagih mengirim pesan ke semua kontakmu, termasuk dosen dan calon mertua, dengan fotomu dan kata "MALING".',
    choices: [
      { label: 'Lunasi semuanya', need: { moneyMin: 14 }, fx: { money: -14, attr: { stres: -2 }, unflags: ['pinjol'] }, result: 'Lunas. Kamu menghapus aplikasinya dan separuh harga dirimu.' },
      { label: 'Gali lubang tutup lubang', fx: { attr: { stres: 8, kesehatan: -2 }, pop: { desa: -2 }, schedule: [{ id: 'l_pinjol_teror', min: 4, max: 9, chance: 0.7 }], hint: 'Lubang berikutnya lebih dalam.' }, result: 'Aplikasi kedua menutup yang pertama. Aplikasi ketiga sudah mengirim penawaran.' },
      { label: 'Lapor ke lembaga bantuan hukum', fx: { attr: { stres: 3, jaringan: 2, integritas: 1 }, pop: { desa: -1 }, unflags: ['pinjol'] }, result: 'Pinjamannya ternyata ilegal. Terornya berhenti pelan-pelan. Malunya lebih lama.' },
    ],
  },
  {
    id: 'l_senior_sayap_partai',
    title: 'Ajakan Senior',
    text: 'Seorang alumni yang kini anggota dewan mengisi seminar di kampus. Selesai acara dia menepuk bahumu. "Kamu berbakat. Ikut organisasi pemuda kami. Banyak pintu terbuka."',
    when: { student: true, attrMin: { karisma: 45 } },
    weight: 3,
    once: true,
    choices: [
      { label: 'Ikut, jadi pengurus', fx: { attr: { jaringan: 6, karisma: 2, integritas: -1, stres: 3 }, party: 5, flags: ['kader_muda'] }, result: 'Kamu belajar memasang spanduk, menyusun proposal, dan tersenyum pada orang yang tidak kamu sukai.' },
      { label: 'Datang sesekali, jaga jarak', fx: { attr: { jaringan: 3 } }, result: 'Kamu dapat beberapa kartu nama dan banyak nasi kotak.' },
      { label: 'Tolak, kampus bukan tempat partai', fx: { attr: { integritas: 3 }, pop: { kabupaten: 1 } }, result: 'Teman-teman aktivismu mengangguk hormat. Si alumni mencoret namamu dari daftar.' },
    ],
  },

  // =====================================================================
  // PEKERJAAN
  // =====================================================================
  {
    id: 'l_pns_amplop',
    title: 'Amplop di Laci',
    text: 'Seorang kontraktor kecil meninggalkan amplop cokelat di mejamu. Berkas izinnya sudah tiga minggu antre. "Sekadar uang rokok, Pak/Bu. Semua di sini juga begitu."',
    when: { jobs: ['pns'] },
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Ambil, percepat berkasnya',
        fx: { money: 10, attr: { integritas: -5 }, heat: 6, flags: ['suap_pertama'], hint: 'Orang ini tidak pernah lupa.' },
        result: 'Berkasnya selesai sore itu juga. Dia mencatat namamu di buku kecilnya, dengan tanggal.',
      },
      {
        label: 'Kembalikan, proses sesuai antrean',
        fx: { attr: { integritas: 4, jaringan: -2, stres: 2 }, flags: ['pegawai_bersih'], schedule: [{ id: 'l_pegawai_bersih_dilirik', min: 24, max: 72 }] },
        result: 'Rekan seruangan menyebutmu "sok suci". Kontraktor itu menunggu dua minggu lagi, lalu izinnya keluar juga.',
      },
      {
        label: 'Laporkan ke inspektorat',
        fx: { attr: { integritas: 6, jaringan: -5, stres: 5 }, flags: ['pegawai_bersih', 'peniup_peluit'], schedule: [{ id: 'l_pegawai_bersih_dilirik', min: 30, max: 80 }, { id: 'l_mutasi_pelosok', min: 2, max: 8, chance: 0.6 }], hint: 'Kantor ini tidak suka orang yang membuka jendela.' },
        result: 'Laporanmu diterima dengan senyum tipis. Sejak itu undangan makan siang berhenti datang.',
      },
    ],
  },
  {
    id: 'l_mutasi_pelosok',
    title: 'Surat Mutasi',
    text: 'Surat keputusan turun: kamu dipindah ke kantor kecamatan paling jauh, "demi penyegaran organisasi". Semua orang tahu alasan sebenarnya.',
    choices: [
      { label: 'Berangkat, kerja sebaik mungkin', fx: { attr: { integritas: 2, stres: 3, jaringan: -2 }, pop: { desa: 3, kabupaten: 2 } }, result: 'Di pelosok, warga belum pernah melihat pegawai yang datang tepat waktu. Mereka mengingat namamu.' },
      { label: 'Gugat ke badan kepegawaian', fx: { attr: { stres: 6 } }, outcomes: [
        { chance: 0.35, text: 'Menang. Mutasimu dibatalkan dan atasanmu ditegur. Dia tidak akan lupa.', fx: { attr: { karisma: 2 }, pop: { kabupaten: 2 } } },
        { chance: 0.65, text: 'Berkasmu "sedang diproses" sampai kamu lelah bertanya.', fx: { attr: { stres: 3 } } },
      ] },
      { label: 'Minta maaf ke atasan, cabut laporan', fx: { attr: { integritas: -5, stres: -2, jaringan: 2 }, unflags: ['peniup_peluit', 'pegawai_bersih'] }, result: 'Mutasi dibatalkan. Kamu kembali diundang makan siang. Rasanya hambar.' },
    ],
  },
  {
    id: 'l_pegawai_bersih_dilirik',
    title: 'Nama yang Bersih',
    text: 'Pimpinan baru sedang mencari orang untuk mengisi posisi penting. Dia menanyakan satu hal ke semua orang: siapa yang tidak pernah bermain? Namamu disebut berkali-kali.',
    choices: [
      { label: 'Terima jabatan itu', fx: { money: 12, attr: { jaringan: 5, karisma: 2, stres: 3 }, pop: { kabupaten: 4, provinsi: 1 }, flags: ['pejabat_bersih'] }, result: 'Bertahun-tahun dianggap bodoh karena jujur. Hari ini kejujuran itu jadi riwayat kerja.' },
      { label: 'Terima, dan bawa serta orang-orang jujur lain', fx: { attr: { jaringan: 7, integritas: 2, stres: 5 }, pop: { kabupaten: 5 }, flags: ['pejabat_bersih'] }, result: 'Kamu membangun tim kecil yang tidak bisa dibeli. Banyak yang tidak suka. Warga suka.' },
      { label: 'Tolak, lebih tenang di posisi sekarang', fx: { attr: { stres: -3 } }, result: 'Kamu memilih hidup tenang. Posisi itu diisi orang yang lebih lapar.' },
    ],
  },
  {
    id: 'l_penyuap_memeras',
    title: 'Buku Kecil',
    text: 'Di tengah kampanye, kontraktor yang dulu memberimu amplop muncul di posko. Dia kini pemain besar. Dia membuka buku kecilnya di halaman bertuliskan namamu. "Saya dukung, kok. Asal nanti proyek jalan lingkar jatah saya."',
    when: { campaign: true, flags: ['suap_pertama'] },
    weight: 6,
    once: true,
    choices: [
      { label: 'Setuju, minta dia ikut mendanai', fx: { money: 80, momentum: 3, attr: { integritas: -5 }, heat: 10, flags: ['utang_cukong'], hint: 'Kini dia memegang dua halaman tentangmu.' }, result: 'Kalian berjabat tangan. Buku kecil itu masuk lagi ke sakunya, lebih tebal satu janji.' },
      { label: 'Tolak, biarkan dia bicara', fx: { attr: { integritas: 3, stres: 5 } }, outcomes: [
        { chance: 0.55, text: 'Dia bicara ke wartawan. "Calon bersih" ternyata pernah terima amplop. Angkanya kecil, malunya besar.', fx: { momentum: -6, pop: { kabupaten: -4, provinsi: -2 }, heat: 6 } },
        { chance: 0.45, text: 'Dia menimbang-nimbang, lalu diam. Membongkarmu berarti membongkar dirinya sendiri.', fx: {} },
      ] },
      { label: 'Akui sendiri di depan publik, kembalikan uangnya', need: { moneyMin: 10 }, fx: { money: -10, momentum: -2, attr: { integritas: 6, karisma: 2 }, heat: -6, unflags: ['suap_pertama'] }, result: '"Saya pernah salah, dan ini kuitansinya." Sebagian pemilih mencibir, sebagian justru percaya.' },
    ],
  },
  {
    id: 'l_phk_massal',
    title: 'Daftar Nama',
    text: 'Ekonomi lesu. Kantor mengumumkan "efisiensi". Daftar nama ditempel di papan pengumuman, dan namamu ada di urutan tengah.',
    when: { jobs: ['buruh', 'insinyur', 'jurnalis', 'pedagang'], nationMin: { pengangguran: 7 } },
    weight: 4,
    choices: [
      { label: 'Terima pesangon, cari kerja lain', fx: { money: 12, attr: { stres: 6 } }, result: 'Pesangon cukup untuk tiga bulan. Lowongan kerja cukup untuk nol orang.' },
      { label: 'Galang kawan, tuntut pesangon penuh', fx: { attr: { karisma: 3, stres: 5, jaringan: 3 }, pop: { kabupaten: 3 } }, outcomes: [
        { chance: 0.45, text: 'Perusahaan mengalah setelah dua minggu tenda berdiri di gerbang. Kawan-kawanmu menyebutmu "ketua".', fx: { money: 22, pop: { kabupaten: 2 } } },
        { chance: 0.55, text: 'Perusahaan menutup pabrik sekalian. Kalian menang di pengadilan, di atas kertas.', fx: { money: 5 } },
      ] },
      { label: 'Dekati manajer agar namamu dicoret', need: { attrMin: { jaringan: 45 } }, fx: { attr: { integritas: -3, stres: 2 }, pop: { desa: -2 } }, result: 'Namamu hilang dari daftar. Nama tetanggamu muncul menggantikan.' },
    ],
  },
  {
    id: 'l_serikat_mogok',
    title: 'Mogok Kerja',
    text: 'Upah lembur tiga bulan belum dibayar. Serikat memutuskan mogok. Mandor mendekatimu diam-diam: "Kamu tetap masuk, saya naikkan jadi kepala regu."',
    when: { jobs: ['buruh'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Ikut mogok, berdiri di depan', fx: { money: -3, attr: { karisma: 4, integritas: 3, stres: 4 }, pop: { desa: 3, kabupaten: 3 }, flags: ['tokoh_buruh'] }, result: 'Seminggu tanpa upah. Lembur akhirnya dibayar, dan namamu ada di spanduk serikat.' },
      { label: 'Tetap masuk, ambil jabatan', fx: { money: 8, attr: { integritas: -4, jaringan: -3 }, pop: { desa: -4 }, flags: ['pemecah_mogok'], hint: 'Buruh punya ingatan panjang soal siapa yang masuk hari itu.' }, result: 'Kamu jadi kepala regu. Di kantin, tidak ada yang mau duduk semeja.' },
      { label: 'Izin sakit sampai urusan selesai', fx: { attr: { stres: -1 }, pop: { desa: -1 } }, result: 'Kamu tidak memihak siapa pun. Kedua pihak mencatatnya.' },
    ],
  },
  {
    id: 'l_gagal_panen',
    title: 'Wereng dan Tengkulak',
    text: 'Hama menyerang, panen tinggal separuh. Tengkulak datang membawa uang tunai: bayar sekarang untuk panen musim depan, dengan harga yang dia tentukan sendiri.',
    when: { jobs: ['petani'] },
    weight: 3,
    choices: [
      { label: 'Terima ijon', fx: { money: 8, attr: { stres: 3 }, flags: ['terikat_ijon'], hint: 'Musim depan, panenmu bukan lagi milikmu.' }, result: 'Dapur mengepul lagi. Sawahmu kini bekerja untuk orang lain.' },
      { label: 'Ajak tetangga bikin lumbung bersama', need: { attrMin: { karisma: 40 } }, fx: { money: -2, attr: { jaringan: 4, karisma: 2, stres: 3 }, pop: { desa: 5 }, flags: ['lumbung_desa'] }, result: 'Butuh sepuluh kali rapat dan dua kali hampir bubar. Tapi lumbung itu berdiri, dan tengkulak pulang dengan tangan kosong.' },
      { label: 'Bertahan, jual ternak', fx: { money: -4, attr: { stres: 4, integritas: 1 } }, result: 'Dua kambing pergi. Sawahmu tetap milikmu.' },
    ],
  },
  {
    id: 'l_pungli_pasar',
    title: 'Uang Keamanan',
    text: 'Petugas pasar menaikkan "retribusi" tanpa karcis. Yang menolak, lapaknya digeser ke belakang dekat tempat sampah.',
    when: { jobs: ['pedagang'] },
    weight: 3,
    choices: [
      { label: 'Bayar saja', fx: { money: -3, attr: { stres: 2 } }, result: 'Lapakmu aman. Bulan depan tarifnya naik lagi.' },
      { label: 'Kumpulkan pedagang, protes ke dinas', fx: { attr: { karisma: 3, jaringan: 3, stres: 4 }, pop: { desa: 3, kabupaten: 2 } }, outcomes: [
        { chance: 0.5, text: 'Petugasnya dimutasi. Pedagang patungan membelikanmu nasi tumpeng.', fx: { pop: { kabupaten: 2 } } },
        { chance: 0.5, text: 'Dinas berjanji "menindaklanjuti". Lapakmu digeser ke dekat tempat sampah.', fx: { money: -4 } },
      ] },
      { label: 'Ikut bagi hasil dengan petugas', fx: { money: 6, attr: { integritas: -4 }, pop: { desa: -3 }, heat: 4, hint: 'Pedagang lain tahu siapa yang berdiri di samping petugas.' }, result: 'Kamu kini menarik setoran dari kawan sendiri. Lapakmu pindah ke depan.' },
    ],
  },
  {
    id: 'l_guru_nilai_titipan',
    title: 'Nilai Rapor',
    text: 'Anak seorang pejabat dinas tidak naik kelas. Kepala sekolah memanggilmu. "Tolong dibantu nilainya. Ini menyangkut bantuan gedung sekolah kita."',
    when: { jobs: ['guru'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Ubah nilainya', fx: { attr: { integritas: -4, jaringan: 3 }, heat: 2 }, result: 'Anak itu naik kelas tanpa bisa membaca dengan lancar. Gedung baru dibangun tahun depan.' },
      { label: 'Tolak, tawarkan les tambahan gratis', fx: { attr: { integritas: 4, stres: 4 }, pop: { desa: 2 }, schedule: [{ id: 'l_murid_lama', min: 96, max: 200 }] }, result: 'Enam bulan kamu mengajar anak itu tiap sore. Dia naik kelas tahun berikutnya, dengan nilainya sendiri.' },
      { label: 'Tolak mentah-mentah', fx: { attr: { integritas: 3, jaringan: -3, stres: 3 } }, result: 'Bantuan gedung dialihkan ke sekolah lain. Kepala sekolah berhenti menyapamu.' },
    ],
  },
  {
    id: 'l_murid_lama',
    title: 'Murid Lama',
    text: 'Seorang anak muda menghampirimu di sebuah acara. "Bapak/Ibu masih ingat saya? Yang dulu tidak naik kelas." Dia kini pengusaha muda, dan ayahnya sudah pensiun dengan nama baik.',
    choices: [
      { label: 'Terima tawarannya membantu', fx: { money: 30, attr: { jaringan: 5 }, pop: { kabupaten: 3 } }, result: '"Kalau dulu nilai saya dikatrol, saya tidak akan jadi apa-apa." Dia menyumbang tanpa syarat dan mengajak kawan-kawannya.' },
      { label: 'Cukup doanya saja', fx: { attr: { integritas: 2, stres: -3 }, pop: { desa: 2, kabupaten: 2 } }, result: 'Dia menceritakan kisahmu di mana-mana. Cerita seperti itu berjalan lebih jauh dari baliho.' },
    ],
  },
  {
    id: 'l_tentara_gusur',
    title: 'Perintah Pengamanan',
    text: 'Satuanmu diperintahkan "mengamankan" lahan sengketa untuk sebuah perusahaan perkebunan. Warga bertahan di depan rumah mereka. Komandan menunggu di radio.',
    when: { jobs: ['tentara'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Laksanakan perintah', fx: { attr: { integritas: -4, jaringan: 3, stres: 4 }, pop: { desa: -3 }, heat: 4, flags: ['ikut_gusur'], hint: 'Ada warga yang merekam wajahmu.' }, result: 'Rumah-rumah itu rata sebelum magrib. Komandan memujimu di apel pagi.' },
      { label: 'Tahan pasukan, ajak warga berunding', need: { attrMin: { karisma: 45 } }, fx: { attr: { karisma: 3, integritas: 4, stres: 5 }, pop: { desa: 4, kabupaten: 3 } }, outcomes: [
        { chance: 0.5, text: 'Perundingan alot, tapi tidak ada yang terluka. Kariermu melambat, namamu harum di kampung itu.', fx: { attr: { jaringan: -3 } } },
        { chance: 0.5, text: 'Komandan murka. Kamu dipindah ke pos perbatasan yang sinyalnya hanya ada di atas pohon.', fx: { attr: { jaringan: -5, kesehatan: -2 } } },
      ] },
      { label: 'Pura-pura radio rusak', fx: { attr: { stres: 3 } }, result: 'Satuan lain yang maju. Hasilnya sama, hanya bukan tanganmu.' },
    ],
  },
  {
    id: 'l_pengacara_klien_kotor',
    title: 'Klien Besar',
    text: 'Seorang pejabat yang terjerat kasus korupsi ingin kamu jadi pembelanya. Honornya setara lima tahun kerja. Syaratnya satu: seorang saksi perlu "diarahkan".',
    when: { jobs: ['pengacara'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Ambil, arahkan saksinya', fx: { money: 60, attr: { integritas: -7, jaringan: 5 }, heat: 12, flags: ['atur_saksi'], schedule: [{ id: 'kpk_panggil', min: 18, max: 60, chance: 0.4 }], hint: 'Saksi yang bisa diarahkan bisa diarahkan balik.' }, result: 'Klienmu bebas. Kantormu pindah ke gedung berkaca. Saksi itu masih menyimpan nomormu.' },
      { label: 'Bela secara lurus, tanpa main saksi', fx: { money: 25, attr: { kecerdasan: 2, jaringan: 3, stres: 4 }, pop: { kabupaten: -1 } }, result: 'Klienmu divonis ringan dan tidak puas. Tapi tidak ada yang bisa menudingmu apa-apa.' },
      { label: 'Tolak perkara ini', fx: { attr: { integritas: 3 }, pop: { kabupaten: 1 } }, result: 'Pengacara di seberang jalan yang mengambilnya. Bulan depan dia ganti mobil.' },
    ],
  },
  {
    id: 'l_jurnalis_berita_dibeli',
    title: 'Berita yang Tidak Terbit',
    text: 'Liputanmu soal pencemaran sungai oleh sebuah pabrik sudah siap naik cetak. Pemimpin redaksi memanggil: pabrik itu baru saja memasang iklan setahun penuh. Humasnya juga menitip amplop untukmu.',
    when: { jobs: ['jurnalis'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Terima amplop, simpan beritanya', fx: { money: 12, attr: { integritas: -6 }, heat: 5, flags: ['wartawan_amplop'], hint: 'Warga bantaran sungai tahu kamu pernah datang membawa kamera.' }, result: 'Berita itu masuk laci. Sungainya tetap berbusa.' },
      { label: 'Terbitkan lewat media lain dengan nama samaran', fx: { attr: { integritas: 4, stres: 5, kecerdasan: 2 }, pop: { kabupaten: 2 }, flags: ['bongkar_pabrik'], schedule: [{ id: 'l_warga_sungai', min: 36, max: 120 }] }, result: 'Beritanya meledak. Di kantor semua pura-pura tidak tahu siapa penulisnya.' },
      { label: 'Terbitkan dengan namamu, siap dipecat', fx: { attr: { integritas: 6, karisma: 3, stres: 6 }, pop: { kabupaten: 3, provinsi: 3, nasional: 2 }, money: -6, flags: ['bongkar_pabrik'], schedule: [{ id: 'l_warga_sungai', min: 36, max: 120 }] }, result: 'Kamu dipindah ke rubrik resep masakan. Namamu justru dikenal di mana-mana.' },
    ],
  },
  {
    id: 'l_warga_sungai',
    title: 'Sungai yang Ingat',
    text: 'Rombongan warga bantaran sungai datang dengan dua mobil bak. Pabrik itu akhirnya dipaksa membangun pengolah limbah. Mereka belum lupa siapa yang menulis berita pertama.',
    choices: [
      { label: 'Terima dukungan mereka', fx: { pop: { desa: 4, kabupaten: 5, provinsi: 2 }, attr: { jaringan: 4, stres: -2 } }, result: 'Mereka tidak punya uang. Mereka punya ribuan saudara, tetangga, dan besan.' },
      { label: 'Minta mereka bersaksi tentangmu di media', fx: { pop: { kabupaten: 4, provinsi: 4, nasional: 2 }, attr: { karisma: 2 } }, result: 'Seorang ibu bercerita di televisi sambil menggendong cucunya. Tidak ada konsultan citra yang bisa membuat itu.' },
    ],
  },
  {
    id: 'l_dokter_surat_sakit',
    title: 'Surat Keterangan',
    text: 'Keluarga seorang tersangka korupsi memintamu menerbitkan surat sakit agar dia tidak perlu hadir di pemeriksaan. Pasiennya sehat walafiat. Amplopnya tebal.',
    when: { jobs: ['dokter'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Terbitkan suratnya', fx: { money: 40, attr: { integritas: -6 }, heat: 10, flags: ['surat_sakit_palsu'], schedule: [{ id: 'kpk_panggil', min: 6, max: 30, chance: 0.35 }], hint: 'Penyidik biasanya meminta pendapat dokter kedua.' }, result: '"Vertigo berat dan gangguan ingatan." Pasienmu terlihat main golf minggu berikutnya.' },
      { label: 'Periksa sungguhan, tulis apa adanya', fx: { attr: { integritas: 4, jaringan: -2 } }, result: '"Sehat, layak diperiksa." Keluarganya pergi tanpa pamit. Penyidik mencatat namamu dengan hormat.' },
      { label: 'Rujuk ke dokter lain', fx: { attr: { stres: 1 } }, result: 'Kamu tidak mau terlibat. Dokter lain ternyata tidak sesulit kamu.' },
    ],
  },
  {
    id: 'l_insinyur_spek',
    title: 'Besi yang Lebih Tipis',
    text: 'Pimpinan proyek jembatan memintamu meneken perubahan spesifikasi: besi lebih tipis, campuran semen dikurangi. "Selisihnya kita bagi. Jembatannya tetap berdiri, kok."',
    when: { jobs: ['insinyur'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Teken, terima bagian', fx: { money: 45, attr: { integritas: -7 }, heat: 8, flags: ['spek_dikurangi'], schedule: [{ id: 'l_jembatan_ambruk', min: 24, max: 110, chance: 0.65 }], hint: 'Beton tidak bisa disuap.' }, result: 'Jembatan diresmikan dengan gunting pita dan tari-tarian. Tanda tanganmu ada di halaman terakhir.' },
      { label: 'Menolak meneken', fx: { attr: { integritas: 5, stres: 5, jaringan: -3 }, money: -5 }, result: 'Kamu digeser dari proyek. Penggantimu meneken dalam lima menit.' },
      { label: 'Menolak, dan kirim salinan dokumen ke auditor', fx: { attr: { integritas: 7, stres: 7, jaringan: -5 }, money: -8, pop: { kabupaten: 2 }, flags: ['peniup_peluit'], schedule: [{ id: 'l_peniup_peluit_dikenang', min: 36, max: 120 }], hint: 'Kontraktor itu punya banyak kawan.' }, result: 'Proyek dihentikan sementara. Kamu kehilangan pekerjaan dan beberapa teman.' },
    ],
  },
  {
    id: 'l_jembatan_ambruk',
    title: 'Jembatan Itu',
    text: 'Berita pagi: jembatan yang dulu kamu teken ambruk saat hujan deras. Sebuah angkot ikut jatuh. Penyidik mengumpulkan semua dokumen proyek.',
    choices: [
      { label: 'Datangi penyidik, akui dan buka semuanya', fx: { attr: { integritas: 5, stres: 10 }, pop: { kabupaten: -6, provinsi: -4, nasional: -3 }, jail: 12, money: -45, unflags: ['spek_dikurangi'] }, result: 'Kamu jadi saksi yang bekerja sama. Vonismu ringan. Wajah keluarga korban tidak ringan.' },
      { label: 'Sewa pengacara, salahkan kontraktor', need: { moneyMin: 60 }, fx: { money: -60, attr: { stres: 8, integritas: -3 } }, outcomes: [
        { chance: 0.4, text: 'Kamu lolos sebagai saksi. Pimpinan proyek yang masuk. Dari balik jeruji dia berjanji akan bicara banyak.', fx: { heat: 12, pop: { kabupaten: -3 } } },
        { chance: 0.6, text: 'Tanda tanganmu terlalu jelas. Hakim tidak terkesan dengan pengacaramu.', fx: { jail: 36, pop: { kabupaten: -8, provinsi: -6, nasional: -5 } } },
      ] },
      { label: 'Diam dan berharap', fx: { attr: { stres: 10 } }, outcomes: [
        { chance: 0.7, text: 'Mereka menjemputmu subuh-subuh. Tetangga menonton dari balik gorden.', fx: { jail: 48, pop: { desa: -8, kabupaten: -8, provinsi: -6, nasional: -5 } } },
        { chance: 0.3, text: 'Berkasnya menumpuk di meja penyidik yang sedang sibuk kasus lain. Untuk sementara.', fx: { heat: 15, schedule: [{ id: 'kpk_panggil', min: 6, max: 24 }] } },
      ] },
    ],
  },
  {
    id: 'l_peniup_peluit_dikenang',
    title: 'Peluit yang Terdengar',
    text: 'Kasus yang dulu kamu laporkan akhirnya diputus pengadilan. Sebuah lembaga antikorupsi memberimu penghargaan, dan media mencari "orang yang dulu berani bicara".',
    choices: [
      { label: 'Tampil dan ceritakan semuanya', fx: { attr: { karisma: 3, jaringan: 4 }, pop: { kabupaten: 4, provinsi: 4, nasional: 3 }, flags: ['tokoh_antikorupsi'] }, result: 'Kamu diundang ke mana-mana. Orang yang dulu menjauhimu kini mengaku selalu mendukung.' },
      { label: 'Terima penghargaan, tolak panggung', fx: { attr: { integritas: 3, stres: -3 }, pop: { kabupaten: 2, provinsi: 2 }, flags: ['tokoh_antikorupsi'] }, result: 'Kamu pulang naik angkot dengan piagam di tas. Seorang wartawan menulis soal itu.' },
    ],
  },
  {
    id: 'l_pengusaha_faktur',
    title: 'Pembukuan Kreatif',
    text: 'Konsultan pajakmu punya ide: faktur dari perusahaan cangkang, pajak turun separuh. "Semua pemain besar pakai ini. Aman."',
    when: { jobs: ['pengusaha'] },
    weight: 3,
    choices: [
      { label: 'Pakai skemanya', fx: { money: 50, attr: { integritas: -4 }, heat: 9, flags: ['faktur_fiktif'], hint: 'Kantor pajak sabar. Mereka memeriksa mundur sepuluh tahun.' }, result: 'Laba bersih naik tanpa menjual apa-apa. Konsultanmu menyimpan salinan semua berkas, "untuk jaga-jaga".' },
      { label: 'Bayar pajak sesuai aturan', fx: { money: -15, attr: { integritas: 3 }, heat: -2 }, result: 'Pesaingmu menertawakan laporan keuanganmu. Kamu tidur nyenyak.' },
      { label: 'Ganti konsultan', fx: { money: -5, attr: { stres: 2, integritas: 1 } }, result: 'Konsultan baru lebih mahal dan lebih membosankan. Itu pujian.' },
    ],
  },
  {
    id: 'l_influencer_endorse',
    title: 'Endorse Cuan',
    text: 'Sebuah aplikasi "investasi pasti untung 10% sebulan" menawarkan bayaran besar untuk sekali unggahan. Izin usahanya masih "dalam proses".',
    when: { jobs: ['influencer'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Ambil, unggah dengan penuh semangat', fx: { money: 55, attr: { integritas: -5 }, heat: 6, flags: ['endorse_bodong'], schedule: [{ id: 'l_investasi_runtuh', min: 8, max: 30 }], hint: 'Pengikutmu menaruh tabungan mereka di sana.' }, result: '"Aku sudah buktikan sendiri, guys!" Kamu belum membuktikan apa-apa.' },
      { label: 'Tolak, lalu bikin konten peringatan', fx: { attr: { integritas: 4, kecerdasan: 1 }, pop: { nasional: 3, provinsi: 2 }, money: -2 }, result: 'Aplikasinya mengancam menggugat. Enam bulan kemudian pendirinya kabur ke luar negeri.' },
      { label: 'Tolak diam-diam', fx: { attr: { integritas: 2 } }, result: 'Rekan sesama selebritas mengambilnya. Kamu menonton dari jauh.' },
    ],
  },
  {
    id: 'l_investasi_runtuh',
    title: 'Aplikasinya Tutup',
    text: 'Aplikasi investasi yang kamu promosikan tidak bisa dibuka sejak semalam. Pendirinya menghilang. Kolom komentarmu penuh orang yang kehilangan tabungan haji dan uang sekolah anak.',
    choices: [
      { label: 'Minta maaf, kembalikan honor ke korban', need: { moneyMin: 55 }, fx: { money: -55, attr: { integritas: 4, stres: 6 }, pop: { nasional: -3, provinsi: -2 }, heat: -4, unflags: ['endorse_bodong'] }, result: 'Uangmu tidak menutup kerugian mereka. Tapi kamu satu-satunya yang mengembalikan sesuatu.' },
      { label: 'Klaim kamu juga korban', fx: { attr: { integritas: -3, stres: 5 }, pop: { nasional: -6, provinsi: -4 }, heat: 6 }, outcomes: [
        { chance: 0.4, text: 'Polisi memanggilmu sebagai saksi, lalu menaikkan statusmu. Kontrak endorse itu ada tanda tanganmu.', fx: { jail: 8, pop: { nasional: -4 } } },
        { chance: 0.6, text: 'Kamu menangis di video klarifikasi. Sebagian percaya. Tangkapan layar tidak pernah hilang.', fx: {} },
      ] },
      { label: 'Matikan kolom komentar, tunggu reda', fx: { attr: { stres: 4, karisma: -3 }, pop: { nasional: -7, provinsi: -4 }, heat: 8, hint: 'Para korban membentuk paguyuban.' }, result: 'Isu itu reda. Paguyuban korbannya tidak.' },
    ],
  },
  {
    id: 'l_staf_partai_koper',
    title: 'Titipan Ketua',
    text: 'Ketua cabang menyerahkan sebuah koper. "Antar ke hotel dekat alun-alun, kamar 512. Jangan dibuka, jangan bertanya." Kopernya berat.',
    when: { jobs: ['staf_partai'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Antar tanpa bertanya', fx: { attr: { integritas: -4, jaringan: 5 }, party: 8, heat: 8, flags: ['kurir_partai'], hint: 'Hotel itu punya kamera di setiap lorong.' }, result: 'Kamar 512 dibuka oleh orang yang sering kamu lihat di televisi. Ketua mulai memanggilmu "anak saya".' },
      { label: 'Antar, tapi catat semuanya diam-diam', need: { attrMin: { kecerdasan: 50 } }, fx: { attr: { jaringan: 3, stres: 4, integritas: -2 }, party: 6, heat: 5, flags: ['kurir_partai', 'pegang_kartu_ketua'] }, result: 'Tanggal, jam, nomor kamar, pelat mobil. Asuransi tidak selalu berbentuk polis.' },
      { label: 'Menolak', fx: { attr: { integritas: 4 }, party: -8 }, result: 'Ketua tersenyum. Minggu depan tugasmu tinggal memfotokopi dan memesan gorengan.' },
    ],
  },
  {
    id: 'l_atasan_klaim',
    title: 'Kerja Siapa',
    text: 'Laporan yang kamu kerjakan sebulan penuh dipresentasikan atasanmu di depan pimpinan. Namamu tidak disebut sekali pun.',
    when: { jobs: ['pns', 'insinyur', 'jurnalis', 'dosen', 'guru', 'staf_partai', 'pengacara'] },
    weight: 3,
    choices: [
      { label: 'Diam, tetap kerja', fx: { attr: { stres: 4, integritas: 1 } }, result: 'Atasanmu naik pangkat. Dia mengajakmu pindah ke unit barunya, karena dia butuh kamu.' },
      { label: 'Bicara empat mata', need: { attrMin: { karisma: 45 } }, fx: { attr: { karisma: 2, stres: 2 } }, outcomes: [
        { chance: 0.55, text: 'Dia kikuk, lalu menyebut namamu di rapat berikutnya. Sedikit terlambat, tapi tercatat.', fx: { attr: { jaringan: 3 }, money: 4 } },
        { chance: 0.45, text: '"Kamu masih muda, sabar." Sejak itu pekerjaan paling membosankan selalu mendarat di mejamu.', fx: { attr: { stres: 4 } } },
      ] },
      { label: 'Kirim surel ke pimpinan, lampirkan draf aslimu', fx: { attr: { stres: 5, jaringan: -3, kecerdasan: 1 } }, outcomes: [
        { chance: 0.4, text: 'Pimpinan membalas singkat: "Terima kasih. Temui saya Senin." Kamu dipromosikan.', fx: { money: 10, attr: { jaringan: 5 } } },
        { chance: 0.6, text: 'Surelmu diteruskan ke atasanmu, dengan satu kata: "Tolong dibina."', fx: { attr: { stres: 5 } } },
      ] },
    ],
  },
  {
    id: 'l_lsm_donor',
    title: 'Dana Hibah',
    text: 'Lembagamu kehabisan dana. Sebuah perusahaan sawit menawarkan hibah besar untuk "program pemberdayaan". Kebetulan kalian sedang mengadvokasi warga yang lahannya diserobot perusahaan itu.',
    when: { jobs: ['aktivis'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Terima hibah, advokasi dipelankan', fx: { money: 30, attr: { integritas: -6 }, pop: { kabupaten: -3 }, heat: 4, flags: ['lsm_dibeli'], hint: 'Warga yang kamu tinggalkan masih menyimpan surat kuasamu.' }, result: 'Kantor punya pendingin ruangan baru. Warga berhenti datang ke rapat.' },
      { label: 'Tolak, galang dana publik', fx: { money: -3, attr: { integritas: 4, karisma: 3, stres: 5 }, pop: { kabupaten: 3, provinsi: 2 } }, result: 'Donasi masuk seribu, dua ribu, lima ribu. Lambat, tapi tidak ada yang bisa menyetirmu.' },
      { label: 'Umumkan tawaran itu ke media', fx: { attr: { integritas: 3, karisma: 2, stres: 4 }, pop: { provinsi: 3, nasional: 2 }, heat: 2 }, result: 'Perusahaan itu malu besar dan menyewa pengacara. Somasi pertama tiba hari Kamis.' },
    ],
  },

  // =====================================================================
  // KEBIASAAN
  // =====================================================================
  {
    id: 'l_utang_judi',
    title: 'Kalah Banyak',
    text: 'Semalam kamu yakin sekali. Pagi ini kamu berutang 30 juta ke bandar, dan bandar tidak mengenal kata "bulan depan".',
    when: { habits: ['judi'] },
    weight: 4,
    choices: [
      { label: 'Bayar lunas dari tabungan', need: { moneyMin: 30 }, fx: { money: -30, attr: { stres: 4 } }, result: 'Tabunganmu habis. Bandar menepuk pundakmu: "Kapan-kapan main lagi."' },
      {
        label: 'Pinjam ke rentenir',
        fx: { attr: { stres: 6 }, heat: 4, flags: ['utang_rentenir'], schedule: [{ id: 'l_rentenir_menagih', min: 5, max: 12 }], hint: 'Bunga sepuluh persen sebulan, dan dia tahu rumah orang tuamu.' },
        result: 'Bandar lunas. Kamu kini berutang pada orang yang lebih buruk.',
      },
      {
        label: 'Pasang lagi untuk menutup kekalahan',
        fx: { attr: { stres: 5, integritas: -2 }, heat: 3 },
        outcomes: [
          { chance: 0.22, text: 'Menang. Utang lunas, sisa sedikit. Kamu merasa jenius, dan itu bagian paling berbahaya.', fx: { money: 12 } },
          { chance: 0.78, text: 'Kalah lagi. Angkanya kini dua kali lipat, dan motormu disita sebagai jaminan.', fx: { money: -20, flags: ['utang_rentenir'], schedule: [{ id: 'l_rentenir_menagih', min: 3, max: 8 }] } },
        ],
      },
    ],
  },
  {
    id: 'l_rentenir_menagih',
    title: 'Tamu Malam Hari',
    text: 'Dua orang berbadan besar duduk di teras rumahmu. Utangmu, dengan bunga, sudah 70 juta. Mereka menyebut nama ibumu dengan sangat sopan.',
    choices: [
      { label: 'Bayar lunas', need: { moneyMin: 70 }, fx: { money: -70, attr: { stres: -3 }, unflags: ['utang_rentenir'] }, result: 'Mereka menghitung uangnya dua kali, lalu pamit seperti tamu kondangan.' },
      { label: 'Jual tanah keluarga', fx: { attr: { stres: 6, integritas: -2 }, pop: { desa: -4 }, unflags: ['utang_rentenir'], flags: ['jual_tanah_keluarga'] }, result: 'Sawah peninggalan kakek berpindah tangan. Utang lunas. Di meja makan, tidak ada yang bicara.' },
      { label: 'Minta waktu lagi', fx: { attr: { stres: 8, kesehatan: -3 }, heat: 4, schedule: [{ id: 'l_rentenir_final', min: 4, max: 9 }], hint: 'Ini kesempatan terakhir, dan mereka mengatakannya dengan jelas.' }, result: 'Mereka setuju. Sebagai tanda jadi, mereka membawa televisimu dan memecahkan satu jendela.' },
    ],
  },
  {
    id: 'l_rentenir_final',
    title: 'Jatuh Tempo',
    text: 'Angkanya kini 140 juta. Rentenir itu datang sendiri, dengan map berisi surat-surat yang dulu kamu tanda tangani tanpa membaca.',
    choices: [
      { label: 'Bayar semuanya', need: { moneyMin: 140 }, fx: { money: -140, unflags: ['utang_rentenir'], attr: { stres: -2 } }, result: 'Harga sebuah malam yang "pasti menang". Kamu menyimpan kuitansinya sebagai pengingat.' },
      { label: 'Tawarkan jasa: jadi orangnya', fx: { attr: { integritas: -8, stres: 4 }, heat: 12, pop: { desa: -4 }, unflags: ['utang_rentenir'], flags: ['kaki_tangan_rentenir'], hint: 'Kamu kini bagian dari bisnis yang akan kamu sesali.' }, result: 'Utangmu dihapus. Tugas pertamamu: menagih tetangga sendiri.' },
      { label: 'Angkat tangan, tidak punya apa-apa lagi', fx: { attr: { stres: 10 }, end: 'bangkrut' }, result: 'Rumah disita, namamu masuk daftar hitam semua bank, dan keluargamu menumpang di rumah saudara. Jalanmu berhenti di sini.' },
    ],
  },
  {
    id: 'l_batuk_perokok',
    title: 'Batuk yang Awet',
    text: 'Sudah tiga minggu batukmu tidak hilang. Naik tangga satu lantai saja napasmu berbunyi. Dokter puskesmas menatapmu lama.',
    when: { habits: ['merokok'], minAge: 30 },
    weight: 3,
    once: true,
    choices: [
      { label: 'Periksa lengkap dan kurangi rokok', fx: { money: -4, attr: { kesehatan: 3, stres: 4 }, flags: ['paru_diperiksa'] }, result: 'Belum parah, kata dokter. "Belum" adalah kata kuncinya. Sebulan pertama tanpa rokok terasa seperti dihukum.' },
      { label: 'Minum obat warung, lanjut seperti biasa', fx: { attr: { kesehatan: -3 }, schedule: [{ id: 'l_paru_vonis', min: 48, max: 130 }], hint: 'Paru-paru tidak menagih setiap bulan. Ia menagih sekaligus.' }, result: 'Batuknya reda sendiri. Kamu menganggapnya menang.' },
      { label: 'Ganti ke rokok elektrik', fx: { money: -2, attr: { kesehatan: -1 }, schedule: [{ id: 'l_paru_vonis', min: 70, max: 160, chance: 0.6 }] }, result: 'Asapnya kini wangi mangga. Paru-parumu tidak membaca label rasa.' },
    ],
  },
  {
    id: 'l_paru_vonis',
    title: 'Hasil Rontgen',
    text: 'Dokter spesialis menempelkan foto rontgenmu di papan lampu dan diam sebentar. Ada bayangan di paru kanan. "Kita harus bergerak cepat."',
    choices: [
      { label: 'Operasi dan pengobatan penuh (120 juta)', need: { moneyMin: 120 }, fx: { money: -120, attr: { kesehatan: -8, stres: 8 } }, outcomes: [
        { chance: 0.75, text: 'Operasi berhasil. Kamu kehilangan sepertiga paru-paru dan semua seleramu pada tembakau.', fx: { attr: { kesehatan: 4 }, flags: ['penyintas'] } },
        { chance: 0.17, text: 'Ada komplikasi. Kamu selamat, tapi tidak pernah lagi bisa pidato lebih dari lima menit tanpa tersengal.', fx: { attr: { kesehatan: -10, karisma: -4 } } },
        { chance: 0.08, text: 'Tubuhmu tidak kuat. Rencana-rencana besar itu berhenti di ruang pemulihan.', fx: { end: 'meninggal' } },
      ] },
      { label: 'Berobat sebisanya dengan jaminan pemerintah', fx: { attr: { kesehatan: -10, stres: 8 } }, outcomes: [
        { chance: 0.55, text: 'Antre berbulan-bulan, tapi pengobatan jalan. Kamu jadi tahu persis rasanya layanan kesehatan negeri ini.', fx: { attr: { integritas: 2 }, flags: ['penyintas'] } },
        { chance: 0.3, text: 'Penyakitnya melambat, tidak berhenti. Kamu hidup dengan tabung oksigen kecil di samping tempat tidur.', fx: { attr: { kesehatan: -8, karisma: -3 } } },
        { chance: 0.15, text: 'Jadwal operasimu keluar seminggu setelah kamu tidak lagi membutuhkannya.', fx: { end: 'meninggal' } },
      ] },
      { label: 'Tolak medis, percayakan pada pengobatan alternatif', fx: { money: -15, attr: { kesehatan: -12 } }, outcomes: [
        { chance: 0.4, text: 'Ramuan itu pahit dan tidak berguna. Suatu subuh napasmu berhenti.', fx: { end: 'meninggal' } },
        { chance: 0.6, text: 'Kondisimu memburuk sampai keluargamu menyeretmu kembali ke rumah sakit. Terlambat untuk sembuh, cukup untuk bertahan.', fx: { attr: { kesehatan: -8, stres: 6 }, money: -40 } },
      ] },
    ],
  },
  {
    id: 'l_begadang_tumbang',
    title: 'Tumbang',
    text: 'Kamu pingsan di kamar mandi dan terbangun di ruang gawat darurat. Dokter jaga membaca hasil lab: tekanan darah tinggi, lambung luka, tidur rata-rata empat jam.',
    when: { habits: ['begadang'], attrMax: { kesehatan: 50 } },
    weight: 3,
    choices: [
      { label: 'Rawat inap, cuti dua minggu', fx: { money: -6, attr: { kesehatan: 5, stres: -6 } }, result: 'Dunia ternyata tetap berputar tanpa kamu. Agak menyinggung, tapi melegakan.' },
      { label: 'Minta obat, langsung pulang kerja', fx: { money: -1, attr: { kesehatan: -4, stres: 3 }, hint: 'Tubuh mencatat setiap malam yang kamu curi.' }, result: 'Kamu kembali ke meja kerja sebelum infusnya habis. Semua orang kagum. Jantungmu tidak.' },
    ],
  },
  {
    id: 'l_viral_medsos',
    title: 'Mendadak Viral',
    text: 'Unggahanmu yang menyindir seorang pejabat soal jalan rusak dibagikan puluhan ribu kali. Notifikasi tidak berhenti. Ada yang memuji, ada yang mengancam.',
    when: { habits: ['medsos'] },
    weight: 3,
    choices: [
      { label: 'Gas terus, tambah pedas', fx: { pop: { nasional: 4, provinsi: 3 }, attr: { stres: 4, karisma: 2 }, flags: ['cuitan_kasar'], hint: 'Internet menyimpan semuanya, termasuk yang kamu tulis saat marah.' }, result: 'Pengikutmu berlipat. Di antara unggahan itu ada beberapa kalimat yang kelak ingin kamu hapus.' },
      { label: 'Lanjutkan dengan data dan foto lapangan', need: { attrMin: { kecerdasan: 50 } }, fx: { pop: { nasional: 3, provinsi: 3, kabupaten: 2 }, attr: { kecerdasan: 1, stres: 3 } }, result: 'Jalan itu ditambal dalam seminggu. Akunmu mulai dianggap serius.' },
      { label: 'Hapus unggahan, terlalu ramai', fx: { attr: { stres: -2 }, pop: { nasional: -1 } }, result: 'Tangkapan layarnya tetap beredar, kini dengan tambahan tulisan "DIHAPUS KARENA TAKUT".' },
    ],
  },
  {
    id: 'l_jejak_digital',
    title: 'Jejak Digital',
    text: 'Tim lawan menggali unggahan lamamu. Kalimat-kalimat kasar yang dulu terasa lucu kini dicetak besar di spanduk dan dibacakan pembawa acara televisi.',
    when: { campaign: true, flags: ['cuitan_kasar'] },
    weight: 5,
    once: true,
    choices: [
      { label: 'Minta maaf singkat dan jelas', fx: { momentum: -2, attr: { integritas: 2 }, unflags: ['cuitan_kasar'] }, result: '"Saya dulu kasar. Saya salah." Tidak ada yang bisa menggoreng permintaan maaf yang pendek.' },
      { label: 'Klaim akunmu diretas', fx: { attr: { integritas: -3 } }, outcomes: [
        { chance: 0.7, text: 'Tidak ada yang percaya. "Diretas selama empat tahun?" jadi bahan lawakan nasional.', fx: { momentum: -6, pop: { nasional: -3, provinsi: -2 } } },
        { chance: 0.3, text: 'Isu lain keburu datang. Publik lupa, kali ini.', fx: { momentum: -1 } },
      ] },
      { label: 'Balik menyerang: bongkar unggahan lama lawan', fx: { momentum: 2, attr: { integritas: -2, stres: 3 }, heat: 3 }, result: 'Kampanye berubah jadi lomba menggali kuburan digital. Pemilih menonton sambil makan gorengan.' },
    ],
  },
  {
    id: 'l_opini_dilirik_partai',
    title: 'Tulisanmu Dibaca',
    text: 'Opinimu soal anggaran daerah dikutip di rapat dewan. Seminggu kemudian seorang pengurus partai mengajakmu ngopi. "Kami butuh orang yang bisa berpikir. Dan menulis pidato."',
    when: { habits: ['menulis'], inParty: false },
    weight: 3,
    once: true,
    choices: [
      { label: 'Jadi penulis pidato bayangan', fx: { money: 10, attr: { jaringan: 6, integritas: -2 }, flags: ['penulis_bayangan'], hint: 'Kata-katamu akan keluar dari mulut orang yang belum tentu kamu setujui.' }, result: 'Pidato sang ketua disambut tepuk tangan panjang. Hanya kamu yang tahu itu kalimatmu.' },
      { label: 'Tetap independen, tapi terima undangan diskusi', fx: { attr: { jaringan: 4, kecerdasan: 1 }, pop: { provinsi: 2 } }, result: 'Kamu duduk di panel bersama para politisi. Mereka mengingat namamu, dan keberanianmu membantah.' },
      { label: 'Tulis opini soal pertemuan itu', fx: { attr: { integritas: 3, jaringan: -3 }, pop: { provinsi: 2, nasional: 2 } }, result: '"Cara Partai Merekrut Penulis" jadi tulisan terlarismu. Pengurus itu tidak mengajakmu ngopi lagi.' },
    ],
  },
  {
    id: 'l_mabuk_ribut',
    title: 'Malam yang Panjang',
    text: 'Kamu terbangun dengan kepala berat dan ponsel penuh pesan. Semalam kamu ribut di warung, memecahkan gelas, dan menantang seorang hansip. Seseorang merekam semuanya.',
    when: { habits: ['minum'] },
    weight: 3,
    choices: [
      { label: 'Datangi warung, minta maaf, ganti rugi', fx: { money: -3, attr: { integritas: 2, stres: 2 }, pop: { desa: -1 } }, result: 'Pemilik warung menerima uangmu dan maafmu. Videonya sudah telanjur sampai ke grup RT.' },
      { label: 'Bayar si perekam agar menghapus', fx: { money: -5, heat: 4, flags: ['video_mabuk'], hint: 'Video yang "dihapus" biasanya punya salinan.' }, result: 'Dia menghapusnya di depanmu. Dari satu ponsel.' },
      { label: 'Biarkan, nanti juga lupa', fx: { pop: { desa: -3, kabupaten: -1 }, heat: 3, flags: ['video_mabuk'] }, result: 'Orang kampung memang lupa. Internet tidak.' },
    ],
  },
  {
    id: 'l_video_mabuk_muncul',
    title: 'Video Lama',
    text: 'Sebuah akun gosip mengunggah video lamamu: sempoyongan, memaki, menantang hansip. Judulnya: "Calon Pemimpin Kita?"',
    when: { campaign: true, flags: ['video_mabuk'] },
    weight: 5,
    once: true,
    choices: [
      { label: 'Akui, ceritakan bahwa kamu sudah berubah', need: { attrMin: { karisma: 45 } }, fx: { momentum: -2, attr: { integritas: 2 }, unflags: ['video_mabuk'] }, result: 'Kisah pertobatan selalu laku. Asal benar-benar tobat.' },
      { label: 'Sebut itu video editan', fx: { attr: { integritas: -3 } }, outcomes: [
        { chance: 0.65, text: 'Hansip di video itu masih hidup, dan dia senang sekali diwawancarai.', fx: { momentum: -7, pop: { kabupaten: -3, provinsi: -2 } } },
        { chance: 0.35, text: 'Kualitas videonya buruk. Keraguan itu cukup untuk menyelamatkanmu.', fx: { momentum: -1 } },
      ] },
      { label: 'Diam, lanjut kampanye', fx: { momentum: -4, pop: { kabupaten: -2 } }, result: 'Kalangan religius menarik undangan pengajian akbar. Yang lain mengangkat bahu.' },
    ],
  },
  {
    id: 'l_dukun_ketahuan',
    title: 'Kembang Tujuh Rupa',
    text: 'Orang pintar langgananmu ditangkap karena kasus penipuan. Polisi menyita buku tamunya. Namamu ada di sana, lengkap dengan keterangan: "minta pelaris dan pengasihan".',
    when: { habits: ['dukun'] },
    weight: 2,
    once: true,
    choices: [
      { label: 'Tertawakan sendiri di depan umum', need: { attrMin: { karisma: 50 } }, fx: { pop: { desa: 1, kabupaten: -1 }, attr: { karisma: 1 } }, result: '"Namanya juga usaha." Orang tertawa bersamamu, bukan menertawakanmu. Bedanya tipis tapi penting.' },
      { label: 'Bantah keras', fx: { pop: { kabupaten: -3, provinsi: -2 }, attr: { integritas: -2 }, heat: 2 }, result: 'Lalu fotomu sedang mandi kembang ikut beredar.' },
      { label: 'Dekati penyidik agar namamu dicoret', need: { moneyMin: 10 }, fx: { money: -10, attr: { integritas: -3 }, heat: 6, hint: 'Sekarang ada polisi yang tahu kamu bisa dibeli.' }, result: 'Halaman itu hilang dari buku tamu. Penyidiknya menyimpan nomormu.' },
    ],
  },
  {
    id: 'l_relawan_bencana',
    title: 'Dapur Umum',
    text: 'Banjir merendam tiga dusun. Kamu sudah dua hari di dapur umum ketika rombongan pejabat datang, berfoto sepuluh menit dengan sekarung beras, lalu pergi.',
    when: { habits: ['relawan'] },
    weight: 3,
    choices: [
      { label: 'Terus bekerja, tak usah ribut', fx: { attr: { integritas: 3, stres: 3, kesehatan: -1 }, pop: { desa: 4, kabupaten: 2 } }, result: 'Tidak ada kamera. Tapi tiga dusun tahu siapa yang mengaduk nasi sampai subuh.' },
      { label: 'Unggah perbandingan: foto pejabat dan dapur umum', fx: { attr: { karisma: 2, stres: 2 }, pop: { kabupaten: 3, provinsi: 3 }, heat: 2, hint: 'Pejabat itu punya ingatan yang baik untuk hal-hal seperti ini.' }, result: 'Unggahanmu ramai. Bantuan sungguhan datang besoknya. Ajudan si pejabat mencatat namamu.' },
      { label: 'Ajak pejabat itu tinggal dan ikut bekerja', need: { attrMin: { karisma: 55 } }, fx: { attr: { jaringan: 4, karisma: 2 }, pop: { desa: 3, kabupaten: 3 } }, result: 'Dia kikuk, tapi akhirnya menggulung lengan baju. Kalian pulang sebagai kenalan.' },
    ],
  },
  {
    id: 'l_foya_dicibir',
    title: 'Mobil Baru',
    text: 'Mobil barumu parkir di depan rumah. Di grup percakapan warga, seseorang bertanya dengan polos: "Kerjanya apa ya, kok bisa?"',
    when: { habits: ['foya'], office: ['none'] },
    weight: 2,
    choices: [
      { label: 'Gelar syukuran, undang sekampung', fx: { money: -8, pop: { desa: 3 }, attr: { jaringan: 2 } }, result: 'Kambing guling meredam banyak pertanyaan. Untuk sementara.' },
      { label: 'Pamer lebih banyak lagi', fx: { money: -10, attr: { karisma: 2, integritas: -1 }, pop: { desa: -3, nasional: 1 }, heat: 3, hint: 'Orang yang iri rajin mencatat.' }, result: 'Jam tangan, liburan, makan malam. Pengikutmu bertambah, begitu juga yang penasaran dari mana uangnya.' },
      { label: 'Jual lagi, hidup lebih sederhana', fx: { money: 12, attr: { integritas: 2, karisma: -1 }, pop: { desa: 2 } }, result: 'Kamu kembali naik motor. Tetangga kembali menyapa.' },
    ],
  },

  // =====================================================================
  // KEHIDUPAN PRIBADI
  // =====================================================================
  {
    id: 'l_lamaran',
    title: 'Soal Jodoh',
    text: 'Usiamu sudah jadi bahan obrolan keluarga. Ada dua jalan: menikahi orang yang kamu cintai, yang keluarganya biasa saja, atau menerima perjodohan dengan anak seorang pejabat daerah.',
    when: { minAge: 24, maxAge: 36, notFlags: ['menikah'] },
    weight: 4,
    once: true,
    choices: [
      { label: 'Menikah dengan pilihan hati, pesta sederhana', need: { moneyMin: 10 }, fx: { money: -10, attr: { stres: -6, integritas: 2 }, pop: { desa: 2 }, flags: ['menikah', 'nikah_cinta'] }, result: 'Tenda di halaman, orkes dangdut, amplop tetangga. Kamu pulang ke rumah yang hangat.' },
      { label: 'Terima perjodohan dengan anak pejabat', fx: { money: 40, attr: { jaringan: 8, stres: 3 }, party: 4, flags: ['menikah', 'menantu_pejabat'], schedule: [{ id: 'l_mertua_terseret', min: 36, max: 120, chance: 0.7 }], hint: 'Kamu menikahi satu orang dan seluruh urusan keluarganya.' }, result: 'Resepsi di gedung, tamu berpelat merah. Pintu-pintu yang dulu tertutup kini dibukakan untukmu.' },
      { label: 'Belum sekarang, karier dulu', fx: { attr: { stres: 2 }, pop: { desa: -1 } }, result: 'Keluargamu menghela napas. Tetangga punya teori masing-masing.' },
    ],
  },
  {
    id: 'l_mertua_terseret',
    title: 'Mertua di Berita',
    text: 'Ayah mertuamu ditetapkan sebagai tersangka kasus pengadaan. Wartawan sudah berkumpul di depan rumah. Beberapa aset keluarga, kata pengacaranya, "sebaiknya dititipkan atas namamu dulu".',
    choices: [
      { label: 'Terima titipan aset itu', fx: { money: 150, attr: { integritas: -7, stres: 6 }, heat: 18, flags: ['titipan_aset_mertua'], schedule: [{ id: 'kpk_panggil', min: 8, max: 36, chance: 0.6 }], hint: 'Penyidik selalu menelusuri nama menantu.' }, result: 'Dua sertifikat tanah dan satu rekening kini atas namamu. Mertuamu memelukmu sambil menangis.' },
      { label: 'Dampingi sebagai keluarga, tolak titipan', fx: { attr: { integritas: 3, stres: 6 }, pop: { kabupaten: -2, provinsi: -1 } }, result: 'Kamu hadir di setiap sidang dan tidak menyentuh satu rupiah pun. Namamu ikut disebut, tapi bersih.' },
      { label: 'Jaga jarak di depan publik', fx: { attr: { stres: 4, jaringan: -4 }, pop: { kabupaten: 1 } }, result: '"Kami menghormati proses hukum." Di rumah, pasanganmu tidak bicara denganmu selama sebulan.' },
    ],
  },
  {
    id: 'l_orangtua_sakit',
    title: 'Telepon dari Rumah',
    text: 'Ibumu jatuh di kamar mandi. Dokter bilang perlu operasi dan perawatan panjang. Biayanya 35 juta, belum termasuk yang tak terduga.',
    when: { minAge: 22 },
    weight: 3,
    once: true,
    choices: [
      { label: 'Tanggung semuanya', need: { moneyMin: 35 }, fx: { money: -35, attr: { integritas: 3, stres: 4 }, pop: { desa: 2 } }, result: 'Ibumu pulih pelan-pelan. Setiap kali kamu pulang, dia memasakkan lauk kesukaanmu sambil duduk.' },
      { label: 'Urus lewat jaminan kesehatan, dampingi sendiri', fx: { attr: { stres: 7, kesehatan: -2, integritas: 2 } }, result: 'Tiga bulan bolak-balik rumah sakit, antre dari subuh. Kamu jadi hafal semua loket dan semua keluhannya.' },
      { label: 'Kirim uang seadanya, tetap sibuk', fx: { money: -5, attr: { stres: 3, integritas: -3 }, pop: { desa: -3 }, flags: ['lupa_orangtua'], hint: 'Kampung selalu tahu siapa yang pulang dan siapa yang tidak.' }, result: 'Adikmu yang merawat. Di kampung, orang mulai bilang kamu "sudah jadi orang kota".' },
    ],
  },
  {
    id: 'l_warisan_sengketa',
    title: 'Warisan',
    text: 'Ayahmu berpulang dan meninggalkan sebidang tanah di pinggir jalan kabupaten. Harganya sedang naik. Kakakmu ingin menjual cepat, adikmu ingin bertahan, dan pamanmu tiba-tiba membawa surat lama.',
    when: { minAge: 30 },
    weight: 2,
    once: true,
    choices: [
      { label: 'Bagi rata, sesuai musyawarah', fx: { money: 40, attr: { integritas: 3, stres: 3 }, pop: { desa: 2 } }, result: 'Butuh empat kali pertemuan dan satu kali ada yang menggebrak meja. Tapi lebaran berikutnya kalian masih makan bersama.' },
      { label: 'Urus sertifikat diam-diam atas namamu', need: { attrMin: { jaringan: 45 } }, fx: { money: 120, attr: { integritas: -7 }, pop: { desa: -4 }, heat: 6, flags: ['serobot_warisan'], hint: 'Saudara yang dikhianati adalah saksi yang paling bersemangat.' }, result: 'Kenalanmu di kantor pertanahan bekerja cepat. Keluargamu baru tahu setelah pagar dipasang.' },
      { label: 'Lepaskan bagianmu untuk adik', fx: { attr: { integritas: 5, stres: -2 }, pop: { desa: 4 } }, result: 'Kamu pulang tanpa membawa apa-apa. Cerita itu beredar di kampung lebih cepat dari undangan pengajian.' },
    ],
  },
  {
    id: 'l_banjir_kampung',
    title: 'Air Naik',
    text: 'Hujan tiga hari. Sungai meluap, rumahmu dan puluhan rumah tetangga terendam sepinggang.',
    when: { office: ['none'] },
    weight: 2,
    choices: [
      { label: 'Selamatkan barang sendiri dulu', fx: { money: -4, attr: { stres: 4 } }, result: 'Televisi dan surat-surat penting selamat. Tetangga sebelah kehilangan semuanya.' },
      { label: 'Pimpin evakuasi warga', fx: { money: -8, attr: { karisma: 3, kesehatan: -2, stres: 4 }, pop: { desa: 6, kabupaten: 2 } }, result: 'Kasurmu hanyut. Tapi sejak malam itu orang kampung datang kepadamu kalau ada masalah.' },
      { label: 'Galang donasi lewat kenalan', need: { attrMin: { jaringan: 40 } }, fx: { attr: { jaringan: 3, stres: 3 }, pop: { desa: 4, kabupaten: 2 } }, outcomes: [
        { chance: 0.8, text: 'Bantuan datang dua truk. Kamu membagikannya dengan daftar tertulis dan tanda terima.', fx: { attr: { integritas: 2 } } },
        { chance: 0.2, text: 'Bantuan datang, lalu muncul gosip kamu menyimpan sebagian. Tidak benar, tapi gosip tidak butuh benar.', fx: { pop: { desa: -3 }, attr: { stres: 3 } } },
      ] },
    ],
  },
  {
    id: 'l_tawaran_partai',
    title: 'Kartu Anggota',
    text: 'Seorang pengurus partai tingkat kabupaten bertamu ke rumahmu. Dia sudah lama memperhatikan. "Orang seperti kamu sayang kalau cuma jadi penonton."',
    when: { inParty: false, minAge: 23, attrMin: { karisma: 45, jaringan: 35 }, office: ['none'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Dengarkan, minta waktu berpikir', fx: { attr: { jaringan: 3 } }, result: 'Dia meninggalkan kartu nama dan sekotak kue. Pintu itu tetap terbuka.' },
      { label: 'Minta posisi pengurus sebagai syarat', need: { attrMin: { karisma: 55 } }, fx: { attr: { jaringan: 5, integritas: -1 }, flags: ['dijanjikan_kursi'] }, outcomes: [
        { chance: 0.5, text: 'Dia tertawa, lalu mengangguk. "Berani. Saya suka." Namamu dia bawa ke rapat.', fx: { pop: { kabupaten: 2 } } },
        { chance: 0.5, text: '"Antre dulu, Dik." Dia pulang dengan kesan kamu terlalu cepat lapar.', fx: { attr: { jaringan: -3 } } },
      ] },
      { label: 'Tolak, lebih bebas di luar', fx: { attr: { integritas: 2 }, pop: { desa: 1 } }, result: 'Kamu tetap jadi orang bebas. Bebas, dan tanpa kendaraan.' },
    ],
  },
  {
    id: 'l_teman_lama_pinjam',
    title: 'Kawan Sekolah',
    text: 'Kawan sebangkumu dulu datang dengan wajah kusut. Anaknya harus masuk rumah sakit, dan dia butuh 10 juta. Dia belum pernah meminta apa pun darimu.',
    when: { minAge: 24, moneyMin: 15 },
    weight: 2,
    once: true,
    choices: [
      { label: 'Pinjamkan tanpa syarat', fx: { money: -10, attr: { integritas: 3 }, pop: { desa: 2 }, schedule: [{ id: 'l_kawan_sekolah_balas', min: 48, max: 140, chance: 0.8 }] }, result: 'Dia menggenggam tanganmu lama sekali. Kamu tidak yakin uang itu akan kembali.' },
      { label: 'Pinjamkan dengan surat utang dan bunga', fx: { money: -10, attr: { integritas: -1 }, pop: { desa: -1 } }, outcomes: [
        { chance: 0.6, text: 'Dia membayar, tepat waktu, dengan bunganya. Sejak itu dia memanggilmu "Pak/Bu", bukan nama.', fx: { money: 13 } },
        { chance: 0.4, text: 'Dia tidak sanggup membayar. Kamu memegang surat utang dan kehilangan seorang kawan.', fx: { attr: { stres: 2 } } },
      ] },
      { label: 'Menolak dengan alasan', fx: { attr: { stres: 1 }, pop: { desa: -2 } }, result: 'Dia mengangguk dan pamit. Dia meminjam ke rentenir.' },
    ],
  },
  {
    id: 'l_kawan_sekolah_balas',
    title: 'Utang yang Dibayar Lain',
    text: 'Kawan sebangkumu dulu kini ketua paguyuban sopir dan pedagang se-kabupaten. Dia datang membawa amplop berisi 10 juta dan satu kalimat: "Kalau kamu butuh orang, bilang."',
    choices: [
      { label: 'Terima uangnya, simpan tawarannya', fx: { money: 10, attr: { jaringan: 5 }, pop: { kabupaten: 4 }, flags: ['paguyuban_setia'] }, result: 'Ribuan sopir angkot dan pedagang kaki lima kini mengenal namamu dari mulut orang yang mereka percaya.' },
      { label: 'Tolak uangnya, anggap lunas', fx: { attr: { integritas: 3, jaringan: 6 }, pop: { desa: 2, kabupaten: 5 }, flags: ['paguyuban_setia'] }, result: 'Dia tidak memaksa. Dia hanya bercerita soal ini di setiap pangkalan.' },
    ],
  },
  {
    id: 'l_pasangan_keberatan',
    title: 'Di Meja Makan',
    text: 'Pasanganmu meletakkan sendok. "Anak-anak hampir tidak mengenalmu. Tiap malam rapat, tiap akhir pekan acara. Sampai kapan?"',
    when: { flags: ['menikah'], attrMin: { stres: 55 } },
    weight: 3,
    choices: [
      { label: 'Kurangi kegiatan, luangkan waktu', fx: { attr: { stres: -7, kesehatan: 2, jaringan: -3 }, pop: { kabupaten: -1 } }, result: 'Beberapa undangan terlewat. Kamu jadi tahu nama guru anakmu.' },
      { label: 'Janji akan berubah, lalu berangkat rapat', fx: { attr: { stres: 3, integritas: -2 }, flags: ['rumah_retak'], hint: 'Janji di rumah juga dicatat.' }, result: 'Pasanganmu tidak membalas. Piringmu dibereskan sebelum kamu selesai bicara.' },
      { label: 'Libatkan pasangan dalam kegiatanmu', need: { attrMin: { karisma: 50 } }, fx: { attr: { stres: -3, jaringan: 2 }, pop: { desa: 2, kabupaten: 1 } }, result: 'Ternyata dia lebih pandai mengobrol dengan ibu-ibu pengajian daripada kamu. Kalian jadi tim.' },
    ],
  },

  // =====================================================================
  // PERTEMANAN
  // =====================================================================
  {
    id: 'l_teman_pengusaha_modal',
    title: 'Kawan yang Terjepit',
    text: '$npc datang malam-malam. Usahanya nyaris gulung tikar karena piutang macet. Dia butuh 30 juta untuk menggaji karyawan bulan ini. "Aku tidak akan lupa," katanya.',
    when: { friendRole: ['pengusaha'], office: ['none'], moneyMin: 20 },
    weight: 3,
    once: true,
    choices: [
      { label: 'Pinjamkan 30 juta tanpa bunga', need: { moneyMin: 30 }, fx: { money: -30, rel: 15, attr: { integritas: 2 }, flags: ['tolong_pengusaha'], schedule: [{ id: 'l_pengusaha_balas_budi', min: 30, max: 90 }] }, result: '$npc pulang dengan mata merah. Karyawannya gajian tepat waktu.' },
      { label: 'Minta saham sebagai gantinya', need: { moneyMin: 30 }, fx: { money: -30, rel: -3, attr: { integritas: -1 }, flags: ['saham_usaha_kawan'], schedule: [{ id: 'l_pengusaha_balas_budi', min: 30, max: 90, chance: 0.5 }], hint: 'Namamu kini tercantum di akta perusahaan orang lain.' }, result: '$npc terdiam sebentar, lalu mengangguk. Ini bisnis, bukan pertolongan.' },
      { label: 'Menolak, uangmu juga pas-pasan', fx: { rel: -10 }, result: '$npc bilang dia mengerti. Dia menjual mobilnya minggu itu juga.' },
    ],
  },
  {
    id: 'l_pengusaha_balas_budi',
    title: 'Balas Budi',
    text: 'Pengusaha yang dulu kamu tolong kini punya tiga gudang dan satu armada truk. Dia mengajakmu makan siang. "Dulu kamu satu-satunya yang mau membuka pintu. Sekarang giliranku. Kamu mau ke mana, aku ongkosi."',
    choices: [
      { label: 'Terima pengembalian utangnya saja, plus sedikit', fx: { money: 45, attr: { integritas: 2, jaringan: 3 } }, result: 'Utang lunas, dengan bonus yang wajar. Kalian berpisah sebagai dua orang yang impas.' },
      { label: 'Terima dia sebagai donor politikmu', fx: { money: 150, attr: { jaringan: 6 }, flags: ['utang_budi_pengusaha'], hint: 'Kebaikan yang dibayar terlalu besar berubah jadi tagihan baru.' }, result: 'Dia menulis cek tanpa bertanya untuk apa. "Nanti kalau sudah jadi, ingat-ingat kawan lama."' },
      { label: 'Minta dia mempekerjakan anak-anak muda kampungmu', fx: { money: 30, attr: { integritas: 3 }, pop: { desa: 6, kabupaten: 3 } }, result: 'Dua puluh pemuda kampung kini bekerja di gudangnya. Ibu-ibu mereka mendoakanmu tiap habis subuh.' },
    ],
  },
  {
    id: 'l_pengusaha_tagih_proyek',
    title: 'Ingat Kawan Lama',
    text: 'Pengusaha yang mendanai langkahmu datang ke rumah dinas, kali ini tanpa basa-basi. Ada tender pengadaan besar bulan depan. "Aku tidak minta dimenangkan. Aku cuma minta pesaingku digugurkan di administrasi."',
    when: { office: ['bupati', 'gubernur'], flags: ['utang_budi_pengusaha'] },
    weight: 6,
    once: true,
    choices: [
      { label: 'Atur tendernya', fx: { money: 200, attr: { integritas: -7 }, region: { infrastruktur: -2, kas: -15 }, heat: 18, flags: ['korupsi_proyek'], unflags: ['utang_budi_pengusaha'], schedule: [{ id: 'kpk_panggil', min: 10, max: 40, chance: 0.5 }], hint: 'Pesaing yang digugurkan biasanya menulis surat pengaduan.' }, result: 'Panitia tender mengerti isyaratmu. Pesaingnya gugur karena "materai kurang satu".' },
      { label: 'Tolak, tawarkan tender terbuka yang adil', fx: { attr: { integritas: 5, stres: 4, jaringan: -4 }, region: { kepuasan: 1 }, unflags: ['utang_budi_pengusaha'], flags: ['ingkar_donor'] }, outcomes: [
        { chance: 0.5, text: 'Dia ikut tender, dan menang dengan harga wajar. Dia menggerutu, tapi mengaku lega tidak perlu main belakang.', fx: { region: { infrastruktur: 2 } } },
        { chance: 0.5, text: 'Dia kalah tender dan pulang dengan wajah keras. Pemilihan berikutnya, uangnya mengalir ke lawanmu.', fx: { pop: { kabupaten: -2 }, heat: 3 } },
      ] },
      { label: 'Kembalikan seluruh dananya', need: { moneyMin: 150 }, fx: { money: -150, attr: { integritas: 6 }, unflags: ['utang_budi_pengusaha'] }, result: 'Dia menatap cek itu lama. "Kamu satu-satunya pejabat yang pernah mengembalikan uangku." Kalian tetap berkawan, anehnya.' },
    ],
  },
  {
    id: 'l_jurnalis_bocoran',
    title: 'Map Cokelat',
    text: '$npc menyodorkan sebuah map di warung kopi. Isinya dokumen soal proyek fiktif yang melibatkan pejabat setempat. "Redaksiku tidak berani. Kamu berani?"',
    when: { friendRole: ['jurnalis'], office: ['none'], minAge: 22 },
    weight: 3,
    once: true,
    choices: [
      { label: 'Bongkar ke publik', fx: { rel: 10, attr: { integritas: 4, karisma: 2, stres: 5 }, pop: { kabupaten: 5, provinsi: 2 }, flags: ['bongkar_proyek_fiktif'], schedule: [{ id: 'l_pejabat_dendam', min: 12, max: 60, chance: 0.7 }], hint: 'Pejabat itu kehilangan jabatan, bukan kawan-kawannya.' }, result: 'Kamu membacakan isi dokumen itu di depan kantor dinas. $npc memotret dari seberang jalan.' },
      { label: 'Pakai untuk menekan pejabat itu diam-diam', fx: { rel: -15, money: 35, attr: { integritas: -7, jaringan: 3 }, heat: 9, flags: ['pemeras_pejabat'], hint: 'Kamu kini memegang rahasia orang, dan $npc tahu apa yang kamu lakukan dengannya.' }, result: 'Pejabat itu mendadak ramah dan murah hati. $npc berhenti membalas pesanmu.' },
      { label: 'Kembalikan mapnya', fx: { rel: -4, attr: { stres: -1 } }, result: '$npc memasukkan map itu ke tasnya tanpa bicara, lalu membayar kopinya sendiri.' },
    ],
  },
  {
    id: 'l_pejabat_dendam',
    title: 'Orang Lama',
    text: 'Pejabat yang dulu kamu bongkar sudah lama tidak menjabat, tapi keponakannya kini duduk di tempat yang menentukan izin, mutasi, dan pemeriksaan. Urusanmu mendadak sering "kurang berkas".',
    choices: [
      { label: 'Hadapi lewat jalur resmi, sabar', fx: { attr: { stres: 6, integritas: 2 }, money: -8 }, result: 'Enam bulan bolak-balik. Semua berkasmu akhirnya lolos, karena memang tidak ada yang salah.' },
      { label: 'Umumkan bahwa kamu dipersulit', fx: { attr: { karisma: 2, stres: 4 }, pop: { kabupaten: 3, provinsi: 1 }, heat: 2 }, result: 'Publik masih ingat kasus lama itu. Si keponakan mendadak sangat tertib administrasi.' },
      { label: 'Datangi, minta damai', fx: { attr: { integritas: -3, jaringan: 3, stres: -2 }, money: -15 }, result: 'Kalian makan malam, kamu yang bayar. Urusanmu lancar. Warga yang dulu bertepuk tangan tidak perlu tahu.' },
    ],
  },
  {
    id: 'l_preman_pengamanan',
    title: 'Jasa Pengamanan',
    text: '$npc menawarkan anak buahnya. "Lawanmu pakai orang, masa kamu tidak? Baliho aman, massa ramai, yang iseng kami bereskan. Bayarnya nanti saja, kalau sudah jadi."',
    when: { friendRole: ['preman'], campaign: true },
    weight: 4,
    once: true,
    choices: [
      { label: 'Terima "pengamanan" itu', fx: { rel: 10, momentum: 5, attr: { integritas: -5 }, heat: 9, flags: ['beking_preman'], schedule: [{ id: 'l_preman_berulah', min: 6, max: 30 }], hint: '"Bayarnya nanti" adalah harga paling mahal.' }, result: 'Baliho lawan mendadak sering roboh. Massa kampanyemu penuh wajah-wajah sangar yang rajin bertepuk tangan.' },
      { label: 'Pakai hanya untuk menjaga baliho, bayar tunai', need: { moneyMin: 15 }, fx: { rel: 3, money: -15, momentum: 2, heat: 3 }, result: 'Transaksi selesai hari itu juga. Tidak ada utang, tidak ada janji.' },
      { label: 'Tolak dengan hormat', fx: { rel: -6, momentum: -2, attr: { integritas: 3 } }, result: '$npc mengangkat bahu. Dua hari kemudian separuh balihomu hilang. Entah oleh siapa.' },
    ],
  },
  {
    id: 'l_preman_berulah',
    title: 'Anak Buah',
    text: 'Orang-orang yang dulu "mengamankan" kampanyemu kini menarik setoran dari pasar dan terminal, sambil menyebut-nyebut namamu. Seorang pedagang yang menolak dipukuli sampai masuk rumah sakit.',
    choices: [
      { label: 'Biarkan, mereka sudah berjasa', fx: { attr: { integritas: -5 }, pop: { desa: -3, kabupaten: -5 }, region: { keamanan: -4, kepuasan: -3 }, heat: 10, schedule: [{ id: 'skandal_terbongkar', min: 6, max: 24, chance: 0.5 }], hint: 'Pedagang itu punya anak yang kuliah hukum.' }, result: 'Setoran mengalir, sebagian sampai ke mejamu dalam bentuk parsel. Pasar jadi sepi lebih cepat.' },
      { label: 'Perintahkan polisi menindak mereka', fx: { attr: { integritas: 4, stres: 6 }, pop: { kabupaten: 3 }, region: { keamanan: 3 }, unflags: ['beking_preman'] }, outcomes: [
        { chance: 0.5, text: 'Mereka ditangkap. Pemimpinnya berteriak di depan kamera bahwa kamu dulu yang memakai jasanya.', fx: { pop: { kabupaten: -4, provinsi: -2 }, heat: 6 } },
        { chance: 0.5, text: 'Mereka ditangkap dan memilih diam. Pesan yang sampai kepadamu singkat: "Kita impas."', fx: {} },
      ] },
      { label: 'Bayar mereka agar pergi dari wilayahmu', need: { moneyMin: 60 }, fx: { money: -60, attr: { integritas: -1 }, heat: 3, unflags: ['beking_preman'] }, result: 'Mereka pindah ke kabupaten sebelah. Masalahmu selesai, masalah orang lain dimulai.' },
    ],
  },
  {
    id: 'l_ulama_dukungan',
    title: 'Sowan',
    text: '$npc memintamu datang ke pondoknya. Atap asrama santri bocor dan dananya belum ada. Dia tidak meminta, hanya bercerita. Semua orang tahu jamaahnya ribuan.',
    when: { friendRole: ['ulama'], minAge: 23 },
    weight: 3,
    once: true,
    choices: [
      { label: 'Sumbang 20 juta, tanpa publikasi', need: { moneyMin: 20 }, fx: { money: -20, rel: 12, attr: { integritas: 3 }, pop: { desa: 2 }, flags: ['restu_ulama'] }, result: '$npc tidak mengucap terima kasih panjang. Dia hanya menyebut namamu dalam doa selepas pengajian.' },
      { label: 'Sumbang, pasang spanduk besar namamu', need: { moneyMin: 20 }, fx: { money: -20, rel: -2, pop: { desa: 3, kabupaten: 3 }, attr: { integritas: -1 } }, result: 'Spandukmu lebih besar dari papan nama pondoknya. $npc tersenyum tipis.' },
      { label: 'Tidak punya uang: datang dan bantu memperbaiki', fx: { rel: 8, attr: { kesehatan: -1, integritas: 2 }, pop: { desa: 3 }, flags: ['restu_ulama'] }, result: 'Tiga hari kamu naik ke atap bersama para santri. $npc mengirim teh dan memperhatikan dari serambi.' },
      { label: 'Berjanji membantu "kalau sudah jadi nanti"', fx: { rel: -5, flags: ['janji_ke_ulama'], hint: 'Orang yang mengajar ribuan santri punya ingatan dan mimbar.' }, result: '$npc mengangguk pelan. Dia sudah sering mendengar kalimat itu.' },
    ],
  },
  {
    id: 'l_ulama_di_kampanye',
    title: 'Mimbar Jumat',
    text: 'Menjelang pemungutan suara, kabar dari pondok sampai ke poskomu. Kiai yang dulu kamu datangi akan menyinggung soal pemilihan di pengajian akbar malam ini.',
    when: { campaign: true, flags: ['restu_ulama'] },
    weight: 5,
    once: true,
    choices: [
      { label: 'Datang sebagai jamaah biasa, duduk di belakang', fx: { momentum: 6, pop: { desa: 3, kabupaten: 3 }, attr: { integritas: 1 } }, result: '"Pilihlah yang datang sebelum butuh," katanya, tanpa menyebut nama. Semua kepala menoleh ke arahmu.' },
      { label: 'Minta beliau menyebut namamu terang-terangan', fx: { momentum: 4, rel: -6, attr: { integritas: -2 }, pop: { kabupaten: 1 } }, result: 'Beliau menyebutnya, dengan nada orang yang sedang membayar utang. Sebagian jamaah merasa tidak enak.' },
    ],
  },
  {
    id: 'l_birokrat_titipan',
    title: 'Daftar Mutasi',
    text: '$npc membawa daftar pejabat yang akan dirotasi. Di sela-selanya terselip satu nama keponakannya untuk posisi kepala dinas basah. "Anaknya pintar kok. Dan aku tahu semua lorong di kantor ini, kamu butuh aku."',
    when: { friendRole: ['birokrat'], office: ['bupati', 'gubernur'] },
    weight: 4,
    once: true,
    choices: [
      { label: 'Loloskan keponakannya', fx: { rel: 12, attr: { integritas: -4, jaringan: 3 }, region: { layanan: -2 }, heat: 6, flags: ['pejabat_titipan'], schedule: [{ id: 'l_titipan_berulah', min: 10, max: 30, chance: 0.75 }], hint: 'Kalau dia berulah, tanda tangan pengangkatannya milikmu.' }, result: 'Pelantikan berjalan khidmat. $npc kini melancarkan semua urusanmu di kantor.' },
      { label: 'Buka seleksi terbuka; keponakannya boleh ikut', fx: { rel: -5, attr: { integritas: 4 }, region: { layanan: 3, kepuasan: 1 } }, result: 'Keponakannya gugur di tahap kedua. $npc tetap bekerja untukmu, hanya dengan kecepatan yang berbeda.' },
      { label: 'Tolak dan tegur', fx: { rel: -14, attr: { integritas: 5, stres: 4 }, region: { layanan: 1 }, hint: 'Birokrat yang tersinggung bisa membuat surat berjalan sangat lambat.' }, result: '$npc minta maaf dengan sopan. Sejak itu berkas-berkasmu sering "masih di meja bagian umum".' },
    ],
  },
  {
    id: 'l_titipan_berulah',
    title: 'Kepala Dinas Itu',
    text: 'Pejabat titipan yang dulu kamu loloskan ketahuan memotong anggaran makan pasien dan honor guru. Jumlahnya besar. Auditor meminta penjelasan soal proses pengangkatannya.',
    choices: [
      { label: 'Copot dan serahkan ke penegak hukum', fx: { attr: { integritas: 4, stres: 5 }, region: { layanan: 2, kepuasan: 1 }, pop: { kabupaten: -1 }, heat: 4, unflags: ['pejabat_titipan'] }, result: 'Kamu mengumumkannya sendiri sebelum media. Pertanyaan "siapa yang mengangkat dia" tetap muncul, tapi lebih pelan.' },
      { label: 'Lindungi, pindahkan ke jabatan lain', fx: { attr: { integritas: -5 }, region: { layanan: -3, kepuasan: -3 }, heat: 14, schedule: [{ id: 'kpk_panggil', min: 6, max: 24, chance: 0.6 }], hint: 'Auditor tidak ikut pindah.' }, result: 'Dia dilantik lagi di dinas lain dengan batik yang sama. Guru-guru honorer mulai menulis surat terbuka.' },
      { label: 'Salahkan panitia seleksi', fx: { attr: { integritas: -3, stres: 3 }, region: { kepuasan: -2 }, heat: 8 }, outcomes: [
        { chance: 0.5, text: 'Ketua panitia tidak terima dan membuka memo bertanda tanganmu ke wartawan.', fx: { pop: { kabupaten: -5, provinsi: -3 }, heat: 8, schedule: [{ id: 'skandal_terbongkar', min: 2, max: 10, chance: 0.6 }] } },
        { chance: 0.5, text: 'Panitia menelan pil pahit itu. Mereka pegawai, dan kamu atasannya. Untuk sekarang.', fx: {} },
      ] },
    ],
  },
  {
    id: 'l_aktivis_menggugat',
    title: 'Kawan di Seberang Pagar',
    text: 'Demo di depan kantormu dipimpin $npc, kawanmu sendiri. Dia menuntut penjelasan soal penggusuran kampung nelayan untuk kawasan industri. Pengeras suaranya menyebut namamu berulang-ulang.',
    when: { friendRole: ['aktivis'], office: ['bupati', 'gubernur'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Keluar, temui massa, buka dokumennya', fx: { rel: 8, attr: { karisma: 3, integritas: 3, stres: 4 }, region: { kepuasan: 3, kas: -10 }, pop: { kabupaten: 3 } }, result: 'Kamu berdiri dua jam di bawah matahari. Rencana itu direvisi, investor mengeluh, $npc menjabat tanganmu di depan kamera.' },
      { label: 'Undang $npc masuk, tawarkan jabatan staf khusus', fx: { attr: { integritas: -2, jaringan: 2 } }, outcomes: [
        { chance: 0.35, text: '$npc menerima. Demo bubar. Kawan-kawannya menyebut dia pengkhianat, dan namamu ikut disebut.', fx: { rel: 5, region: { kepuasan: -1 }, pop: { kabupaten: -1 } } },
        { chance: 0.65, text: '$npc keluar dan mengumumkan tawaran itu lewat pengeras suara. Massa bersorak. Bukan untukmu.', fx: { rel: -12, region: { kepuasan: -3 }, pop: { kabupaten: -4 } } },
      ] },
      { label: 'Suruh aparat membubarkan', fx: { rel: -25, attr: { integritas: -4 }, region: { kepuasan: -4, keamanan: 1 }, pop: { kabupaten: -4, provinsi: -2 }, heat: 5, flags: ['bubarkan_demo'], hint: 'Kawan yang dipukul mundur akan kembali membawa lebih banyak orang.' }, result: 'Jalan bersih dalam satu jam. $npc dibawa ke kantor polisi dengan baju sobek. Fotonya jadi sampul koran.' },
    ],
  },
  {
    id: 'l_artis_panggung',
    title: 'Bintang Tamu',
    text: '$npc bersedia tampil di kampanye akbarmu. Gratis, katanya. Hanya saja, belakangan dia sedang ramai digosipkan soal urusan pribadi yang kurang sedap.',
    when: { friendRole: ['artis'], campaign: true },
    weight: 3,
    once: true,
    choices: [
      { label: 'Undang, biarkan panggung bergoyang', fx: { rel: 8 }, outcomes: [
        { chance: 0.6, text: 'Lapangan penuh sesak. Orang datang untuk $npc dan pulang membawa stiker wajahmu.', fx: { momentum: 6, pop: { kabupaten: 2, provinsi: 2 } } },
        { chance: 0.4, text: 'Gosip itu ternyata benar, dan meledak sehari setelah acara. Fotomu merangkul $npc ada di semua portal.', fx: { momentum: -4, pop: { provinsi: -2 } } },
      ] },
      { label: 'Tolak halus, tunggu gosipnya reda', fx: { rel: -6, momentum: -1 }, result: '$npc tampil di panggung lawan minggu berikutnya.' },
      { label: 'Minta dukungan lewat video singkat saja', fx: { rel: 2, momentum: 2 }, result: 'Tiga puluh detik, aman, sopan. Tidak ada yang bergoyang, tidak ada yang tersandung.' },
    ],
  },
  {
    id: 'l_politisi_ajak_pindah',
    title: 'Perahu Lain',
    text: '$npc berbisik di sebuah resepsi. Partainya sedang naik daun dan butuh wajah baru. "Di tempatmu sekarang kamu antre sepuluh tahun. Di tempatku, langsung nomor urut satu."',
    when: { friendRole: ['politisi'], inParty: true, office: ['none'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Tetap setia di partaimu', fx: { party: 6, rel: -3, attr: { integritas: 2 } }, result: 'Kabar penolakanmu sampai ke telinga ketua. Kesetiaan dicatat, meski lambat dibayar.' },
      { label: 'Pakai tawaran itu untuk menaikkan posisi tawar', need: { attrMin: { kecerdasan: 50 } }, fx: { attr: { integritas: -2 } }, outcomes: [
        { chance: 0.55, text: 'Ketuamu panik dan menawarkan posisi yang lebih baik. $npc merasa diperalat.', fx: { party: 8, rel: -10 } },
        { chance: 0.45, text: 'Ketuamu mendengus: "Silakan kalau mau pergi." Kamu tidak pergi, dan sekarang semua tahu kamu sempat menimbang.', fx: { party: -8, rel: -6 } },
      ] },
      { label: 'Bilang kamu akan memikirkannya', fx: { rel: 4, party: -3, flags: ['kutu_loncat_ragu'], hint: 'Kabar di resepsi menyebar lebih cepat dari prasmanan.' }, result: '$npc tersenyum. Seseorang di meja sebelah mencatat siapa bicara dengan siapa.' },
    ],
  },

  // =====================================================================
  // RANTAI: KAWAN DEMO
  // =====================================================================
  {
    id: 'l_kawan_demo_sukses',
    title: 'Reuni Jalanan',
    text: 'Kawan-kawan yang dulu bersamamu di atas mobil komando kini tersebar: satu jadi komisioner lembaga negara, satu redaktur, satu anggota dewan. Mereka menggelar reuni dan mencarimu.',
    choices: [
      { label: 'Datang dan sambung lagi persaudaraan', fx: { attr: { jaringan: 8, stres: -2 }, pop: { provinsi: 2, nasional: 2 }, flags: ['jaringan_angkatan'] }, result: 'Kalian bernyanyi lagu lama dengan suara yang sudah tidak sampai. Grup percakapan baru dibuat. Isinya orang-orang yang kini bisa menggerakkan banyak hal.' },
      { label: 'Datang, lalu minta bantuan konkret', fx: { attr: { jaringan: 5, integritas: -1 }, money: 30, pop: { provinsi: 1 }, flags: ['jaringan_angkatan'] }, result: 'Mereka membantu, karena kamu dulu berdarah bersama mereka. Tapi ada yang berbisik kamu datang hanya untuk itu.' },
      { label: 'Tidak datang, sibuk', fx: { attr: { jaringan: -2 } }, result: 'Fotonya beredar tanpa kamu. Di keterangan foto, seseorang menulis: "Yang paling lantang malah tidak hadir."' },
    ],
  },
  {
    id: 'l_foto_demo_lama',
    title: 'Foto Lama',
    text: 'Seseorang mengunggah fotomu dua puluh tahun lalu: berdiri di atas mobil komando, pelipis berplester, tangan mengepal. Foto itu menyebar di tengah kampanye.',
    when: { campaign: true, flags: ['aktivis_kampus'] },
    weight: 4,
    once: true,
    choices: [
      { label: 'Biarkan bicara sendiri', fx: { momentum: 4, pop: { kabupaten: 2, provinsi: 2 } }, result: '"Dia sudah melawan sejak dulu." Kamu tidak perlu menambahkan apa-apa.' },
      { label: 'Jadikan bahan kampanye besar-besaran', fx: { momentum: 6, attr: { integritas: -1 }, hint: 'Kawan lama akan membandingkan foto itu dengan dirimu sekarang.' }, outcomes: [
        { chance: 0.35, text: 'Seorang kawan lama menulis: "Yang di foto itu berani. Yang di baliho itu sudah lain orang." Ikut viral.', fx: { momentum: -5 } },
        { chance: 0.65, text: 'Kaos bergambar foto itu laku keras di kalangan anak muda.', fx: { pop: { nasional: 1 } } },
      ] },
    ],
  },
  {
    id: 'l_kawan_lama_membongkar',
    title: 'Amplop Hari Itu',
    text: 'Seorang kawan kuliahmu, kini penulis yang cukup dikenal, menerbitkan memoar. Satu bab berjudul "Hari Ketika Demo Kami Dijual". Namamu disamarkan dengan sangat buruk.',
    choices: [
      { label: 'Akui dan minta maaf pada kawan-kawan lama', fx: { attr: { integritas: 5, stres: 5, karisma: -2 }, pop: { kabupaten: -3, provinsi: -3, nasional: -2 }, heat: -4, unflags: ['jual_gerakan'] }, result: '"Saya masih muda, saya miskin, dan saya salah." Beberapa kawan memaafkan. Beberapa tidak akan pernah.' },
      { label: 'Ancam gugat pencemaran nama baik', fx: { attr: { integritas: -3, stres: 4 } }, outcomes: [
        { chance: 0.6, text: 'Ancamanmu membuat bukunya cetak ulang tiga kali. Dua saksi lain ikut angkat bicara.', fx: { pop: { kabupaten: -5, provinsi: -5, nasional: -4 }, heat: 8, schedule: [{ id: 'skandal_terbongkar', min: 2, max: 10, chance: 0.5 }] } },
        { chance: 0.4, text: 'Penerbit mengalah dan merevisi bab itu. Edisi pertama jadi barang buruan kolektor.', fx: { money: -20, heat: 3 } },
      ] },
      { label: 'Diam saja', fx: { pop: { kabupaten: -2, provinsi: -3, nasional: -2 }, attr: { stres: 3 }, heat: 3 }, result: 'Kamu tidak membantah, tidak mengiyakan. Di kalangan aktivis, diam sudah cukup sebagai jawaban.' },
    ],
  },

  // =====================================================================
  // MENJABAT: KEPALA DESA
  // =====================================================================
  {
    id: 'l_dana_desa',
    title: 'Dana Desa Cair',
    text: 'Dana desa tahap pertama masuk rekening. Pada minggu yang sama, anakmu harus bayar uang pangkal sekolah dan atap rumahmu bocor. Bendahara desa berbisik: "Pinjam dulu saja, Pak/Bu Kades. Nanti ditutup sebelum laporan."',
    when: { office: ['kades'] },
    weight: 5,
    once: true,
    choices: [
      { label: '"Pinjam" 25 juta dulu', fx: { money: 25, attr: { integritas: -5 }, region: { kas: -10 }, heat: 8, flags: ['pinjam_dana_desa'], schedule: [{ id: 'l_audit_dana_desa', min: 6, max: 16 }], hint: 'Laporan pertanggungjawaban punya tenggat. Inspektorat juga.' }, result: 'Atapmu tidak bocor lagi. Talud irigasi dusun barat ditunda "karena cuaca".' },
      { label: 'Pakai semuanya sesuai rencana, tempel rinciannya di balai desa', fx: { attr: { integritas: 4, stres: 3 }, region: { infrastruktur: 3, kepuasan: 3, kas: -8 }, pop: { desa: 4 }, flags: ['desa_transparan'], schedule: [{ id: 'l_desa_percontohan', min: 14, max: 30 }] }, result: 'Warga membaca angka-angka itu sambil menunjuk-nunjuk. Bendahara cemberut. Atapmu masih bocor.' },
      { label: 'Kerjakan proyeknya, tapi lewat toko bangunan iparmu', fx: { money: 8, attr: { integritas: -2 }, region: { infrastruktur: 2, kas: -8 }, heat: 4, hint: 'Harga semen di nota itu bisa dibandingkan siapa saja.' }, result: 'Proyek jadi. Iparmu senang. Harga pasirnya sedikit di atas pasaran, kata orang.' },
    ],
  },
  {
    id: 'l_audit_dana_desa',
    title: 'Inspektorat Datang',
    text: 'Dua pemeriksa dari kabupaten duduk di balai desa dengan kalkulator dan meteran. Selisih kas 25 juta belum tertutup. Bendahara sudah pucat sejak pagi.',
    choices: [
      { label: 'Kembalikan sekarang juga, akui kelalaian', need: { moneyMin: 25 }, fx: { money: -25, attr: { integritas: 2, stres: 5 }, region: { kas: 10 }, pop: { desa: -2 }, heat: -5, unflags: ['pinjam_dana_desa'] }, result: 'Temuan dicatat sebagai "kesalahan administrasi, sudah ditindaklanjuti". Kamu selamat dengan malu secukupnya.' },
      { label: 'Buat nota dan kuitansi fiktif', fx: { attr: { integritas: -6, stres: 6 }, heat: 12 }, outcomes: [
        { chance: 0.55, text: 'Pemeriksa menelepon toko di kuitansi itu. Tokonya sudah tutup dua tahun lalu.', fx: { jail: 18, pop: { desa: -10, kabupaten: -5 }, region: { kepuasan: -5 } } },
        { chance: 0.45, text: 'Pemeriksa meneken berita acara tanpa banyak tanya. Bendahara kini memegang rahasiamu.', fx: { flags: ['nota_fiktif'], schedule: [{ id: 'skandal_terbongkar', min: 18, max: 72, chance: 0.5 }] } },
      ] },
      { label: 'Selipkan amplop untuk pemeriksa', need: { moneyMin: 10 }, fx: { money: -10, attr: { integritas: -5 }, heat: 10, flags: ['suap_auditor'], hint: 'Pemeriksa yang bisa dibeli juga bisa dibeli orang lain.' }, outcomes: [
        { chance: 0.7, text: 'Laporannya bersih. Pemeriksa itu berjanji akan "mampir lagi" tahun depan.', fx: {} },
        { chance: 0.3, text: 'Salah satu pemeriksa menolak dan melaporkan percobaan suap. Urusanmu naik kelas.', fx: { jail: 24, pop: { desa: -10, kabupaten: -6 } } },
      ] },
    ],
  },
  {
    id: 'l_desa_percontohan',
    title: 'Desa Percontohan',
    text: 'Papan rincian anggaran di balai desamu difoto seorang pegawai kabupaten dan tersebar. Bupati ingin menjadikan desamu percontohan transparansi, lengkap dengan kunjungan dan kamera.',
    choices: [
      { label: 'Terima, pakai panggungnya', fx: { pop: { desa: 3, kabupaten: 6, provinsi: 2 }, attr: { jaringan: 4, karisma: 2 }, region: { kas: 10, kepuasan: 2 } }, result: 'Rombongan datang, makan nasi liwet, dan pulang membawa fotokopi laporanmu. Namamu disebut di rapat para kades se-kabupaten.' },
      { label: 'Terima bantuannya, tolak seremoninya', fx: { pop: { desa: 4, kabupaten: 3 }, attr: { integritas: 2 }, region: { kas: 15, infrastruktur: 2 } }, result: 'Dana insentif masuk tanpa tenda dan sambutan. Dipakai menyelesaikan talud dusun barat.' },
    ],
  },
  {
    id: 'l_sengketa_batas',
    title: 'Patok Bergeser',
    text: 'Dua keluarga besar di desamu bertengkar soal batas sawah. Patok bergeser satu meter, parang sudah diasah. Salah satunya keluarga pendukung utamamu saat pemilihan.',
    when: { office: ['kades'] },
    weight: 3,
    choices: [
      { label: 'Ukur ulang bersama petugas pertanahan, apa pun hasilnya', fx: { attr: { integritas: 3, stres: 4 }, region: { keamanan: 3, kepuasan: 2 }, pop: { desa: 1 } }, result: 'Hasil ukur merugikan pendukungmu. Mereka kecewa, tapi parang kembali ke dapur.' },
      { label: 'Menangkan pendukungmu', fx: { attr: { integritas: -4 }, region: { keamanan: -3, kepuasan: -2 }, pop: { desa: -2 }, heat: 3, hint: 'Keluarga yang kalah punya banyak sepupu dan satu suara masing-masing.' }, result: 'Pendukungmu berpesta. Keluarga satunya berhenti datang ke kerja bakti.' },
      { label: 'Damaikan lewat tetua adat dan makan bersama', need: { attrMin: { karisma: 50 } }, fx: { attr: { karisma: 2 }, region: { keamanan: 4, kepuasan: 3 }, pop: { desa: 3 }, money: -3 }, result: 'Seekor kambing, tiga jam pidato tetua, dan patok dipasang di tengah-tengah. Semua merasa sedikit rugi, artinya adil.' },
    ],
  },
  {
    id: 'l_bansos_data',
    title: 'Daftar Penerima',
    text: 'Kuota bantuan pangan untuk desamu hanya 80 keluarga. Yang layak 130. Perangkat desa sudah menyusun daftar, dan separuhnya kerabat mereka sendiri. Sepupumu juga masuk.',
    when: { office: ['kades'] },
    weight: 3,
    choices: [
      { label: 'Rombak: musyawarah terbuka, tempel daftarnya', fx: { attr: { integritas: 4, stres: 5, jaringan: -2 }, region: { kesejahteraan: 2, kepuasan: 3 }, pop: { desa: 3 } }, result: 'Rapat sampai tengah malam, dua perangkat desa merajuk. Sepupumu dicoret. Dia masih datang lebaran, dengan wajah datar.' },
      { label: 'Biarkan daftar itu', fx: { attr: { integritas: -3 }, region: { kesejahteraan: -1, kepuasan: -3 }, pop: { desa: -3 }, heat: 3 }, result: 'Beras dibagikan. Seorang janda di ujung dusun menonton dari teras rumahnya.' },
      { label: 'Bagi rata tipis-tipis ke semua', fx: { region: { kepuasan: 1 }, attr: { integritas: -1 }, heat: 2, hint: 'Aturannya tidak begitu, dan pendamping program tahu.' }, result: 'Semua dapat separuh. Tidak ada yang kenyang, tidak ada yang marah. Laporannya terpaksa kamu "sesuaikan".' },
    ],
  },

  // =====================================================================
  // MENJABAT: BUPATI / GUBERNUR
  // =====================================================================
  {
    id: 'l_suap_proyek_jalan',
    title: 'Jalan Lingkar',
    text: 'Seorang kontraktor besar meminta waktu lima menit. Dia ingin proyek jalan lingkar. Dia menulis sebuah angka di tisu, menggesernya ke arahmu, lalu menyobek tisu itu.',
    when: { office: ['bupati'] },
    weight: 4,
    once: true,
    choices: [
      { label: 'Terima "komitmen" itu', fx: { money: 300, attr: { integritas: -8 }, region: { infrastruktur: 1, kas: -20 }, heat: 20, flags: ['korupsi_proyek'], schedule: [{ id: 'kpk_panggil', min: 12, max: 48, chance: 0.55 }, { id: 'l_jalan_lingkar_rusak', min: 14, max: 30 }], hint: 'Tisu bisa disobek. Aliran rekening tidak.' }, result: 'Tender berjalan "sesuai prosedur". Uangnya datang bertahap, lewat tiga nama yang tidak kamu kenal.' },
      { label: 'Tolak, lelang terbuka dengan pengawas independen', fx: { attr: { integritas: 5, stres: 5, jaringan: -3 }, region: { infrastruktur: 4, kepuasan: 2, kas: -15 }, pop: { kabupaten: 2 } }, result: 'Proyek molor empat bulan karena sanggahan demi sanggahan. Tapi aspalnya tebal, dan tidak ada yang memegang rahasiamu.' },
      { label: 'Tolak uangnya, tapi minta dia menyumbang ke partai', need: { inParty: true }, fx: { party: 8, attr: { integritas: -3 }, region: { infrastruktur: 2, kas: -18 }, heat: 8, hint: 'Sumbangan itu tetap punya alamat pengirim.' }, result: 'Tanganmu bersih, kata kamu pada dirimu sendiri. Bendahara partai mengirim ucapan terima kasih.' },
    ],
  },
  {
    id: 'l_jalan_lingkar_rusak',
    title: 'Aspal Setipis Kulit',
    text: 'Belum dua musim hujan, jalan lingkar sudah berlubang seperti kubangan kerbau. Warga menanam pohon pisang di tengahnya dan memasang fotomu.',
    choices: [
      { label: 'Perbaiki dengan dana darurat, diam soal penyebabnya', fx: { region: { kas: -20, infrastruktur: 1, kepuasan: -2 }, heat: 6, pop: { kabupaten: -2 } }, result: 'Lubang ditambal. Pertanyaan "kenapa cepat rusak" tidak ikut tertambal.' },
      { label: 'Tuntut kontraktor memperbaiki', fx: { attr: { stres: 6 }, region: { infrastruktur: 2 } }, outcomes: [
        { chance: 0.5, text: 'Kontraktor memperbaiki sambil mengirim pesan: "Bapak/Ibu yakin mau main keras dengan saya?"', fx: { heat: 8 } },
        { chance: 0.5, text: 'Kontraktor menolak dan membocorkan catatan setoran ke aparat.', fx: { heat: 15, pop: { kabupaten: -4 }, schedule: [{ id: 'kpk_panggil', min: 2, max: 10 }] } },
      ] },
      { label: 'Salahkan curah hujan dan truk kelebihan muatan', fx: { region: { kepuasan: -4, infrastruktur: -2 }, pop: { kabupaten: -4 }, attr: { integritas: -2 } }, result: 'Pohon pisang di jalan itu bertambah. Salah satunya sudah berbuah.' },
    ],
  },
  {
    id: 'l_tambang_ilegal',
    title: 'Lubang di Bukit',
    text: 'Laporan masuk: puluhan lubang tambang tanpa izin di hulu sungai. Air sawah mulai keruh. Malamnya, seorang perantara datang menawarkan "setoran bulanan" asal aparat daerah tutup mata.',
    when: { office: ['bupati', 'gubernur'] },
    weight: 4,
    once: true,
    choices: [
      { label: 'Terima setoran, biarkan berjalan', fx: { money: 180, attr: { integritas: -8 }, region: { kesejahteraan: 1, keamanan: -2 }, heat: 15, flags: ['beking_tambang'], schedule: [{ id: 'l_longsor_tambang', min: 10, max: 36 }], hint: 'Bukit yang dilubangi tidak peduli siapa yang membekingi.' }, result: 'Setoran datang tiap tanggal lima. Sungai makin cokelat, dan ikan-ikan mengapung pada musim kemarau.' },
      { label: 'Tutup tambang, tindak cukongnya', fx: { attr: { integritas: 5, stres: 7 }, region: { kesejahteraan: -2, keamanan: 2, kepuasan: 1 }, pop: { kabupaten: 2, provinsi: 2 }, flags: ['tutup_tambang'], schedule: [{ id: 'l_cukong_tambang_balas', min: 4, max: 18, chance: 0.7 }, { id: 'l_sungai_jernih', min: 20, max: 44 }], hint: 'Ratusan penambang kehilangan nafkah, dan cukongnya kehilangan lebih banyak.' }, result: 'Alat berat disita. Para penambang berdemo di kantormu, dibiayai orang yang tidak pernah muncul.' },
      { label: 'Legalkan: beri izin tambang rakyat dengan aturan ketat', need: { attrMin: { kecerdasan: 55 } }, fx: { attr: { stres: 5 }, region: { kesejahteraan: 2, kas: 12, kepuasan: 1 }, heat: 2 }, outcomes: [
        { chance: 0.55, text: 'Koperasi penambang terbentuk, kolam pengendap dibangun. Tidak sempurna, tapi sungai mulai membaik.', fx: { region: { keamanan: 2 } } },
        { chance: 0.45, text: 'Izin rakyat itu dipinjam cukong lama dengan nama baru. Di atas kertas semuanya sah.', fx: { region: { keamanan: -2 }, heat: 5 } },
      ] },
    ],
  },
  {
    id: 'l_longsor_tambang',
    title: 'Bukit Runtuh',
    text: 'Hujan semalaman. Lubang-lubang tambang di hulu runtuh, lumpur menyapu satu dusun. Belasan orang tertimbun. Wartawan dari ibu kota sudah dalam perjalanan, dan mereka akan bertanya siapa yang membiarkan.',
    choices: [
      { label: 'Turun ke lokasi, buka semuanya, akui pembiaran', fx: { attr: { integritas: 5, stres: 10 }, region: { kesejahteraan: -4, kepuasan: -4, kas: -25 }, pop: { kabupaten: -6, provinsi: -5, nasional: -3 }, jail: 20, unflags: ['beking_tambang'] }, result: 'Kamu menyerahkan catatan setoran itu sendiri. Vonismu diringankan. Di dusun itu, namamu tidak pernah disebut lagi.' },
      { label: 'Pimpin evakuasi, tutupi soal setoran', fx: { attr: { stres: 9, integritas: -3 }, region: { kesejahteraan: -4, kepuasan: -2, kas: -25 }, heat: 15 }, outcomes: [
        { chance: 0.5, text: 'Perantara itu tertangkap dan menyebut namamu pada jam pertama pemeriksaan.', fx: { jail: 60, pop: { kabupaten: -10, provinsi: -8, nasional: -6 } } },
        { chance: 0.5, text: 'Fotomu berlumpur menggendong anak kecil jadi sampul koran. Perantara itu kabur ke luar pulau. Untuk sementara.', fx: { pop: { kabupaten: 2 }, schedule: [{ id: 'kpk_panggil', min: 6, max: 30, chance: 0.7 }] } },
      ] },
      { label: 'Salahkan penambang liar dan cuaca ekstrem', fx: { attr: { integritas: -5 }, region: { kesejahteraan: -5, kepuasan: -6, kas: -15 }, pop: { kabupaten: -6, provinsi: -4 }, heat: 18, schedule: [{ id: 'kpk_panggil', min: 3, max: 14 }] }, result: 'Keluarga korban mendirikan tenda di depan kantormu. Mereka membawa foto-foto, dan tidak berniat pulang.' },
    ],
  },
  {
    id: 'l_cukong_tambang_balas',
    title: 'Serangan Balik',
    text: 'Sejak tambang ditutup, hidupmu jadi ramai. Akun-akun anonim menyebar fitnah, demo bayaran datang tiap Senin, dan seekor ayam mati digantung di pagar rumah dinasmu.',
    choices: [
      { label: 'Jalan terus, minta perlindungan aparat pusat', fx: { attr: { stres: 8, integritas: 2 }, pop: { kabupaten: 2, provinsi: 3, nasional: 2 }, region: { keamanan: 1 } }, result: 'Kamu tidur dengan dua penjaga di teras. Media nasional mulai menulis soal "kepala daerah yang diteror".' },
      { label: 'Berunding diam-diam dengan si cukong', fx: { attr: { integritas: -5, stres: -3 }, money: 80, region: { keamanan: -2 }, heat: 10, unflags: ['tutup_tambang'], flags: ['beking_tambang'], schedule: [{ id: 'l_longsor_tambang', min: 12, max: 40, chance: 0.7 }], hint: 'Lubang-lubang itu dibuka lagi.' }, result: 'Teror berhenti seketika. Alat berat kembali naik ke bukit pada malam hari.' },
      { label: 'Balas: bongkar jaringan cukong ke media', need: { attrMin: { jaringan: 55 } }, fx: { attr: { stres: 6, karisma: 3 }, pop: { provinsi: 4, nasional: 3 } }, outcomes: [
        { chance: 0.6, text: 'Nama-nama besar terseret. Cukong itu mendadak sibuk menyelamatkan diri sendiri.', fx: { region: { keamanan: 3 } } },
        { chance: 0.4, text: 'Salah satu nama itu petinggi partaimu sendiri. Telepon dari pusat tidak ramah.', fx: { party: -10 } },
      ] },
    ],
  },
  {
    id: 'l_sungai_jernih',
    title: 'Air yang Kembali',
    text: 'Dua musim setelah tambang ditutup, sungai di hilir kembali jernih. Sawah panen tiga kali. Anak-anak mandi di kali lagi, dan seseorang merekamnya.',
    choices: [
      { label: 'Datang ke panen raya tanpa panggung', fx: { region: { kesejahteraan: 4, kepuasan: 4 }, pop: { kabupaten: 5, provinsi: 3 }, attr: { stres: -4 } }, result: 'Seorang petani tua menyodorkan segenggam gabah. "Ini dari air yang Bapak/Ibu kembalikan." Kamera ponsel di mana-mana.' },
      { label: 'Jadikan program unggulan dan ajukan penghargaan', fx: { region: { kesejahteraan: 3, kepuasan: 3, kas: 10 }, pop: { provinsi: 4, nasional: 3 }, attr: { karisma: 2 } }, result: 'Piala lingkungan mendarat di lemari kantormu. Para cukong menonton acaranya dari jauh.' },
    ],
  },
  {
    id: 'l_relokasi_pasar',
    title: 'Pasar Lama',
    text: 'Pasar tradisional di pusat kota kumuh dan macet. Investor ingin membangun pusat belanja di lahannya. Ratusan pedagang menolak pindah ke lokasi baru yang jauh dan sepi. Mereka sudah menutup jalan sejak subuh.',
    when: { office: ['bupati'] },
    weight: 3,
    once: true,
    choices: [
      { label: 'Gusur sesuai jadwal', fx: { region: { kas: 25, infrastruktur: 2, kepuasan: -5, kesejahteraan: -2 }, pop: { kabupaten: -5 }, attr: { integritas: -2 }, heat: 3, flags: ['gusur_pasar'], hint: 'Pedagang pasar bicara dengan ribuan pembeli setiap hari.' }, result: 'Alat berat masuk dikawal aparat. Pusat belanja berdiri megah. Pasar baru di pinggir kota berisi lapak-lapak kosong.' },
      { label: 'Revitalisasi di tempat, pedagang tetap', fx: { region: { kas: -20, infrastruktur: 2, kepuasan: 4, kesejahteraan: 2 }, pop: { kabupaten: 4 }, attr: { stres: 4 } }, result: 'Investor pergi sambil menggerutu. Pasar dibangun bertahap; pedagang berjualan di tenda darurat sambil mengawasi tukang.' },
      { label: 'Turun, berunding sampai ada jalan tengah', need: { attrMin: { karisma: 55 } }, fx: { attr: { stres: 6, karisma: 2 }, region: { kas: 8, kepuasan: 2, infrastruktur: 2 }, pop: { kabupaten: 3 } }, result: 'Dua belas kali pertemuan. Lantai dasar untuk pedagang lama dengan sewa murah, lantai atas untuk investor. Tidak ada yang sepenuhnya puas.' },
    ],
  },
  {
    id: 'l_banjir_bandang',
    title: 'Banjir Bandang',
    text: 'Tanggul jebol tengah malam. Empat kecamatan terendam, ribuan orang mengungsi. Kas daerah tipis, dan bantuan pusat butuh berhari-hari.',
    when: { office: ['bupati', 'gubernur'] },
    weight: 3,
    choices: [
      { label: 'Kerahkan semua, tidur di posko', fx: { attr: { stres: 7, kesehatan: -3, karisma: 2 }, region: { kas: -25, kesejahteraan: -1, kepuasan: 4 }, pop: { kabupaten: 4, provinsi: 2 } }, result: 'Lima hari dengan sepatu bot yang sama. Anggaran lain harus dipangkas, tapi tidak ada pengungsi yang kelaparan.' },
      { label: 'Datang, berfoto, serahkan ke dinas', fx: { region: { kas: -10, kesejahteraan: -3, kepuasan: -3 }, pop: { kabupaten: -3 }, attr: { integritas: -2 } }, result: 'Fotomu di atas perahu karet bagus sekali. Seorang pengungsi mengunggah sudut pandang lain: kamu dipayungi ajudan.' },
      { label: 'Salurkan bantuan lewat rekanan "langganan"', fx: { money: 120, attr: { integritas: -7 }, region: { kas: -30, kesejahteraan: -3, kepuasan: -2 }, heat: 16, flags: ['korupsi_proyek', 'korupsi_bencana'], schedule: [{ id: 'kpk_panggil', min: 6, max: 30, chance: 0.6 }], hint: 'Mengambil dari dana bencana adalah jenis dosa yang paling dibenci publik.' }, result: 'Mi instan dihargai seperti rendang. Selimutnya tipis, kuitansinya tebal.' },
    ],
  },
  {
    id: 'l_mutasi_titipan_partai',
    title: 'Pesan dari Pusat',
    text: 'Pengurus pusat partaimu menelepon. Mereka ingin tiga nama dipasang di dinas pekerjaan umum, perizinan, dan pendapatan. "Ini untuk mengamankan logistik pemilu. Kamu kan kader."',
    when: { office: ['bupati', 'gubernur'], inParty: true },
    weight: 4,
    once: true,
    choices: [
      { label: 'Pasang ketiganya', fx: { party: 10, attr: { integritas: -5 }, region: { layanan: -3, kas: -10 }, heat: 9, flags: ['dinas_dikuasai_partai'], hint: 'Kalau mereka mencuri, yang dipanggil adalah yang meneken.' }, result: 'Pelantikan lancar. Tiga dinas itu kini punya dua atasan: kamu, dan seseorang di ibu kota.' },
      { label: 'Pasang satu saja, yang paling layak', fx: { party: 2, attr: { integritas: -1, stres: 3 }, region: { layanan: -1 }, heat: 3 }, result: 'Pusat menggerutu tapi menerima. Kamu belajar bahwa menawar juga bagian dari kesetiaan.' },
      { label: 'Tolak semua, jabatan lewat seleksi', fx: { party: -10, attr: { integritas: 5, stres: 5 }, region: { layanan: 3, kepuasan: 2 }, pop: { kabupaten: 2 }, hint: 'Partai mengingat siapa yang membangkang saat menyusun daftar calon.' }, result: '"Baik. Kita lihat siapa yang mengusungmu periode depan." Telepon ditutup.' },
    ],
  },
  {
    id: 'l_reklamasi',
    title: 'Pulau Buatan',
    text: 'Sebuah konsorsium mengajukan izin reklamasi teluk: hunian mewah, pelabuhan, ribuan lapangan kerja. Nelayan menolak. Di map permohonan terselip tawaran: sepuluh persen saham atas nama siapa pun yang kamu tunjuk.',
    when: { office: ['gubernur'] },
    weight: 4,
    once: true,
    choices: [
      { label: 'Terbitkan izin, ambil sahamnya lewat nama orang lain', fx: { money: 600, attr: { integritas: -8 }, region: { kas: 25, kesejahteraan: -3, kepuasan: -4 }, pop: { provinsi: -4 }, heat: 22, flags: ['korupsi_proyek', 'saham_reklamasi'], schedule: [{ id: 'kpk_panggil', min: 12, max: 48, chance: 0.65 }], hint: 'Orang yang kamu pinjam namanya suatu hari akan diperiksa.' }, result: 'Kapal keruk bekerja siang malam. Sopirmu kini, di atas kertas, pemegang saham sebuah perusahaan properti.' },
      { label: 'Terbitkan izin tanpa mengambil apa-apa, dengan syarat ketat', fx: { region: { kas: 30, infrastruktur: 3, kesejahteraan: -1, kepuasan: -2 }, pop: { provinsi: -2 }, attr: { stres: 4 } }, result: 'Nelayan dapat dermaga baru dan kompensasi. Mereka tetap tidak suka. Kas daerah gemuk.' },
      { label: 'Tolak izinnya', fx: { attr: { integritas: 4, stres: 5 }, region: { kepuasan: 3, kas: -5 }, pop: { provinsi: 3, nasional: 2 }, hint: 'Konsorsium itu juga menyumbang untuk partai-partai besar.' }, result: 'Nelayan mengarak perahu hias di depan kantormu. Para pengembang mulai mencari gubernur berikutnya.' },
    ],
  },
  {
    id: 'l_upah_minimum',
    title: 'Angka Upah',
    text: 'Tenggat penetapan upah minimum provinsi tinggal tiga hari. Buruh mengepung kantormu menuntut naik 15%. Asosiasi pengusaha mengancam memindahkan pabrik kalau lebih dari 4%.',
    when: { office: ['gubernur'] },
    weight: 3,
    choices: [
      { label: 'Naik 12%, berpihak ke buruh', fx: { region: { kesejahteraan: 3, kepuasan: 3, kas: -8 }, pop: { provinsi: 4 }, attr: { stres: 4 }, hint: 'Beberapa pabrik sungguh-sungguh menghitung ongkos pindah.' }, outcomes: [
        { chance: 0.4, text: 'Dua pabrik garmen hengkang ke provinsi sebelah. Tiga ribu orang yang upahnya baru naik kini tidak punya upah.', fx: { region: { kesejahteraan: -4, kepuasan: -3 } } },
        { chance: 0.6, text: 'Pengusaha menggerutu, tapi bertahan. Warung-warung di sekitar pabrik jadi lebih ramai.', fx: {} },
      ] },
      { label: 'Naik 4%, jaga investasi', fx: { region: { kas: 10, kesejahteraan: -1, kepuasan: -4 }, pop: { provinsi: -4 } }, result: 'Buruh membakar ban di jalan tol. Asosiasi pengusaha mengirim karangan bunga.' },
      { label: 'Naik 8%, tambah subsidi transportasi buruh', need: { attrMin: { kecerdasan: 55 } }, fx: { region: { kesejahteraan: 2, kepuasan: 1, kas: -15 }, pop: { provinsi: 1 }, attr: { stres: 5 } }, result: 'Kedua pihak keluar dari ruang rapat dengan wajah masam. Tidak ada ban terbakar, tidak ada pabrik pindah.' },
    ],
  },
  {
    id: 'l_ingkar_ke_ulama',
    title: 'Janji yang Ditagih',
    text: 'Kiai yang dulu kamu janjikan bantuan "kalau sudah jadi" mengirim utusan. Asrama santrinya masih bocor. Sudah ada jabatanmu, belum ada bantuanmu.',
    when: { office: ['kades', 'bupati', 'gubernur'], flags: ['janji_ke_ulama'] },
    weight: 5,
    once: true,
    choices: [
      { label: 'Bantu dari kantong pribadi', need: { moneyMin: 40 }, fx: { money: -40, attr: { integritas: 3 }, pop: { desa: 2, kabupaten: 2 }, unflags: ['janji_ke_ulama'], flags: ['restu_ulama'] }, result: 'Atap itu akhirnya diganti. Terlambat, tapi kiai itu menerima dengan lapang.' },
      { label: 'Bantu pakai dana hibah daerah', fx: { region: { kas: -10, kepuasan: 1 }, attr: { integritas: -2 }, heat: 4, unflags: ['janji_ke_ulama'], hint: 'Hibah tanpa proposal akan ditanyakan auditor.' }, result: 'Bantuan cair cepat. Pondok-pondok lain mulai bertanya kapan giliran mereka.' },
      { label: 'Tunda lagi', fx: { attr: { integritas: -3 }, pop: { desa: -3, kabupaten: -3 }, region: { kepuasan: -2 } }, result: 'Utusan itu pamit. Jumat berikutnya, khotbah di pondok itu membahas ciri-ciri orang munafik. Tidak ada nama disebut.' },
    ],
  },

  // =====================================================================
  // KAMPANYE
  // =====================================================================
  {
    id: 'l_mahar_politik',
    title: 'Harga Sebuah Rekomendasi',
    text: 'Surat rekomendasi partai untukmu belum juga turun. Seorang pengurus menjelaskan dengan bahasa halus: ada "biaya saksi dan konsolidasi". Seorang pemodal siap menalangi, kalau kamu mau.',
    when: { campaign: true, inParty: true },
    weight: 4,
    once: true,
    choices: [
      { label: 'Bayar sendiri', need: { moneyMin: 100 }, fx: { money: -100, party: 8, momentum: 3, attr: { integritas: -2 }, heat: 4 }, result: 'Rekomendasi turun besoknya, dengan foto bersama dan jabat tangan erat. Kuitansinya tidak ada.' },
      { label: 'Biarkan pemodal itu menalangi', fx: { party: 8, momentum: 4, attr: { integritas: -5 }, heat: 9, flags: ['utang_cukong'], hint: 'Dia tidak sedang beramal. Dia sedang berinvestasi.' }, result: 'Semua beres tanpa kamu mengeluarkan sepeser pun. Pemodal itu mengirim pesan: "Selamat berjuang. Kita bicara lagi setelah pelantikan."' },
      { label: 'Tolak, ungkit prestasi dan dukungan akar rumput', fx: { attr: { integritas: 4, stres: 4 } }, outcomes: [
        { chance: 0.4, text: 'Survei internal menyebut namamu tertinggi. Partai mengalah, dengan muka masam.', fx: { party: -3, momentum: 3, pop: { kabupaten: 2 } } },
        { chance: 0.6, text: 'Rekomendasi turun setengah hati. Mesin partai bekerja untukmu seperti pegawai yang belum gajian.', fx: { party: -8, momentum: -4 } },
      ] },
    ],
  },
  {
    id: 'l_cukong_menagih',
    title: 'Setelah Pelantikan',
    text: 'Pemodal yang membiayai jalanmu duduk di ruang tamu rumah dinas seperti di rumah sendiri. Dia membawa daftar: izin lahan, proyek pengadaan, dan satu nama untuk kepala dinas. "Saya tidak minta banyak. Hanya yang sudah sepantasnya."',
    when: { office: ['bupati', 'gubernur'], flags: ['utang_cukong'] },
    weight: 6,
    once: true,
    choices: [
      { label: 'Penuhi semua', fx: { money: 150, attr: { integritas: -8 }, region: { kas: -25, layanan: -3, infrastruktur: -2 }, heat: 20, flags: ['korupsi_proyek', 'boneka_cukong'], unflags: ['utang_cukong'], schedule: [{ id: 'kpk_panggil', min: 10, max: 40, chance: 0.6 }], hint: 'Siapa yang sebenarnya menjabat sekarang?' }, result: 'Daftar itu kamu teken satu per satu. Dia menepuk bahumu seperti menepuk kuda yang penurut.' },
      { label: 'Penuhi sebagian yang masih bisa dipertanggungjawabkan', fx: { attr: { integritas: -3, stres: 5 }, region: { kas: -8 }, heat: 8, hint: 'Dia mencatat apa yang belum dibayar.' }, result: 'Dia pulang dengan separuh daftar. "Sisanya kita bicarakan lagi." Itu bukan pertanyaan.' },
      { label: 'Tolak; tawarkan mengembalikan uangnya', need: { moneyMin: 120 }, fx: { money: -120, attr: { integritas: 6, stres: 6 }, unflags: ['utang_cukong'] }, outcomes: [
        { chance: 0.5, text: 'Dia mengambil uangnya dan pergi. Pada pemilihan berikutnya dia mendanai lawanmu dua kali lipat.', fx: { pop: { kabupaten: -2 } } },
        { chance: 0.5, text: 'Dia menolak uangnya. Seminggu kemudian rekaman pembicaraan lama kalian sampai ke meja redaksi.', fx: { heat: 10, schedule: [{ id: 'skandal_terbongkar', min: 1, max: 6, chance: 0.7 }] } },
      ] },
    ],
  },
  {
    id: 'l_serangan_lawan',
    title: 'Isu Miring',
    text: 'Selebaran gelap beredar di pasar dan grup percakapan: kamu dituduh punya utang miliaran, istri simpanan, dan ijazah palsu. Tidak ada yang benar. Semuanya dibaca.',
    when: { campaign: true },
    weight: 4,
    choices: [
      { label: 'Jawab tenang dengan bukti, sekali saja', fx: { momentum: -1, attr: { integritas: 2, stres: 3 } }, result: 'Kamu menunjukkan ijazah, laporan harta, dan buku nikah. Membosankan, dan justru karena itu meyakinkan.' },
      { label: 'Balas dengan selebaran yang lebih kejam', fx: { momentum: 4, attr: { integritas: -5 }, heat: 6, flags: ['kampanye_hitam'], hint: 'Percetakan itu menyimpan salinan pesananmu.' }, result: 'Kini giliran lawanmu sibuk membantah. Kampanye berubah jadi adu lumpur, dan kamu ternyata berbakat.' },
      { label: 'Laporkan ke pengawas pemilu', fx: { attr: { stres: 2 } }, outcomes: [
        { chance: 0.3, text: 'Penyebarnya tertangkap tangan dan mengaku dibayar tim lawan. Arah angin berbalik.', fx: { momentum: 5 } },
        { chance: 0.7, text: 'Laporanmu diterima, diberi nomor, dan dijanjikan diproses. Pemungutan suara datang lebih dulu.', fx: { momentum: -3 } },
      ] },
    ],
  },
  {
    id: 'l_debat_kandidat',
    title: 'Debat Terbuka',
    text: 'Lampu studio panas. Lawanmu melempar pertanyaan jebakan soal angka kemiskinan yang jawabannya tidak kamu hafal. Kamera menyorot wajahmu.',
    when: { campaign: true },
    weight: 4,
    choices: [
      { label: 'Jawab dengan data dan rencana', need: { attrMin: { kecerdasan: 60 } }, fx: { momentum: 5, pop: { provinsi: 1 } }, result: 'Kamu menyebut angka, sumbernya, dan tiga langkah. Lawanmu membolak-balik kertasnya.' },
      { label: 'Alihkan dengan cerita menyentuh dan lelucon', need: { attrMin: { karisma: 55 } }, fx: { momentum: 4 }, outcomes: [
        { chance: 0.7, text: 'Penonton tertawa, lalu bertepuk tangan. Tidak ada yang ingat pertanyaannya.', fx: {} },
        { chance: 0.3, text: 'Moderator memotong: "Mohon dijawab pertanyaannya." Sunyi tiga detik yang terasa seperti setahun.', fx: { momentum: -6 } },
      ] },
      { label: 'Akui tidak hafal angkanya, janjikan jawaban tertulis', fx: { momentum: -2, attr: { integritas: 3 } }, result: 'Lawanmu tersenyum menang. Tapi sebagian pemilih bosan dengan orang yang selalu tahu segalanya.' },
      { label: 'Karang angka dengan penuh percaya diri', fx: { attr: { integritas: -3 } }, outcomes: [
        { chance: 0.5, text: 'Tidak ada yang memeriksa. Kepercayaan diri menang atas kebenaran, malam ini.', fx: { momentum: 3 } },
        { chance: 0.5, text: 'Pemeriksa fakta sebuah media memajang angkamu di samping angka resmi. Selisihnya memalukan.', fx: { momentum: -6, pop: { provinsi: -2 } } },
      ] },
    ],
  },
  {
    id: 'l_hoaks_menyebar',
    title: 'Pasukan Siber',
    text: 'Seorang konsultan muda menawarkan paket lengkap: lima ratus akun palsu, video editan, dan isu SARA yang "pasti jalan". Dia menunjukkan portofolionya dari tiga pemilihan terakhir. Semuanya menang.',
    when: { campaign: true },
    weight: 3,
    once: true,
    choices: [
      { label: 'Sewa paket lengkapnya', need: { moneyMin: 40 }, fx: { money: -40, momentum: 7, attr: { integritas: -7 }, heat: 10, flags: ['kampanye_hitam', 'pasukan_siber'], schedule: [{ id: 'l_konsultan_bernyanyi', min: 12, max: 50, chance: 0.6 }], hint: 'Konsultan seperti ini bekerja untuk siapa saja yang membayar, termasuk lawanmu nanti.' }, result: 'Dalam seminggu lawanmu jadi bahan kebencian di mana-mana. Tetangga yang tadinya rukun mulai saling curiga.' },
      { label: 'Sewa hanya untuk menangkal serangan', need: { moneyMin: 15 }, fx: { money: -15, momentum: 2, attr: { integritas: -1 }, heat: 2 }, result: 'Akun-akun itu sibuk membantah fitnah tentangmu. Garis antara membela dan menyerang ternyata tipis.' },
      { label: 'Tolak, dan umumkan bahwa kamu ditawari', fx: { momentum: 2, attr: { integritas: 4 }, pop: { provinsi: 1 } }, result: '"Saya ditawari pasukan akun palsu. Saya menolak." Konsultan itu langsung menghubungi lawanmu.' },
    ],
  },
  {
    id: 'l_konsultan_bernyanyi',
    title: 'Konsultan Itu Bicara',
    text: 'Konsultan siber yang dulu kamu sewa tertangkap dalam kasus lain. Untuk meringankan hukuman, dia menyerahkan daftar klien, invoice, dan percakapan. Namamu ada di halaman pertama.',
    choices: [
      { label: 'Akui dan minta maaf kepada lawan lamamu', fx: { attr: { integritas: 4, stres: 6 }, pop: { kabupaten: -4, provinsi: -4, nasional: -2 }, heat: -5, unflags: ['pasukan_siber'] }, result: 'Lawan lamamu menerima permintaan maaf itu di depan kamera, dengan wajah orang yang menang terlambat.' },
      { label: 'Sebut dia pembohong yang mencari keringanan', fx: { attr: { integritas: -3 } }, outcomes: [
        { chance: 0.6, text: 'Bukti transfernya dipajang di sidang. Tagar namamu memuncak tiga hari.', fx: { pop: { kabupaten: -6, provinsi: -6, nasional: -4 }, heat: 10, schedule: [{ id: 'skandal_terbongkar', min: 1, max: 8, chance: 0.6 }] } },
        { chance: 0.4, text: 'Daftarnya terlalu panjang; ada nama-nama yang lebih besar darimu. Sorotan bergeser.', fx: { pop: { provinsi: -2 }, heat: 4 } },
      ] },
    ],
  },
  {
    id: 'l_serangan_fajar',
    title: 'Malam Sebelum Coblosan',
    text: 'Survei terakhir: kamu tertinggal tipis. Koordinator lapangan datang membawa kardus berisi amplop kosong. "Lawan sudah jalan dari kemarin. Lima puluh ribu per kepala. Tinggal Bapak/Ibu bilang iya."',
    when: { campaign: true },
    weight: 4,
    once: true,
    choices: [
      { label: 'Isi amplopnya', need: { moneyMin: 50 }, fx: { money: -50, momentum: 8, attr: { integritas: -7 }, heat: 12, flags: ['serangan_fajar'], hint: 'Ratusan orang kini tahu, dan tidak semuanya menerima dengan senang hati.' }, result: 'Subuh itu sepeda motor berkeliling dari gang ke gang. Kamu menang dengan cara yang kamu kecam di panggung.' },
      { label: 'Tolak; kerahkan relawan menjaga TPS', fx: { momentum: 1, attr: { integritas: 5, stres: 5 } }, outcomes: [
        { chance: 0.4, text: 'Relawanmu merekam tim lawan membagi amplop. Videonya tersebar sebelum TPS buka.', fx: { momentum: 6 } },
        { chance: 0.6, text: 'Relawanmu berjaga sampai pagi. Uang lawan tetap mengalir lewat pintu belakang.', fx: { momentum: -3 } },
      ] },
      { label: 'Bagikan sembako "sedekah" tanpa atribut', need: { moneyMin: 20 }, fx: { money: -20, momentum: 3, attr: { integritas: -3 }, heat: 5 }, result: 'Secara hukum abu-abu. Secara nurani, kamu tahu persis warnanya.' },
    ],
  },
  {
    id: 'l_buruh_ingat',
    title: 'Ingatan Pabrik',
    text: 'Serikat buruh mengundangmu ke rapat akbar. Di tengah acara seorang buruh tua berdiri dan menunjukmu. Dia masih ingat betul apa yang kamu lakukan pada hari mogok itu.',
    when: { campaign: true, flags: ['tokoh_buruh'] },
    weight: 4,
    once: true,
    choices: [
      { label: 'Naik panggung dan bicara sebagai kawan lama', fx: { momentum: 6, pop: { kabupaten: 3 } }, result: '"Dia ini dulu ikut lapar bersama kita!" Ribuan tangan mengepal. Serikat menginstruksikan anggotanya memilihmu.' },
      { label: 'Janjikan upah dan perlindungan yang konkret', fx: { momentum: 4, pop: { kabupaten: 2, provinsi: 2 }, flags: ['janji_ke_buruh'], hint: 'Buruh menyimpan rekaman janji.' }, result: 'Mereka bersorak dan mencatat. Setiap kalimatmu direkam tiga puluh ponsel.' },
    ],
  },
  {
    id: 'l_pemecah_mogok_diingat',
    title: 'Hari Mogok Itu',
    text: 'Serikat buruh menggelar konferensi pers. Seorang buruh tua memegang foto lama: kamu melewati gerbang pabrik pada hari semua orang mogok. "Dia memilih jabatan kepala regu daripada kawannya."',
    when: { campaign: true, flags: ['pemecah_mogok'] },
    weight: 4,
    once: true,
    choices: [
      { label: 'Datangi serikat, minta maaf langsung', fx: { momentum: -2, attr: { integritas: 3 }, unflags: ['pemecah_mogok'] }, result: 'Mereka tidak bertepuk tangan. Tapi mereka mendengarkan sampai selesai, dan itu sudah lebih dari yang kamu harapkan.' },
      { label: 'Bilang kamu waktu itu harus memberi makan keluarga', fx: { momentum: -3 }, outcomes: [
        { chance: 0.4, text: 'Sebagian pemilih mengangguk; mereka juga pernah memilih perut. Serikat tetap memboikotmu.', fx: { momentum: 2 } },
        { chance: 0.6, text: '"Kami semua punya keluarga," jawab buruh tua itu. Kalimatnya dikutip di mana-mana.', fx: { momentum: -3, pop: { kabupaten: -2 } } },
      ] },
      { label: 'Abaikan, buruh bukan basis suaramu', fx: { momentum: -5, pop: { kabupaten: -3 } }, result: 'Serikat memasang spanduk di setiap gerbang pabrik. Isinya fotomu, dan satu kata: "INGAT".' },
    ],
  },
];
