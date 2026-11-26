import type { GameEvent } from '../sim/types';

// Event inti yang dipicu langsung oleh mesin simulasi.
export const EVENTS_CORE: GameEvent[] = [
  {
    id: 'skandal_terbongkar',
    title: 'Dosa lama terbongkar',
    text: 'Sebuah media memuat laporan panjang tentang masa lalumu: aliran uang, pertemuan gelap, nama-nama yang kamu kira sudah terkubur. Wartawan menunggu di depan rumah.',
    choices: [
      {
        label: 'Bantah keras dan serang balik medianya',
        outcomes: [
          { chance: 0.4, text: 'Bantahanmu meyakinkan. Isu mereda, walau sebagian orang tetap curiga.', fx: { pop: { nasional: -1, provinsi: -1 }, heat: -8 } },
          { chance: 0.6, text: 'Bukti baru muncul esok harinya. Kamu terlihat berbohong dua kali.', fx: { pop: { desa: -8, kabupaten: -8, provinsi: -8, nasional: -8 }, attr: { integritas: -5, stres: 10 }, heat: 5, nation: { approval: -6 }, schedule: [{ id: 'kpk_panggil', min: 2, max: 8, chance: 0.6 }] } },
        ],
      },
      {
        label: 'Akui, minta maaf, dan kembalikan uangnya',
        fx: { pop: { desa: -4, kabupaten: -4, provinsi: -4, nasional: -4 }, attr: { integritas: 4, stres: 6 }, heat: -30, nation: { approval: -3 }, flags: ['pernah_mengaku'] },
        result: 'Pahit, tapi publik menghargai pengakuan. Sebagian besar perkaranya ditutup.',
      },
      {
        label: 'Suap redaktur dan aparat agar kasusnya hilang',
        need: { moneyMin: 30 },
        fx: { attr: { integritas: -6 }, flags: ['suap_aparat'], hint: 'Yang menerima suapmu kini memegang rahasiamu.' },
        outcomes: [
          { chance: 0.55, text: 'Berita itu lenyap dari halaman depan. Untuk sementara.', fx: { money: -30, heat: 6, schedule: [{ id: 'skandal_terbongkar', min: 18, max: 60, chance: 0.6 }] } },
          { chance: 0.45, text: 'Redakturnya merekam pembicaraan kalian. Rekaman itu tayang malam ini.', fx: { money: -30, pop: { desa: -12, kabupaten: -12, provinsi: -12, nasional: -12 }, heat: 15, nation: { approval: -10 }, schedule: [{ id: 'kpk_panggil', min: 1, max: 4 }] } },
        ],
      },
      {
        label: 'Kambinghitamkan bawahan',
        fx: { attr: { integritas: -5 }, heat: -12, pop: { nasional: -2, kabupaten: -2 }, flags: ['korbankan_bawahan'], hint: 'Orang yang dikorbankan jarang diam selamanya.', schedule: [{ id: 'skandal_terbongkar', min: 24, max: 72, chance: 0.4 }] },
        result: 'Seorang staf mengundurkan diri sambil menangis di depan kamera. Kamu selamat.',
      },
    ],
  },
  {
    id: 'kpk_panggil',
    title: 'Surat panggilan komisi antikorupsi',
    text: 'Penyidik memanggilmu sebagai saksi. Semua orang tahu "saksi" bisa naik status dalam semalam.',
    choices: [
      {
        label: 'Datang dan kooperatif',
        outcomes: [
          { chance: 0.5, text: 'Pemeriksaan sembilan jam. Kamu pulang dengan status tetap saksi.', fx: { attr: { stres: 8 }, heat: -15, pop: { nasional: -2 } } },
          { chance: 0.3, text: 'Kamu ditetapkan tersangka dan divonis ringan karena kooperatif.', fx: { jail: 18, attr: { integritas: -3 } } },
          { chance: 0.2, text: 'Bukti terlalu kuat. Vonisnya berat.', fx: { jail: 60 } },
        ],
      },
      {
        label: 'Mangkir dan kerahkan pengacara serta massa',
        fx: { attr: { integritas: -4, stres: 6 }, heat: 8, pop: { nasional: -4, provinsi: -4 } },
        outcomes: [
          { chance: 0.45, text: 'Kasusnya berlarut-larut sampai publik lupa.', fx: { heat: -10 } },
          { chance: 0.55, text: 'Kamu dijemput paksa. Hakim tidak bersimpati.', fx: { jail: 72 } },
        ],
      },
      {
        label: 'Jadi saksi pelaku: bongkar semua nama',
        need: { heatMin: 20 },
        fx: { heat: -40, attr: { integritas: 3, jaringan: -15 }, party: -25, coalition: -15, flags: ['pengkhianat_elite'], hint: 'Mereka yang kamu sebut tidak akan memaafkan.' },
        result: 'Kamu bebas dengan hukuman percobaan. Separuh kenalanmu kini musuhmu.',
      },
    ],
  },
  {
    id: 'tagih_budi',
    title: 'Utang budi ditagih',
    text: '$npc datang tanpa janji. "Dulu saya bantu waktu kamu butuh. Sekarang giliran saya." Permintaannya jelas melanggar aturan.',
    choices: [
      {
        label: 'Turuti permintaannya',
        fx: { rel: 15, heat: 10, attr: { integritas: -4 }, flags: ['balas_budi_kotor'], hint: 'Sekali dituruti, dia akan datang lagi.', schedule: [{ id: 'tagih_budi', min: 18, max: 48, chance: 0.5 }] },
        result: 'Urusannya beres. Senyumnya terlalu lebar.',
      },
      {
        label: 'Tolak dengan halus, tawarkan bantuan yang sah',
        need: { attrMin: { karisma: 55 } },
        fx: { rel: -8, attr: { integritas: 2 } },
        result: 'Dia kecewa, tapi masih menjabat tanganmu saat pulang.',
      },
      {
        label: 'Tolak mentah-mentah',
        fx: { rel: -45, attr: { integritas: 4 }, schedule: [{ id: 'balas_dendam', min: 4, max: 24, chance: 0.6 }] },
        result: 'Pintu dibanting. Kamu kehilangan satu teman berpengaruh.',
      },
    ],
  },
  {
    id: 'balas_dendam',
    title: 'Teman lama jadi lawan',
    text: '$npc, yang dulu kamu tinggalkan, kini terang-terangan mendukung lawanmu dan membocorkan cerita lama ke media.',
    choices: [
      {
        label: 'Diamkan dan terima kerugiannya',
        fx: { pop: { kabupaten: -4, provinsi: -4, nasional: -3 }, momentum: -5, heat: 6, nation: { approval: -2 } },
        result: 'Beberapa hari jadi bulan-bulanan media, lalu berlalu.',
      },
      {
        label: 'Datangi dan berdamai',
        need: { attrMin: { karisma: 50 } },
        fx: { rel: 40, money: -10, attr: { stres: 4 } },
        result: 'Kopi, permintaan maaf, dan sedikit "ganti rugi". Dia menarik ucapannya.',
      },
      {
        label: 'Balas: bongkar aibnya juga',
        fx: { rel: -30, attr: { integritas: -3 }, pop: { nasional: -2 }, heat: 4 },
        result: 'Kalian saling melempar lumpur. Penonton menikmatinya; kalian berdua kotor.',
      },
    ],
  },
];
