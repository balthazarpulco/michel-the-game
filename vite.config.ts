import { defineConfig } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import legacyGame from './tools/vite-legacy-game';

// name of the hashed asset manifest written by tools/assets.mjs (npm run assets)
const manifestFile = path.resolve(__dirname, 'public/gen/.manifest-name');
const MANIFEST = fs.existsSync(manifestFile) ? fs.readFileSync(manifestFile, 'utf8').trim() : 'manifest.json';

export default defineConfig({
  base: './',                      // relative URLs: works at the root of a site, in a sub-folder, or on itch.io
  plugins: [legacyGame(path.resolve(__dirname, 'src')), {
    // share image: absolute URL when the site's address is known (VITE_SITE_URL), relative otherwise
    name: 'og-image',
    transformIndexHtml(html) {
      const site = (process.env.VITE_SITE_URL || '').replace(/\/$/, '');
      return html.replace('%OG_IMAGE%', site ? site + '/meta/og.jpg' : './meta/og.jpg');
    },
  }],
  define: { __MANIFEST__: JSON.stringify(MANIFEST) },
  build: { sourcemap: true, assetsInlineLimit: 0, chunkSizeWarningLimit: 1500 },
  server: { port: 5173 },
  preview: { port: 4173 },
});
