// Clavier : touches, file de saut, chaîne keydown/keyup.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- input ----------
const keys={l:false,r:false,j:false,d:false,s:false,t:false};
let throwReq=false;
let jumpBuf=0;
const map={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',Space:'j',ArrowUp:'j',KeyW:'j',ArrowDown:'d',KeyS:'d',ShiftLeft:'s',ShiftRight:'s',KeyE:'t'};
addEventListener('keydown',e=>{
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;
  if(e.code==='KeyF'&&!e.repeat){e.preventDefault();toggleFull();return}
  if(e.code==='KeyT'){e.preventDefault();toggleDev();return}
  if(!document.getElementById('title').hidden&&(e.code==='ArrowLeft'||e.code==='ArrowRight')){e.preventDefault();const ks=Object.keys(DIFFS),i=ks.indexOf(diff);setDiff(ks[clamp(i+(e.code==='ArrowLeft'?-1:1),0,ks.length-1)]);return}
  if(state==='video'||state==='outro')return; // only the PASSER button skips the videos
  if(state==='phone'){if(!['ShiftLeft','ShiftRight','KeyP'].includes(e.code)){e.preventDefault();if(!e.repeat)closePhone()}return}
  if(state==='dev'){if(e.code==='KeyR'){restartAll();return}const i='123456789'.indexOf(e.key);if(i>=0){devGo(DEV_LV[i])}return}
  if(level==='bike'&&state==='play'){
    const ak={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'j',KeyW:'j',ArrowDown:'d',KeyS:'d'}[e.code];
    if(ak&&!e.repeat&&skateKey(ak)){e.preventDefault();return}
    if(ak==='l'||ak==='r'){e.preventDefault();if(!e.repeat)bikeLane(ak==='l'?-1:1);return}
    if(e.code==='Space'||e.code==='KeyE'){e.preventDefault();if(!e.repeat)bikeHop();return}
  }
  if(level==='limo'&&state==='play'&&(e.code==='Space'||e.code==='Enter'||e.code==='KeyE')){e.preventDefault();if(!e.repeat)limoDrink();return}
  if(level==='bj'&&state==='play'&&BJ){
    if(e.code==='ArrowLeft'||e.code==='KeyA'){e.preventDefault();BJ.sel=0;return}
    if(e.code==='ArrowRight'||e.code==='KeyD'){e.preventDefault();BJ.sel=1;return}
    if(e.key==='1'||e.key==='2'){e.preventDefault();bjAct(+e.key-1);return}
    if(['Space','Enter','KeyE','ArrowUp'].includes(e.code)){e.preventDefault();if(!e.repeat)bjAct(BJ.sel);return}
  }
  if(level==='joint'&&state==='play'){
    if(e.code==='Space'||e.code==='KeyE'||e.code==='Enter'){e.preventDefault();if(!e.repeat)jointPuff();return}
  }
  if(level==='texto'&&state==='play'&&TX&&TX.phase==='answer'){
    const n='123'.indexOf(e.key);if(n>=0){e.preventDefault();answerTexto(n);return}
    if(e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();TX.sel=(TX.sel+2)%3;return}
    if(e.code==='ArrowDown'||e.code==='KeyS'){e.preventDefault();TX.sel=(TX.sel+1)%3;return}
    if(e.code==='Enter'||e.code==='Space'){e.preventDefault();answerTexto(TX.sel);return}
  }
  if(level==='dance'&&state==='play'){
    const dk={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'j',KeyW:'j',Space:'j',ArrowDown:'d',KeyS:'d'}[e.code];
    if(dk){e.preventDefault();if(!e.repeat)danceHit(dk);return}
    if(e.code==='KeyP'||e.code==='Escape')return;
  }
  if(e.code==='KeyP'||e.code==='Escape'){togglePause();return}
  if(state==='pause'&&e.code==='KeyR'){restartAll();return}
  const k=map[e.code];if(!k)return;
  if(state==='play')e.preventDefault();
  if(k==='j'&&!keys.j)jumpBuf=.13;
  if(k==='t'&&!keys.t)throwReq=true;
  keys[k]=true;
});
addEventListener('keyup',e=>{const k=map[e.code];if(k)keys[k]=false});
function holdOld(id,k){
  const b=document.getElementById(id);
  const on=e=>{e.preventDefault();
    if(state==='phone'){closePhone();return}
    if(level==='joint'&&state==='play'){jointPuff();return}
    if(level==='texto'&&state==='play'&&TX&&TX.phase==='answer'){if(k==='j')TX.sel=(TX.sel+2)%3;else if(k==='d')TX.sel=(TX.sel+1)%3;else if(k==='t')answerTexto(TX.sel);return}
    if(level==='bike'&&state==='play'){if(k!=='t'&&skateKey(k))return;if(k==='l')bikeLane(-1);else if(k==='r')bikeLane(1);else if(k==='t')bikeHop();if(k!=='j'&&k!=='d')return}if(level==='dance'&&state==='play'&&k!=='t'){danceHit(k);return}if(k==='j'&&!keys.j)jumpBuf=.13;if(k==='t')throwReq=true;keys[k]=true};
  const off=e=>{e.preventDefault();keys[k]=false};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);
}
