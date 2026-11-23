// État du jeu : niveau, joueur, monde de la rue, bières/ivresse (drunk), startLevel, newGame.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// Level 1 runs from 14h to sunset, level 2 from 21h into the night
const LEN={1:6200,2:7200,3:1470,bike:15500,office:1900};
const HOME_LEN=1520,HK=.7603,HY=dy=>Math.round(HK*dy-95.2),HX=dx=>Math.round(HK*dx);
let level=1;
function hourAt(x){if(level==='limo')return 1.05;if(level==='bj')return 1.25;if(level==='flip')return 1.4;if(level==='office')return 17.02;if(level==='joint')return 23.6;if(level==='texto')return .9;if(level==='boss')return 19.6;if(level==='bike')return 1+clamp(bike?bike.z/BIKE_LEN:0,0,1)*1.9;if(level==='dance')return .5;if(level===3)return 3+clamp(x/HOME_LEN,0,1)*.4;const f=clamp(x/LEN[level],0,1);return level===1?14+f*5.6:(21+f*4.5)%24}
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
const LV_NAME={limo:'LA LIMO DE DELACHAUD',bj:'BLACKJACK',flip:'LE FLIPPER',office:'LE STUDIO',1:'BOULEVARD SAINT-LAURENT',boss:'TA BLONDE',2:'LE BOULEVARD',joint:'DUEL AVEC LD',dance:'GINETTE',texto:'LES TEXTOS',bike:'RETOUR EN SKATE',3:'CHEZ MICHEL'};
function continueLevel(){
  const L=level;
  document.getElementById('over').hidden=true;stopDanceMusic();
  if(lvSnap&&lvSnap.l===L){score=lvSnap.score;cigs=lvSnap.cigs;beers=lvSnap.beers;ammo=lvSnap.ammo;koCount=lvSnap.ko}
  lives=DF.cont;banner=null;run.cont=true;run.pl=lives;
  startLevel(L);
  openPhone({kicker:'ON REPREND · '+DF.cont+(DF.cont>1?' VIES':' VIE'),title:LV_NAME[L]||'',text:'',btn:'JOUER'});
}
function updateKeys(l){const el=document.querySelector('.keys');if(!el)return;const KO={1:[['← →','bouger'],['ESPACE','sauter'],['E','lancer une bière'],['MAJ','sprint']],boss:[['← →','bouger'],['ESPACE','sauter'],['↑','monter'],['E','lancer une bière']],2:[['← →','bouger'],['ESPACE','sauter'],['E','lancer une bière'],['MAJ','sprint']],office:[['← →','marcher'],['ESPACE','sauter'],['↓','escalier'],['TIENS E','voler le vin']],bj:[['1','tirer'],['2','rester'],['CLIC','choisir']]};const t=KO[l]||(TUTO[l]&&TUTO[l].tips)||[];const ok=/^(TIENS|CLIC|ESPACE|MAJ|E|[←→↑↓]|[1-9]|\/|\+)( (TIENS|CLIC|ESPACE|MAJ|E|[←→↑↓]|[1-9]|\/|\+))*$/;const esc=x=>String(x).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));const parts=t.filter(x=>ok.test(x[0])).slice(0,4).map(([k,d])=>k.split(' ').map(w=>/^(TIENS|\/|\+)$/.test(w)?(w==='TIENS'?'tiens':w):'<kbd>'+esc(w)+'</kbd>').join(' ')+' '+esc(d.split(/ [:(]/)[0]));el.innerHTML=parts.length?parts.join(' · '):'<kbd>P</kbd> pause'}
function startLevel(l){updateKeys(l);
  run.lvLost=0;run.pl=lives;
  if(l!=='dance'&&tracks.c){try{tracks.c.playbackRate=1}catch(e){}}
  playTrack(LV_TRACK[l]);
  if(!lvSnap||lvSnap.l!==l)lvSnap={l,score,cigs,beers,ammo,ko:koCount};
  level=l;unlockChapter(l);
  player={walk:0,x:120,y:GROUND-96,w:38,h:96,vx:0,vy:0,onGround:true,facing:1,coyote:0,inv:0,dropT:0,land:0,throwT:0,slip:0,hic:4};
  doorOut=null;camX=0;genX=0;facades=[];platforms=[];decos=[];dangers=[];enemies=[];items=[];parts=[];popups=[];cars=[];lamps=[];bottles=[];cups=[];puddles=[];cans=[];lastResto=-9999;
  boss=null;goal=null;genDone=false;rbPlaced=false;churchDone=false;firstBar=true;soberT=0;carTimer=1;banner=null;maxX=0;distance=0;smokeT=0;firstResto=(l===1);
  if(l==='boss'){setupBoss();return}
  if(l==='dance'){setupDance();return}
  if(l===3){setupHome();return}
  if(l==='bike'){setupBike();return}
  if(l==='office'){setupOffice();return}
  if(l==='joint'){setupJoint();return}
  if(l==='texto'){setupTexto();return}
  if(l==='limo'){setupLimo();return}
  if(l==='bj'){setupBJ();return}
  if(l==='flip'){setupFlip();return}
  if(l!==1)addFacade({x:-40,w:300,h:300,kind:'triplex'});
  for(let i=0;i<4;i++)addItem(330+i*60,GROUND-40,i===3?'beer':'cig');
  genX=l===1?930:560;
  // Mile End: the street opens on Ribotti Vintage, right next to the office
  // Michel walks out of Ribotti Vintage's door, onto boulevard Saint-Laurent
  if(l===1){const fh=260,fw=Math.round(FAC.ribotti.w*fh/FAC.ribotti.h),fx=-20;addFacade({x:fx,w:fw,h:fh,kind:'img',img:'ribotti',glow:[[.27,.27,.5,.5]]});
    facades.push({x:fx+fw+6,w:70,h:250,kind:'stsign'});lamps.push(fx+fw+140);genX=fx+fw+90;
    player.x=fx+fw*.858-player.w/2;player.facing=1;doorOut={x:fx+fw*.808,w:fw*.1,y:GROUND-fh*.62,h:fh*.6,t:1.2}}
  while(genX<W*2.5&&!genDone)genChunk();
}
let soberT=0,doorOut=null;
// Michel starts to drift from the 10th beer in hand, fully gone at 18
function drunk(){return soberT>0?0:clamp((ammo-9)/9,0,1)}
const DRUNK=[[.15,'SOBRE','#9fe3a0'],[.45,'POMPETTE','#ffd166'],[.75,'CHAUDAILLE','#ff9f43'],[1.01,'PAQUETÉ','#ff5d8f']];
function newGame(){run={lost:0,lvLost:0,pl:DF.lives,cont:false,cigs:0,dev:false,got:[]};score=0;cigs=0;beers=0;lives=DF.lives;ammo=3;koCount=0;geleNext=false;startLevel('office')}
