// Dessin d'UI sur canvas : rectangles arrondis, trame en points (htFill), pastilles (pg).
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
// HUD panels: sharp parallelograms leaning like the buttons
let HT=null;
function htFill(stroke){if(!HT){const c=document.createElement('canvas');c.width=c.height=6;const g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.1)';g.beginPath();g.arc(3,3,1.1,0,7);g.fill();HT=ctx.createPattern(c,'repeat')}
  ctx.save();ctx.fillStyle=HT;ctx.fill();if(stroke!==false){ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=2;ctx.stroke()}ctx.restore()}
// UI panels: rounded pills (the new UI style)
function htFill2(){if(!HT){ctx.save();ctx.beginPath();htFill(false);ctx.restore()}ctx.save();ctx.fillStyle=HT;ctx.fillRect(0,0,W,H);ctx.restore()}
function pg(x,y,w,h){const r=Math.max(0,Math.min(h/2,18,w/2));ctx.beginPath();if(w<=0){ctx.rect(x,y,0,h);return}ctx.roundRect?ctx.roundRect(x,y,w,h,r):rr(x,y,w,h,r)}
