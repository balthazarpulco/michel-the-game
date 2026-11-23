// Niveau « limo » : la limo de Delachaud, garder son verre droit.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------------- 2. THE LIMO ----------------
let LM=null;
function setupLimo(){camX=0;genDone=true;LM={t:-1.2,dur:30,tilt:0,vt:0,acc:0,accT:0,next:2.2,warn:null,nausea:0,offer:null,offerT:5,drinks:0,done:false,endT:0,say:'Bienvenue dans la limo, mon Michel!',sayT:3,scroll:0,bump:0,roll:0,spill:0,fail:false,clean:true}}
function limoDrink(){const L=LM;if(!L||!L.offer||L.done)return;L.offer=null;L.drinks++;ammo+=2;score+=100;L.nausea=Math.min(1,L.nausea+.06);popups.push({x:560,y:250,text:'VODKA-RED BULL! +100',t:1.2,c:'#5ee0ff'});fxBurst(560,280,['#5ee0ff','#ffd23f','#fff'],18);sfx.beer();L.say=pick(['ENWEYE!','Ça c\'est mon gars!','Cul sec, Michel!','Hahaha! Un autre?']);L.sayT=1.6}
function updateLimo(dt){
  const L=LM;mgParts(dt);L.sayT-=dt;L.scroll+=dt*(L.done?120:520);L.bump=Math.max(0,L.bump-dt*3);
  if(L.done){L.endT+=dt;L.tilt*=.9;if(L.endT>2.2&&state==='play'){
    if(L.fail){lives--;if(lives<=0){gameOver('T\'AS ÉTÉ MALADE DANS LA LIMO');return}showCard('T\'AS ÉTÉ MALADE · −1 VIE','ON RECOMMENCE','Delachaud te tend une serviette : « Ok, ok… on recommence, pis tiens ton verre droit cette fois! »','RÉESSAYER',()=>{startLevel('limo');state='play'});return}
    const pts=500+L.drinks*100+Math.round((1-L.nausea)*300);score+=pts;if(L.clean)award('limo');
    showCard('ARRIVÉ AU CASINO · +'+pts,'LE CASINO','Delachaud te met des jetons dans les mains : « Une main de blackjack, tout ce que t\'as! » Approche-toi de 21 sans dépasser. Gagne, pis t\'auras plus de temps au flipper.','JOUER LA MAIN',()=>{startLevel('bj');state='play'})}return}
  L.t+=dt;if(L.t<0)return;
  // road events: turns and potholes, announced just before
  L.next-=dt;
  if(L.next<=0&&!L.warn){const k=pick(['L','R','L','R','bump']);L.warn={k,t:.95/Math.sqrt(mgDiff())};L.next=rnd(2.2,3.6)/mgDiff()}
  if(L.warn){L.warn.t-=dt;if(L.warn.t<=0){const k=L.warn.k;L.warn=null;
    if(k==='bump'){L.vt+=rnd(-1,1)*3.2*mgDiff();L.bump=1;shake=.25;beep(120,60,.2,'sawtooth',.06);L.spill+=.04}
    else{L.acc=(k==='L'?1:-1)*rnd(240,340)*mgDiff();L.accT=rnd(1.1,1.6);beep(300,240,.15,'triangle',.03)}}}
  if(L.accT>0){L.accT-=dt;if(L.accT<=0)L.acc=0}
  const inp=(keys.r?1:0)-(keys.l?1:0),dk=drunk();
  const sway=dk*(Math.sin(t*1.7)*1.4+Math.sin(t*3.1)*.6);
  const a=L.acc*.0042+inp*6.5-7*L.tilt-1.7*L.vt+sway;
  L.vt+=a*dt;L.tilt=clamp(L.tilt+L.vt*dt,-1.2,1.2);if(Math.abs(L.tilt)>=1.2)L.vt*=-.3;
  L.roll+=(L.acc*.00035-L.roll)*(1-Math.exp(-dt*3));
  // spilling
  const over=Math.abs(L.tilt)-.42;
  if(over>0){L.nausea+=over*dt*1.5;L.clean=false;if(Math.random()<dt*30)parts.push({x:480+Math.sign(L.tilt)*38,y:404,vx:Math.sign(L.tilt)*rnd(60,160),vy:rnd(-80,20),life:.7,max:.7,c:pick(['#ffb81f','#ffd23f','#5ee0ff']),r:rnd(2,4),g:900})}
  else L.nausea=Math.max(0,L.nausea-dt*.035);
  L.nausea=Math.min(1,L.nausea+L.spill);L.spill=0;
  if(L.nausea>=1&&!godMode){L.done=true;L.fail=true;L.endT=0;banner={text:'BLEURGH!',sub:'Michel a été malade sur le cuir de la limo',t:2,c:'#7fa32b'};sfx.hurt();for(let i=0;i<40;i++)parts.push({x:380,y:300,vx:rnd(40,260),vy:rnd(-160,40),life:.9,max:.9,c:pick(['#9bbf3b','#c7d36f','#7fa32b']),r:rnd(3,6),g:900});return}
  if(godMode)L.nausea=Math.min(L.nausea,.9);
  // Delachaud keeps the drinks coming
  L.offerT-=dt;if(L.offerT<=0&&!L.offer){L.offer={t:3};L.offerT=rnd(5,7);L.say=pick(['Tiens, un vodka-Red Bull!','Un p\'tit dernier?','C\'est moi qui paye!']);L.sayT=1.6}
  if(L.offer){L.offer.t-=dt;if(L.offer.t<=0)L.offer=null}
  if(Math.random()<dt*.15&&L.sayT<-1){L.say=pick(['Le Casino, mon Michel!!','Chauffeur, plus vite!','Ce soir on gagne gros!','Michel, t\'es vert…']);L.sayT=1.8}
  if(L.t>=L.dur){L.done=true;L.endT=0;banner={text:'ARRIVÉ AU CASINO!',sub:'Delachaud saute de la limo',t:2,c:'#ff3d9a'};beep(523,1046,.3,'triangle',.06)}
}
function drawLimo(){
  const L=LM;
  ctx.save();ctx.translate(W/2,H/2);ctx.rotate(L.roll*.6);ctx.translate(-W/2+(shake>0?rnd(-6,6)*shake*3:0),-H/2+Math.sin(t*40)*2*L.bump);
  // night city through the windows
  ctx.fillStyle='#0d0a1c';ctx.fillRect(-40,-40,W+80,H+80);
  ctx.save();rr(40,60,880,170,26);ctx.clip();
  const sk=ctx.createLinearGradient(0,60,0,230);sk.addColorStop(0,'#1a1440');sk.addColorStop(1,'#3a1d52');ctx.fillStyle=sk;ctx.fillRect(40,60,880,170);
  for(let i=0;i<26;i++){const x=((i*173-L.scroll*.35)%1100+1100)%1100-70,h=60+((i*37)%90);ctx.fillStyle='#22183a';ctx.fillRect(x,230-h,64,h);ctx.fillStyle='#ffd166';for(let k=0;k<6;k++)if((i*k)%3)ctx.fillRect(x+8+(k%3)*18,230-h+12+Math.floor(k/3)*22,8,10)}
  for(let i=0;i<14;i++){const x=((i*211-L.scroll)%1200+1200)%1200-100;ctx.fillStyle=['#ff3d9a','#5ee0ff','#ffd23f'][i%3];ctx.globalAlpha=.7;ctx.fillRect(x,150+(i%4)*14,90,4);ctx.globalAlpha=1}
  for(let i=0;i<8;i++){const x=((i*260-L.scroll*1.6)%1300+1300)%1300-140;ctx.fillStyle='#3a2f4a';ctx.fillRect(x,120,6,110);ctx.fillStyle='#fff1b8';ctx.beginPath();ctx.arc(x+3,120,7,0,7);ctx.fill()}
  ctx.restore();
  ctx.strokeStyle='#120c1c';ctx.lineWidth=14;rr(40,60,880,170,26);ctx.stroke();for(const x of [330,630]){ctx.fillStyle='#120c1c';ctx.fillRect(x,60,14,170)}
  // ceiling neon
  ctx.save();ctx.shadowColor='#ff3d9a';ctx.shadowBlur=18;ctx.fillStyle='#ff6fb5';ctx.fillRect(40,34,880,6);ctx.restore();
  // seats
  ctx.fillStyle='#3a1d52';rr(20,250,920,230,40);ctx.fill();ctx.fillStyle='#4a2768';for(let i=0;i<6;i++){rr(40+i*150,262,140,120,24);ctx.fill()}
  ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=3;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(110+i*150,270);ctx.lineTo(110+i*150,370);ctx.stroke()}
  // mini bar
  ctx.fillStyle='#1d1430';rr(30,300,110,90,10);ctx.fill();for(let i=0;i<4;i++){ctx.fillStyle=['#7fa32b','#5ee0ff','#c8403a','#ffd23f'][i];rr(42+i*24,262,14,40,4);ctx.fill()}
  // Delachaud, laughing, leaning with the car
  {const lean=-L.roll*2+Math.sin(t*2)*.03;ctx.save();ctx.translate(700,455);ctx.rotate(lean);ctx.scale(-1,1);
   const off=!!L.offer;drawRig(RIGS[DELACHAUD],230,{armL:off?-1.6:-.3+Math.sin(t*6)*.1,armR:-.2,ex:{mouth:L.sayT>0?'talk':'grin',brow:-.3,blink:blinkAt(4)}});ctx.restore();
   if(L.offer){const ox=590,oy=300+Math.sin(t*6)*4;ctx.save();ctx.translate(ox,oy);ctx.shadowColor='#5ee0ff';ctx.shadowBlur=16;ctx.fillStyle='#2f6fb3';rr(-11,-22,22,44,4);ctx.fill();ctx.fillStyle='#c8d0d8';rr(-11,-22,22,8,3);ctx.fill();ctx.fillStyle='#ffd23f';ctx.font='900 7px Inter';ctx.textAlign='center';ctx.fillText('VODKA',0,0);ctx.fillText('RB',0,9);ctx.restore();
     ctx.font='16px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle=INK;const s=IS_TOUCH?'VODKA = PRENDS':'E : PRENDS-LE';ctx.strokeText(s,ox,oy-34);ctx.fillStyle='#5ee0ff';ctx.fillText(s,ox,oy-34)}
   if(L.sayT>0)bubble(L.say,700,170,true)}
  // Michel, sitting, swaying with the glass
  {const tl=L.tilt*.45-L.roll;ctx.save();ctx.translate(330,455);ctx.rotate(tl);
   const ex=L.nausea>.7?{mouth:'o',open:.5,blink:.5,drunk:1}:Math.abs(L.tilt)>.42?{mouth:'shout',brow:-1,blink:0}:{mouth:'smile',drunk:drunk(),blink:blinkAt(1)};
   drawRig(RIGS.hero,230,{legL:-1.45,shinL:1.5,footL:0,legR:-1.35,shinR:1.45,footR:0,armL:-1.2,foreL:-1.1,armR:.2,ex,noCig:1});ctx.restore();
   if(L.nausea>.55){ctx.globalAlpha=(L.nausea-.55)*1.4;ctx.fillStyle='#9bbf3b';ctx.beginPath();ctx.ellipse(330+Math.sin(L.tilt)*60,300,60,40,0,0,7);ctx.fill();ctx.globalAlpha=1}}
  ctx.fillStyle='#2a1240';rr(-20,430,W+40,190,30);ctx.fill();ctx.fillStyle='rgba(255,255,255,.06)';rr(-20,430,W+40,10,6);ctx.fill();
  ctx.restore();
  // the glass, big in front: keep it straight
  {const gx=480,gy=470,tl=L.tilt;ctx.save();ctx.translate(gx,gy);ctx.rotate(tl);
   ctx.fillStyle='rgba(220,240,255,.18)';ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-40,-120);ctx.lineTo(40,-120);ctx.lineTo(32,0);ctx.lineTo(-32,0);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.save();ctx.beginPath();ctx.moveTo(-40,-120);ctx.lineTo(40,-120);ctx.lineTo(32,0);ctx.lineTo(-32,0);ctx.closePath();ctx.clip();
   ctx.rotate(-tl*.85);const lvl=-82+L.nausea*30;const lg=ctx.createLinearGradient(0,lvl,0,10);lg.addColorStop(0,'#ffd23f');lg.addColorStop(1,'#ff9a1f');ctx.fillStyle=lg;ctx.beginPath();ctx.moveTo(-80,lvl+Math.sin(t*9)*3);for(let x=-80;x<=80;x+=10)ctx.lineTo(x,lvl+Math.sin(t*9+x*.08)*3);ctx.lineTo(80,40);ctx.lineTo(-80,40);ctx.closePath();ctx.fill();
   ctx.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(-24+((i*17+t*30)%48),lvl+20+((i*23+t*40)%60),2.2,0,7);ctx.fill()}ctx.restore();
   ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(-30,-112,6,100);
   ctx.restore();
   // level indicator
   ctx.fillStyle='rgba(32,13,56,.75)';pg(gx-110,gy+14,220,16);ctx.fill();ctx.fillStyle='#9fe3a0';pg(gx-26,gy+16,52,12);ctx.fill();
   ctx.fillStyle=Math.abs(tl)>.42?'#ff3d9a':'#fff';ctx.beginPath();ctx.arc(gx+clamp(tl/1.2,-1,1)*100,gy+22,9,0,7);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke()}
  // warnings
  if(L.warn){const k=L.warn.k,a=.6+.4*Math.sin(t*20),txt=k==='bump'?'⚠ NID-DE-POULE!':k==='L'?'◀◀ VIRAGE À GAUCHE':'VIRAGE À DROITE ▶▶';ctx.globalAlpha=a;ctx.fillStyle=k==='bump'?'#ff3d9a':'#ffd23f';pg(W/2-150,82,300,44);ctx.fill();ctx.globalAlpha=1;signText(txt,W/2,104,270,20,'#2a1240')}
  mgDrawParts();
  hud(0);
  mgBar('MAL DE CŒUR','Casino dans '+Math.max(0,Math.ceil(L.dur-Math.max(0,L.t)))+' s',L.nausea,L.nausea>.7?'#9bbf3b':'#ff9ad5');
  if(L.t<0){ctx.font='40px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.lineWidth=7;ctx.strokeStyle=INK;ctx.strokeText('GARDE TON VERRE DROIT!',W/2,330);ctx.fillStyle='#ffd23f';ctx.fillText('GARDE TON VERRE DROIT!',W/2,330)}
  {ctx.textAlign='center';ctx.font='700 12px Inter, Arial';ctx.fillStyle='#fff4dc';ctx.strokeStyle=INK;ctx.lineWidth=4;const s=IS_TOUCH?'◀ ▶ PENCHE CONTRE LE VIRAGE · VODKA POUR PRENDRE':'← → PENCHE CONTRE LE VIRAGE · E PRENDRE UN VODKA-RED BULL';ctx.strokeText(s,W/2,H-12);ctx.fillText(s,W/2,H-12)}
  mgBanner();
}

