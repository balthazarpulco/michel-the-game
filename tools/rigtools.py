"""Helpers to finish a vector rig before it goes in assets/rigs/: bounding boxes (used by the game's bitmap
cache, vecDraw) then compact relative SVG paths. Always bbox first: it reads absolute coordinates."""
import re

def bbox(L):
    xs = []; ys = []
    for q in L:
        tx, ty, d = q[1], q[2], q[3]; w = (q[5] / 2 + 1) if len(q) > 5 and q[4] else 0
        n = [float(v) for v in re.findall(r'-?\d*\.?\d+', d)]
        xs += [tx + v - w for v in n[0::2]] + [tx + v + w for v in n[0::2]]; ys += [ty + v - w for v in n[1::2]] + [ty + v + w for v in n[1::2]]
    return [min(xs), min(ys), max(xs), max(ys)] if xs else [0, 0, 1, 1]

def num(v):
    v = round(v, 1)
    s = ('%d' % v) if v == int(v) else ('%.1f' % v)
    return s.replace('0.', '.', 1) if s.startswith('0.') else s.replace('-0.', '-.', 1)

def join(nums):
    out = ''
    for n in nums:
        if out and not n.startswith('-'): out += ' '
        out += n
    return out

def comp(d):
    """Absolute M/C/L/Z path -> relative c/l path with 1 decimal (about 40 % smaller)."""
    toks = re.findall(r'[MCLZmclz]|-?\d*\.?\d+', d)
    out = []; i = 0; cx = cy = sx = sy = 0; last = None
    while i < len(toks):
        t = toks[i]; i += 1
        if t in 'Mm':
            x, y = float(toks[i]), float(toks[i + 1]); i += 2
            if t == 'm': x += cx; y += cy
            out.append('M' + join([num(x), num(y)])); cx, cy = x, y; sx, sy = x, y; last = 'M'
        elif t in 'Cc':
            seg = []
            while i < len(toks) and toks[i] not in 'MCLZmclz':
                a = [float(v) for v in toks[i:i + 6]]; i += 6
                if t == 'C': a = [a[0] - cx, a[1] - cy, a[2] - cx, a[3] - cy, a[4] - cx, a[5] - cy]
                seg += [num(v) for v in a]; cx += a[4]; cy += a[5]
            out.append(('c' if last != 'c' else '') + join(seg) if last != 'c' else ' ' + join(seg) if not seg[0].startswith('-') else join(seg)); last = 'c'
        elif t in 'Ll':
            seg = []
            while i < len(toks) and toks[i] not in 'MCLZmclz':
                a = [float(v) for v in toks[i:i + 2]]; i += 2
                if t == 'L': a = [a[0] - cx, a[1] - cy]
                seg += [num(v) for v in a]; cx += a[0]; cy += a[1]
            out.append(('l' if last != 'l' else ' ') + join(seg)); last = 'l'
        elif t in 'Zz':
            out.append('z'); cx, cy = sx, sy; last = 'z'
    return ''.join(out)

def groups(R):
    """Every {paths: [...]} object of a rig: body, parts, head sub-groups, hair segments."""
    G = [R['body']]
    for p in R['parts']:
        G.append(p)
        G += [p[k] for k in ('mid', 'cig', 'front') if k in p]
        G += p.get('segB', []) + p.get('segF', [])
    return G

def finalize_rig(R):
    for g in groups(R): g['bb'] = bbox(g['paths'])
    for g in groups(R):
        for q in g['paths']: q[3] = comp(q[3])
    return R
