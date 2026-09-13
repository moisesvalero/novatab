export const SEARCH_ENGINES = {
  google: {
    id: "google",
    name: "Google",
    url: "https://www.google.com/search?q=",
    placeholder: "Google",
  },
  bing: {
    id: "bing",
    name: "Bing",
    url: "https://www.bing.com/search?q=",
    placeholder: "Bing",
  },
  duckduckgo: {
    id: "duckduckgo",
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
    placeholder: "DuckDuckGo",
  },
  yahoo: {
    id: "yahoo",
    name: "Yahoo",
    url: "https://search.yahoo.com/search?p=",
    placeholder: "Yahoo",
  },
  brave: {
    id: "brave",
    name: "Brave Search",
    url: "https://search.brave.com/search?q=",
    placeholder: "Brave Search",
  },
  ecosia: {
    id: "ecosia",
    name: "Ecosia",
    url: "https://www.ecosia.org/search?q=",
    placeholder: "Ecosia",
  },
  startpage: {
    id: "startpage",
    name: "Startpage",
    url: "https://www.startpage.com/sp/search?query=",
    placeholder: "Startpage",
  },
  qwant: {
    id: "qwant",
    name: "Qwant",
    url: "https://www.qwant.com/?q=",
    placeholder: "Qwant",
  },
  yandex: {
    id: "yandex",
    name: "Yandex",
    url: "https://yandex.com/search/?text=",
    placeholder: "Yandex",
  },
  custom: {
    id: "custom",
    name: "Personalizado",
    url: "",
    placeholder: "Buscador",
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
export function buildSearchUrl(engineId, query, customUrl = "") {
  const q = encodeURIComponent(query.trim());
  if (engineId === "custom") {
    if (!customUrl || !customUrl.trim()) {
      return `${SEARCH_ENGINES.google.url}${q}`;
    }
    const trimmed = customUrl.trim();
    if (trimmed.includes("%s")) {
      return trimmed.replace(/%s/g, q);
    }
    if (trimmed.endsWith("=") || trimmed.endsWith("/")) {
      return `${trimmed}${q}`;
    }
    return `${trimmed}${trimmed.includes("?") ? "&" : "?"}q=${q}`;
  }
  const engine = getEngine(engineId);
  return `${engine.url}${q}`;
}
