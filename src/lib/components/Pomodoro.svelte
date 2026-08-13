<script>
  import { onDestroy } from 'svelte';
  import { Play, Pause, RotateCcw } from '@lucide/svelte';

  const MODES = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  let currentMode = $state('pomodoro');
  let timeLeft = $state(MODES.pomodoro);
  let isRunning = $state(false);
  let timerInterval;

  function setMode(mode) {
    currentMode = mode;
    timeLeft = MODES[mode];
    isRunning = false;
    clearInterval(timerInterval);
  }

  function toggleTimer() {
    if (isRunning) {
      isRunning = false;
      clearInterval(timerInterval);
    } else {
      isRunning = true;
      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft -= 1;
        } else {
          isRunning = false;
          clearInterval(timerInterval);
          alert('¡Tiempo completado!');
        }
      }, 1000);
    }
  }

  function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    timeLeft = MODES[currentMode];
  }

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
  });

  let minutes = $derived(Math.floor(timeLeft / 60).toString().padStart(2, '0'));
  let seconds = $derived((timeLeft % 60).toString().padStart(2, '0'));
</script>

<div class="pomodoro-widget glass-panel animate-fade-in">
  <div class="modes">
    <button 
      type="button" 
      class="mode-btn {currentMode === 'pomodoro' ? 'active' : ''}" 
      on:click={() => setMode('pomodoro')}
    >
      Pomodoro
    </button>
    <button 
      type="button" 
      class="mode-btn {currentMode === 'shortBreak' ? 'active' : ''}" 
      on:click={() => setMode('shortBreak')}
    >
      Descanso
    </button>
    <button 
      type="button" 
      class="mode-btn {currentMode === 'longBreak' ? 'active' : ''}" 
      on:click={() => setMode('longBreak')}
    >
      Largo
    </button>
  </div>

  <div class="timer-display">
    {minutes}:{seconds}
  </div>

  <div class="controls">
    <button type="button" class="ctrl-btn play-btn" on:click={toggleTimer}>
      {#if isRunning}
        <Pause size={18} />
      {:else}
        <Play size={18} />
      {/if}
    </button>
    <button type="button" class="ctrl-btn" on:click={resetTimer} title="Reiniciar">
      <RotateCcw size={16} />
    </button>
  </div>
</div>

<style>
  .pomodoro-widget {
    max-width: 320px;
    margin: 1rem auto;
    padding: 16px;
    text-align: center;
  }

  .modes {
    display: flex;
    gap: 6px;
    justify-content: center;
    margin-bottom: 12px;
  }

  .mode-btn {
    font-size: 0.78rem;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s ease;
  }

  .mode-btn.active {
    background: #38bdf8;
    color: #0f172a;
  }

  .timer-display {
    font-size: 2.8rem;
    font-weight: 700;
    color: #ffffff;
    font-variant-numeric: tabular-nums;
    margin: 6px 0 12px 0;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .ctrl-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .play-btn {
    background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
    width: 44px;
    height: 44px;
  }
</style>
