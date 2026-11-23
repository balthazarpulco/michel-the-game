// Niveau « 3 » : chez Michel, se coucher sans bruit.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- level 3: home, tiptoe to bed ----------
let home=null;
// Michel's apartment, from the picture (entrance → living room → kitchen → bathroom → bedroom).
// HX/HY turn picture coordinates (2000 px wide reference) into level coordinates.
function setupHome(){
  camX=0;genDone=true;player.x=60;
  home={noise:0,wake:false,win:false,endT:0,say:'',sayT:0,squeakCd:0,growl:0,objs:[],dog:{x:700,vx:70,min:450,max:1140,ph:0,bark:0}};
  const O=(x,w,h,kind,base)=>home.objs.push({x,w,h,kind,base:base??GROUND,fall:0,down:false});
  const P=(x0,x1,dy,kind)=>platforms.push({x:HX(x0),y:HY(dy),w:HX(x1)-HX(x0),kind:kind||'img'});
  // furniture you can walk on
  P(450,572,505);            // TV stand
  P(535,835,612);            // couch
  P(625,790,552);            // coffee table
  P(872,998,420);            // fireplace mantel
  P(1015,1100,530);          // kitchen counter (front)
  P(1015,1238,445);          // kitchen counter (back)
  P(1238,1350,345);          // top of the fridge
  P(1272,1395,588);          // kitchen table
  P(1442,1595,420);          // bathtub rim
  P(1625,1705,440);          // sink
  P(1748,1800,528);          // nightstand + lamp
  P(1582,1945,580,'bed');    // the bed: the goal
  // empties from tonight, by the door
  O(HX(268),14,34,'bottle');O(HX(292),14,34,'bottle');O(HX(316),14,30,'bottle');
  // living room
  O(HX(395),30,12,'toy');
  O(HX(700),16,28,'bottle',HY(552));                 // the can on the coffee table
  O(HX(960),22,40,'vase',HY(420));                   // vase on the mantel, next to the candle
  O(HX(880),26,12,'board');O(HX(960),26,12,'board'); // squeaky floorboards
  // kitchen
  O(HX(1140),40,26,'plates',HY(445));
  O(HX(1068),30,12,'toy');                           // dog bowls
  O(HX(1330),16,24,'glass',HY(588));
  O(HX(1210),26,12,'board');
  // bathroom + bedroom
  O(HX(1500),62,48,'laundry');
  O(HX(1655),22,30,'frame',HY(440));                 // toothbrush cup on the sink
  O(HX(1755),16,24,'glass',HY(528));
  // cigarettes on the high road
  [[505,470],[740,520],[935,380],[1150,400],[1295,300],[1520,380]].forEach(([x,y])=>addItem(HX(x),HY(y),'cig'));
  addItem(HX(1300),HY(300)-30,'rb');
}
function makeNoise(v,why){if(!home||home.wake||home.win)return;v*=DF.noise;home.noise=Math.min(1,home.noise+v);home.peak=Math.max(home.peak||0,home.noise);if(home.noise>=1)wakeUp(why)}
function landNoise(drop){if(drop>150)makeNoise((drop-150)*.004,'BOUM! T\'AS ATTERRI TROP FORT')}
function wakeUp(why){
  if(godMode){popups.push({x:player.x+player.w/2,y:player.y-20,text:'DEV : '+why.toLowerCase(),t:1,c:'#9fe3ff'});if(home)home.noise=.5;return}
  if(home.wake||home.win)return;
  home.wake=true;home.noise=1;home.endT=0;home.why=why;home.say='MICHEL!! IL EST QUELLE HEURE, LÀ?!';home.sayT=9;shake=.5;sfx.boss();
  banner={text:why,sub:'Ta blonde s\'est réveillée',t:2.2,c:'#c8403a'};
}
function updateHome(dt){
  const p=player,h=home;
  h.noise=Math.max(0,h.noise-dt*.11);h.squeakCd-=dt;h.sayT-=dt;
  if(keys.s&&p.onGround&&Math.abs(p.vx)>60)makeNoise(dt*.55,'TU COURAIS DANS LE CORRIDOR');
  const pb={x:p.x+8,y:p.y+12,w:p.w-16,h:p.h-12};
  for(const o of h.objs){
    if(o.down){o.fall=Math.min(1,o.fall+dt*5);continue}
    const ob={x:o.x,y:o.base-o.h,w:o.w,h:o.h};
    if(!overlap(pb,ob))continue;
    if(o.kind==='board'){if(h.squeakCd<=0&&p.onGround){h.squeakCd=.9;beep(180,120,.3,'sawtooth',.05);popups.push({x:o.x+13,y:o.base-30,text:'CRIIIK!',t:.8,c:'#ffd166'});makeNoise(.3,'LE PLANCHER A CRAQUÉ')}continue}
    if(o.kind==='toy'){if(h.squeakCd<=0){h.squeakCd=.8;beep(1400,900,.12,'sine',.07);popups.push({x:o.x+15,y:o.base-30,text:'COUIC!',t:.8,c:'#ffd166'});makeNoise(.4,'LE JOUET DU CHIEN A COUINÉ')}continue}
    o.down=true;o.dir=Math.sign(o.x+o.w/2-(p.x+p.w/2))||1;
    shatter(o.x+o.w/2,o.base-6,false);beep(900,120,.35,'sawtooth',.09);
    const names={bottle:'UNE BOUTEILLE EST TOMBÉE',chair:'T\'AS RENVERSÉ UNE CHAISE',plates:'LA PILE D\'ASSIETTES EST TOMBÉE',vase:'LE VASE S\'EST CASSÉ',lamp:'LA LAMPE EST TOMBÉE',laundry:'LE PANIER DE LINGE EST TOMBÉ',frame:'LE CADRE EST TOMBÉ',glass:'LE VERRE D\'EAU EST TOMBÉ'};
    wakeUp(names[o.kind]||'CRASH!');return;
  }
  // the dog
  const d=h.dog;d.x+=d.vx*dt;d.ph+=dt*9;
  if(d.x<d.min){d.x=d.min;d.vx=Math.abs(d.vx)}if(d.x>d.max){d.x=d.max;d.vx=-Math.abs(d.vx)}
  const dx=Math.abs(d.x-(p.x+p.w/2));
  d.growl=dx<150&&p.y+p.h>GROUND-90;
  if(d.growl)makeNoise(dt*.18,'LE CHIEN GROGNE');
  if(overlap(pb,{x:d.x-24,y:GROUND-52,w:48,h:52}))wakeUp('LE CHIEN A JAPPÉ');
  // bed
  const BED=platforms.find(q=>q.kind==='bed');
  if(p.onGround&&BED&&Math.abs(p.y+p.h-BED.y)<2&&p.x+p.w/2>BED.x+20){
    h.win=true;h.endT=0;if((h.peak||0)<.25)award('ninja');h.say='…bonne nuit, Michel. Tu sens la bière.';h.sayT=9;p.vx=0;
    banner={text:'MICHEL EST COUCHÉ',sub:'Sans réveiller personne',t:2.4,c:'#2f6f6b'};
  }
}
function updateHomeEnd(dt){
  const h=home;h.endT+=dt;h.sayT-=dt;
  for(const o of h.objs)if(o.down)o.fall=Math.min(1,o.fall+dt*5);
  for(const q of parts){q.life-=dt;q.vy+=(q.g||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt}
  parts=parts.filter(q=>q.life>0);
  for(const q of popups){q.t-=dt;q.y-=40*dt}popups=popups.filter(q=>q.t>0);
  if(banner){banner.t-=dt;if(banner.t<=0)banner=null}
  shake=Math.max(0,shake-dt);
  if(h.win&&h.endT>2.6&&state==='play'){const bonus=1500+lives*300+Math.round((1-h.noise)*500);score+=bonus;playOutro(()=>gameOver('VICTOIRE · BONUS '+bonus+' PTS',true))}
  if(h.wake&&h.endT>2.4){
    lives--;
    if(lives<=0){gameOver('TA BLONDE S\'EST RÉVEILLÉE');return}
    showCard('TA BLONDE S\'EST RÉVEILLÉE · −1 VIE','ON RECOMMENCE',h.why.charAt(0)+h.why.slice(1).toLowerCase()+'. Recommence, et cette fois, sur la pointe des pieds.','RÉESSAYER',()=>{startLevel(3);state='play'});
  }
}
const HOME_IM=mkImg(ASSETS.rooms.home);
function drawHome(){
  ctx.fillStyle='#2e3a5c';ctx.fillRect(0,0,W,H);
  if(HOME_IM.complete)ctx.drawImage(HOME_IM,-Math.round(camX),GROUND-Math.round(1140*.48),3168*.48,1344*.48);
  // the TV flickers blue, the candle wavers
  {const tx=HX(515)-camX,ty=HY(475);const g=ctx.createRadialGradient(tx,ty,4,tx,ty,120);g.addColorStop(0,`rgba(140,190,255,${.22+.08*Math.sin(t*13)})`);g.addColorStop(1,'rgba(140,190,255,0)');ctx.fillStyle=g;ctx.fillRect(tx-120,ty-120,240,240)}
  {const cx=HX(903)-camX,cy=HY(395);const g=ctx.createRadialGradient(cx,cy,2,cx,cy,60);g.addColorStop(0,`rgba(255,200,120,${.3+.1*Math.sin(t*9)})`);g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ctx.fillRect(cx-60,cy-60,120,120)}
}
function drawHomeObj(o){
  const x=Math.round(o.x-camX);if(x>W+40||x+o.w<-40)return;
  ctx.save();ctx.translate(x+(o.dir>0?o.w:0),o.base);ctx.rotate((o.dir||1)*o.fall*Math.PI/2);ctx.translate(-(o.dir>0?o.w:0),0);
  ctx.strokeStyle=INK;ctx.lineWidth=2.5;const w=o.w,h=o.h;
  if(!o.down){ctx.shadowColor=o.kind==='toy'?'rgba(120,220,255,.95)':'rgba(255,200,60,.95)';ctx.shadowBlur=10+6*Math.sin(t*5+o.x*.01)}
  if(o.kind==='bottle'){ctx.fillStyle='#3f7a3a';rr(0,-h*.7,w,h*.7,3);ctx.fill();ctx.stroke();ctx.fillRect(w/2-3,-h,6,h*.3);ctx.strokeRect(w/2-3,-h,6,h*.3)}
  else if(o.kind==='chair'){ctx.fillStyle='#a8743f';ctx.fillRect(0,-38,w,7);ctx.strokeRect(0,-38,w,7);ctx.fillRect(2,-31,5,31);ctx.fillRect(w-7,-31,5,31);ctx.fillRect(o.x<600?2:w-7,-h,5,32);ctx.strokeRect(o.x<600?2:w-7,-h,5,32);ctx.fillRect(o.x<600?2:w-27,-h,25,6)}
  else if(o.kind==='plates'){for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#fffaf0':'#e8e1d3';rr(0,-6-i*5,w,6,3);ctx.fill();ctx.stroke()}}
  else if(o.kind==='vase'){ctx.fillStyle='#2f6fb3';ctx.beginPath();ctx.moveTo(4,0);ctx.quadraticCurveTo(-4,-h*.5,6,-h*.8);ctx.lineTo(w-6,-h*.8);ctx.quadraticCurveTo(w+4,-h*.5,w-4,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#e76f51';ctx.beginPath();ctx.arc(w/2,-h-4,7,0,7);ctx.fill();ctx.stroke()}
  else if(o.kind==='lamp'){ctx.fillStyle='#3a3530';ctx.fillRect(w/2-3,-h+30,6,h-30);ctx.fillRect(2,-6,w-4,6);ctx.fillStyle='#f2c14e';ctx.beginPath();ctx.moveTo(0,-h+32);ctx.lineTo(w,-h+32);ctx.lineTo(w-5,-h);ctx.lineTo(5,-h);ctx.closePath();ctx.fill();ctx.stroke();if(!o.down)lights.push({k:'lamp',x:x+w/2,y:o.base-h+20})}
  else if(o.kind==='laundry'){ctx.fillStyle='#d9c48c';rr(0,-h,w,h,6);ctx.fill();ctx.stroke();ctx.fillStyle='#c8403a';ctx.beginPath();ctx.ellipse(18,-h,14,8,0,0,7);ctx.fill();ctx.fillStyle='#2f6fb3';ctx.beginPath();ctx.ellipse(40,-h-2,16,9,0,0,7);ctx.fill()}
  else if(o.kind==='frame'){ctx.fillStyle='#e9c46a';ctx.fillRect(0,-h,w,h);ctx.strokeRect(0,-h,w,h);ctx.fillStyle='#ff9ad5';ctx.fillRect(4,-h+4,w-8,h-8)}
  else if(o.kind==='glass'){ctx.fillStyle='rgba(159,227,255,.7)';ctx.fillRect(0,-h,w,h);ctx.strokeRect(0,-h,w,h)}
  else if(o.kind==='board'){ctx.fillStyle='rgba(120,80,50,.85)';rr(-4,-4,w+8,6,2);ctx.fill();ctx.stroke();ctx.font='9px "Lilita One", Inter';ctx.fillStyle='#ffd166';ctx.textAlign='center';ctx.fillText('CRIK',w/2,-8)}
  else if(o.kind==='toy'){ctx.fillStyle='#fff4dc';rr(0,-h,w,h,6);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(2,-h,5,0,7);ctx.arc(w-2,-h,5,0,7);ctx.arc(2,0,5,0,7);ctx.arc(w-2,0,5,0,7);ctx.fill()}
  ctx.restore();
}
function drawHomeActors(){
  const h=home;
  for(const o of h.objs)drawHomeObj(o);
  // the dog waddles back and forth
  const d=h.dog,x=d.x-camX;
  if(x>-80&&x<W+80){
    const hop=Math.abs(Math.sin(d.ph))*8,sq=1+Math.sin(d.ph*2)*.04;
    ctx.save();ctx.translate(x,GROUND-hop);if(d.vx<0)ctx.scale(-1,1);ctx.rotate(Math.sin(d.ph)*.08);ctx.scale(1/sq,sq);
    drawRig(RIGS.dog,64,{});ctx.restore();
    if(d.growl&&!h.wake)bubble('Grrr…',x,GROUND-74);
  }
  // ta blonde, asleep in the picture's bed (head on the far pillow)
  const BED=platforms.find(q=>q.kind==='bed');if(!BED)return;
  const bx=BED.x+BED.w-56-camX,by=BED.y;
  if(bx>-300&&bx<W+300){
    ctx.save();
    if(h.wake){ctx.translate(bx-20,by+10);drawRig(RIGS.boss,130,{armR:Math.sin(h.endT*12)*.3,ex:{brow:1,mouth:'shout'}});}
    else{ctx.translate(bx-120,by-10);ctx.rotate(Math.PI/2);ctx.scale(.62,1);drawRig(RIGS.boss,130,{ex:{blink:1,mouth:'flat'}})}
    ctx.restore();
    if(h.win){ctx.save();ctx.translate(bx-100,by+12);ctx.rotate(Math.PI/2);ctx.scale(.58,1);drawRig(RIGS.hero,108,{ex:{blink:1,mouth:'smile'}});ctx.restore()}
    // blanket over them
    ctx.fillStyle='#b9c4e2';ctx.strokeStyle='rgba(42,26,22,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(BED.x+6-camX,by+30);ctx.quadraticCurveTo(BED.x+10-camX,by-(h.wake?2:10),BED.x+40-camX,by-(h.wake?2:12));ctx.lineTo(BED.x+BED.w-70-camX,by-(h.wake?0:16));ctx.quadraticCurveTo(BED.x+BED.w-56-camX,by+8,BED.x+BED.w-62-camX,by+30);ctx.closePath();ctx.fill();ctx.stroke();
    if(!h.wake&&Math.random()<.03)parts.push({x:bx+camX-10,y:by-50,vx:-20,vy:-28,life:2,max:2,zz:true,r:0,g:0});
    if(h.sayT>0)bubble(h.say,bx-40,by-(h.wake?150:60),true);
  }
}

// ---------- registre ----------
defineLevel({
  id:3, n:12,
  name:'CHEZ MICHEL', stage:'Chez Michel', chapter:'Chez Michel',
  dev:'Chez Michel', devTitle:'NIVEAU 4',
  track:'e', hour:x=>3+clamp(x/HOME_LEN,0,1)*.4,
  place:left=>`Ton lit : ${left} m`,
  fxTick:dt=>fxMotes(dt,1.6,0,W,120,420,[0xffe9c4]),   // dust in the lamp light
  start:setupHome,
  touchLabels:{E:'VOMIR',MAJ:'COURIR'},
  frozen:dt=>{if(home&&(home.wake||home.win)){updateHomeEnd(dt);return true}return false},
  scene:drawHome, night:.82,
  pad:()=>home&&(home.wake||home.win)?'none':'home',
  tuto:{from:'Ma blonde ❤️',av:'#f2c14e',msgs:['zzz'],tips:[['← →','marche doucement'],['MAJ','courir = bruit'],['E','vomir : 5 s sobre'],['CHIEN','il jappe si tu le touches'],['CRIK','planche qui craque : saute par-dessus']]},
  story:'3 h du matin. Ta blonde dort au fond de l\'appart. Passe par le divan, le foyer pis le frigo pour éviter le chien pis les planches qui craquent, sans rien faire tomber. Attention : sauter de trop haut, ça fait du bruit.',
  ctrl:[['Marcher doucement','← → · A D','CROIX · STICK\u00a0G'],['Sauter','ESPACE · ↑','A'],['Courir (fait du bruit)','MAJ','RB · RT · Y'],['Vomir','E','B · X']],
});
