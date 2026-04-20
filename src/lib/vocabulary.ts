import { supabase } from './supabase';

export interface VocabularyWord {
  id: number;
  french: string;
  english: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  exampleSentence?: string;
  imageUrl?: string;
}

export interface Pack {
  id: number;
  name: string;
  description: string;
  words: VocabularyWord[];
  day: number;
  isUnlocked: boolean;
  completed: boolean;
  progress: number;
}

export interface UserProgress {
  userId: string;
  startDate: string;
  learnedWords: Record<number, number[]>;
  currentPackId: number | null;
  currentCardIndex: number;
}

export const vocabularyWords: VocabularyWord[] = [
  { id: 1, french: "Bonjour", english: "Hello", category: "Greetings", difficulty: "easy" },
  { id: 2, french: "Au revoir", english: "Goodbye", category: "Greetings", difficulty: "easy" },
  { id: 3, french: "Merci", english: "Thank you", category: "Greetings", difficulty: "easy" },
  { id: 4, french: "S'il vous plaît", english: "Please", category: "Greetings", difficulty: "medium" },
  { id: 5, french: "Excusez-moi", english: "Excuse me", category: "Greetings", difficulty: "medium" },
  { id: 6, french: "Famille", english: "Family", category: "Family", difficulty: "easy" },
  { id: 7, french: "Mère", english: "Mother", category: "Family", difficulty: "easy" },
  { id: 8, french: "Père", english: "Father", category: "Family", difficulty: "easy" },
  { id: 9, french: "Frère", english: "Brother", category: "Family", difficulty: "easy" },
  { id: 10, french: "Sœur", english: "Sister", category: "Family", difficulty: "easy" },
  { id: 11, french: "Chat", english: "Cat", category: "Animals", difficulty: "easy" },
  { id: 12, french: "Chien", english: "Dog", category: "Animals", difficulty: "easy" },
  { id: 13, french: "Oiseau", english: "Bird", category: "Animals", difficulty: "easy" },
  { id: 14, french: "Cheval", english: "Horse", category: "Animals", difficulty: "medium" },
  { id: 15, french: "Éléphant", english: "Elephant", category: "Animals", difficulty: "medium" },
  { id: 16, french: "Pomme", english: "Apple", category: "Food", difficulty: "easy" },
  { id: 17, french: "Pain", english: "Bread", category: "Food", difficulty: "easy" },
  { id: 18, french: "Lait", english: "Milk", category: "Food", difficulty: "easy" },
  { id: 19, french: "Eau", english: "Water", category: "Food", difficulty: "easy" },
  { id: 20, french: "Fromage", english: "Cheese", category: "Food", difficulty: "medium" },
  { id: 21, french: "École", english: "School", category: "School", difficulty: "easy" },
  { id: 22, french: "Crayon", english: "Pencil", category: "School", difficulty: "easy" },
  { id: 23, french: "Livre", english: "Book", category: "School", difficulty: "easy" },
  { id: 24, french: "Professeur", english: "Teacher", category: "School", difficulty: "medium" },
  { id: 25, french: "Étudiant", english: "Student", category: "School", difficulty: "medium" },
];

function generateVocabulary(): VocabularyWord[] {
  const words = [...vocabularyWords];
  const categories = ['Colors', 'Numbers', 'Days', 'Months', 'Weather', 'Clothing', 'Body', 'House', 'City', 'Transport'];
  
  let id = 26;
  for (const category of categories) {
    for (let i = 0; i < 50; i++) {
      words.push({
        id: id++,
        french: `${category}Word${i}`,
        english: `${category}Translation${i}`,
        category,
        difficulty: i < 20 ? 'easy' : i < 35 ? 'medium' : 'hard',
      });
    }
  }
  
  return words.slice(0, 2000);
}

