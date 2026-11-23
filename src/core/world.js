// État du jeu : niveau, joueur, monde de la rue, bières/ivresse (drunk), startLevel, newGame.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// Level 1 runs from 14h to sunset, level 2 from 21h into the night
const LEN={1:6200,2:7200,3:1470,bike:15500,office:1900};
const HOME_LEN=1520,HK=.7603,HY=dy=>Math.round(HK*dy-95.2),HX=dx=>Math.round(HK*dx);
let level=1;
function hourAt(x){return LEVELS[level].hour(x)}
function nightAt(x){
  const h=hourAt(x);
  if(h>=21||h<5)return 1;
  if(h>=19&&h<21)return (h-19)/2;
  if(h>=5&&h<7)return 1-(h-5)/2;
  return 0;
}

// ---------- world ----------
let state='title';
let player,camX,genX,facades,platforms,dangers,enemies,items,parts,popups,cars,lamps,carTimer,score,cigs,beers,lives,banner,maxX,t=0,firstResto,reason,distance,smokeT;
const MAXL=9;
let decos=[];
let puddles=[],cans=[],lastResto=-9999,rbPlaced=false,godMode=false;
let churchDone=false,firstBar=true;
let rbT=9;
let ammo=3,koCount=0,bottles=[],cups=[],boss=null,goal=null,genDone=false,throwCd=0,fridgeT=0;

let lvSnap=null;
function continueLevel(){
  const L=level;
  document.getElementById('over').hidden=true;stopDanceMusic();
  if(lvSnap&&lvSnap.l===L){score=lvSnap.score;cigs=lvSnap.cigs;beers=lvSnap.beers;ammo=lvSnap.ammo;koCount=lvSnap.ko}
  lives=DF.cont;banner=null;run.cont=true;run.pl=lives;
  startLevel(L);
  openPhone({kicker:'ON REPREND · '+DF.cont+(DF.cont>1?' VIES':' VIE'),title:lvName(L),text:'',btn:'JOUER'});
}
function updateKeys(l){const el=document.querySelector('.keys');if(!el)return;const D=LEVELS[l]||{};const t=D.keys||(D.tuto&&D.tuto.tips)||[];const ok=/^(TIENS|CLIC|ESPACE|MAJ|E|[←→↑↓]|[1-9]|\/|\+)( (TIENS|CLIC|ESPACE|MAJ|E|[←→↑↓]|[1-9]|\/|\+))*$/;const esc=x=>String(x).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));const parts=t.filter(x=>ok.test(x[0])).slice(0,4).map(([k,d])=>k.split(' ').map(w=>/^(TIENS|\/|\+)$/.test(w)?(w==='TIENS'?'tiens':w):'<kbd>'+esc(w)+'</kbd>').join(' ')+' '+esc(d.split(/ [:(]/)[0]));el.innerHTML=parts.length?parts.join(' · '):'<kbd>P</kbd> pause'}
function startLevel(l){updateKeys(l);
  run.lvLost=0;run.pl=lives;
  if(l!=='dance'&&tracks.c){try{tracks.c.playbackRate=1}catch(e){}}
  playTrack(LEVELS[l].track);
  if(!lvSnap||lvSnap.l!==l)lvSnap={l,score,cigs,beers,ammo,ko:koCount};
  level=l;unlockChapter(l);FX.clear();
  player={walk:0,x:120,y:GROUND-96,w:38,h:96,vx:0,vy:0,onGround:true,facing:1,coyote:0,inv:0,dropT:0,land:0,throwT:0,slip:0,hic:4};
  doorOut=null;camX=0;genX=0;facades=[];platforms=[];decos=[];dangers=[];enemies=[];items=[];parts=[];popups=[];cars=[];lamps=[];bottles=[];cups=[];puddles=[];cans=[];lastResto=-9999;
  boss=null;goal=null;genDone=false;rbPlaced=false;churchDone=false;firstBar=true;soberT=0;carTimer=1;banner=null;maxX=0;distance=0;smokeT=0;firstResto=(l===1);
  LEVELS[l].start();
}
let soberT=0,doorOut=null;
// Michel starts to drift from the 10th beer in hand, fully gone at 18
function drunk(){return soberT>0?0:clamp((ammo-9)/9,0,1)}
const DRUNK=[[.15,'SOBRE','#9fe3a0'],[.45,'POMPETTE','#ffd166'],[.75,'CHAUDAILLE','#ff9f43'],[1.01,'PAQUETÉ','#ff5d8f']];
function newGame(){run={lost:0,lvLost:0,pl:DF.lives,cont:false,cigs:0,dev:false,got:[]};score=0;cigs=0;beers=0;lives=DF.lives;ammo=3;koCount=0;geleNext=false;startLevel('office')}
