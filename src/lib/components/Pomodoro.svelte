<script>
  import { onDestroy } from 'svelte';
  import { Play, Pause, RotateCcw, Bell } from '@lucide/svelte';

  const MODES = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  let currentMode = $state('pomodoro');
  let timeLeft = $state(MODES.pomodoro);
  let isRunning = $state(false);
  let isCompleted = $state(false);
  let timerInterval;

  function setMode(mode) {
    currentMode = mode;
    timeLeft = MODES[mode];
    isRunning = false;
    isCompleted = false;
    clearInterval(timerInterval);
  }

  function toggleTimer() {
    isCompleted = false;
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
          isCompleted = true;
          clearInterval(timerInterval);
        }
      }, 1000);
    }
  }

  function resetTimer() {
    isRunning = false;
    isCompleted = false;
    clearInterval(timerInterval);
    timeLeft = MODES[currentMode];
  }

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
  });

  let minutes = $derived(Math.floor(timeLeft / 60).toString().padStart(2, '0'));
  let seconds = $derived((timeLeft % 60).toString().padStart(2, '0'));
</script>

<div class="pomodoro-widget glass-panel animate-fade-in {isCompleted ? 'completed-pulse' : ''}">
  <div class="modes">
    <button 
      type="button" 
      class="mode-btn {currentMode === 'pomodoro' ? 'active' : ''}" 
      onclick={() => setMode('pomodoro')}
    >
      Pomodoro
    </button>
    <button 
      type="button" 
      class="mode-btn {currentMode === 'shortBreak' ? 'active' : ''}" 
      onclick={() => setMode('shortBreak')}
    >
      Descanso
    </button>
    <button 
      type="button" 
      class="mode-btn {currentMode === 'longBreak' ? 'active' : ''}" 
      onclick={() => setMode('longBreak')}
    >
      Largo
    </button>
  </div>

  <div class="timer-display {isCompleted ? 'text-complete' : ''}">
    {minutes}:{seconds}
  </div>

  {#if isCompleted}
    <div class="completed-msg animate-fade-in">
      <Bell size={14} />
      <span>¡Tiempo completado!</span>
    </div>
  {/if}

  <div class="controls">
    <button 
      type="button" 
      class="ctrl-btn play-btn" 
      onclick={toggleTimer} 
      aria-label={isRunning ? 'Pausar' : 'Iniciar'}
    >
      {#if isRunning}
        <Pause size={18} />
      {:else}
        <Play size={18} />
      {/if}
    </button>
    <button 
      type="button" 
      class="ctrl-btn" 
      onclick={resetTimer} 
      title="Reiniciar"
      aria-label="Reiniciar temporizador"
    >
      <RotateCcw size={16} />
    </button>
  </div>
</div>

<style>
  .pomodoro-widget {
    width: 100%;
    max-width: 340px;
    margin: 1rem auto;
    padding: 18px;
    text-align: center;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .completed-pulse {
    border-color: rgba(56, 189, 248, 0.7);
    box-shadow: 0 0 25px rgba(56, 189, 248, 0.3);
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
    padding: 6px 14px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.75);
    transition: all 0.2s ease;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
  }

  .mode-btn.active {
    background: #38bdf8;
    color: #080c14;
    box-shadow: 0 2px 10px rgba(56, 189, 248, 0.35);
  }

  .timer-display {
    font-size: 3rem;
    font-weight: 700;
    color: #ffffff;
    font-variant-numeric: tabular-nums;
    margin: 6px 0 10px 0;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  }

  .text-complete {
    color: #38bdf8;
  }

  .completed-msg {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.15);
    padding: 4px 12px;
    border-radius: 9999px;
    margin: 0 auto 12px auto;
    width: fit-content;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .ctrl-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .ctrl-btn:hover {
    background: rgba(255, 255, 255, 0.22);
    transform: scale(1.05);
  }

  .play-btn {
    background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
    width: 46px;
    height: 46px;
    box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);
  }

  .play-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(56, 189, 248, 0.5);
  }
</style>