function generatePacks(): Pack[] {
  const allWords = generateVocabulary();
  const packs: Pack[] = [];
  
  for (let i = 0; i < 100; i++) {
    const startIdx = i * 20;
    const packWords = allWords.slice(startIdx, startIdx + 20);
    
    packs.push({
      id: i + 1,
      name: `Pack ${i + 1}`,
      description: `Learn ${packWords.length} ${packWords[0]?.category || 'French'} words`,
      words: packWords,
      day: i + 1,
      isUnlocked: false,
      completed: false,
      progress: 0,
    });
  }
  
  return packs;
}

function getDaysSinceDate(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTestStartDate(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const testDate = params.get('startDate');
  if (testDate && !isNaN(Date.parse(testDate))) {
    return testDate;
  }
  return null;
}

export class VocabularyCalendar {
  private packs: Pack[];
  private userId: string | null;
  private progress: UserProgress;
  private startDate: string;
  
  constructor(userId: string | null, existingProgress?: UserProgress) {
    this.packs = generatePacks();
    this.userId = userId;
    
    const testDate = getTestStartDate();
    if (testDate) {
      this.startDate = testDate;
    } else if (existingProgress?.startDate) {
      this.startDate = existingProgress.startDate;
    } else {
      this.startDate = new Date().toISOString().split('T')[0];
    }
    
    this.progress = existingProgress || {
      userId: userId || 'anonymous',
      startDate: this.startDate,
      learnedWords: {},
      currentPackId: null,
      currentCardIndex: 0
    };
    
    this.applyProgressToPacks();
    this.updateUnlockedPacks();
  }
  
  private applyProgressToPacks(): void {
    for (const pack of this.packs) {
      const learned = this.progress.learnedWords[pack.id] || [];
      if (learned.length > 0) {
        pack.progress = Math.round((learned.length / pack.words.length) * 100);
        if (pack.progress === 100) {
          pack.completed = true;
        }
      }
    }
  }
  
  private updateUnlockedPacks(): void {
    const daysSinceStart = getDaysSinceDate(this.startDate);
    for (const pack of this.packs) {
      pack.isUnlocked = pack.day <= daysSinceStart;
    }
  }
  
  getStartDate(): string {
    return this.startDate;
  }
  
  getUnlockedPacks(): Pack[] {
    return this.packs.filter(p => p.isUnlocked && !p.completed);
  }
  
  getCompletedPacks(): Pack[] {
    return this.packs.filter(p => p.completed);
  }
  
  getTodayPack(): Pack | undefined {
    const daysSinceStart = getDaysSinceDate(this.startDate);
    return this.packs.find(p => p.day === daysSinceStart + 1);
  }
  
  markWordLearned(packId: number, wordId: number): void {
    const pack = this.packs.find(p => p.id === packId);
    if (!pack) return;
    
    if (!this.progress.learnedWords[packId]) {
      this.progress.learnedWords[packId] = [];
    }
    
    if (!this.progress.learnedWords[packId].includes(wordId)) {
      this.progress.learnedWords[packId].push(wordId);
    }
    
    const learnedCount = this.progress.learnedWords[packId].length;
    pack.progress = Math.round((learnedCount / pack.words.length) * 100);
    
    if (pack.progress === 100) {
      pack.completed = true;
    }
    
    this.progress.currentPackId = packId;
  }
  
  getOverallProgress(): number {
    const completed = this.packs.filter(p => p.completed).length;
    return Math.round((completed / this.packs.length) * 100);
  }
  
  getProgress(): UserProgress {
    return this.progress;
  }
  
  async saveProgress(): Promise<void> {
    if (!this.userId) {
      localStorage.setItem('vocab-progress', JSON.stringify(this.progress));
      return;
    }
    
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: this.userId,
        progress_data: this.progress,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    if (error) console.error('Failed to save progress:', error);
  }
  
  static async loadProgress(userId: string | null): Promise<UserProgress | null> {
    if (!userId) {
      const saved = localStorage.getItem('vocab-progress');
      return saved ? JSON.parse(saved) : null;
    }
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('progress_data')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) return null;
    return data.progress_data as UserProgress;
  }
  
  static async resetProgress(userId: string | null): Promise<void> {
    if (!userId) {
      localStorage.removeItem('vocab-progress');
      return;
    }
    
    await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId);
  }
}