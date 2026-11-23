// Particules GPU, dessinées entre le monde et l'interface (étape 2c).
import { Container } from 'pixi.js';
import type { FrameInfo } from './effects';

export class Particles {
  readonly layer = new Container();
  update(_f: FrameInfo) { /* étape 2c */ }
}
