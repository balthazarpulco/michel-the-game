// Constantes du monde : taille du canvas, sol, physique de Michel, contexte 2D.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

const W=960,H=540,GROUND=452,FG=1.5,BGP=0.25;
const G=2300,JUMP=880,SPEED=290,SPRINT=420;
const INK='#2a1a16';
const cv=document.getElementById('c');
// Two 2D layers: the world (#c) and the interface (HUD, phone, toasts). With PixiJS (GFX) the interface has its own
// canvas so the world's filters never touch it; with the plain Canvas 2D renderer both are the same canvas.
// `ctx` is whichever layer is being drawn: useMain() / useHud() switch it.
let ctx=cv.getContext('2d');
const mainCtx=ctx,hudCtx=GFX?GFX.hudCanvas.getContext('2d'):mainCtx;
function useMain(){ctx=mainCtx}
function useHud(){if(ctx!==hudCtx){ctx=hudCtx;ctx.setTransform(scale,0,0,scale,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}}
const stage=document.getElementById('stage');
