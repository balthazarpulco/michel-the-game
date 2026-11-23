#!/usr/bin/env python3
"""Smoke test: builds the game in test mode, serves it with `vite preview`, starts every level in headless
Chromium, plays a few seconds of each and reports JS errors. Saves a screenshot per level in shots/.

Usage (project root):  python3 tools/smoke.py [level ...] [--no-build] [--url URL] [--out DIR]
  --no-build   reuse dist-test/ as is
  --url URL    test an already running page instead (it must expose the __g hook: `npm run dev`, or a test build)
  --out DIR    where screenshots go (default shots/)
  --renderer R pixi (default) or canvas
Math.random is seeded, so two runs build the same streets (handy to compare screenshots).
Needs: Node (npm install done) and  pip install playwright  (Python 3.9+, Chromium for Playwright).
"""
import asyncio, os, subprocess, sys, time, urllib.request
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALL = ['office', '1', 'boss', '2', 'joint', 'dance', 'texto', 'limo', 'bj', 'flip', 'bike', '3']
PORT = 4179

args = sys.argv[1:]
def opt(name, default=None):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
URL = opt('--url'); OUT = opt('--out', os.path.join(ROOT, 'shots')); RENDERER = opt('--renderer', 'pixi')
BUILD = '--no-build' not in args
if not BUILD: args.remove('--no-build')
LEVELS = args or ALL

SEED = """(()=>{let s=0x2F6E2B1;Math.random=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);
t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})();"""

def serve():
    if BUILD:
        subprocess.run('npm run --silent build:test', shell=True, cwd=ROOT, check=True)
    p = subprocess.Popen(['npx', 'vite', 'preview', '--outDir', 'dist-test', '--port', str(PORT), '--strictPort'],
                         cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    url = 'http://localhost:%d/' % PORT
    for _ in range(100):
        try: urllib.request.urlopen(url, timeout=1); return p, url
        except Exception: time.sleep(.2)
    p.kill(); sys.exit('vite preview did not start')

async def main(url):
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1280, 'height': 800})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: m.type == 'error' and errs.append('console: ' + m.text))
        await pg.add_init_script(SEED)
        await pg.goto(url + ('&' if '?' in url else '?') + 'renderer=' + RENDERER)
        await pg.wait_for_function('window.__g', timeout=30000)
        await pg.wait_for_timeout(1200)
        print('renderer', await pg.evaluate('document.documentElement.dataset.renderer'))
        await pg.screenshot(path=os.path.join(OUT, 'title.png'))
        ev = lambda c: pg.evaluate('__g.ev(%r)' % c)
        for lv in LEVELS:
            n0 = len(errs)
            await pg.evaluate('__g.go(%r)' % lv)
            await pg.wait_for_timeout(700)
            await pg.keyboard.press('Enter')           # close the tutorial phone
            await pg.wait_for_timeout(400)
            await pg.keyboard.down('ArrowRight'); await pg.wait_for_timeout(900); await pg.keyboard.up('ArrowRight')
            await pg.keyboard.press('Space'); await pg.wait_for_timeout(900)
            await pg.screenshot(path=os.path.join(OUT, 'lv_%s.png' % lv))
            print(lv, await ev('[state,level,lives]'), errs[n0:])
        print('errors total', len(errs), errs[:5])
        await b.close()
        return 1 if errs else 0

proc = None
try:
    if not URL: proc, URL = serve()
    code = asyncio.run(main(URL))
finally:
    if proc: proc.terminate()
sys.exit(code)
