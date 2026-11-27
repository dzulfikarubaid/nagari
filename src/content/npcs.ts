import type { Npc, NpcRole, MinistryId } from '../sim/types';

type T = [id: string, name: string, role: NpcRole, desc: string, influence: number, integrity: number, competence: number, loyalty: number, expertise: MinistryId, party: string | null];

// Semua tokoh ini muncul di setiap permainan.
const RAW: T[] = [
  ['p_properti', 'Handoko Wiraatmaja', 'pengusaha', 'Raja properti. Murah hati pada calon pejabat, dan tak pernah lupa menagih.', 80, 25, 60, 40, 'keuangan', 'pkr'],
  ['p_tambang', 'Samsul Barata', 'pengusaha', 'Juragan tambang batu bara. Dana tak terbatas, izin selalu bermasalah.', 85, 15, 50, 35, 'pu', 'pkr'],
  ['p_startup', 'Ratna Kusumadewi', 'pengusaha', 'Pendiri startup pertanian. Bersih, tapi dompetnya tak setebal konglomerat.', 50, 80, 75, 65, 'sosial', null],
  ['kiai', 'Kiai Mansur Hadi', 'ulama', 'Pengasuh pesantren besar. Satu kata darinya menggerakkan jutaan santri.', 85, 80, 55, 70, 'sosial', 'pku'],
  ['ustaz', 'Ustaz Fikri Ramadan', 'ulama', 'Penceramah televisi. Populer, pandai berhitung untung-rugi dukungan.', 70, 40, 40, 35, 'pendidikan', 'pku'],
  ['pendeta', 'Pendeta Yosafat Lewa', 'ulama', 'Tokoh lintas iman dari timur Nagari. Suaranya didengar minoritas.', 55, 85, 55, 75, 'sosial', null],
  ['j_tv', 'Nirmala Sasmita', 'jurnalis', 'Pembawa acara bincang politik paling ditakuti pejabat.', 80, 90, 70, 50, 'hukum', null],
  ['j_media', 'Baskoro Wirya', 'jurnalis', 'Pemilik grup media. Pemberitaan bisa dipesan, dengan harga.', 85, 25, 55, 30, 'luar_negeri', 'pbn'],
  ['j_investigasi', 'Dewi Larasati', 'jurnalis', 'Wartawan investigasi. Teman setia bagi yang jujur, mimpi buruk bagi yang tidak.', 55, 95, 65, 60, 'hukum', null],
  ['jenderal', 'Jenderal Surya Dharma', 'jenderal', 'Panglima berpengaruh. Setia pada negara, atau pada siapa yang menjaganya.', 90, 55, 75, 50, 'pertahanan', null],
  ['kolonel', 'Kolonel Galih Prakoso', 'jenderal', 'Perwira muda cemerlang, idealis, disukai prajurit.', 55, 80, 80, 80, 'pertahanan', null],
  ['purnawirawan', 'Letjen (Purn.) Wiratmo', 'jenderal', 'Pensiunan jenderal berbisnis keamanan. Punya banyak "orang lapangan".', 75, 20, 60, 30, 'hukum', 'pbn'],
  ['ekonom', 'Prof. Emilia Sari', 'akademisi', 'Ekonom jebolan luar negeri. Hitungannya tepat, bahasanya bikin partai pusing.', 60, 85, 95, 55, 'keuangan', null],
  ['rektor', 'Dr. Arman Bestari', 'akademisi', 'Rektor dan pemikir pendidikan. Pandai berpidato.', 70, 70, 80, 45, 'pendidikan', null],
  ['dokter', 'dr. Tantri Nugraha', 'akademisi', 'Dokter kesehatan masyarakat yang vokal.', 50, 85, 88, 65, 'kesehatan', null],
  ['insinyur', 'Ir. Bagus Hadiwinata', 'akademisi', 'Insinyur lapangan. Lebih suka di proyek daripada di rapat.', 55, 88, 92, 80, 'pu', null],
  ['preman_pasar', 'Bang Jago', 'preman', 'Penguasa terminal dan pasar. Bisa mengerahkan massa dalam semalam.', 55, 10, 25, 55, 'hukum', null],
  ['ormas', 'Daeng Rewa', 'preman', 'Ketua ormas pemuda. Jasa "pengamanan" suara tersedia.', 50, 15, 30, 45, 'hukum', 'pbn'],
  ['ham', 'Wening Mulyana', 'aktivis', 'Pejuang hak asasi. Tak bisa dibeli, tak bisa didiamkan.', 60, 98, 65, 40, 'hukum', null],
  ['lingkungan', 'Butet Sinaga', 'aktivis', 'Aktivis lingkungan dan masyarakat adat.', 50, 90, 60, 55, 'sosial', 'phm'],
  ['buruh', 'Sarip Ikhsan', 'aktivis', 'Ketua serikat buruh. Jutaan anggota menunggu komandonya.', 70, 65, 55, 60, 'sosial', 'pbt'],
  ['teknokrat', 'Sekar Maheswari', 'birokrat', 'Teknokrat senior Kementerian Keuangan. Disegani pasar dunia.', 75, 92, 97, 60, 'keuangan', null],
  ['polisi', 'Irjen Teguh Kartawan', 'birokrat', 'Perwira polisi karier yang lihai membaca arah angin.', 75, 45, 78, 45, 'hukum', null],
  ['diplomat', 'Rukmini Mandalika', 'birokrat', 'Diplomat karier, tenang, dihormati di luar negeri.', 60, 88, 92, 75, 'luar_negeri', null],
  ['sekda', 'Pak Darmaji', 'birokrat', 'Sekretaris daerah kawakan. Tahu semua celah anggaran.', 45, 35, 70, 50, 'pu', null],
  ['bintang_tv', 'Reza Aditama', 'artis', 'Bintang televisi dengan puluhan juta pengikut.', 80, 50, 35, 50, 'sosial', null],
  ['musisi', 'Iwang Pamungkas', 'artis', 'Musisi legendaris suara rakyat kecil.', 70, 85, 40, 60, 'pendidikan', null],
  ['ketum_pbn', 'Ibu Mustika Rahayu', 'politisi', 'Ketua umum PBN. Tak ada yang jadi presiden tanpa restunya, katanya.', 95, 45, 60, 30, 'luar_negeri', 'pbn'],
  ['ketum_pku', 'Cak Imron Rosyid', 'politisi', 'Ketua PKU, juru lobi ulung yang selalu ada di kubu pemenang.', 80, 35, 55, 25, 'sosial', 'pku'],
  ['ketum_pkr', 'Erwin Hartadi', 'politisi', 'Ketua PKR. Rapi, kaya, dan dekat dengan para konglomerat.', 85, 30, 70, 35, 'keuangan', 'pkr'],
  ['ketum_pbt', 'Bimo Sujatmiko', 'politisi', 'Mantan aktivis yang kini memimpin PBT.', 60, 70, 65, 55, 'sosial', 'pbt'],
  ['muda_phm', 'Tania Amalia', 'politisi', 'Politisi muda PHM, fasih di media sosial.', 50, 80, 60, 65, 'pendidikan', 'phm'],
];

export const NPC_TEMPLATES: Npc[] = RAW.map(([id, name, role, desc, influence, integrity, competence, loyalty, expertise, party]) => ({
  id, name, role, desc, influence, integrity, competence, loyalty, expertise, party, rel: 0, met: false, memory: [],
}));

const FIRST = ['Adi', 'Bayu', 'Citra', 'Dimas', 'Eka', 'Fajar', 'Gita', 'Hendra', 'Indah', 'Joko', 'Kartika', 'Lukman', 'Maya', 'Nugroho', 'Oktavia', 'Putra', 'Rini', 'Sigit', 'Tari', 'Umar', 'Vina', 'Wahyu', 'Yudi', 'Zainal'];
const LAST = ['Santoso', 'Pratama', 'Siregar', 'Nasution', 'Wibowo', 'Tanjung', 'Hidayat', 'Saragih', 'Mahendra', 'Latuconsina', 'Rajagukguk', 'Suryadi', 'Maulana', 'Pangaribuan', 'Kusnadi', 'Tampubolon'];
export function randomName(r: () => number): string {
  return `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`;
}
