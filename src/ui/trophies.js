// Trophées (sauvés dans ce navigateur) et toasts.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- trophies: saved in this browser ----------
const TROPHIES=[
  ['dulac','🍷','Dulac a rien vu','Voler le vin sans te faire pogner'],
  ['blonde','☕','Même pas mouillé','Calmer ta blonde sans perdre de vie'],
  ['ko','🥊','Videur','25 K.O. dans une même partie'],
  ['cig','🚬','Chain smoker','Ramasser 50 clopes dans une partie'],
  ['joint','🌿','Poumons d\'acier','Battre LD au joint sans t\'étouffer'],
  ['disco','🕺','Roi du disco','Danser avec Ginette sans rater un pas'],
  ['chum','❤️','Chum parfait','Seulement des bonnes réponses à ta blonde'],
  ['limo','🥂','Main de chirurgien','Limousine sans renverser une goutte'],
  ['bj','🃏','Blackjack!','Faire 21 du premier coup au Casino'],
  ['flip','🎰','Tilt!','5 000 points au flipper'],
  ['tony','🛹','Tony Michel','Combo ×5 en skate'],
  ['skate','🧱','Pilote','Rentrer en skate sans tomber'],
  ['ninja','🤫','Ninja','Te coucher avec le bruit sous 25 %'],
  ['night','🛏️','Bonne nuit','Finir la nuit de Michel'],
  ['iron','🔁','D\'une traite','Finir sans utiliser de reprise'],
  ['clean','🛡️','Intouchable','Finir sans perdre une seule vie'],
  ['hard','🔥','Michel de fer','Finir la nuit en HARD'],
];
let trophies={};try{trophies=JSON.parse(localStorage.getItem('michel-trophies')||'{}')||{}}catch(e){}
let run={lost:0,lvLost:0,pl:3,cont:false,cigs:0,dev:false,got:[]};
const toasts=[];
function award(id){
  if(run.dev||godMode||trophies[id])return;
  const T=TROPHIES.find(x=>x[0]===id);if(!T)return;
  trophies[id]={at:Date.now(),mode:diff};try{localStorage.setItem('michel-trophies',JSON.stringify(trophies))}catch(e){}
  run.got.push(id);toasts.push({T,t:0});trophyUI();
  beep(784,1046,.12,'triangle',.05);setTimeout(()=>beep(1046,1568,.16,'triangle',.05),120);
}
function trophyUI(){
  const n=Object.keys(trophies).filter(k=>TROPHIES.some(x=>x[0]===k)).length,txt=n+'/'+TROPHIES.length;
  document.getElementById('trophCount').textContent=txt;document.getElementById('trophCount2').textContent=txt;
  const g=document.getElementById('trophGrid');g.textContent='';
  for(const [id,ic,name,desc] of TROPHIES){const c=document.createElement('div');c.className='tcard'+(trophies[id]?' got':'');
    c.innerHTML='<div class="ic"></div><b></b><span></span>';c.children[0].textContent=ic;c.children[1].textContent=name;c.children[2].textContent=desc+(trophies[id]&&DIFFS[trophies[id].mode]?' · '+DIFFS[trophies[id].mode].name:'');g.appendChild(c)}
}
function drawToasts(dt){
  if(!toasts.length)return;
  const q=toasts[0];q.t+=dt;if(q.t>3.2){toasts.shift();return}
  const a=Math.min(1,q.t*5,(3.2-q.t)*4),w=330,x=W/2-w/2,y=74-(1-a)*30;
  ctx.save();ctx.setTransform(scale,0,0,scale,0,0);ctx.globalAlpha=a;
  ctx.fillStyle='rgba(32,13,56,.9)';pg(x,y,w,54);ctx.fill();ctx.strokeStyle='#ffbf47';ctx.lineWidth=2;pg(x,y,w,54);ctx.stroke();
  ctx.font='26px Inter, Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(q.T[1],x+34,y+28);
  ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='900 11px Inter, Arial';ctx.fillStyle='#ffbf47';ctx.fillText('🏆 TROPHÉE DÉBLOQUÉ',x+62,y+22);
  ctx.font='16px "Lilita One", Inter, Arial';ctx.fillStyle='#fff4dc';ctx.fillText(q.T[2].toUpperCase(),x+62,y+42,w-80);
  ctx.restore();
}
function runTick(){if(state!=='play'&&state!=='over')return;if(lives<run.pl){run.lost+=run.pl-lives;run.lvLost+=run.pl-lives}run.pl=lives}
document.getElementById('showTroph').onclick=()=>{trophyUI();document.getElementById('trophOv').hidden=false;document.getElementById('closeTroph').focus()};
document.getElementById('closeTroph').onclick=()=>{document.getElementById('trophOv').hidden=true;document.getElementById('showTroph').focus()};
