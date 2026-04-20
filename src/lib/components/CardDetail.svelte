<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { lang } from '$lib/i18n';
  import type { Card } from '$lib/data';
  import { markCardDone, markCardUndone } from '$lib/progress';
  
  interface VocabCard {
    id: string;
    title: string;
    day: number;
    words: { id: number; english: string; french: string; example?: string }[];
    type: 'vocab';
  }
  
  interface PhraseCard {
    id: string;
    title: string;
    day: number;
    expressions: { id: number; english: string; french: string }[];
    type: 'phrase';
  }
  
  let { card, onBack, onDoneChange = () => {}, isDone = false }: { card: Card; onBack: () => void; onDoneChange?: () => void; isDone?: boolean } = $props();
  
  let flippedIndices = $state<Set<number>>(new Set());
  let playingIndex = $state<number | null>(null);
  let markingDone = $state(false);
  
  let currentLang = $state<'fr' | 'en'>('fr');
  lang.subscribe(l => currentLang = l);
  
  const translations = {
    fr: { markDone: '✓ Marquer comme terminé', markUndone: '↩ Marquer comme non terminé' },
    en: { markDone: '✓ Mark as done', markUndone: '↩ Mark as not done' }
  };
  
  function t(key: keyof typeof translations.fr): string {
    return translations[currentLang][key];
  }
  
  function toggleFlip(index: number) {
    const newFlipped = new Set(flippedIndices);
    if (newFlipped.has(index)) {
      newFlipped.delete(index);
    } else {
      newFlipped.add(index);
    }
    flippedIndices = newFlipped;
  }
  
  function isFlipped(index: number): boolean {
    return flippedIndices.has(index);
  }
  
  function playAudio(cardId: string, itemId: number, event: MouseEvent) {
    event.stopPropagation();
    const audio = new Audio(`/audio/vocab/${cardId}_${itemId}.mp3`);
    audio.onplay = () => playingIndex = itemId;
    audio.onended = () => playingIndex = null;
    audio.onerror = () => playingIndex = null;
    audio.play();
  }
  
  function playPhraseAudio(cardId: string, itemId: number, event: MouseEvent) {
    event.stopPropagation();
    const audio = new Audio(`/audio/phrase/${cardId}_${itemId}.mp3`);
    audio.onplay = () => playingIndex = itemId;
    audio.onended = () => playingIndex = null;
    audio.onerror = () => playingIndex = null;
    audio.play();
  }
  
  async function handleMarkDone() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      alert('Please sign in first');
      return;
    }
    
    const cardType = isVocabCard ? 'vocab' : 'phrase';
    const currentCardId = card.id;
    
    markingDone = true;
    try {
      console.log('Marking card:', { userId: session.user.id, cardId: currentCardId, cardType, isDone });
      if (isDone) {
        await markCardUndone(session.user.id, currentCardId);
      } else {
        await markCardDone(session.user.id, currentCardId, cardType);
      }
      console.log('Card updated successfully');
      onDoneChange();
    } catch (e: any) {
      console.error('Error:', e);
      alert('Error: ' + (e?.message || e));
    }
    markingDone = false;
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onBack();
    }
  }
  
  const isVocabCard = $derived('words' in card);
  const vocabCard = $derived(isVocabCard ? card as VocabCard : null);
  const phraseCard = $derived(isVocabCard ? null : card as unknown as PhraseCard);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="max-w-2xl mx-auto">
  <button
    onclick={onBack}
    class="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-200"
  >
    ← Back to cards
  </button>
  
  <h2 class="text-3xl font-bold text-purple-800 dark:text-purple-400 mb-6 text-center">{card.title}</h2>
  
  {#if vocabCard}
    <div class="grid grid-cols-2 gap-4">
      {#each vocabCard.words as word, index}
        <div 
          class="relative h-32 cursor-pointer perspective-500"
          onclick={() => toggleFlip(index)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && toggleFlip(index)}
        >
          <div 
            class="w-full h-full transition-transform duration-300 preserve-3d"
            style="transform-style: preserve-3d; transform: rotateY({isFlipped(index) ? 180 : 0}deg)"
          >
            <div 
              class="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl border-2 border-blue-200 dark:border-blue-700 flex flex-col items-center justify-center p-3"
              style="backface-visibility: hidden"
            >
              <span class="text-xl font-bold text-blue-800 dark:text-blue-200 text-center">{word.english}</span>
              <button 
                onclick={(e) => playAudio(vocabCard.id, word.id, e)}
                class="mt-2 w-8 h-8 rounded-full bg-blue-300 dark:bg-blue-700 flex items-center justify-center hover:bg-blue-400 dark:hover:bg-blue-600 transition-colors"
                aria-label="Play pronunciation"
              >
                {#if playingIndex === word.id}
                  <svg class="w-4 h-4 text-blue-800 dark:text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                {:else}
                  <svg class="w-4 h-4 text-blue-800 dark:text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                    <polygon points="6,4 20,12 6,20"/>
                  </svg>
                {/if}
              </button>
            </div>
            
            <div 
              class="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl border-2 border-green-200 dark:border-green-700 flex flex-col items-center justify-center p-3"
              style="backface-visibility: hidden; transform: rotateY(180deg)"
            >
              <span class="text-xl font-bold text-green-800 dark:text-green-200 text-center mb-2">{word.french}</span>
              <span class="text-xs text-gray-600 dark:text-gray-300 text-center italic">{word.example}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if phraseCard}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {#each phraseCard.expressions as expr, index}
        <div 
          class="relative h-40 cursor-pointer perspective-500"
          onclick={() => toggleFlip(index)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && toggleFlip(index)}
        >
          <div 
            class="w-full h-full transition-transform duration-300 preserve-3d"
            style="transform-style: preserve-3d; transform: rotateY({isFlipped(index) ? 180 : 0}deg)"
          >
            <div 
              class="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl border-2 border-blue-200 dark:border-blue-700 flex flex-col items-center justify-center p-3"
              style="backface-visibility: hidden"
            >
              <span class="text-lg font-bold text-blue-800 dark:text-blue-200 text-center">{expr.english}</span>
              <button 
                onclick={(e) => playPhraseAudio(phraseCard.id, expr.id, e)}
                class="mt-2 w-8 h-8 rounded-full bg-blue-300 dark:bg-blue-700 flex items-center justify-center hover:bg-blue-400 dark:hover:bg-blue-600 transition-colors"
                aria-label="Play pronunciation"
              >
                {#if playingIndex === expr.id}
                  <svg class="w-4 h-4 text-blue-800 dark:text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                {:else}
                  <svg class="w-4 h-4 text-blue-800 dark:text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                    <polygon points="6,4 20,12 6,20"/>
                  </svg>
                {/if}
              </button>
            </div>
            
            <div 
              class="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl border-2 border-green-200 dark:border-green-700 flex items-center justify-center p-3"
              style="backface-visibility: hidden; transform: rotateY(180deg)"
            >
              <span class="text-lg font-bold text-green-800 dark:text-green-200 text-center">{expr.french}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
  
  <div class="mt-6 flex justify-center">
    <button
      onclick={handleMarkDone}
      disabled={markingDone}
      class="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-400 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-colors flex items-center gap-2"
    >
      {markingDone ? '...' : (isDone ? t('markUndone') : t('markDone'))}
    </button>
  </div>
  
  <p class="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">Press ESC to go back</p>
</div>

<style>
  .perspective-500 {
    perspective: 500px;
  }
  
  .preserve-3d {
    transform-style: preserve-3d;
  }
  
  .backface-hidden {
    backface-visibility: hidden;
  }
</style>