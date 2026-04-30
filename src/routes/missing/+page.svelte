<script lang="ts">
  import { goto } from '$app/navigation';
  import { lang } from '$lib/i18n';
  import exercisesData from '$lib/data/missing-exercises.json';
  
  let currentLang = $state<'fr' | 'en'>('fr');
  lang.subscribe(l => currentLang = l);
  
  let currentIndex = $state(0);
  let selectedAnswer = $state<string | null>(null);
  let isCorrect = $state<boolean | null>(null);
  let showResult = $state(false);
  let score = $state(0);
  let streak = $state(0);
  let showExercise = $state(false);
  
  const exercises = exercisesData.exercises as any[];
  
  const translations = {
    fr: {
      title: 'Complète la phrase',
      chooseSeries: 'Choisis une série',
      score: 'Score',
      streak: 'Série',
      correct: '✓ Correct!',
      wrong: '✗ Faux!',
      backToMenu: '← Menu',
      frenchLabel: '🇫🇷',
      englishLabel: '🇬🇧',
      nextExercise: 'Suivant →'
    },
    en: {
      title: 'Fill in the Gap',
      chooseSeries: 'Choose a series',
      score: 'Score',
      streak: 'Streak',
      correct: '✓ Correct!',
      wrong: '✗ Wrong!',
      backToMenu: '← Menu',
      frenchLabel: '🇫🇷',
      englishLabel: '🇬🇧',
      nextExercise: 'Next →'
    }
  };
  
  function t(key: keyof typeof translations.fr): string {
    return translations[currentLang][key];
  }
  
  const currentExercise = $derived(exercises[currentIndex]);
  
  const series = $derived(
    exercises.reduce((acc: any[], ex: any, i: number) => {
      const seriesIndex = Math.floor(i / 6);
      if (!acc[seriesIndex]) {
        acc[seriesIndex] = { 
          id: seriesIndex + 1, 
          theme: ex.theme || 'Theme ' + (seriesIndex + 1),
          exercises: [] 
        };
      }
      acc[seriesIndex].exercises.push(ex);
      return acc;
    }, [])
  );
  
  function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function playSound(type: 'correct' | 'wrong'): Promise<void> {
    const sound = type === 'correct'
      ? '/audio/system/correct.mp3'
      : '/audio/system/wrong.mp3';
    
    return new Promise((resolve) => {
      const audio = new Audio(sound);
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  }
  
  async function playFullSentence(): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(`/audio/missing/english_${currentExercise.id}.mp3`);
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  }
  
  async function selectChoice(choice: string) {
    if (showResult) return;
    
    selectedAnswer = choice;
    isCorrect = choice === currentExercise.answer;
    showResult = true;
    
    if (isCorrect) {
      score++;
      streak++;
      await playSound('correct');
    } else {
      streak = 0;
      await playSound('wrong');
    }
    
    await wait(400);
    await playFullSentence();
  }
  
  function nextExercise() {
    if (currentIndex < exercises.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    selectedAnswer = null;
    isCorrect = null;
    showResult = false;
  }
  
  function goHome() {
    goto('/');
  }
  
  function goToSeries(seriesIndex: number) {
    currentIndex = seriesIndex * 6;
    selectedAnswer = null;
    isCorrect = null;
    showResult = false;
    showExercise = true;
  }
  
  function backToSeries() {
    showExercise = false;
  }
  
function getShuffledChoices(): string[] {
  if (!currentExercise) return [];
  return [...currentExercise.distractors].sort(() => Math.random() - 0.5);
}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <button 
        onclick={showExercise ? backToSeries : goHome}
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
      >
        ← {showExercise ? t('chooseSeries') : t('backToMenu')}
      </button>
      <div class="flex items-center gap-4">
        <span class="text-lg font-bold text-purple-600 dark:text-purple-400">
          {t('score')}: {score}
        </span>
        <span class="text-lg font-bold text-orange-600 dark:text-orange-400">
          🔥 {streak}
        </span>
      </div>
    </div>
    
    <!-- Title -->
    <h1 class="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8">
      {t('title')}
    </h1>
    
    {#if !showExercise}
      <!-- SERIES SELECTION -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
          {t('chooseSeries')}
        </h2>
        
        <!-- Series Grid 2x2 -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          {#each series as s, i}
            <button
              onclick={() => goToSeries(i)}
              class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-4 border-orange-400"
            >
              <div class="text-lg font-bold text-orange-600 dark:text-orange-400 mb-2">
                Série {s.id}
              </div>
              <div class="text-gray-600 dark:text-gray-300 text-sm">
                {s.theme}
              </div>
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <!-- EXERCISE VIEW -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <!-- Progress indicator -->
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
          {currentIndex + 1} / {exercises.length}
        </div>
        
        <!-- French -->
        <div class="mb-4">
          <span class="text-sm text-gray-500 dark:text-gray-400">{t('frenchLabel')}</span>
          <p class="text-xl font-medium text-gray-800 dark:text-gray-200">
            {currentExercise.french}
          </p>
        </div>
        
        <!-- English with gap -->
        <div class="mb-6">
          <span class="text-sm text-gray-500 dark:text-gray-400">{t('englishLabel')}</span>
          <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {currentExercise.maskedEnglish}
          </p>
        </div>
        
        <!-- 4 choices in 2x2 grid -->
        <div class="grid grid-cols-2 gap-3">
          {#each getShuffledChoices() as choice}
            {@const isAnswer = choice === currentExercise.answer}
            {@const isSelected = choice === selectedAnswer}
            <button
              onclick={() => selectChoice(choice)}
              disabled={showResult}
              class="p-4 rounded-xl text-lg font-semibold transition-all border-4
                {isAnswer && showResult ? 'bg-green-500 text-white border-green-600 shadow-lg shadow-green-500/50' : ''}
                {isSelected && !isCorrect && showResult ? 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/50' : ''}
                {!showResult ? 'bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900 border-transparent cursor-pointer' : ''}
                {showResult && !isAnswer && !isSelected ? 'bg-gray-200 dark:bg-gray-600 opacity-50 border-transparent' : ''}"
            >
              {#if isAnswer && showResult}✓ {/if}{choice}
            </button>
          {/each}
        </div>
      </div>
      
      {#if showResult}
        <!-- Result message -->
        <div class="text-center mb-4 {isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} text-xl font-bold">
          {isCorrect ? t('correct') : t('wrong')}
        </div>
        
        <!-- Next Button -->
        <button
          onclick={nextExercise}
          class="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition-colors"
        >
          {t('nextExercise')}
        </button>
      {/if}
    {/if}
  </div>
</div>