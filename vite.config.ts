import { defineConfig } from 'vite';
import path from 'node:path';
import legacyGame from './tools/vite-legacy-game';

export default defineConfig({
  base: './',                      // relative URLs: works at the root of a site, in a sub-folder, or on itch.io
  plugins: [legacyGame(path.resolve(__dirname, 'src'))],
  build: { sourcemap: true, assetsInlineLimit: 0, chunkSizeWarningLimit: 1500 },
  server: { port: 5173 },
  preview: { port: 4173 },
});
