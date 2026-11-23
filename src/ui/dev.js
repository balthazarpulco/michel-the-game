// Mode dev (T) : choix du niveau, bières, vies, invincible.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- dev mode (T) ----------
let devPrev='title';
const DEV_LV=['office','1','boss','2','joint','dance','texto','limo','bj','flip','bike','3'];
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
  openPhone({kicker:godMode?'NOTIFICATIONS · INVINCIBLE':'NOTIFICATIONS',title:{limo:'LIMOUSINE',bj:'BLACKJACK',flip:'FLIPPER',office:'LE STUDIO',1:'NIVEAU 1',boss:'BOSS : TA BLONDE',2:'NIVEAU 2',joint:'DUEL AVEC LD',dance:'BOSS : GINETTE',texto:'TEXTOS',bike:'NIVEAU 3 : SKATE',3:'NIVEAU 4'}[lv],text:'',btn:'JOUER'});
}
document.querySelectorAll('#dev [data-lv]').forEach(b=>b.onclick=()=>devGo(b.dataset.lv));
document.querySelectorAll('#dev [data-act]').forEach(b=>b.onclick=()=>{
  const a=b.dataset.act;
  if(a==='beer')ammo+=5;
  if(a==='life')lives=Math.min(MAXL,lives+3);
  if(a==='god'){godMode=!godMode;b.textContent='Invincible : '+(godMode?'oui':'non')}
  if(a==='restart')restartAll();
});
