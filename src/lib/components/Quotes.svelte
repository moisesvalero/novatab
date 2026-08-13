<script>
  import { quotesStore } from '$lib/stores/quotesStore';
  import { RefreshCw } from '@lucide/svelte';

  let q = $derived($quotesStore.quote);

  function handleNext() {
    quotesStore.nextQuote();
  }
</script>

<div class="quotes-container animate-reveal delay-5">
  <p class="quote-text">“{q.text}”</p>
  <div class="quote-author-row">
    <span class="quote-author">— {q.author}</span>
    <button type="button" class="btn-next-quote" onclick={handleNext} title="Siguiente frase">
      <RefreshCw size={11} />
    </button>
  </div>
</div>

<style>
  .quotes-container {
    max-width: 480px;
    margin: 1rem auto 0 auto;
    text-align: center;
    padding: 6px 12px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }

  .quote-text {
    font-size: 0.88rem;
    font-style: italic;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.45;
    margin-bottom: 4px;
  }

  .quote-author-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .quote-author {
    font-size: 0.76rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.65);
    letter-spacing: 0.02em;
  }

  .btn-next-quote {
    color: rgba(255, 255, 255, 0.5);
    padding: 2px;
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
