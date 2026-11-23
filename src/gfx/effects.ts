// Filtres plein écran appliqués au calque « monde » (jamais à l'interface).
//
//   ivresse   à partir de la 10e bière (drunk() > 0) : couleurs plus chaudes et saturées qui dérivent,
//             double vision (un fantôme de l'image qui flotte), le tout proportionnel à drunk().
//   glow      bloom sur les zones claires (néons, lampadaires, phares) : la nuit (night) et dans les
//             niveaux qui le demandent (champ fx.bloom du registre : club, casino, limo).
//   qualité   si les frames dépassent ~24 ms en moyenne, le glow se coupe (mobiles modestes).
//
// Tous les réglages sont dans TUNING, pour les ajuster à l'œil.
import { ColorMatrixFilter, Container, Sprite, type Filter } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';

/** What the game tells the renderer each frame. */
export interface FrameInfo {
  t: number;              // game clock (s)
  dt: number;             // frame time (s)
  scale: number;          // game px -> canvas px
  level: string | number;
  state: string;
  drunk: number;          // 0..1 (drunk())
  night: number;          // 0..1, how dark the scene is
  fxLevel: LevelFx | null; // the level's `fx` settings from the registry
}

/** Per-level settings (field `fx` of defineLevel). */
export interface LevelFx {
  bloom?: number;         // glow strength 0..1, on top of the night's
}

export const TUNING = {
  drunk: { saturation: 0.35, hueSwing: 9, warm: 0.06, ghostAlpha: 0.3, ghostX: 9, ghostY: 3.5 },
  bloom: { threshold: 0.74, scale: 0.42, blur: 6, quality: 5, resolution: 0.5, minNight: 0.35 },
  autoQuality: { maxFrameMs: 24, window: 2 },
};

export class Effects {
  readonly worldLayer = new Container();
  private ghost = new Sprite();
  private color = new ColorMatrixFilter();
  private bloom = new AdvancedBloomFilter({
    threshold: TUNING.bloom.threshold, bloomScale: 0, brightness: 1,
    blur: TUNING.bloom.blur, quality: TUNING.bloom.quality,
  });
  private active: Filter[] = [];
  private slowT = 0;
  private sampleT = 0;
  private frames = 0;
  bloomAllowed = true;

  constructor(private world: Sprite) {
    this.bloom.resolution = TUNING.bloom.resolution;
    this.ghost.visible = false;
    this.worldLayer.addChild(world, this.ghost);
  }

  private watchSpeed(dt: number) {
    // average frame time over a few seconds; a sustained slow average turns the glow off for good
    this.sampleT += dt; this.frames++;
    if (this.sampleT < TUNING.autoQuality.window) return;
    const ms = this.sampleT / this.frames * 1000;
    this.sampleT = 0; this.frames = 0;
    if (ms > TUNING.autoQuality.maxFrameMs) { if (++this.slowT >= 2) this.bloomAllowed = false; }
    else this.slowT = 0;
  }

  update(f: FrameInfo, w: number, _h: number) {
    if (this.active.includes(this.bloom)) this.watchSpeed(f.dt);
    const s = w / 960, D = TUNING.drunk, d = f.drunk;
    const want: Filter[] = [];

    // drunk: warm, saturated colours drifting through the hue wheel + a floating ghost image
    if (d > 0.01) {
      const c = this.color;
      c.reset();
      c.saturate(D.saturation * d, true);
      c.hue(Math.sin(f.t * 0.7) * D.hueSwing * d, true);
      c.matrix[4] += D.warm * d;   // a touch more red
      want.push(c);
      this.ghost.texture = this.world.texture;
      this.ghost.visible = true;
      this.ghost.alpha = D.ghostAlpha * d;
      this.ghost.x = Math.sin(f.t * 1.3) * D.ghostX * d * s;
      this.ghost.y = Math.cos(f.t * 0.9) * D.ghostY * d * s;
    } else this.ghost.visible = false;

    // glow: neons, lamps and headlights bloom at night and in the bars
    const B = TUNING.bloom;
    const glow = Math.max(f.night >= B.minNight ? f.night : 0, f.fxLevel?.bloom ?? 0);
    if (glow > 0.01 && this.bloomAllowed) {
      this.bloom.bloomScale = B.scale * glow;
      want.push(this.bloom);
    }

    if (want.length !== this.active.length || want.some((x, i) => x !== this.active[i])) {
      this.active = want;
      this.worldLayer.filters = want.length ? want : null;
    }
  }
}
