// Rendu PixiJS (WebGL). Le jeu dessine toujours en Canvas 2D, dans deux calques :
//   - le monde (canvas #c)      -> sprite « world », qui reçoit les filtres (ivresse, glow…)
//   - l'interface (HUD, téléphone, toasts) -> sprite « hud », jamais filtré
// Entre les deux, les particules GPU (src/gfx/particles.ts).
// Pixi affiche le tout dans son propre canvas, posé exactement sur #c. #c reste dans la page (invisible) :
// il garde la mise en page, le plein écran et les clics.
//
// Choix du rendu : ?renderer=canvas|pixi dans l'URL, ou localStorage 'michel-renderer'. Défaut : pixi.
// Si WebGL ne démarre pas, on retombe sur le Canvas 2D d'origine (le jeu est identique, sans les effets).
import { autoDetectRenderer, CanvasSource, Container, Sprite, Texture, type Renderer } from 'pixi.js';
import { Effects, type FrameInfo } from './effects';
import { Particles } from './particles';

export type { FrameInfo };

export type RendererKind = 'pixi' | 'canvas';

export function wantedRenderer(): RendererKind {
  const q = new URLSearchParams(location.search).get('renderer');
  if (q === 'canvas' || q === 'pixi') return q;
  try {
    const s = localStorage.getItem('michel-renderer');
    if (s === 'canvas' || s === 'pixi') return s;
  } catch { /* stockage bloqué */ }
  return 'pixi';
}

export function setWantedRenderer(k: RendererKind) {
  try { localStorage.setItem('michel-renderer', k); } catch { /* stockage bloqué */ }
}

/** One 2D canvas shown as a Pixi sprite, re-uploaded every frame. */
class CanvasLayer {
  sprite = new Sprite();
  private w = 0;
  private h = 0;
  constructor(readonly canvas: HTMLCanvasElement) {}
  /** Uploads the canvas; recreates the texture when the canvas changed size. */
  sync() {
    const c = this.canvas;
    if (c.width !== this.w || c.height !== this.h || this.sprite.texture === Texture.EMPTY) {
      const old = this.sprite.texture;
      this.w = c.width; this.h = c.height;
      this.sprite.texture = new Texture({ source: new CanvasSource({ resource: c }) });
      if (old !== Texture.EMPTY) old.destroy(true);
    } else this.sprite.texture.source.update();
  }
}

export class Gfx {
  readonly kind = 'pixi' as const;
  readonly view: HTMLCanvasElement;
  readonly hudCanvas = document.createElement('canvas');
  readonly fx: Particles;
  private world: CanvasLayer;
  private hud: CanvasLayer;
  private effects: Effects;
  private root = new Container();

  private constructor(private renderer: Renderer, private cv: HTMLCanvasElement) {
    this.view = renderer.canvas as HTMLCanvasElement;
    this.world = new CanvasLayer(cv);
    this.hud = new CanvasLayer(this.hudCanvas);
    this.effects = new Effects(this.world.sprite);
    this.fx = new Particles();
    this.root.addChild(this.effects.worldLayer, this.fx.layer, this.hud.sprite);
  }

  static async create(cv: HTMLCanvasElement): Promise<Gfx | null> {
    try {
      const view = document.createElement('canvas');
      const renderer = await autoDetectRenderer({
        preference: 'webgl', canvas: view, width: cv.width || 960, height: cv.height || 540,
        antialias: false, backgroundColor: 0x000000, resolution: 1, autoDensity: false,
        powerPreference: 'high-performance',
      });
      const g = new Gfx(renderer, cv);
      g.mount();
      return g;
    } catch (e) {
      console.warn('PixiJS indisponible, rendu Canvas 2D', e);
      return null;
    }
  }

  /** Puts the WebGL canvas right over #c; #c stays (invisible) for layout, full screen and pointer events. */
  private mount() {
    const v = this.view, cv = this.cv;
    v.id = 'gl';
    v.setAttribute('aria-hidden', 'true');
    cv.parentElement!.insertBefore(v, cv);
    cv.classList.add('under-gl');
    const place = () => {
      v.style.left = cv.offsetLeft + 'px'; v.style.top = cv.offsetTop + 'px';
      v.style.width = cv.offsetWidth + 'px'; v.style.height = cv.offsetHeight + 'px';
    };
    new ResizeObserver(place).observe(cv);
    addEventListener('resize', place);
    document.addEventListener('fullscreenchange', () => requestAnimationFrame(place));
    place();
  }

  /** Called by the game after #c changed its backing size. */
  resize(w: number, h: number) {
    this.hudCanvas.width = w; this.hudCanvas.height = h;
    if (this.renderer.width !== w || this.renderer.height !== h) this.renderer.resize(w, h);
  }

  /** Called once per frame, after the game drew both 2D layers. */
  present(f: FrameInfo) {
    const w = this.cv.width, h = this.cv.height;
    if (this.renderer.width !== w || this.renderer.height !== h) this.resize(w, h);
    this.world.sync();
    this.hud.sync();
    this.effects.update(f, w, h);
    this.fx.update(f);
    this.renderer.render(this.root);
  }
}
