<script>
  import { backgroundStore, CURATED_BACKGROUNDS } from '$lib/stores/backgroundStore';

  let bgState = $derived($backgroundStore);
  let currentBg = $derived(CURATED_BACKGROUNDS[bgState.currentIndex] || CURATED_BACKGROUNDS[0]);
  let bgUrl = $derived(bgState.customUrl || currentBg.url);
</script>

<div class="background-container">
  {#if bgState.type === 'image'}
    <div 
      class="bg-image" 
      style="background-image: url('{bgUrl}'); filter: blur({bgState.blur}px);"
    ></div>
  {:else if bgState.type === 'solid'}
    <div class="bg-solid" style="background-color: {bgState.solidColor};"></div>
  {:else if bgState.type === 'gradient'}
    <div class="bg-gradient" style="background: {bgState.gradient};"></div>
  {/if}

  <div 
    class="bg-overlay" 
    style="background: rgba(0, 0, 0, {bgState.darkness / 100});"
  ></div>

  <!-- Radial Vignette for depth -->
  <div class="bg-vignette"></div>
</div>

<div class="footer-tags">
  {#if bgState.type === 'image' && !bgState.customUrl}
    <div class="credit-tag">
      <a href={currentBg.link} target="_blank" rel="noopener noreferrer">
        📷 {currentBg.author} {currentBg.location ? `• ${currentBg.location}` : ''}
      </a>
    </div>
  {/if}

  <!-- Subtle Author Badge -->
  <div class="author-tag">
    <a href="https://github.com/moisesvalero" target="_blank" rel="noopener noreferrer" title="Desarrollado por Moisés Valero">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
      <span>Moisés Valero</span>
    </a>
  </div>
</div>

<style>
  .background-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .bg-image, .bg-solid, .bg-gradient, .bg-overlay, .bg-vignette {
    position: absolute;
    top: -5%;
    left: -5%;
    width: 110%;
    height: 110%;
    transition: filter 0.3s ease, background 0.4s ease, opacity 0.4s ease;
  }

  .bg-image {
    background-size: cover;
    background-position: center;
    animation: slowZoomIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes slowZoomIn {
    0% {
      transform: scale(1.08);
      opacity: 0.3;
    }
    100% {
      transform: scale(1.03);
      opacity: 1;
    }
  }

  .bg-vignette {
    background: radial-gradient(circle at center, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0.48) 100%);
  }

  .footer-tags {
    position: fixed;
    bottom: 16px;
    left: 20px;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .credit-tag, .author-tag {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.7);
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 5px 12px;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    transition: all 0.25s ease;
  }

  .author-tag a {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .credit-tag:hover, .author-tag:hover {
    color: #ffffff;
    background: rgba(0, 0, 0, 0.55);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
</style>
