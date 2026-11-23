// Filtres plein écran appliqués au calque « monde ».
import { Container, type Sprite } from 'pixi.js';

/** What the game tells the renderer each frame. */
export interface FrameInfo {
  t: number;              // game clock (s)
  dt: number;             // frame time (s)
  scale: number;          // game px -> canvas px
  level: string | number;
  state: string;
  drunk: number;          // 0..1 (drunk())
  night: number;          // 0..1, how dark the scene is
  fxLevel: Record<string, unknown> | null;  // the level's `fx` settings from the registry
}

export class Effects {
  readonly worldLayer = new Container();
  constructor(private world: Sprite) {
    this.worldLayer.addChild(world);
  }
  update(_f: FrameInfo, _w: number, _h: number) { /* étape 2b */ }
}
