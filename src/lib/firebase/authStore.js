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
        console.error("Firebase Auth Error Full Details:", err);
        let userFriendlyMsg = "Error al conectar con Google.";

        if (err.code === "auth/popup-blocked") {
          userFriendlyMsg = "El navegador bloqueó la ventana emergente. Por favor, permítela para iniciar sesión.";
        } else if (err.code === "auth/popup-closed-by-user") {
          userFriendlyMsg = "Ventana de autenticación cerrada antes de completar el acceso.";
        } else if (err.code === "auth/unauthorized-domain") {
          userFriendlyMsg = "Este dominio aún no está autorizado en la consola de Firebase.";
        } else if (err.code === "auth/internal-error" || err.message?.includes("internal-error")) {
          userFriendlyMsg = "La ventana de Google se cerró o tu navegador bloqueó las cookies de terceros de Google. Revisa si tienes un bloqueador estricto o prueba en otra pestaña.";
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
