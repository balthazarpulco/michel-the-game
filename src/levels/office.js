// Niveau « office » : le studio, voler le pinot de Dulac.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- intro: the office, steal Dulac's wine ----------
// Two rooms drawn from the studio pictures: the studio upstairs (room 0), the ground floor with the kitchen (room 1).
// Room images are 1376x768; RS scales them so the floor where people stand lands on GROUND.
const RS=.75,ROOM_W=Math.round(1376*RS),XB=1300,ROOM_FEET=[655,640];
const roomY=r=>GROUND-ROOM_FEET[r]*RS, AX=ix=>ix*RS, BX=ix=>XB+ix*RS;
const ROOMS={studio:mkImg(ASSETS.rooms.studio),ground:mkImg(ASSETS.rooms.ground)};
const PLANT_IM=['fiddle','monstera'].map(k=>({ar:ASSETS.plants[k].ar,im:mkImg(ASSETS.plants[k].img)}));
const OFFICE_LEN=XB+ROOM_W,MEZZ_Y=GROUND-170,STAIR_X=AX(1012),FRIDGE_X=BX(873),PLANTS=[BX(330),BX(772)],EXIT_X=BX(557),ENTRY_X=BX(236),DL_MIN=BX(985),DL_MAX=BX(1210);
const DL_TALK=['Oui… oui…','Non, le rapport est presque fini.','Ben voyons donc!','Ha ha! Arrête!','Attends, j\'ai un double appel…','Mon pinot? Au frais, inquiète-toi pas.','On se voit au 5 à 7?'];
let office=null;
function setupOffice(){
  camX=0;genDone=true;
  // the desks upstairs are platforms (jump on them for the cigarettes)
  const yA=roomY(0);
  platforms.push({x:AX(4),y:yA+522*RS,w:AX(366)-AX(4),kind:'desk'},{x:AX(537),y:yA+540*RS,w:AX(940)-AX(537),kind:'desk'},{x:AX(1100),y:yA+492*RS,w:AX(1300)-AX(1100),kind:'desk'});
  player.x=AX(70);player.y=GROUND-player.h;player.facing=1;
  addItem(AX(170),yA+522*RS-40,'cig');addItem(AX(300),yA+522*RS-40,'cig');addItem(AX(860),yA+540*RS-40,'cig');addItem(AX(1200),yA+492*RS-40,'beer');
  addItem(BX(150),GROUND-40,'cig');addItem(BX(680),GROUND-40,'cig');
  office={intro:0,steal:0,stolen:false,caughtT:0,done:false,doorMsgT:0,hidden:false,stealing:false,room:0,fadeT:0,moved:false,
    dl:{state:'walkR',st:0,dur:0,face:1,x:DL_MIN,walk:0,say:'Allô? Oui, c\'est Dulac.',sayT:2}};
}
function officeGoDown(){const o=office;if(o.fadeT>0||o.room)return;o.fadeT=.6;o.moved=false;beep(300,200,.15,'triangle',.04)}
function officeToKitchen(){const o=office,p=player;o.room=1;p.x=ENTRY_X-p.w/2;p.y=GROUND-p.h;p.vx=0;p.vy=0;p.facing=1;camX=XB}
function updateOffice(dt){
  const o=office,p=player,D=o.dl;
  D.st+=dt;D.sayT-=dt;o.doorMsgT-=dt;
  // room change through the stairs door
  if(o.fadeT>0){o.fadeT-=dt;p.vx=0;if(!o.moved&&o.fadeT<.3){o.moved=true;officeToKitchen();banner={text:'LA CUISINE',sub:'Dulac est au téléphone, cache-toi derrière les plantes',t:2.4,c:'#2f6f6b'}}}
  if(o.room===0){
    const px=p.x+p.w/2,atDoor=Math.abs(px-STAIR_X)<48&&p.onGround&&p.y+p.h>=GROUND-1;
    o.atDoor=atDoor;if(atDoor&&keys.d)officeGoDown();
    p.x=clamp(p.x,4,ROOM_W-p.w-4);
    return;
  }
  // Dulac paces in the kitchen with his phone: back turned when he walks right, watching when he walks left
  const SP=46;
  if(D.state==='walkR'){D.face=1;D.x+=SP*dt;D.walk+=dt*6;if(D.x>=DL_MAX){D.x=DL_MAX;D.state='talk';D.st=0;D.dur=rnd(1.4,3)*DF.dl}}
  else if(D.state==='talk'&&D.st>D.dur){D.state='warn';D.st=0;D.say=pick(['Hmm…?','Y\'a quelqu\'un?','Michel?','Attends… c\'est quoi ce bruit-là?']);D.sayT=.9;beep(1800,2300,.4,'sine',.04)}
  else if(D.state==='warn'&&D.st>.9*DF.warn){D.state='walkL';D.st=0;D.face=-1}
  else if(D.state==='walkL'){D.face=-1;D.x-=SP*.85*dt;D.walk+=dt*6;if(D.x<=DL_MIN){D.x=DL_MIN;D.state='look';D.st=0;D.dur=rnd(1.2,2.2)}}
  else if(D.state==='look'&&D.st>D.dur){D.state='walkR';D.st=0;D.face=1}
  if((D.state==='walkR'||D.state==='talk')&&D.sayT<=-1.2&&Math.random()<dt*.7){D.say=pick(DL_TALK);D.sayT=1.8}
  const atFridge=!o.stolen&&p.onGround&&p.y+p.h>=GROUND-1&&Math.abs(p.x+p.w/2-FRIDGE_X)<46;
  o.stealing=atFridge&&keys.t;
  if(o.stealing){o.steal=Math.min(1,o.steal+dt/2.2);if(Math.random()<dt*6)beep(320+o.steal*500,300+o.steal*500,.05,'triangle',.02)}
  if(o.steal>=1&&!o.stolen){o.stolen=true;if(!o.everCaught)award('dulac');ammo++;score+=150;sfx.beer();popups.push({x:FRIDGE_X,y:GROUND-180,text:'LE PINOT DE DULAC · +150',t:1.8,c:'#ff9ad5'});banner={text:'T\'AS LE VIN!',sub:'Sors par la porte noire ←',t:2.4,c:'#2f6f6b'}}
  o.hidden=PLANTS.some(x=>Math.abs(p.x+p.w/2-x)<38)&&p.y+p.h>=GROUND-1;
  if((D.state==='look'||D.state==='walkL')&&!godMode&&!o.stolen&&o.fadeT<=0){
    const px=p.x+p.w/2,inCone=px<D.x-10&&px>D.x-580&&p.y+p.h>GROUND-130;
    if(inCone&&!o.hidden&&(o.stealing||Math.abs(p.vx)>45))officeCaught(o.stealing?'MICHEL! C\'EST MON PINOT!':'MICHEL? TU FAIS QUOI LÀ, TOI?');
  }
  // the black door under the stairs is the way out
  const nearExit=Math.abs(p.x+p.w/2-EXIT_X)<26&&p.onGround;
  if(o.stolen&&nearExit)officeDone();
  else if(!o.stolen&&nearExit&&o.doorMsgT<=0){o.doorMsgT=3;popups.push({x:EXIT_X,y:GROUND-160,text:'PAS SANS LE VIN!',t:1.4,c:'#ff9a9a'})}
  p.x=clamp(p.x,XB+4,XB+ROOM_W-p.w-4);
}
function officeCaught(why){
  const o=office;if(o.caughtT>0)return;
  o.caughtT=2.2;o.everCaught=true;o.dl.say=why;o.dl.sayT=2.2;o.dl.face=-1;o.steal=0;sfx.boss();shake=.3;
  banner={text:'DULAC T\'A VU!',sub:'On recommence… cache-toi derrière les plantes',t:2,c:'#c8403a'};
}
function updateOfficeFrozen(dt){
  const o=office;
  for(const q of parts){q.life-=dt;q.vy+=(q.g||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt}parts=parts.filter(q=>q.life>0);
  for(const q of popups){q.t-=dt;q.y-=40*dt}popups=popups.filter(q=>q.t>0);
  if(banner){banner.t-=dt;if(banner.t<=0)banner=null}
  shake=Math.max(0,shake-dt);
  if(o.intro>0){o.intro-=dt;if(o.intro<4.2&&(keys.l||keys.r||keys.t||jumpBuf>0||throwReq))o.intro=0;jumpBuf=0;throwReq=false;
    if(o.intro<=0)banner={text:'INTRO : LE BUREAU',sub:'Vole le vin de Dulac sans te faire voir',t:2.4,c:'#2f6f6b'};return}
  o.caughtT-=dt;o.dl.sayT-=dt;
  if(o.caughtT<=0){const p=player,D=o.dl;officeToKitchen();p.inv=0;o.steal=0;o.stealing=false;Object.assign(D,{state:'walkR',st:0,face:1,x:DL_MIN,say:'Bon… où j\'en étais?',sayT:1.6})}
}
function officeDone(){
  if(office.done)return;office.done=true;score+=100;
  showCard('INTRO TERMINÉE · +100','NIVEAU 1<br>BOULEVARD SAINT-LAURENT','Michel sort par la porte noire, le pinot de Dulac sous le bras, pis tombe sur le boulevard Saint-Laurent, devant Ribotti Vintage. Direction le dépanneur pour des bières. Évite les passants, pis passe par les toits. Le soir, méfie-toi des portes de bars : si tu passes devant, tu rentres. Saute sur la poubelle pis passe par le toit.','JOUER',()=>{startLevel(1);state='play';banner={text:'NIVEAU 1 : VA AU DÉPANNEUR',sub:'E pour lancer une bière',t:2.4,c:'#2f6f6b'}});
}
function drawOffice(){
  const X=x=>Math.round(x-camX);
  ctx.fillStyle='#a86b45';ctx.fillRect(0,0,W,H);
  for(const [r,im,x0] of [[0,ROOMS.studio,0],[1,ROOMS.ground,XB]]){
    const x=X(x0);if(x>W||x+ROOM_W<0||!im.complete)continue;
    ctx.drawImage(im,x,roomY(r),ROOM_W,768*RS);
  }
  // the stairs door upstairs, the black door downstairs
  const o=office;if(!o)return;
  if(o.room===0&&o.atDoor&&!banner){const ax=X(STAIR_X),ay=GROUND-150+Math.sin(t*6)*5;ctx.font='15px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle=INK;const tx=IS_TOUCH?'▼ POUR DESCENDRE':'↓ POUR DESCENDRE';ctx.strokeText(tx,ax,ay);ctx.fillStyle='#ffbf47';ctx.fillText(tx,ax,ay)}
  if(o.stolen){const dx=X(EXIT_X),ay=GROUND-185+Math.sin(t*6)*6;ctx.font='16px "Lilita One", Inter, Arial';ctx.lineWidth=5;ctx.strokeStyle=INK;ctx.textAlign='center';ctx.strokeText('← SORS ICI',dx,ay);ctx.fillStyle='#ffbf47';ctx.fillText('← SORS ICI',dx,ay);
    ctx.strokeStyle='rgba(255,191,71,'+(.5+.4*Math.sin(t*6))+')';ctx.lineWidth=4;ctx.strokeRect(X(BX(527)),roomY(1)+330*RS,58*RS,195*RS)}
}
function drawOfficeActors(){
  const o=office,D=o.dl,X=x=>Math.round(x-camX);
  // fridge (in the picture): a note on it, and the lower door swings open while Michel pulls the wine
  {const fx=X(BX(814)),fw=118*RS,fy=roomY(1)+420*RS,fh=168*RS,open=o.stolen?0:Math.min(1,o.steal*3);
   if(!o.stolen){ctx.save();ctx.translate(X(BX(840)),roomY(1)+372*RS);ctx.rotate(-.06);ctx.fillStyle='#fff3a8';ctx.fillRect(-26,-12,52,24);ctx.strokeStyle='rgba(42,26,22,.4)';ctx.lineWidth=1;ctx.strokeRect(-26,-12,52,24);ctx.font='900 7px Inter, Arial';ctx.fillStyle='#c8403a';ctx.textAlign='center';ctx.fillText('NE PAS TOUCHER',0,-2);ctx.fillText('— DULAC',0,7);ctx.restore()}
   if(open>0){ctx.fillStyle='#cfe9f5';ctx.fillRect(fx,fy,fw,fh);ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.strokeRect(fx,fy,fw,fh);
     for(let k=0;k<3;k++){ctx.fillStyle='#8a9aa3';ctx.fillRect(fx+3,fy+34+k*38,fw-6,3)}
     ctx.fillStyle='#fffaf0';rr(fx+10,fy+10,16,22,3);ctx.fill();ctx.fillStyle='#9fe3a0';rr(fx+40,fy+46,24,20,3);ctx.fill();
     if(!o.stolen){ctx.fillStyle='#6b1d2a';rr(fx+fw-30,fy+88,12,32,3);ctx.fill();ctx.fillRect(fx+fw-27,fy+78,6,12);ctx.fillStyle='#f4ecd6';ctx.fillRect(fx+fw-29,fy+100,10,8)}
     const dw=fw*Math.cos(open*1.25);ctx.fillStyle='#f4f6f7';ctx.fillRect(fx,fy,dw,fh);ctx.strokeRect(fx,fy,Math.max(1,dw),fh)}
   if(o.stealing||(o.steal>0&&!o.stolen)){const bw=90,bx=X(FRIDGE_X)-bw/2,by=roomY(1)+322*RS;ctx.fillStyle='rgba(32,13,56,.85)';pg(bx,by,bw,12,6);ctx.fill();ctx.fillStyle='#ff9ad5';pg(bx,by,Math.max(4,bw*o.steal),12,6);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;pg(bx,by,bw,12,6);ctx.stroke()}}
  // Dulac's line of sight
  const dx=X(D.x);
  if(!o.stolen&&(D.state==='look'||D.state==='walkL'||D.state==='warn')){
    // the cone starts at his eyes and fades with distance
    const a=D.state==='warn'?.22+.16*Math.sin(t*30):.45,ey=GROUND-88;
    const gr=ctx.createLinearGradient(dx,0,dx-580,0);gr.addColorStop(0,`rgba(255,200,60,${a})`);gr.addColorStop(1,`rgba(255,200,60,${a*.35})`);
    ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(dx-8,ey-6);ctx.lineTo(dx-580,ey-95);ctx.lineTo(dx-580,GROUND);ctx.lineTo(dx-8,ey+8);ctx.closePath();ctx.fill();
    ctx.strokeStyle=`rgba(255,170,30,${a})`;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(dx-8,ey-6);ctx.lineTo(dx-580,ey-95);ctx.moveTo(dx-8,ey+8);ctx.lineTo(dx-580,GROUND);ctx.stroke();ctx.setLineDash([]);
  }
  // Dulac
  {const sn=Math.sin(t*1.6),moving=D.state==='walkR'||D.state==='walkL',k=moving?Math.sin(D.walk)*.3:0;
   const call=o.caughtT<=0&&(D.state==='talk'||D.sayT>0);
   // the phone arm: the hand follows a smooth target, the elbow is solved (2-bone IK) so it bends naturally
   const ar=dulacArm(D,call,o.caughtT>0,k);const armR=ar.armR,foreR=ar.foreR;
   let ang={head:{r:sn*.03+(moving?0:Math.sin(t*3)*.04)+(call?.07:0),y:Math.abs(sn)*1.2},legL:k,legR:-k,armL:-k*.8,armR};
   ang.phone={up:1,tilt:call?.25:-.15,lit:!call,s:1.1};
   if(D.state==='warn')ang.head={r:Math.sin(t*22)*.06};
   if(o.caughtT>0)ang.head={r:Math.sin(t*16)*.08};
   ang.ex=o.caughtT>0?{brow:1,mouth:'shout'}:D.state==='warn'?{brow:-1,mouth:'o',open:.7}:(D.state==='look'||D.state==='walkL')?{brow:.45,mouth:'flat',blink:blinkAt(2)}:{brow:-.2,mouth:D.sayT>0?'talk':'smile',blink:blinkAt(2)};
   ang=easeAng(D.av||(D.av={}),ang,6);
   ang.foreR=foreR;ang.armR=armR;
   ctx.save();ctx.translate(dx,GROUND-(moving?Math.abs(Math.sin(D.walk))*2:0));ctx.scale(D.face,1);drawRig(RIGS.dulac,116,ang);
   ctx.restore();
   if(D.state==='warn'){ctx.font='26px "Lilita One", Inter, Arial';ctx.fillStyle='#ffd166';ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.textAlign='center';ctx.strokeText('?',dx,GROUND-128);ctx.fillText('?',dx,GROUND-128)}
   if(o.caughtT>0){ctx.font='30px "Lilita One", Inter, Arial';ctx.fillStyle='#ff5d8f';ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.textAlign='center';ctx.strokeText('!',dx,GROUND-128);ctx.fillText('!',dx,GROUND-128)}
   if(D.sayT>0)bubble(D.say,dx,GROUND-140,o.caughtT>0)}
}
// Dulac's right arm: shoulder → elbow → hand. Targets are in upper-arm lengths from the shoulder.
function dulacArm(D,call,caught,walk){
  const R=RIGS.dulac,up=R.parts.find(p=>p.n==='armR'),fo=R.parts.find(p=>p.n==='foreR');
  if(!up||!fo)return {armR:0,foreR:0};
  if(!D.ik){const sx=up.px,sy=up.py,ex=fo.px,ey=fo.py,hx=fo.x+fo.hand[0],hy=fo.y+fo.hand[1];
    D.ik={sx,sy,L1:Math.hypot(ex-sx,ey-sy),L2:Math.hypot(hx-ex,hy-ey),r1:Math.atan2(ey-sy,ex-sx),r2:Math.atan2(hy-ey,hx-ex),blend:0,cb:0,tx:0,ty:2}}
  const K=D.ik,dt=frameDt;
  // blend toward the ear (call) or the belly (reading the phone), slowly and smoothly
  K.blend+=((call?1:0)-K.blend)*(1-Math.exp(-dt*3.2));K.cb+=((caught?1:0)-K.cb)*(1-Math.exp(-dt*6));
  const e=K.blend*K.blend*(3-2*K.blend);
  // belly: thumbs scrolling; ear: little talking gestures drawn as loops
  const bx=-.55+Math.sin(t*1.1)*.05,by=1.28+Math.sin(t*2.2)*.035+walk*.15;
  const cx=.8+Math.sin(t*1.7)*.07+Math.sin(t*.6)*.04,cy=-1.72+Math.cos(t*1.7)*.06;
  // on the way up the hand swings outward, so the path is a curve, not a straight line
  const arc=Math.sin(Math.PI*e)*.55;
  let gx=bx+(cx-bx)*e+arc,gy=by+(cy-by)*e;
  if(K.cb>0){gx+=(.15+Math.sin(t*15)*.12-gx)*K.cb;gy+=(1.9-gy)*K.cb}
  K.tx+=(gx-K.tx)*(1-Math.exp(-dt*9));K.ty+=(gy-K.ty)*(1-Math.exp(-dt*9));
  const L1=K.L1,L2=K.L2;let dx=K.tx*L1,dy=K.ty*L1,d=Math.hypot(dx,dy);
  d=clamp(d,Math.abs(L1-L2)+1,L1+L2-1);const th=Math.atan2(dy,dx);
  const c1=clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1);
  // two possible elbows: keep the one sticking out to the side (larger x)
  const a1=th-Math.acos(c1),a2=th+Math.acos(c1),a=Math.cos(a1)>Math.cos(a2)?a1:a2;
  const exx=Math.cos(a)*L1,eyy=Math.sin(a)*L1,b=Math.atan2(Math.sin(th)*d-eyy,Math.cos(th)*d-exx);
  return {armR:a-K.r1,foreR:(b-K.r2)-(a-K.r1)};
}
function drawOfficeFront(){
  const o=office,X=x=>Math.round(x-camX);
  // the plants Michel hides behind
  PLANTS.forEach((PX,i)=>{const px=X(PX),P=PLANT_IM[i%PLANT_IM.length],ph=i?165:180,pw=ph*P.ar,sw=Math.sin(t*1.3+i)*.025+(o.hidden&&Math.abs(player.x+player.w/2-PX)<38&&Math.abs(player.vx)>10?Math.sin(t*18)*.04:0);
   if(P.im.complete){ctx.save();ctx.translate(px,GROUND+4);ctx.rotate(sw);ctx.drawImage(P.im,-pw/2,-ph,pw,ph);ctx.restore()}
   if(o.hidden&&Math.abs(player.x+player.w/2-PX)<38){ctx.font='900 12px Inter, Arial';ctx.fillStyle='#9fe3a0';ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.textAlign='center';ctx.strokeText('CACHÉ',px,GROUND-180);ctx.fillText('CACHÉ',px,GROUND-180)}});
  // tutorial hints, in the room
  const hint=(x,y,txt,show)=>{if(!show||banner)return;const sx=X(x),yy=y+Math.sin(t*4)*3;ctx.font='14px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle=INK;ctx.strokeText(txt,sx,yy);ctx.fillStyle='#fff4dc';ctx.fillText(txt,sx,yy)};
  const p=player,px=p.x+p.w/2;
  hint(AX(260),140,IS_TOUCH?'◀ ▶ POUR MARCHER':'← → POUR MARCHER',o.room===0&&px<AX(420));
  hint(AX(560),230,IS_TOUCH?'▲ POUR SAUTER SUR LES BUREAUX':'ESPACE POUR SAUTER SUR LES BUREAUX',o.room===0&&px>AX(380)&&px<AX(880));
  hint(AX(1012),120,'LA PORTE À DROITE MÈNE EN BAS',o.room===0&&px>AX(820)&&!o.atDoor);
  hint(BX(520),150,'CACHE-TOI DERRIÈRE LES PLANTES',o.room===1&&px<BX(700)&&!o.stolen);
  hint(FRIDGE_X-20,215,IS_TOUCH?'TIENS VOLER QUAND DULAC A LE DOS TOURNÉ':'TIENS E QUAND DULAC A LE DOS TOURNÉ',o.room===1&&px>BX(650)&&!o.stolen);
}
function drawPhoneIntro(){
  const o=office,a=clamp(o.intro*2,0,1),k=clamp((5-o.intro)*3,0,1);
  ctx.save();ctx.globalAlpha=a;
  ctx.fillStyle='rgba(10,12,24,.88)';ctx.fillRect(0,0,W,H);
  const px=W/2-120,py=60+(1-k)*80;
  ctx.fillStyle='#1d1f2b';rr(px,py,240,420,30);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle='#f4ecd6';rr(px+12,py+40,216,340,10);ctx.fill();
  ctx.fillStyle='#2b2b2b';rr(px+90,py+14,60,10,5);ctx.fill();
  ctx.font='900 12px Inter, Arial';ctx.fillStyle='#2b3550';ctx.textAlign='center';ctx.fillText('16:30 · VENDREDI',W/2,py+62);
  const msg=(y,who,txt,me)=>{ctx.font='600 13px Inter, Arial';const lines=txt.split('\n');const w=Math.max(...lines.map(l=>ctx.measureText(l).width))+20;const x=me?px+216-w:px+22;
    ctx.fillStyle=me?'#5ee0ff':'#ffffff';rr(x,y,w,lines.length*17+12,10);ctx.fill();ctx.strokeStyle='rgba(42,26,22,.3)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle='#2b2b2b';ctx.textAlign='left';lines.forEach((l,i)=>ctx.fillText(l,x+10,y+18+i*17));
    if(who){ctx.font='900 10px Inter, Arial';ctx.fillStyle='#8c8aa0';ctx.fillText(who,x+2,y-4)}};
  if(o.intro<4.6)msg(py+90,'LD','5 à 7 chez Ginette ce soir 🍻');
  if(o.intro<3.8)msg(py+150,'LD','apporte de quoi boire!!');
  if(o.intro<3)msg(py+204,'','Y\'a le pinot de Dulac\ndans le frigo…',true);
  if(o.intro<2.2)msg(py+270,'LD','GO 😎');
  ctx.font='900 12px Inter, Arial';ctx.fillStyle='#fff4dc';ctx.textAlign='center';ctx.fillText(o.intro<4.2?'APPUIE SUR UNE TOUCHE':'',W/2,py+404);
  ctx.restore();
  // phone buzz
  if(o.intro>4.4&&Math.random()<.3)beep(140,120,.05,'square',.03);
}

// ---------- registre ----------
defineLevel({
  id:'office', n:1,
  name:'LE STUDIO', stage:'Bureau', chapter:'Le studio',
  dev:'Le studio', devTitle:'LE STUDIO',
  track:'a', hour:()=>17.02,
  place:()=>'Au studio',
  start:setupOffice,
  canPause:()=>!(office&&office.intro>0),
  frozen:dt=>{if(office&&(office.intro>0||office.caughtT>0)){updateOfficeFrozen(dt);return true}return false},
  scene:drawOffice, night:0,
  pad:()=>office&&(office.intro>0||office.caughtT>0)?'none':'office',
  keys:[['← →','marcher'],['ESPACE','sauter'],['↓','escalier'],['TIENS E','voler le vin']],
  tuto:{from:'LD',av:'#c98a3b',msgs:['Yo! 5 à 7 chez Ginette ce soir 🍻','>C\'est bon, j\'arrive! J\'vais au dép avant 🍺'],tips:[['← →','marcher'],['ESPACE','sauter'],['↓','prendre l\'escalier (porte à droite)'],['TIENS E','voler le vin quand Dulac a le dos tourné'],['PLANTES','cache-toi quand Dulac revient vers toi']]},
  story:'17 h : la journée est faite, LD attend Michel pour la soirée. Descends par la porte à droite, faufile-toi dans la cuisine, vole le pinot de Dulac dans le frigo, pis sors par la porte noire.',
  ctrl:[...CTRL_MOVE,['Prendre l\'escalier','↓ · S','CROIX ↓'],['Voler le vin','tiens E','tiens B']],
});
