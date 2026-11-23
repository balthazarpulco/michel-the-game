// Transition entre niveaux : l'écran part couvert d'une trame de points prune (le style htFill du jeu)
// et les points rétrécissent en diagonale pour révéler le nouveau niveau. ~0,6 s, par-dessus tout.
import { Graphics } from 'pixi.js';

const CELL = 30;          // dot spacing, game px
const DUR = 0.62;         // seconds
const SPREAD = 0.45;      // part of DUR used by the diagonal delay
const COLOR = 0x2a1240, EDGE = 0xff3d9a;

export class DotWipe {
  readonly g = new Graphics();
  private t = -1;

  start() { this.t = 0; this.g.visible = true; }

  update(dt: number, scale: number) {
    if (this.t < 0) return;
    this.t += dt;
    const g = this.g, k = this.t / DUR;
    if (k >= 1) { this.t = -1; g.clear(); g.visible = false; return; }
    g.clear();
    const cols = Math.ceil(960 / CELL) + 1, rows = Math.ceil(540 / CELL) + 1, R = CELL * 0.75;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      // diagonal sweep from the bottom-left corner
      const d = (i / cols + (rows - j) / rows) / 2;
      const local = Math.min(1, Math.max(0, (k - d * SPREAD) / (1 - SPREAD)));
      const e = 1 - local * local * (3 - 2 * local);       // smoothstep: 1 -> 0
      if (e <= 0.01) continue;
      const x = i * CELL * scale, y = j * CELL * scale, r = R * e * scale;
      g.circle(x, y, r).fill(e > 0.5 ? COLOR : EDGE);
    }
  }
}
