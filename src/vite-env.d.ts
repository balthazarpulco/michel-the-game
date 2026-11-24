/// <reference types="vite/client" />
/** hashed asset manifest file name, set by vite.config.ts */
declare const __MANIFEST__: string;
declare module 'virtual:game' {
  /** Starts the legacy game with the preloaded assets (see src/boot/loader.ts). */
  export function boot(assets: Record<string, any>, ui: { bg: CanvasImageSource; music: Record<string, string>; board: import('./net/supabase-board').Board | null }, gfx: import('./gfx/pixi').Gfx | null): void;
}
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SITE_URL?: string;
}
