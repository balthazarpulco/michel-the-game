#!/usr/bin/env node
// Asset pipeline: assets/ -> public/gen/ (served next to the page, loaded by src/boot/loader.ts).
//
//   node tools/assets.mjs [--force]   (also run by `npm run dev` / `npm run build`; skipped when assets/ didn't change)
//
// Output:
//   public/gen/manifest.json     what the loader reads first (never cached: it names every other file)
//   public/gen/atlas/…           sprite atlases (lossless WebP) — frames listed in the manifest
//   public/gen/img/…             big images (backgrounds, rooms), with a content hash in the file name (cache busting)
//   public/gen/rigs/…            one JSON per rig, hashed too
//
// In the data, "@img:<path>" points to assets/img/<path>; the loader replaces it with the loaded image.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const A = (...p) => path.join(ROOT, 'assets', ...p);
const OUT = path.join(ROOT, 'public', 'gen');

const hash = buf => createHash('sha1').update(buf).digest('hex').slice(0, 10);
const withHash = (rel, buf) => rel.replace(/(\.[a-z0-9]+)$/i, `.${hash(buf)}$1`);

const sizes = {};
function write(rel, buf) {
  sizes[rel] = buf.length;
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, buf);
  return rel;
}

// ---------- atlases ----------
const PAGE = 2048;        // atlas page size (WebGL-friendly power of two)
const PAD = 2;            // transparent gap around each sprite (avoids bleeding once textures are filtered)
const MAX_SPRITE = 1024;  // bigger images get their own file
// lossy q92 with lossless alpha: ~0.9 MB for both pages vs ~3 MB lossless, no visible difference on these drawings
const ATLAS_WEBP = { quality: 92, alphaQuality: 100, effort: 6 };

// shelf packing: tallest first, left to right, a new shelf when the row is full, a new page when the shelf doesn't fit
function pack(items) {
  const pages = [];
  let page = null, x = 0, y = 0, shelf = 0;
  const newPage = () => { page = { items: [], w: 0, h: 0 }; pages.push(page); x = y = shelf = 0; };
  for (const it of [...items].sort((a, b) => b.h - a.h || b.w - a.w)) {
    const w = it.w + PAD * 2, h = it.h + PAD * 2;
    if (!page) newPage();
    if (x + w > PAGE) { y += shelf; x = 0; shelf = 0; }
    if (y + h > PAGE) newPage();
    it.page = pages.length - 1; it.x = x + PAD; it.y = y + PAD;
    page.items.push(it);
    page.w = Math.max(page.w, x + w); page.h = Math.max(page.h, y + h);
    x += w; shelf = Math.max(shelf, h);
  }
  return pages;
}

async function packAtlases(sprites) {
  const frames = {}, out = [];
  const pages = pack(sprites);
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    // trimmed to the used area, rounded up to a multiple of 4
    const W = Math.ceil(p.w / 4) * 4, H = Math.ceil(p.h / 4) * 4;
    const buf = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(p.items.map(it => ({ input: it.buf, left: it.x, top: it.y })))
      .webp(ATLAS_WEBP)
      .toBuffer();
    out.push(write(withHash(`atlas/atlas-${i}.webp`, buf), buf));
    for (const it of p.items) frames[it.rel] = [i, it.x, it.y, it.w, it.h];
  }
  return { pages: out, frames };
}

// every "@img:" reference found in a JSON tree
function collectImgs(o, set) {
  if (Array.isArray(o)) o.forEach(v => collectImgs(v, set));
  else if (o && typeof o === 'object') Object.values(o).forEach(v => collectImgs(v, set));
  else if (typeof o === 'string' && o.startsWith('@img:')) set.add(o.slice(5));
  return set;
}

// fingerprint of every input (and of this script): unchanged inputs -> nothing to rebuild
function inputsHash() {
  const h = createHash('sha1');
  const walk = d => { for (const f of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p); else h.update(p).update(fs.readFileSync(p));
  } };
  walk(path.join(ROOT, 'assets'));
  h.update(fs.readFileSync(fileURLToPath(import.meta.url)));
  return h.digest('hex');
}

export async function buildAssets({ force = false } = {}) {
  const stamp = path.join(OUT, '.inputs'), fp = inputsHash();
  if (!force && fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf8') === fp)
    return JSON.parse(fs.readFileSync(path.join(OUT, 'manifest.json'), 'utf8'));
  fs.rmSync(OUT, { recursive: true, force: true });
  for (const k in sizes) delete sizes[k];
  const man = JSON.parse(fs.readFileSync(A('manifest.json'), 'utf8'));
  const order = man._order, rigOrder = man._rigs;
  delete man._order; delete man._rigs;
  // any rig file not listed yet is appended, so a new character only needs its json in assets/rigs/
  for (const f of fs.readdirSync(A('rigs')).sort()) {
    const n = f.replace(/\.json$/, '');
    if (f.endsWith('.json') && !rigOrder.includes(n)) rigOrder.push(n);
  }
  const rigs = {};
  const used = collectImgs(man, new Set());
  for (const n of rigOrder) {
    const buf = fs.readFileSync(A('rigs', n + '.json'));
    collectImgs(JSON.parse(buf), used);
    rigs[n] = write(withHash(`rigs/${n}.json`, buf), buf);
  }

  // images: small sprites with transparency go into atlases, big opaque pictures (backgrounds, rooms) stay files
  const files = {}, sprites = [];
  for (const rel of [...used].sort()) {
    const buf = fs.readFileSync(A('img', rel));
    const m = await sharp(buf).metadata();
    if (m.hasAlpha && Math.max(m.width, m.height) <= MAX_SPRITE) sprites.push({ rel, buf, w: m.width, h: m.height });
    else files[rel] = write(withHash(`img/${rel}`, buf), buf);
  }
  const { pages, frames } = await packAtlases(sprites);
  // the title screen's background street is drawn by the game too
  { const buf = fs.readFileSync(A('ui', 'bg.webp')); files['ui/bg.webp'] = write(withHash('img/ui/bg.webp', buf), buf); }

  const out = { order, rigOrder, rigs, files, atlases: pages, frames, sizes, data: man };
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(out));
  fs.writeFileSync(stamp, fp);
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const t0 = Date.now();
  const r = await buildAssets({ force: process.argv.includes('--force') });
  console.log(`assets: ${Object.keys(r.frames).length} sprites in ${r.atlases.length} atlases, ${Object.keys(r.files).length} images, ${Object.keys(r.rigs).length} rigs -> public/gen (${Date.now() - t0} ms)`);
}
