import type { GameState, EndingId, OfficeId } from './types';
import { setFinishHook, addHistory, hasFlag, age, clamp } from './core';
import { legacyScore } from './presidency';
import { officeDef, POLICIES } from '../content/data';
import { closeRecord } from './gov';
import { aspirationMet, achievements, lifeScore } from './personal';
import { ASPIRATIONS } from '../content/life';

const TEXT: Record<EndingId, [string, string]> = {
  legenda: ['Bapak Bangsa', 'Dua periode berlalu dan Nagari jauh lebih baik daripada saat kamu dilantik. Namamu diabadikan di jalan, bandara, dan buku pelajaran.'],
  dua_periode: ['Dua Periode, Lalu Pulang', 'Kamu menuntaskan dua periode. Tidak gemilang, tidak hancur. Sejarawan akan berdebat lama tentang warisanmu.'],
  satu_periode: ['Presiden Satu Periode', 'Rakyat memberimu satu kesempatan dan memilih tidak memberi yang kedua. Kamu menyerahkan istana dengan kepala tegak, atau setidaknya berusaha.'],
  dimakzulkan: ['Dimakzulkan', 'Ditinggal koalisi dan dibenci rakyat, kamu diturunkan lewat sidang istimewa. Mobil dinas menjemput untuk terakhir kalinya.'],
  dikudeta: ['Dikudeta', 'Tank berjajar di depan istana sebelum subuh. Siaran televisi diambil alih. Kamu menghabiskan sisa hidup dalam tahanan rumah.'],
  kalah_perang: ['Kalah Perang', 'Perang yang kamu pimpin berakhir dengan bendera asing di ibu kota. Namamu menjadi sinonim bencana nasional.'],
  diktator: ['Presiden Seumur Hidup', 'Tak ada lagi pemilu yang bisa menggantimu. Patungmu berdiri di setiap alun-alun. Rakyat tersenyum di depan kamera dan berbisik di dapur.'],
  mundur_terhormat: ['Mundur', 'Kamu meletakkan jabatan atas kemauan sendiri. Sebagian menyebutmu negarawan, sebagian menyebutmu lari dari tanggung jawab.'],
  penjara: ['Berakhir di Balik Jeruji', 'Vonis hakim menutup semua pintu. Jalan menuju istana berhenti di sel berukuran tiga kali empat meter.'],
  bangkrut: ['Bangkrut', 'Utang menelan segalanya: rumah, nama baik, dan teman. Tak ada partai yang mau mengusung orang yang dikejar penagih.'],
  meninggal: ['Tutup Usia', 'Tubuhmu menyerah sebelum cita-citamu tercapai. Pelayat datang, sebagian tulus, sebagian sekadar memastikan.'],
  wafat_menjabat: ['Wafat Saat Menjabat', 'Bendera setengah tiang di seluruh Nagari. Kamu meninggal sebagai presiden; pekerjaanmu diteruskan orang lain.'],
  tokoh_daerah: ['Tokoh Daerah', 'Kamu tidak pernah sampai ke istana, tetapi di daerahmu namamu dikenang. Tidak semua jalan harus berakhir di ibu kota.'],
  warga_biasa: ['Warga Biasa', 'Usia tujuh puluh, dan mimpi jadi presiden tinggal cerita untuk cucu. Hidupmu tenang; sejarah tidak mencatat namamu.'],
  pensiun: ['Hidup yang Dijalani', 'Usia tujuh puluh. Kamu duduk di beranda dan menghitung apa saja yang sudah kamu lalui.'],
  revolusi: ['Digulingkan Rakyat', 'Jutaan orang memenuhi jalan. Pagar istana roboh. Kamu pergi lewat pintu belakang dengan helikopter.'],
};

const FLAG_CAUSE: [string, string][] = [
  ['korupsi_proyek', 'Menggelembungkan anggaran proyek saat menjabat di daerah.'],
  ['serangan_fajar', 'Membeli suara dengan serangan fajar.'],
  ['kampanye_hitam', 'Memakai kampanye hitam.'],
  ['ingkar_janji', 'Mengingkari janji kampanye.'],
  ['hutang_budi', 'Berutang budi pada penyandang dana.'],
  ['balas_budi_kotor', 'Menuruti permintaan kotor penyandang dana.'],
  ['suap_aparat', 'Menyuap aparat untuk menutup kasus.'],
  ['pernah_dipenjara', 'Pernah dipenjara.'],
  ['kutu_loncat', 'Berpindah-pindah partai.'],
  ['putus_kuliah', 'Putus kuliah.'],
  ['lemahkan_kpk', 'Melemahkan komisi antikorupsi.'],
  ['bungkam_pers', 'Membungkam pers.'],
  ['dekrit_darurat', 'Mengeluarkan dekrit darurat.'],
  ['diktator', 'Menghapus batas masa jabatan.'],
  ['agresor', 'Memulai perang tanpa alasan kuat.'],
  ['menang_perang', 'Memenangkan perang.'],
  ['damai_memalukan', 'Menandatangani perdamaian yang memalukan.'],
  ['dilengserkan', 'Pernah diberhentikan karena kinerja buruk.'],
];

