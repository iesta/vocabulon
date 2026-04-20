#!/usr/bin/env python3
import json
import os
from gtts import gTTS
import time

AUDIO_DIR = "static/audio/vocab"

def generate_audio(text, output_path):
    if os.path.exists(output_path):
        return False
    try:
        tts = gTTS(text=text, lang='fr', slow=False)
        tts.save(output_path)
        return True
    except Exception as e:
        print(f"Error generating {output_path}: {e}")
        return False

def main():
    generated = 0
    skipped = 0
    
    # Generate for vocab cards 51-250
    for card_num in range(51, 251):
        card_id = f"w{card_num:05d}"
        json_path = f"src/lib/data/{card_id}.json"
        
        if not os.path.exists(json_path):
            print(f"Missing card: {json_path}")
            continue
            
        with open(json_path, 'r', encoding='utf-8') as f:
            card = json.load(f)
        
        for word in card.get('words', []):
            word_id = word['id']
            french = word['french']
            
            # Skip if audio already exists
            mp3_path = f"{AUDIO_DIR}/{card_id}_{word_id}.mp3"
            if os.path.exists(mp3_path):
                skipped += 1
                continue
            
            if generate_audio(french, mp3_path):
                generated += 1
                if generated % 50 == 0:
                    print(f"Generated {generated} files (skipped {skipped})")
            else:
                skipped += 1
        
        # Small delay to avoid rate limiting
        if card_num % 10 == 0:
            time.sleep(0.5)
    
    print(f"\nDone! Generated {generated} new files, skipped {skipped} existing")

if __name__ == "__main__":
    main()