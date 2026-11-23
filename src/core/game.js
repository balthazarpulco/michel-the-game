// Règles communes : blessures, game over, fin de niveau, bières lancées, K.O.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- update ----------
function hurt(why,dir){
  if(player.inv>0||godMode)return;
  lives--;sfx.hurt();
  player.inv=DF.inv;player.vy=-520;player.vx=-dir*260;
  banner={text:why,t:1.6};
  shake=.3;
  if(lives<=0)gameOver(why);
}
let shake=0;
function enterResto(d){
  if(player.inv>0||godMode)return;
  lives--;sfx.resto();
  banner={text:d.bar?'EMBARQUÉ AU '+d.name:'T\'ES RENTRÉ',t:2};
  for(let i=0;i<14;i++)parts.push({x:player.x+19,y:player.y+50,vx:rnd(-120,120),vy:rnd(-300,-80),life:.8,max:.8,c:pick(['#f0c419','#c8403a','#fff4dc']),r:rnd(3,6),g:600});
  if(lives<=0){gameOver(banner.text);return}
  player.x=d.respawn.x;player.y=d.respawn.y;player.vx=0;player.vy=0;player.inv=1.6;
}
function gameOver(why,win){
  state='over';stopDanceMusic();
  if(win){award('night');if(!run.cont)award('iron');if(run.lost===0)award('clean');if(diff==='hard')award('hard')}
  const total=score;
  document.getElementById('overTitle').innerHTML=win?'BONNE NUIT,<br>MICHEL':'C\'EST FINI,<br>MON MICHEL';
  let best=0;try{best=+localStorage.getItem('gerald-best')||0;if(total>best){best=total;localStorage.setItem('gerald-best',String(total))}}catch(e){best=Math.max(best,total)}
  document.getElementById('reason').textContent=why;
  document.getElementById('finalScore').textContent=total.toLocaleString('fr-CA')+' pts';
  document.getElementById('finalStats').innerHTML=`<span>Cigarettes <b>${cigs}</b></span><span>Bières <b>${beers}</b></span><span>K.O. <b>${koCount}</b></span><span>Niveau <b>${STAGE_NAME[level]||level}</b></span><span>Record <b>${best.toLocaleString('fr-CA')}</b></span><span>Mode <b>${DF.name}</b></span>`+(run.got.length?`<span class="tw">🏆 ${run.got.map(id=>TROPHIES.find(x=>x[0]===id)[2]).join(' · ')}</span>`:'');
  const entry=openEntry(total,level,!!win);
  document.getElementById('contBtn').hidden=!!win;
  setTimeout(()=>{document.getElementById('over').hidden=false;(entry&&!document.body.classList.contains('pad')?nameIn:document.getElementById(win?'again':'contBtn')).focus()},500);
}
function reachGoal(){
  if(level===1){
    score+=200;
    showCard('NIVEAU 1 TERMINÉ · +200','LE DÉPANNEUR','Michel pousse la porte du dépanneur. Sa blonde l\'attend devant le frigo à bière, les bras croisés. Lance-lui des bières pour la calmer, et saute sur l\'étagère ou le comptoir pour esquiver ses cafés.','AFFRONTER TA BLONDE',()=>{startLevel('boss');state='play'});
  }else{
    score+=300;
    showCard('NIVEAU 2 TERMINÉ · +300','LE FOND DU BAR','Avant de danser, LD sort un joint : « Le premier qui finit gagne. » Clique ou appuie sur Espace pour tirer, mais pas trop vite : si la toux déborde, tu perds du temps.','ALLUMER LE JOINT',()=>{startLevel('joint');state='play'});
  }
}
function leaveBoss(){
  lives=Math.min(MAXL,lives+1);ammo=Math.max(ammo,4);
  showCard('BOSS VAINCU · +1 VIE','NIVEAU 2<br>LE BAR','Il fait nuit sur le boulevard. Rejoins le bar Chez Ginette sans te faire embarquer par les fêtards. Les bières, ça se lance aussi.','DIRECTION LE BAR',()=>{startLevel(2);state='play';banner={text:'NIVEAU 2 : VA CHEZ GINETTE',sub:'21 h, le boulevard s\'allume',t:2.2,c:'#3d2f4f'}});
}

// ---------- beers ----------
function shatter(x,y,foam){
  sfx.glass();
  for(let i=0;i<10;i++)parts.push({x,y,vx:rnd(-180,180),vy:rnd(-320,-80),life:.6,max:.6,c:pick(['#a8641f','#c98a3b','#7a4a1c']),r:rnd(2,4),g:900});
  if(foam!==false)for(let i=0;i<6;i++)parts.push({x,y,vx:rnd(-60,60),vy:rnd(-140,-40),life:.7,max:.7,c:'#fffbe8',r:rnd(3,6),g:300});
}
function knockOut(e,b,stomp){
  e.ko=true;e.kvy=stomp?-300:-520;e.kvx=Math.sign(b.vx||1)*(stomp?120:240);e.ky=0;e.rot=0;e.near=false;e.act=null;
  score+=50;koCount++;if(koCount>=25)award('ko');sfx.ko();if(!stomp)shatter(b.x,b.y);
  else for(let i=0;i<10;i++)parts.push({x:b.x,y:b.y,vx:rnd(-160,160),vy:rnd(-200,-40),life:.5,max:.5,c:'#fff4dc',r:rnd(2,4),g:600});
  popups.push({x:e.x+e.w/2,y:GROUND-(e.dh||e.h)-10,text:stomp?'ÉCRASÉ! +50':'K.O. +50',t:1,c:'#ffbf47'});
}
