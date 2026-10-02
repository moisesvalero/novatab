<script>
  import { notesStore } from '$lib/stores/notesStore';

  let noteText = $derived($notesStore);
  let isSaved = $state(false);
  let saveTimeout;

  function handleInput(e) {
    const val = e.target.value;
    notesStore.set(val);
    isSaved = true;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      isSaved = false;
    }, 1800);
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
    value={noteText}
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
    color: var(--color-text-main);
    margin-bottom: 10px;
  }

  .saved-indicator {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-accent);
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
    border: 1px solid var(--input-border);
    outline: none;
    background: var(--input-bg);
    border-radius: 12px;
    padding: 12px 14px;
    color: var(--color-text-main);
    font-size: 0.92rem;
    line-height: 1.45;
    transition: all 0.2s ease;
  }

  textarea:focus {
    border-color: var(--color-accent);
    background: var(--input-bg-focus);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
  }

  textarea::placeholder {
    color: var(--input-placeholder);
  }
</style>
