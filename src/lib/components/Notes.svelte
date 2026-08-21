<script>
  import { onMount } from 'svelte';

  let noteText = $state('');
  let isSaved = $state(false);
  let saveTimeout;

  onMount(() => {
    if (typeof window !== 'undefined') {
      noteText = localStorage.getItem('novatab_notes') || '';
    }
  });

  function handleInput() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('novatab_notes', noteText);
      isSaved = true;
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        isSaved = false;
      }, 1800);
    }
  }
</script>

<div class="notes-widget glass-panel animate-fade-in">
  <div class="notes-header">
    <span>📝 Bloc de notas rápido</span>
    {#if isSaved}
      <span class="saved-indicator animate-fade-in">Guardado ✓</span>
    {/if}
  </div>
  <textarea
    bind:value={noteText}
    oninput={handleInput}
    placeholder="Escribe tus notas o pendientes aquí..."
    aria-label="Bloc de notas rápido"
  ></textarea>
</div>

<style>
  .notes-widget {
    width: 100%;
    max-width: 440px;
    margin: 1rem auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }

  .notes-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.88rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 10px;
  }

  .saved-indicator {
    font-size: 0.75rem;
    font-weight: 500;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.15);
    padding: 2px 8px;
    border-radius: 9999px;
  }

  textarea {
    width: 100%;
    height: 120px;
    resize: vertical;
    min-height: 80px;
    max-height: 260px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    outline: none;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 12px;
    padding: 12px 14px;
    color: #ffffff;
    font-size: 0.92rem;
    line-height: 1.45;
    transition: all 0.2s ease;
  }

  textarea:focus {
    border-color: rgba(56, 189, 248, 0.6);
    background: rgba(0, 0, 0, 0.35);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
  }

  textarea::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
</style>
