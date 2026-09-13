<script>
  import { onMount, onDestroy } from 'svelte';
  import { settingsStore } from '$lib/stores/settingsStore';
  import { SEARCH_ENGINES, getEngine, buildSearchUrl } from '$lib/constants/searchEngines';
  import { getSearchSuggestions } from '$lib/utils/searchSuggest';
  import SearchEngineIcon from '$lib/components/SearchEngineIcon.svelte';
  import { Search, X, ArrowUpRight, ChevronDown, Check } from '@lucide/svelte';

  let query = $state('');
  let inputEl = $state(null);
  let pickerContainerEl = $state(null);
  let suggestions = $state([]);
  let selectedIndex = $state(-1);
  let isFocused = $state(false);
  let isPickerOpen = $state(false);
  let debounceTimer;

  let engineKey = $derived($settingsStore.searchEngine || 'google');
  let currentEngine = $derived(getEngine(engineKey));
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
      isPickerOpen = false;
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
      targetUrl = buildSearchUrl(engineKey, q);
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

  function togglePicker(e) {
    e.stopPropagation();
    isPickerOpen = !isPickerOpen;
  }

  function selectEngine(id) {
    settingsStore.update((s) => ({ ...s, searchEngine: id }));
    isPickerOpen = false;
    inputEl?.focus();
  }

  function isEditableElement(el) {
    if (!el) return false;
    const tagName = el.tagName;
    return (
      el.isContentEditable ||
      tagName === 'INPUT' ||
      tagName === 'TEXTAREA' ||
      tagName === 'SELECT'
    );
  }

  function handleGlobalShortcut(e) {
    // Cmd+K (Mac) or Ctrl+K (Windows/Linux) explicitly focuses the search bar
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      if (document.activeElement !== inputEl) {
        e.preventDefault();
        inputEl?.focus();
      }
      return;
    }

    // '/' alone focuses the search bar ONLY when user is not typing in an editable field
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (isEditableElement(document.activeElement) || isEditableElement(e.target)) {
        return;
      }
      if (document.activeElement !== inputEl) {
        e.preventDefault();
        inputEl?.focus();
      }
    }
  }

  function handleClickOutside(e) {
    if (isPickerOpen && pickerContainerEl && !pickerContainerEl.contains(e.target)) {
      isPickerOpen = false;
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleGlobalShortcut);
    window.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleGlobalShortcut);
      window.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<div class="search-container">
  <form onsubmit={handleSubmit} class="search-form {isFocused ? 'focused' : ''}">
    <div class="engine-picker-wrapper" bind:this={pickerContainerEl}>
      <button 
        type="button" 
        class="engine-btn" 
        onclick={togglePicker}
        title="Motor: {currentEngine.name} (Clic para cambiar)"
        aria-label="Cambiar motor de búsqueda. Actual: {currentEngine.name}"
        aria-expanded={isPickerOpen}
        aria-haspopup="listbox"
      >
        <SearchEngineIcon engine={engineKey} size={18} />
        <ChevronDown size={11} class="engine-chevron {isPickerOpen ? 'rotated' : ''}" />
      </button>

      {#if isPickerOpen}
        <ul 
          class="engine-menu glass-card animate-fade-in" 
          role="listbox" 
          aria-label="Elegir motor de búsqueda"
        >
          {#each Object.values(SEARCH_ENGINES) as engine}
            <li role="presentation">
              <button
                type="button"
                class="engine-option {engineKey === engine.id ? 'active' : ''}"
                onclick={() => selectEngine(engine.id)}
                role="option"
                aria-selected={engineKey === engine.id}
              >
                <SearchEngineIcon engine={engine.id} size={16} />
                <span class="engine-name">{engine.name}</span>
                {#if engineKey === engine.id}
                  <Check size={14} class="engine-check" />
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <input
      bind:this={inputEl}
      bind:value={query}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={() => (isFocused = true)}
      onblur={() => setTimeout(() => (isFocused = false), 150)}
      type="text"
      placeholder="Buscar en {currentEngine.name} o escribir URL..."
      autocomplete="off"
      spellcheck="false"
      class="search-input"
      aria-label="Buscar en {currentEngine.name} o escribir URL"
    />

    {#if query}
      <button type="button" onclick={clearQuery} class="btn-clear" aria-label="Limpiar búsqueda">
        <X size={16} />
      </button>
    {/if}

    <button type="submit" class="btn-submit" aria-label="Buscar en {currentEngine.name}">
      <ArrowUpRight size={16} />
    </button>
  </form>

  {#if suggestions.length > 0 && isFocused}
    <ul class="suggestions-list glass-card" aria-label="Sugerencias de búsqueda">
      {#each suggestions as suggestion, index}
        <li class="suggestion-wrapper">
          <button
            type="button"
            class="suggestion-item {index === selectedIndex ? 'selected' : ''}"
            onmousedown={() => executeSearch(suggestion)}
          >
            <Search size={13} class="suggestion-icon" />
            <span class="suggestion-text">{suggestion}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
    width: 100%;
    max-width: 520px;
    margin: 0 auto 1.4rem auto;
    z-index: 20;
  }

  .search-form {
    display: flex;
    align-items: center;
    width: 100%;
    height: 48px;
    padding: 0 10px 0 10px;
    background: rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 24px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    outline: none;
  }

  .search-form:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.38);
  }

  .search-form:focus-within,
  .search-form.focused {
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(56, 189, 248, 0.55);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15), 0 10px 30px rgba(0, 0, 0, 0.28);
    transform: translateY(-1px);
  }

  /* Engine Picker Dropdown */
  .engine-picker-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    margin-right: 8px;
    z-index: 105;
  }

  .engine-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.14);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .engine-btn:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.28);
    transform: scale(1.03);
  }

  :global(.engine-chevron) {
    color: rgba(255, 255, 255, 0.7);
    transition: transform 0.2s ease;
  }

  :global(.engine-chevron.rotated) {
    transform: rotate(180deg);
  }

  .engine-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 175px;
    max-height: 290px;
    overflow-y: auto;
    padding: 6px;
    margin: 0;
    list-style: none;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.92);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
    z-index: 120;
  }

  .engine-option {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 10px;
    padding: 7px 10px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.88rem;
    color: rgba(255, 255, 255, 0.85);
    text-align: left;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .engine-option:hover {
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
  }

  .engine-option.active {
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    font-weight: 600;
  }

  .engine-name {
    flex: 1;
    white-space: nowrap;
  }

  :global(.engine-check) {
    color: #38bdf8;
    margin-left: 6px;
  }

  .search-input {
    flex: 1;
    height: 100%;
    font-size: 0.96rem;
    font-weight: 500;
    color: #ffffff;
    background: transparent;
    border: none;
    outline: none !important;
    box-shadow: none !important;
    border-radius: 0;
  }

  .search-input:focus,
  .search-input:focus-visible {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .btn-clear, .btn-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.85);
    transition: all 0.2s ease;
    outline: none;
  }

  .engine-btn:focus,
  .engine-btn:focus-visible,
  .btn-clear:focus,
  .btn-clear:focus-visible,
  .btn-submit:focus,
  .btn-submit:focus-visible {
    outline: none;
    box-shadow: none;
  }

  .btn-clear:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }

  .btn-submit {
    background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
    color: #ffffff;
    margin-left: 4px;
    box-shadow: 0 3px 10px rgba(56, 189, 248, 0.4);
  }

  .btn-submit:hover {
    transform: scale(1.06);
  }

  /* Suggestions Dropdown */
  .suggestions-list {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    list-style: none;
    padding: 6px;
    margin: 0;
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.88);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    z-index: 100;
    overflow: hidden;
  }

  .suggestion-wrapper {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.92rem;
    color: rgba(255, 255, 255, 0.85);
    text-align: left;
    transition: background 0.15s ease;
  }

  .suggestion-item:hover, .suggestion-item.selected {
    background: rgba(255, 255, 255, 0.18);
    color: #ffffff;
  }

  :global(.suggestion-icon) {
    margin-right: 10px;
    color: rgba(255, 255, 255, 0.5);
  }
</style>
