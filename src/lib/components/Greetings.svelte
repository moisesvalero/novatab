<script>
  import { onMount } from 'svelte';
  import { settingsStore } from '$lib/stores/settingsStore';
  import { fetchWeatherData } from '$lib/utils/weather';

  const hour = new Date().getHours();

  let greetingText = 'Buenos Días';
  if (hour >= 12 && hour < 20) {
    greetingText = 'Buenas Tardes';
  } else if (hour >= 20 || hour < 6) {
    greetingText = 'Buenas Noches';
  }

  let userName = $derived($settingsStore.userName);
  let showWeather = $derived($settingsStore.widgets.weather);

  let weather = $state(null);

  onMount(async () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          weather = await fetchWeatherData(pos.coords.latitude, pos.coords.longitude);
        },
        async () => {
          weather = await fetchWeatherData(40.4168, -3.7038);
        },
        { timeout: 4000 }
      );
    } else {
      weather = await fetchWeatherData(40.4168, -3.7038);
    }
  });
</script>

<div class="greeting-container animate-reveal delay-2">
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

  .greeting-text {
    font-size: clamp(1.4rem, 2.8vw, 2.1rem);
    font-weight: 500;
    color: #ffffff;
    letter-spacing: -0.01em;
  }

  .name {
    font-weight: 700;
  }

  .weather-subtext {
    font-size: clamp(0.85rem, 1.5vw, 1rem);
    font-weight: 400;
    color: rgba(255, 255, 255, 0.85);
    margin-top: 0.35rem;
    letter-spacing: 0.01em;
  }
</style>
