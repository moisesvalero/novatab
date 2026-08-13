<script>
  import { backgroundStore, CURATED_BACKGROUNDS } from '$lib/stores/backgroundStore';
  import { Github } from '@lucide/svelte';

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
      <Github size={13} />
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

  .bg-image, .bg-solid, .bg-gradient, .bg-overlay {
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
    transform: scale(1.05);
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
    color: rgba(255, 255, 255, 0.65);
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
