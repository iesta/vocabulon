<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';
  import { lang } from '$lib/i18n';
  import { getCardById, type Card } from '$lib/data';
  import { getDoneCards, markCardUndone, type CardProgress } from '$lib/progress';
  
  let session = $state<any>(null);
  let loading = $state(true);
  let doneProgress = $state<CardProgress[]>([]);
  let doneCards = $state<Card[]>([]);
  
  let currentLang = $state<'fr' | 'en'>('fr');
  lang.subscribe(l => currentLang = l);
  
  const translations = {
    fr: {
      title: 'Cartes terminées',
      undo: 'Annuler',
      back: '← Retour',
      noCards: 'Aucune carte terminée',
      vocabCard: 'Carte Vocab',
      phraseCard: 'Carte Phrase'
    },
    en: {
      title: 'Done Cards',
      undo: 'Undo',
      back: '← Back',
      noCards: 'No cards done yet',
      vocabCard: 'Vocab Card',
      phraseCard: 'Phrase Card'
    }
  };
  
  function t(key: keyof typeof translations.fr): string {
    return translations[currentLang][key];
  }
  
  onMount(async () => {
    const { data: { session: sess } } = await supabase.auth.getSession();
    session = sess;
    
    if (sess?.user) {
      try {
        doneProgress = await getDoneCards(sess.user.id);
        doneCards = doneProgress
          .map(p => getCardById(p.card_id))
          .filter((c): c is Card => c !== undefined);
      } catch (e) {
        console.error('Error loading done cards:', e);
      }
    }
    
    loading = false;
  });
  
  async function handleUndo(cardId: string) {
    if (!session?.user) return;
    
    try {
      await markCardUndone(session.user.id, cardId);
      doneCards = doneCards.filter(c => c.id !== cardId);
    } catch (e) {
      console.error('Error undoing card:', e);
    }
  }
  
  function goBack() {
    goto('/');
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
  <div class="max-w-2xl mx-auto">
    <button
      onclick={goBack}
      class="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-200"
    >
      {t('back')}
    </button>
    
    <h1 class="text-3xl font-bold text-purple-800 dark:text-purple-400 mb-6" style="font-family: 'Impact', sans-serif;">
      {t('title')} ({doneCards.length})
    </h1>
    
    {#if loading}
      <p class="text-gray-500 dark:text-gray-400">Loading...</p>
    {:else if doneCards.length === 0}
      <p class="text-gray-500 dark:text-gray-400 text-center py-8">{t('noCards')}</p>
    {:else}
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">#</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Type</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Name</th>
              <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">{t('undo')}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            {#each doneCards as card, i}
              {@const cardType = 'words' in card ? 'vocab' : 'phrase'}
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{i + 1}</td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 rounded text-xs font-medium {cardType === 'vocab' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}">
                    {cardType === 'vocab' ? t('vocabCard') : t('phraseCard')}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{card.title}</td>
                <td class="px-4 py-3 text-right">
                  <button
                    onclick={() => handleUndo(card.id)}
                    class="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded transition-colors"
                  >
                    {t('undo')}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
