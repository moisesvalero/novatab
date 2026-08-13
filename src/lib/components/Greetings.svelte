<script>
  import { onMount } from 'svelte';
  import { settingsStore } from '$lib/stores/settingsStore';
  import { fetchWeatherData } from '$lib/utils/weather';
  import { Sun, Cloud, CloudSun, CloudRain, CloudDrizzle, CloudLightning, Snowflake, CloudFog } from '@lucide/svelte';

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
      {weather.desc}. Actualmente hay {weather.temp}°.
    </p>

    <div class="weather-pill">
      {#if weather.icon === 'Sun'}
        <Sun size={18} class="weather-icon sun" />
      {:else if weather.icon === 'CloudSun' || weather.icon === 'SunCloud'}
        <CloudSun size={18} class="weather-icon cloud-sun" />
      {:else if weather.icon === 'CloudRain'}
        <CloudRain size={18} class="weather-icon rain" />
      {:else if weather.icon === 'CloudDrizzle'}
        <CloudDrizzle size={18} class="weather-icon drizzle" />
      {:else if weather.icon === 'CloudLightning'}
        <CloudLightning size={18} class="weather-icon lightning" />
      {:else if weather.icon === 'Snowflake'}
        <Snowflake size={18} class="weather-icon snow" />
      {:else if weather.icon === 'CloudFog'}
        <CloudFog size={18} class="weather-icon fog" />
      {:else}
        <Cloud size={18} class="weather-icon cloud" />
      {/if}
      <span class="pill-temp">{weather.temp}°</span>
    </div>
  {/if}
</div>

<style>
  .greeting-container {
    text-align: center;
    margin-bottom: 2rem;
    text-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .greeting-text {
    font-size: clamp(1.4rem, 2.8vw, 2.1rem);
    font-weight: 400; /* Bonjourr style clean weight */
    color: #ffffff;
    letter-spacing: -0.01em;
  }

  .name {
    font-weight: 600;
  }

  .weather-subtext {
    font-size: clamp(0.85rem, 1.5vw, 1rem);
    font-weight: 400;
    color: rgba(255, 255, 255, 0.88);
    margin-top: 0.25rem;
    letter-spacing: 0.01em;
  }

  .weather-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 0.5rem;
    padding: 3px 12px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: #ffffff;
    font-weight: 500;
    font-size: 0.95rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  :global(.weather-icon.sun) { color: #facc15; }
  :global(.weather-icon.cloud-sun) { color: #fde047; }
  :global(.weather-icon.rain) { color: #38bdf8; }
  :global(.weather-icon.drizzle) { color: #7dd3fc; }
  :global(.weather-icon.lightning) { color: #fbbf24; }
  :global(.weather-icon.snow) { color: #e0f2fe; }
  :global(.weather-icon.fog) { color: #cbd5e1; }
  :global(.weather-icon.cloud) { color: #94a3b8; }
</style>