function causes(s: GameState, id: EndingId): string[] {
  const out: string[] = [];
  const c = s.char, n = s.nation;
  if (id === 'meninggal' || id === 'wafat_menjabat') {
    const bad = c.habits.filter(h => ['merokok', 'minum', 'begadang'].includes(h));
    if (bad.length) out.push(`Kebiasaan merusak kesehatan: ${bad.join(', ')}.`);
    if (c.attr.stres > 70) out.push('Stres berkepanjangan tanpa istirahat.');
    if (age(s) >= 65) out.push('Usia lanjut.');
  }
  if (id === 'bangkrut') {
    if (c.habits.includes('judi')) out.push('Kebiasaan berjudi.');
    if (c.habits.includes('foya')) out.push('Gaya hidup mewah di luar kemampuan.');
    if (hasFlag(s, 'kalah_pemilu')) out.push('Biaya kampanye yang tak kembali.');
    if (!c.job) out.push('Tidak punya penghasilan tetap.');
  }
  if (id === 'dimakzulkan' || id === 'revolusi' || id === 'dikudeta' || id === 'satu_periode') {
    if (n.kemiskinan > 13) out.push(`Kemiskinan tinggi (${n.kemiskinan.toFixed(1)}%).`);
    if (n.inflasi > 7) out.push(`Inflasi tak terkendali (${n.inflasi.toFixed(1)}%).`);
    if (n.pengangguran > 8) out.push(`Pengangguran tinggi (${n.pengangguran.toFixed(1)}%).`);
    if (n.utang > 90) out.push(`Utang negara membengkak (${n.utang.toFixed(0)}% PDB).`);
    if (n.kriminalitas > 60) out.push('Kriminalitas merajalela.');
    if (s.pres && Object.keys(s.pres.cabinet).length < 6) out.push('Kabinet dibiarkan kosong.');
    if (s.pres && Object.keys(s.pres.coalition).length <= 1) out.push('Koalisi di DPR terlalu kecil.');
    if (s.pres?.war) out.push('Perang yang berlarut-larut.');
  }
  if (id === 'kalah_perang') {
    if (n.militer < 45) out.push('Militer lemah saat perang pecah.');
    if (s.pres && !s.pres.countries.some(x => x.aliansi)) out.push('Tidak punya sekutu.');
  }
  if (id === 'tokoh_daerah' || id === 'warga_biasa') {
    if (!c.party) out.push('Tidak pernah membangun kendaraan politik.');
    if (c.pop.nasional < 25) out.push('Tidak dikenal di tingkat nasional.');
    if (hasFlag(s, 'kalah_pemilu')) out.push('Kalah pemilu dan kehabisan waktu.');
  }
  for (const [f, t] of FLAG_CAUSE) if (hasFlag(s, f)) out.push(t);
  if (s.pres) for (const pid of s.pres.policies.slice(0, 4)) out.push(`Kebijakan: ${POLICIES.find(p => p.id === pid)?.name}.`);
  return out.slice(0, 9);
}

function score(s: GameState, id: EndingId): number {
  if (s.pres) {
    const base = legacyScore(s);
    const pen: Partial<Record<EndingId, number>> = { dimakzulkan: -25, dikudeta: -20, kalah_perang: -40, revolusi: -35, penjara: -30, satu_periode: -8 };
    return Math.round(clamp(base + (pen[id] ?? 0)));
  }
  const tier: Record<OfficeId, number> = { kades: 8, bupati: 16, gubernur: 26, presiden: 40 };
  const best = Math.max(0, ...s.char.everOffice.map(o => tier[o]));
  const c = s.char;
  const political = Math.round(clamp(best + c.pop.nasional * 0.1 + c.pop.provinsi * 0.05 + (c.attr.integritas - 50) * 0.1 - (id === 'penjara' ? 10 : 0)));
  return Math.max(political, c.aspiration === 'presiden' ? Math.round(lifeScore(s) * 0.6) : lifeScore(s));
}

setFinishHook((s, id) => {
  let [title, text] = TEXT[id];
  const asp = ASPIRATIONS.find(a => a.id === s.char.aspiration);
  if (id === 'pensiun' && asp) {
    const met = aspirationMet(s);
    title = asp.id === 'bebas' ? 'Hidup yang Dijalani' : met ? `Cita-cita Tercapai: ${asp.name}` : `Belum Sampai: ${asp.name}`;
    text = asp.id === 'bebas' ? `${text} Tanpa peta, kamu tetap sampai di suatu tempat.`
      : met ? `${text} Mimpi yang kamu tulis di usia delapan belas (${asp.name.toLowerCase()}) benar-benar terwujud.`
      : `${text} Mimpi ${asp.name.toLowerCase()} belum sepenuhnya terwujud, tapi hidupmu tidak kosong.`;
  }
  const cs = [...causes(s, id), ...(s.pres ? [] : achievements(s))].slice(0, 12);
  s.ending = { id, title, text, score: score(s, id), causes: cs };
  if (s.pres) closeRecord(s, title);
  s.campaign = null;
  s.pending = [];
  const top = s.char.everOffice.length ? officeDef(s.char.everOffice[s.char.everOffice.length - 1]).name : null;
  addHistory(s, `${title}.${top ? ` Jabatan tertinggi: ${top}.` : ''}`);
});

export const ENDING_TITLES: Record<EndingId, string> = Object.fromEntries(Object.entries(TEXT).map(([k, v]) => [k, v[0]])) as Record<EndingId, string>;
