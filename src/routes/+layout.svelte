<script>
  import '$lib/styles/app.css';
  import { onMount } from 'svelte';
  import { settingsStore } from '$lib/stores/settingsStore';
  import { syncService } from '$lib/firebase/syncService';

  let { children } = $props();

  onMount(() => {
    syncService.init();
  });

  let settings = $derived($settingsStore);
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
