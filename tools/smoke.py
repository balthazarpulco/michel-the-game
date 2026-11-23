#!/usr/bin/env python3
"""Smoke test: opens dist/test.html in headless Chromium, starts every level, plays a few seconds of each
and reports JS errors. Also saves a screenshot per level in shots/.

Usage (project root):  python3 tools/build.py --test && python3 tools/smoke.py [level ...]
Needs: pip install playwright && playwright install chromium   (Python 3.9+)
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEVELS = sys.argv[1:] or ['office', '1', 'boss', '2', 'joint', 'dance', 'texto', 'limo', 'bj', 'flip', 'bike', '3']

async def main():
    os.makedirs(os.path.join(ROOT, 'shots'), exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1280, 'height': 800})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'test.html'))
        await pg.wait_for_timeout(1200)
        ev = lambda c: pg.evaluate('__g.ev(%r)' % c)
        for lv in LEVELS:
            n0 = len(errs)
            await pg.evaluate('__g.go(%r)' % lv)
            await pg.wait_for_timeout(700)
            await pg.keyboard.press('Enter')           # close the tutorial phone
            await pg.wait_for_timeout(400)
            await pg.keyboard.down('ArrowRight'); await pg.wait_for_timeout(900); await pg.keyboard.up('ArrowRight')
            await pg.keyboard.press('Space'); await pg.wait_for_timeout(900)
            await pg.screenshot(path=os.path.join(ROOT, 'shots', 'lv_%s.png' % lv))
            print(lv, await ev('[state,level,lives]'), errs[n0:])
        print('errors total', len(errs), errs[:5])
        await b.close()
        sys.exit(1 if errs else 0)

asyncio.run(main())
