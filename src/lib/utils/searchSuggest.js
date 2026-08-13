/**
 * Fetch live search suggestions for Google / DuckDuckGo
 */
export async function getSearchSuggestions(query) {
  if (!query || query.trim().length < 2) return [];

  const q = encodeURIComponent(query.trim());

  // 1. Try DuckDuckGo AC (supports CORS out-of-the-box in browser)
  try {
    const res = await fetch(`https://duckduckgo.com/ac/?q=${q}&type=list`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
        return data[1].slice(0, 6);
      }
    }
  } catch (e) {
    // Fallback if network blocked
  }

  // 2. Try Wikipedia AC as secondary live fallback if needed
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${q}&limit=6&namespace=0&format=json&origin=*`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[1]) {
        return data[1].slice(0, 6);
      }
    }
  } catch (e) {
    // silent
  }

  return [];
}
