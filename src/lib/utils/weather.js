export const WEATHER_CODES = {
  0: { desc: "Cielo despejado", icon: "Sun" },
  1: { desc: "Principalmente despejado", icon: "SunCloud" },
  2: { desc: "Parcialmente nublado", icon: "CloudSun" },
  3: { desc: "Nublado", icon: "Cloud" },
  45: { desc: "Niebla", icon: "CloudFog" },
  48: { desc: "Niebla escarchada", icon: "CloudFog" },
  51: { desc: "Llovizna ligera", icon: "CloudDrizzle" },
  53: { desc: "Llovizna moderada", icon: "CloudDrizzle" },
  55: { desc: "Llovizna densa", icon: "CloudDrizzle" },
  61: { desc: "Lluvia ligera", icon: "CloudRain" },
  63: { desc: "Lluvia moderada", icon: "CloudRain" },
  65: { desc: "Lluvia fuerte", icon: "CloudRain" },
  71: { desc: "Nieve ligera", icon: "Snowflake" },
  73: { desc: "Nieve moderada", icon: "Snowflake" },
  75: { desc: "Nieve fuerte", icon: "Snowflake" },
  95: { desc: "Tormenta eléctrica", icon: "CloudLightning" },
};

export async function fetchWeatherData(lat = 40.4168, lon = -3.7038) {
  // Default Madrid, Spain
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API error");
    const data = await res.json();
    const current = data.current_weather;
    const weatherInfo = WEATHER_CODES[current.weathercode] || {
      desc: "Despejado",
      icon: "Sun",
    };

    return {
      temp: Math.round(current.temperature),
      windspeed: current.windspeed,
      code: current.weathercode,
      desc: weatherInfo.desc,
      icon: weatherInfo.icon,
      timezone: data.timezone || "",
      tempMax: data.daily?.temperature_2m_max?.[0]
        ? Math.round(data.daily.temperature_2m_max[0])
        : null,
      tempMin: data.daily?.temperature_2m_min?.[0]
        ? Math.round(data.daily.temperature_2m_min[0])
        : null,
    };
  } catch (e) {
    console.error("Weather fetch error", e);
    return null;
  }
}

export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=es&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((r) => ({
      name: r.name,
      admin1: r.admin1 || "",
      country: r.country || "",
      latitude: r.latitude,
      longitude: r.longitude,
      displayName: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    }));
  } catch (e) {
    console.error("City search error", e);
    return [];
  }
}

/**
 * Realiza geocodificación inversa para obtener el nombre real del municipio/ciudad
 * a partir de coordenadas GPS (ej. coordenadas de Alcoy devuelven 'Alcoy').
 */
export async function reverseGeocode(lat, lon) {
  if (lat == null || lon == null) return null;

  // 1. BigDataCloud Client API (rápido, sin autenticación, en español)
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const city =
        data.locality || data.city || data.principalSubdivision || "";
      const country = data.countryName || "";
      if (city) {
        return {
          city,
          country,
          province: data.principalSubdivision || "",
        };
      }
    }
  } catch (e) {
    console.warn("Error en reverseGeocode BigDataCloud:", e);
  }

  // 2. Fallback con OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "es" },
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityRaw =
        addr.town ||
        addr.city ||
        addr.village ||
        addr.municipality ||
        addr.county ||
        "";
      const city = cityRaw.includes("/")
        ? cityRaw.split("/")[0].trim()
        : cityRaw;
      if (city) {
        return {
          city,
          country: addr.country || "",
          province: addr.province || addr.state || "",
        };
      }
    }
  } catch (e) {
    console.warn("Error en reverseGeocode Nominatim:", e);
  }

  return null;
}

/**
 * Detecta pasivamente la ubicación del usuario mediante su conexión IP
 * sin necesidad de solicitar permisos GPS en el navegador.
 */
export async function detectLocationByIp() {
  try {
    const url =
      "https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=es";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const city =
        data.locality || data.city || data.principalSubdivision || "";
      const lat = data.latitude;
      const lon = data.longitude;
      const country = data.countryName || "";

      if (city && lat != null && lon != null) {
        return {
          lat,
          lon,
          city,
          country,
          province: data.principalSubdivision || "",
        };
      }
    }
  } catch (e) {
    console.warn("Error al detectar ubicación por IP:", e);
  }

  return null;
}
