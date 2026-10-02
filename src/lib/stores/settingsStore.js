import { writable } from "svelte/store";

const DEFAULT_SETTINGS = {
  theme: "system", // 'system' | 'light' | 'dark'
  themeUserSelected: false,
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

function createSettingsStore() {
  const isBrowser = typeof window !== "undefined";
  let initial = DEFAULT_SETTINGS;

  if (isBrowser) {
    try {
      const saved = localStorage.getItem("novatab_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: If theme was legacy "dark" and user never explicitly chose it,
        // default to "system" so their OS preference is respected!
        if (parsed.theme === "dark" && !parsed.themeUserSelected) {
          parsed.theme = "system";
        }
        initial = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error("Error loading settings from localStorage", e);
    }
  }

  const { subscribe, set, update } = writable(initial);

  return {
    subscribe,
    set: (value) => {
      if (isBrowser) {
        localStorage.setItem("novatab_settings", JSON.stringify(value));
      }
      set(value);
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
    setTheme: (newTheme) => {
      update((current) => {
        const updated = {
          ...current,
          theme: newTheme,
          themeUserSelected: true,
        };
        if (isBrowser) {
          localStorage.setItem("novatab_settings", JSON.stringify(updated));
        }
        return updated;
      });
    },
    cycleTheme: () => {
      let nextTheme = "system";
      update((current) => {
        const cur = current.theme || "system";
        if (cur === "system") nextTheme = "light";
        else if (cur === "light") nextTheme = "dark";
        else nextTheme = "system";

        const updated = {
          ...current,
          theme: nextTheme,
          themeUserSelected: true,
        };
        if (isBrowser) {
          localStorage.setItem("novatab_settings", JSON.stringify(updated));
        }
        return updated;
      });
      return nextTheme;
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
