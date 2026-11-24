#!/usr/bin/env node
// Icônes et image de partage, générées depuis le key art et le logo : public/meta/ (commité, à relancer si l'art change).
//   node tools/make-meta.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'public', 'meta');
const KEYART = path.join(ROOT, 'assets', 'ui', 'keyart.webp');
const LOGO = path.join(ROOT, 'assets', 'ui', 'logobase.webp');
fs.mkdirSync(OUT, { recursive: true });

// Michel's face on the key art (1600 × 893)
const FACE = { left: 975, top: 80, width: 440, height: 440 };
for (const s of [32, 180, 192, 512]) {
  let img = sharp(KEYART).extract(FACE).resize(s, s);
  if (s === 192 || s === 512) {
    // maskable icons: rounded square with a little margin (Android crops them)
    const r = Math.round(s * 0.22);
    const mask = Buffer.from(`<svg width="${s}" height="${s}"><rect width="${s}" height="${s}" rx="${r}" fill="#fff"/></svg>`);
    img = sharp(await img.png().toBuffer()).composite([{ input: mask, blend: 'dest-in' }]);
  }
  await img.png().toFile(path.join(OUT, `icon-${s}.png`));
}
// share image 1200 × 630: the key art with the title logo, like the title screen
const logo = await sharp(LOGO).resize(560).toBuffer();
await sharp(KEYART).resize(1200, 630, { fit: 'cover', position: 'centre' })
  .composite([{ input: logo, left: 320, top: 150 }])
  .jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUT, 'og.jpg'));
console.log('public/meta: icônes 32/180/192/512 + og.jpg');
