import { writable } from "svelte/store";
import {
  fetchWeatherData,
  reverseGeocode,
  detectLocationByIp,
} from "$lib/utils/weather";

const CACHE_KEY = "novatab_weather_cache";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

export const DEFAULT_LOCATION = {
  lat: 40.4168,
  lon: -3.7038,
  city: "Madrid",
  country: "España",
  mode: "default", // 'default' | 'auto' | 'manual'
};

function createWeatherStore() {
  const isBrowser = typeof window !== "undefined";

  let initial = {
    weather: null,
    location: DEFAULT_LOCATION,
    loading: false,
    isLocating: false,
    lastUpdated: null,
    permission: "unknown",
    error: null,
  };

  // Cargar estado inicial desde localStorage en el navegador
  if (isBrowser) {
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.location) {
          initial.location = parsed.location;
        }
        if (parsed.weather) {
          initial.weather = parsed.weather;
        }
        if (parsed.lastUpdated) {
          initial.lastUpdated = parsed.lastUpdated;
        }
      }
    } catch (e) {
      console.error("Error al cargar caché de clima", e);
    }
  }

  const { subscribe, update } = writable(initial);

  function saveCache(data) {
    if (!isBrowser) return;
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          location: data.location,
          weather: data.weather,
          lastUpdated: data.lastUpdated,
        }),
      );
    } catch (e) {
      console.error("Error al guardar caché de clima", e);
    }
  }

  let initialized = false;

  const store = {
    subscribe,

    /**
     * Inicialización idempotente y silenciosa:
     * - Usa datos cacheados al instante (0ms).
     * - Si la ubicación es por defecto o heredada de Madrid por el bug anterior, auto-detecta la ciudad real por IP/GPS.
     * - Si la caché tiene más de 30 min, refresca el clima con las coordenadas guardadas.
     */
    init: async () => {
      if (!isBrowser || initialized) return;
      initialized = true;

      let permState = "unknown";
      // Consultar estado de permisos de forma pasiva sin activar avisos
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({
            name: "geolocation",
          });
          permState = status.state;
          update((s) => ({ ...s, permission: status.state }));
          status.onchange = () => {
            update((s) => ({ ...s, permission: status.state }));
          };
        } catch {
          // Algunos navegadores no admiten la consulta pasiva de geolocalización
        }
      }

      // Comprobar si los datos cacheados siguen vigentes
      let currentState;
      const unsubscribe = subscribe((val) => {
        currentState = val;
      });
      unsubscribe();

      // Si el modo es 'default' o tiene Madrid residual por el bug anterior (y no fue fijado manualmente):
      const needsLocationCorrection =
        currentState.location?.mode === "default" ||
        (currentState.location?.mode === "auto" &&
          currentState.location?.city === "Madrid");

      if (needsLocationCorrection) {
        if (permState === "granted" && navigator.geolocation) {
          // Si el usuario ya dio permiso GPS, resolver ubicación precisa inmediatamente
          store.requestGeolocation();
          return;
        }

        // Si no hay GPS explícito, detectar pasivamente por IP (detecta Alcoy de inmediato)
        const ipLocation = await detectLocationByIp();
        if (ipLocation) {
          const weather = await fetchWeatherData(
            ipLocation.lat,
            ipLocation.lon,
          );
          const now = Date.now();
          update((s) => {
            const next = {
              ...s,
              location: {
                lat: ipLocation.lat,
                lon: ipLocation.lon,
                city: ipLocation.city,
                country: ipLocation.country || "España",
                mode: "auto",
              },
              weather: weather || s.weather,
              lastUpdated: now,
              error: null,
            };
            saveCache(next);
            return next;
          });
          return;
        }
      }

      const isStale =
        !currentState.weather ||
        !currentState.lastUpdated ||
        Date.now() - currentState.lastUpdated > CACHE_TTL;

      if (isStale) {
        // Refrescar en segundo plano con las coordenadas ya guardadas
        const lat = currentState.location?.lat ?? DEFAULT_LOCATION.lat;
        const lon = currentState.location?.lon ?? DEFAULT_LOCATION.lon;

        const weather = await fetchWeatherData(lat, lon);
        if (weather) {
          const now = Date.now();
          update((s) => {
            const next = {
              ...s,
              weather,
              lastUpdated: now,
              error: null,
            };
            saveCache(next);
            return next;
          });
        }
      }
    },

    /**
     * Acción explícita solicitada por el usuario (ej. clic en "Detectar mi ubicación")
     * o llamada interna si el permiso GPS ya estaba concedido.
     */
    requestGeolocation: () => {
      if (!isBrowser || !navigator.geolocation) {
        update((s) => ({
          ...s,
          error: "La geolocalización no es compatible con este navegador",
        }));
        return;
      }

      update((s) => ({ ...s, isLocating: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Obtener datos del clima y geocodificación inversa real en paralelo
          const [weather, geoInfo] = await Promise.all([
            fetchWeatherData(lat, lon),
            reverseGeocode(lat, lon),
          ]);

          const cityName = geoInfo?.city || "Ubicación actual";
          const countryName = geoInfo?.country || "";

          const newLocation = {
            lat,
            lon,
            city: cityName,
            country: countryName,
            mode: "auto",
          };

          const now = Date.now();
          update((s) => {
            const next = {
              ...s,
              isLocating: false,
              location: newLocation,
              weather: weather || s.weather,
              lastUpdated: now,
              permission: "granted",
              error: null,
            };
            saveCache(next);
            return next;
          });
        },
        (err) => {
          update((s) => ({
            ...s,
            isLocating: false,
            permission: err.code === 1 ? "denied" : s.permission,
            error:
              err.code === 1
                ? "Permiso de ubicación denegado en el navegador."
                : "No se pudo determinar la ubicación actual.",
          }));
        },
        { timeout: 10000, maximumAge: 1000 * 60 * 60 * 24 },
      );
    },

    /**
     * Establecer ciudad manualmente desde el buscador de Ajustes.
     */
    setCity: async ({ name, country, latitude, longitude }) => {
      update((s) => ({ ...s, loading: true, error: null }));

      const newLocation = {
        lat: latitude,
        lon: longitude,
        city: name,
        country: country || "",
        mode: "manual",
      };

      const weather = await fetchWeatherData(latitude, longitude);
      const now = Date.now();

      update((s) => {
        const next = {
          ...s,
          loading: false,
          location: newLocation,
          weather: weather || s.weather,
          lastUpdated: now,
          error: null,
        };
        saveCache(next);
        return next;
      });
    },

    /**
     * Refrescar manualmente los datos del clima con la ubicación actual.
     */
    refresh: async () => {
      let currentState;
      const unsubscribe = subscribe((val) => {
        currentState = val;
      });
      unsubscribe();

      update((s) => ({ ...s, loading: true }));
      const lat = currentState.location?.lat ?? DEFAULT_LOCATION.lat;
      const lon = currentState.location?.lon ?? DEFAULT_LOCATION.lon;

      const weather = await fetchWeatherData(lat, lon);
      const now = Date.now();

      update((s) => {
        const next = {
          ...s,
          loading: false,
          weather: weather || s.weather,
          lastUpdated: now,
          error: null,
        };
        saveCache(next);
        return next;
      });
    },
  };

  return store;
}

export const weatherStore = createWeatherStore();
