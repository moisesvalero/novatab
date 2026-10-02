import { writable } from "svelte/store";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { auth, googleProvider } from "./config";

function createAuthStore() {
  const isBrowser = typeof window !== "undefined";

  const { subscribe, set, update } = writable({
    user: null,
    loading: true,
    error: null,
  });

  if (isBrowser) {
    // Check if user is returning from a redirect login
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          set({
            user: {
              uid: res.user.uid,
              email: res.user.email,
              displayName: res.user.displayName,
              photoURL: res.user.photoURL,
            },
            loading: false,
            error: null,
          });
        }
      })
      .catch((err) => {
        console.error("Redirect auth result error:", err);
      });

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
        // Try popup first
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      } catch (err) {
        console.warn("Popup sign-in failed, attempting redirect fallback...", err);
        // If popup fails due to internal-error (third-party cookies/iframe blocked) or blocked popup, redirect seamlessly
        if (
          err.code === "auth/internal-error" ||
          err.code === "auth/popup-blocked" ||
          err.message?.includes("internal-error")
        ) {
          try {
            await signInWithRedirect(auth, googleProvider);
            return;
          } catch (redirectErr) {
            console.error("Redirect sign-in error:", redirectErr);
            update((s) => ({ ...s, loading: false, error: redirectErr.message }));
            throw redirectErr;
          }
        }

        let userFriendlyMsg = "Error al conectar con Google.";
        if (err.code === "auth/popup-closed-by-user") {
          userFriendlyMsg = "Ventana de inicio de sesión cerrada.";
        } else if (err.code === "auth/unauthorized-domain") {
          userFriendlyMsg = "Dominio no autorizado en Firebase.";
        } else if (err.message) {
          userFriendlyMsg = err.message;
        }

        update((s) => ({ ...s, loading: false, error: userFriendlyMsg }));
        throw new Error(userFriendlyMsg);
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
