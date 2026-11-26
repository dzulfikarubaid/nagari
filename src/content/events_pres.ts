import type { GameEvent, Cond } from '../sim/types';

/** Semua event di file ini hanya untuk presiden yang sedang menjabat. */
const pres = (c: Cond = {}): Cond => ({ office: ['presiden'], ...c });

export const EVENTS_PRES: GameEvent[] = [
  // =====================================================================
  // EKONOMI
  // =====================================================================
  {
    id: 'p_krisis_mata_uang',
    title: 'Mata Uang Terjun Bebas',
    text: 'Dalam dua minggu nilai tukar anjlok seperlima. Importir panik, antrean mengular di tempat penukaran uang. Gubernur bank sentral menunggu arahanmu, padahal seharusnya ia independen.',
    when: pres(),
    weight: 2,
    choices: [
      {
        label: 'Biarkan bank sentral menaikkan bunga tinggi',
        fx: { nation: { inflasi: -0.6, pertumbuhan: -0.8, pengangguran: 0.5, approval: -3 } },
        result: 'Kurs perlahan tenang. Kredit macet, pabrik menunda ekspansi, dan pengusaha menggerutu di televisi.',
      },
      {
        label: 'Bakar cadangan devisa untuk menahan kurs',
        fx: { hint: 'Cadangan devisa tidak tak terbatas.' },
        outcomes: [
          { chance: 0.5, text: 'Spekulan mundur. Kurs pulih dan kamu dipuji sebagai nakhoda yang tenang.', fx: { nation: { approval: 4, utang: 1 }, capital: 4 } },
          { chance: 0.5, text: 'Cadangan terkuras, kurs tetap jatuh. Sekarang kamu krisis dan tanpa peluru.', fx: { nation: { inflasi: 1.5, utang: 4, pertumbuhan: -0.7, approval: -6 }, capital: -5 } },
        ],
      },
      {
        label: 'Batasi arus modal keluar',
        fx: { nation: { inflasi: 0.5, pertumbuhan: -0.4, stabilitas: 2 }, diplo: -6, hint: 'Investor punya ingatan panjang soal pintu yang pernah dikunci.' },
        result: 'Uang tertahan di dalam negeri. Investor asing mencoret Nagari dari daftar tujuan untuk sementara.',
      },
    ],
  },
  {
    id: 'p_harga_beras',
    title: 'Beras Mahal, Dapur Panas',
    text: 'Harga beras naik sepertiga dalam sebulan. Ibu-ibu mengantre operasi pasar sejak subuh. Menteri bilang stok aman; pasar bilang sebaliknya.',
    when: pres({ nationMin: { inflasi: 6 } }),
    weight: 4,
    choices: [
      {
        label: 'Impor besar-besaran sekarang juga',
        fx: { nation: { inflasi: -1.2, utang: 1, approval: 2 }, coalition: -4 },
        result: 'Harga turun. Petani yang sedang panen merugi, dan partai-partai nasionalis menudingmu antek importir.',
      },
      {
        label: 'Operasi pasar dan bansos beras',
        fx: { nation: { inflasi: -0.5, utang: 2, approval: 4, kemiskinan: -0.3 } },
        result: 'Karung beras bergambar wajahmu sampai ke pelosok. Anggaran jebol sedikit, senyum warga naik sedikit.',
      },
      {
        label: 'Tangkap "mafia beras" di depan kamera',
        fx: { hint: 'Menyalahkan penimbun tidak menambah isi gudang.' },
        outcomes: [
          { chance: 0.4, text: 'Gudang penimbun benar-benar ditemukan. Harga turun dan kamu tampak tegas.', fx: { nation: { inflasi: -0.8, approval: 5, kriminalitas: -1 }, capital: 3 } },
          { chance: 0.6, text: 'Yang ditangkap pedagang kecil. Harga tetap naik, pedagang lain takut menyimpan stok.', fx: { nation: { inflasi: 0.8, approval: -4, kebahagiaan: -2 } } },
        ],
      },
    ],
  },
  {
    id: 'p_bbm_melonjak',
    title: 'Minyak Dunia Menggila',
    text: 'Harga minyak dunia melonjak. Subsidi BBM membengkak tiap hari. Menteri keuangan membawa dua map: satu berisi kenaikan harga, satu berisi utang baru.',
    when: pres(),
    weight: 3,
    choices: [
      {
        label: 'Naikkan harga BBM',
        fx: { nation: { inflasi: 1.5, approval: -8, stabilitas: -3, utang: -2, kebahagiaan: -3 }, capital: -5 },
        result: 'Antrean panjang di malam terakhir harga lama. Besoknya, ban dibakar di depan istana.',
      },
      {
        label: 'Tahan harga, tambal dengan utang',
        fx: { nation: { utang: 5, approval: 3 }, hint: 'Tagihan subsidi selalu datang, biasanya di waktu terburuk.' },
        result: 'Rakyat tenang. Lembaga pemeringkat utang tidak.',
      },
      {
        label: 'Naikkan harga, alihkan subsidi jadi bantuan tunai',
        need: { attrMin: { kecerdasan: 55 } },
        fx: { nation: { inflasi: 1, approval: -3, kemiskinan: -0.5, utang: -1 }, capital: -8 },
        result: 'Kebijakan yang masuk akal dan sulit dijelaskan. Sebagian marah, sebagian mengantre bantuan.',
      },
    ],
  },
  {
    id: 'p_gagal_bayar',
    title: 'Jatuh Tempo',
    text: 'Obligasi negara senilai raksasa jatuh tempo bulan depan dan kas tidak cukup. Kata "gagal bayar" mulai muncul di judul berita luar negeri.',
    when: pres({ nationMin: { utang: 70 } }),
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Minta dana talangan Dana Moneter Lintas Samudra',
        fx: { nation: { stabilitas: 2 }, capital: -5, schedule: [{ id: 'p_dml_datang', min: 1, max: 3 }] },
        result: 'Tim berjas abu-abu dijadwalkan mendarat. Mereka membawa uang dan daftar syarat.',
      },
      {
        label: 'Cetak uang untuk membayar',
        fx: { nation: { inflasi: 2, utang: -4, approval: -3, kemiskinan: 0.8 }, hint: 'Uang yang dicetak hari ini dibayar semua orang besok.' },
        result: 'Utang terbayar dengan kertas baru. Harga-harga mengejar di belakangnya.',
      },
      {
        label: 'Umumkan penundaan pembayaran',
        fx: { nation: { pertumbuhan: -1.2, pengangguran: 0.8, approval: -5, utang: -3 }, diplo: -10, capital: -6 },
        result: 'Nagari resmi menunggak. Pasar keuangan menutup pintu, dan pintu itu berat untuk dibuka lagi.',
      },
    ],
  },
  {
    id: 'p_dml_datang',
    title: 'Tamu Berjas Abu-abu',
    text: 'Dana Moneter Lintas Samudra menawarkan talangan. Syaratnya: cabut subsidi, jual BUMN, pangkas pegawai. "Ini obat," kata ketua timnya. Ia tidak akan ikut meminumnya.',
    when: pres({ nationMin: { utang: 55 } }),
    weight: 1,
    once: true,
    choices: [
      {
        label: 'Teken semua syarat',
        fx: { nation: { utang: -8, inflasi: 1, approval: -6, kemiskinan: 0.8 }, diplo: 6, flags: ['resep_dml'], schedule: [{ id: 'p_dml_pahit', min: 8, max: 18 }], hint: 'Obat ini punya efek samping yang tidak tertulis di kemasan.' },
        result: 'Fotomu menandatangani dokumen sambil diawasi pria bersedekap beredar luas. Kas negara bernapas lagi.',
      },
      {
        label: 'Tawar: terima separuh syarat',
        need: { attrMin: { kecerdasan: 60 } },
        fx: { nation: { utang: -4, approval: -2 }, diplo: 2, capital: -4 },
        result: 'Perundingan alot tiga minggu. Kamu mendapat separuh uangnya dan menyelamatkan separuh mukamu.',
      },
      {
        label: 'Usir mereka dengan pidato kedaulatan',
        fx: { nation: { approval: 5, pertumbuhan: -0.6, utang: 2 }, diplo: -6, coalition: 3 },
        result: 'Tepuk tangan membahana. Bunga utang baru naik dua digit.',
      },
    ],
  },
  {
    id: 'p_dml_pahit',
    title: 'Efek Samping',
    text: 'Setahun setelah resep Dana Moneter dijalankan: tarif listrik naik, tiga BUMN dijual murah ke pembeli asing, puluhan ribu pegawai dirumahkan. Jalanan mulai penuh.',
    when: pres({ flags: ['resep_dml'] }),
    choices: [
      {
        label: 'Bertahan: "sakit sebentar demi sembuh"',
        outcomes: [
          { chance: 0.5, text: 'Ekonomi mulai pulih sebelum kesabaran rakyat habis. Tipis sekali.', fx: { nation: { pertumbuhan: 0.8, approval: -3, pengangguran: 0.5 } } },
          { chance: 0.5, text: 'Kerusuhan pecah di kawasan industri. Toko dijarah, namamu dibakar bersama ban.', fx: { nation: { stabilitas: -6, approval: -9, pengangguran: 1, kriminalitas: 3 }, capital: -8 } },
        ],
      },
      {
        label: 'Ingkari perjanjian, pulihkan subsidi',
        fx: { nation: { approval: 5, utang: 5, inflasi: -0.5 }, diplo: -8, unflags: ['resep_dml'] },
        result: 'Rakyat lega. Pencairan tahap berikutnya dibatalkan dan namamu masuk daftar hitam para kreditor.',
      },
      {
        label: 'Salahkan menteri keuangan, copot dia',
        fx: { nation: { approval: 2 }, coalition: -6, capital: -4 },
        result: 'Satu kepala menggelinding. Kebijakannya tetap jalan, dan partainya mencatat.',
      },
    ],
  },
  {
    id: 'p_phk_massal',
    title: 'Pabrik Tutup Serentak',
    text: 'Tiga pabrik tekstil besar gulung tikar dalam sebulan. Empat puluh ribu buruh pulang membawa surat PHK. Pemiliknya menyalahkan barang impor murah dari Tiongkara.',
    when: pres(),
    weight: 3,
    choices: [
      {
        label: 'Talangi pabrik dengan uang negara',
        fx: { nation: { utang: 3, pengangguran: -0.4, approval: 3 }, hint: 'Pemilik pabrik yang ditolong belum tentu menolong buruhnya.' },
        outcomes: [
          { chance: 0.55, text: 'Mesin berputar lagi. Buruh kembali bekerja dan memasang fotomu di kantin.', fx: { nation: { approval: 3 }, coalition: 3 } },
          { chance: 0.45, text: 'Dana talangan menguap. Pemilik pabrik ternyata sudah pindah ke Temasik.', fx: { nation: { approval: -6, korupsi: 3, pengangguran: 0.8 }, heat: 8 } },
        ],
      },
      {
        label: 'Pasang tarif tinggi untuk tekstil impor',
        fx: { nation: { inflasi: 0.6, pengangguran: -0.3, approval: 2 }, diplo: -5, coalition: 3 },
        result: 'Industri lokal bernapas. Tiongkara membalas dengan menahan pesanan sawit.',
      },
      {
        label: 'Biarkan pasar bekerja, beri pelatihan kerja',
        fx: { nation: { pengangguran: 1, approval: -5, kemiskinan: 0.5, pendidikan: 1 }, coalition: -3 },
        result: 'Mantan buruh jahit belajar membuat konten digital. Sebagian besar berakhir jadi pengemudi ojek.',
      },
    ],
  },
  {
    id: 'p_bursa_anjlok',
    title: 'Senin Merah',
    text: 'Bursa saham dibuka dan langsung dihentikan: indeks jatuh tujuh persen dalam dua puluh menit. Rumor beredar bahwa kamu sakit keras. Kamu sedang sarapan bubur.',
    when: pres(),
    weight: 2,
    choices: [
      {
        label: 'Tampil di publik, lari pagi di depan kamera',
        fx: { attr: { stres: 2 } },
        outcomes: [
          { chance: 0.7, text: 'Pasar tenang melihatmu berkeringat sehat. Indeks pulih sore itu.', fx: { nation: { approval: 3 }, capital: 2 } },
          { chance: 0.3, text: 'Kamu terpeleset di putaran kedua. Videonya ditonton dua puluh juta kali. Indeks turun lagi.', fx: { nation: { approval: -3, pertumbuhan: -0.2 }, attr: { kesehatan: -2 } } },
        ],
      },
      {
        label: 'Perintahkan dana pensiun negara memborong saham',
        fx: { nation: { utang: 1 }, heat: 6, hint: 'Uang pensiunan dipakai menambal layar merah.' },
        result: 'Indeks hijau lagi. Pengelola dana pensiun menandatangani perintah itu dengan tangan gemetar.',
      },
      {
        label: 'Diam. Pasar akan menemukan dasarnya',
        fx: { nation: { pertumbuhan: -0.4, approval: -2 } },
        result: 'Pasar memang menemukan dasarnya. Letaknya lebih dalam dari perkiraan.',
      },
    ],
  },
  {
    id: 'p_utang_tiongkara',
    title: 'Tawaran dari Utara',
    text: 'Duta besar Tiongkara membawa proposal: pinjaman lunak raksasa untuk kereta cepat dan pelabuhan baru. Tanpa ceramah soal demokrasi, tanpa tender terbuka. Kontraktornya, tentu, dari Tiongkara.',
    when: pres({ notFlags: ['utang_tiongkara'] }),
    weight: 3,
    once: true,
    choices: [
      {
        label: 'Terima seluruhnya',
        fx: { nation: { infrastruktur: 6, pertumbuhan: 0.8, utang: 7, approval: 3 }, flags: ['utang_tiongkara'], schedule: [{ id: 'p_tiongkara_tagih', min: 18, max: 30 }], hint: 'Pinjaman tanpa syarat biasanya menyimpan syaratnya di halaman belakang.' },
        result: 'Peletakan batu pertama meriah. Lampiran perjanjian setebal 400 halaman belum selesai kamu baca.',
      },
      {
        label: 'Terima separuh, dengan tender terbuka',
        need: { attrMin: { kecerdasan: 58 } },
        fx: { nation: { infrastruktur: 3, pertumbuhan: 0.3, utang: 3 }, capital: -4 },
        result: 'Tiongkara setuju dengan wajah masam. Proyeknya lebih kecil, kontraknya lebih bersih.',
      },
      {
        label: 'Tolak dengan sopan',
        fx: { nation: { approval: -1 }, diplo: -3, coalition: -3 },
        result: 'Duta besar tersenyum tipis. Partai-partai pro-pembangunan bertanya kenapa kamu menolak uang.',
      },
    ],
  },
  {
    id: 'p_tiongkara_tagih',
    title: 'Halaman 387',
    text: 'Kereta cepat sepi penumpang dan cicilan tersendat. Tiongkara mengingatkan pasal di halaman 387: jika menunggak, pelabuhan strategis di pantai utara dikelola mereka selama 99 tahun.',
    when: pres({ flags: ['utang_tiongkara'] }),
    choices: [
      {
        label: 'Serahkan pengelolaan pelabuhan',
        fx: { nation: { approval: -9, stabilitas: -3, utang: -5 }, diplo: 3, coalition: -6, flags: ['jual_pelabuhan'], unflags: ['utang_tiongkara'], hint: 'Bendera asing di pelabuhan sendiri tidak mudah dilupakan orang.' },
        result: 'Bendera Tiongkara berkibar di dermaga. Tagar "Nagari Dijual" memuncaki percakapan seminggu penuh.',
      },
      {
        label: 'Tolak. Kedaulatan tidak digadaikan',
        fx: { nation: { approval: 5, utang: 3, pertumbuhan: -0.7, inflasi: 0.5 }, diplo: -9, unflags: ['utang_tiongkara'] },
        result: 'Tiongkara menagih penuh dan menghentikan pembelian batu bara. Kamu pahlawan di dalam negeri dan pengutang nakal di luar.',
      },
      {
        label: 'Minta Serikat Atlantika menalangi',
        outcomes: [
          { chance: 0.45, text: 'Atlantika setuju, dengan senang hati dan dengan syarat sendiri. Kamu berganti kreditor.', fx: { nation: { utang: 2 }, diplo: -3, flags: ['hutang_atlantika'], unflags: ['utang_tiongkara'] } },
          { chance: 0.55, text: 'Atlantika mengirim doa dan pernyataan keprihatinan. Tiongkara tahu kamu mencoba berpaling.', fx: { nation: { approval: -4, utang: 3 }, diplo: -6, capital: -5 } },
        ],
      },
    ],
  },
  {
    id: 'p_pelabuhan_kapal_perang',
    title: 'Tamu di Dermaga',
    text: 'Dua kapal perang Tiongkara bersandar di pelabuhan yang kamu serahkan. "Kunjungan logistik rutin," kata mereka. Malaka Raya dan Australis memanggil duta besarmu.',
    when: pres({ flags: ['jual_pelabuhan'] }),
    weight: 3,
    once: true,
    choices: [
      {
        label: 'Biarkan. Itu hak pengelola',
        fx: { nation: { approval: -5, stabilitas: -2, militer: -2 }, diplo: -6, capital: -4 },
        result: 'Para jenderal menatapmu lama dalam rapat. Tetangga mulai latihan perang bersama tanpa mengundangmu.',
      },
      {
        label: 'Protes keras, tuntut kapal pergi',
        outcomes: [
          { chance: 0.5, text: 'Kapal pergi setelah tiga hari yang panjang. Mukamu selamat untuk sementara.', fx: { nation: { approval: 3 }, capital: 2 } },
          { chance: 0.5, text: 'Tiongkara menunjukkan salinan kontrak. Kamu tidak punya hak mengusir.', fx: { nation: { approval: -6 }, capital: -6, diplo: -4 } },
        ],
      },
      {
        label: 'Nasionalisasi kembali pelabuhan itu',
        fx: { nation: { approval: 8, utang: 6, pertumbuhan: -1 }, diplo: -10, unflags: ['jual_pelabuhan'], hint: 'Raksasa yang dipermalukan jarang lupa.' },
        result: 'Marinir menurunkan bendera asing. Rakyat bersorak, Tiongkara membekukan semua proyek dan menggugat ke arbitrase.',
      },
    ],
  },
  {
    id: 'p_investor_tambang',
    title: 'Investor dan Gunung Emas',
    text: 'Konsorsium dari Serikat Atlantika mau menanam modal tambang raksasa di hutan lindung. Syaratnya: status hutan diturunkan dan royalti dipatok rendah selama 30 tahun.',
    when: pres(),
    weight: 2,
    once: true,
    choices: [
      {
        label: 'Setujui semua syarat',
        fx: { nation: { pertumbuhan: 1, pengangguran: -0.5, lingkungan: -6 }, diplo: 4, coalition: 4, flags: ['tambang_hutan_lindung'], schedule: [{ id: 'p_tambang_longsor', min: 14, max: 30 }], hint: 'Gunung yang dikeruk punya cara sendiri untuk membalas.' },
        result: 'Angka investasi tahun ini memecahkan rekor. Warga adat memasang portal bambu di jalan tambang.',
      },
      {
        label: 'Setujui dengan royalti tinggi dan reklamasi wajib',
        need: { attrMin: { kecerdasan: 60 } },
        fx: { nation: { pertumbuhan: 0.5, lingkungan: -2 }, capital: -5 },
        result: 'Konsorsium mengeluh, lalu tetap teken. Emasnya terlalu banyak untuk ditinggalkan.',
      },
      {
        label: 'Tolak. Hutan lindung tetap hutan lindung',
        fx: { nation: { lingkungan: 2, approval: 1 }, diplo: -3, coalition: -4 },
        result: 'Aktivis memujimu. Partai-partai pro-bisnis menghitung berapa lapangan kerja yang "kamu buang".',
      },
    ],
  },
  {
    id: 'p_tambang_longsor',
    title: 'Lumpur dari Gunung',
    text: 'Bendungan limbah tambang di bekas hutan lindung jebol. Dua desa terkubur lumpur beracun, sungai berubah warna sampai ke muara. Perusahaan menyebutnya "bencana alam".',
    when: pres({ flags: ['tambang_hutan_lindung'] }),
    choices: [
      {
        label: 'Cabut izin dan tuntut ganti rugi',
        fx: { nation: { approval: 4, lingkungan: 2, pertumbuhan: -0.6 }, diplo: -6, unflags: ['tambang_hutan_lindung'] },
        result: 'Perusahaan menggugat Nagari di arbitrase internasional. Setidaknya kali ini kamu berdiri di sisi yang benar.',
      },
      {
        label: 'Ikut menyebutnya bencana alam',
        fx: { nation: { approval: -7, lingkungan: -4, kesehatan: -2, kebahagiaan: -3 }, heat: 10, hint: 'Lumpur mengering. Dokumen izinnya tidak.' },
        result: 'Kamu datang membawa mi instan dan selimut. Seorang ibu menolak menjabat tanganmu di depan kamera.',
      },
      {
        label: 'Negara menanggung pemulihan, tambang jalan terus',
        fx: { nation: { utang: 3, approval: -3, lingkungan: -2 } },
        result: 'Pajak rakyat membersihkan kotoran perusahaan. Tambang kembali beroperasi dua bulan kemudian.',
      },
    ],
  },

  // =====================================================================
  // BENCANA & KESEHATAN
  // =====================================================================
  {
    id: 'p_gempa',
    title: 'Gempa Besar',
    text: 'Gempa kuat mengguncang pesisir barat menjelang subuh. Ribuan rumah rata, jalan putus, korban terus bertambah. Seluruh negeri menunggu apa yang kamu lakukan dalam 48 jam pertama.',
    when: pres(),
    weight: 2,
    choices: [
      {
        label: 'Terbang ke lokasi, pimpin langsung',
        fx: { nation: { approval: 6, utang: 2, kebahagiaan: 1 }, attr: { stres: 4, kesehatan: -2 } },
        result: 'Kamu tidur di tenda pengungsian tiga malam. Bantuan memang tidak lebih cepat, tapi rakyat melihatmu ada.',
      },
      {
        label: 'Buka pintu untuk bantuan asing',
        fx: { nation: { approval: 3, kesehatan: 1 }, diplo: 5, coalition: -3 },
        result: 'Pesawat angkut dari Australis dan Atlantika mendarat. Kaum nasionalis mengomel soal tentara asing di tanah air.',
      },
      {
        label: 'Tunjuk langsung kontraktor kenalan untuk rekonstruksi',
        fx: { nation: { approval: 2, utang: 3, korupsi: 2 }, money: 6000, heat: 12, flags: ['dana_gempa_dimainkan'], schedule: [{ id: 'p_rumah_gempa_retak', min: 10, max: 24 }], hint: 'Rumah yang dibangun terburu-buru diuji oleh gempa berikutnya.' },
        result: 'Tanpa tender, pekerjaan cepat dimulai. Ucapan terima kasih kontraktor masuk ke rekening yang tepat.',
      },
    ],
  },
  {
    id: 'p_rumah_gempa_retak',
    title: 'Rumah Bantuan Retak',
    text: 'Gempa susulan kecil cukup untuk merobohkan ratusan rumah bantuan pascagempa. Besinya seukuran lidi. Nama kontraktor penunjukan langsungmu ada di semua papan proyek.',
    when: pres({ flags: ['dana_gempa_dimainkan'] }),
    choices: [
      {
        label: 'Korbankan kontraktornya',
        outcomes: [
          { chance: 0.55, text: 'Ia dipenjara dan memilih diam. Keluarganya tetap kamu urus dari jauh.', fx: { nation: { approval: -3 }, money: -2000, heat: 5, unflags: ['dana_gempa_dimainkan'] } },
          { chance: 0.45, text: 'Di pengadilan ia menyebut ke mana uang "terima kasih" mengalir.', fx: { nation: { approval: -8 }, heat: 20, capital: -6, schedule: [{ id: 'kpk_panggil', min: 2, max: 6 }] } },
        ],
      },
      {
        label: 'Bangun ulang pakai anggaran negara, minta maaf',
        fx: { nation: { utang: 2, approval: -2 }, attr: { integritas: 2 }, heat: 6 },
        result: 'Permintaan maaf presiden jarang terdengar di Nagari. Sebagian menghargainya, sebagian mulai bertanya lebih jauh.',
      },
      {
        label: 'Tekan media agar tidak membesar-besarkan',
        need: { flags: ['bungkam_pers'] },
        fx: { nation: { approval: -2, korupsi: 2 }, heat: 10, hint: 'Korban tidak butuh media untuk mengingat.' },
        result: 'Berita hilang dari layar kaca. Fotonya tetap beredar dari ponsel ke ponsel.',
      },
    ],
  },
  {
    id: 'p_banjir_ibu_kota',
    title: 'Ibu Kota Tenggelam',
    text: 'Hujan tiga hari membuat ibu kota lumpuh. Istana tergenang sebetis, jalan tol jadi sungai, dan para menteri datang rapat naik perahu karet.',
    when: pres(),
    weight: 3,
    choices: [
      {
        label: 'Bangun tanggul laut dan waduk raksasa',
        fx: { nation: { utang: 4, infrastruktur: 4, approval: 2 }, capital: -4 },
        result: 'Megaproyek dimulai. Hasilnya baru terasa setelah masa jabatanmu, dan diresmikan penggantimu.',
      },
      {
        label: 'Gusur permukiman bantaran sungai',
        fx: { nation: { infrastruktur: 2, approval: -5, kemiskinan: 0.5, stabilitas: -2 }, coalition: -3 },
        result: 'Sungai melebar. Ribuan keluarga pindah ke rusun yang belum ada airnya.',
      },
      {
        label: 'Bagikan bantuan, salahkan kiriman air dari hulu',
        fx: { nation: { approval: 1, kesehatan: -1 }, hint: 'Hujan berikutnya tidak membaca siaran pers.' },
        result: 'Air surut, berita surut. Tahun depan semuanya terulang dengan ketinggian baru.',
      },
    ],
  },
  {
    id: 'p_wabah',
    title: 'Demam Aneh di Pelabuhan',
    text: 'Puluhan buruh pelabuhan meninggal karena demam yang belum dikenal. Menteri kesehatan minta kota ditutup. Menteri keuangan bilang penutupan akan membunuh ekonomi kuartal ini.',
    when: pres(),
    weight: 2,
    once: true,
    choices: [
      {
        label: 'Tutup kota, umumkan terbuka',
        fx: { nation: { pertumbuhan: -1, pengangguran: 0.6, kesehatan: 2, approval: -2, utang: 2 }, capital: -4 },
        result: 'Ekonomi terpukul. Wabah berhenti di satu kota, dan kebanyakan orang tak pernah tahu seberapa dekat bahayanya.',
      },
      {
        label: 'Rahasiakan dulu, jangan bikin panik',
        fx: { nation: { approval: 1 }, flags: ['tutupi_wabah'], schedule: [{ id: 'p_wabah_meledak', min: 2, max: 5 }], hint: 'Virus tidak ikut menjaga rahasia.' },
        result: 'Pasar tetap ramai, kapal tetap berlayar. Dokter-dokter di pelabuhan berhenti mengangkat teleponmu.',
      },
      {
        label: 'Pembatasan ringan, andalkan imbauan',
        outcomes: [
          { chance: 0.4, text: 'Wabah ternyata tidak terlalu menular. Kamu beruntung, dan menyebutnya strategi.', fx: { nation: { approval: 3, kesehatan: -1 } } },
          { chance: 0.6, text: 'Kasus menyebar ke lima provinsi. Rumah sakit penuh, penutupan akhirnya tetap dilakukan, terlambat.', fx: { nation: { kesehatan: -5, pertumbuhan: -1.2, approval: -6, pengangguran: 0.8 } } },
        ],
      },
    ],
  },
  {
    id: 'p_wabah_meledak',
    title: 'Rahasia yang Batuk',
    text: 'Wabah yang kamu rahasiakan kini ada di dua belas provinsi. Sebuah memo bocor: kamu sudah tahu sejak hari pertama. Krematorium kehabisan kayu.',
    when: pres({ flags: ['tutupi_wabah'] }),
    choices: [
      {
        label: 'Akui, minta maaf, kerahkan semua sumber daya',
        fx: { nation: { kesehatan: -4, pertumbuhan: -1.4, approval: -7, utang: 4 }, attr: { integritas: 2, stres: 6 }, capital: -6, unflags: ['tutupi_wabah'] },
        result: 'Pidato terberat dalam hidupmu. Negara bergerak, terlambat tiga bulan.',
      },
      {
        label: 'Sebut memo itu palsu',
        fx: { nation: { kesehatan: -6, pertumbuhan: -1.5, stabilitas: -4 }, heat: 15 },
        outcomes: [
          { chance: 0.3, text: 'Cukup banyak orang yang percaya. Angka kematian resmi tetap "terkendali".', fx: { nation: { approval: -3 } } },
          { chance: 0.7, text: 'Penulis memo tampil di televisi dengan bukti lengkap. DPR membentuk panitia penyelidik.', fx: { nation: { approval: -10 }, capital: -10, coalition: -8, schedule: [{ id: 'p_sidang_pemakzulan', min: 3, max: 8, chance: 0.6 }] } },
        ],
      },
      {
        label: 'Copot menteri kesehatan sebagai kambing hitam',
        fx: { nation: { kesehatan: -4, pertumbuhan: -1.2, approval: -5 }, coalition: -6, unflags: ['tutupi_wabah'] },
        result: 'Sang menteri pergi sambil membawa salinan semua pesanmu. Ia belum bicara. Belum.',
      },
    ],
  },
  {
    id: 'p_kabut_asap',
    title: 'Langit Kuning',
    text: 'Kebakaran lahan menyelimuti tiga provinsi. Sekolah libur, bandara tutup, bayi-bayi sesak napas. Asapnya sampai ke Temasik dan Malaka Raya. Lahan yang terbakar milik perusahaan sawit besar.',
    when: pres({ nationMax: { lingkungan: 40 } }),
    weight: 4,
    choices: [
      {
        label: 'Segel lahan dan seret perusahaannya ke pengadilan',
        fx: { nation: { lingkungan: 3, approval: 4, pertumbuhan: -0.3 }, coalition: -6, diplo: 4, capital: -4 },
        result: 'Garis segel dipasang di depan kamera. Pemilik perusahaan adalah bendahara salah satu partai koalisimu.',
      },
      {
        label: 'Salahkan peladang kecil dan musim kering',
        fx: { nation: { lingkungan: -3, kesehatan: -2, approval: -4 }, diplo: -5, coalition: 3, flags: ['lindungi_pembakar'], schedule: [{ id: 'p_asap_gugatan', min: 8, max: 20 }], hint: 'Asap hilang ditiup angin. Paru-paru anak-anak menyimpannya.' },
        result: 'Belasan petani ditangkap. Perusahaan mengirim karangan bunga dan sumbangan masker.',
      },
      {
        label: 'Kerahkan hujan buatan dan tentara',
        fx: { nation: { utang: 1, lingkungan: 1, approval: 2 }, attr: { stres: 2 } },
        result: 'Api padam setelah tiga minggu dan satu hujan sungguhan. Akar masalahnya tidak tersentuh.',
      },
    ],
  },
  {
    id: 'p_asap_gugatan',
    title: 'Gugatan Warga Asap',
    text: 'Ribuan orang tua korban asap menang gugatan: pengadilan menyatakan presiden lalai dan melindungi pembakar lahan. Dokumen persidangan memuat notula rapatmu dengan bos sawit.',
    when: pres({ flags: ['lindungi_pembakar'] }),
    choices: [
      {
        label: 'Patuhi putusan, bayar ganti rugi, tindak perusahaan',
        fx: { nation: { utang: 2, approval: 2, lingkungan: 3 }, coalition: -7, unflags: ['lindungi_pembakar'] },
        result: 'Terlambat, tapi dilakukan. Partai koalisi pemilik kebun mulai menghitung ulang kesetiaannya.',
      },
      {
        label: 'Ajukan banding sampai semua lupa',
        fx: { nation: { approval: -6, kebahagiaan: -2 }, heat: 8 },
        result: 'Negara melawan orang tua anak-anak berpenyakit paru. Tak ada juru bicara yang bisa membuat itu terdengar baik.',
      },
      {
        label: 'Tekan hakim agar putusan dibatalkan di tingkat atas',
        fx: { nation: { korupsi: 3, approval: -3 }, heat: 15, flags: ['intervensi_hukum'], schedule: [{ id: 'p_hakim_bicara', min: 10, max: 24, chance: 0.7 }], hint: 'Hakim yang ditekan suatu hari pensiun, dan pensiunan suka menulis buku.' },
        result: 'Putusan dibatalkan dengan alasan teknis. Di kalangan hakim, namamu mulai disebut dengan suara pelan.',
      },
    ],
  },

  // =====================================================================
  // KABINET & KOALISI
  // =====================================================================
  {
    id: 'p_menteri_korup',
    title: 'Operasi Tangkap Tangan',
    text: 'Menterimu ditangkap komisi antikorupsi di sebuah hotel dengan koper berisi uang. Ia kader penting partai koalisi. Ketua partainya menelepon: "Pak Presiden pasti bisa mengatur ini."',
    when: pres({ notFlags: ['lemahkan_kpk'] }),
    weight: 3,
    choices: [
      {
        label: 'Pecat hari ini, biarkan hukum berjalan',
        fx: { nation: { approval: 5, korupsi: -2 }, coalition: -8, attr: { integritas: 2 } },
        result: 'Publik bersorak. Partai sang menteri menganggapmu tidak tahu balas budi.',
      },
      {
        label: 'Lindungi: tekan komisi agar kasusnya melemah',
        fx: { nation: { approval: -5, korupsi: 3 }, coalition: 8, heat: 12, flags: ['lindungi_menteri'], schedule: [{ id: 'p_menteri_bernyanyi', min: 8, max: 20 }], hint: 'Orang yang kamu selamatkan tahu persis bagaimana caramu menyelamatkannya.' },
        result: 'Penyidik utama dimutasi ke daerah terpencil. Koalisi solid, dan kini kamu berutang pada rahasia bersama.',
      },
      {
        label: 'Nonaktifkan sementara, tunggu pengadilan',
        fx: { nation: { approval: -1 }, coalition: -3, capital: -3 },
        result: 'Jawaban aman yang tidak memuaskan siapa pun. Kursi menteri kosong berbulan-bulan.',
      },
    ],
  },
  {
    id: 'p_menteri_bernyanyi',
    title: 'Sang Menteri Bernyanyi',
    text: 'Menteri yang dulu kamu lindungi tertangkap lagi untuk kasus lain. Kali ini ia menawar: keringanan hukuman, ditukar cerita lengkap tentang siapa yang memerintahkan penyidik dimutasi.',
    when: pres({ flags: ['lindungi_menteri'] }),
    choices: [
      {
        label: 'Lindungi lagi, apa pun harganya',
        fx: { nation: { korupsi: 3 }, capital: -8, heat: 12, hint: 'Lubang yang ditutup dengan lubang.' },
        outcomes: [
          { chance: 0.5, text: 'Berkasnya hilang dari meja jaksa. Ia bebas, dan sekarang memegang lehermu dua kali.', fx: { nation: { approval: -4 }, coalition: 4 } },
          { chance: 0.5, text: 'Rekaman teleponmu dengan kepala kejaksaan bocor ke media.', fx: { nation: { approval: -10 }, coalition: -6, heat: 15, schedule: [{ id: 'skandal_terbongkar', min: 1, max: 4 }] } },
        ],
      },
      {
        label: 'Biarkan ia bicara, hadapi sendiri',
        fx: { nation: { approval: -6 }, heat: 10, attr: { integritas: 3, stres: 5 }, unflags: ['lindungi_menteri'], schedule: [{ id: 'kpk_panggil', min: 2, max: 6, chance: 0.7 }] },
        result: 'Ia bernyanyi merdu di ruang penyidik. Kamu menunggu surat panggilan dengan kepala tegak dan perut mulas.',
      },
      {
        label: 'Bubarkan saja kewenangan komisinya',
        need: { notFlags: ['lemahkan_kpk'] },
        fx: { nation: { approval: -8, korupsi: 6, stabilitas: -3 }, coalition: 6, heat: -10, capital: -10, flags: ['lemahkan_kpk'], unflags: ['lindungi_menteri'] },
        result: 'Revisi undang-undang kilat disahkan tengah malam. Mahasiswa turun ke jalan sebelum tintanya kering.',
      },
    ],
  },
  {
    id: 'p_menteri_membangkang',
    title: 'Menteri Punya Panggung Sendiri',
    text: 'Seorang menterimu terang-terangan mengkritik kebijakanmu di televisi dan mulai keliling daerah dengan baliho wajahnya. Semua orang tahu ia mengincar kursimu.',
    when: pres(),
    weight: 3,
    choices: [
      {
        label: 'Pecat',
        fx: { capital: 3, coalition: -6, nation: { approval: -1 } },
        result: 'Ia keluar istana sambil melambai ke wartawan. Kini ia calon presiden dengan status "korban".',
      },
      {
        label: 'Rangkul: beri panggung lebih besar di bawah kendalimu',
        need: { attrMin: { karisma: 55 } },
        fx: { capital: -3, coalition: 4 },
        result: 'Kalian makan siang bersama di depan kamera. Ambisinya tidak hilang, hanya ditunda.',
      },
      {
        label: 'Diamkan, suruh intelijen kumpulkan boroknya',
        fx: { heat: 6, capital: -2, hint: 'Berkas tentang orang lain juga menyimpan sidik jarimu.' },
        outcomes: [
          { chance: 0.6, text: 'Berkasnya tebal. Setelah satu pertemuan empat mata, ia mendadak jadi menteri paling santun.', fx: { capital: 5 } },
          { chance: 0.4, text: 'Operasi intelijen bocor. "Presiden memata-matai menterinya sendiri" jadi judul utama.', fx: { nation: { approval: -5 }, coalition: -6, heat: 8 } },
        ],
      },
    ],
  },
  {
    id: 'p_jatah_kursi',
    title: 'Jatah Kursi',
    text: 'Ketua partai koalisi datang malam-malam. Partainya merasa "berkeringat banyak" dan minta dua kursi menteri tambahan plus beberapa komisaris BUMN. Kadernya, kata dia, "bisa belajar sambil jalan".',
    when: pres(),
    weight: 4,
    choices: [
      {
        label: 'Beri yang diminta',
        fx: { coalition: 8, nation: { korupsi: 2, approval: -2 }, capital: -3, hint: 'Menteri yang belajar sambil jalan biasanya menabrak sesuatu.' },
        result: 'Koalisi hangat kembali. Kementerian yang kamu serahkan mulai sibuk mengganti pejabat dengan kader.',
      },
      {
        label: 'Beri komisaris BUMN saja',
        fx: { coalition: 3, nation: { korupsi: 1 } },
        result: 'Ia pulang setengah puas. BUMN mendapat komisaris baru yang tak pernah hadir rapat.',
      },
      {
        label: 'Tolak. Kabinet bukan bagi-bagi kue',
        fx: { coalition: -9, nation: { approval: 3 }, attr: { integritas: 1 } },
        result: 'Kalimatmu dikutip media dengan kagum. Di DPR, tiga rancangan undang-undangmu mendadak macet.',
      },
    ],
  },
  {
    id: 'p_ancam_keluar_koalisi',
    title: 'Ancaman Hengkang',
    text: 'Partai terbesar kedua di koalisimu mengumumkan "evaluasi dukungan". Tanpa mereka, mayoritasmu di DPR hilang. Tuntutan mereka: batalkan satu kebijakanmu dan ganti menteri keuangan.',
    when: pres(),
    weight: 3,
    choices: [
      {
        label: 'Turuti tuntutan mereka',
        fx: { coalition: 9, capital: -8, nation: { approval: -3 } },
        result: 'Koalisi utuh. Semua partai lain kini tahu bahwa mengancammu ternyata berhasil.',
      },
      {
        label: 'Tantang: silakan keluar',
        outcomes: [
          { chance: 0.5, text: 'Mereka gertak sambal. Tak ada yang mau kehilangan kursi menteri.', fx: { capital: 8, coalition: -3, nation: { approval: 3 } } },
          { chance: 0.5, text: 'Mereka benar-benar bergeser ke oposisi. Setiap anggaran kini pertempuran.', fx: { coalition: -12, capital: -6, nation: { stabilitas: -3 } } },
        ],
      },
      {
        label: 'Beli beberapa anggota DPR mereka secara diam-diam',
        need: { moneyMin: 5000 },
        fx: { money: -5000, coalition: 4, heat: 12, nation: { korupsi: 2 }, hint: 'Suara yang bisa dibeli juga bisa dibeli orang lain.' },
        result: 'Fraksi mereka pecah dari dalam. Amplopnya tebal, dan penerimanya banyak mulut.',
      },
    ],
  },
  {
    id: 'p_hak_angket',
    title: 'Hak Angket',
    text: 'Oposisi mengumpulkan tanda tangan untuk hak angket atas kebijakanmu. Kepuasan publik sedang rendah, dan beberapa anggota koalisimu ikut meneken diam-diam.',
    when: pres({ nationMax: { approval: 38 } }),
    weight: 3,
    choices: [
      {
        label: 'Hadapi terbuka, datang ke DPR',
        need: { attrMin: { karisma: 50 } },
        outcomes: [
          { chance: 0.6, text: 'Kamu menjawab enam jam tanpa naskah. Angket kehilangan tenaga.', fx: { nation: { approval: 5 }, capital: 6 } },
          { chance: 0.4, text: 'Satu jawabanmu terpeleset dan jadi potongan video abadi.', fx: { nation: { approval: -4 }, capital: -5 } },
        ],
      },
      {
        label: 'Lobi dengan proyek dan jabatan',
        fx: { coalition: 6, capital: -6, nation: { korupsi: 2 }, heat: 8 },
        result: 'Tanda tangan ditarik satu per satu. Harga tiap tanda tangan tercatat di ingatan banyak orang.',
      },
      {
        label: 'Abaikan dan sebut manuver politik',
        fx: { nation: { approval: -3, stabilitas: -2 }, capital: -5, coalition: -5, schedule: [{ id: 'p_sidang_pemakzulan', min: 4, max: 10, chance: 0.5 }], hint: 'Angket yang diabaikan kadang tumbuh jadi sesuatu yang lebih besar.' },
        result: 'Panitia angket bekerja tanpa kehadiranmu, dan menemukan lebih banyak dari yang mereka cari.',
      },
    ],
  },
  {
    id: 'p_sidang_pemakzulan',
    title: 'Sidang Pemakzulan',
    text: 'DPR resmi mengajukan usul pemberhentian presiden. Mahkamah akan memutus, lalu majelis memungut suara. Para ketua partai koalisi mendadak sulit dihubungi.',
    when: pres(),
    choices: [
      {
        label: 'Lawan lewat jalur hukum',
        outcomes: [
          { chance: 0.6, text: 'Mahkamah menolak usul itu. Kamu selamat, dengan luka yang tak akan sembuh sampai akhir jabatan.', fx: { nation: { approval: -2, stabilitas: -2 }, capital: -8 } },
          { chance: 0.4, text: 'Mahkamah mengabulkan. Majelis memungut suara pada sore yang gerah, dan kamu kalah.', fx: { end: 'dimakzulkan' } },
        ],
      },
      {
        label: 'Tebar konsesi besar ke semua partai',
        fx: { coalition: 12, capital: -15, nation: { korupsi: 4, approval: -4 } },
        result: 'Usul itu layu di meja pimpinan DPR. Kamu tetap presiden, dengan kabinet yang kini lebih milik mereka.',
      },
      {
        label: 'Bekukan DPR lewat dekrit',
        need: { notFlags: ['dekrit_darurat'] },
        fx: { nation: { stabilitas: -5, approval: -6 }, diplo: -10, flags: ['dekrit_darurat'], hint: 'Tentara yang kamu minta menjaga gedung DPR juga sedang menimbang-nimbang.' },
        outcomes: [
          { chance: 0.55, text: 'Tentara mematuhi. Gedung DPR dijaga panser dan kamu memerintah sendirian.', fx: { capital: 10 } },
          { chance: 0.45, text: 'Panglima menolak perintahmu. Malam itu juga, yang dikepung panser adalah istana.', fx: { end: 'dikudeta' } },
        ],
      },
    ],
  },
  {
    id: 'p_bocoran_rapat',
    title: 'Bocoran Rapat Kabinet',
    text: 'Rekaman rapat kabinet tertutup beredar. Di dalamnya kamu menyebut rakyat "gampang lupa asal harga gorengan stabil". Yang merekam pasti salah satu menterimu.',
    when: pres(),
    weight: 2,
    choices: [
      {
        label: 'Minta maaf dan jelaskan konteksnya',
        fx: { nation: { approval: -3 }, attr: { integritas: 1 } },
        result: 'Permintaan maaf diterima sebagian orang. Kalimat soal gorengan tetap dicetak di kaus.',
      },
      {
        label: 'Buru pembocornya',
        fx: { coalition: -4, capital: -2 },
        outcomes: [
          { chance: 0.5, text: 'Pelakunya ketemu: staf seorang menteri. Kamu punya alasan untuk bersih-bersih.', fx: { capital: 6 } },
          { chance: 0.5, text: 'Perburuan gagal. Para menteri kini saling curiga dan rapat jadi hening.', fx: { coalition: -4, nation: { approval: -2 }, attr: { stres: 3 } } },
        ],
      },
      {
        label: 'Sebut rekaman itu hasil rekayasa suara',
        fx: { nation: { approval: -2 }, heat: 5, hint: 'Rekaman pertama jarang datang sendirian.' },
        result: 'Pakar forensik bayaranmu tampil meyakinkan. Pembocornya masih menyimpan dua jam sisa rekaman.',
      },
    ],
  },

  // =====================================================================
  // RAKYAT
  // =====================================================================
  {
    id: 'p_demo_mahasiswa',
    title: 'Mahasiswa Mengepung DPR',
    text: 'Puluhan ribu mahasiswa memenuhi jalan depan gedung DPR. Tuntutan mereka panjang; intinya: mereka muak. Kapolri menunggu perintah. Gas air mata sudah dibagikan.',
    when: pres({ nationMax: { approval: 38 } }),
    weight: 4,
    choices: [
      {
        label: 'Temui mereka langsung',
        need: { attrMin: { karisma: 50 } },
        outcomes: [
          { chance: 0.6, text: 'Kamu naik mobil komando dan dilempari botol, lalu didengarkan. Sebagian tuntutan kamu terima.', fx: { nation: { approval: 5, stabilitas: 2 }, capital: -5 } },
          { chance: 0.4, text: 'Kamu disoraki sampai turun. Tapi tak ada yang terluka, dan itu sudah sesuatu.', fx: { nation: { approval: -2 }, attr: { stres: 4 } } },
        ],
      },
      {
        label: 'Bubarkan paksa',
        fx: { nation: { stabilitas: 3, approval: -6, kebahagiaan: -3 }, diplo: -5, flags: ['darah_mahasiswa'], schedule: [{ id: 'p_martir_mahasiswa', min: 2, max: 9 }], hint: 'Mahasiswa yang dipukul hari ini punya teman, orang tua, dan kamera.' },
        result: 'Jalan bersih sebelum tengah malam. Rumah sakit penuh. Dua mahasiswa belum ditemukan.',
      },
      {
        label: 'Biarkan sampai mereka lelah',
        fx: { nation: { stabilitas: -3, approval: -2, pertumbuhan: -0.2 } },
        result: 'Demo berlangsung dua minggu. Lalu ujian semester datang dan jalanan kembali ke pedagang kaki lima.',
      },
    ],
  },
  {
    id: 'p_martir_mahasiswa',
    title: 'Dua Nama',
    text: 'Dua mahasiswa yang hilang saat pembubaran paksa ditemukan tewas. Wajah mereka kini ada di setiap tembok kampus. Para ibu berpakaian hitam berdiri diam di depan istana setiap Kamis.',
    when: pres({ flags: ['darah_mahasiswa'] }),
    choices: [
      {
        label: 'Bentuk tim pencari fakta independen, adili pelaku',
        fx: { nation: { approval: 2, stabilitas: 1 }, capital: -6, attr: { integritas: 3 }, unflags: ['darah_mahasiswa'] },
        result: 'Beberapa perwira diadili. Polisi merasa dikorbankan, para ibu merasa didengar untuk pertama kali.',
      },
      {
        label: 'Sebut mereka korban "penyusup"',
        fx: { nation: { approval: -6, stabilitas: -4 } },
        outcomes: [
          { chance: 0.55, text: 'Versi resmi tidak dipercaya, tapi kemarahan belum punya pemimpin. Belum.', fx: { heat: 8 } },
          { chance: 0.3, text: 'Demonstrasi meluas ke dua puluh kota. Buruh dan pelajar bergabung. Koalisi mulai menjauh.', fx: { nation: { stabilitas: -6, approval: -6 }, coalition: -8, capital: -8 } },
          { chance: 0.15, text: 'Jutaan orang turun ke jalan. Tentara menolak menembak. Kamu meninggalkan istana lewat pintu belakang.', fx: { end: 'revolusi' } },
        ],
      },
      {
        label: 'Santuni keluarga, minta mereka diam',
        fx: { money: -1000, nation: { approval: -3 }, heat: 6, hint: 'Duka tidak bisa dibeli putus.' },
        result: 'Satu keluarga menerima. Keluarga lain mengembalikan amplopmu di depan wartawan.',
      },
    ],
  },
  {
    id: 'p_mogok_buruh',
    title: 'Mogok Nasional',
    text: 'Serikat buruh mengumumkan mogok nasional tiga hari menuntut kenaikan upah. Pelabuhan dan kawasan industri akan lumpuh. Asosiasi pengusaha mengancam memindahkan pabrik ke Malaka Raya.',
    when: pres(),
    weight: 3,
    choices: [
      {
        label: 'Penuhi tuntutan upah',
        fx: { nation: { approval: 4, kemiskinan: -0.5, inflasi: 0.5, pengangguran: 0.5, kebahagiaan: 2 }, coalition: -3 },
        result: 'Buruh pulang bernyanyi. Dua pabrik sepatu mengumumkan relokasi bulan berikutnya.',
      },
      {
        label: 'Jadi penengah perundingan tiga pihak',
        need: { attrMin: { kecerdasan: 50 } },
        fx: { nation: { approval: 2, kemiskinan: -0.2, inflasi: 0.3 }, capital: -4, attr: { stres: 3 } },
        result: 'Perundingan sampai subuh. Semua pihak pulang sama-sama kurang puas, tanda kesepakatan yang adil.',
      },
      {
        label: 'Nyatakan mogok ilegal, kerahkan aparat',
        fx: { nation: { approval: -5, stabilitas: -2, pertumbuhan: 0.2, kebahagiaan: -3 }, coalition: 2, diplo: -3 },
        result: 'Pabrik tetap jalan dijaga tentara. Para pemimpin serikat ditahan dan mendadak jadi terkenal.',
      },
    ],
  },
  {
    id: 'p_kerusuhan',
    title: 'Kota Terbakar',
    text: 'Kerusuhan pecah di tiga kota setelah seorang pengemudi ojek tewas dipukuli aparat. Pasar dibakar, toko dijarah. Polisi kewalahan dan meminta tentara turun.',
    when: pres({ nationMax: { stabilitas: 35 } }),
    weight: 4,
    choices: [
      {
        label: 'Turunkan tentara dan berlakukan jam malam',
        fx: { nation: { stabilitas: 4, approval: -4, kebahagiaan: -3, kriminalitas: -2 }, diplo: -3, hint: 'Tentara yang sudah turun ke jalan tidak selalu ingin pulang ke barak.' },
        result: 'Kota sunyi dalam dua malam. Panser parkir di perempatan, dan para jenderal mulai terbiasa dimintai tolong.',
      },
      {
        label: 'Adili aparat pemukul, datangi keluarga korban',
        fx: { nation: { stabilitas: 2, approval: 4 }, capital: -4, attr: { stres: 3 } },
        result: 'Kemarahan mereda pelan-pelan. Korps kepolisian merasa dipermalukan presidennya sendiri.',
      },
      {
        label: 'Tunggu. Kerusuhan biasanya padam sendiri',
        outcomes: [
          { chance: 0.35, text: 'Hujan deras tiga hari memadamkan api dan amarah.', fx: { nation: { stabilitas: -2, approval: -2 } } },
          { chance: 0.65, text: 'Kerusuhan menjalar ke ibu kota. Kerugian triliunan, puluhan tewas.', fx: { nation: { stabilitas: -6, approval: -8, pertumbuhan: -0.8, kriminalitas: 4 }, capital: -6 } },
        ],
      },
    ],
  },
  {
    id: 'p_konflik_sara',
    title: 'Api di Rumah Ibadah',
    text: 'Sebuah rumah ibadah minoritas dibakar massa setelah isu penistaan menyebar di media sosial. Kelompok garis keras menuntut "pelakunya" dihukum. Pelakunya seorang remaja yang salah unggah.',
    when: pres(),
    weight: 3,
    choices: [
      {
        label: 'Tangkap pembakar, lindungi minoritas',
        fx: { nation: { stabilitas: 1, approval: -3, kriminalitas: -1 }, coalition: -4, diplo: 4, attr: { integritas: 2 } },
        result: 'Hukum ditegakkan. Mimbar-mimbar tertentu menyebutmu memusuhi umat.',
      },
      {
        label: 'Proses hukum si remaja demi meredam massa',
        fx: { nation: { stabilitas: 2, approval: 2, kebahagiaan: -2 }, diplo: -5, flags: ['tunduk_massa'], hint: 'Massa yang sekali dituruti akan datang lagi dengan daftar lebih panjang.' },
        result: 'Massa bubar dengan puas. Mereka kini tahu cara mendapatkan apa yang mereka mau.',
      },
      {
        label: 'Kumpulkan tokoh lintas agama, damaikan',
        need: { attrMin: { karisma: 55 } },
        fx: { nation: { stabilitas: 3, approval: 3 }, capital: -4 },
        result: 'Foto para pemuka agama bergandengan tangan menghiasi koran. Rumah ibadah dibangun ulang dengan gotong royong.',
      },
    ],
  },
  {
    id: 'p_massa_menagih',
    title: 'Daftar yang Lebih Panjang',
    text: 'Kelompok garis keras yang dulu kamu turuti kini menuntut perda larangan, pembubaran ormas saingan, dan satu kursi wakil menteri. Mereka menjanjikan "aksi bela" berjilid-jilid bila ditolak.',
    when: pres({ flags: ['tunduk_massa'] }),
    weight: 3,
    once: true,
    choices: [
      {
        label: 'Turuti lagi',
        fx: { nation: { stabilitas: 1, kebahagiaan: -4, approval: -3 }, diplo: -6, coalition: -4 },
        result: 'Mereka mendapat kursi dan panggung. Kaum minoritas mulai mengurus paspor.',
      },
      {
        label: 'Cukup. Tindak tegas ormas itu',
        fx: { nation: { stabilitas: -4, approval: -2 }, capital: -6, unflags: ['tunduk_massa'], attr: { stres: 4 } },
        result: 'Jalanan panas berminggu-minggu. Setelah itu, untuk pertama kalinya sejak lama, mereka berhitung sebelum mengancam.',
      },
      {
        label: 'Pecah mereka: rangkul satu faksi, tinggalkan lainnya',
        need: { attrMin: { jaringan: 55 } },
        fx: { nation: { stabilitas: 1, korupsi: 1 }, capital: -3, money: -1500, unflags: ['tunduk_massa'] },
        result: 'Para pemimpinnya kini sibuk saling menuduh pengkhianat. Murah, kotor, efektif.',
      },
    ],
  },
  {
    id: 'p_separatis',
    title: 'Bendera Lain di Timur',
    text: 'Di provinsi paling timur, kelompok bersenjata mengibarkan bendera sendiri dan menyandera pekerja tambang. Mereka bilang kekayaan tanahnya diangkut ke ibu kota, sementara anak mereka tak bersekolah.',
    when: pres(),
    weight: 2,
    once: true,
    choices: [
      {
        label: 'Operasi militer besar-besaran',
        fx: { nation: { stabilitas: 3, approval: 3, militer: -2, utang: 1 }, diplo: -5, flags: ['operasi_militer_timur'], schedule: [{ id: 'p_ham_timur_terbongkar', min: 10, max: 26 }], hint: 'Di hutan yang jauh, tidak semua yang terjadi masuk laporan.' },
        result: 'Sandera bebas, bendera diturunkan. Wartawan dilarang masuk provinsi itu "demi keamanan".',
      },
      {
        label: 'Dialog: tawarkan otonomi khusus dan bagi hasil',
        fx: { nation: { stabilitas: 1, utang: 2, approval: -2 }, capital: -8, coalition: -4, flags: ['otonomi_timur'], schedule: [{ id: 'p_timur_minta_referendum', min: 14, max: 30 }], hint: 'Pintu yang dibuka sedikit bisa didorong lebih lebar.' },
        result: 'Senjata diletakkan. Kaum nasionalis menuduhmu menggadaikan keutuhan negara.',
      },
      {
        label: 'Tebus sandera diam-diam, lalu lupakan',
        fx: { money: -2000, nation: { stabilitas: -2 }, heat: 5 },
        result: 'Sandera pulang. Kelompok itu membeli senjata baru dengan uang tebusanmu.',
      },
    ],
  },
  {
    id: 'p_ham_timur_terbongkar',
    title: 'Kuburan di Hutan',
    text: 'Media Australis menayangkan citra satelit dan kesaksian: desa-desa dibakar dan kuburan massal ditemukan di wilayah operasi militer timur. Serikat Atlantika menuntut penyelidikan internasional.',
    when: pres({ flags: ['operasi_militer_timur'] }),
    choices: [
      {
        label: 'Izinkan penyelidikan, adili komandan lapangan',
        fx: { nation: { approval: -3, militer: -3, stabilitas: -3 }, diplo: 6, attr: { integritas: 3 }, unflags: ['operasi_militer_timur'], schedule: [{ id: 'p_isu_kudeta', min: 3, max: 10, chance: 0.5 }], hint: 'Para jenderal tidak suka melihat rekannya di kursi terdakwa.' },
        result: 'Dunia memuji keberanianmu. Di markas besar tentara, fotomu dibalik menghadap tembok.',
      },
      {
        label: 'Bantah semuanya: "campur tangan asing"',
        fx: { nation: { approval: 2, stabilitas: -2 }, diplo: -10, heat: 8 },
        result: 'Di dalam negeri bantahanmu laku. Di luar negeri, tiga negara menunda kerja sama dan bantuan.',
      },
      {
        label: 'Tutup provinsi itu sepenuhnya dari dunia luar',
        need: { flags: ['bungkam_pers'] },
        fx: { nation: { stabilitas: -4, kebahagiaan: -3 }, diplo: -8, hint: 'Provinsi yang dikunci dari luar sedang mendidih di dalam.' },
        result: 'Internet diputus, wartawan diusir. Gerakan merdeka di sana justru mendapat anggota baru setiap hari.',
      },
    ],
  },
  {
    id: 'p_timur_minta_referendum',
    title: 'Tuntutan Referendum',
    text: 'Otonomi khusus berjalan, dan para pemimpin timur kini meminta lebih: referendum kemerdekaan. Serikat Atlantika "mencatat aspirasi itu dengan saksama". Para jenderal memintamu berhenti berunding.',
    when: pres({ flags: ['otonomi_timur'] }),
    choices: [
      {
        label: 'Tolak referendum, tambah dana dan kewenangan',
        fx: { nation: { utang: 2, stabilitas: -1 }, capital: -5 },
        outcomes: [
          { chance: 0.6, text: 'Uang dan jabatan meredam tuntutan. Untuk satu generasi, mungkin.', fx: { nation: { stabilitas: 3 }, unflags: ['otonomi_timur'] } },
          { chance: 0.4, text: 'Tawaranmu ditolak. Bentrokan kembali pecah di pegunungan.', fx: { nation: { stabilitas: -5, approval: -4, militer: -2 } } },
        ],
      },
      {
        label: 'Izinkan referendum',
        fx: { diplo: 8, coalition: -10, capital: -10, hint: 'Tidak ada presiden Nagari yang dimaafkan karena kehilangan wilayah.' },
        outcomes: [
          { chance: 0.45, text: 'Mereka memilih tetap bersama Nagari. Kamu dikenang sebagai negarawan pemberani.', fx: { nation: { stabilitas: 5, approval: 6 }, unflags: ['otonomi_timur'] } },
          { chance: 0.4, text: 'Mereka memilih merdeka. Peta Nagari mengecil dan namamu dikutuk di setiap warung kopi.', fx: { nation: { stabilitas: -6, approval: -10, militer: -4 }, flags: ['lepas_timur'], unflags: ['otonomi_timur'] } },
          { chance: 0.15, text: 'Mereka memilih merdeka. Malam itu juga para jenderal memutuskan bahwa kamu pengkhianat.', fx: { end: 'dikudeta' } },
        ],
      },
      {
        label: 'Cabut otonomi, kirim pasukan',
        fx: { nation: { stabilitas: -3, approval: 2, militer: -2, utang: 1 }, diplo: -7, flags: ['operasi_militer_timur'], unflags: ['otonomi_timur'], schedule: [{ id: 'p_ham_timur_terbongkar', min: 10, max: 24 }], hint: 'Janji yang dicabut dengan senapan diingat lebih lama dari janjinya.' },
        result: 'Perundingan bertahun-tahun hangus dalam semalam. Perang kecil yang panjang dimulai lagi.',
      },
    ],
  },

  // =====================================================================
  // HUKUM & GODAAN
  // =====================================================================
  {
    id: 'p_keluarga_proyek',
    title: 'Makan Malam Keluarga',
    text: 'Adik iparmu baru mendirikan perusahaan konstruksi, umur perusahaannya tiga minggu. Di meja makan ia bertanya soal proyek jalan tol. Ibumu ikut menatapmu penuh harap.',
    when: pres(),
    weight: 3,
    once: true,
    choices: [
      {
        label: 'Atur agar ia menang tender',
        fx: { money: 8000, nation: { korupsi: 2 }, heat: 12, attr: { integritas: -4 }, flags: ['proyek_keluarga'], schedule: [{ id: 'p_tol_ipar_ambruk', min: 12, max: 28 }], hint: 'Perusahaan berumur tiga minggu belum pernah membangun apa pun.' },
        result: 'Makan malam berikutnya jauh lebih hangat. Dirjen yang kamu telepon mengerti tanpa perlu dijelaskan.',
      },
      {
        label: 'Tolak, tawarkan modal usaha dari kantong sendiri',
        need: { moneyMin: 1000 },
        fx: { money: -1000, attr: { integritas: 2, stres: 2 } },
        result: 'Ia menerima uangnya dengan wajah kecewa. Ibumu bilang kamu berubah sejak jadi presiden.',
      },
      {
        label: 'Tolak mentah-mentah',
        fx: { attr: { integritas: 3, stres: 4 } },
        result: 'Makan malam selesai lebih cepat. Lebaran tahun ini akan canggung.',
      },
    ],
  },
  {
    id: 'p_tol_ipar_ambruk',
    title: 'Jembatan Tol Ambruk',
    text: 'Jembatan di ruas tol garapan perusahaan adik iparmu ambruk saat jam sibuk. Belasan tewas. Wartawan sudah menemukan akta perusahaan dan silsilah keluargamu.',
    when: pres({ flags: ['proyek_keluarga'] }),
    choices: [
      {
        label: 'Biarkan ipar diadili, akui kelalaian pengawasan',
        fx: { nation: { approval: -6 }, heat: 10, attr: { integritas: 3, stres: 6 }, capital: -5, unflags: ['proyek_keluarga'] },
        result: 'Adik iparmu dijemput penyidik. Keluargamu terbelah, tapi kamu masih bisa menatap kamera.',
      },
      {
        label: 'Larikan ipar ke Temasik',
        fx: { nation: { approval: -8, korupsi: 2 }, heat: 22, diplo: -3, schedule: [{ id: 'skandal_terbongkar', min: 2, max: 8 }], hint: 'Temasik menyimpan uang dengan baik. Menyimpan orang, tidak selalu.' },
        result: 'Ia terbang malam itu dengan jet sewaan. Manifes penerbangannya difoto petugas bandara.',
      },
      {
        label: 'Salahkan konsultan pengawas dan cuaca',
        outcomes: [
          { chance: 0.35, text: 'Konsultannya dihukum. Publik curiga, tapi bukti tak sampai ke istana.', fx: { nation: { approval: -4 }, heat: 8 } },
          { chance: 0.65, text: 'Audit menemukan campuran beton sepertiga standar dan suratmu kepada dirjen.', fx: { nation: { approval: -9 }, heat: 20, capital: -8, schedule: [{ id: 'kpk_panggil', min: 2, max: 6 }] } },
        ],
      },
    ],
  },
  {
    id: 'p_oligarki_tagih',
    title: 'Tagihan Kampanye',
    text: 'Taipan yang membiayai kampanyemu datang tanpa janji temu. Ia tidak menyebut angka yang dulu ia keluarkan. Ia hanya meletakkan peta konsesi batu bara di mejamu dan bertanya kapan izinnya keluar.',
    when: pres({ flags: ['hutang_budi'] }),
    weight: 5,
    once: true,
    choices: [
      {
        label: 'Terbitkan izinnya',
        fx: { nation: { lingkungan: -5, korupsi: 3, pertumbuhan: 0.3 }, heat: 10, money: 5000, flags: ['konsesi_oligarki'], unflags: ['hutang_budi'], schedule: [{ id: 'p_oligarki_minta_lagi', min: 10, max: 22 }], hint: 'Orang yang sekali dibayar dengan izin akan menagih dengan izin lagi.' },
        result: 'Utang budi lunas, katanya. Ia pamit sambil menyebut "sampai ketemu di proyek berikutnya".',
      },
      {
        label: 'Ulur waktu dengan janji manis',
        fx: { capital: -3, attr: { stres: 3 }, schedule: [{ id: 'p_oligarki_balas', min: 6, max: 14 }] },
        result: 'Ia tersenyum, tidak percaya. Kamu baru membeli waktu, dengan bunga.',
      },
      {
        label: 'Tolak: "Itu sumbangan, bukan pinjaman"',
        fx: { attr: { integritas: 4 }, nation: { approval: 1 }, unflags: ['hutang_budi'], flags: ['musuh_oligarki'], schedule: [{ id: 'p_oligarki_balas', min: 4, max: 12 }], hint: 'Ia memiliki tiga stasiun televisi dan separuh pengurus partaimu.' },
        result: 'Ia melipat petanya pelan-pelan. "Bapak cepat lupa," katanya di pintu.',
      },
    ],
  },
  {
    id: 'p_oligarki_minta_lagi',
    title: 'Proyek Berikutnya',
    text: 'Sang taipan kembali. Kali ini ia ingin undang-undang: royalti batu bara nol persen dan larangan menggugat perusahaan tambang. Drafnya sudah ia siapkan, lengkap dengan kop surat kementerianmu.',
    when: pres({ flags: ['konsesi_oligarki'] }),
    choices: [
      {
        label: 'Loloskan undang-undangnya',
        fx: { nation: { korupsi: 4, lingkungan: -5, approval: -6, utang: 2 }, money: 12000, heat: 15, coalition: 4, hint: 'Negara yang dibeli eceran akhirnya terjual grosir.' },
        result: 'UU disahkan dini hari tanpa perdebatan. Di kampus-kampus, namamu kini disebut satu napas dengan namanya.',
      },
      {
        label: 'Cukup sampai di sini',
        fx: { attr: { integritas: 3 }, flags: ['musuh_oligarki'], unflags: ['konsesi_oligarki'], schedule: [{ id: 'p_oligarki_balas', min: 3, max: 10 }] },
        result: 'Ia mengingatkan bahwa ia menyimpan salinan izin pertama, beserta catatan transfernya.',
      },
      {
        label: 'Suruh komisi antikorupsi mengincarnya lebih dulu',
        need: { notFlags: ['lemahkan_kpk'] },
        outcomes: [
          { chance: 0.5, text: 'Ia ditangkap sebelum sempat bicara. Kerajaannya goyah, dan kamu bebas dari tali kekangnya.', fx: { nation: { approval: 6, korupsi: -3 }, capital: 5, heat: 8, unflags: ['konsesi_oligarki'] } },
          { chance: 0.5, text: 'Ia lebih cepat. Dokumen izin dan aliran dananya tiba di meja redaksi sebelum penyidik bergerak.', fx: { nation: { approval: -8 }, heat: 25, unflags: ['konsesi_oligarki'], schedule: [{ id: 'kpk_panggil', min: 1, max: 5 }] } },
        ],
      },
    ],
  },
  {
    id: 'p_oligarki_balas',
    title: 'Televisi Berbalik Arah',
    text: 'Tiga stasiun televisi milik sang taipan serentak berubah nada. Setiap malam ada "investigasi" tentang kegagalanmu. Bendahara partaimu melapor: donatur besar mendadak menutup dompet.',
    when: pres(),
    choices: [
      {
        label: 'Bertahan dan jawab dengan kerja',
        fx: { nation: { approval: -6 }, coalition: -5, capital: -4, attr: { stres: 5, integritas: 1 } },
        result: 'Rating kepuasanmu digerogoti malam demi malam. Tapi tidak ada yang bisa menyebutmu boneka.',
      },
      {
        label: 'Berdamai: beri apa yang ia minta',
        fx: { nation: { lingkungan: -4, korupsi: 3, approval: 2 }, heat: 10, attr: { integritas: -4 }, flags: ['konsesi_oligarki'], unflags: ['musuh_oligarki'], hint: 'Kali ini ia tahu kamu bisa ditekuk.' },
        result: 'Besok malam televisinya menayangkan profil "presiden pekerja keras". Kamu tahu harganya.',
      },
      {
        label: 'Periksa pajak seluruh grup usahanya',
        outcomes: [
          { chance: 0.5, text: 'Tunggakan pajaknya menggunung. Ia datang berunding, kali ini dengan nada lebih rendah.', fx: { nation: { approval: 3, utang: -1 }, capital: 6, unflags: ['musuh_oligarki'] } },
          { chance: 0.5, text: 'Ia menyebutnya kriminalisasi dan membuka catatan sumbangan kampanyemu ke publik.', fx: { nation: { approval: -7 }, heat: 18, coalition: -5 } },
        ],
      },
    ],
  },
  {
    id: 'p_dana_gelap',
    title: 'Koper dari Temasik',
    text: 'Seorang perantara menawarkan "dana abadi" untuk pemilu berikutnya: uang besar di rekening Temasik atas nama perusahaan cangkang. Sumbernya bandar judi daring yang ingin tidak diganggu.',
    when: pres({ notFlags: ['dana_gelap'] }),
    weight: 3,
    once: true,
    choices: [
      {
        label: 'Terima',
        fx: { money: 15000, nation: { kriminalitas: 3, korupsi: 2 }, heat: 15, attr: { integritas: -5 }, flags: ['dana_gelap'], schedule: [{ id: 'p_dana_gelap_bocor', min: 10, max: 30 }], hint: 'Bank di Temasik rapi. Pegawainya, suatu hari, bisa sakit hati.' },
        result: 'Angka di rekening itu membuatmu sulit tidur, lalu sangat mudah tidur. Situs judi bermunculan di ponsel anak sekolah.',
      },
      {
        label: 'Tolak dan perintahkan pemberantasan judi',
        fx: { nation: { kriminalitas: -3, approval: 3 }, attr: { integritas: 3 }, capital: -3 },
        result: 'Ribuan situs ditutup. Bandarnya kini menyumbang ke lawan politikmu.',
      },
      {
        label: 'Tolak uangnya, tapi biarkan bisnisnya',
        fx: { nation: { kriminalitas: 2 }, attr: { integritas: -1 } },
        result: 'Kamu tidak mengambil apa-apa dan tidak melakukan apa-apa. Sang bandar menganggapnya sebagai restu gratis.',
      },
    ],
  },
  {
    id: 'p_dana_gelap_bocor',
    title: 'Berkas Temasik',
    text: 'Konsorsium jurnalis internasional menerbitkan bocoran jutaan dokumen bank Temasik. Nama perusahaan cangkangmu ada di halaman 14, lengkap dengan aliran dana dari bandar judi.',
    when: pres({ flags: ['dana_gelap'] }),
    choices: [
      {
        label: 'Bantah: "Itu bukan saya, itu nama yang mirip"',
        outcomes: [
          { chance: 0.3, text: 'Dokumennya rumit, perhatian publik pendek. Badai lewat dengan kerusakan sedang.', fx: { nation: { approval: -4 }, heat: 8 } },
          { chance: 0.7, text: 'Tanda tangan dan salinan paspormu ikut bocor seminggu kemudian.', fx: { nation: { approval: -10 }, heat: 25, capital: -10, coalition: -8, schedule: [{ id: 'kpk_panggil', min: 1, max: 4 }] } },
        ],
      },
      {
        label: 'Kembalikan uangnya ke kas negara, akui "kekhilafan"',
        fx: { money: -15000, nation: { approval: -6 }, heat: 8, attr: { integritas: 2 }, capital: -6, unflags: ['dana_gelap'], schedule: [{ id: 'p_sidang_pemakzulan', min: 3, max: 8, chance: 0.4 }] },
        result: 'Pengakuan yang mahal. Sebagian memaafkan, DPR mulai menghitung suara.',
      },
      {
        label: 'Blokir situs berita dan pidanakan penyebarnya',
        need: { flags: ['bungkam_pers'] },
        fx: { nation: { approval: -5, stabilitas: -3 }, diplo: -6, heat: 10, hint: 'Dokumen yang sudah di luar negeri tidak bisa disita.' },
        result: 'Di dalam negeri beritanya hilang. Di luar negeri, kamu jadi sampul majalah, bukan dalam arti baik.',
      },
    ],
  },
  {
    id: 'p_intervensi_hukum',
    title: 'Telepon untuk Jaksa Agung',
    text: 'Sahabat lamamu, orang yang menampungmu saat kamu belum jadi siapa-siapa, jadi tersangka penggelapan dana koperasi. Istrinya menangis di ruang tamumu. Satu telepon darimu cukup untuk menghentikan perkara.',
    when: pres(),
    weight: 3,
    once: true,
    choices: [
      {
        label: 'Angkat telepon itu',
        fx: { nation: { korupsi: 2 }, heat: 10, attr: { integritas: -4, jaringan: 2 }, flags: ['intervensi_hukum'], schedule: [{ id: 'p_hakim_bicara', min: 10, max: 26 }], hint: 'Ribuan nasabah koperasi itu tidak punya nomor telepon presiden.' },
        result: 'Perkara dihentikan "demi hukum". Sahabatmu memelukmu erat. Nasabah koperasi berdemo di depan kejaksaan.',
      },
      {
        label: 'Carikan pengacara terbaik, tidak lebih',
        fx: { money: -800, attr: { integritas: 2, stres: 3 } },
        result: 'Ia divonis ringan. Persahabatan kalian selamat, meski tidak utuh.',
      },
      {
        label: 'Tolak ikut campur',
        fx: { attr: { integritas: 4, stres: 5, jaringan: -3 } },
        result: 'Istrinya pulang tanpa pamit. Ia divonis enam tahun dan tak pernah lagi menyebut namamu.',
      },
    ],
  },
  {
    id: 'p_hakim_bicara',
    title: 'Memoar Seorang Pensiunan',
    text: 'Seorang pejabat hukum yang baru pensiun menerbitkan memoar. Bab tujuh berjudul "Telepon dari Istana", berisi tanggal, jam, dan kata-katamu. Bukunya laris sebelum sempat dilarang.',
    when: pres({ flags: ['intervensi_hukum'] }),
    choices: [
      {
        label: 'Akui dan minta maaf',
        fx: { nation: { approval: -5 }, attr: { integritas: 2 }, capital: -6, heat: 6, unflags: ['intervensi_hukum'] },
        result: 'Kamu mengaku khilaf karena setia kawan. Rakyat Nagari cukup mengerti soal itu, DPR pura-pura tidak.',
      },
      {
        label: 'Gugat penulisnya atas pencemaran nama',
        outcomes: [
          { chance: 0.35, text: 'Ia tak punya rekaman. Pengadilan memenangkanmu dan buku ditarik.', fx: { nation: { approval: -2 }, heat: 5 } },
          { chance: 0.65, text: 'Ia punya rekaman. Diputar di ruang sidang, disiarkan langsung.', fx: { nation: { approval: -9 }, heat: 18, capital: -8, schedule: [{ id: 'p_sidang_pemakzulan', min: 3, max: 8, chance: 0.5 }] } },
        ],
      },
      {
        label: 'Larang peredaran bukunya',
        need: { flags: ['bungkam_pers'] },
        fx: { nation: { approval: -3 }, heat: 8, diplo: -3 },
        result: 'Buku terlarang selalu jadi buku terlaris. Versi bajakannya dijual di lampu merah.',
      },
    ],
  },
  {
    id: 'p_jurnalis_bongkar',
    title: 'Liputan yang Tidak Boleh Terbit',
    text: 'Meski undang-undang ketertiban informasi berlaku, sebuah majalah nekat menyiapkan laporan sampul tentang bisnis orang-orang dekat istana. Pemimpin redaksinya menolak semua "ajakan makan siang".',
    when: pres({ flags: ['bungkam_pers'] }),
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Tangkap pemimpin redaksinya dengan pasal ketertiban',
        fx: { nation: { approval: -4, kebahagiaan: -2, stabilitas: 1 }, diplo: -7, flags: ['penjarakan_jurnalis'], schedule: [{ id: 'p_jurnalis_di_sel', min: 4, max: 14 }], hint: 'Penjara Nagari bukan tempat yang sehat untuk orang berusia enam puluh.' },
        result: 'Majalahnya dibredel, kantornya disegel. Laporannya terbit di luar negeri dalam tiga bahasa.',
      },
      {
        label: 'Beli majalahnya lewat pengusaha kenalan',
        need: { moneyMin: 4000 },
        fx: { money: -4000, heat: 8, nation: { korupsi: 1 } },
        result: 'Pemilik baru mengganti seluruh redaksi. Para wartawan lama mendirikan media daring yang lebih galak.',
      },
      {
        label: 'Biarkan terbit',
        fx: { nation: { approval: -4 }, heat: 10, attr: { integritas: 2 }, coalition: -3 },
        result: 'Laporannya pedas dan sebagian besar benar. Kamu membacanya dua kali, sendirian.',
      },
    ],
  },
  {
    id: 'p_jurnalis_di_sel',
    title: 'Kematian di Sel Nomor 4',
    text: 'Pemimpin redaksi yang kamu penjarakan meninggal di tahanan. Keterangan resmi: serangan jantung. Keluarganya menemukan lebam. Pemakamannya dihadiri puluhan ribu orang yang tak pernah membaca majalahnya.',
    when: pres({ flags: ['penjarakan_jurnalis'] }),
    choices: [
      {
        label: 'Autopsi independen, cabut undang-undangnya',
        fx: { nation: { approval: 2, stabilitas: -2, kebahagiaan: 3 }, diplo: 6, capital: -10, coalition: -4, unflags: ['penjarakan_jurnalis', 'bungkam_pers'] },
        result: 'Terlambat untuk satu orang. Pers Nagari kembali bersuara, dan suara pertamanya adalah menggugatmu.',
      },
      {
        label: 'Pertahankan keterangan resmi',
        fx: { nation: { approval: -7, stabilitas: -4 }, diplo: -8 },
        outcomes: [
          { chance: 0.6, text: 'Kemarahan membara tanpa meledak. Wajahnya menjadi mural di seluruh negeri.', fx: { heat: 10 } },
          { chance: 0.28, text: 'Serikat Atlantika menjatuhkan sanksi pribadi: asetmu di luar negeri dibekukan.', fx: { money: -6000, diplo: -6, nation: { pertumbuhan: -0.5 } } },
          { chance: 0.12, text: 'Pemakamannya berubah jadi lautan manusia yang berjalan ke istana dan tidak mau pulang.', fx: { end: 'revolusi' } },
        ],
      },
      {
        label: 'Tangkap sipir sebagai pelaku tunggal',
        fx: { nation: { approval: -4 }, heat: 8, hint: 'Sipir yang dikorbankan punya atasan, dan atasan itu punya catatan.' },
        result: 'Seorang sipir berpangkat rendah divonis. Tak ada yang percaya ia bertindak sendiri.',
      },
    ],
  },
  {
    id: 'p_kpk_lumpuh',
    title: 'Pesta Tanpa Penjaga',
    text: 'Sejak komisi antikorupsi kamu lumpuhkan, laporan dari daerah seragam: pungli naik, proyek fiktif menjamur. Kini giliran menteri-menterimu sendiri yang terang-terangan memalak investor.',
    when: pres({ flags: ['lemahkan_kpk'] }),
    weight: 3,
    once: true,
    choices: [
      {
        label: 'Biarkan. Semua kebagian, semua tenang',
        fx: { nation: { korupsi: 5, pertumbuhan: -0.5, approval: -4 }, coalition: 5, money: 4000, heat: 8, hint: 'Pesta yang tak pernah usai akhirnya kehabisan makanan.' },
        result: 'Koalisimu belum pernah seakur ini. Investor asing menyebut Nagari "mahal di bawah meja".',
      },
      {
        label: 'Tertibkan lewat kejaksaan yang kamu kendalikan',
        fx: { nation: { korupsi: -2, approval: 2 }, coalition: -6, capital: -4 },
        result: 'Beberapa pejabat kecil ditangkap. Semua mengerti: korupsi boleh, asal seizinmu.',
      },
      {
        label: 'Hidupkan kembali kewenangan komisi',
        fx: { nation: { korupsi: -5, approval: 5 }, coalition: -10, capital: -10, heat: 10, unflags: ['lemahkan_kpk'], hint: 'Penjaga yang dibangunkan bisa saja mengetuk pintumu lebih dulu.' },
        result: 'Publik terkejut dan senang. Para ketua partai merasa dikhianati dua kali.',
      },
    ],
  },

  // ---------- Jejak masa lalu ----------
  {
    id: 'p_dosa_proyek_lama',
    title: 'Auditor yang Tidak Lupa',
    text: 'Seorang auditor tua dari daerah tempatmu dulu menjabat mengirim berkas ke oposisi: bukti mark-up proyek dari masa awal kariermu. "Jalan itu sudah hancur, Pak. Tanda tangan Bapak masih jelas."',
    when: pres({ flags: ['korupsi_proyek'] }),
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Akui kesalahan masa muda, kembalikan uangnya',
        fx: { money: -3000, nation: { approval: -3 }, attr: { integritas: 4 }, heat: -5, unflags: ['korupsi_proyek'] },
        result: 'Pengakuanmu mengejutkan semua orang. Sebagian menyebutmu jujur, sebagian menyebutmu maling yang tertangkap.',
      },
      {
        label: 'Sebut itu fitnah lawan politik',
        fx: { heat: 10 },
        outcomes: [
          { chance: 0.45, text: 'Berkasnya terlalu tua untuk jadi berita lama-lama. Isu tenggelam.', fx: { nation: { approval: -2 } } },
          { chance: 0.55, text: 'Mantan bawahanmu di daerah muncul sebagai saksi. Komisi antikorupsi membuka penyelidikan.', fx: { nation: { approval: -7 }, heat: 15, schedule: [{ id: 'kpk_panggil', min: 2, max: 8 }] } },
        ],
      },
      {
        label: 'Bungkam auditor itu dengan jabatan komisaris',
        fx: { nation: { korupsi: 1 }, heat: 8, attr: { integritas: -3 }, hint: 'Ia sudah mengirim salinan berkas ke lebih dari satu orang.' },
        result: 'Ia menerima jabatan itu dengan sopan. Oposisi tetap memegang salinannya.',
      },
    ],
  },
  {
    id: 'p_saksi_serangan_fajar',
    title: 'Pembagi Amplop',
    text: 'Mantan koordinator lapangan kampanyemu jatuh miskin dan sakit hati. Ia tampil di siniar populer, bercerita detail tentang amplop yang dibagikan menjelang subuh hari pemungutan suara. Ia menyimpan daftar penerimanya.',
    when: pres({ flags: ['serangan_fajar'] }),
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Bayar ia supaya meralat ceritanya',
        fx: { money: -2500, heat: 10, hint: 'Orang yang bisa dibayar untuk diam bisa dibayar lebih mahal untuk bicara.' },
        outcomes: [
          { chance: 0.6, text: 'Ia meralat: katanya waktu itu ia sedang "berhalusinasi". Tak ada yang percaya, tapi kasusnya mati.', fx: { nation: { approval: -2 } } },
          { chance: 0.4, text: 'Ia merekam penyerahan uang tutup mulutmu dan menjualnya ke televisi.', fx: { nation: { approval: -9 }, heat: 18, capital: -6, schedule: [{ id: 'skandal_terbongkar', min: 1, max: 4 }] } },
        ],
      },
      {
        label: 'Abaikan: "Semua calon juga melakukannya"',
        fx: { nation: { approval: -5, korupsi: 1 }, capital: -3 },
        result: 'Pembelaanmu jujur dengan cara yang paling buruk. Legitimasi kemenanganmu kini jadi bahan lelucon.',
      },
      {
        label: 'Dorong reformasi dana kampanye sebagai penebusan',
        need: { attrMin: { integritas: 40 } },
        fx: { nation: { approval: 2, korupsi: -2 }, coalition: -7, capital: -6, unflags: ['serangan_fajar'] },
        result: 'Partai-partai membenci gagasan itu. Publik bingung melihat pencuri memasang gembok, tapi gemboknya nyata.',
      },
    ],
  },
  {
    id: 'p_korban_kampanye_hitam',
    title: 'Lawan Lama Kembali',
    text: 'Politisi yang dulu kamu hancurkan dengan fitnah saat kampanye kini memimpin oposisi. Ia menemukan pembuat konten bayaranmu, dan orang itu bersedia bersaksi di bawah sumpah.',
    when: pres({ flags: ['kampanye_hitam'] }),
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Temui diam-diam, tawarkan rekonsiliasi dan jabatan',
        outcomes: [
          { chance: 0.5, text: 'Ia menerima jabatan duta besar di negeri yang jauh. Dendam bisa ditunda dengan gaji dolar.', fx: { capital: -4, coalition: -3, unflags: ['kampanye_hitam'] } },
          { chance: 0.5, text: 'Ia merekam tawaranmu dan memutarnya di sidang DPR.', fx: { nation: { approval: -7 }, capital: -8, heat: 10 } },
        ],
      },
      {
        label: 'Minta maaf terbuka',
        fx: { nation: { approval: -3 }, attr: { integritas: 4 }, capital: -4, unflags: ['kampanye_hitam'] },
        result: 'Ia menerima maafmu di depan kamera dengan dingin. Senjatanya tumpul, tapi ia tetap lawan.',
      },
      {
        label: 'Serang lagi dengan cara yang sama',
        fx: { heat: 10, nation: { stabilitas: -2 }, attr: { integritas: -3 }, hint: 'Trik yang sama dua kali, pada orang yang sudah mengenalnya.' },
        outcomes: [
          { chance: 0.35, text: 'Fitnah baru menempel. Oposisi sibuk membela diri.', fx: { nation: { approval: 2 }, capital: 3 } },
          { chance: 0.65, text: 'Ia sudah menunggu. Pabrik fitnahmu dibongkar lengkap dengan bukti pembayaran dari staf istana.', fx: { nation: { approval: -9 }, heat: 15, coalition: -5 } },
        ],
      },
    ],
  },
  {
    id: 'p_tagih_janji_lama',
    title: 'Spanduk dari Kampung Lama',
    text: 'Rombongan warga dari daerah yang dulu kamu pimpin datang ke istana membawa spanduk berisi janji kampanyemu yang tak pernah ditepati. Mereka berjalan kaki 300 kilometer. Kamera mengikuti sejak hari pertama.',
    when: pres({ flags: ['ingkar_janji'] }),
    weight: 3,
    once: true,
    choices: [
      {
        label: 'Terima mereka, tepati janji lama dengan anggaran pusat',
        fx: { nation: { utang: 1, approval: 4, infrastruktur: 1 }, attr: { integritas: 3 }, unflags: ['ingkar_janji'] },
        result: 'Terlambat belasan tahun, tapi jalan itu akhirnya diaspal. Daerah lain mulai menyiapkan spanduk serupa.',
      },
      {
        label: 'Terima, beri foto bersama dan janji baru',
        fx: { nation: { approval: -2 }, hint: 'Mereka sudah pernah mendengar janji darimu.' },
        result: 'Mereka pulang membawa foto berbingkai. Seorang kakek bilang ke wartawan: "Yang dulu juga begini."',
      },
      {
        label: 'Tolak menemui, sebut mereka ditunggangi',
        fx: { nation: { approval: -6, kebahagiaan: -1 }, capital: -3 },
        result: 'Gambar para petani duduk di luar pagar istana kehujanan menjadi foto terbaik tahun ini.',
      },
    ],
  },
  {
    id: 'p_mantan_napi',
    title: 'Presiden Bekas Narapidana',
    text: 'Menjelang kunjungan kenegaraan, media Serikat Atlantika menulis profil panjang tentang masa lalumu di penjara. Oposisi menyambar: "Pantaskah negeri ini dipimpin mantan napi?"',
    when: pres({ flags: ['pernah_dipenjara'] }),
    weight: 3,
    once: true,
    choices: [
      {
        label: 'Ceritakan sendiri kisahmu, tanpa ditutupi',
        need: { attrMin: { karisma: 50 } },
        fx: { nation: { approval: 5 }, attr: { integritas: 2 }, capital: 3 },
        result: 'Pidatomu tentang jatuh dan bangkit ditonton jutaan orang. Para mantan narapidana menempel fotomu di dinding.',
      },
      {
        label: 'Sebut itu kriminalisasi politik masa lalu',
        outcomes: [
          { chance: 0.5, text: 'Cukup banyak yang percaya. Di Nagari, penjara dan politik memang bertetangga.', fx: { nation: { approval: 1 } } },
          { chance: 0.5, text: 'Berkas putusan lamamu diunggah lengkap. Ceritamu tidak cocok dengan isinya.', fx: { nation: { approval: -6 }, capital: -4 } },
        ],
      },
      {
        label: 'Diam, biarkan juru bicara yang kerepotan',
        fx: { nation: { approval: -3 }, diplo: -3 },
        result: 'Kunjungan kenegaraan berlangsung canggung. Jamuan makan malam dipersingkat.',
      },
    ],
  },
  {
    id: 'p_dinasti_menuntut',
    title: 'Rapat Keluarga Besar',
    text: 'Para tetua keluarga besarmu berkumpul. Nama keluarga yang mengantarmu ke istana kini meminta bagian: sepupu jadi menteri, keponakan jadi calon gubernur, paman jadi ketua partai. "Darah lebih kental dari konstitusi," kata bibimu.',
    when: pres({ flags: ['latar:dinasti'] }),
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Penuhi semua. Keluarga adalah benteng',
        fx: { nation: { korupsi: 4, approval: -6 }, coalition: -6, attr: { jaringan: 4, integritas: -4 }, flags: ['dinasti_berkuasa'], schedule: [{ id: 'p_dinasti_skandal', min: 8, max: 24 }], hint: 'Semakin banyak kerabat di kursi empuk, semakin banyak yang bisa tersandung.' },
        result: 'Foto pelantikan tampak seperti foto reuni keluarga. Partai-partai koalisi kehilangan jatah dan mulai menggerutu.',
      },
      {
        label: 'Beri satu jabatan saja, yang paling layak',
        fx: { nation: { approval: -2, korupsi: 1 }, attr: { stres: 3 } },
        result: 'Satu sepupu dilantik. Sisanya pulang sambil mengingat-ingat siapa yang dulu membiayai sekolahmu.',
      },
      {
        label: 'Tolak semuanya',
        fx: { nation: { approval: 4 }, attr: { integritas: 4, jaringan: -6, stres: 5 }, capital: -4 },
        result: 'Kamu memutus rantai, kata editorial. Kamu anak durhaka, kata grup percakapan keluarga.',
      },
    ],
  },
  {
    id: 'p_dinasti_skandal',
    title: 'Keponakan di Kelab Malam',
    text: 'Keponakanmu yang kamu angkat jadi pejabat menabrak tiga orang dengan mobil dinas sepulang dari kelab malam. Seorang korban tewas. Polisi menunggu "arahan" sebelum menetapkan tersangka.',
    when: pres({ flags: ['dinasti_berkuasa'] }),
    choices: [
      {
        label: 'Serahkan ke hukum, copot dari jabatan',
        fx: { nation: { approval: 2 }, attr: { integritas: 3, jaringan: -3, stres: 4 }, unflags: ['dinasti_berkuasa'] },
        result: 'Keponakanmu ditahan. Keluarga besar menggelar rapat tanpa mengundangmu.',
      },
      {
        label: 'Sopirnya yang mengaku menyetir',
        fx: { nation: { approval: -6, korupsi: 2 }, heat: 15, money: -1000, hint: 'Kamera pengawas di kelab malam itu milik swasta.' },
        outcomes: [
          { chance: 0.4, text: 'Sopir itu masuk penjara dengan imbalan rumah untuk keluarganya. Kasus ditutup.', fx: {} },
          { chance: 0.6, text: 'Rekaman kamera pengawas viral: keponakanmu keluar dari kursi pengemudi, sempoyongan.', fx: { nation: { approval: -8, stabilitas: -3 }, heat: 12, capital: -6 } },
        ],
      },
      {
        label: 'Damai dengan keluarga korban lewat uang',
        fx: { money: -3000, nation: { approval: -4 }, heat: 8 },
        result: 'Keluarga korban menerima santunan dan menandatangani surat damai. Warganet tidak ikut tanda tangan.',
      },
    ],
  },
  {
    id: 'p_bisnis_keluarga',
    title: 'Konflik Kepentingan',
    text: 'Grup usaha keluargamu, yang membesarkanmu, mengajukan diri sebagai pemasok utama program makan sekolah nasional. Harganya wajar. Masalahnya hanya satu: nama belakang pemiliknya sama dengan namamu.',
    when: pres({ flags: ['latar:kaya'] }),
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Biarkan ikut dan menang',
        fx: { money: 10000, nation: { korupsi: 3, approval: -4 }, heat: 12, attr: { integritas: -3 }, schedule: [{ id: 'skandal_terbongkar', min: 8, max: 24, chance: 0.7 }], hint: 'Harga wajar hari ini, adendum kontrak tahun depan.' },
        result: 'Kontrak diteken. Laba grup keluarga naik tiga kali lipat, dan oposisi mulai mengumpulkan faktur.',
      },
      {
        label: 'Larang grup keluarga ikut semua proyek negara',
        fx: { money: -2000, nation: { approval: 4 }, attr: { integritas: 4, jaringan: -3 } },
        result: 'Ayahmu menelepon dan tidak bicara lama. Publik mencatat, untuk kali ini dengan hormat.',
      },
      {
        label: 'Pakai perusahaan perantara dengan nama lain',
        fx: { money: 7000, nation: { korupsi: 2 }, heat: 18, attr: { integritas: -5 }, hint: 'Akta perusahaan bisa dibuka siapa saja yang mau membayar notaris.' },
        result: 'Di atas kertas tak ada hubungan apa-apa. Di atas kertas.',
      },
    ],
  },

  // =====================================================================
  // MILITER
  // =====================================================================
  {
    id: 'p_jenderal_gelisah',
    title: 'Para Jenderal Gelisah',
    text: 'Panglima meminta bertemu empat mata. Ia bicara tentang "keprihatinan keluarga besar tentara" atas kekacauan di jalan dan "lemahnya kepemimpinan sipil". Ia tidak mengancam. Ia hanya tidak tersenyum.',
    when: pres({ nationMax: { stabilitas: 40 } }),
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Beri mereka jabatan sipil dan jatah bisnis',
        fx: { nation: { stabilitas: 3, korupsi: 3, militer: 1, approval: -3 }, capital: -4, flags: ['manjakan_jenderal'], schedule: [{ id: 'p_jenderal_minta_lagi', min: 10, max: 24 }], hint: 'Tentara yang dibiasakan berbisnis sulit disuruh kembali baris-berbaris.' },
        result: 'Para perwira aktif kini duduk di kementerian dan BUMN. Barak tenang, kantor-kantor sipil tidak.',
      },
      {
        label: 'Ganti panglima dengan orang kepercayaanmu',
        outcomes: [
          { chance: 0.55, text: 'Pergantian berjalan mulus. Panglima baru berutang karier kepadamu.', fx: { nation: { stabilitas: 3 }, capital: 5 } },
          { chance: 0.45, text: 'Korps perwira tersinggung. Bisik-bisik di markas besar makin keras.', fx: { nation: { stabilitas: -3, militer: -2 }, capital: -5, schedule: [{ id: 'p_isu_kudeta', min: 2, max: 8 }] } },
        ],
      },
      {
        label: 'Tegaskan: tentara tunduk pada sipil. Titik',
        fx: { nation: { approval: 3 }, attr: { integritas: 2 }, capital: -3, schedule: [{ id: 'p_isu_kudeta', min: 3, max: 12, chance: 0.6 }], hint: 'Ia memberi hormat sebelum pergi. Hormatnya terlalu sempurna.' },
        result: 'Panglima mendengarkan sampai selesai, memberi hormat, dan pergi tanpa sepatah kata.',
      },
    ],
  },
  {
    id: 'p_jenderal_minta_lagi',
    title: 'Dwifungsi Jilid Dua',
    text: 'Para jenderal yang kamu manjakan kini mengusulkan undang-undang: perwira aktif boleh menduduki jabatan sipil mana pun, dan anggaran tentara tak perlu diaudit. "Demi stabilitas," kata mereka, sudah seperti semboyan.',
    when: pres({ flags: ['manjakan_jenderal'] }),
    choices: [
      {
        label: 'Sahkan',
        fx: { nation: { stabilitas: 3, korupsi: 5, approval: -6, kebahagiaan: -3 }, diplo: -5, coalition: -4, hint: 'Kamu sedang memerintah atas izin mereka.' },
        result: 'Seragam loreng kini terlihat di setiap kantor pemerintahan. Kamu masih presiden, secara resmi.',
      },
      {
        label: 'Tolak dan tarik kembali perwira dari jabatan sipil',
        fx: { nation: { approval: 4, korupsi: -2, stabilitas: -4 }, capital: -8, unflags: ['manjakan_jenderal'], schedule: [{ id: 'p_isu_kudeta', min: 2, max: 8 }] },
        result: 'Mereka kembali ke barak dengan enggan, membawa pulang rasa terhina dan rasa manis yang dulu kamu ajarkan.',
      },
      {
        label: 'Ulur: bentuk panitia kajian yang tak pernah selesai',
        need: { attrMin: { kecerdasan: 55 } },
        fx: { capital: -4, attr: { stres: 3 } },
        result: 'Panitia mengkaji dengan sangat teliti dan sangat lambat. Para jenderal tahu kamu bermain waktu, tapi belum mau bergerak.',
      },
    ],
  },
  {
    id: 'p_isu_kudeta',
    title: 'Pergerakan Pasukan Tanpa Perintah',
    text: 'Pukul dua dini hari, kepala intelijen membangunkanmu. Satu batalion lapis baja bergerak ke ibu kota tanpa perintah resmi. Stasiun televisi negara dijaga tentara yang tidak kamu kirim.',
    when: pres(),
    choices: [
      {
        label: 'Siaran langsung dari istana, panggil rakyat turun ke jalan',
        need: { attrMin: { karisma: 55 } },
        outcomes: [
          { chance: 0.6, text: 'Ratusan ribu orang mengepung tank dengan tangan kosong. Para perwira ragu, lalu mundur.', fx: { nation: { approval: 8, stabilitas: -3 }, capital: 10 } },
          { chance: 0.4, text: 'Sinyal siaran diputus di kalimat ketiga. Pintu ruang kerjamu didobrak sebelum fajar.', fx: { end: 'dikudeta' } },
        ],
      },
      {
        label: 'Hubungi komandan pasukan yang masih setia',
        outcomes: [
          { chance: 0.55, text: 'Pasukan khusus setia mencegat konvoi di jalan tol. Para perwira pembangkang ditangkap.', fx: { nation: { stabilitas: -4, militer: -4 }, capital: 6 } },
          { chance: 0.25, text: 'Baku tembak pecah di tengah kota. Kamu menang, dengan puluhan korban dan tentara yang terbelah.', fx: { nation: { stabilitas: -6, militer: -6, approval: -5 }, diplo: -4 } },
          { chance: 0.2, text: 'Komandan yang kamu telepon ternyata bagian dari rencana itu.', fx: { end: 'dikudeta' } },
        ],
      },
      {
        label: 'Berunding: tawarkan apa pun yang mereka mau',
        fx: { nation: { stabilitas: 2, korupsi: 4, approval: -5 }, capital: -15, flags: ['manjakan_jenderal'], hint: 'Presiden yang pernah ditodong akan ditodong lagi.' },
        result: 'Tank berbalik arah menjelang subuh. Daftar tuntutan mereka kamu tanda tangani tanpa membaca halaman terakhir.',
      },
    ],
  },
  {
    id: 'p_alutsista',
    title: 'Belanja Jet Tempur',
    text: 'Angkatan udara butuh skuadron baru. Ada dua tawaran: jet baru dari Serikat Atlantika, mahal dan penuh syarat; atau jet bekas lewat broker yang menjanjikan "biaya konsultasi" untuk pengambil keputusan.',
    when: pres(),
    weight: 2,
    choices: [
      {
        label: 'Beli baru, antarpemerintah, tanpa perantara',
        fx: { nation: { militer: 5, utang: 3 }, diplo: 3 },
        result: 'Mahal dan bersih. Para broker senjata di ibu kota kehilangan satu musim panen.',
      },
      {
        label: 'Beli lewat broker, terima "biaya konsultasi"',
        fx: { nation: { militer: 3, utang: 2, korupsi: 2 }, money: 9000, heat: 15, attr: { integritas: -4 }, schedule: [{ id: 'p_jet_jatuh', min: 8, max: 24, chance: 0.75 }], hint: 'Pesawat bekas menyimpan riwayat yang tidak tertulis di brosur.' },
        result: 'Kontrak diteken di hotel, bukan di kementerian. Jet datang dengan cat baru dan mesin lama.',
      },
      {
        label: 'Tunda. Sekolah dan rumah sakit lebih mendesak',
        fx: { nation: { militer: -3, approval: 2 }, capital: -3 },
        result: 'Guru-guru senang. Para marsekal menghitung sisa jam terbang pesawat tua mereka dengan cemas.',
      },
    ],
  },
  {
    id: 'p_jet_jatuh',
    title: 'Jet Jatuh di Hari Parade',
    text: 'Satu jet bekas dari kontrak brokermu jatuh saat parade hari kemerdekaan, di depan tribun kehormatan. Pilotnya gugur. Jandanya bertanya di televisi siapa yang memilih pesawat itu.',
    when: pres(),
    choices: [
      {
        label: 'Buka audit pengadaan sepenuhnya',
        fx: { nation: { approval: -3, militer: -2 }, heat: 15, attr: { integritas: 3 }, schedule: [{ id: 'kpk_panggil', min: 3, max: 9, chance: 0.6 }] },
        result: 'Audit dimulai. Kamu tahu apa yang akan mereka temukan, dan di rekening siapa.',
      },
      {
        label: 'Nyatakan "kesalahan pilot"',
        fx: { nation: { approval: -6, militer: -3, stabilitas: -2 }, heat: 8, hint: 'Rekan-rekan satu skuadronnya tahu ia pilot terbaik mereka.' },
        result: 'Angkatan udara menerima pernyataan itu dalam diam. Diam yang dingin.',
      },
      {
        label: 'Salahkan broker, batalkan kontrak',
        outcomes: [
          { chance: 0.5, text: 'Broker itu kabur ke luar negeri dan memilih tutup mulut.', fx: { nation: { approval: -2, militer: -2 }, heat: 5 } },
          { chance: 0.5, text: 'Broker itu tidak mau jatuh sendirian. Ia membuka catatan "biaya konsultasi".', fx: { nation: { approval: -8 }, heat: 20, schedule: [{ id: 'skandal_terbongkar', min: 1, max: 4 }] } },
        ],
      },
    ],
  },

  // =====================================================================
  // LUAR NEGERI
  // =====================================================================
  {
    id: 'p_insiden_laut',
    title: 'Insiden di Perairan Sengketa',
    text: 'Kapal patroli Malaka Raya menabrak kapal penjaga pantaimu di perairan sengketa. Dua awak hilang. Kedua negara mengklaim lawan yang memasuki wilayahnya. Rakyat menuntut balasan.',
    when: pres({ atWar: false }),
    weight: 3,
    choices: [
      {
        label: 'Kirim armada untuk unjuk kekuatan',
        fx: { nation: { approval: 5, militer: -1 }, diplo: -5, hint: 'Dua armada yang saling menatap hanya butuh satu kapten gugup.' },
        outcomes: [
          { chance: 0.65, text: 'Malaka Raya menarik kapalnya. Kamu dielu-elukan sebagai pemimpin bernyali.', fx: { nation: { approval: 3 }, capital: 4 } },
          { chance: 0.35, text: 'Tembakan peringatan mengenai sasaran. Sebuah kapal tenggelam, dan krisis berubah serius.', fx: { nation: { stabilitas: -3, pertumbuhan: -0.4 }, diplo: -6, capital: -4 } },
        ],
      },
      {
        label: 'Bawa ke mahkamah internasional',
        fx: { nation: { approval: -3 }, diplo: 5, capital: -2 },
        result: 'Proses hukum akan makan bertahun-tahun. Di warung kopi kamu disebut penakut, di forum dunia disebut dewasa.',
      },
      {
        label: 'Telepon langsung perdana menteri Malaka Raya',
        need: { attrMin: { karisma: 50 } },
        fx: { nation: { approval: 1 }, diplo: 3 },
        result: 'Kalian sepakat mencari awak yang hilang bersama dan menyalahkan kabut. Kabut tidak membantah.',
      },
    ],
  },
  {
    id: 'p_nelayan_ditangkap',
    title: 'Nelayan Disandera',
    text: 'Dua puluh nelayan Nagari ditangkap perompak dari Kesultanan Sulu Raya. Mereka minta tebusan. Istri-istri nelayan berkemah di depan kementerian luar negeri.',
    when: pres(),
    weight: 3,
    choices: [
      {
        label: 'Bayar tebusan diam-diam',
        fx: { nation: { utang: 1, approval: 3 }, hint: 'Harga pasar seorang nelayan Nagari baru saja ditetapkan.' },
        result: 'Para nelayan pulang dan disambut tangis. Para perompak menandai perairanmu sebagai ladang yang subur.',
      },
      {
        label: 'Operasi pembebasan pasukan khusus',
        outcomes: [
          { chance: 0.55, text: 'Operasi bersih. Semua sandera selamat, dan videonya jadi tontonan wajib.', fx: { nation: { approval: 7, militer: 1 }, capital: 5 } },
          { chance: 0.45, text: 'Baku tembak kacau. Enam nelayan dan dua prajurit tewas.', fx: { nation: { approval: -6, militer: -1 }, diplo: -4, capital: -4 } },
        ],
      },
      {
        label: 'Tekan Kesultanan lewat jalur diplomatik',
        fx: { nation: { approval: -2 }, diplo: 2, attr: { stres: 2 } },
        result: 'Empat bulan perundingan. Para nelayan pulang kurus, dan istri mereka tidak mengucapkan terima kasih.',
      },
    ],
  },
  {
    id: 'p_tekanan_ham',
    title: 'Surat dari Atlantika',
    text: 'Serikat Atlantika mengirim "catatan keprihatinan" soal kebebasan sipil di Nagari, disertai isyarat: fasilitas dagang bisa dicabut. Duta besarnya meminta bertemu, membawa daftar nama tahanan.',
    when: pres({ flags: ['bungkam_pers'] }),
    weight: 3,
    choices: [
      {
        label: 'Bebaskan beberapa tahanan sebagai isyarat baik',
        fx: { nation: { approval: 1, kebahagiaan: 1 }, diplo: 6, capital: -4, coalition: -3 },
        result: 'Lima nama dibebaskan. Atlantika puas untuk sementara, kelompok garis keras menyebutmu tunduk pada asing.',
      },
      {
        label: 'Tolak campur tangan dengan pidato berapi-api',
        fx: { nation: { approval: 4, pertumbuhan: -0.5 }, diplo: -8 },
        result: 'Pidatomu disambut gegap gempita. Fasilitas dagang dicabut, dan pabrik garmen mulai menghitung ulang.',
      },
      {
        label: 'Merapat ke Tiongkara sebagai penyeimbang',
        fx: { nation: { pertumbuhan: 0.3, utang: 2 }, diplo: -4, hint: 'Pelindung baru tidak bertanya soal HAM. Ia bertanya soal lain.' },
        result: 'Tiongkara menyambutmu tanpa pertanyaan. Tagihannya akan datang dalam bentuk yang berbeda.',
      },
    ],
  },
  {
    id: 'p_ktt_kawasan',
    title: 'Tuan Rumah KTT Kawasan',
    text: 'Nagari jadi tuan rumah KTT kawasan. Tiongkara dan Serikat Atlantika sama-sama mendesakmu memasukkan kalimat mereka soal laut sengketa ke pernyataan bersama. Kedua kalimat itu saling meniadakan.',
    when: pres(),
    weight: 2,
    choices: [
      {
        label: 'Rumuskan kalimat tengah yang tak menyinggung siapa pun',
        need: { attrMin: { kecerdasan: 60 } },
        fx: { diplo: 6, nation: { approval: 3 }, capital: 4 },
        result: 'Pernyataan bersama terbit pukul tiga pagi. Tak ada yang menang, dan itulah kemenanganmu.',
      },
      {
        label: 'Condong ke Tiongkara',
        fx: { nation: { pertumbuhan: 0.4 }, diplo: -4, hint: 'Memilih satu raksasa berarti memunggungi raksasa lain.' },
        result: 'Tiongkara menjanjikan investasi baru. Delegasi Atlantika pulang sebelum jamuan penutup.',
      },
      {
        label: 'Condong ke Serikat Atlantika',
        fx: { nation: { militer: 2 }, diplo: -4 },
        result: 'Atlantika menjanjikan latihan militer bersama. Tiongkara mendadak menemukan "hama" di buah ekspormu.',
      },
      {
        label: 'Fokus pada jamuan dan foto bersama',
        fx: { nation: { approval: 1, utang: 1 }, diplo: 1 },
        result: 'Batiknya bagus, makanannya enak, pernyataan bersamanya kosong. KTT yang sukses menurut standar umum.',
      },
    ],
  },
  {
    id: 'p_pangkalan_asing',
    title: 'Tawaran Pangkalan',
    text: 'Serikat Atlantika menawarkan paket: bantuan militer besar, jet tempur hibah, dan jaminan keamanan. Imbalannya, mereka menyewa satu pulau terluarmu untuk pangkalan "logistik" selama 50 tahun.',
    when: pres({ notFlags: ['pangkalan_asing'] }),
    weight: 2,
    once: true,
    choices: [
      {
        label: 'Terima',
        fx: { nation: { militer: 6, approval: -5, utang: -2 }, diplo: -5, coalition: -6, flags: ['pangkalan_asing'], schedule: [{ id: 'p_pangkalan_insiden', min: 10, max: 28 }], hint: 'Ribuan tentara asing akan tinggal di tengah wargamu, dengan hukum mereka sendiri.' },
        result: 'Bendera asing berkibar di pulau terluar. Tiongkara memanggil duta besarmu, kaum nasionalis membakar fotomu.',
      },
      {
        label: 'Tawar: latihan bersama saja, tanpa pangkalan',
        fx: { nation: { militer: 2 }, diplo: 2, capital: -3 },
        result: 'Atlantika kecewa tapi setuju. Kamu mendapat sedikit, dan tidak menjual apa pun.',
      },
      {
        label: 'Tolak dan umumkan Nagari bebas pangkalan asing',
        fx: { nation: { approval: 5 }, coalition: 4, diplo: -3 },
        result: 'Tepuk tangan di dalam negeri. Atlantika mulai melirik Malaka Raya untuk tawaran yang sama.',
      },
    ],
  },
  {
    id: 'p_pangkalan_insiden',
    title: 'Insiden di Pulau Pangkalan',
    text: 'Seorang prajurit Atlantika di pangkalan sewaan membunuh perempuan warga pulau. Menurut perjanjian yang kamu teken, ia hanya bisa diadili di negaranya. Ia sudah diterbangkan pulang.',
    when: pres({ flags: ['pangkalan_asing'] }),
    choices: [
      {
        label: 'Tuntut ia diekstradisi, ancam batalkan perjanjian',
        outcomes: [
          { chance: 0.4, text: 'Atlantika mengalah demi pangkalannya. Si prajurit diadili di Nagari.', fx: { nation: { approval: 6 }, capital: 5, diplo: -2 } },
          { chance: 0.6, text: 'Atlantika menolak. Kamu harus memilih: menelan ludah atau mengusir mereka.', fx: { nation: { approval: -5, stabilitas: -3 }, capital: -5, diplo: -4 } },
        ],
      },
      {
        label: 'Usir pangkalan itu',
        fx: { nation: { approval: 8, militer: -5, pertumbuhan: -0.5 }, diplo: -8, unflags: ['pangkalan_asing'] },
        result: 'Kapal terakhir mereka angkat sauh diiringi sorakan. Bantuan militer berhenti, sanksi dagang menyusul.',
      },
      {
        label: 'Terima santunan dan permintaan maaf tertulis',
        fx: { nation: { approval: -8, stabilitas: -3, kebahagiaan: -2 }, coalition: -5 },
        result: 'Keluarga korban menerima amplop dan selembar surat berbahasa asing. Demonstrasi mengepung kedutaan sebulan penuh.',
      },
    ],
  },
  {
    id: 'p_pengungsi',
    title: 'Perahu di Cakrawala',
    text: 'Ratusan pengungsi dari negeri yang dilanda perang terkatung-katung di lepas pantaimu. Perahu mereka bocor, air minum habis. Warga pesisir terbelah: sebagian membawa nasi, sebagian membawa spanduk penolakan.',
    when: pres(),
    weight: 2,
    choices: [
      {
        label: 'Izinkan mendarat dan tampung',
        fx: { nation: { approval: -3, utang: 1 }, diplo: 6, attr: { integritas: 2 } },
        result: 'Anak-anak digendong turun dari perahu. Dunia memujimu, sebagian warga bertanya kenapa orang asing diberi makan lebih dulu.',
      },
      {
        label: 'Beri bekal, dorong kembali ke laut',
        fx: { nation: { approval: 2 }, diplo: -6, attr: { integritas: -3 }, hint: 'Laut tidak selalu mengantar perahu ke tempat lain.' },
        outcomes: [
          { chance: 0.6, text: 'Perahu itu menghilang di cakrawala. Bukan lagi urusanmu, secara teknis.', fx: {} },
          { chance: 0.4, text: 'Perahu itu tenggelam dua hari kemudian. Jenazah terdampar di pantai wisata.', fx: { nation: { approval: -5, kebahagiaan: -2 }, diplo: -6 } },
        ],
      },
      {
        label: 'Tampung sementara, minta Australis ikut menanggung',
        need: { attrMin: { kecerdasan: 50 } },
        fx: { diplo: 3, nation: { approval: -1 }, capital: -3 },
        result: 'Australis setuju membiayai kamp, asal kamp itu tetap jauh dari pantai mereka.',
      },
    ],
  },

  // =====================================================================
  // PERANG
  // =====================================================================
  {
    id: 'p_perang_korban_sipil',
    title: 'Peluru yang Salah Alamat',
    text: 'Serangan udaramu menghantam pasar, bukan gudang amunisi. Puluhan warga sipil musuh tewas. Baru staf jenderalmu yang tahu. Rekamannya ada di satu ponsel prajurit.',
    when: pres({ atWar: true }),
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Umumkan, minta maaf, selidiki',
        fx: { nation: { approval: -4, militer: -2 }, diplo: 4, attr: { integritas: 3 } },
        result: 'Musuh memakai pengakuanmu untuk propaganda. Dunia mencatat bahwa setidaknya kamu tidak berbohong.',
      },
      {
        label: 'Tutupi. Sita ponsel itu',
        fx: { heat: 10, attr: { integritas: -4 }, flags: ['tutupi_korban_sipil'], schedule: [{ id: 'p_perang_bukti_bocor', min: 4, max: 16 }], hint: 'Rekaman digital jarang hanya punya satu salinan.' },
        result: 'Laporan resmi menyebut "sasaran militer hancur". Prajurit pemilik ponsel dipindahkan ke garis depan.',
      },
      {
        label: 'Tuduh musuh memakai warga sebagai tameng',
        fx: { nation: { approval: 2 }, diplo: -5, flags: ['tutupi_korban_sipil'], schedule: [{ id: 'p_perang_bukti_bocor', min: 6, max: 18, chance: 0.7 }] },
        result: 'Di dalam negeri, ceritamu dipercaya. Pemantau internasional meminta akses ke lokasi.',
      },
    ],
  },
  {
    id: 'p_perang_bukti_bocor',
    title: 'Rekaman dari Pasar',
    text: 'Rekaman serangan ke pasar itu sampai ke media dunia, beserta perintah tertulis untuk merahasiakannya. Kata "kejahatan perang" kini disandingkan dengan namamu.',
    when: pres({ flags: ['tutupi_korban_sipil'] }),
    choices: [
      {
        label: 'Serahkan komandan lapangan ke pengadilan militer',
        fx: { nation: { militer: -3, approval: -4, stabilitas: -2 }, diplo: 2, capital: -5, unflags: ['tutupi_korban_sipil'] },
        result: 'Seorang kolonel menanggung semuanya. Para perwira lain belajar bahwa presiden tidak berdiri di belakang mereka.',
      },
      {
        label: 'Bantah keasliannya',
        fx: { nation: { approval: -3, pertumbuhan: -0.6 }, diplo: -10, heat: 8 },
        result: 'Empat negara menjatuhkan sanksi. Perjalanan luar negerimu kini harus memperhitungkan surat penangkapan.',
      },
      {
        label: 'Akui dan tawarkan ganti rugi kepada keluarga korban',
        fx: { nation: { approval: -6, utang: 1 }, diplo: 5, attr: { integritas: 4 }, capital: -6, unflags: ['tutupi_korban_sipil'] },
        result: 'Pengakuan yang terlambat tetap pengakuan. Sebagian pasukanmu merasa dikhianati, sebagian lega.',
      },
    ],
  },
  {
    id: 'p_gencatan_senjata',
    title: 'Utusan Gencatan Senjata',
    text: 'Temasik menawarkan diri sebagai penengah. Musuh bersedia gencatan senjata jika garis depan dibekukan seperti sekarang. Para jenderalmu yakin kemenangan tinggal selangkah. Para ibu prajurit tidak peduli soal langkah.',
    when: pres({ atWar: true }),
    weight: 3,
    choices: [
      {
        label: 'Sambut dan buka perundingan',
        fx: { nation: { approval: 3, stabilitas: 3, kebahagiaan: 2 }, diplo: 6, capital: -5, coalition: -3 },
        result: 'Senjata diam untuk pertama kali dalam berbulan-bulan. Kaum garis keras menyebutmu menyerah saat hampir menang.',
      },
      {
        label: 'Tolak. Perang diselesaikan di medan perang',
        fx: { nation: { militer: -2, utang: 2, approval: -2 }, diplo: -5, hint: 'Kemenangan yang tinggal selangkah bisa jadi langkah yang sangat panjang.' },
        result: 'Utusan Temasik pulang dengan tangan kosong. Daftar nama di koran pagi bertambah panjang.',
      },
      {
        label: 'Pura-pura berunding sambil menyusun serangan',
        fx: { diplo: -4, attr: { integritas: -3 } },
        outcomes: [
          { chance: 0.5, text: 'Serangan mendadakmu merebut wilayah penting. Curang, dan berhasil.', fx: { nation: { approval: 4, militer: -1 }, capital: 4 } },
          { chance: 0.5, text: 'Musuh sudah menduga. Seranganmu gagal, dan tak ada lagi yang mau menengahi.', fx: { nation: { approval: -5, militer: -4 }, diplo: -6 } },
        ],
      },
    ],
  },
  {
    id: 'p_propaganda_perang',
    title: 'Kabar dari Garis Depan',
    text: 'Perang berjalan lebih buruk dari yang diberitakan. Menteri penerangan mengusulkan "penyelarasan informasi": hanya kabar kemenangan yang boleh terbit, sisanya dianggap membantu musuh.',
    when: pres({ atWar: true }),
    weight: 3,
    once: true,
    choices: [
      {
        label: 'Setuju. Moral rakyat adalah senjata',
        fx: { nation: { approval: 5, stabilitas: 2 }, heat: 6, flags: ['propaganda_perang'], hint: 'Peti jenazah yang pulang ke kampung tidak bisa disensor.' },
        result: 'Setiap malam televisi mengabarkan kemenangan. Di desa-desa, pemakaman prajurit makin sering.',
      },
      {
        label: 'Tolak. Rakyat berhak tahu',
        fx: { nation: { approval: -4, stabilitas: -2 }, attr: { integritas: 3 } },
        result: 'Kabar buruk terbit apa adanya. Dukungan pada perang merosot, kepercayaan pada kata-katamu tidak.',
      },
      {
        label: 'Sensor angka korban saja',
        fx: { nation: { approval: 2 }, heat: 4 },
        result: 'Berita tetap terbit, tanpa angka. Rakyat mulai menghitung sendiri dari jumlah bendera setengah tiang.',
      },
    ],
  },
  {
    id: 'p_propaganda_runtuh',
    title: 'Kemenangan yang Tidak Ada',
    text: 'Seorang prajurit yang pulang tanpa kaki bersaksi di siaran langsung: kota yang diumumkan "direbut" bulan lalu tak pernah jatuh. Ribuan keluarga prajurit menyadari mereka dibohongi setiap malam.',
    when: pres({ atWar: true, flags: ['propaganda_perang'] }),
    weight: 3,
    once: true,
    choices: [
      {
        label: 'Copot menteri penerangan, buka data sebenarnya',
        fx: { nation: { approval: -5, stabilitas: -2 }, coalition: -4, unflags: ['propaganda_perang'] },
        result: 'Angka yang sebenarnya lebih buruk dari desas-desus. Setidaknya kebohongan berhenti malam ini.',
      },
      {
        label: 'Tangkap prajurit itu atas tuduhan menyebar kabar bohong',
        fx: { nation: { approval: -8, stabilitas: -4, militer: -3 }, hint: 'Rekan-rekannya di garis depan menonton siaran yang sama.' },
        result: 'Seorang veteran cacat digiring polisi militer di depan kamera. Di barak-barak, gambarnya ditonton dalam diam.',
      },
      {
        label: 'Gandakan propaganda',
        fx: { nation: { approval: -4, kebahagiaan: -3 }, heat: 8 },
        result: 'Televisi bersorak lebih keras. Semakin sedikit yang menonton.',
      },
    ],
  },
  {
    id: 'p_desersi',
    title: 'Satu Kompi Menghilang',
    text: 'Satu kompi wajib militer meninggalkan pos dan pulang kampung. Mereka belum digaji tiga bulan dan ransum mereka dijual perwiranya. Panglima meminta izin menghukum mati para pemimpinnya sebagai contoh.',
    when: pres({ atWar: true }),
    weight: 3,
    choices: [
      {
        label: 'Izinkan hukuman mati',
        fx: { nation: { militer: 2, approval: -5, kebahagiaan: -3 }, diplo: -4, hint: 'Prajurit yang takut pada komandannya tidak selalu menembak ke arah musuh.' },
        result: 'Lima pemuda desa ditembak regu sendiri. Desersi berhenti. Yang tersisa di parit adalah rasa takut dan dendam.',
      },
      {
        label: 'Ampuni mereka, adili perwira pencuri ransum',
        fx: { nation: { militer: 1, approval: 4, korupsi: -1 }, capital: -4 },
        result: 'Prajurit kembali ke pos dengan gaji dibayar. Beberapa kolonel kehilangan pangkat dan mulai membencimu.',
      },
      {
        label: 'Bayar gaji tertunggak, lupakan sisanya',
        fx: { nation: { utang: 1, militer: -1 } },
        result: 'Masalah hari ini selesai. Perwira yang menjual ransum tetap di tempatnya.',
      },
    ],
  },

  // =====================================================================
  // KEKUASAAN & AKHIR PERIODE
  // =====================================================================
  {
    id: 'p_dekrit_berlarut',
    title: 'Darurat yang Tak Kunjung Usai',
    text: 'Keadaan darurat sudah berjalan lama. Ketertiban pulih, begitu juga keberanian orang untuk bertanya: kapan dicabut? Para jenderal dan menteri yang menikmati kewenangan baru menyarankan "jangan terburu-buru".',
    when: pres({ flags: ['dekrit_darurat'], notFlags: ['diktator'] }),
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Cabut dekrit, kembalikan kewenangan DPR',
        fx: { nation: { approval: 6, stabilitas: -3, kebahagiaan: 4 }, diplo: 8, capital: -8, unflags: ['dekrit_darurat'] },
        result: 'Kamu mengembalikan kekuasaan yang kamu pinjam. Jarang terjadi, dan sejarah akan mencatatnya.',
      },
      {
        label: 'Perpanjang "sampai situasi kondusif"',
        fx: { nation: { approval: -5, kebahagiaan: -3, korupsi: 3 }, diplo: -6, schedule: [{ id: 'p_rakyat_melawan', min: 8, max: 20, chance: 0.7 }], hint: 'Rakyat bisa sabar pada darurat. Tidak pada darurat yang abadi.' },
        result: 'Tak ada yang tahu arti "kondusif", dan memang itu tujuannya.',
      },
      {
        label: 'Perpanjang dan tangkapi para pengkritiknya',
        fx: { nation: { approval: -8, stabilitas: 3, kebahagiaan: -5 }, diplo: -10, heat: 10, schedule: [{ id: 'p_rakyat_melawan', min: 5, max: 14 }] },
        result: 'Penjara penuh dosen, wartawan, dan pelawak. Negeri ini sunyi, sunyi yang menahan napas.',
      },
    ],
  },
  {
    id: 'p_perpanjang_kekuasaan',
    title: 'Bisikan Tiga Periode',
    text: 'Para ketua partai dan beberapa taipan datang dengan usul yang sama: tunda pemilu dua tahun "demi kesinambungan pembangunan". Relawan sudah menyiapkan spanduk. "Rakyat yang meminta, Pak," kata mereka, sambil menyodorkan hasil survei pesanan.',
    when: pres({ notFlags: ['diktator', 'tunda_pemilu'] }),
    weight: 2,
    once: true,
    choices: [
      {
        label: 'Tolak tegas di depan publik',
        fx: { nation: { approval: 5, stabilitas: 2 }, attr: { integritas: 4 }, coalition: -5, diplo: 3 },
        result: 'Kamu menutup pintu itu rapat-rapat. Para pembisik kecewa dan mulai mencari calon penggantimu.',
      },
      {
        label: 'Jawab mengambang: "Saya taat konstitusi"',
        fx: { nation: { approval: -3, stabilitas: -2 }, capital: 3, hint: 'Kalimat yang bisa dibaca dua arah akan dibaca ke arah terburuk.' },
        result: 'Kalimatmu ditafsirkan sebagai lampu kuning. Spanduk relawan mulai terpasang, mahasiswa mulai rapat.',
      },
      {
        label: 'Dorong penundaan pemilu',
        need: { notFlags: ['tunda_pemilu'] },
        fx: { nation: { approval: -9, stabilitas: -5, korupsi: 3 }, diplo: -10, coalition: 6, capital: -12, flags: ['tunda_pemilu'], schedule: [{ id: 'p_rakyat_melawan', min: 3, max: 10 }], hint: 'Tak ada yang lebih menyatukan rakyat selain pemilu yang dirampas.' },
        result: 'Sidang kilat mengesahkan penundaan. Malam itu, kampus-kampus menyalakan lilin dan menyusun barisan.',
      },
    ],
  },
  {
    id: 'p_rakyat_melawan',
    title: 'Lautan Manusia',
    text: 'Jalan protokol ibu kota tertutup manusia dari ujung ke ujung. Mahasiswa, buruh, emak-emak, pegawai kantoran, bahkan pensiunan jenderal. Mereka menuntut satu hal: kamu turun. Panglima menunggu perintahmu dan sedang menimbang apakah akan mematuhinya.',
    when: pres(),
    choices: [
      {
        label: 'Batalkan semuanya dan umumkan jadwal pemilu',
        fx: { nation: { approval: 3, stabilitas: 3 }, capital: -15, diplo: 5, unflags: ['tunda_pemilu', 'dekrit_darurat'] },
        result: 'Kamu mundur selangkah sebelum didorong. Massa bubar dengan curiga, tapi bubar.',
      },
      {
        label: 'Perintahkan tentara membubarkan',
        outcomes: [
          { chance: 0.35, text: 'Tentara menembak. Jalanan kosong dalam semalam, penuh sepatu yang tertinggal. Kamu bertahan, sebagai sesuatu yang lain.', fx: { nation: { stabilitas: 4, approval: -10, kebahagiaan: -6 }, diplo: -10, flags: ['darah_di_jalan'] } },
          { chance: 0.35, text: 'Prajurit menurunkan senapan dan memeluk para demonstran. Istana dikepung rakyatnya sendiri.', fx: { end: 'revolusi' } },
          { chance: 0.3, text: 'Panglima memutuskan bahwa yang harus disingkirkan adalah sumber masalahnya: kamu.', fx: { end: 'dikudeta' } },
        ],
      },
      {
        label: 'Bertahan di istana, tunggu mereka lelah',
        outcomes: [
          { chance: 0.4, text: 'Minggu ketiga, hujan dan lapar menipiskan barisan. Kamu selamat dengan kekuasaan yang berlubang.', fx: { nation: { stabilitas: -5, approval: -6, pertumbuhan: -0.8 }, capital: -10 } },
          { chance: 0.4, text: 'Koalisimu membelot satu per satu. DPR bersidang darurat dan memberhentikanmu.', fx: { end: 'dimakzulkan' } },
          { chance: 0.2, text: 'Pagar istana roboh pada hari kedua puluh. Kamu dievakuasi dengan helikopter dari atap.', fx: { end: 'revolusi' } },
        ],
      },
    ],
  },
  {
    id: 'p_diktator_retak',
    title: 'Retak di Lingkaran Dalam',
    text: 'Tanpa batas masa jabatan, tak ada lagi yang bisa menggantimu lewat pemilu. Orang-orang terdekatmu menyadari hal yang sama: satu-satunya jalan naik adalah menyingkirkanmu. Kepala intelijen membawa daftar nama. Namanya sendiri tidak ada di daftar itu, yang justru membuatmu curiga.',
    when: pres({ flags: ['diktator'] }),
    weight: 4,
    choices: [
      {
        label: 'Bersihkan semua nama di daftar',
        fx: { nation: { stabilitas: -3, korupsi: 2, kebahagiaan: -2 }, coalition: -8, attr: { stres: 6 }, hint: 'Setiap pembersihan mengajari yang tersisa untuk bergerak lebih dulu.' },
        outcomes: [
          { chance: 0.7, text: 'Penangkapan dini hari berjalan rapi. Yang tersisa di sekelilingmu kini hanya yang takut.', fx: { capital: 8 } },
          { chance: 0.3, text: 'Daftar itu bocor sebelum fajar. Mereka yang namanya tertulis bergerak lebih cepat darimu.', fx: { end: 'dikudeta' } },
        ],
      },
      {
        label: 'Adu domba mereka satu sama lain',
        need: { attrMin: { kecerdasan: 60 } },
        fx: { capital: 4, nation: { korupsi: 3, stabilitas: -2 }, attr: { stres: 5 } },
        result: 'Para pembantumu sibuk saling menjatuhkan. Negara berjalan sendiri tanpa ada yang mengurus.',
      },
      {
        label: 'Tunjuk putra mahkota agar semua tenang',
        fx: { nation: { stabilitas: 2, approval: -4 }, capital: -6, coalition: 3 },
        result: 'Pewaris diumumkan. Semua tersenyum kepadanya, dan mulai menghitung umurmu.',
      },
    ],
  },
  {
    id: 'p_debat_petahana',
    title: 'Debat Petahana',
    text: 'Debat calon presiden disiarkan ke seluruh negeri. Penantangmu membuka dengan daftar angka: harga, pengangguran, dan janji-janjimu lima tahun lalu. Moderator memberimu dua menit.',
    when: pres({ campaign: true }),
    weight: 5,
    choices: [
      {
        label: 'Jawab dengan data capaian',
        need: { attrMin: { kecerdasan: 55 } },
        fx: { momentum: 5, attr: { stres: 2 } },
        result: 'Kamu menjawab angka dengan angka. Membosankan, tapi meyakinkan pemilih yang masih ragu.',
      },
      {
        label: 'Serang balik rekam jejak penantang',
        outcomes: [
          { chance: 0.5, text: 'Seranganmu telak. Ia tergagap, dan potongan videonya menyebar.', fx: { momentum: 6 } },
          { chance: 0.5, text: 'Ia tertawa dan berkata: "Lima tahun berkuasa, yang Bapak hafal cuma dosa saya." Penonton bertepuk tangan.', fx: { momentum: -5, nation: { approval: -2 } } },
        ],
      },
      {
        label: 'Janjikan program baru yang lebih besar',
        fx: { momentum: 4, nation: { utang: 1 }, flags: ['janji_periode_dua'], hint: 'Janji petahana ditagih lebih keras daripada janji pendatang baru.' },
        result: 'Janji bantuan tunai berlipat disambut sorak. Menteri keuangan menonton sambil memegang kepala.',
      },
    ],
  },
  {
    id: 'p_fasilitas_negara',
    title: 'Mesin Negara',
    text: 'Elektabilitasmu ketat. Tim sukses mengusulkan mengerahkan apa yang tak dimiliki penantang: bansos dibagikan menjelang pemilu dengan fotomu, kepala desa "diarahkan", dan aparat "mengamankan" suara.',
    when: pres({ campaign: true }),
    weight: 4,
    once: true,
    choices: [
      {
        label: 'Kerahkan semuanya',
        fx: { momentum: 8, nation: { korupsi: 3, utang: 2 }, heat: 18, attr: { integritas: -5 }, flags: ['curang_petahana'], schedule: [{ id: 'p_gugatan_pemilu', min: 2, max: 6 }], hint: 'Kemenangan yang dibantu aparat akan digugat, di pengadilan atau di jalanan.' },
        result: 'Beras, amplop, dan arahan mengalir sampai ke dusun. Angka surveimu naik, begitu juga jumlah saksi mata.',
      },
      {
        label: 'Bansos saja, tanpa aparat',
        fx: { momentum: 4, nation: { utang: 2, kemiskinan: -0.3 }, heat: 6 },
        result: 'Bantuan dipercepat "kebetulan" sebelum pemilu. Oposisi protes, penerima bantuan tidak.',
      },
      {
        label: 'Larang. Menang atau kalah secara terhormat',
        fx: { momentum: -2, nation: { approval: 3 }, attr: { integritas: 4 }, party: -5 },
        result: 'Tim suksesmu menganggapmu naif. Pengawas pemilu, untuk pertama kali, tidak punya laporan tentang petahana.',
      },
    ],
  },
  {
    id: 'p_gugatan_pemilu',
    title: 'Gugatan Hasil Pemilu',
    text: 'Bukti pengerahan aparat dan bansos berfoto beredar luas: rekaman kepala desa diancam, video truk beras berstiker wajahmu. Oposisi menggugat, dan massa mereka memenuhi jalan depan mahkamah.',
    when: pres({ flags: ['curang_petahana'] }),
    choices: [
      {
        label: 'Biarkan mahkamah memutus dengan bebas',
        outcomes: [
          { chance: 0.6, text: 'Gugatan ditolak karena "tidak memengaruhi hasil secara signifikan". Kamu sah, dengan catatan kaki abadi.', fx: { nation: { approval: -4, stabilitas: -2 }, unflags: ['curang_petahana'] } },
          { chance: 0.4, text: 'Mahkamah menyatakan kecurangan terbukti. Kepercayaan publik runtuh dan DPR mulai bergerak.', fx: { nation: { approval: -10, stabilitas: -5 }, capital: -10, momentum: -8, schedule: [{ id: 'p_sidang_pemakzulan', min: 2, max: 6 }] } },
        ],
      },
      {
        label: 'Pastikan para hakim "memahami situasi"',
        fx: { nation: { korupsi: 4, approval: -5, stabilitas: -3 }, heat: 15, flags: ['intervensi_hukum'], unflags: ['curang_petahana'], schedule: [{ id: 'p_hakim_bicara', min: 8, max: 20 }], hint: 'Hakim yang dipaksa mengerti suatu hari akan menjelaskan kenapa.' },
        result: 'Gugatan kandas dengan suara bulat yang mencurigakan. Di luar gedung, massa tidak ikut bulat.',
      },
      {
        label: 'Tawarkan kursi kabinet kepada penggugat',
        outcomes: [
          { chance: 0.5, text: 'Penantangmu menerima jabatan menteri. Pendukungnya merasa dijual dan pulang dengan getir.', fx: { coalition: 5, nation: { approval: -3, stabilitas: 2 }, capital: -6, unflags: ['curang_petahana'] } },
          { chance: 0.5, text: 'Ia menolak dan membeberkan tawaranmu di depan massa.', fx: { nation: { approval: -7, stabilitas: -4 }, capital: -6 } },
        ],
      },
    ],
  },
];
