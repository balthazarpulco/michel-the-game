#!/usr/bin/env python3
"""Rebuilds Michel's vector rig (assets/rigs/hero.json) from the Illustrator layers in source/MICHEL.ai.

Usage (project root):  python3 tools/rig_from_ai.py          (needs: pip install pymupdf)

One vector part per group of .ai layers. Pivots are in .ai points (the artboard is 1080x1080).
  legs: thigh -> shin (clipped at the knee) -> shoe        arms: armR ; tattooed arm armL -> foreL (elbow)
  keys: keychain that swings ; top: tank top (goes under the arm when lifted)
  head: segB (back tufts on springs, then head) / live eyes / mid (chin, mouth lines) / cig / live mouth / segF
Layers f: 0 behind the body, 1 in front, 2 head, 3 over everything (the tattooed arm, per the user).
"""
import json, math, os, sys
import pymupdf as f
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from rigtools import finalize_rig

SRC = os.path.join(ROOT, 'source', 'MICHEL.ai')
d = f.open(SRC); pg = d[0]; DR = pg.get_drawings()
OX, OY, X1, Y1 = 329, 181, 740, 864          # character bounds in .ai points
S = 1747 / (Y1 - OY)                          # rig source units per .ai point
H = 260; K = H / ((Y1 - OY) * S)              # the game draws the rig H units tall
def P(x, y): return ((x - OX) * S, (y - OY) * S)
def col(c): return '#%02X%02X%02X' % tuple(round(v * 255) for v in c) if c else 0
def path_d(items, ox, oy, close):
    out = []; cur = None
    def pt(p): x, y = P(p.x, p.y); return f'{x-ox:.1f} {y-oy:.1f}'
    for it in items:
        k = it[0]
        if k == 're':
            r = it[1]; out.append(f'M{pt(r.tl)}L{pt(r.tr)}L{pt(r.br)}L{pt(r.bl)}Z'); cur = None; continue
        if k == 'qu':
            q = it[1]; out.append(f'M{pt(q.ul)}L{pt(q.ur)}L{pt(q.lr)}L{pt(q.ll)}Z'); cur = None; continue
        a = it[1]
        if cur is None or abs(a.x - cur.x) > 1e-3 or abs(a.y - cur.y) > 1e-3: out.append('M' + pt(a))
        if k == 'l': out.append('L' + pt(it[2])); cur = it[2]
        elif k == 'c': out.append('C' + pt(it[2]) + ' ' + pt(it[3]) + ' ' + pt(it[4])); cur = it[4]
    if close: out.append('Z')
    return ''.join(out)
def gather(layers, exclude=lambda x: False): return [x for x in DR if x['layer'] in layers and not exclude(x)]
def rect_of(ds, pad=6):
    r = None
    for x in ds: r = x['rect'] if r is None else r | x['rect']
    x0, y0 = P(r.x0, r.y0); x1, y1 = P(r.x1, r.y1); return [x0 - pad, y0 - pad, x1 + pad, y1 + pad]
# shading in the .ai: purple shapes in Multiply 25 %, pink shapes in Overlay -> baked against the colour they sit on
PURP = (0.31, 0.15, 0.37); PINK = (1.0, 0.73, 0.84)
def near(a, b): return a and all(abs(u - v) < .02 for u, v in zip(a, b))
BASE = {}; _last = {}
for _x in sorted(DR, key=lambda x: x['seqno']):
    fl = _x['fill'] if 'f' in _x['type'] else None
    if fl and not near(fl, PURP) and not near(fl, PINK): _last[_x['layer']] = fl
    elif fl: BASE[_x['seqno']] = _last.get(_x['layer'], (0.95, 0.73, 0.61))
def bake(x):
    fl = x['fill']; b = BASE.get(x['seqno'])
    if b is None: return fl
    if near(fl, PURP): return tuple(bb * (.75 + .25 * pp) for bb, pp in zip(b, (0.345, 0.192, 0.4)))
    return tuple(2 * bb * ss if bb < .5 else 1 - 2 * (1 - bb) * (1 - ss) for bb, ss in zip(b, (1, 0.745, 0.847)))
