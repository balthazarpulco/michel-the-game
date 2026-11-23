// Mise à l'échelle du canvas (resize).
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

let scale=1;
function resize(){
  // perf: never render more than ~1920px wide, whatever the screen density
  const r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2,1920/Math.max(1,r.width));
  cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);
  scale=cv.width/W;
  if(GFX)GFX.resize(cv.width,cv.height);
}
new ResizeObserver(resize).observe(cv);resize();
