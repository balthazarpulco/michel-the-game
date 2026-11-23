// Vite plugin: the legacy game code (plain JS files that share one scope, like the old single <script>)
// is concatenated, in the order given by src/game-order.json, into one module:
//
//   import { boot } from 'virtual:game';   boot(ASSETS, UI);
//
// A source map keeps the original file names and lines in the browser's dev tools and in error stacks.
// In dev and in `--mode test`, a debug hook is added at the end of the scope:
//   window.__g.go(level)  jumps to a level      window.__g.ev(code)  evaluates code inside the game's scope
import fs from 'node:fs';
import path from 'node:path';
import MagicString, { Bundle } from 'magic-string';
import type { Plugin } from 'vite';

const ID = 'virtual:game';

export default function legacyGame(srcDir: string): Plugin {
  let hook = false;
  // a path-like id (not a '\0' virtual id): Rolldown drops the source map of '\0' modules
  const RID = path.join(srcDir, '__legacy_game__.js');
  const orderFile = path.join(srcDir, 'game-order.json');
  return {
    name: 'legacy-game',
    configResolved(c) { hook = c.command === 'serve' || c.mode === 'test'; },
    resolveId(id) { return id === ID ? RID : null; },
    load(id) {
      if (id !== RID) return null;
      this.addWatchFile(orderFile);
      const files: string[] = JSON.parse(fs.readFileSync(orderFile, 'utf8')).files;
      const b = new Bundle({ separator: '\n' });
      for (const rel of files) {
        const f = path.join(srcDir, rel);
        this.addWatchFile(f);
        b.addSource({ filename: f, content: new MagicString(fs.readFileSync(f, 'utf8')) });
      }
      b.prepend('export function boot(ASSETS, UI, GFX) {\n');
      b.append('\n' + (hook
        ? "window.__g={go:l=>{['title','card','over','dev','pauseOv'].forEach(i=>document.getElementById(i).hidden=true);devGo(String(l))},ev:c=>eval(c)};\n"
        : '') + '}\n');
      return { code: b.toString(), map: b.generateMap({ hires: true, includeContent: true }) };
    },
  };
}
