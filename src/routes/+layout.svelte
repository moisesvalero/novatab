<script>
  import '$lib/styles/app.css';
  import { onMount } from 'svelte';
  import { settingsStore } from '$lib/stores/settingsStore';
  import { syncService } from '$lib/firebase/syncService';

  let { children } = $props();

  let settings = $derived($settingsStore);

  function applyTheme(themeChoice) {
    if (typeof window === 'undefined') return;
    let effective = themeChoice || 'system';
    if (effective === 'system') {
      effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effective);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effective === 'dark' ? '#080c14' : '#f8fafc');
    }
  }

  onMount(() => {
    syncService.init();

    // Listen to OS system color-scheme changes in real-time
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if ($settingsStore.theme === 'system' || !$settingsStore.theme) {
        applyTheme('system');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  });

  $effect(() => {
    applyTheme(settings.theme);
  });

  let tabTitle = $derived(
    settings.tabTitle && settings.tabTitle !== 'NovaTab'
      ? settings.tabTitle
      : 'NovaTab — Startpage & Nueva Pestaña Minimalista'
  );
</script>

<svelte:head>
  <title>{tabTitle}</title>
  <meta name="description" content="NovaTab es una Startpage minimalista e hiperrápida inspirada en Bonjourr. Fondos HD de Unsplash, buscador central en tiempo real, clima en vivo y accesos directos." />
</svelte:head>

{@render children?.()}
