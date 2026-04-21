#!/usr/bin/env python3
"""
Generate audio files for vocabulary cards.

Usage:
    python generate_audio.py --type word --start 1 --end 50 --lang en
    python generate_audio.py --type sentence --start 1 --end 100 --lang fr

Types:
    word      - Generate audio for individual words (from vocab cards)
    sentence  - Generate audio for sentences/phrases (from phrase cards)
"""
import argparse
import json
import os
from gtts import gTTS
import time

AUDIO_DIR = "static/audio"

def generate_audio(text, output_path, lang='en'):
    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(output_path)
        return True
    except Exception as e:
        print(f"Error generating {output_path}: {e}")
        return False

def get_text_from_card(card_path, item_id, card_type):
    with open(card_path, 'r', encoding='utf-8') as f:
        card = json.load(f)
    
    if card_type == 'word':
        for word in card.get('words', []):
            if word['id'] == item_id:
                return word.get('english', '')
    elif card_type == 'sentence':
        for expr in card.get('expressions', []):
            if expr['id'] == item_id:
                return expr.get('english', '')
    return None

def main():
    parser = argparse.ArgumentParser(description='Generate audio for vocabulary cards')
    parser.add_argument('--type', '-t', choices=['word', 'sentence'], default='word',
                        help='Type of content: word or sentence')
    parser.add_argument('--start', '-s', type=int, default=1,
                        help='Starting card number')
    parser.add_argument('--end', '-e', type=int, default=100,
                        help='Ending card number')
    parser.add_argument('--lang', '-l', type=str, default='en',
                        help='Language code (default: en)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Show what would be generated without generating')
    
    args = parser.parse_args()
    
    prefix = 'w' if args.type == 'word' else 'p'
    subdir = 'vocab' if args.type == 'word' else 'phrase'
    items_per_card = 6 if args.type == 'word' else 3
    
    audio_dir = f"{AUDIO_DIR}/{subdir}"
    os.makedirs(audio_dir, exist_ok=True)
    
    total = 0
    generated = 0
    skipped = 0
    
    for card_num in range(args.start, args.end + 1):
        card_id = f"{prefix}{card_num:05d}"
        json_path = f"src/lib/data/{card_id}.json"
        
        if not os.path.exists(json_path):
            print(f"Card not found: {json_path}")
            continue
        
        for item_id in range(1, items_per_card + 1):
            text = get_text_from_card(json_path, item_id, args.type)
            if not text:
                continue
            
            mp3_path = f"{audio_dir}/{card_id}_{item_id}.mp3"
            total += 1
            
            if args.dry_run:
                print(f"Would generate: {mp3_path} ({text})")
                continue
            
            if os.path.exists(mp3_path):
                skipped += 1
                continue
            
            if generate_audio(text, mp3_path, args.lang):
                generated += 1
            else:
                skipped += 1
            
            if total % 50 == 0:
                print(f"Progress: {total} processed, {generated} generated, {skipped} skipped")
        
        if card_num % 10 == 0:
            time.sleep(0.2)
    
    print(f"\nDone! Total: {total}, Generated: {generated}, Skipped: {skipped}")

if __name__ == "__main__":
    main()