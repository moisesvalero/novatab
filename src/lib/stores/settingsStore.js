import { writable } from 'svelte/store';

const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark' | 'light' | 'system'
  clockType: 'digital', // 'digital' | 'analog'
  clockFormat: '24h', // '24h' | '12h'
  showSeconds: false,
  showDate: true,
  userName: '',
  tabTitle: 'NovaTab',
  tabEmoji: '⚡',
  searchEngine: 'google', // 'google' | 'duckduckgo' | 'bing' | 'brave'
  searchInNewTab: false,
  widgets: {
    clock: true,
    greetings: true,
    weather: true,
    search: true,
    quickLinks: true,
    quotes: true,
    pomodoro: false,
    notes: false
  },
  weatherCity: '',
  weatherUnit: 'celsius' // 'celsius' | 'fahrenheit'
};

function createSettingsStore() {
  const isBrowser = typeof window !== 'undefined';
  let initial = DEFAULT_SETTINGS;

  if (isBrowser) {
    try {
      const saved = localStorage.getItem('novatab_settings');
      if (saved) {
        initial = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
    }
  }

  const { subscribe, set, update } = writable(initial);

  return {
    subscribe,
    set: (value) => {
      if (isBrowser) {
        localStorage.setItem('novatab_settings', JSON.stringify(value));
      }
      set(value);
    },
    update: (fn) => {
      update((current) => {
        const updated = fn(current);
        if (isBrowser) {
          localStorage.setItem('novatab_settings', JSON.stringify(updated));
        }
        return updated;
      });
    },
    toggleWidget: (widgetKey) => {
      update((current) => {
        const updated = {
          ...current,
          widgets: {
            ...current.widgets,
            [widgetKey]: !current.widgets[widgetKey]
          }
        };
        if (isBrowser) {
          localStorage.setItem('novatab_settings', JSON.stringify(updated));
        }
        return updated;
      });
    },
    reset: () => {
      if (isBrowser) {
        localStorage.removeItem('novatab_settings');
      }
      set(DEFAULT_SETTINGS);
    }
  };
}

export const settingsStore = createSettingsStore();
