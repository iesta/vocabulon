#!/usr/bin/env python3
"""
Generate missing word exercises from existing phrase cards.

For each phrase:
- Identify a good word to mask (not articles, prepositions, short words)
- Create 4 choices (1 correct + 3 distractors)
"""
import json
import os
import random

def get_words_to_mask():
    """Words that can be masked (not articles, short words)"""
    return [
        # Verbs
        'run', 'walk', 'eat', 'drink', 'sleep', 'read', 'write', 'speak', 'listen',
        'play', 'work', 'study', 'think', 'know', 'want', 'need', 'like', 'love',
        'hate', 'help', 'give', 'take', 'make', 'do', 'say', 'see', 'hear', 'feel',
        'buy', 'sell', 'bring', 'carry', 'catch', 'cut', 'draw', 'drive', 'fall',
        'find', 'fly', 'forget', 'grow', 'hold', 'keep', 'learn', 'leave', 'lose',
        'meet', 'pay', 'put', 'show', 'sit', 'stand', 'tell', 'turn', 'use', 'wait',
        
        # Adjectives
        'big', 'small', 'large', 'little', 'tall', 'short', 'long', 'high', 'low',
        'fast', 'slow', 'quick', 'bright', 'dark', 'light', 'hot', 'cold', 'warm',
        'cool', 'new', 'old', 'young', 'good', 'bad', 'nice', 'great', 'beautiful',
        'ugly', 'happy', 'sad', 'angry', 'scared', 'strong', 'weak', 'rich', 'poor',
        'clean', 'dirty', 'easy', 'hard', 'soft', 'hard', 'smooth', 'rough', 'loud',
        'quiet', 'busy', 'free', 'safe', 'dangerous', 'empty', 'full', 'open', 'closed',
        'different', 'same', 'special', 'normal', 'strange', 'famous', 'important',
        
        # Nouns
        'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'sheep', 'rabbit', 'mouse',
        'tree', 'flower', 'grass', 'plant', 'leaf', 'root', 'forest', 'garden', 'park',
        'house', 'home', 'room', 'door', 'window', 'floor', 'wall', 'roof', 'kitchen',
        'bed', 'chair', 'table', 'desk', 'book', 'pen', 'paper', 'phone', 'computer',
        'car', 'bus', 'train', 'bike', 'boat', 'plane', 'ship', 'road', 'street', 'city',
        'town', 'village', 'school', 'hospital', 'shop', 'restaurant', 'hotel', 'park',
        'river', 'lake', 'sea', 'ocean', 'mountain', 'hill', 'beach', 'island', 'bridge',
        'father', 'mother', 'brother', 'sister', 'friend', 'teacher', 'doctor', 'nurse',
        'food', 'water', 'milk', 'bread', 'meat', 'fish', 'egg', 'rice', 'soup', 'salad',
        'coffee', 'tea', 'juice', 'wine', 'beer', 'cake', 'fruit', 'apple', 'banana',
        'morning', 'afternoon', 'evening', 'night', 'day', 'week', 'month', 'year', 'hour',
        'minute', 'second', 'today', 'tomorrow', 'yesterday', 'now', 'then', 'always',
        'never', 'sometimes', 'often', 'usually', 'maybe', 'yes', 'no', 'please', 'thanks',
        'problem', 'question', 'answer', 'reason', 'idea', 'story', 'news', 'music', 'song',
        'game', 'sport', 'team', 'player', 'goal', 'point', 'score', 'match', 'race',
        
        # Adverbs
        'here', 'there', 'everywhere', 'nowhere', 'somewhere', 'inside', 'outside', 'upstairs',
        'downstairs', 'away', 'back', 'together', 'apart', 'forward', 'backward',
        
        # Prepositions/others that could work
        'with', 'without', 'under', 'over', 'between', 'among', 'through', 'during',
        'before', 'after', 'until', 'since', 'against', 'towards', 'away from',
        
        # Common words that make sense to mask
        'time', 'place', 'person', 'people', 'thing', 'world', 'life', 'death', 'money',
        'hand', 'head', 'eye', 'face', 'hair', 'body', 'arm', 'leg', 'foot', 'heart',
        'name', 'number', 'word', 'sentence', 'language', 'country', 'area', 'end', 'start',
    ]

def get_distractors(correct_word, category):
    """Get distractors - same category + traps"""
    words = get_words_to_mask()
    distractors = [correct_word]
    
    # Same category distractors
    category_words = [w for w in words if w in category]
    while len(category_words) < 3:
        category_words.append(random.choice(words))
    
    for w in category_words:
        if w != correct_word and w not in distractors:
            distractors.append(w)
            if len(distractors) >= 4:
                break
    
    # Add traps if not enough
    traps = ['it', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 'and', 'or']
    while len(distractors) < 4:
        trap = random.choice(traps)
        if trap not in distractors:
            distractors.append(trap)
    
    random.shuffle(distractors)
    return distractors[:4]

def find_word_to_mask(english_sentence):
    """Find a good word to mask in the sentence"""
    words = english_sentence.lower().replace('?', '').replace('!', '').replace('.', '').replace(',', '').split()
    
    # Skip short words and articles
    skip_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 'and', 'or', 'but', 'in', 'on', 'at', 'for', 'with', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'how', 'why', 'when', 'where'}
    
    candidates = []
    for i, word in enumerate(words):
        clean = word.strip("'s")
        if clean not in skip_words and len(clean) > 2:
            candidates.append((i, word, clean))
    
    if not candidates:
        return None, None
    
    # Pick randomly from candidates
    idx, original, clean = random.choice(candidates)
    return original, clean

def main():
    # Load all phrase cards
    phrases = []
    for i in range(1, 101):
        card_id = f"p{i:05d}"
        json_path = f"src/lib/data/{card_id}.json"
        
        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                card = json.load(f)
            
            for expr in card.get('expressions', []):
                english = expr.get('english', '')
                french = expr.get('french', '')
                
                original_word, clean_word = find_word_to_mask(english)
                if original_word and clean_word:
                    # Create mask position
                    masked_english = english.replace(original_word, '____', 1)
                    masked_english = masked_english.replace('  ', ' ')
                    
                    # Get distractors
                    distractors = get_distractors(clean_word, get_words_to_mask())
                    
                    phrases.append({
                        'id': len(phrases) + 1,
                        'french': french,
                        'english': english,
                        'maskedEnglish': masked_english,
                        'answer': clean_word,
                        'distractors': distractors,
                        'cardId': card_id,
                        'exprId': expr.get('id', 1)
                    })
    
    # Generate up to 500
    random.shuffle(phrases)
    phrases = phrases[:500]
    
    # Save to file
    output = {
        'exercises': phrases,
        'total': len(phrases)
    }
    
    with open('src/lib/data/missing-exercises.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"Generated {len(phrases)} missing word exercises")

if __name__ == "__main__":
    random.seed(42)  # For reproducibility
    main()