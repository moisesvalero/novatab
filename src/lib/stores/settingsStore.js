import { writable } from "svelte/store";

const DEFAULT_SETTINGS = {
  theme: "dark", // 'dark' | 'light' | 'system'
  clockType: "digital", // 'digital' | 'analog'
  clockFormat: "24h", // '24h' | '12h'
  showSeconds: false,
  showDate: true,
  userName: "",
  tabTitle: "NovaTab",
  tabEmoji: "⚡",
  searchEngine: "google", // 'google' | 'duckduckgo' | 'bing' | 'brave' | 'yahoo'
  searchInNewTab: false,
  widgets: {
    clock: true,
    greetings: true,
    weather: true,
    search: true,
    quickLinks: true,
    quotes: true,
    pomodoro: false,
    notes: false,
  },
  weatherCity: "",
  weatherUnit: "celsius", // 'celsius' | 'fahrenheit'
};

function mergeSettings(raw) {
  const parsed = raw && typeof raw === "object" ? raw : {};
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    widgets: {
      ...DEFAULT_SETTINGS.widgets,
      ...(parsed.widgets && typeof parsed.widgets === "object" ? parsed.widgets : {}),
    },
  };
}

function createSettingsStore() {
  const isBrowser = typeof window !== "undefined";
  let initial = mergeSettings(null);

  if (isBrowser) {
    try {
      const saved = localStorage.getItem("novatab_settings");
      if (saved) {
        initial = mergeSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading settings from localStorage", e);
    }
  }

  const { subscribe, set, update } = writable(initial);

  return {
    subscribe,
    set: (value) => {
      const merged = mergeSettings(value);
      if (isBrowser) {
        localStorage.setItem("novatab_settings", JSON.stringify(merged));
      }
      set(merged);
    },
    update: (fn) => {
      update((current) => {
        const updated = fn(current);
        if (isBrowser) {
          localStorage.setItem("novatab_settings", JSON.stringify(updated));
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
            [widgetKey]: !current.widgets[widgetKey],
          },
        };
        if (isBrowser) {
          localStorage.setItem("novatab_settings", JSON.stringify(updated));
        }
        return updated;
      });
    },
    reset: () => {
      if (isBrowser) {
        localStorage.removeItem("novatab_settings");
      }
      set(DEFAULT_SETTINGS);
    },
  };
}

export const settingsStore = createSettingsStore();
