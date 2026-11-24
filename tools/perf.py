#!/usr/bin/env python3
"""Rough performance check in headless Chromium, phone-like (844 × 390, DPR 3) with the CPU slowed down 4×.
Measures the time until the title screen is playable, then the average fps in a few levels, for both renderers.
Headless Chromium draws WebGL in software (SwiftShader): the Pixi numbers are pessimistic, a real phone GPU is faster.

Usage (project root):  python3 tools/perf.py [--no-build] [--cpu 4]
"""
import asyncio, os, subprocess, sys, time, urllib.request
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CPU = float(sys.argv[sys.argv.index('--cpu') + 1]) if '--cpu' in sys.argv else 4
PORT = 4183
if '--no-build' not in sys.argv:
    subprocess.run('npm run --silent build:test', shell=True, cwd=ROOT, check=True)
srv = subprocess.Popen(['npx', 'vite', 'preview', '--outDir', 'dist-test', '--port', str(PORT), '--strictPort'],
                       cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
for _ in range(100):
    try: urllib.request.urlopen('http://localhost:%d/' % PORT, timeout=1); break
    except Exception: time.sleep(.2)

FPS = """() => new Promise(ok => { let n = 0; const t0 = performance.now();
  const f = () => { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(f); else ok(n / ((performance.now() - t0) / 1000)) };
  requestAnimationFrame(f) })"""

async def run(renderer):
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--enable-unsafe-swiftshader'])
        ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
        pg = await ctx.new_page()
        cdp = await ctx.new_cdp_session(pg)
        await cdp.send('Emulation.setCPUThrottlingRate', {'rate': CPU})
        t0 = time.time()
        await pg.goto('http://localhost:%d/?renderer=%s' % (PORT, renderer))
        await pg.wait_for_function("window.__g && !document.getElementById('loadOv')", timeout=60000)
        ready = time.time() - t0
        out = {'prêt (s)': round(ready, 2)}
        for lv in ['2', 'dance', 'bike', 'flip']:
            await pg.evaluate('__g.go(%r)' % lv); await pg.wait_for_timeout(600)
            await pg.evaluate("__g.ev('closePhone()')"); await pg.wait_for_timeout(600)
            out[lv] = round(await pg.evaluate(FPS), 1)
        await b.close()
        return out

try:
    for r in ['canvas', 'pixi']:
        print(r, asyncio.run(run(r)))
finally:
    srv.terminate()
