#!/usr/bin/env node
// Asset pipeline: assets/ -> public/gen/ (served next to the page, loaded by src/boot/loader.ts).
//
//   node tools/assets.mjs        (also run by `npm run dev` / `npm run build`)
//
// Output:
//   public/gen/manifest.json     what the loader reads first (never cached: it names every other file)
//   public/gen/img/…             images, with a content hash in the file name (cache busting)
//   public/gen/rigs/…            one JSON per rig, hashed too
//
// In the data, "@img:<path>" points to assets/img/<path>; the loader replaces it with the loaded image.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

// every "@img:" reference found in a JSON tree
function collectImgs(o, set) {
  if (Array.isArray(o)) o.forEach(v => collectImgs(v, set));
  else if (o && typeof o === 'object') Object.values(o).forEach(v => collectImgs(v, set));
  else if (typeof o === 'string' && o.startsWith('@img:')) set.add(o.slice(5));
  return set;
}

export async function buildAssets() {
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

  // images (one file each for now)
  const files = {};
  for (const rel of [...used].sort()) {
    const buf = fs.readFileSync(A('img', rel));
    files[rel] = write(withHash(`img/${rel}`, buf), buf);
  }
  // the title screen's background street is drawn by the game too
  { const buf = fs.readFileSync(A('ui', 'bg.webp')); files['ui/bg.webp'] = write(withHash('img/ui/bg.webp', buf), buf); }

  const out = { order, rigOrder, rigs, files, sizes, data: man };
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(out));
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const t0 = Date.now();
  const r = await buildAssets();
  console.log(`assets: ${Object.keys(r.files).length} images, ${Object.keys(r.rigs).length} rigs -> public/gen (${Date.now() - t0} ms)`);
}
