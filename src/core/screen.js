// Mise à l'échelle du canvas (resize).
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

let scale=1;
// adaptive resolution: the widest backing size allowed drops a step when frames are slow, and comes back when they're fast
const RES_STEPS=[1920,1600,1280,1024,860];let resStep=0,resSlowT=0,resFastT=0,resEma=1/60;
function resTick(dt){
  if(state!=='play'||document.hidden)return;
  resEma+=(Math.min(dt,.1)-resEma)*.05;
  if(resEma>.024){resSlowT+=dt;resFastT=0}else if(resEma<.0135){resFastT+=dt;resSlowT=0}else{resSlowT=resFastT=0}
  if(resSlowT>1.5&&resStep<RES_STEPS.length-1){resStep++;resSlowT=0;resize()}
  else if(resFastT>8&&resStep>0){resStep--;resFastT=0;resize()}
}
function resize(){
  // perf: never render more than ~1920px wide (less if the device is slow), whatever the screen density
  const r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2,RES_STEPS[resStep]/Math.max(1,r.width));
  cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);
  scale=cv.width/W;
  if(GFX)GFX.resize(cv.width,cv.height);
}
new ResizeObserver(resize).observe(cv);resize();
