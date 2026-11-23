// Vidéos d'intro et d'outro.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

const vidOv=document.getElementById('vidOv'),introVid=document.getElementById('introVid');
let introTimer=null;
function playIntro(){
  state='video';vidOv.hidden=false;
  try{introVid.currentTime=0}catch(e){}
  introVid.muted=muted;
  const p=introVid.play();
  if(p&&p.catch)p.catch(()=>{introVid.muted=true;introVid.play().catch(()=>endIntro())});
  clearTimeout(introTimer);introTimer=setTimeout(()=>{if(state==='video')endIntro()},16000);
  setTimeout(()=>document.getElementById('vidSkip').focus(),50);
}
function endIntro(){
  if(state!=='video')return;
  clearTimeout(introTimer);try{introVid.pause()}catch(e){}
  vidOv.hidden=true;
  openPhone({kicker:'VENDREDI · 17 H',title:'LE STUDIO',text:LV_STORY.office,btn:'JOUER'});
}
introVid.addEventListener('ended',endIntro);
// ending: Michel made it to bed — play the outro film, then the victory screen
const outOv=document.getElementById('outOv'),outVid=document.getElementById('outVid');let outNext=null,outTimer=0;
function playOutro(next){
  outNext=next;state='outro';outOv.hidden=false;
  try{outVid.currentTime=0;outVid.muted=muted;const p=outVid.play();if(p&&p.catch)p.catch(()=>{outVid.muted=true;outVid.play().catch(()=>endOutro())})}catch(e){endOutro()}
  clearTimeout(outTimer);outTimer=setTimeout(()=>{if(state==='outro')endOutro()},14000);
  setTimeout(()=>document.getElementById('outSkip').focus(),50);
}
function endOutro(){if(state!=='outro')return;clearTimeout(outTimer);try{outVid.pause()}catch(e){}outOv.hidden=true;state='play';const f=outNext;outNext=null;f&&f()}
outVid.addEventListener('ended',endOutro);outVid.addEventListener('error',()=>{if(state==='outro')endOutro()});
document.getElementById('outSkip').onclick=endOutro;
introVid.addEventListener('error',()=>{if(state==='video')endIntro()});
document.getElementById('vidSkip').onclick=endIntro;
vidOv.addEventListener('pointerdown',e=>{if(e.target===introVid)e.preventDefault()});
