// Pause et redémarrage.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

function togglePause(){
  if(!setOv.hidden){closeSettings();return}
  if(state==='play'&&level!=='dance'&&!(level==='office'&&office&&office.intro>0)){state='pause';document.getElementById('pauseOv').hidden=false;keys.l=keys.r=keys.j=keys.d=keys.s=keys.t=false;setTimeout(()=>document.getElementById('resumeBtn').focus(),30)}
  else if(state==='pause'){state='play';document.getElementById('pauseOv').hidden=true}
}
document.getElementById('resumeBtn').onclick=togglePause;
document.getElementById('restartBtn').onclick=()=>restartAll();
document.getElementById('pauseBtn').onclick=e=>{togglePause();e.currentTarget.blur()};
function restartAll(){
  ['pauseOv','setOv','dev','title','over','card','boardOv','vidOv','outOv'].forEach(id=>document.getElementById(id).hidden=true);try{outVid.pause()}catch(e){}
  cardNext=null;stopDanceMusic();
  newGame();banner=null;
  openPhone({kicker:'NOUVELLE PARTIE',title:'LE STUDIO',text:LV_STORY.office,btn:'JOUER'});
}
