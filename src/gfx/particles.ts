// Particules GPU, dessinées entre le monde et l'interface, en coordonnées de jeu (960 × 540, écran).
// Le jeu y accède par l'objet FX (core/constants.js) ; en rendu Canvas 2D, FX ne fait rien.
//
//   FX.burst('spark', x, y, {n: 20})       une gerbe ponctuelle
//   FX.emit('smoke', x, y, {vx: 10})       une seule particule
//   FX.clear()                             vide tout (changement de niveau)
//   FX.anim('nom', x, y, {loop, scale})    joue une séquence d'images de assets/anim/<nom>/ (src/gfx/anims.ts)
//
// Presets : spark (étincelles additives), ember (braise qui monte), smoke (volute douce), dust (poussière),
// confetti (carrés colorés qui tournent), drop (goutte de pluie), flash (éclair rond qui s'ouvre), mote (poussière
// de lumière qui flotte). Les options écrasent les valeurs du preset.
import { Container, Sprite, Texture, type BLEND_MODES } from 'pixi.js';
import type { FrameInfo } from './effects';
import { Anims, type AnimOpts } from './anims';

type Shape = 'dot' | 'soft' | 'streak' | 'square';

export interface ParticleOpts {
  n?: number;                    // how many (burst)
  spread?: number;               // random offset around x,y (px)
  vx?: number; vy?: number;      // base speed (px/s)
  speed?: [number, number];      // random speed in a random direction
  angle?: [number, number];      // direction range (rad) for `speed`; default all around
  gravity?: number;              // px/s²
  drag?: number;                 // 0..1 speed kept per second
  life?: [number, number];       // seconds
  size?: [number, number];       // start size (px)
  grow?: number;                 // end size / start size
  alpha?: number;
  fadeIn?: number;               // seconds
  spin?: [number, number];       // rad/s
  colors?: number[];
  blend?: BLEND_MODES;
  shape?: Shape;
  stretch?: boolean;             // align with the speed (rain, sparks)
}

const PRESETS: Record<string, ParticleOpts> = {
  spark:    { n: 18, speed: [120, 420], gravity: 600, drag: 0.2, life: [0.25, 0.6], size: [5, 9], grow: 0.2, colors: [0xffd23f, 0xffb02e, 0xfff2b0], blend: 'add', shape: 'streak', stretch: true },
  ember:    { n: 6, vy: -50, speed: [5, 30], gravity: -20, drag: 0.6, life: [0.8, 1.8], size: [2, 4], grow: 0.3, colors: [0xff7a1a, 0xffb347], blend: 'add', shape: 'dot' },
  smoke:    { n: 1, vy: -18, speed: [2, 10], gravity: -6, drag: 0.5, life: [1.6, 2.8], size: [14, 24], grow: 3.2, alpha: 0.32, fadeIn: 0.25, spin: [-0.4, 0.4], colors: [0xd9d2e6, 0xbfb6cf], shape: 'soft' },
  dust:     { n: 8, speed: [20, 90], angle: [Math.PI * 1.05, Math.PI * 1.95], gravity: 120, drag: 0.3, life: [0.35, 0.7], size: [4, 9], grow: 1.8, alpha: 0.45, colors: [0xcbb89a, 0xa89878], shape: 'soft' },
  confetti: { n: 40, speed: [160, 420], angle: [Math.PI * 1.15, Math.PI * 1.85], gravity: 420, drag: 0.55, life: [1.2, 2.2], size: [5, 9], grow: 1, spin: [-9, 9], colors: [0xff3d9a, 0xffd23f, 0x8b4fe0, 0x3fd2ff, 0x7dff7a], shape: 'square' },
  drop:     { n: 1, vx: -60, vy: 900, life: [0.5, 0.7], size: [1.6, 2.4], grow: 1, alpha: 0.42, colors: [0xbfd4ff], shape: 'streak', stretch: true },
  flash:    { n: 1, life: [0.22, 0.22], size: [30, 30], grow: 5, alpha: 0.8, colors: [0xfff2c4], blend: 'add', shape: 'soft' },
  mote:     { n: 1, speed: [4, 16], gravity: -4, drag: 0.8, life: [2.5, 4.5], size: [2, 4], grow: 1, alpha: 0.6, fadeIn: 0.8, colors: [0xffffff, 0xffd6f0, 0xd6e6ff], blend: 'add', shape: 'dot' },
};

interface P {
  s: Sprite; vx: number; vy: number; g: number; drag: number;
  life: number; max: number; size: number; grow: number; alpha: number; fadeIn: number; spin: number; stretch: boolean;
}

const rnd = (r: [number, number] | undefined, d: number) => r ? r[0] + Math.random() * (r[1] - r[0]) : d;

