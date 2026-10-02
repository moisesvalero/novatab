import { writable } from "svelte/store";

function createNotesStore() {
  const isBrowser = typeof window !== "undefined";
  let initial = "";

  if (isBrowser) {
    try {
      initial = localStorage.getItem("novatab_notes") || "";
    } catch (e) {
      console.error("Error reading notes from localStorage", e);
    }
  }

  const { subscribe, set } = writable(initial);

  return {
    subscribe,
    set: (text) => {
      if (isBrowser) {
        localStorage.setItem("novatab_notes", text);
      }
      set(text);
    },
  };
}

export const notesStore = createNotesStore();
