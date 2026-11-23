// Preloads everything the game draws (sprite atlases, big images, character rigs, fonts) with a real progress bar,
// then hands the game a ready-to-use ASSETS object where every "@img:<path>" is a loaded image.
// The file list comes from public/gen/manifest.json, written by tools/assets.mjs.

export type Drawable = HTMLImageElement | HTMLCanvasElement;

interface Manifest {
  order: string[];
  rigOrder: string[];
  rigs: Record<string, string>;
  files: Record<string, string>;
  atlases: string[];
  /** sprite path -> [atlas page, x, y, w, h] */
  frames: Record<string, [number, number, number, number, number]>;
  sizes: Record<string, number>;
  data: Record<string, unknown>;
}

export interface Loaded {
  assets: Record<string, any>;
  ui: { bg: Drawable };
}

const BASE = import.meta.env.BASE_URL + 'gen/';

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((ok, fail) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(() => ok(im));
    im.onerror = () => fail(new Error('image ' + url));
    im.src = url;
  });
}

async function loadJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

/**
 * Cuts one sprite out of an atlas page into its own canvas. The legacy code draws these exactly like images
 * and checks `complete` / `naturalWidth`, so the canvas answers those too.
 */
function cutFrame(page: HTMLImageElement, x: number, y: number, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d')!.drawImage(page, x, y, w, h, 0, 0, w, h);
  Object.defineProperties(c, { complete: { value: true }, naturalWidth: { value: w }, naturalHeight: { value: h } });
  return c;
}

/** Replaces every "@img:<path>" string in a JSON tree by the loaded image. */
function resolve(o: any, img: (rel: string) => Drawable): any {
  if (Array.isArray(o)) return o.map(v => resolve(v, img));
  if (o && typeof o === 'object') {
    const r: Record<string, any> = {};
    for (const k in o) r[k] = resolve(o[k], img);
    return r;
  }
  if (typeof o === 'string' && o.startsWith('@img:')) return img(o.slice(5));
  return o;
}

export async function loadAll(onProgress: (p: number) => void): Promise<Loaded> {
  const man = await loadJSON<Manifest>(BASE + 'manifest.json', { cache: 'no-cache' });

  // progress is weighted by file size, fonts count as a small fixed share
  const jobs: { w: number; run: () => Promise<unknown> }[] = [];
  const images: Record<string, HTMLImageElement> = {};
  const rigs: Record<string, unknown> = {};
  const pages: HTMLImageElement[] = [];
  man.atlases.forEach((file, i) =>
    jobs.push({ w: man.sizes[file] || 1, run: async () => { pages[i] = await loadImage(BASE + file); } }));
  for (const [rel, file] of Object.entries(man.files))
    jobs.push({ w: man.sizes[file] || 1, run: async () => { images[rel] = await loadImage(BASE + file); } });
  for (const [n, file] of Object.entries(man.rigs))
    jobs.push({ w: man.sizes[file] || 1, run: async () => { rigs[n] = await loadJSON(BASE + file); } });
  const fonts = ['400 20px "Lilita One"', '400 16px Inter', '600 16px Inter', '700 16px Inter', '800 16px Inter', '900 16px Inter'];
  if (document.fonts) jobs.push({ w: 60000, run: () => Promise.all(fonts.map(f => document.fonts.load(f))).catch(() => {}) });

  const total = jobs.reduce((s, j) => s + j.w, 0);
  let done = 0;
  onProgress(0);
  await Promise.all(jobs.map(j => j.run().then(() => { done += j.w; onProgress(done / total); })));

  const cut: Record<string, HTMLCanvasElement> = {};
  const img = (rel: string): Drawable => {
    if (images[rel]) return images[rel];
    const f = man.frames[rel];
    if (!f) throw new Error('image absente du manifest : ' + rel);
    // one canvas per sprite, shared by every reference to it
    return cut[rel] || (cut[rel] = cutFrame(pages[f[0]], f[1], f[2], f[3], f[4]));
  };
  const assets: Record<string, any> = {};
  for (const k of man.order) {
    if (k === 'rigs') {
      assets.rigs = {};
      for (const n of man.rigOrder) assets.rigs[n] = resolve(rigs[n], img);
    } else assets[k] = resolve(man.data[k], img);
  }
  return { assets, ui: { bg: img('ui/bg.webp') } };
}
