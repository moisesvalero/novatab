import { writable } from 'svelte/store';

export const CURATED_BACKGROUNDS = [
  {
    id: 'bg-1',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85',
    author: 'Bailey Zindel',
    location: 'Yosemite Valley',
    link: 'https://unsplash.com/@baileyzindel'
  },
  {
    id: 'bg-2',
    url: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=2560&q=85',
    author: 'Lukasz Szmigiel',
    location: 'Bosque en la niebla',
    link: 'https://unsplash.com/@szmigieldesign'
  },
  {
    id: 'bg-3',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2560&q=85',
    author: 'v2osc',
    location: 'Montañas y niebla',
    link: 'https://unsplash.com/@v2osc'
  },
  {
    id: 'bg-4',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85',
    author: 'Kal视觉',
    location: 'Picos alpinos',
    link: 'https://unsplash.com/@kalvisual'
  },
  {
    id: 'bg-5',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=85',
    author: 'Sean Oulashin',
    location: 'Horizonte del océano',
    link: 'https://unsplash.com/@oulashin'
  },
  {
    id: 'bg-6',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=85',
    author: 'Benjamin Voros',
    location: 'Noche estrellada',
    link: 'https://unsplash.com/@vorosbenjamin'
  },
  {
    id: 'bg-7',
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=2560&q=85',
    author: 'Sebastien Gabriel',
    location: 'Prado verde y colinas',
    link: 'https://unsplash.com/@sebastien'
  },
  {
    id: 'bg-8',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2560&q=85',
    author: 'Pietro De Grandi',
    location: 'Lago en las montañas',
    link: 'https://unsplash.com/@pietro_de_grandi'
  }
];

const DEFAULT_BG = {
  type: 'image', // 'image' | 'solid' | 'gradient'
  currentIndex: Math.floor(Math.random() * CURATED_BACKGROUNDS.length),
  blur: 0, // 0 to 25px
  darkness: 30, // 0 to 80%
  customUrl: '',
  changeFrequency: 'newtab', // 'newtab' | 'manual'
  solidColor: '#0f172a',
  gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)'
};

function createBackgroundStore() {
  const isBrowser = typeof window !== 'undefined';
  let initial = DEFAULT_BG;

  if (isBrowser) {
    try {
      const saved = localStorage.getItem('novatab_background');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If frequency is 'newtab', rotate index automatically on every new tab open!
        if (parsed.changeFrequency !== 'manual') {
          parsed.currentIndex = (parsed.currentIndex + 1) % CURATED_BACKGROUNDS.length;
        }
        initial = { ...DEFAULT_BG, ...parsed };
      } else {
        initial.currentIndex = Math.floor(Math.random() * CURATED_BACKGROUNDS.length);
      }
      localStorage.setItem('novatab_background', JSON.stringify(initial));
    } catch (e) {
      console.error('Error loading background settings', e);
    }
  }

  const { subscribe, set, update } = writable(initial);

  const save = (val) => {
    if (isBrowser) {
      localStorage.setItem('novatab_background', JSON.stringify(val));
    }
  };

  return {
    subscribe,
    nextBackground: () => {
      update((current) => {
        const nextIdx = (current.currentIndex + 1) % CURATED_BACKGROUNDS.length;
        const updated = { ...current, currentIndex: nextIdx, customUrl: '' };
        save(updated);
        return updated;
      });
    },
    setFrequency: (freq) => {
      update((current) => {
        const updated = { ...current, changeFrequency: freq };
        save(updated);
        return updated;
      });
    },
    setBlur: (val) => {
      update((current) => {
        const updated = { ...current, blur: val };
        save(updated);
        return updated;
      });
    },
    setDarkness: (val) => {
      update((current) => {
        const updated = { ...current, darkness: val };
        save(updated);
        return updated;
      });
    },
    setCustomUrl: (url) => {
      update((current) => {
        const updated = { ...current, type: 'image', customUrl: url };
        save(updated);
        return updated;
      });
    },
    setMode: (type) => {
      update((current) => {
        const updated = { ...current, type };
        save(updated);
        return updated;
      });
    }
  };
}

export const backgroundStore = createBackgroundStore();
