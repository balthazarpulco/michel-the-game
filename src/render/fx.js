// Grain de film et vignette.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// film grain: a few pre-baked noise tiles, shuffled every frame
const GRAIN=[0,1,2].map(()=>{const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d'),im=g.createImageData(160,160);
  for(let i=0;i<im.data.length;i+=4){const v=Math.random()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=Math.random()*70}
  g.putImageData(im,0,0);return c});
let grainPat=null;
const GRAIN_PAT=[];let VIG=null;
function drawNoise(){
  ctx.setTransform(scale,0,0,scale,0,0);
  const gi=Math.floor(Math.random()*3);const pat=GRAIN_PAT[gi]||(GRAIN_PAT[gi]=ctx.createPattern(GRAIN[gi],'repeat'));
  ctx.save();ctx.globalCompositeOperation='overlay';ctx.globalAlpha=.55;
  ctx.translate(-rnd(0,160),-rnd(0,160));ctx.fillStyle=pat;ctx.fillRect(0,0,W+160,H+160);ctx.restore();
  // soft vignette
  const v=VIG||(VIG=(()=>{const v=ctx.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*.95);v.addColorStop(0,'rgba(20,12,10,0)');v.addColorStop(1,'rgba(20,12,10,.32)');return v})());
  ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
}
