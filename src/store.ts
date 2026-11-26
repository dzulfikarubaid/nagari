import { create } from 'zustand';
import { dispatch, newGame, blocked, type GameState, type Action, type NewGameOpts } from './sim';

const KEY = 'nagari-save-v1';

function load(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const g = JSON.parse(raw) as GameState;
    return g.version === 1 ? g : null;
  } catch { return null; }
}
function save(g: GameState | null) {
  try { if (g) localStorage.setItem(KEY, JSON.stringify(g)); else localStorage.removeItem(KEY); } catch { /* penyimpanan penuh/terblokir: abaikan */ }
}

interface Store {
  game: GameState | null;
  tab: string;
  showHistory: boolean;
  act: (a: Action) => void;
  /** Maju beberapa bulan; berhenti begitu ada yang perlu dijawab. */
  skip: (months: number) => void;
  start: (o: NewGameOpts) => void;
  reset: () => void;
  setTab: (t: string) => void;
  setShowHistory: (v: boolean) => void;
}

export const useStore = create<Store>((set, get) => ({
  game: load(),
  tab: 'rencana',
  showHistory: false,
  act: (a) => {
    const g = get().game;
    if (!g) return;
    const n = dispatch(g, a);
    save(n);
    set({ game: n });
  },
  skip: (months) => {
    let g = get().game;
    if (!g) return;
    for (let i = 0; i < months; i++) {
      if (blocked(g)) break;
      const hadCampaign = !!g.campaign, hadOffice = g.office?.id;
      g = dispatch(g, { type: 'next' });
      // Berhenti juga saat keadaan berubah besar.
      if (!!g.campaign !== hadCampaign || g.office?.id !== hadOffice) break;
    }
    save(g);
    set({ game: g });
  },
  start: (o) => { const g = newGame(o); save(g); set({ game: g, tab: 'karier' }); },
  reset: () => { save(null); set({ game: null, tab: 'rencana', showHistory: false }); },
  setTab: (tab) => set({ tab }),
  setShowHistory: (showHistory) => set({ showHistory }),
}));
