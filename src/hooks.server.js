/** @type {import("@sveltejs/kit").Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event);

  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)",
  );
  response.headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin-allow-popups",
  );
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.open-meteo.com https://geocoding-api.open-meteo.com https://api.bigdatacloud.net https://nominatim.openstreetmap.org https://suggestqueries.google.com https://en.wikipedia.org https://duckduckgo.com https://images.unsplash.com https://api.unsplash.com; frame-ancestors 'self';",
  );
  response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");

  return response;
}
