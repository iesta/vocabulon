#!/usr/bin/env python3
import json
import os
from gtts import gTTS
import time

AUDIO_DIR = "static/audio/vocab"

def generate_audio(text, output_path):
    try:
        tts = gTTS(text=text, lang='fr', slow=False)
        tts.save(output_path)
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    generated = 0
    
    # Only cards 200-250
    for card_num in range(200, 251):
        card_id = f"w{card_num:05d}"
        json_path = f"src/lib/data/{card_id}.json"
        
        if not os.path.exists(json_path):
            print(f"Missing: {json_path}")
            continue
            
        with open(json_path, 'r', encoding='utf-8') as f:
            card = json.load(f)
        
        for word in card.get('words', []):
            word_id = word['id']
            french = word['french']
            mp3_path = f"{AUDIO_DIR}/{card_id}_{word_id}.mp3"
            
            if generate_audio(french, mp3_path):
                generated += 1
        
        print(f"Card {card_id} done ({generated} total)")
        time.sleep(0.3)
    
    print(f"\nDone! Generated {generated} files")

if __name__ == "__main__":
    main()