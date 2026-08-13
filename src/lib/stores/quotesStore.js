import { writable } from 'svelte/store';

export const CURATED_QUOTES = [
  { text: "La simplicidad es la máxima sofisticación.", author: "Leonardo da Vinci" },
  { text: "Hacer menos cosas, pero hacerlas mejor.", author: "Dieter Rams" },
  { text: "El futuro pertenece a quienes creen en la belleza de sus sueños.", author: "Eleanor Roosevelt" },
  { text: "La creatividad es la inteligencia divirtiéndose.", author: "Albert Einstein" },
  { text: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
  { text: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali" },
  { text: "El momento perfecto es ahora.", author: "Proverbio Zen" }
];

function createQuotesStore() {
  const { subscribe, update } = writable({
    index: 0,
    quote: CURATED_QUOTES[0]
  });

  return {
    subscribe,
    nextQuote: () => {
      update((curr) => {
        const nextIdx = (curr.index + 1) % CURATED_QUOTES.length;
        return { index: nextIdx, quote: CURATED_QUOTES[nextIdx] };
      });
    }
  };
}

export const quotesStore = createQuotesStore();
