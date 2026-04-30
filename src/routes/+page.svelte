<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';
  import { lang } from '$lib/i18n';
  import AuthButton from '$lib/components/AuthButton.svelte';
  import CardDetail from '$lib/components/CardDetail.svelte';
  import { getAllCards, type Card } from '$lib/data';
  import { getDoneCards, type CardProgress } from '$lib/progress';
  
  let session = $state<any>(null);
  let loading = $state(true);
  let cards = $state<Card[]>([]);
  let selectedCard = $state<Card | null>(null);
  let doneCardIds = $state<Set<string>>(new Set());
  let currentView = $state<'home' | 'vocab' | 'phrase' | 'missing'>('home');
  
  let currentLang = $state<'fr' | 'en'>('fr');
  lang.subscribe(l => currentLang = l);
  
  const translations = {
    fr: {
      appTitle: 'Vocabulon',
      chooseExercice: 'Choisis ton exercice',
      words: 'Mots',
      wordsDesc: '250 cartes de vocabulaire',
      phrases: 'Phrases',
      phrasesDesc: '100 cartes d\'expressions',
      missingWord: 'Trou',
      missingWordDesc: 'Complète la phrase',
      backToMenu: 'Retour au menu',
      loading: 'Chargement...',
      cards: 'cartes',
      vocabCards: 'Cartes Vocab',
      phraseCards: 'Cartes Phrases',
      doneCards: 'Cartes terminées'
    },
    en: {
      appTitle: 'Vocabulon',
      chooseExercice: 'Choose your exercise',
      words: 'Words',
      wordsDesc: '250 vocabulary cards',
      phrases: 'Phrases',
      phrasesDesc: '100 phrase cards',
      missingWord: 'Fill the Gap',
      missingWordDesc: 'Complete the sentence',
      backToMenu: 'Back to menu',
      loading: 'Loading...',
      cards: 'cards',
      vocabCards: 'Vocab Cards',
      phraseCards: 'Phrase Cards',
      doneCards: 'Done Cards'
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
    selectedCard = card;
  }
  
  function goBack() {
    selectedCard = null;
  }
  
  function goHome() {
    selectedCard = null;
    currentView = 'home';
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
  const vocabCards = $derived(allCards.filter((c: any) => c.type === 'vocab'));
  const phraseCards = $derived(allCards.filter((c: any) => c.type === 'phrase'));
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
    <div class="max-w-4xl mx-auto">
      <button 
        onclick={goBack}
        class="mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
      >
        ← {t('backToMenu')}
      </button>
      <CardDetail card={selectedCard} onBack={goBack} onDoneChange={handleDoneChange} isDone={doneCardIds.has(selectedCard.id)} />
    </div>
  {:else if currentView === 'home'}
    <!-- HOME VIEW: Exercise Selection -->
    <main class="max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold text-center text-gray-700 dark:text-gray-200 mb-8">
        {t('chooseExercice')}
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Words Box -->
        <button 
          onclick={() => currentView = 'vocab'}
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-4 border-blue-500"
        >
          <div class="text-5xl mb-4">📚</div>
          <h3 class="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">{t('words')}</h3>
          <p class="text-gray-600 dark:text-gray-400">{t('wordsDesc')}</p>
          <p class="text-sm text-blue-600 dark:text-blue-300 mt-2">250 {t('cards')}</p>
        </button>
        
        <!-- Phrases Box -->
        <button 
          onclick={() => currentView = 'phrase'}
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-4 border-green-500"
        >
          <div class="text-5xl mb-4">💬</div>
          <h3 class="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">{t('phrases')}</h3>
          <p class="text-gray-600 dark:text-gray-400">{t('phrasesDesc')}</p>
          <p class="text-sm text-green-600 dark:text-green-300 mt-2">100 {t('cards')}</p>
        </button>
        
        <!-- Missing Word Box -->
        <button 
          onclick={() => goto('/missing')}
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-4 border-orange-500"
        >
          <div class="text-5xl mb-4">🎯</div>
          <h3 class="text-2xl font-bold text-orange-700 dark:text-orange-400 mb-2">{t('missingWord')}</h3>
          <p class="text-gray-600 dark:text-gray-400">{t('missingWordDesc')}</p>
          <p class="text-sm text-orange-600 dark:text-orange-300 mt-2">500 {t('cards')}</p>
        </button>
      </div>
    </main>
  {:else if currentView === 'vocab'}
    <!-- VOCAB VIEW -->
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <button 
          onclick={goHome}
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
        >
          ← {t('backToMenu')}
        </button>
        <h2 class="text-2xl font-bold text-blue-700 dark:text-blue-400">{t('vocabCards')}</h2>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {#each vocabCards as card}
          <button
            onclick={() => selectCard(card)}
            class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-500 cursor-pointer"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-lg font-bold text-purple-600 dark:text-purple-400">#{getCardNumber(card.id)}</span>
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">{card.title}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">{'words' in card ? card.words.length : 0} {t('cards')}</p>
          </button>
        {/each}
      </div>
    </div>
  {:else if currentView === 'phrase'}
    <!-- PHRASE VIEW -->
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <button 
          onclick={goHome}
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
        >
          ← {t('backToMenu')}
        </button>
        <h2 class="text-2xl font-bold text-green-700 dark:text-green-400">{t('phraseCards')}</h2>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {#each phraseCards as card}
          <button
            onclick={() => selectCard(card)}
            class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-green-300 dark:hover:border-green-500 cursor-pointer"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-lg font-bold text-green-600 dark:text-green-400">#{getCardNumber(card.id)}</span>
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">{card.title}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">{(card as any).expressions?.length || 0} {t('cards')}</p>
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <footer class="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
    <button 
      onclick={toggleLang}
      class="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors text-gray-700 dark:text-gray-300"
    >
      {currentLang === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}
    </button>
  </footer>
</div>