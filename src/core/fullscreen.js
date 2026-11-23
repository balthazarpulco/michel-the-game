// Plein écran.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- fullscreen ----------
const fullBtn=document.getElementById('full');
function syncFull(){const on=stage.classList.contains('is-full');fullBtn.innerHTML=on?'<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>':'<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';fullBtn.setAttribute('aria-label',on?'Quitter le plein écran':'Plein écran')}
function toggleFull(){
  const fsEl=document.fullscreenElement||document.webkitFullscreenElement;
  if(stage.classList.contains('is-full')){
    stage.classList.remove('is-full');
    if(fsEl){try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}}
  }else{
    stage.classList.add('is-full');
    const req=stage.requestFullscreen||stage.webkitRequestFullscreen;
    if(req){try{const p=req.call(stage);if(p&&p.catch)p.catch(()=>{})}catch(e){}}
  }
  syncFull();fullBtn.blur();
}
fullBtn.onclick=toggleFull;
['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>{
  if(!(document.fullscreenElement||document.webkitFullscreenElement)&&stage.classList.contains('is-full')&&fullWasNative){stage.classList.remove('is-full');syncFull()}
  fullWasNative=!!(document.fullscreenElement||document.webkitFullscreenElement);
}));
let fullWasNative=false;
