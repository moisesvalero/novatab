<script>
  import '$lib/styles/app.css';
  import { settingsStore } from '$lib/stores/settingsStore';

  let { children } = $props();

  let settings = $derived($settingsStore);
  let tabTitle = $derived(
    settings.tabTitle && settings.tabTitle !== 'NovaTab'
      ? settings.tabTitle
      : 'NovaTab — Startpage & Nueva Pestaña Minimalista'
  );
  let tabEmoji = $derived(settings.tabEmoji || '⚡');
</script>

<svelte:head>
  <title>{tabTitle}</title>
  <link
    rel="icon"
    href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>{tabEmoji}</text></svg>"
  />
  <meta name="description" content="NovaTab es una Startpage minimalista e hiperrápida inspirada en Bonjourr. Fondos HD de Unsplash, buscador central en tiempo real, clima en vivo y accesos directos." />
</svelte:head>

{@render children?.()}
