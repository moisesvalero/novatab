<script>
  import { onMount } from 'svelte';
  import { fly, fade, scale } from 'svelte/transition';
  import { quintOut, cubicOut } from 'svelte/easing';

  import { settingsStore } from '$lib/stores/settingsStore';
  import { backgroundStore } from '$lib/stores/backgroundStore';
  
  import Background from '$lib/components/Background.svelte';
  import Clock from '$lib/components/Clock.svelte';
  import Greetings from '$lib/components/Greetings.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import QuickLinks from '$lib/components/QuickLinks.svelte';
  import Quotes from '$lib/components/Quotes.svelte';
  import Pomodoro from '$lib/components/Pomodoro.svelte';
  import Notes from '$lib/components/Notes.svelte';
  import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
  import { authStore } from '$lib/firebase/authStore';
  import { syncStatus } from '$lib/firebase/syncService';

  import { Settings, Image, Sun, Moon, Monitor } from '@lucide/svelte';

  let isLoaded = $state(false);
  let isSettingsOpen = $state(false);
  let widgets = $derived($settingsStore.widgets);
  let currentTheme = $derived($settingsStore.theme || 'system');
  let authState = $derived($authStore);
  let syncState = $derived($syncStatus);

  onMount(() => {
    // Elegant frame mount trigger
    requestAnimationFrame(() => {
      isLoaded = true;
    });
  });

  function toggleSettings() {
    isSettingsOpen = !isSettingsOpen;
  }

  function handleNextBg() {
    backgroundStore.nextBackground();
  }

  function handleCycleTheme() {
    settingsStore.cycleTheme();
  }
</script>

<main class="page-main">
  <h1 class="sr-only">NovaTab — Startpage &amp; Nueva Pestaña Minimalista</h1>

  <!-- Dynamic Background -->
  <Background />

  <!-- Central Interface Content with Fluid Svelte Transitions -->
  {#if isLoaded}
    <div 
      class="content-wrapper"
      in:fly={{ y: 28, duration: 1100, delay: 100, easing: quintOut }}
    >
      <!-- Clock & Date -->
      {#if widgets.clock}
        <Clock />
      {/if}

      <!-- Greetings & Integrated Weather -->
      {#if widgets.greetings}
        <Greetings />
      {/if}

      <!-- Central Google Search Bar -->
      {#if widgets.search}
        <SearchBar />
      {/if}

      <!-- Quick Links Grid -->
      {#if widgets.quickLinks}
        <QuickLinks />
      {/if}

      <!-- Additional Optional Widgets -->
      {#if widgets.quotes}
        <Quotes />
      {/if}

      {#if widgets.pomodoro}
        <Pomodoro />
      {/if}

      {#if widgets.notes}
        <Notes />
      {/if}
    </div>
  {/if}

  <!-- Floating Quick Actions -->
  {#if isLoaded}
    <div 
      class="floating-controls"
      in:fade={{ duration: 1200, delay: 400, easing: cubicOut }}
    >
      <button 
        type="button" 
        class="float-btn glass-panel" 
        onclick={handleNextBg}
        title="Cambiar fondo de pantalla"
        aria-label="Cambiar fondo de pantalla"
      >
        <Image size={15} />
      </button>

      <!-- Theme Toggle -->
      <button
        type="button"
        class="float-btn glass-panel"
        onclick={handleCycleTheme}
        title={currentTheme === 'system' ? 'Tema: Sistema (clic para cambiar)' : currentTheme === 'light' ? 'Tema: Claro (clic para cambiar)' : 'Tema: Oscuro (clic para cambiar)'}
        aria-label="Cambiar tema de color"
      >
        {#if currentTheme === 'light'}
          <Sun size={15} />
        {:else if currentTheme === 'dark'}
          <Moon size={15} />
        {:else}
          <Monitor size={15} />
        {/if}
      </button>

      <button 
        type="button" 
        class="float-btn glass-panel relative-btn" 
        onclick={toggleSettings}
        title={authState?.user ? `Conectado como ${authState.user.email || 'usuario'} (${syncState?.status || 'listo'})` : 'Ajustes de NovaTab'}
        aria-label={authState?.user ? `Ajustes de NovaTab. Conectado como ${authState.user.email || 'usuario'}` : 'Ajustes de NovaTab'}
      >
        <Settings size={15} />
        {#if authState?.user}
          <span class="sync-dot {syncState?.status || ''}" aria-hidden="true"></span>
        {/if}
      </button>
    </div>
  {/if}

  <!-- Settings Drawer -->
  <SettingsDrawer bind:isOpen={isSettingsOpen} />
</main>

<style>
  .page-main {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 20px;
    z-index: 1;
  }

  .content-wrapper {
    width: 100%;
    max-width: 680px;
    margin: auto 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
  }

  .floating-controls {
    position: fixed;
    bottom: 16px;
    right: 20px;
    display: flex;
    gap: 8px;
    z-index: 20;
  }

  .float-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.85);
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .float-btn:hover {
    transform: translateY(-2px) scale(1.08);
    background: rgba(255, 255, 255, 0.25);
    color: #ffffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  }

  .relative-btn {
    position: relative;
  }

  .sync-dot {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid #0f172a;
  }

  .sync-dot.synced {
    background: #4ade80;
  }

  .sync-dot.syncing {
    background: #38bdf8;
    animation: pulse 1s infinite;
  }

  .sync-dot.error {
    background: #f87171;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }
</style>
