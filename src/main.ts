// Entry point: loading screen -> preload every asset -> boot the game.
import './style.css';
import { loadAll } from './boot/loader';
import { boot } from 'virtual:game';

const ov = document.getElementById('loadOv')!;
const fill = document.getElementById('loadFill')!;
const pct = document.getElementById('loadPct')!;

function progress(p: number) {
  const n = Math.round(p * 100);
  fill.style.width = n + '%';
  pct.textContent = n + ' %';
  ov.setAttribute('aria-valuenow', String(n));
}

loadAll(progress)
  .then(({ assets, ui }) => {
    boot(assets, ui);
    ov.classList.add('done');
    setTimeout(() => ov.remove(), 400);
  })
  .catch(err => {
    console.error(err);
    ov.classList.add('err');
    pct.textContent = 'Oups, le chargement a planté. Recharge la page.';
  });
