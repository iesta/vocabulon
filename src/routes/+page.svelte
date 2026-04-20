<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { lang } from '$lib/i18n';
  import { getAllCards, type Card } from '$lib/data';
  import { getDoneCards, type CardProgress } from '$lib/progress';
  import AuthButton from '$lib/components/AuthButton.svelte';
  import CardDetail from '$lib/components/CardDetail.svelte';
  
  let session = $state<any>(null);
  let loading = $state(true);
  let cards = $state<Card[]>([]);
  let selectedCard = $state<Card | null>(null);
  let vocabCollapsed = $state(false);
  let phraseCollapsed = $state(false);
  let doneCardIds = $state<Set<string>>(new Set());
  let scrollPosition = $state(0);
  
  let currentLang = $state<'fr' | 'en'>('fr');
  lang.subscribe(l => currentLang = l);
  
  const translations = {
    fr: {
      appTitle: 'Vocabulon',
      vocabCards: 'Cartes Vocab',
      phraseCards: 'Cartes Phrases',
      words: 'mots',
      expressions: 'expressions',
      welcomeTitle: 'Bienvenue!',
      welcomeText: 'Connectez-vous pour commencer à apprendre.',
      signInToSave: 'Connectez-vous avec Google pour sauvegarder votre progression',
      loading: 'Chargement...',
      totalWords: 'Mots Totaux',
      totalExpressions: 'Expressions',
      doneCards: 'Cartes terminées',
      percentDone: '% terminés'
    },
    en: {
      appTitle: 'Vocabulon',
      vocabCards: 'Vocab Cards',
      phraseCards: 'Phrase Cards',
      words: 'words',
      expressions: 'expressions',
      welcomeTitle: 'Welcome!',
      welcomeText: 'Sign in to start learning.',
      signInToSave: 'Sign in with Google to save your progress',
      loading: 'Loading...',
      totalWords: 'Total Words',
      totalExpressions: 'Expressions',
      doneCards: 'Done Cards',
      percentDone: '% done'
    }
  };
  
  function t(key: keyof typeof translations.fr): string {
    return translations[currentLang][key];
  }
  
  async function loadDoneCards() {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      try {
        const progress: CardProgress[] = await getDoneCards(currentSession.user.id);
        doneCardIds = new Set(progress.map(p => p.card_id));
        console.log('Loaded done cards:', progress.map(p => p.card_id));
      } catch (e) {
        console.error('Error loading done cards:', e);
      }
    }
  }
  
  onMount(async () => {
    const { data: { session: sess } } = await supabase.auth.getSession();
    session = sess;
    
    cards = getAllCards();
    await loadDoneCards();
    
    loading = false;
  });
   
  function selectCard(card: Card) {
    scrollPosition = window.scrollY;
    selectedCard = card;
  }
  
  function goBack() {
    selectedCard = null;
    setTimeout(() => window.scrollTo(0, scrollPosition), 50);
  }
  
  function getCardNumber(cardId: string): number {
    const match = cardId.match(/w(\d+)|p(\d+)/);
    if (match) {
      return parseInt(match[1] || match[2], 10);
    }
    return 0;
  }
  
  function toggleLang() {
    lang.toggle();
  }
  
  function handleDoneChange() {
    loadDoneCards();
  }
  
  const allCards = $derived(cards);
  
  const vocabCardsUndone = $derived(allCards.filter((c: any) => c.type === 'vocab' && !doneCardIds.has(c.id)));
  const vocabCardsDone = $derived(allCards.filter((c: any) => c.type === 'vocab' && doneCardIds.has(c.id)));
  const phraseCardsUndone = $derived(allCards.filter((c: any) => c.type === 'phrase' && !doneCardIds.has(c.id)));
  const phraseCardsDone = $derived(allCards.filter((c: any) => c.type === 'phrase' && doneCardIds.has(c.id)));
  
  const totalWords = $derived(vocabCardsUndone.reduce((sum: number, c: any) => sum + c.words.length, 0) + vocabCardsDone.reduce((sum: number, c: any) => sum + c.words.length, 0));
  const totalExpressions = $derived(phraseCardsUndone.reduce((sum: number, c: any) => sum + c.expressions.length, 0) + phraseCardsDone.reduce((sum: number, c: any) => sum + c.expressions.length, 0));
  
  const totalCards = $derived(allCards.length);
  const doneCount = $derived(doneCardIds.size);
  const percentDone = $derived(totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0);
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
  <header class="mb-8">
    <div class="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="order-2 md:order-1 text-center md:text-left">
        <h1 class="text-4xl md:text-5xl font-bold text-purple-800 dark:text-purple-400" style="font-family: 'Impact', sans-serif;">
          VOCABULON
        </h1>
      </div>
      <div class="order-1 md:order-2 flex items-center justify-center md:justify-end gap-4 w-full md:w-auto">
        <AuthButton bind:session />
      </div>
    </div>
  </header>
  
  {#if loading}
    <div class="flex items-center justify-center h-64">
      <p class="text-gray-500 dark:text-gray-400">{t('loading')}</p>
    </div>
  {:else if selectedCard}
    <CardDetail card={selectedCard} onBack={goBack} onDoneChange={handleDoneChange} isDone={doneCardIds.has(selectedCard.id)} />
  {:else}
    <main class="max-w-4xl mx-auto">
      {#if !session}
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center mb-8">
          <div class="text-6xl mb-4">🔐</div>
          <h2 class="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">{t('welcomeTitle')}</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">{t('signInToSave')}</p>
        </div>
      {/if}
      
      <!-- Vocab Cards Section -->
      <button 
        onclick={() => vocabCollapsed = !vocabCollapsed}
        class="w-full text-left cursor-pointer"
      >
        <h2 class="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-4 flex items-center">
          <span class="mr-2">{vocabCollapsed ? '▶' : '▼'}</span>
          <span class="mr-2">📚</span> {t('vocabCards')} ({vocabCardsUndone.length}/{vocabCardsUndone.length + vocabCardsDone.length})
        </h2>
      </button>
      
      {#if !vocabCollapsed}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {#each vocabCardsUndone as card, i}
            <button
              onclick={() => selectCard(card)}
              class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-500 cursor-pointer"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-lg font-bold text-purple-600 dark:text-purple-400">#{getCardNumber(card.id)}</span>
              </div>
              <h3 class="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">{card.title}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">{'words' in card ? card.words.length : 0} {t('words')}</p>
            </button>
          {/each}
          {#each vocabCardsDone as card, i}
            <button
              onclick={() => selectCard(card)}
              class="bg-gray-300 dark:bg-gray-700 rounded-xl shadow-md p-3 text-left opacity-60 cursor-pointer transition-all border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-500 cursor-pointer"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-lg font-bold text-purple-600 dark:text-purple-400">✓ #{getCardNumber(card.id)}</span>
              </div>
              <h3 class="font-semibold text-gray-600 dark:text-gray-400 text-sm mb-1">{card.title}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">{'words' in card ? card.words.length : 0} {t('words')}</p>
            </button>
          {/each}
        </div>
      {/if}
      
      <!-- Phrase Cards Section -->
      <button 
        onclick={() => phraseCollapsed = !phraseCollapsed}
        class="w-full text-left cursor-pointer"
      >
        <h2 class="text-2xl font-bold text-green-800 dark:text-green-400 mb-4 flex items-center">
          <span class="mr-2">{phraseCollapsed ? '▶' : '▼'}</span>
          <span class="mr-2">💬</span> {t('phraseCards')} ({phraseCardsUndone.length}/{phraseCardsUndone.length + phraseCardsDone.length})
        </h2>
      </button>
      
      {#if !phraseCollapsed}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {#each phraseCardsUndone as card, i}
            <button
              onclick={() => selectCard(card)}
              class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-green-300 dark:hover:border-green-500 cursor-pointer"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-lg font-bold text-green-600 dark:text-green-400">#{getCardNumber(card.id)}</span>
              </div>
              <h3 class="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">{card.title}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">{(card as any).expressions?.length || 0} {t('expressions')}</p>
            </button>
          {/each}
          {#each phraseCardsDone as card, i}
            <button
              onclick={() => selectCard(card)}
              class="bg-gray-300 dark:bg-gray-700 rounded-xl shadow-md p-3 text-left opacity-60 cursor-pointer transition-all border-2 border-transparent hover:border-green-300 dark:hover:border-green-500 cursor-pointer"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-lg font-bold text-green-600 dark:text-green-400">✓ #{getCardNumber(card.id)}</span>
              </div>
              <h3 class="font-semibold text-gray-600 dark:text-gray-400 text-sm mb-1">{card.title}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">{(card as any).expressions?.length || 0} {t('expressions')}</p>
            </button>
          {/each}
        </div>
      {/if}
      
      <!-- Stats -->
      <div class="mt-8 grid grid-cols-3 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
          <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalWords}</p>
          <p class="text-gray-600 dark:text-gray-400">{t('totalWords')}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">{totalExpressions}</p>
          <p class="text-gray-600 dark:text-gray-400">{t('totalExpressions')}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
          <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">{percentDone}%</p>
          <p class="text-gray-600 dark:text-gray-400">{t('percentDone')}</p>
        </div>
      </div>
    </main>
  {/if}
  
  <footer class="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
    <div class="flex justify-center items-center gap-2">
      <button 
        onclick={toggleLang}
        class="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors text-gray-700 dark:text-gray-300"
      >
        {currentLang === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}
      </button>
    </div>
  </footer>
</div>