function makeTexture(shape: Shape): Texture {
  const N = 64, c = document.createElement('canvas');
  c.width = N; c.height = shape === 'streak' ? N / 4 : N;
  const g = c.getContext('2d')!;
  if (shape === 'square') { g.fillStyle = '#fff'; g.fillRect(0, 0, N, N); }
  else if (shape === 'streak') {
    const gr = g.createLinearGradient(0, 0, N, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.7, 'rgba(255,255,255,.9)'); gr.addColorStop(1, '#fff');
    g.fillStyle = gr; g.beginPath(); g.ellipse(N / 2, N / 8, N / 2, N / 8, 0, 0, Math.PI * 2); g.fill();
  } else {
    const gr = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
    if (shape === 'dot') { gr.addColorStop(0, '#fff'); gr.addColorStop(0.45, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); }
    else { gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); }
    g.fillStyle = gr; g.fillRect(0, 0, N, N);
  }
  return Texture.from(c);
}

export class Particles {
  readonly layer = new Container();
  /** image-sequence animations (src/gfx/anims.ts), under the particles */
  readonly anims = new Anims();
  private parts = new Container();
  constructor() { this.layer.addChild(this.anims.layer, this.parts); }

  anim(name: string, x: number, y: number, o?: AnimOpts) { return this.anims.play(name, x, y, o); }
  private live: P[] = [];
  private pool: Sprite[] = [];
  private tex = {} as Record<Shape, Texture>;
  static MAX = 1500;

  private texture(shape: Shape) { return this.tex[shape] || (this.tex[shape] = makeTexture(shape)); }

  emit(preset: string, x: number, y: number, o: ParticleOpts = {}) { this.burst(preset, x, y, { ...o, n: 1 }); }

  burst(preset: string, x: number, y: number, o: ParticleOpts = {}) {
    const P0 = PRESETS[preset];
    if (!P0) throw new Error('preset de particules inconnu : ' + preset);
    const q: ParticleOpts = { ...P0, ...o };
    const n = q.n ?? 1, tex = this.texture(q.shape ?? 'dot');
    for (let i = 0; i < n && this.live.length < Particles.MAX; i++) {
      const s = this.pool.pop() || new Sprite();
      s.texture = tex; s.anchor.set(q.shape === 'streak' ? 1 : 0.5, 0.5);
      s.tint = q.colors ? q.colors[(Math.random() * q.colors.length) | 0] : 0xffffff;
      s.blendMode = q.blend ?? 'normal';
      const sp = q.spread ?? 0;
      s.x = x + (Math.random() - 0.5) * sp * 2; s.y = y + (Math.random() - 0.5) * sp * 2;
      s.rotation = Math.random() * Math.PI * 2;
      const a = rnd(q.angle, Math.random() * Math.PI * 2), v = rnd(q.speed, 0);
      const life = rnd(q.life, 1);
      this.live.push({
        s, vx: (q.vx ?? 0) + Math.cos(a) * v, vy: (q.vy ?? 0) + Math.sin(a) * v, g: q.gravity ?? 0, drag: q.drag ?? 1,
        life, max: life, size: rnd(q.size, 4), grow: q.grow ?? 1, alpha: q.alpha ?? 1, fadeIn: q.fadeIn ?? 0,
        spin: rnd(q.spin, 0), stretch: !!q.stretch,
      });
      this.parts.addChild(s);
    }
  }

  clear() {
    this.anims.clear();
    for (const p of this.live) { this.parts.removeChild(p.s); this.pool.push(p.s); }
    this.live.length = 0;
  }

  get count() { return this.live.length; }

  update(f: FrameInfo) {
    this.layer.scale.set(f.scale);
    // particles freeze with the game (pause, phone, dev menu…)
    if (f.state !== 'play' && f.state !== 'title' && f.state !== 'over') return;
    this.anims.update(f);
    const dt = f.dt;
    for (let i = this.live.length - 1; i >= 0; i--) {
      const p = this.live[i], s = p.s;
      p.life -= dt;
      if (p.life <= 0) { this.parts.removeChild(s); this.pool.push(s); this.live[i] = this.live[this.live.length - 1]; this.live.pop(); continue; }
      const k = Math.pow(p.drag, dt);
      p.vx *= k; p.vy = p.vy * k + p.g * dt;
      s.x += p.vx * dt; s.y += p.vy * dt;
      const age = 1 - p.life / p.max, sz = p.size * (1 + (p.grow - 1) * age);
      const tw = s.texture.width;
      if (p.stretch) {
        s.rotation = Math.atan2(p.vy, p.vx);
        const len = Math.max(sz * 2, Math.hypot(p.vx, p.vy) * 0.035);
        s.scale.set(len / tw, (sz * 1.2) / s.texture.height);
      } else { s.rotation += p.spin * dt; s.scale.set(sz / tw); }
      const fin = p.fadeIn > 0 ? Math.min(1, (p.max - p.life) / p.fadeIn) : 1;
      s.alpha = p.alpha * fin * Math.min(1, p.life / (p.max * 0.35));
    }
  }
}
