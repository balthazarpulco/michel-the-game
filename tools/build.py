#!/usr/bin/env python3
"""Build the single-file game: src/template.html + assets/ -> dist/index.html (+ media copied next to it).

Usage (from the project root):  python3 tools/build.py [--test]
  --test  also writes dist/test.html: local fonts instead of Google Fonts, plus a window.__g debug hook
          (__g.go(level) jumps to a level, __g.ev(code) evaluates code inside the game's scope).
"""
import json, base64, os, re, shutil, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
MIME = {'webp': 'image/webp', 'png': 'image/png', 'jpg': 'image/jpeg', 'svg': 'image/svg+xml', 'gif': 'image/gif'}

def data_uri(path):
    ext = path.rsplit('.', 1)[1]
    return 'data:%s;base64,%s' % (MIME[ext], base64.b64encode(open(path, 'rb').read()).decode())

def inline(o):
    """Replace every "@img:<path>" string with the image file as a data URI."""
    if isinstance(o, dict): return {k: inline(v) for k, v in o.items()}
    if isinstance(o, list): return [inline(v) for v in o]
    if isinstance(o, str) and o.startswith('@img:'): return data_uri(P('assets', 'img', o[5:]))
    return o

def assets_json():
    man = json.load(open(P('assets', 'manifest.json')))
    order, rig_order = man.pop('_order'), man.pop('_rigs')
    # any rig file not listed yet is appended, so a new character only needs its json in assets/rigs/
    for f in sorted(os.listdir(P('assets', 'rigs'))):
        n = f[:-5]
        if f.endswith('.json') and n not in rig_order: rig_order.append(n)
    A = {}
    for k in order:
        if k == 'rigs': A['rigs'] = {n: inline(json.load(open(P('assets', 'rigs', n + '.json')))) for n in rig_order}
        else: A[k] = inline(man[k])
    return json.dumps(A, separators=(',', ':'), ensure_ascii=False)

def build():
    s = open(P('src', 'template.html')).read()
    ui = {k: data_uri(P('assets', 'ui', k + '.webp')) for k in ('keyart', 'logobase', 'logoflame', 'logosrc', 'bg')}
    for k, v in ui.items(): s = s.replace('__%s__' % k.upper(), v)
    s = s.replace('__ASSETS__', assets_json(), 1)
    os.makedirs(P('dist'), exist_ok=True)
    open(P('dist', 'index.html'), 'w').write(s)
    # media are published next to the page (same relative paths)
    for f in os.listdir(P('media')):
        src = P('media', f)
        if os.path.isdir(src): shutil.copytree(src, P('dist', f), dirs_exist_ok=True)
        else: shutil.copy2(src, P('dist', f))
    return s

def test_page(s):
    t = s.replace("requestAnimationFrame(loop);\n})();",
        "window.__g={go:l=>{['title','card','over','dev','pauseOv'].forEach(i=>document.getElementById(i).hidden=true);devGo(String(l))},ev:c=>eval(c)};\nrequestAnimationFrame(loop);\n})();")
    fnt = os.path.relpath(P('tools', 'fnt'), P('dist'))
    ff = '<style>'
    ff += '@font-face{font-family:"Lilita One";src:url(%s/lilita-one-latin-400-normal.woff2)}' % fnt
    for w in (400, 600, 700, 800, 900): ff += '@font-face{font-family:Inter;font-weight:%d;src:url(%s/inter-latin-%d-normal.woff2)}' % (w, fnt, w)
    t = t.replace('<style>', ff + '</style><style>', 1)
    open(P('dist', 'test.html'), 'w').write(t)
    # also extract the script for a quick syntax check:  node -e "new Function(require('fs').readFileSync('dist/game.js','utf8'))"
    open(P('dist', 'game.js'), 'w').write(re.search(r'<script>(.*)</script>', s, re.S).group(1))

if __name__ == '__main__':
    s = build()
    if '--test' in sys.argv: test_page(s)
    print('dist/index.html', len(s), 'bytes')
