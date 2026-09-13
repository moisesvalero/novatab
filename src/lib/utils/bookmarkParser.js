/**
 * Parsea un archivo HTML de marcadores exportado desde navegadores
 * (Chrome, Firefox, Brave, Safari, Edge) en formato estándar Netscape Bookmark.
 *
 * @param {string} htmlContent - Contenido HTML del archivo de marcadores
 * @returns {{ bookmarks: Array<{ title: string, url: string }>, totalParsed: number }}
 */
export function parseBookmarksHtml(htmlContent) {
  if (!htmlContent || typeof htmlContent !== "string") {
    return { bookmarks: [], totalParsed: 0 };
  }

  // Parser DOM nativo del navegador
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const anchors = doc.querySelectorAll("a[href]");

  const bookmarks = [];
  const seenUrls = new Set();

  for (const a of anchors) {
    let url = a.getAttribute("href") || "";
    url = url.trim();

    // Solo admitir enlaces http:// y https:// válidos (descarta javascript:, chrome://, about:, etc.)
    if (!/^https?:\/\//i.test(url)) {
      continue;
    }

    let title = (a.textContent || "").trim();
    if (!title) {
      try {
        title = new URL(url).hostname;
      } catch {
        title = url;
      }
    }

    // Normalizar URL para evitar duplicados exactos dentro del mismo archivo
    const normalized = url.toLowerCase().replace(/\/$/, "");
    if (!seenUrls.has(normalized)) {
      seenUrls.add(normalized);
      bookmarks.push({
        title,
        url,
      });
    }
  }

  return {
    bookmarks,
    totalParsed: bookmarks.length,
  };
}
