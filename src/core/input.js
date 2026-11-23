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
  if(state==='dev'){if(e.code==='KeyR'){restartAll();return}const i='123456789'.indexOf(e.key);if(i>=0){if(i<LEVEL_ORDER.length)devGo(String(LEVEL_ORDER[i]))}return}
  if(state==='play'){const D=LEVELS[level];if(D.keydown&&D.keydown(e))return}   // the level's own keys first
  if(e.code==='KeyP'||e.code==='Escape'){togglePause();return}
  if(state==='pause'&&e.code==='KeyR'){restartAll();return}
  const k=map[e.code];if(!k)return;
  if(state==='play')e.preventDefault();
  if(k==='j'&&!keys.j)jumpBuf=.13;
  if(k==='t'&&!keys.t)throwReq=true;
  keys[k]=true;
});
addEventListener('keyup',e=>{const k=map[e.code];if(k)keys[k]=false});
