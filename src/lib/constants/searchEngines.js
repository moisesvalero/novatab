export const SEARCH_ENGINES = {
  google: {
    id: "google",
    name: "Google",
    url: "https://www.google.com/search?q=",
    placeholder: "Google",
  },
  duckduckgo: {
    id: "duckduckgo",
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
    placeholder: "DuckDuckGo",
  },
  bing: {
    id: "bing",
    name: "Bing",
    url: "https://www.bing.com/search?q=",
    placeholder: "Bing",
  },
  brave: {
    id: "brave",
    name: "Brave Search",
    url: "https://search.brave.com/search?q=",
    placeholder: "Brave Search",
  },
  yahoo: {
    id: "yahoo",
    name: "Yahoo",
    url: "https://search.yahoo.com/search?p=",
    placeholder: "Yahoo",
  },
};

export const DEFAULT_SEARCH_ENGINE = "google";

/**
 * Retorna la configuración del motor o Google como fallback
 */
export function getEngine(id) {
  return SEARCH_ENGINES[id] || SEARCH_ENGINES.google;
}

/**
 * Construye la URL de búsqueda según el motor seleccionado y el término buscado
 */
export function buildSearchUrl(engineId, query) {
  const q = encodeURIComponent(query.trim());
  const engine = getEngine(engineId);
  return `${engine.url}${q}`;
}
