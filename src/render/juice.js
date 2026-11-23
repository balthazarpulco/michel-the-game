// « Juice » : particules GPU et vibration de manette sur les moments forts (impacts, K.O., atterrissages,
// victoires). Tout passe par FX (no-op en Canvas 2D) ; les coordonnées sont celles de l'écran (960 × 540).
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// gamepad rumble: strong = big motor, weak = small motor (0..1)
function rumble(strong,weak,ms){
  try{for(const g of navigator.getGamepads?navigator.getGamepads():[]){const a=g&&g.vibrationActuator;if(a&&a.playEffect)a.playEffect('dual-rumble',{duration:ms,strongMagnitude:strong,weakMagnitude:weak}).catch(()=>{})}}catch(e){}
}
// a hit that lands: white flash + sparks in the given colours
function juiceHit(x,y,cols,big){
  FX.burst('flash',x,y,{size:big?[40,40]:[24,24]});
  FX.burst('spark',x,y,{n:big?26:14,colors:cols});
}
// big win (blackjack, jackpot, perfect streak): confetti rain from the top + a flash
function juiceWin(x,y){
  FX.burst('flash',x,y,{size:[60,60],grow:7});
  FX.burst('confetti',x,y,{n:60});
  rumble(.4,.7,220);
}
// Michel lands: a dust puff at his feet, bigger for a bigger fall
function juiceLand(p,fall){
  if(fall<60)return;
  const k=Math.min(1,fall/260),x=p.x+p.w/2-camX,y=p.y+p.h;
  FX.burst('dust',x,y,{n:Math.round(4+10*k),spread:10,speed:[30,80+90*k]});
  if(k>.5)rumble(.25*k,.1,90);
}
// how many particles to emit this frame for a steady rate (per second)
function fxRate(rate,dt){const n=rate*dt;return Math.floor(n)+(Math.random()<n%1?1:0)}
// light drizzle over the whole screen (falls slightly to the left, like the wind on Saint-Laurent)
function fxDrizzle(dt,rate){for(let i=fxRate(rate,dt);i>0;i--)FX.emit('drop',rnd(-40,W+140),rnd(-40,H*.6))}
// dust motes floating in the light
function fxMotes(dt,rate,x0,x1,y0,y1,cols){for(let i=fxRate(rate,dt);i>0;i--)FX.emit('mote',rnd(x0,x1),rnd(y0,y1),cols?{colors:cols}:{})}
