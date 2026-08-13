<script>
  import { settingsStore } from '$lib/stores/settingsStore';

  const hour = new Date().getHours();

  let greetingText = 'Buenos días';
  if (hour >= 12 && hour < 20) {
    greetingText = 'Buenas tardes';
  } else if (hour >= 20 || hour < 6) {
    greetingText = 'Buenas noches';
  }

  let userName = $derived($settingsStore.userName);
</script>

<div class="greeting-container animate-fade-in">
  <h2 class="greeting-text">
    {greetingText}{#if userName}, <span class="name">{userName}</span>{/if}
  </h2>
</div>

<style>
  .greeting-container {
    text-align: center;
    margin-bottom: 1.2rem;
    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  }

  .greeting-text {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.01em;
  }

  .name {
    font-weight: 700;
    color: #ffffff;
  }
</style>
