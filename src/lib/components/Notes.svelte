<script>
  import { onMount } from 'svelte';

  let noteText = '';

  onMount(() => {
    if (typeof window !== 'undefined') {
      noteText = localStorage.getItem('novatab_notes') || '';
    }
  });

  function handleSave() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('novatab_notes', noteText);
    }
  }
</script>

<div class="notes-widget glass-panel animate-fade-in">
  <div class="notes-header">
    <span>📝 Bloc de notas rápido</span>
  </div>
  <textarea
    bind:value={noteText}
    on:input={handleSave}
    placeholder="Escribe tus notas o pendientes aquí..."
  ></textarea>
</div>

<style>
  .notes-widget {
    max-width: 380px;
    margin: 1rem auto;
    padding: 14px;
    display: flex;
    flex-direction: column;
  }

  .notes-header {
    font-size: 0.88rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 8px;
  }

  textarea {
    width: 100%;
    height: 110px;
    resize: none;
    border: none;
    outline: none;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    padding: 10px 12px;
    color: #ffffff;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  textarea::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
</style>
