import { writable } from 'svelte/store';

export type Lang = 'fr' | 'en';

const translations = {
  fr: {
    appTitle: 'Cartes Mémoire Français',
    subtitle: 'Apprenez le vocabulaire français un paquet par jour!',
    overallProgress: 'Progression globale',
    dailyPacks: 'Paquets Quotidiens',
    todaysPack: "Paquet d'Aujourd'hui",
    startLearning: 'Commencer',
    availablePacks: 'Paquets Disponibles',
    words: 'mots',
    flashcard: 'Carte Mémoire',
    french: 'FRANÇAIS',
    english: 'ANGLAIS',
    clickToFlip: 'Cliquez pour retourner',
    flipCard: 'Retourner la Carte',
    iKnowThis: 'Je Connais',
    nextCard: 'Carte Suivante',
    cardOf: 'Carte {current} sur {total} dans {pack}',
    category: 'Catégorie',
    difficulty: 'Difficulté',
    welcomeTitle: 'Bienvenue!',
    welcomeText: 'Sélectionnez un paquet pour commencer. De nouveaux paquets se déverrouillent chaque jour!',
    welcomeTextLoggedIn: 'Sélectionnez un paquet pour commencer. De nouveaux paquets se déverrouillent chaque jour!',
    startWithFirst: 'Commencer avec le Premier Paquet',
    signInToSave: 'Connectez-vous pour sauvegarder votre progression',
    packsAvailable: 'Paquets Disponibles',
    totalWords: 'Mots Totaux',
    footer: 'Cartes Mémoire Français • Un paquet se déverrouille chaque jour',
    started: 'Commencé le',
    resetProgress: 'Réinitialiser',
    signInWithGoogle: 'Se connecter avec Google',
    signOut: 'Déconnexion',
    selectPack: 'Sélectionnez un paquet pour commencer',
    learnVocab: 'Apprenez le vocabulaire',
    forKids: 'Parfait pour les enfants de 12+ ans'
  },
  en: {
    appTitle: 'French Flashcards',
    subtitle: 'Learn French vocabulary one pack per day!',
    overallProgress: 'Overall Progress',
    dailyPacks: 'Daily Packs',
    todaysPack: "Today's Pack",
    startLearning: 'Start Learning',
    availablePacks: 'Available Packs',
    words: 'words',
    flashcard: 'Flashcard',
    french: 'FRENCH',
    english: 'ENGLISH',
    clickToFlip: 'Click to flip card',
    flipCard: 'Flip Card',
    iKnowThis: 'I Know This',
    nextCard: 'Next Card',
    cardOf: 'Card {current} of {total} in {pack}',
    category: 'Category',
    difficulty: 'Difficulty',
    welcomeTitle: 'Welcome!',
    welcomeText: 'Select a pack from the left to start learning. New packs unlock every day!',
    welcomeTextLoggedIn: 'Select a pack from the left to start learning. New packs unlock every day!',
    startWithFirst: 'Start with First Pack',
    signInToSave: 'Sign in with Google to save your progress',
    packsAvailable: 'Packs Available',
    totalWords: 'Total Words',
    footer: 'French Flashcards • One pack unlocks every day',
    started: 'Started',
    resetProgress: 'Reset',
    signInWithGoogle: 'Sign in with Google',
    signOut: 'Sign Out',
    selectPack: 'Select a pack to start learning',
    learnVocab: 'Learn vocabulary',
    forKids: 'Perfect for kids aged 12+'
  }
};

function createI18n() {
  let stored: string | null = null;
  if (typeof window !== 'undefined') {
    stored = localStorage.getItem('lang');
  }
  const initial: Lang = (stored === 'en' || stored === 'fr') ? stored : 'fr';
  
  const { subscribe, set, update } = writable<Lang>(initial);
  
  return {
    subscribe,
    set: (lang: Lang) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('lang', lang);
      }
      set(lang);
    },
    toggle: () => {
      update(current => {
        const next = current === 'fr' ? 'en' : 'fr';
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('lang', next);
        }
        return next;
      });
    }
  };
}

export const lang = createI18n();

export function t(key: keyof typeof translations.fr): string {
  let currentLang: Lang = 'fr';
  lang.subscribe(l => currentLang = l)();
  return translations[currentLang][key] || key;
}

export function tf(key: keyof typeof translations.fr, params: Record<string, string | number>): string {
  let text = t(key);
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, String(v));
  }
  return text;
}