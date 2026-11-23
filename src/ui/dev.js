// Mode dev (T) : choix du niveau, bières, vies, invincible.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- dev mode (T) ----------
let devPrev='title';
function toggleDev(){
  const el=document.getElementById('dev');
  if(state==='dev'){el.hidden=true;state=devPrev;return}
  devPrev=state;state='dev';el.hidden=false;keys.l=keys.r=keys.j=keys.d=keys.s=keys.t=false;
  setTimeout(()=>el.querySelector('button').focus(),30);
}
function devGo(lv){
  run.dev=true;
  ['pauseOv','setOv','dev','title','over','card','boardOv','vidOv','outOv'].forEach(id=>document.getElementById(id).hidden=true);try{outVid.pause()}catch(e){}
  cardNext=null;stopDanceMusic();try{clearTimeout(introTimer);introVid.pause()}catch(e){}
  if(lives<=0||devPrev==='over'){score=0;cigs=0;beers=0;lives=DF.lives;ammo=3;koCount=0}
  const l=isNaN(+lv)?lv:+lv;
  startLevel(l);state='play';
  if(l==='bike')geleNext=false;
  openPhone({kicker:godMode?'NOTIFICATIONS · INVINCIBLE':'NOTIFICATIONS',title:LEVELS[l].devTitle,text:'',btn:'JOUER'});
}
// one button per level, in the night's order (built at boot, once every level is registered)
function buildDevGrid(){const g=document.getElementById('devLevels');g.textContent='';
  LEVEL_ORDER.forEach((id,i)=>{const b=document.createElement('button');b.type='button';b.dataset.lv=String(id);b.textContent=(i+1)+' · '+LEVELS[id].dev;b.onclick=()=>devGo(b.dataset.lv);g.append(b)})}
document.querySelectorAll('#dev [data-act]').forEach(b=>b.onclick=()=>{
  const a=b.dataset.act;
  if(a==='beer')ammo+=5;
  if(a==='life')lives=Math.min(MAXL,lives+3);
  if(a==='god'){godMode=!godMode;b.textContent='Invincible : '+(godMode?'oui':'non')}
  if(a==='restart')restartAll();
});
