<script>
  import { onMount, onDestroy } from 'svelte';
  import { settingsStore } from '$lib/stores/settingsStore';
  import { getSearchSuggestions } from '$lib/utils/searchSuggest';
  import { Search, X, ArrowUpRight } from '@lucide/svelte';

  let query = $state('');
  let inputEl = $state(null);
  let suggestions = $state([]);
  let selectedIndex = $state(-1);
  let isFocused = $state(false);
  let debounceTimer;

  const SEARCH_ENGINES = {
    google: { name: 'Google', url: 'https://www.google.com/search?q=' },
    duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' },
    brave: { name: 'Brave', url: 'https://search.brave.com/search?q=' }
  };

  let engineKey = $derived($settingsStore.searchEngine || 'google');
  let currentEngine = $derived(SEARCH_ENGINES[engineKey] || SEARCH_ENGINES.google);
  let searchInNewTab = $derived($settingsStore.searchInNewTab);

  function handleInput() {
    selectedIndex = -1;
    clearTimeout(debounceTimer);
    if (!query.trim()) {
      suggestions = [];
      return;
    }
    debounceTimer = setTimeout(async () => {
      suggestions = await getSearchSuggestions(query);
    }, 200);
  }

  function handleKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        selectedIndex = (selectedIndex + 1) % suggestions.length;
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length;
      }
    } else if (e.key === 'Escape') {
      suggestions = [];
      selectedIndex = -1;
      inputEl?.blur();
    }
  }

  function executeSearch(searchQuery) {
    const q = (searchQuery || query).trim();
    if (!q) return;

    let targetUrl;
    if (/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/i.test(q) && !q.includes(' ')) {
      targetUrl = q.startsWith('http') ? q : 'https://' + q;
    } else {
      targetUrl = currentEngine.url + encodeURIComponent(q);
    }

    if (searchInNewTab) {
      window.open(targetUrl, '_blank');
    } else {
      window.location.href = targetUrl;
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      executeSearch(suggestions[selectedIndex]);
    } else {
      executeSearch();
    }
  }

  function clearQuery() {
    query = '';
    suggestions = [];
    selectedIndex = -1;
    inputEl?.focus();
  }

  function handleGlobalShortcut(e) {
    if (e.key === '/' || (e.ctrlKey && e.key === 'k')) {
      if (document.activeElement !== inputEl) {
        e.preventDefault();
        inputEl?.focus();
      }
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleGlobalShortcut);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleGlobalShortcut);
    }
  });
</script>

<div class="search-container animate-fade-in">
  <form on:submit={handleSubmit} class="search-form {isFocused ? 'focused' : ''}">
    <div class="search-icon-wrapper">
      <Search size={20} class="search-icon" />
    </div>

    <input
      bind:this={inputEl}
      bind:value={query}
      on:input={handleInput}
      on:keydown={handleKeydown}
      on:focus={() => (isFocused = true)}
      on:blur={() => setTimeout(() => (isFocused = false), 150)}
      type="text"
      placeholder="Buscar en Google o escribir URL..."
      autocomplete="off"
      spellcheck="false"
      class="search-input"
    />

    {#if query}
      <button type="button" on:click={clearQuery} class="btn-clear" aria-label="Limpiar búsqueda">
        <X size={18} />
      </button>
    {/if}

    <button type="submit" class="btn-submit" aria-label="Buscar">
      <ArrowUpRight size={18} />
    </button>
  </form>

  {#if suggestions.length > 0 && isFocused}
    <ul class="suggestions-list glass-card">
      {#each suggestions as suggestion, index}
        <li
          class="suggestion-item {index === selectedIndex ? 'selected' : ''}"
          on:mousedown={() => executeSearch(suggestion)}
        >
          <Search size={14} class="suggestion-icon" />
          <span class="suggestion-text">{suggestion}</span>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
    width: 100%;
    max-width: 640px;
    margin: 0 auto 2rem auto;
    z-index: 20;
  }

  .search-form {
    display: flex;
    align-items: center;
    width: 100%;
    height: 56px;
    padding: 0 12px 0 18px;
    background: rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 28px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .search-form:hover {
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3);
  }

  .search-form.focused {
    background: rgba(255, 255, 255, 0.28);
    border-color: rgba(56, 189, 248, 0.8);
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.25), 0 14px 40px rgba(0, 0, 0, 0.35);
    transform: translateY(-2px);
  }

  .search-icon-wrapper {
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.8);
    margin-right: 12px;
  }

  .search-input {
    flex: 1;
    height: 100%;
    font-size: 1.1rem;
    font-weight: 500;
    color: #ffffff;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .btn-clear, .btn-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.85);
    transition: all 0.2s ease;
  }

  .btn-clear:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }

  .btn-submit {
    background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
    color: #ffffff;
    margin-left: 6px;
    box-shadow: 0 4px 12px rgba(56, 189, 248, 0.4);
  }

  .btn-submit:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(56, 189, 248, 0.6);
  }

  /* Suggestions Dropdown */
  .suggestions-list {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    list-style: none;
    padding: 8px;
    margin: 0;
    border-radius: 18px;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
    z-index: 100;
    overflow: hidden;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 0.98rem;
    color: rgba(255, 255, 255, 0.85);
    transition: background 0.15s ease, color 0.15s ease;
  }

  .suggestion-item:hover, .suggestion-item.selected {
    background: rgba(255, 255, 255, 0.18);
    color: #ffffff;
  }

  :global(.suggestion-icon) {
    margin-right: 12px;
    color: rgba(255, 255, 255, 0.5);
  }
</style>
