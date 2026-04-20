export interface CardWord {
  id: number;
  english: string;
  french: string;
  example: string;
}

export interface Card {
  id: string;
  title: string;
  day: number;
  words: CardWord[];
}

const cardFiles = [
  'w00001', 'w00002', 'w00003', 'w00004', 'w00005',
  'w00006', 'w00007', 'w00008', 'w00009', 'w00010'
];

const cardCache: Map<string, Card> = new Map();

export async function loadCard(id: string): Promise<Card | null> {
  if (cardCache.has(id)) {
    return cardCache.get(id)!;
  }
  
  try {
    const response = await fetch(`/lib/data/${id}.json`);
    if (!response.ok) return null;
    const card = await response.json() as Card;
    cardCache.set(id, card);
    return card;
  } catch {
    return null;
  }
}

export async function loadAllCards(): Promise<Card[]> {
  const cards: Card[] = [];
  for (const id of cardFiles) {
    const card = await loadCard(id);
    if (card) cards.push(card);
  }
  return cards;
}

export function getUnlockedCards(startDate: string, allCards: Card[]): Card[] {
  const start = new Date(startDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  return allCards.filter(card => card.day <= diffDays + 1);
}