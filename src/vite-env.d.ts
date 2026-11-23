/// <reference types="vite/client" />
declare module 'virtual:game' {
  /** Starts the legacy game with the preloaded assets (see src/boot/loader.ts). */
  export function boot(assets: Record<string, any>, ui: { bg: CanvasImageSource }, gfx: import('./gfx/pixi').Gfx | null): void;
}
