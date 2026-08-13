<script>
  import { onMount } from 'svelte';
  import { fetchWeatherData } from '$lib/utils/weather';
  import { settingsStore } from '$lib/stores/settingsStore';
  import { Sun, Cloud, CloudSun, CloudRain, CloudDrizzle, CloudLightning, Snowflake, CloudFog } from '@lucide/svelte';

  let weather = $state(null);
  let loading = $state(true);

  let weatherCity = $derived($settingsStore.weatherCity || 'Madrid');

  async function loadWeather() {
    loading = true;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          weather = await fetchWeatherData(pos.coords.latitude, pos.coords.longitude);
          loading = false;
        },
        async () => {
          weather = await fetchWeatherData(40.4168, -3.7038);
          loading = false;
        },
        { timeout: 5000 }
      );
    } else {
      weather = await fetchWeatherData(40.4168, -3.7038);
      loading = false;
    }
  }

  onMount(() => {
    loadWeather();
  });
</script>

{#if !loading && weather}
  <div class="weather-widget animate-fade-in" title="{weather.desc} en {weatherCity}">
    <div class="weather-icon-box">
      {#if weather.icon === 'Sun'}
        <Sun size={20} class="sun-icon" />
      {:else if weather.icon === 'CloudSun' || weather.icon === 'SunCloud'}
        <CloudSun size={20} class="cloud-sun-icon" />
      {:else if weather.icon === 'CloudRain'}
        <CloudRain size={20} class="rain-icon" />
      {:else if weather.icon === 'CloudDrizzle'}
        <CloudDrizzle size={20} class="drizzle-icon" />
      {:else if weather.icon === 'CloudLightning'}
        <CloudLightning size={20} class="lightning-icon" />
      {:else if weather.icon === 'Snowflake'}
        <Snowflake size={20} class="snow-icon" />
      {:else if weather.icon === 'CloudFog'}
        <CloudFog size={20} class="fog-icon" />
      {:else}
        <Cloud size={20} class="cloud-icon" />
      {/if}
    </div>

    <div class="weather-info">
      <span class="temp">{weather.temp}°C</span>
      <span class="desc">{weather.desc}</span>
    </div>
  </div>
{/if}

<style>
  .weather-widget {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
    margin-bottom: 0.8rem;
    transition: all 0.2s ease;
  }

  .weather-widget:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.02);
  }

  .weather-icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #facc15;
  }

  .weather-info {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .temp {
    font-size: 1rem;
    font-weight: 700;
    color: #ffffff;
  }

  .desc {
    font-size: 0.8rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    text-transform: capitalize;
  }
</style>