// ---------- registre ----------
defineLevel({
  id:'limo', n:8,
  name:'LA LIMO DE DELACHAUD', stage:'Limousine', chapter:'La limo',
  dev:'Limousine', devTitle:'LIMOUSINE',
  track:'d', hour:()=>1.05,
  place:()=>'En limousine',
  fx:{bloom:0.45},   // glow (src/gfx/effects.ts)
  start:setupLimo,
  update:updateLimo, draw:drawLimo,
  keydown:e=>{if(e.code==='Space'||e.code==='Enter'||e.code==='KeyE'){e.preventDefault();if(!e.repeat)limoDrink();return true}return false},
  pointer:e=>{e.preventDefault();limoDrink()},
  pad:()=>LM&&!LM.done?'limo':'none',
  tuto:{from:'Delachaud',av:'#ff9a1f',msgs:['MICHEL!! J\'t\'envoie une limo 🥂','Casino ce soir, c\'est moi qui paye!'],tips:[['← →','penche contre le virage'],['VERRE','garde-le droit, sinon mal de cœur'],['E','prendre un vodka-Red Bull (+ points, + tangue)']]},
  story:'Delachaud t\'envoie une limo pour le Casino. Garde ton verre droit dans les virages pis prends les vodka-Red Bull qu\'il te tend.',
  ctrl:[['Pencher dans le virage','← → · A D','CROIX · STICK\u00a0G'],['Prendre un vodka-Red Bull','E · ESPACE','B · A']],
});
