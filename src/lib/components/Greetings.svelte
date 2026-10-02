<script>
  import { onMount } from 'svelte';
  import { settingsStore } from '$lib/stores/settingsStore';
  import { weatherStore } from '$lib/stores/weatherStore';

  let greetingText = $derived.by(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 20) {
      return 'Buenas Tardes';
    } else if (hour >= 20 || hour < 6) {
      return 'Buenas Noches';
    }
    return 'Buenos Días';
  });

  let userName = $derived($settingsStore.userName);
  let showWeather = $derived($settingsStore.widgets.weather);

  let weather = $derived($weatherStore.weather);

  onMount(() => {
    weatherStore.init();
  });
</script>

<div class="greeting-container">
  <h2 class="greeting-text">
    {greetingText}{#if userName}, <span class="name">{userName}</span>{/if}
  </h2>

  {#if showWeather && weather}
    <p class="weather-subtext">
      {weather.desc} • {weather.temp}°C
    </p>
  {/if}
</div>

<style>
  .greeting-container {
    text-align: center;
    margin-bottom: 2.2rem;
    text-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  :global([data-theme="light"]) .greeting-container {
    text-shadow: 0 2px 14px rgba(255, 255, 255, 0.8), 0 0 2px rgba(255, 255, 255, 0.9);
  }

  .greeting-text {
    font-size: clamp(1.4rem, 2.8vw, 2.1rem);
    font-weight: 500;
    color: var(--color-text-main);
    letter-spacing: -0.01em;
  }

  .name {
    font-weight: 700;
  }

  .weather-subtext {
    font-size: clamp(0.85rem, 1.5vw, 1rem);
    font-weight: 400;
    color: var(--color-text-muted);
    margin-top: 0.35rem;
    letter-spacing: 0.01em;
  }
</style>