# tattoos are clipped to the arm skin (the .ai uses a clipping mask): ['CLIP',..] ... ['END',..] markers
TAT = lambda x: x['layer'].startswith('Arm Tattoo')
SKIN_ARM = {'Arm L', 'Arm R'}
def to_paths(ds, ox, oy):
    out = []; inT = False
    skin = [x for x in ds if x['layer'] in SKIN_ARM and 'f' in x['type'] and x['fill'] and x['fill'][0] > .8]
    cd = ''.join(path_d(x['items'], ox, oy, True) for x in skin)
    for x in sorted(ds, key=lambda x: x['seqno']):
        if cd and TAT(x) and not inT: out.append(['CLIP', 0, 0, cd, 0, 0, 0]); inT = True
        if inT and not TAT(x): out.append(['END', 0, 0, 'M0 0', 0, 0, 0]); inT = False
        t = x['type']; fill = col(bake(x)) if 'f' in t else 0; st = col(x['color']) if 's' in t else 0
        w = round((x['width'] or 0) * S, 2) if st else 0
        dd = path_d(x['items'], ox, oy, bool(x.get('closePath')) or 'f' in t)
        out.append([fill, 0, 0, dd, st, w, 1 if x.get('even_odd') else 0])
    if inT: out.append(['END', 0, 0, 'M0 0', 0, 0, 0])
    return out
def clip_poly(pts, ox, oy, discs=()):
    s = 'M' + 'L'.join(f'{P(x,y)[0]-ox:.1f} {P(x,y)[1]-oy:.1f}' for x, y in pts) + 'Z'
    for (cx, cy, r) in discs:
        X, Y = P(cx, cy); R = r * S; X -= ox; Y -= oy
        s += f'M{X+R:.1f} {Y:.1f}' + ''.join(f'L{X+R*math.cos(a):.1f} {Y+R*math.sin(a):.1f}' for a in [i * math.pi / 12 for i in range(1, 25)]) + 'Z'
    return s
ARM_L = ['Arm L', 'Arm Tattoo L 01', 'Arm Tattoo L 02', 'Arm Tattoo L 03', 'Arm Tattoo L 04', 'Hand L']
ELB = 703; KNEE = 806
parts = []
def part(n, ds, pivot, f_, parent=None, clip=None, extra=None):
    x0, y0, x1, y1 = rect_of(ds)
    if clip:
        cy0, cy1 = clip
        Y0 = (cy0 - OY) * S - 6 if cy0 is not None else y0; Y1_ = (cy1 - OY) * S + 6 if cy1 is not None else y1
        y0 = max(y0, Y0); y1 = min(y1, Y1_)
    ox, oy = int(x0), int(y0)
    px, py = P(*pivot)
    e = {'n': n, 'f': f_, 'x': ox, 'y': oy, 'px': round(px), 'py': round(py), 'paths': to_paths(ds, ox, oy)}
    if parent: e['parent'] = parent
    if extra: e.update(extra(ox, oy))
    parts.append(e); return e
def cl(top, bot, x0, x1, discs=()):
    def g(ox, oy): return {'clip': clip_poly([(x0, top), (x1, top), (x1, bot), (x0, bot)], ox, oy, discs)}
    return g
# legs: thigh (hip -> knee), shin (knee -> ankle), shoe
for s, cx in (('L', 478), ('R', 560)):
    leg = gather(['Leg ' + s]); shoe = gather(['Shoe ' + s])
    part('leg' + s, leg, (cx, 752), 0, clip=(None, KNEE + 8), extra=cl(700, KNEE, cx - 60, cx + 60, [(cx - 2, KNEE, 15)]))
    part('shin' + s, leg, (cx - 2, KNEE), 0, parent='leg' + s, clip=(KNEE - 16, None), extra=cl(KNEE, 880, cx - 60, cx + 60, [(cx - 2, KNEE, 15)]))
    part('foot' + s, shoe, (cx - 4, 838), 0, parent='shin' + s)
