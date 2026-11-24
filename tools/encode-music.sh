#!/usr/bin/env bash
# Encodes every assets/music/*.mp3 into Opus/ogg (80 kb/s VBR) next to it. Run it after adding or changing a track.
# The game plays the .ogg where the browser says it supports Opus in Ogg (canPlayType), the .mp3 elsewhere.
set -euo pipefail
cd "$(dirname "$0")/../assets/music"
for f in *.mp3; do ffmpeg -v error -y -i "$f" -c:a libopus -b:a 80k -vbr on -application audio "${f%.mp3}.ogg"; echo "$f -> ${f%.mp3}.ogg"; done
