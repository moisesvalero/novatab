<script>
  import { onMount, onDestroy } from 'svelte';
  import { settingsStore } from '$lib/stores/settingsStore';

  let time = $state(new Date());
  let interval;

  onMount(() => {
    interval = setInterval(() => {
      time = new Date();
    }, 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });

  let settings = $derived($settingsStore);

  let hours = $derived(time.getHours());
  let minutes = $derived(time.getMinutes());
  let seconds = $derived(time.getSeconds());

  let displayHours = $derived(
    settings.clockFormat === '12h' 
      ? (hours % 12 || 12).toString().padStart(2, '0') 
      : hours.toString().padStart(2, '0')
  );
  
  let displayMinutes = $derived(minutes.toString().padStart(2, '0'));
  let displaySeconds = $derived(seconds.toString().padStart(2, '0'));
  let ampm = $derived(hours >= 12 ? 'PM' : 'AM');

  let dateFormatted = $derived(
    time.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  );

  let hourDeg = $derived((hours % 12 + minutes / 60) * 30);
  let minDeg = $derived((minutes + seconds / 60) * 6);
  let secDeg = $derived(seconds * 6);
</script>

<div class="clock-widget animate-fade-in">
  {#if settings.clockType === 'digital'}
    <div class="digital-clock">
      <h1 class="time-display">
        <span class="hours">{displayHours}</span><span class="colon">:</span><span class="minutes">{displayMinutes}</span>
        {#if settings.showSeconds}
          <span class="colon">:</span><span class="seconds">{displaySeconds}</span>
        {/if}
        {#if settings.clockFormat === '12h'}
          <span class="ampm">{ampm}</span>
        {/if}
      </h1>
    </div>
  {:else}
    <div class="analog-clock">
      <div class="analog-face">
        <div class="hand hour-hand" style="transform: rotate({hourDeg}deg)"></div>
        <div class="hand minute-hand" style="transform: rotate({minDeg}deg)"></div>
        {#if settings.showSeconds}
          <div class="hand second-hand" style="transform: rotate({secDeg}deg)"></div>
        {/if}
        <div class="center-dot"></div>
      </div>
    </div>
  {/if}

  {#if settings.showDate}
    <p class="date-display">{dateFormatted}</p>
  {/if}
</div>

<style>
  .clock-widget {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin-bottom: 1rem;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .time-display {
    font-size: clamp(3.5rem, 8vw, 6.5rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    color: #ffffff;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 2px;
  }

  .colon {
    opacity: 0.8;
    animation: pulse 2s infinite ease-in-out;
  }

  .ampm {
    font-size: 0.35em;
    font-weight: 500;
    margin-left: 10px;
    opacity: 0.8;
  }

  .date-display {
    font-size: clamp(1rem, 2.2vw, 1.35rem);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    margin-top: 0.4rem;
    text-transform: capitalize;
    letter-spacing: 0.02em;
  }

  /* Analog Clock */
  .analog-clock {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(16px);
    border: 2px solid rgba(255, 255, 255, 0.25);
    position: relative;
    margin-bottom: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }

  .analog-face {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .hand {
    position: absolute;
    bottom: 50%;
    left: 50%;
    transform-origin: bottom center;
    border-radius: 4px;
  }

  .hour-hand {
    width: 4px;
    height: 35px;
    background: #ffffff;
    margin-left: -2px;
  }

  .minute-hand {
    width: 3px;
    height: 50px;
    background: rgba(255, 255, 255, 0.85);
    margin-left: -1.5px;
  }

  .second-hand {
    width: 2px;
    height: 55px;
    background: #38bdf8;
    margin-left: -1px;
  }

  .center-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    margin-top: -5px;
    margin-left: -5px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
</style>
