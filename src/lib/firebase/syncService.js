import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { get, writable } from "svelte/store";
import { db } from "./config";
import { authStore } from "./authStore";
import { settingsStore } from "$lib/stores/settingsStore";
import { linksStore } from "$lib/stores/linksStore";
import { backgroundStore } from "$lib/stores/backgroundStore";
import { notesStore } from "$lib/stores/notesStore";

function createSyncService() {
  const isBrowser = typeof window !== "undefined";

  // Estado público de sincronización
  const syncStatus = writable({
    status: "idle", // 'idle' | 'syncing' | 'synced' | 'error'
    lastSyncedAt: null,
    error: null,
  });

  let unsubscribeFirestore = null;
  let isApplyingRemoteChange = false;
  let syncDebounceTimer = null;

  function init() {
    if (!isBrowser) return;

    authStore.subscribe(($auth) => {
      if ($auth.user) {
        startSync($auth.user.uid);
      } else {
        stopSync();
      }
    });

    // Escuchar cambios locales para subirlos con debounce de 1s
    const triggerLocalSave = () => {
      if (isApplyingRemoteChange) return;
      const currentAuth = get(authStore);
      if (!currentAuth.user) return;

      clearTimeout(syncDebounceTimer);
      syncStatus.update((s) => ({ ...s, status: "syncing" }));

      syncDebounceTimer = setTimeout(async () => {
        try {
          await pushLocalToCloud(currentAuth.user.uid);
          syncStatus.set({
            status: "synced",
            lastSyncedAt: new Date(),
            error: null,
          });
        } catch (err) {
          console.error("Error pushing data to Firestore:", err);
          syncStatus.set({
            status: "error",
            lastSyncedAt: null,
            error: err.message,
          });
        }
      }, 1000);
    };

    settingsStore.subscribe(triggerLocalSave);
    linksStore.subscribe(triggerLocalSave);
    backgroundStore.subscribe(triggerLocalSave);
    notesStore.subscribe(triggerLocalSave);
  }

  function startSync(uid) {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }

    syncStatus.update((s) => ({ ...s, status: "syncing" }));

    const userDocRef = doc(db, "users", uid);

    unsubscribeFirestore = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          isApplyingRemoteChange = true;
          try {
            if (data.settings) settingsStore.set(data.settings);
            if (data.links) linksStore.set(data.links);
            if (data.background) backgroundStore.set(data.background);
            if (typeof data.notes === "string") notesStore.set(data.notes);

            syncStatus.set({
              status: "synced",
              lastSyncedAt: new Date(),
              error: null,
            });
          } finally {
            // Breve espera antes de volver a admitir sincronización local para evitar bucles
            setTimeout(() => {
              isApplyingRemoteChange = false;
            }, 300);
          }
        } else {
          // Si el documento en la nube no existe aún, subimos el estado local actual
          pushLocalToCloud(uid).then(() => {
            syncStatus.set({
              status: "synced",
              lastSyncedAt: new Date(),
              error: null,
            });
          });
        }
      },
      (err) => {
        console.error("Firestore listener error:", err);
        syncStatus.set({
          status: "error",
          lastSyncedAt: null,
          error: err.message,
        });
      },
    );
  }

  function stopSync() {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
    syncStatus.set({
      status: "idle",
      lastSyncedAt: null,
      error: null,
    });
  }

  async function pushLocalToCloud(uid) {
    const payload = {
      settings: get(settingsStore),
      links: get(linksStore),
      background: get(backgroundStore),
      notes: get(notesStore),
      updatedAt: Date.now(),
    };

    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, payload, { merge: true });
  }

  return {
    syncStatus: { subscribe: syncStatus.subscribe },
    init,
    forcePush: async () => {
      const currentAuth = get(authStore);
      if (currentAuth.user) {
        await pushLocalToCloud(currentAuth.user.uid);
      }
    },
  };
}

export const syncService = createSyncService();
