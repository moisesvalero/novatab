import { writable } from 'svelte/store';

const DEFAULT_LINKS = [
  { id: '1', title: 'Google', url: 'https://www.google.com' },
  { id: '2', title: 'YouTube', url: 'https://www.youtube.com' },
  { id: '3', title: 'GitHub', url: 'https://github.com' },
  { id: '4', title: 'ChatGPT', url: 'https://chatgpt.com' },
  { id: '5', title: 'Reddit', url: 'https://www.reddit.com' },
  { id: '6', title: 'Twitter', url: 'https://x.com' },
  { id: '7', title: 'Netflix', url: 'https://www.netflix.com' },
  { id: '8', title: 'Amazon', url: 'https://www.amazon.es' }
];

function createLinksStore() {
  const isBrowser = typeof window !== 'undefined';
  let initial = DEFAULT_LINKS;

  if (isBrowser) {
    try {
      const saved = localStorage.getItem('novatab_links');
      if (saved) {
        initial = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading links from localStorage', e);
    }
  }

  const { subscribe, set, update } = writable(initial);

  const save = (val) => {
    if (isBrowser) {
      localStorage.setItem('novatab_links', JSON.stringify(val));
    }
  };

  return {
    subscribe,
    addLink: (title, url) => {
      let formattedUrl = url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      const newLink = {
        id: Date.now().toString(),
        title: title.trim() || new URL(formattedUrl).hostname,
        url: formattedUrl
      };
      update((links) => {
        const updated = [...links, newLink];
        save(updated);
        return updated;
      });
    },
    updateLink: (id, title, url) => {
      let formattedUrl = url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      update((links) => {
        const updated = links.map((link) =>
          link.id === id
            ? { ...link, title: title.trim() || new URL(formattedUrl).hostname, url: formattedUrl }
            : link
        );
        save(updated);
        return updated;
      });
    },
    removeLink: (id) => {
      update((links) => {
        const updated = links.filter((link) => link.id !== id);
        save(updated);
        return updated;
      });
    },
    reset: () => {
      if (isBrowser) {
        localStorage.removeItem('novatab_links');
      }
      set(DEFAULT_LINKS);
    }
  };
}

export const linksStore = createLinksStore();

/**
 * Returns Google high resolution favicon URL for a given site URL
 */
export function getFaviconUrl(siteUrl) {
  try {
    const domain = new URL(siteUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return `https://www.google.com/s2/favicons?domain=google.com&sz=128`;
  }
}
