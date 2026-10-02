import { writable } from "svelte/store";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./config";

function createAuthStore() {
  const isBrowser = typeof window !== "undefined";

  const { subscribe, set, update } = writable({
    user: null,
    loading: true,
    error: null,
  });

  if (isBrowser) {
    onAuthStateChanged(
      auth,
      (user) => {
        set({
          user: user
            ? {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
              }
            : null,
          loading: false,
          error: null,
        });
      },
      (error) => {
        console.error("Auth state change error:", error);
        update((s) => ({ ...s, loading: false, error: error.message }));
      },
    );
  }

  return {
    subscribe,
    signInWithGoogle: async () => {
      try {
        update((s) => ({ ...s, loading: true, error: null }));
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      } catch (err) {
        console.error("Error signing in with Google:", err);
        update((s) => ({ ...s, loading: false, error: err.message }));
        throw err;
      }
    },
    logout: async () => {
      try {
        update((s) => ({ ...s, loading: true }));
        await signOut(auth);
      } catch (err) {
        console.error("Error signing out:", err);
        update((s) => ({ ...s, loading: false, error: err.message }));
        throw err;
      }
    },
  };
}

export const authStore = createAuthStore();
