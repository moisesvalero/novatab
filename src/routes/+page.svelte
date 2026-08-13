<script>
  import { settingsStore } from '$lib/stores/settingsStore';
  import { backgroundStore } from '$lib/stores/backgroundStore';
  
  import Background from '$lib/components/Background.svelte';
  import Clock from '$lib/components/Clock.svelte';
  import Greetings from '$lib/components/Greetings.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import QuickLinks from '$lib/components/QuickLinks.svelte';
  import Weather from '$lib/components/Weather.svelte';
  import Quotes from '$lib/components/Quotes.svelte';
  import Pomodoro from '$lib/components/Pomodoro.svelte';
  import Notes from '$lib/components/Notes.svelte';
  import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';

  import { Settings, Image } from '@lucide/svelte';

  let isSettingsOpen = $state(false);
  let widgets = $derived($settingsStore.widgets);

  function toggleSettings() {
    isSettingsOpen = !isSettingsOpen;
  }

  function handleNextBg() {
    backgroundStore.nextBackground();
  }
</script>

<main class="page-main">
  <!-- Dynamic Background -->
  <Background />

  <!-- Top bar widgets (Weather) -->
  <header class="top-bar">
    {#if widgets.weather}
      <Weather />
    {/if}
  </header>

  <!-- Central Interface Content -->
  <div class="content-wrapper">
    <!-- Clock & Date -->
    {#if widgets.clock}
      <Clock />
    {/if}

    <!-- Greetings -->
    {#if widgets.greetings}
      <Greetings />
    {/if}

    <!-- Buscador Google Central -->
    {#if widgets.search}
      <SearchBar />
    {/if}

    <!-- Quick Links Grid -->
    {#if widgets.quickLinks}
      <QuickLinks />
    {/if}

    <!-- Additional Widgets -->
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

  <!-- Floating Quick Actions (Settings & Change BG) -->
  <div class="floating-controls">
    <button 
      type="button" 
      class="float-btn glass-panel" 
      onclick={handleNextBg}
      title="Cambiar fondo de pantalla"
    >
      <Image size={18} />
    </button>

    <button 
      type="button" 
      class="float-btn glass-panel" 
      onclick={toggleSettings}
      title="Ajustes de NovaTab"
    >
      <Settings size={18} />
    </button>
  </div>

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
    justify-content: space-between;
    padding: 24px 20px;
    z-index: 1;
  }

  .top-bar {
    width: 100%;
    max-width: 1200px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    z-index: 10;
  }

  .content-wrapper {
    width: 100%;
    max-width: 900px;
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
    gap: 10px;
    z-index: 20;
  }

  .float-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .float-btn:hover {
    transform: scale(1.1) rotate(15deg);
    background: rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
</style>
