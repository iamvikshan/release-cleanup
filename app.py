#!/usr/bin/env python3
import os
import sys
import subprocess
from pathlib import Path

# Auto-install the required package so you don't have to think about it
try:
    import emoji
except ImportError:
    print("📦 Installing 'emoji' library...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "emoji", "--quiet"])
    import emoji

# --- Configuration ---
# Add or remove file extensions as needed
TARGET_EXTENSIONS = {'.ts', '.js', '.sh', '.json', '.md'}
# Directories to completely ignore
EXCLUDE_DIRS = {'.git', 'node_modules', 'dist', '.husky'}
# ---------------------

def clean_text(text):
    # emoji.replace_emoji strips the emojis but ignores standard 
    # symbols like ✓, •, ✗, ━ which are technically "dingbats"
    cleaned = emoji.replace_emoji(text, replace='')
    
    # Optional: clean up any double spaces left behind after an emoji was removed
    # (e.g., "Error:  Failed" -> "Error: Failed")
    cleaned = cleaned.replace('  ', ' ')
    
    return cleaned

def scrub_directory(base_dir):
    changed_files = 0
    
    for root, dirs, files in os.walk(base_dir):
        # Modify dirs in-place to skip excluded directories entirely
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            path = Path(root) / file
            
            if path.suffix in TARGET_EXTENSIONS:
                try:
                    content = path.read_text(encoding='utf-8')
                    cleaned_content = clean_text(content)
                    
                    if content != cleaned_content:
                        path.write_text(cleaned_content, encoding='utf-8')
                        print(f"✓ Scrubbed: {path.relative_to(base_dir)}")
                        changed_files += 1
                except Exception as e:
                    print(f"⚠️ Error reading {path.name}: {e}")

    print(f"\n✨ Done! Nuked emojis from {changed_files} files.")

if __name__ == "__main__":
    print("Starting emoji scrub...")
    scrub_directory(Path.cwd())