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
</div>

{#if bgState.type === 'image' && !bgState.customUrl}
  <div class="credit-tag">
    <a href={currentBg.link} target="_blank" rel="noopener noreferrer">
      📷 {currentBg.author} {currentBg.location ? `• ${currentBg.location}` : ''}
    </a>
  </div>
{/if}

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

  .credit-tag {
    position: fixed;
    bottom: 16px;
    left: 20px;
    z-index: 5;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 6px 14px;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: all 0.2s ease;
  }

  .credit-tag:hover {
    color: #ffffff;
    background: rgba(0, 0, 0, 0.55);
    transform: translateY(-2px);
  }
</style>
