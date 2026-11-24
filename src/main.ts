// Entry point: loading screen -> preload every asset -> boot the game.
import './style.css';
import { loadAll } from './boot/loader';
import { boot } from 'virtual:game';
import { Gfx, wantedRenderer } from './gfx/pixi';
import { supabaseBoard } from './net/supabase-board';

const ov = document.getElementById('loadOv')!;
const fill = document.getElementById('loadFill')!;
const pct = document.getElementById('loadPct')!;

function progress(p: number) {
  const n = Math.round(p * 100);
  fill.style.width = n + '%';
  pct.textContent = n + ' %';
  ov.setAttribute('aria-valuenow', String(n));
}

const cv = document.getElementById('c') as HTMLCanvasElement;
// the WebGL renderer starts while the assets load
const gfxReady = wantedRenderer() === 'pixi' ? Gfx.create(cv) : Promise.resolve(null);

Promise.all([loadAll(progress), gfxReady])
  .then(([{ assets, ui, atlas }, gfx]) => {
    gfx?.fx.anims.setAtlas(atlas);
    document.documentElement.dataset.renderer = gfx ? 'pixi' : 'canvas';
    boot(assets, { ...ui, board: supabaseBoard() }, gfx);
    ov.classList.add('done');
    setTimeout(() => ov.remove(), 400);
  })
  .catch(err => {
    console.error(err);
    ov.classList.add('err');
    pct.textContent = 'Oups, le chargement a planté. Recharge la page.';
  });
