<script>
  import { Search } from '@lucide/svelte';

  let { engine = 'google', size = 18, class: className = '' } = $props();
</script>

{#if engine === 'google'}
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    class="engine-icon google {className}" 
    aria-hidden="true"
  >
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
{:else if engine === 'duckduckgo'}
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    class="engine-icon duckduckgo {className}" 
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="11" fill="#DE5833"/>
    <ellipse cx="12" cy="11.5" rx="6.5" ry="6.5" fill="#FFFFFF"/>
    <path d="M10 9.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5" stroke="#333" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    <ellipse cx="12" cy="12.5" rx="3.5" ry="2.2" fill="#F8A51D"/>
    <circle cx="14" cy="9.5" r="0.9" fill="#333333"/>
    <path d="M10 18.2l2-1.2 2 1.2-1-2.2-1 0z" fill="#4B9B38"/>
  </svg>
{:else if engine === 'bing'}
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    class="engine-icon bing {className}" 
    aria-hidden="true"
  >
    <path fill="#008373" d="M5 3v18l5.5-3.17 6.1 3.17 2.4-1.92V11.9l-5.6 2.1-3-4.5 4.6-2.5L13.1 3H5z"/>
    <path fill="#00BC94" d="M10.5 17.83V9.5l3 4.5 5.5-2.1v4.35l-2.4 1.92-6.1-3.17z" opacity="0.6"/>
  </svg>
{:else if engine === 'brave'}
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    class="engine-icon brave {className}" 
    aria-hidden="true"
  >
    <path fill="#FB542B" d="M19.9 7.4l-2.3-4.3c-.2-.4-.7-.6-1.1-.5l-3.3.9c-.8-.3-1.6-.3-2.4 0l-3.3-.9c-.4-.1-.9.1-1.1.5L4.1 7.4c-.2.4-.2.9 0 1.3l2.8 6.4c.2.5.6.8 1.1.8h.4l1.8 4.2c.2.4.6.7 1.1.7h1.4c.5 0 .9-.3 1.1-.7l1.8-4.2h.4c.5 0 .9-.3 1.1-.8l2.8-6.4c.2-.4.2-.9 0-1.3zM12 17.5l-2-4.5h4l-2 4.5z"/>
  </svg>
{:else if engine === 'yahoo'}
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    class="engine-icon yahoo {className}" 
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="#6001D2"/>
    <path fill="#FFFFFF" d="M5.5 6h2.8l2.2 4.8L12.7 6h2.8l-3.7 7.2v4.8H9.3v-4.8L5.5 6zm11.5 0h2.4v8.2H17V6zm0 10.4h2.4v2.4H17v-2.4z"/>
  </svg>
{:else}
  <Search size={size} class="engine-icon fallback {className}" />
{/if}

<style>
  .engine-icon {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
    transition: transform 0.15s ease;
  }
</style>
