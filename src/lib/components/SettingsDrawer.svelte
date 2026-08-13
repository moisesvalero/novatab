<script>
  import { settingsStore } from '$lib/stores/settingsStore';
  import { backgroundStore } from '$lib/stores/backgroundStore';
  import { X, Settings, Image, RotateCcw, Download } from '@lucide/svelte';

  let { isOpen = $bindable(false) } = $props();

  let settings = $derived($settingsStore);
  let bg = $derived($backgroundStore);

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
</script>

{#if isOpen}
  <div class="drawer-backdrop" onclick={close}>
    <aside class="drawer-panel glass-card animate-fade-in" onclick={(e) => e.stopPropagation()}>
      <div class="drawer-header">
        <div class="title-box">
          <Settings size={20} class="header-icon" />
          <h2>Ajustes de NovaTab</h2>
        </div>
        <button type="button" class="btn-close" onclick={close}>
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
            <div>
              <label for="tabEmoji">Icono Pestaña</label>
              <input 
                id="tabEmoji" 
                type="text" 
                maxLength={2}
                bind:value={settings.tabEmoji} 
                oninput={() => settingsStore.set(settings)}
                placeholder="⚡"
              />
            </div>
            <div>
              <label for="tabTitle">Título Pestaña</label>
              <input 
                id="tabTitle" 
                type="text" 
                bind:value={settings.tabTitle} 
                oninput={() => settingsStore.set(settings)}
                placeholder="NovaTab"
              />
            </div>
          </div>

          <div class="row">
            <label for="searchEngine">Motor de Búsqueda</label>
            <select 
              id="searchEngine" 
              bind:value={settings.searchEngine}
              onchange={() => settingsStore.set(settings)}
            >
              <option value="google">Google (Recomendado)</option>
              <option value="duckduckgo">DuckDuckGo</option>
              <option value="bing">Bing</option>
              <option value="brave">Brave Search</option>
            </select>
          </div>
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
              <span>Buscador Google</span>
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
    </aside>
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
    margin-bottom: 12px;
  }

  .row.split {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 12px;
  }

  label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }

  input[type='text'], select {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 10px;
    color: #ffffff;
    font-size: 0.9rem;
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

  .range-row input[type='range'] {
    accent-color: #38bdf8;
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
</style>
