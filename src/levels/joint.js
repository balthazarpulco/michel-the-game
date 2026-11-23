// Niveau « joint » : duel avec LD.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- mini-game: the joint duel with LD ----------
const JG=470,MX=290,LX=680,MH=250,LH=250;
let J=null;
function setupJoint(){
  J={t:-2.6,mine:0,ld:0,cough:0,coughT:0,ldCoughT:0,puffA:0,ldPuffA:0,ldNext:.25,haze:0,done:false,win:false,endT:0,say:'On fume-tu? Le premier qui finit gagne.',sayT:3,smoke:[],exhale:[],puffs:0};
}
function jointPuff(){
  const j=J;if(!j||j.done||j.t<0)return;
  if(j.coughT>0){j.cough=Math.min(1,j.cough+.02);return}
  const d=drunk();
  j.mine=Math.min(1,j.mine+.021*(1-.25*d));j.puffs++;
  j.cough+=.062*(1+.5*d);j.puffA=.18;
  j.exhale.push({who:'m',t:.32});
  beep(180+j.mine*80,120,.08,'sawtooth',.025);
  if(j.cough>=1){j.choked=true;j.cough=.7;j.coughT=1.5;popups.push({x:MX,y:JG-MH-30,text:'KOF KOF KOF!',t:1.2,c:'#ff9a9a'});j.say=pick(['Ha! Petit poumon!','Tousse pas trop, Michel!','Respire, le grand!']);j.sayT=1.6;sfx.hurt()}
}
function jointMouth(who){
  if(who==='m'){const R=RIGS.hero,s=MH/R.h,w=R.w*s;return {x:MX-w/2+w*HERO_CIG.x+4,y:JG-MH+MH*HERO_CIG.y}}
  const R=RIGS.ld,s=LH/R.h;return {x:LX-(R.mouth[0]-R.w/2)*s,y:JG-(R.h-R.mouth[1])*s};
}
function updateJoint(dt){
  const j=J;j.t+=dt;j.sayT-=dt;
  for(const q of popups){q.t-=dt;q.y-=40*dt}popups=popups.filter(q=>q.t>0);
  j.puffA=Math.max(0,j.puffA-dt);j.ldPuffA=Math.max(0,j.ldPuffA-dt);
  for(const e of j.exhale){e.t-=dt;if(e.t<=0){const m=jointMouth(e.who);FX.burst('smoke',m.x,m.y,{n:3,vx:(e.who==='m'?1:-1)*26,size:[10,18],grow:4,life:[2.2,3.4],alpha:.26});for(let i=0;i<3;i++)j.smoke.push({x:m.x,y:m.y,vx:(e.who==='m'?1:-1)*rnd(10,40),vy:rnd(-40,-15),r:rnd(8,14),life:rnd(2.6,4),max:4})}}
  j.exhale=j.exhale.filter(e=>e.t>0);
  for(const s of j.smoke){s.life-=dt;s.x+=s.vx*dt+Math.sin(t*1.3+s.y*.02)*10*dt;s.y+=s.vy*dt;s.r+=dt*9;s.vx*=.99}
  j.smoke=j.smoke.filter(s=>s.life>0);
  j.haze=Math.min(1,(j.mine+j.ld)*.55);
  if(j.done){j.endT+=dt;
    if(j.win&&j.endT>5.2&&state==='play'){score+=400;lives=Math.min(MAXL,lives+1);geleNext=true;
      showCard('DUEL GAGNÉ · +400 · +1 VIE','CHEZ GINETTE','LD dort dans les toilettes. Ginette, le patron, bloque la sortie : personne ne repart sans danser avec lui. Appuie sur la bonne flèche quand elle touche sa cible. Garde l\'ambiance au-dessus de zéro et réussis au moins 60 % des pas.','DANSER AVEC GINETTE',()=>{startLevel('dance');state='play'})}
    if(!j.win&&j.endT>2&&state==='play'){lives--;
      if(lives<=0){gameOver('LD T\'A BATTU AU JOINT');return}
      showCard('LD A FINI AVANT TOI · −1 VIE','REVANCHE','« T\'as même pas fini ton bat! » Clique vite, mais garde un œil sur la toux.','RALLUMER',()=>{startLevel('joint');state='play'})}
    return}
  if(j.t<0)return;
  j.coughT=Math.max(0,j.coughT-dt);
  j.cough=Math.max(0,j.cough-dt*(j.coughT>0?.2:.42));
  if(j.coughT>0&&Math.random()<dt*8){const m=jointMouth('m');j.smoke.push({x:m.x,y:m.y,vx:rnd(20,80),vy:rnd(-60,-10),r:rnd(5,9),life:1.4,max:4})}
  // LD smokes at a steady pace that picks up near the end, and coughs now and then
  j.ldCoughT=Math.max(0,j.ldCoughT-dt);
  if(j.ldCoughT<=0){j.ldNext-=dt;
    if(j.ldNext<=0){j.ldNext=1/((4.7+j.ld*1.6)*DF.joint)*rnd(.8,1.2);j.ld=Math.min(1,j.ld+.021);j.ldPuffA=.18;j.exhale.push({who:'l',t:.32});
      if(Math.random()<.025){j.ldCoughT=1.1;popups.push({x:LX,y:JG-LH-30,text:'KOF!',t:1,c:'#ff9a9a'});j.say=pick(['Ostie qu\'il est fort…','Kof… ça va, ça va.']);j.sayT=1.4}}}
  if(j.sayT<=0&&Math.random()<dt*.35){j.say=pick(['Envoye, aspire!','T\'es pas game.','C\'est de la bonne, ça.','Michel, t\'es rouge.','Lâche pas!']);j.sayT=1.6}
  if(j.mine>=1){j.done=true;j.win=true;if(!j.choked)award('joint');j.endT=0;j.say='Oh… attends… j\'reviens…';j.sayT=1.4;sfx.ko();popups.push({x:W/2,y:180,text:'T\'AS GAGNÉ!',t:1.6,c:'#9fe3a0'})}
  else if(j.ld>=1){j.done=true;j.win=false;j.endT=0;j.say='T\'as même pas fini ton bat!';j.sayT=3;sfx.hurt()}
}
function drawJointStick(m,len,dir,glow){
  ctx.save();ctx.translate(m.x,m.y);ctx.scale(dir,1);ctx.rotate(.12);
  ctx.fillStyle='#fffaf0';ctx.strokeStyle=INK;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(len,-5.5);ctx.lineTo(len,5.5);ctx.lineTo(0,3);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#d9c48c';ctx.fillRect(-1,-3,8,6);
  ctx.fillStyle=`rgba(255,${Math.round(90+glow*80)},40,1)`;ctx.beginPath();ctx.arc(len+1,0,4.5+glow*2.5,0,7);ctx.fill();
  if(glow>0){ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,120,40,${.5*glow})`;ctx.beginPath();ctx.arc(len+1,0,14,0,7);ctx.fill()}
  ctx.restore();
}
function drawJointRoom(){
  ctx.fillStyle='#2a1c22';ctx.fillRect(0,0,W,H);
  for(let r=0;r<14;r++)for(let c=0;c<18;c++){ctx.fillStyle=(r+c)%3?'#4a2a2a':'#552f2c';ctx.fillRect(c*56-(r%2)*28,r*34,52,30)}
  ctx.fillStyle='rgba(20,10,20,.45)';ctx.fillRect(0,0,W,H);
  ctx.save();ctx.shadowColor='#5ee0ff';ctx.shadowBlur=16;signText('FOND DU BAR · CHEZ GINETTE',W/2,40,380,20,'#9fefff');ctx.restore();
  ctx.fillStyle='#fffaf0';ctx.save();ctx.translate(120,140);ctx.rotate(-.05);ctx.fillRect(0,0,90,120);ctx.fillStyle='#c8403a';ctx.fillRect(8,8,74,74);ctx.font='900 12px Inter, Arial';ctx.fillStyle='#2b2b2b';ctx.textAlign='center';ctx.fillText('SHOW',45,100);ctx.fillText('JEUDI',45,114);ctx.restore();
  // couch
  ctx.fillStyle='#6b2f3a';ctx.strokeStyle=INK;ctx.lineWidth=3;rr(170,JG-110,620,70,14);ctx.fill();ctx.stroke();rr(150,JG-60,660,60,10);ctx.fill();ctx.stroke();
  ctx.fillStyle='#3a1a24';ctx.fillRect(0,JG,W,H-JG);ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(0,JG);ctx.lineTo(W,JG);ctx.stroke();
  // little table with an ashtray
  ctx.fillStyle='#5b3a2e';ctx.fillRect(445,JG-60,70,10);ctx.fillRect(476,JG-50,8,50);ctx.fillStyle='#9aa0a8';ctx.beginPath();ctx.ellipse(480,JG-64,16,5,0,0,7);ctx.fill();
}
function drawToilets(j){
  const k=1+Math.min(j.endT-1.6,6)*.012,w=W*k,h=w/TOILET.ar;
  ctx.fillStyle='#d9e6e3';ctx.fillRect(0,0,W,H);
  if(TOILET.im.complete)ctx.drawImage(TOILET.im,(W-w)/2,(H-h)/2+(k-1)*60,w,h);
  if(Math.random()<.035)parts.push({zz:true,x:W*.47,y:H*.42,vx:22,vy:-30,life:2,max:2,r:0,g:0});
  for(const q of parts){if(!q.zz)continue;q.life-=1/60;q.x+=q.vx/60;q.y+=q.vy/60;ctx.globalAlpha=clamp(q.life,0,1);ctx.font='26px "Lilita One", Inter, Arial';ctx.fillStyle='#2f6fb3';ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.textAlign='center';ctx.strokeText('z',q.x,q.y);ctx.fillText('z',q.x,q.y);ctx.globalAlpha=1}
  parts=parts.filter(q=>!q.zz||q.life>0);
  bubble('Chu correct… chu correct…',W*.66,H*.56,true);
  ctx.fillStyle='rgba(32,13,56,.82)';pg(W/2-260,96,520,40,10);ctx.fill();
  signText('PENDANT CE TEMPS, DANS LES TOILETTES…',W/2,116,490,20,'#fff4dc');
}
function drawJoint(){
  const j=J;
  if(j.done&&j.win&&j.endT>1.6){drawToilets(j);hud(0);return}
  drawJointRoom();
  ctx.font='900 12px Inter, Arial';
  // Michel
  {const cough=j.coughT>0,pa=j.puffA/.18;
   const ang={armL:-2.2*Math.sin(Math.PI*pa)*(pa>0?1:0)-.1,armR:Math.sin(t*2)*.05,red:j.mine,lid:j.mine*.45,noCig:1};
   ctx.save();ctx.translate(MX,JG);ctx.rotate(cough?Math.sin(t*28)*.05:Math.sin(t*1.4)*.02*(1+j.haze*3));ctx.scale(1,1+pa*.03);drawRig(RIGS.hero,MH,ang);ctx.restore();
   drawJointStick(jointMouth('m'),10+44*(1-j.mine),1,pa)}
  // LD
  {const pa=j.ldPuffA/.18,lose=j.done&&j.win;
   const ang={armR:-.85*Math.sin(Math.PI*pa)*(pa>0?1:0)+Math.sin(t*1.6)*.04,armL:Math.sin(t*1.6+1)*.04,head:{r:Math.sin(t*1.2)*.03+(j.ldCoughT>0?Math.sin(t*26)*.05:0)},legL:0,legR:0,red:j.ld,lid:j.ld*.5,
     ex:lose?{blink:.85,mouth:'o',open:.5,brow:-.8}:j.ldCoughT>0?{mouth:'o',blink:.7,brow:.6}:pa>0?{mouth:'o',open:.35,brow:-.3}:j.done?{mouth:'grin',brow:-.3}:{mouth:'flat',brow:.25,blink:blinkAt(3)}};
   ctx.save();ctx.translate(LX+(lose?j.endT*260:0),JG);ctx.scale(-1,1);ctx.rotate(lose?-.2:Math.sin(t*1.1)*.02*(1+j.haze*3));
   if(lose)ctx.filter='hue-rotate(60deg) saturate(1.4)';drawRig(RIGS.ld,LH,ang);ctx.filter='none';ctx.restore();
   if(!lose)drawJointStick(jointMouth('l'),10+44*(1-j.ld),-1,pa)}
  // smoke
  for(const s of j.smoke){ctx.fillStyle=`rgba(228,228,236,${.32*clamp(s.life/s.max*1.6,0,1)})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill()}
  ctx.fillStyle=`rgba(220,220,232,${j.haze*.32})`;ctx.fillRect(0,0,W,H);
  if(j.sayT>0)bubble(j.say,LX,JG-LH-14,true);
  for(const q of popups){ctx.globalAlpha=clamp(q.t*2,0,1);ctx.font='20px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.strokeText(q.text,q.x,q.y);ctx.fillStyle=q.c;ctx.fillText(q.text,q.x,q.y);ctx.globalAlpha=1}
  // trippy wobble
  if(j.haze>.15){
    ctx.save();ctx.setTransform(1,0,0,1,0,0);const Hc=cv.height,Wc=cv.width,strips=12,sh=Hc/strips;
    ctx.globalAlpha=.3*j.haze;
    for(let i=0;i<strips;i+=2){const off=Math.sin(t*2.2+i*.6)*10*j.haze*scale;ctx.drawImage(cv,0,i*sh,Wc,sh,off,i*sh,Wc,sh)}
    ctx.restore();ctx.filter='none';
  }
  hud(0);
  // bars
  const bar=(x,label,v,col)=>{const y0=JG+4;ctx.fillStyle='rgba(32,13,56,.88)';pg(x-10,y0,260,40,10);ctx.fill();
    ctx.textAlign='left';ctx.font='900 12px Inter, Arial';ctx.fillStyle=col;ctx.fillText(label+' · JOINT FUMÉ',x,y0+15);ctx.textAlign='right';ctx.font='600 12px Inter, Arial';ctx.fillStyle='#f4e7c8';ctx.fillText(Math.round(v*100)+' %',x+240,y0+15);
    ctx.fillStyle='#3a2a34';pg(x,y0+22,240,11,5);ctx.fill();ctx.fillStyle=col;pg(x,y0+22,Math.max(4,240*v),11,5);ctx.fill();ctx.strokeStyle=INK;pg(x,y0+22,240,11,5);ctx.stroke()};
  bar(MX-120,'MICHEL',j.mine,'#9fe3a0');bar(LX-120,'LD',j.ld,'#ff9ad5');
  // cough meter
  {const x=MX-90,y=JG-MH-58;ctx.fillStyle='rgba(32,13,56,.85)';pg(x-8,y-6,196,30,8);ctx.fill();ctx.font='900 11px Inter, Arial';ctx.textAlign='left';ctx.fillStyle=j.coughT>0?'#ff5d8f':'#f4e7c8';ctx.fillText(j.coughT>0?'TU TOUSSES!':'TOUX',x,y+10);
   ctx.fillStyle='#3a2a34';pg(x+70,y+2,110,12,6);ctx.fill();ctx.fillStyle='rgba(255,93,143,.35)';ctx.fillRect(x+70+110*.75,y+2,110*.25,12);ctx.fillStyle=j.cough>.75?'#ff5d8f':'#ffd166';pg(x+70,y+2,Math.max(3,110*j.cough),12,6);ctx.fill()}
  ctx.font='14px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.fillStyle='#fff4dc';ctx.strokeStyle=INK;ctx.lineWidth=4;const tip='CLIQUE OU ESPACE POUR TIRER · ATTENTION À LA TOUX';ctx.strokeText(tip,W/2,H-12);ctx.fillText(tip,W/2,H-12);
  if(j.t<0){const c=Math.ceil(-j.t/(2.6/3));ctx.font='64px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.strokeStyle=INK;ctx.lineWidth=7;const s=c>0&&c<=3?String(c):'GO!';ctx.strokeText(s,W/2,300);ctx.fillStyle='#ffbf47';ctx.fillText(s,W/2,300)}
}

// ---------- registre ----------
defineLevel({
  id:'joint', n:5,
  name:'DUEL AVEC LD', stage:'Duel LD', chapter:'Duel avec LD',
  dev:'Duel avec LD', devTitle:'DUEL AVEC LD',
  track:'c', hour:()=>23.6,
  place:()=>'Fond du bar',
  start:setupJoint,
  update:updateJoint, draw:drawJoint,
  keydown:e=>{if(e.code==='Space'||e.code==='KeyE'||e.code==='Enter'){e.preventDefault();if(!e.repeat)jointPuff();return true}return false},
  pointer:e=>{e.preventDefault();jointPuff()},
  pad:()=>'none',
  tuto:{from:'LD',av:'#c98a3b',msgs:['Le premier qui finit gagne 😏'],tips:[['CLIC / ESPACE','tirer une puff'],['TOUX','ralentis quand la jauge rougit']]},
  story:'Au fond du bar, LD sort un joint : « Le premier qui finit gagne. » Tire vite, mais surveille ta toux.',
  ctrl:[['Tirer une puff','CLIC · ESPACE','A']],
});
