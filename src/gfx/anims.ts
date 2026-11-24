// Animations en séquence d'images (exports After Effects, etc.), jouées par Pixi au-dessus du monde.
// Source : assets/anim/<nom>/*.png (+ anim.json facultatif), empaquetées dans les atlas par tools/assets.mjs.
//   FX.anim('neon', 480, 300, {loop: true, scale: 0.5})  ->  {stop()}
import { AnimatedSprite, Container, Rectangle, Texture, type TextureSource } from 'pixi.js';
import type { FrameInfo } from './effects';

export interface AnimDef { fps: number; loop: boolean; anchor: [number, number]; scale: number; frames: string[] }
export interface AtlasData {
  pages: HTMLImageElement[];
  frames: Record<string, number[]>;
  anims: Record<string, AnimDef>;
}
export interface AnimOpts { loop?: boolean; scale?: number; speed?: number; flipX?: boolean; alpha?: number }

export class Anims {
  readonly layer = new Container();
  private sources: TextureSource[] = [];
  private cache: Record<string, Texture[]> = {};
  private atlas: AtlasData | null = null;
  private playing = new Set<AnimatedSprite>();

  setAtlas(a: AtlasData) {
    this.atlas = a;
    this.sources = a.pages.map(p => Texture.from(p).source);
  }

  get names() { return Object.keys(this.atlas?.anims ?? {}); }

  private textures(name: string): { def: AnimDef; tex: Texture[] } {
    const def = this.atlas?.anims[name];
    if (!def) throw new Error('animation inconnue : ' + name + ' (dossier assets/anim/' + name + '/ ?)');
    const tex = this.cache[name] || (this.cache[name] = def.frames.map(k => {
      const [pg, x, y, w, h, ox = 0, oy = 0, fw = w, fh = h] = this.atlas!.frames[k];
      return new Texture({ source: this.sources[pg], frame: new Rectangle(x, y, w, h), orig: new Rectangle(0, 0, fw, fh), trim: new Rectangle(ox, oy, w, h) });
    }));
    return { def, tex };
  }

  play(name: string, x: number, y: number, o: AnimOpts = {}) {
    const { def, tex } = this.textures(name);
    const s = new AnimatedSprite({ textures: tex, autoUpdate: false });
    s.anchor.set(def.anchor[0], def.anchor[1]);
    const k = (o.scale ?? 1) * def.scale;
    s.scale.set(o.flipX ? -k : k, k);
    s.position.set(x, y);
    s.alpha = o.alpha ?? 1;
    s.loop = o.loop ?? def.loop;
    s.animationSpeed = def.fps / 60 * (o.speed ?? 1);
    s.onComplete = () => this.remove(s);
    s.play();
    this.layer.addChild(s);
    this.playing.add(s);
    return { stop: () => this.remove(s), sprite: s };
  }

  private remove(s: AnimatedSprite) {
    if (!this.playing.delete(s)) return;
    this.layer.removeChild(s);
    s.destroy();
  }

  clear() { for (const s of [...this.playing]) this.remove(s); }

  update(f: FrameInfo) {
    if (f.state !== 'play' && f.state !== 'title' && f.state !== 'over') return;
    // AnimatedSprite counts in 60 fps ticks
    for (const s of [...this.playing]) s.update({ deltaTime: f.dt * 60 } as never);
  }
}