part('armR', gather(['Arm R', 'Arm Tattoo R', 'Hand R']), (586, 636), 0)
part('keys', gather(['Keychain 01', 'Keychain 02', 'Key 01', 'Key 02', 'Belt Strap']), (458, 749), 1)
armL = gather(ARM_L)
part('armL', armL, (432, 640), 3, clip=(None, ELB + 12), extra=cl(560, ELB, 360, 470, [(418, ELB, 17)]))
fo = part('foreL', armL, (418, ELB), 3, parent='armL', clip=(ELB - 18, None), extra=cl(ELB, 830, 360, 470, [(418, ELB, 17)]))
hx, hy = P(418, 800); fo['hand'] = [round(hx - fo['x']), round(hy - fo['y'])]
part('top', gather(['Top Body']), (510, 660), 1)
# head
BACK = ['Back Hair 04', 'Back Hair 03', 'Back Hair 02', 'Back Hair 01', 'Ear R', 'Head']
EYEBAG = lambda x: x['layer'] in ('Eye L', 'Eye R') and x['type'] == 's' and x['color'] and x['color'][0] > .5
MID = ['Chin', 'Mouth']; CIG = ['Cloppe']
FRONT = ['Stache', 'Glasses Back', 'Nose', 'Glasses Front', 'Hair', 'Shadow Toupet', 'Toupet 03', 'Toupet 02', 'Toupet 01', 'Ear L']
allhead = gather(BACK + MID + CIG + FRONT) + [x for x in DR if EYEBAG(x)]
hb = rect_of(allhead); hox, hoy = int(hb[0]), int(hb[1])
hpx, hpy = P(545, 628)
def lp(x, y): X, Y = P(x, y); return [round(X - hox, 1), round(Y - hoy, 1)]
# a segment with a pivot bounces on a spring in the game (hairTick): amp = how much, side = which way it splays
def seg(layers, piv=None, amp=1, side=0, extra=()):
    ds = gather(layers) + list(extra); e = {'paths': to_paths(ds, hox, hoy)}
    if piv: e.update(piv=lp(*piv), amp=amp, side=side)
    return e
eyebags = [x for x in DR if EYEBAG(x)]
segB = [seg(['Back Hair 04'], (668, 462), 1.3, 1), seg(['Back Hair 03'], (612, 398), 1.1, 1), seg(['Back Hair 02'], (512, 352), 1.0, -.3), seg(['Back Hair 01'], (408, 466), 1.3, -1),
        seg(['Ear R', 'Head'], extra=eyebags)]
segF = [seg(['Stache', 'Glasses Back', 'Nose', 'Glasses Front']), seg(['Hair', 'Shadow Toupet'], (545, 445), .2, 0),
        seg(['Toupet 03'], (540, 396), 1.2, .5), seg(['Toupet 02'], (489, 406), 1.5, -1), seg(['Toupet 01'], (575, 392), .9, .3), seg(['Ear L'])]
head = {'n': 'head', 'f': 2, 'x': hox, 'y': hoy, 'px': round(hpx), 'py': round(hpy), 'paths': [], 'segB': segB, 'segF': segF,
        'mid': {'paths': to_paths(gather(MID), hox, hoy)}, 'cig': {'paths': to_paths(gather(CIG), hox, hoy)}, 'front': {'paths': []}}
parts.append(head)
body = gather(['Belly', 'Under Shoulder'])
bx0, by0, _, _ = rect_of(body); bx0, by0 = int(bx0), int(by0)
out = {'w': round((X1 - OX) * S * K, 2), 'h': H, 'vec': 1, 'k': round(K, 6), 'skin': '#F3BA9D', 'body': {'x': bx0, 'y': by0, 'paths': to_paths(body, bx0, by0)}, 'parts': parts}
# live face (eyes, lids, mouth, cigarette tip), in rig source units
def R(v): return round(v * S, 1)
eyes = []; lids = []
for (cx, pcx, rx, lx0, lx1) in ((519, 522, 21, 496, 540), (598.5, 596.5, 19.5, 579, 618)):
    X, Y = P(cx, 486.5); PX, _ = P(pcx, 0); eyes.append([round(X), round(Y), R(rx), R(16.5), round(PX)])
    LX, LY = P(lx0, 470.5); lids.append([round(LX), round(LY), R(lx1 - lx0), R(11.5)])
MX, MY = P(560, 541); TX, TY = P(594, 555)
out['vface'] = {'eyes': eyes, 'lid': lids, 'mouth': [round(MX), round(MY), R(12)], 'line': '#AD7664', 'lw': R(2.5), 'pr': R(13), 'pdy': R(-3.5), 'tip': [round(TX), round(TY)],
                'cigTip': [round((594 - OX) / (X1 - OX), 3), round((555 - OY) / (Y1 - OY), 3)]}
finalize_rig(out)
dst = os.path.join(ROOT, 'assets', 'rigs', sys.argv[1] if len(sys.argv) > 1 else 'hero.json')
json.dump(out, open(dst, 'w'), separators=(',', ':'), ensure_ascii=False)
print('wrote', dst, os.path.getsize(dst), 'bytes; parts', [p['n'] for p in parts])
