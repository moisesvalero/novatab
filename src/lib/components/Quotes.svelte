<script>
  import { quotesStore } from '$lib/stores/quotesStore';
  import { RefreshCw } from '@lucide/svelte';

  let q = $derived($quotesStore.quote);

  function handleNext() {
    quotesStore.nextQuote();
  }
</script>

<div class="quotes-container animate-fade-in">
  <p class="quote-text">“{q.text}”</p>
  <div class="quote-author-row">
    <span class="quote-author">— {q.author}</span>
    <button type="button" class="btn-next-quote" on:click={handleNext} title="Siguiente frase">
      <RefreshCw size={12} />
    </button>
  </div>
</div>

<style>
  .quotes-container {
    max-width: 580px;
    margin: 1rem auto 0 auto;
    text-align: center;
    padding: 12px 20px;
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .quote-text {
    font-size: 0.95rem;
    font-style: italic;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.5;
    margin-bottom: 6px;
  }

  .quote-author-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .quote-author {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.02em;
  }

  .btn-next-quote {
    color: rgba(255, 255, 255, 0.6);
    padding: 3px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease, color 0.2s ease;
  }

  .btn-next-quote:hover {
    color: #ffffff;
    transform: rotate(180deg);
  }
</style>
