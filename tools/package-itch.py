#!/usr/bin/env python3
"""Builds the game and zips dist/ for itch.io (HTML5 project: upload the zip, tick « This file will be played in
the browser », viewport 960 × 540 or larger, « Fullscreen button » on).  ->  release/une-nuit-avec-michel-itch.zip

Usage (project root):  python3 tools/package-itch.py [--no-build]
"""
import os, subprocess, sys, zipfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if '--no-build' not in sys.argv:
    subprocess.run('npm run --silent build', shell=True, cwd=ROOT, check=True)
dist = os.path.join(ROOT, 'dist')
os.makedirs(os.path.join(ROOT, 'release'), exist_ok=True)
out = os.path.join(ROOT, 'release', 'une-nuit-avec-michel-itch.zip')
n = size = 0
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, files in os.walk(dist):
        for f in files:
            p = os.path.join(d, f); rel = os.path.relpath(p, dist)
            if f.endswith('.map') or f == '_headers': continue      # source maps and host config are not for itch
            # media are already compressed: store them as is
            z.write(p, rel, compress_type=zipfile.ZIP_STORED if f.rsplit('.', 1)[-1] in ('webp', 'mp3', 'ogg', 'mp4', 'webm', 'woff2', 'png', 'jpg') else zipfile.ZIP_DEFLATED)
            n += 1; size += os.path.getsize(p)
if n > 1000: sys.exit(f'itch.io accepte 1000 fichiers max, il y en a {n}')
print(f'{out}: {n} fichiers, {size / 1e6:.1f} Mo (index.html à la racine)')
