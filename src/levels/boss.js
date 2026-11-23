// Niveau « boss » : le dépanneur, la blonde.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- boss: La Blonde ----------
const BOSS_H=140;
const TAUNTS=['T\'étais supposé ramener du lait!','Ça fait 3 heures que t\'es parti!','Encore de la bière?!','Ta mère a appelé!','Pis la vaisselle, elle?','Le souper est frette!','Tu sens la cigarette!'];
const OUCH=['Aïe! Ma veste en jean!','MICHEL!!','Tu vas me le payer!','Pas dans les cheveux!','Ma permanente!'];
function setupBoss(){
  camX=0;
  // platforms follow the dépanneur picture: counter, can shelf, beer cases, freezer, top of the fridges
  platforms.push({x:140,y:GROUND-119,w:205,kind:'counter'},{x:350,y:GROUND-153,w:150,kind:'shelf'},{x:524,y:GROUND-245,w:205,kind:'fridge'},{x:698,y:GROUND-102,w:44,kind:'crates'},{x:742,y:GROUND-119,w:125,kind:'freezer'});rbT=9;
  boss={x:660,w:66,h:124,vx:0,hp:DF.bossHp,max:DF.bossHp,state:'intro',st:0,face:-1,walk:0,atk:2,say:'MICHEL! QUAND EST-CE QUE TU RENTRES?!',sayT:3,flash:0,arm:0,steam:0};
  player.x=80;fridgeT=2.5;
  for(let i=0;i<2;i++)addItem(120+i*50,GROUND-40,'beer');
  sfx.boss();shake=.3;
}
function bossBox(){return {x:boss.x,y:GROUND-boss.h,w:boss.w,h:boss.h}}
function say(b,txt,d){b.say=txt;b.sayT=d||2.2}
function throwCup(b,lag){
  const p=player,hx=b.x+b.w/2+b.face*40,hy=GROUND-98,T=.8+lag;
  const tx=p.x+p.w/2+p.vx*T*.5,ty=p.y+40;
  cups.push({x:hx,y:hy,vx:(tx-hx)/T,vy:(ty-hy-.5*1400*T*T)/T,r:0});
}
function hitBoss(bt,stomp){
  const b=boss;b.hp--;b.flash=.2;score+=100;if(!stomp)shatter(bt.x,bt.y);sfx.ko();
  b.x+=Math.sign(bt.vx)*14;
  popups.push({x:bt.x,y:bt.y-20,text:'+100',t:.8,c:'#ffbf47'});
  if(b.hp<=0){
    b.state='down';b.st=0;b.vx=0;cups=[];score+=500;if(run.lvLost===0)award('blonde');
    say(b,'Bon… OK. Va au bar. Mais rentre avant minuit!',999);
    banner={text:'LA BLONDE EST CALMÉE · +500',sub:'La sortie est ouverte, à droite →',t:3,c:'#2f6f6b'};
  }else say(b,pick(OUCH),1.4);
}
function updateBoss(dt){
  const b=boss,p=player;b.st+=dt;b.flash=Math.max(0,b.flash-dt);b.sayT-=dt;b.steam-=dt;
  const pc=p.x+p.w/2,bc=b.x+b.w/2,dx=pc-bc;
  if(b.state!=='charge'&&b.state!=='down'&&b.state!=='stun')b.face=dx>=0?1:-1;
  if(b.steam<=0&&b.state!=='down'){b.steam=b.state==='rage'?.04:.14;parts.push({x:bc+b.face*10+rnd(-34,34),y:GROUND-BOSS_H+18,vx:rnd(-25,25),vy:rnd(-110,-60),life:.9,max:.9,steam:true,r:rnd(5,9),g:-20})}
  if(b.state==='intro'){if(b.st>2.6){b.state='walk';b.st=0}}
  else if(b.state==='walk'){
    const want=Math.abs(dx)>270?1:Math.abs(dx)<160?-1:0;
    b.vx=want*b.face*(b.hp<=6?100:70);b.x+=b.vx*dt;b.walk+=Math.abs(b.vx)*dt*.05;
    b.atk-=dt;
    if(b.atk<=0){
      if(b.hp<=b.max*2/3&&Math.random()<.4){b.state='rage';b.st=0;sfx.boss();say(b,pick(['GRRRR!','LÀ, C\'EST ASSEZ!','VIENS ICI, TOI!']),1)}
      else{b.state='wind';b.st=0}
    }
    if(b.sayT<=0&&Math.random()<dt*.6)say(b,pick(TAUNTS));
  }else if(b.state==='wind'){
    b.arm=Math.min(1,b.st/.45);
    if(b.st>=.45){throwCup(b,0);if(b.hp<=5)throwCup(b,.3);if(b.hp<=2)throwCup(b,-.2);sfx.throw();b.state='recover';b.st=0}
  }else if(b.state==='recover'){
    b.arm=-1;
    if(b.st>.35){b.arm=0;b.state='walk';b.st=0;b.atk=(rnd(1,1.7)-(b.max-b.hp)*.05*12/b.max)*DF.bossAtk}
  }else if(b.state==='rage'){
    shake=.12;if(b.st>.75){b.state='charge';b.st=0;b.vx=b.face*380}
  }else if(b.state==='charge'){
    b.x+=b.vx*dt;b.walk+=dt*16;
    if(b.x<20||b.x+b.w>W-20){b.x=clamp(b.x,20,W-20-b.w);b.state='stun';b.st=0;shake=.4;sfx.hurt();say(b,'Ouch… ma tête',1.2)}
  }else if(b.state==='stun'){
    if(b.st>1.4){b.state='walk';b.st=0;b.atk=1}
  }
  b.x=clamp(b.x,20,W-20-b.w);
  b.stompCd=Math.max(0,(b.stompCd||0)-dt);
  if(b.state!=='down'&&b.state!=='intro'&&b.stompCd<=0&&p.vy>0&&p.y+p.h<GROUND-b.h+48&&p.y+p.h>GROUND-b.h-10&&p.x+p.w>b.x+10&&p.x<b.x+b.w-10){
    b.stompCd=.5;hitBoss({x:bc,y:GROUND-b.h,vx:p.facing},true);p.vy=-680;p.onGround=false;
  }else if(b.state!=='down'&&b.state!=='intro'&&overlap({x:p.x+8,y:p.y+12,w:p.w-16,h:p.h-14},{x:b.x+14,y:GROUND-b.h+20,w:b.w-28,h:b.h-20})){
    hurt(b.state==='charge'?'LA BLONDE T\'A FONCÉ DEDANS':'LA BLONDE T\'A PRIS PAR L\'OREILLE',Math.sign(bc-pc)||1);
  }
  // the beer fridge keeps Michel stocked
  fridgeT-=dt;
  if(fridgeT<=0){fridgeT=2.1;if(b.state!=='down'&&ammo<9&&items.filter(i=>!i.taken).length<4){const spot=pick([[rnd(60,120),GROUND-40],[rnd(160,330),GROUND-159],[rnd(365,490),GROUND-193],[rnd(545,710),GROUND-285],[rnd(755,855),GROUND-159],[rnd(860,920),GROUND-40]]);addItem(spot[0],spot[1],'beer');popups.push({x:spot[0],y:spot[1]-40,text:'BIÈRE FROIDE!',t:1.1,c:'#9fe3ff'})}}
  rbT-=dt;if(rbT<=0){rbT=16;if(b.state!=='down'&&!items.some(i=>i.type==='rb'&&!i.taken)){addItem(625,GROUND-290,'rb');popups.push({x:625,y:GROUND-330,text:'BOISSON ÉNERGISANTE!',t:1.3,c:'#5ee0ff'})}}
  for(const c of cups){
    c.vy+=1400*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.r+=9*dt;
    if(overlap({x:p.x+8,y:p.y+12,w:p.w-16,h:p.h-14},{x:c.x-8,y:c.y-10,w:16,h:20})){c.dead=true;hurt('UN CAFÉ EN PLEINE FACE',Math.sign(c.vx)*-1||1);splash(c.x,c.y)}
    else if(c.y>GROUND-6){c.dead=true;splash(c.x,GROUND-6)}
  }
  cups=cups.filter(c=>!c.dead&&c.x>-40&&c.x<W+40);
  if(b.state==='down'&&b.st>1.2&&p.x+p.w>W-90&&p.onGround)leaveBoss();
}
function drawCup(c){
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.r);ctx.strokeStyle=INK;ctx.lineWidth=2.5;
  ctx.fillStyle='#c79a5e';ctx.beginPath();ctx.moveTo(-9,-10);ctx.lineTo(9,-10);ctx.lineTo(7,14);ctx.lineTo(-7,14);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#f3ead8';rr(-11,-15,22,6,2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#8a5a3b';ctx.fillRect(-8,-2,16,6);
  ctx.restore();
}
const DEP_IM=mkImg(ASSETS.rooms.dep);
function drawArena(){
  // the dépanneur, from the picture: its checker floor lands on GROUND
  ctx.fillStyle='#a8968a';ctx.fillRect(0,0,W,H);
  if(DEP_IM.complete)ctx.drawImage(DEP_IM,-15,GROUND-1252*.36,2752*.36,1536*.36);
  // one fluorescent tube flickers
  if(Math.sin(t*23)>.85){ctx.fillStyle='rgba(60,50,40,.18)';ctx.fillRect(0,0,W,140)}
  // exit: the back door on the right
  const open=boss&&boss.state==='down',dx=890,dw=48,dy=GROUND-270,dh=268;
  ctx.fillStyle='#c8403a';rr(dx-16,dy-30,dw+32,22,5);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.stroke();signText('SORTIE',dx+dw/2,dy-19,dw+20,12,'#fff4dc');
  if(open){ctx.fillStyle='#1d2240';ctx.fillRect(dx,dy,dw,dh);
    ctx.fillStyle='#ffd166';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(dx+6+(i*17)%36,dy+20+i*38,1.5,0,7);ctx.fill()}
    ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.strokeRect(dx,dy,dw,dh);
    const ay=dy-50+Math.sin(t*6)*6;ctx.font='16px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeText('NIVEAU 2 →',dx,ay);ctx.fillStyle='#ffbf47';ctx.fillText('NIVEAU 2 →',dx,ay);
  }
}
function drawBoss(){
  const b=boss,R=RIGS.boss,wk=b.walk,sn=Math.sin(wk);
  const down=b.state==='down';
  let ang={legL:down?0:sn*.34,legR:down?0:-sn*.34,armR:b.state==='wind'?-b.arm*1.1:b.state==='recover'?.75:down?.2:Math.sin(t*2)*.05,head:{r:Math.sin(wk*2)*.04}};
  let tilt=b.state==='charge'?.16:b.state==='stun'?Math.sin(t*9)*.07:b.state==='rage'?rnd(-.04,.04):Math.sin(wk*2)*.02,lift=0;
  const st=b.state;
  if(st==='walk'&&Math.abs(b.vx)<1){const g=Math.sin(t*4.2);tilt=g*.07;ang={legL:Math.max(0,g)*.32,legR:Math.min(0,g)*.32,armR:-.35+Math.sin(t*8.4)*.18,head:{r:Math.sin(t*4.2+.6)*.09}};lift=Math.abs(g)*3} // taunting groove
  else if(st==='rage'){const g=Math.sin(t*15);ang={legL:Math.max(0,g)*.5,legR:Math.min(0,g)*.5,armR:-.6+Math.sin(t*20)*.3,head:{r:Math.sin(t*21)*.12}};lift=Math.abs(g)*5}            // stomping
  else if(st==='intro'){const g=Math.sin(t*9);ang={legL:-Math.max(0,g)*.35,legR:0,armR:-.2,head:{r:-.06+Math.sin(t*4.5)*.05}}}                                                      // foot tapping
  else if(st==='wind'){ang.head={r:-.12*b.arm}}
  else if(st==='stun'){ang.head={r:Math.sin(t*9)*.16}}
  else if(down){const g=Math.sin(t*3.2);tilt=g*.1;ang={legL:{r:Math.max(0,g)*.35,y:-Math.max(0,g)*5},legR:{r:Math.min(0,g)*.35,y:Math.min(0,g)*5},armR:-.7+Math.sin(t*6.4)*.25,head:{r:Math.sin(t*3.2+1)*.13}};lift=Math.abs(g)*6} // happy dance
  ang=easeAng(b.av||(b.av={}),ang,st==='rage'?30:18);
  const bc=b.x+b.w/2;
  ctx.save();ctx.translate(bc,GROUND-Math.abs(sn)*4-lift);
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(0,4,58,9,0,0,7);ctx.fill();
  if(b.face<0)ctx.scale(-1,1);ctx.rotate(tilt);
  ang.ex=down?{mouth:'smile',blink:.35,brow:-.4}:b.flash>0?{mouth:'o',blink:.8,brow:-.7}:b.state==='stun'?{mouth:'o',blink:.55,brow:-.9,open:.6}
    :(b.state==='wind'||b.state==='rage'||b.state==='charge'||b.state==='intro')?{mouth:'shout',brow:1,blink:blinkAt(1)}:{mouth:b.sayT>0?'talk':'frown',brow:.8,blink:blinkAt(1)};
  if(b.flash>0)ctx.filter='brightness(1.9) saturate(.5)';
  else if(b.state==='rage')ctx.filter='saturate(1.4) hue-rotate(-12deg)';
  drawRig(R,BOSS_H,ang);
  ctx.filter='none';
  ctx.restore();
  const hy=GROUND-BOSS_H;
  if(!down){
    // anger mark
    const ax=bc+b.face*58,ay=hy+48,sc=1+.18*Math.sin(t*10);
    ctx.save();ctx.translate(ax,ay);ctx.scale(sc,sc);ctx.strokeStyle='#d62839';ctx.lineWidth=4;ctx.lineCap='round';
    for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(4,-4);ctx.quadraticCurveTo(10,-3,11,-10);ctx.stroke()}
    ctx.restore();ctx.lineCap='butt';
  }
  if(b.state==='stun'){for(let i=0;i<3;i++){const a=t*4+i*2.1;star(bc+Math.cos(a)*44,hy+6+Math.sin(a)*10)}}
  if(down){ctx.font='22px "Lilita One", Inter, Arial';ctx.fillStyle='#ff5d8f';ctx.textAlign='center';ctx.fillText('♥',bc+Math.sin(t*2)*20,hy-10-((t*30)%40))}
}
