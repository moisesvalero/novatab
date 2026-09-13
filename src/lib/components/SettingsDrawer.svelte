<script>
  import { settingsStore } from '$lib/stores/settingsStore';
  import { backgroundStore } from '$lib/stores/backgroundStore';
  import { weatherStore } from '$lib/stores/weatherStore';
  import { linksStore } from '$lib/stores/linksStore';
  import { parseBookmarksHtml } from '$lib/utils/bookmarkParser';
  import { searchCities } from '$lib/utils/weather';
  import { X, Settings, Image, RotateCcw, Download, MapPin, Locate, Loader2, Upload, Check, CircleAlert } from '@lucide/svelte';

  let { isOpen = $bindable(false) } = $props();

  let settings = $derived($settingsStore);
  let bg = $derived($backgroundStore);
  let weatherState = $derived($weatherStore);

  let citySearchQuery = $state('');
  let citySearchResults = $state([]);
  let isSearchingCity = $state(false);
  let searchDebounce;

  let fileInputEl = $state(null);
  let replaceExistingBookmarks = $state(false);
  let importStatus = $state(null);
  let importStatusTimer;

  function triggerBookmarkFileSelect() {
    importStatus = null;
    fileInputEl?.click();
  }

  function handleBookmarkFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limpiar para permitir seleccionar el mismo archivo de nuevo
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') {
          importStatus = {
            type: 'error',
            message: 'No se pudo leer el archivo seleccionado.',
          };
          return;
        }

        const { bookmarks } = parseBookmarksHtml(content);
        if (bookmarks.length === 0) {
          importStatus = {
            type: 'error',
            message: 'No se encontraron marcadores válidos en el archivo HTML.',
          };
          return;
        }

        const result = linksStore.importLinks(bookmarks, { replace: replaceExistingBookmarks });

        if (replaceExistingBookmarks) {
          importStatus = {
            type: 'success',
            message: `¡${result.addedCount} marcadores importados con éxito (reemplazando anteriores)!`,
          };
        } else {
          const msg =
            result.duplicatesSkipped > 0
              ? `¡${result.addedCount} marcadores importados (+${result.duplicatesSkipped} omitidos por estar repetidos)!`
              : `¡${result.addedCount} marcadores importados con éxito!`;
          importStatus = {
            type: 'success',
            message: msg,
          };
        }

        clearTimeout(importStatusTimer);
        importStatusTimer = setTimeout(() => {
          importStatus = null;
        }, 6000);
      } catch (err) {
        console.error('Error importing bookmarks:', err);
        importStatus = {
          type: 'error',
          message: 'Ocurrió un error al procesar el archivo de marcadores.',
        };
      }
    };

    reader.onerror = () => {
      importStatus = {
        type: 'error',
        message: 'Error al abrir el archivo de marcadores.',
      };
    };

    reader.readAsText(file);
  }

  function handleCitySearchInput(e) {
    const val = e.target.value;
    citySearchQuery = val;
    clearTimeout(searchDebounce);
    if (!val || val.trim().length < 2) {
      citySearchResults = [];
      isSearchingCity = false;
      return;
    }
    isSearchingCity = true;
    searchDebounce = setTimeout(async () => {
      citySearchResults = await searchCities(val);
      isSearchingCity = false;
    }, 350);
  }

  function selectCity(city) {
    weatherStore.setCity(city);
    settingsStore.update((s) => ({ ...s, weatherCity: city.name }));
    citySearchQuery = '';
    citySearchResults = [];
  }

  function handleDetectLocation() {
    weatherStore.requestGeolocation();
  }

  function close() {
    isOpen = false;
  }

  function handleNextBackground() {
    backgroundStore.nextBackground();
  }

  function handleFrequencyChange(e) {
    backgroundStore.setFrequency(e.target.value);
  }

  function handleBlurChange(e) {
    backgroundStore.setBlur(parseInt(e.target.value, 10));
  }

  function handleDarknessChange(e) {
    backgroundStore.setDarkness(parseInt(e.target.value, 10));
  }

  function exportSettings() {
    const data = {
      settings: $settingsStore,
      background: $backgroundStore,
      links: JSON.parse(localStorage.getItem('novatab_links') || '[]')
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'novatab_config.json';
    a.click();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && isOpen) {
      close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div 
    class="drawer-backdrop animate-fade-in" 
    onclick={(e) => { if (e.target === e.currentTarget) close(); }}
    role="presentation"
  >
    <div 
      class="drawer-panel glass-card animate-slide-right" 
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      tabindex="-1"
    >
      <div class="drawer-header">
        <div class="title-box">
          <Settings size={20} class="header-icon" />
          <h2 id="settings-title">Ajustes de NovaTab</h2>
        </div>
        <button type="button" class="btn-close" onclick={close} aria-label="Cerrar ajustes">
          <X size={20} />
        </button>
      </div>

      <div class="drawer-content">
        <!-- GENERAL SECTION -->
        <section class="section">
          <h3>Personalización Principal</h3>

          <div class="row">
            <label for="userName">Tu Nombre</label>
            <input 
              id="userName" 
              type="text" 
              bind:value={settings.userName} 
              oninput={() => settingsStore.set(settings)}
              placeholder="Ej: Moisés"
            />
          </div>

          <div class="row split">
            <div class="field-col">
              <label for="tabEmoji">Icono</label>
              <input 
                id="tabEmoji" 
                type="text" 
                maxLength={4}
                class="emoji-input"
                bind:value={settings.tabEmoji} 
                oninput={() => settingsStore.set(settings)}
                placeholder="⚡"
                aria-label="Icono o emoji de la pestaña"
              />
            </div>
            <div class="field-col">
              <label for="tabTitle">Título de Pestaña</label>
              <input 
                id="tabTitle" 
                type="text" 
                bind:value={settings.tabTitle} 
                oninput={() => settingsStore.set(settings)}
                placeholder="NovaTab"
                aria-label="Título de la pestaña"
              />
            </div>
          </div>

          <div class="row">
            <label for="searchEngine">Motor de Búsqueda</label>
            <select 
              id="searchEngine" 
              value={settings.searchEngine || 'google'}
              onchange={(e) => settingsStore.update((s) => ({ ...s, searchEngine: e.target.value }))}
            >
              <option value="google">Google (Recomendado)</option>
              <option value="duckduckgo">DuckDuckGo</option>
              <option value="bing">Bing</option>
              <option value="brave">Brave Search</option>
              <option value="yahoo">Yahoo</option>
            </select>
          </div>

          <label class="toggle-item margin-top">
            <span>Abrir búsqueda en nueva pestaña</span>
            <input 
              id="searchInNewTab" 
              type="checkbox" 
              checked={settings.searchInNewTab} 
              onchange={(e) => settingsStore.update((s) => ({ ...s, searchInNewTab: e.target.checked }))}
            />
          </label>
        </section>

        <!-- BACKGROUND SECTION -->
        <section class="section">
          <h3>Fondo de Pantalla</h3>

          <button type="button" class="btn-primary-action" onclick={handleNextBackground}>
            <Image size={16} /> Cambiar al siguiente fondo
          </button>

          <div class="row">
            <label for="bgFrequency">Frecuencia de Cambio</label>
            <select 
              id="bgFrequency" 
              value={bg.changeFrequency}
              onchange={handleFrequencyChange}
            >
              <option value="daily">Una foto al día (Recomendado)</option>
              <option value="newtab">En cada pestaña nueva</option>
              <option value="manual">Manual (Solo al hacer clic)</option>
            </select>
          </div>

          <div class="row range-row">
            <label for="bgBlur">Desenfoque (Blur): {bg.blur}px</label>
            <input 
              id="bgBlur" 
              type="range" 
              min="0" 
              max="25" 
              value={bg.blur} 
              oninput={handleBlurChange}
            />
          </div>

          <div class="row range-row">
            <label for="bgDarkness">Oscurecimiento: {bg.darkness}%</label>
            <input 
              id="bgDarkness" 
              type="range" 
              min="0" 
              max="80" 
              value={bg.darkness} 
              oninput={handleDarknessChange}
            />
          </div>
        </section>

        <!-- WIDGET TOGGLES -->
        <section class="section">
          <h3>Visibilidad de Widgets</h3>

          <div class="toggle-grid">
            <label class="toggle-item">
              <span>Buscador web</span>
              <input 
                type="checkbox" 
                checked={settings.widgets.search} 
                onchange={() => settingsStore.toggleWidget('search')}
              />
            </label>

            <label class="toggle-item">
              <span>Reloj</span>
              <input 
                type="checkbox" 
                checked={settings.widgets.clock} 
                onchange={() => settingsStore.toggleWidget('clock')}
              />
            </label>

            <label class="toggle-item">
              <span>Saludo</span>
              <input 
                type="checkbox" 
                checked={settings.widgets.greetings} 
                onchange={() => settingsStore.toggleWidget('greetings')}
              />
            </label>

            <label class="toggle-item">
              <span>Accesos Directos</span>
              <input 
                type="checkbox" 
                checked={settings.widgets.quickLinks} 
                onchange={() => settingsStore.toggleWidget('quickLinks')}
              />
            </label>

            <label class="toggle-item">
              <span>Clima en Vivo</span>
              <input 
                type="checkbox" 
                checked={settings.widgets.weather} 
                onchange={() => settingsStore.toggleWidget('weather')}
              />
            </label>

            <label class="toggle-item">
              <span>Frases del día</span>
              <input 
                type="checkbox" 
                checked={settings.widgets.quotes} 
                onchange={() => settingsStore.toggleWidget('quotes')}
              />
            </label>

            <label class="toggle-item">
              <span>Pomodoro Timer</span>
              <input 
                type="checkbox" 
                checked={settings.widgets.pomodoro} 
                onchange={() => settingsStore.toggleWidget('pomodoro')}
              />
            </label>

            <label class="toggle-item">
              <span>Bloc de Notas</span>
              <input 
                type="checkbox" 
                checked={settings.widgets.notes} 
                onchange={() => settingsStore.toggleWidget('notes')}
              />
            </label>
          </div>
        </section>

        <!-- CLOCK OPTIONS -->
        <section class="section">
          <h3>Opciones de Reloj</h3>

          <div class="row">
            <label for="clockType">Tipo de Reloj</label>
            <select 
              id="clockType" 
              bind:value={settings.clockType}
              onchange={() => settingsStore.set(settings)}
            >
              <option value="digital">Digital</option>
              <option value="analog">Analógico</option>
            </select>
          </div>

          <div class="row">
            <label for="clockFormat">Formato de Hora</label>
            <select 
              id="clockFormat" 
              bind:value={settings.clockFormat}
              onchange={() => settingsStore.set(settings)}
            >
              <option value="24h">24 Horas (14:30)</option>
              <option value="12h">12 Horas (2:30 PM)</option>
            </select>
          </div>

          <label class="toggle-item margin-top">
            <span>Mostrar Segundos</span>
            <input 
              type="checkbox" 
              bind:checked={settings.showSeconds}
              onchange={() => settingsStore.set(settings)}
            />
          </label>
        </section>

        <!-- CLIMA & UBICACIÓN -->
        <section class="section">
          <h3>Clima y Ubicación</h3>

          <div class="location-status-card">
            <div class="loc-badge-row">
              <MapPin size={16} class="loc-icon" />
              <span class="loc-name">
                {weatherState.location?.city || 'Madrid'}
                {#if weatherState.location?.country}
                  <span class="loc-country">({weatherState.location.country})</span>
                {/if}
              </span>
              <span class="mode-tag {weatherState.location?.mode || 'default'}">
                {#if weatherState.location?.mode === 'auto'}
                  GPS Guardado
                {:else if weatherState.location?.mode === 'manual'}
                  Manual
                {:else}
                  Por Defecto
                {/if}
              </span>
            </div>

            <p class="loc-description">
              {#if weatherState.location?.mode === 'auto'}
                Ubicación recordada permanentemente. NovaTab no volverá a solicitar permisos en cada pestaña.
              {:else if weatherState.location?.mode === 'manual'}
                Ciudad fijada manualmente. Las predicciones del tiempo se actualizan para esta ubicación.
              {:else}
                Ubicación por defecto (Madrid). Puedes elegir tu ciudad o pulsar detectar una sola vez.
              {/if}
            </p>

            {#if weatherState.error}
              <p class="loc-error">{weatherState.error}</p>
            {/if}
          </div>

          <button 
            type="button" 
            class="btn-primary-action loc-btn"
            onclick={handleDetectLocation}
            disabled={weatherState.isLocating}
          >
            {#if weatherState.isLocating}
              <Loader2 size={16} class="spin" />
              <span>Detectando coordenadas...</span>
            {:else}
              <Locate size={16} />
              <span>Detectar mi ubicación actual</span>
            {/if}
          </button>

          <div class="row">
            <label for="citySearch">O buscar otra ciudad</label>
            <div class="city-search-box">
              <input 
                id="citySearch"
                type="text" 
                placeholder="Ej. Valencia, Barcelona, Sevilla..."
                value={citySearchQuery}
                oninput={handleCitySearchInput}
                autocomplete="off"
              />
              {#if isSearchingCity}
                <div class="city-search-spinner">
                  <Loader2 size={15} class="spin" />
                </div>
              {/if}
            </div>

            {#if citySearchResults.length > 0}
              <ul class="city-suggestions animate-fade-in">
                {#each citySearchResults as cityResult}
                  <li>
                    <button 
                      type="button" 
                      class="city-suggest-item"
                      onclick={() => selectCity(cityResult)}
                    >
                      <MapPin size={14} />
                      <div class="city-suggest-info">
                        <span class="city-suggest-name">{cityResult.name}</span>
                        <span class="city-suggest-sub">
                          {[cityResult.admin1, cityResult.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </section>

        <!-- IMPORT BOOKMARKS -->
        <section class="section">
          <h3>Importar Marcadores</h3>
          <p class="section-desc">
            Importa tus favoritos exportados desde Chrome, Brave, Firefox, Edge o Safari con 1 clic.
          </p>

          <input 
            type="file" 
            accept=".html,.htm" 
            bind:this={fileInputEl} 
            onchange={handleBookmarkFileChange} 
            style="display: none;" 
            aria-hidden="true"
          />

          <button 
            type="button" 
            class="btn-primary-action" 
            onclick={triggerBookmarkFileSelect}
          >
            <Upload size={16} /> Importar Marcadores HTML
          </button>

          <label class="toggle-item margin-top small-toggle">
            <span>Reemplazar marcadores existentes</span>
            <input 
              type="checkbox" 
              bind:checked={replaceExistingBookmarks} 
            />
          </label>

          {#if importStatus}
            <div class="status-banner {importStatus.type} animate-fade-in" role="status">
              {#if importStatus.type === 'success'}
                <Check size={16} class="banner-icon" />
              {:else}
                <CircleAlert size={16} class="banner-icon" />
              {/if}
              <span>{importStatus.message}</span>
            </div>
          {/if}
        </section>

        <!-- EXPORT & RESET -->
        <section class="section footer-actions">
          <button type="button" class="btn-sec" onclick={exportSettings}>
            <Download size={15} /> Exportar Ajustes
          </button>
          <button type="button" class="btn-reset" onclick={() => settingsStore.reset()}>
            <RotateCcw size={15} /> Restaurar Por Defecto
          </button>
        </section>
      </div>
    </div>
  </div>
{/if}

<style>
  .drawer-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    z-index: 999;
    display: flex;
    justify-content: flex-end;
  }

  .drawer-panel {
    width: 100%;
    max-width: 440px;
    height: 100vh;
    background: rgba(15, 23, 42, 0.92);
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    box-shadow: -15px 0 40px rgba(0, 0, 0, 0.5);
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }

  .title-box {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ffffff;
  }

  .drawer-header h2 {
    font-size: 1.15rem;
    font-weight: 600;
  }

  .btn-close {
    color: rgba(255, 255, 255, 0.6);
    padding: 6px;
    border-radius: 50%;
  }

  .btn-close:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }

  .drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .section h3 {
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #38bdf8;
    margin-bottom: 14px;
  }

  .row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
    width: 100%;
  }

  .row.split {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 12px;
    align-items: start;
    width: 100%;
  }

  .field-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    width: 100%;
  }

  .emoji-input {
    text-align: center;
    font-size: 1.15rem;
  }

  label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
  }

  input[type='text'],
  select {
    width: 100%;
    box-sizing: border-box;
    min-width: 0;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 10px;
    color: #ffffff;
    font-size: 0.92rem;
    transition: all 0.2s ease;
  }

  input[type='text']:focus,
  select:focus {
    border-color: #38bdf8;
    background: rgba(255, 255, 255, 0.14);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
  }

  select option {
    background: #0f172a;
    color: #ffffff;
  }

  .btn-primary-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 12px;
    color: #ffffff;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 16px;
    transition: background 0.2s ease;
  }

  .btn-primary-action:hover {
    background: rgba(255, 255, 255, 0.22);
  }

  .toggle-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .toggle-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    cursor: pointer;
  }

  .toggle-item input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: #38bdf8;
  }

  .margin-top {
    margin-top: 10px;
  }

  .section-desc {
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.65);
    margin: -4px 0 14px 0;
    line-height: 1.45;
  }

  .small-toggle {
    font-size: 0.84rem;
    padding: 8px 12px;
  }

  .status-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 10px;
    margin-top: 10px;
    font-size: 0.84rem;
    line-height: 1.4;
  }

  .status-banner.success {
    background: rgba(34, 197, 94, 0.16);
    border: 1px solid rgba(34, 197, 94, 0.35);
    color: #4ade80;
  }

  .status-banner.error {
    background: rgba(239, 68, 68, 0.16);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #f87171;
  }

  :global(.banner-icon) {
    flex-shrink: 0;
  }

  .footer-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .btn-sec, .btn-reset {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border-radius: 10px;
    font-size: 0.88rem;
    font-weight: 500;
  }

  .btn-sec {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  .btn-reset {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .location-status-card {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 12px 14px;
    margin-bottom: 12px;
  }

  .loc-badge-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :global(.loc-icon) {
    color: #38bdf8;
    flex-shrink: 0;
  }

  .loc-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .loc-country {
    font-size: 0.8rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.6);
  }

  .mode-tag {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .mode-tag.auto {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .mode-tag.manual {
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.3);
  }

  .mode-tag.default {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .loc-description {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.65);
    margin-top: 6px;
    line-height: 1.35;
  }

  .loc-error {
    font-size: 0.78rem;
    color: #f87171;
    margin-top: 6px;
  }

  .loc-btn {
    margin-bottom: 14px;
    cursor: pointer;
  }

  .loc-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .city-search-box {
    position: relative;
    width: 100%;
  }

  .city-search-spinner {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #38bdf8;
    display: flex;
    align-items: center;
  }

  .city-suggestions {
    list-style: none;
    margin: 6px 0 0;
    padding: 4px;
    background: rgba(15, 23, 42, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    max-height: 200px;
    overflow-y: auto;
  }

  .city-suggest-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    text-align: left;
    transition: background 0.15s ease;
  }

  .city-suggest-item:hover {
    background: rgba(56, 189, 248, 0.15);
    color: #ffffff;
  }

  .city-suggest-info {
    display: flex;
    flex-direction: column;
  }

  .city-suggest-name {
    font-size: 0.88rem;
    font-weight: 500;
  }

  .city-suggest-sub {
    font-size: 0.74rem;
    color: rgba(255, 255, 255, 0.5);
  }

  :global(.spin) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
