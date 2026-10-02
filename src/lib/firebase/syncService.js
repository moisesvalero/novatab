import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { get, writable } from "svelte/store";
import { db } from "./config";
import { authStore } from "./authStore";
import { settingsStore } from "$lib/stores/settingsStore";
import { linksStore } from "$lib/stores/linksStore";
import { backgroundStore } from "$lib/stores/backgroundStore";
import { notesStore } from "$lib/stores/notesStore";

// Estado público reactivo de sincronización
export const syncStatus = writable({
  status: "idle", // 'idle' | 'syncing' | 'synced' | 'error'
  lastSyncedAt: null,
  error: null,
});

/**
 * Sanitiza recursivamente objetos y arrays para eliminar valores `undefined`,
 * que provocan rechazos fatales en el SDK de Firestore.
 */
function sanitizeForFirestore(val) {
  if (val === undefined) return null;
  if (val === null || typeof val !== "object") return val;
  if (Array.isArray(val)) {
    return val.map(sanitizeForFirestore);
  }
  const clean = {};
  for (const [k, v] of Object.entries(val)) {
    if (v !== undefined) {
      clean[k] = sanitizeForFirestore(v);
    }
  }
  return clean;
}

function createSyncService() {
  const isBrowser = typeof window !== "undefined";

  let unsubscribeFirestore = null;
  let isApplyingRemoteChange = false;
  let syncDebounceTimer = null;
  let safetySyncTimeout = null;

  function init() {
    if (!isBrowser) return;

    authStore.subscribe(($auth) => {
      if ($auth.user) {
        startSync($auth.user.uid);
      } else {
        stopSync();
      }
    });

    // Escuchar cambios locales para subirlos con debounce de 800ms
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
            error: err.message || "Error al sincronizar con Firestore",
          });
        }
      }, 800);
    };

    settingsStore.subscribe(triggerLocalSave);
    linksStore.subscribe(triggerLocalSave);
    backgroundStore.subscribe(triggerLocalSave);
    notesStore.subscribe(triggerLocalSave);
  }

  function startSync(uid) {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }

    clearTimeout(safetySyncTimeout);
    syncStatus.update((s) => ({ ...s, status: "syncing", error: null }));

    // Timeout de seguridad: asegura que la interfaz no quede atascada en "syncing" si la red demora
    safetySyncTimeout = setTimeout(() => {
      syncStatus.update((s) =>
        s.status === "syncing"
          ? { ...s, status: "synced", lastSyncedAt: new Date() }
          : s,
      );
    }, 2500);

    const userDocRef = doc(db, "users", uid);

    unsubscribeFirestore = onSnapshot(
      userDocRef,
      async (docSnap) => {
        clearTimeout(safetySyncTimeout);
        if (docSnap.exists()) {
          const data = docSnap.data();
          isApplyingRemoteChange = true;
          try {
            if (data.settings && typeof settingsStore?.set === "function")
              settingsStore.set(data.settings);
            if (data.links && typeof linksStore?.set === "function")
              linksStore.set(data.links);
            if (data.background && typeof backgroundStore?.set === "function")
              backgroundStore.set(data.background);
            if (
              typeof data.notes === "string" &&
              typeof notesStore?.set === "function"
            )
              notesStore.set(data.notes);
          } catch (err) {
            console.error("Error applying remote data:", err);
          } finally {
            syncStatus.set({
              status: "synced",
              lastSyncedAt: new Date(),
              error: null,
            });
            // Margen para que los suscriptores locales de Svelte completen su ciclo
            setTimeout(() => {
              isApplyingRemoteChange = false;
            }, 500);
          }
        } else {
          // Si el documento en la nube no existe aún, subimos el estado local actual
          try {
            await pushLocalToCloud(uid);
            syncStatus.set({
              status: "synced",
              lastSyncedAt: new Date(),
              error: null,
            });
          } catch (err) {
            console.error("Error creating initial cloud profile:", err);
            syncStatus.set({
              status: "error",
              lastSyncedAt: null,
              error: err.message,
            });
          }
        }
      },
      (err) => {
        clearTimeout(safetySyncTimeout);
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
    clearTimeout(safetySyncTimeout);
    clearTimeout(syncDebounceTimer);
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
    const rawPayload = {
      settings: get(settingsStore),
      links: get(linksStore),
      background: get(backgroundStore),
      notes: get(notesStore),
      updatedAt: Date.now(),
    };

    const payload = sanitizeForFirestore(rawPayload);
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, payload, { merge: true });
  }

  return {
    init,
    forcePush: async () => {
      const currentAuth = get(authStore);
      if (currentAuth.user) {
        syncStatus.update((s) => ({ ...s, status: "syncing" }));
        try {
          await pushLocalToCloud(currentAuth.user.uid);
          syncStatus.set({
            status: "synced",
            lastSyncedAt: new Date(),
            error: null,
          });
        } catch (err) {
          syncStatus.set({
            status: "error",
            lastSyncedAt: null,
            error: err.message,
          });
        }
      }
    },
  };
}

export const syncService = createSyncService();
