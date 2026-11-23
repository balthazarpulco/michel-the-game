// Niveau « bike » : retour en skate, vu de dos.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- level 3: back home on a skateboard, seen from behind ----------
const BIKE_LEN=900;                       // metres to Michel's door
const SK={HZ:206,CAMH:620,PD:2.4,RU:330,FAR:64};
const AIR=.62;
const TRICKS={l:{n:'KICKFLIP',d:.32,p:100},r:{n:'SHOVE-IT',d:.32,p:100},j:{n:'360 FLIP',d:.46,p:200},d:{n:'GRAB',d:.36,p:80}};
const SK_LANE=[-1.5,-.5,.5,1.5];
const SKCAR=[{body:'#a5d6c4',dark:'#7fb3a1',kind:'teal'},{body:'#c0605c',dark:'#9a4744',kind:'pickup'},{body:'#ee7a72',dark:'#c95a54',kind:'ticoq'}];
let bike=null,geleNext=false;
const HB=ASSETS.heroBack;HB.im=mkImg(HB.img);
function setupBike(){
  camX=0;genDone=true;
  bike={z:0,speed:14,lane:2,lx:.5,air:0,airMax:AIR,ents:[],spawnT:1.2,obsT:2.2,itemT:.6,rampT:7,done:false,doneT:0,drift:4,inv:0,push:0,lean:0,
    trick:null,airTricks:[],combo:1,comboT:0,style:0,gele:geleNext?12:0,last:'',land:0,crashT:0};
  geleNext=false;
  if(bike.gele>0)banner={text:'T\'ES GELÉ',sub:'Tout est au ralenti pendant 12 s',t:2.2,c:'#6b4fa0'};
}
function bikeLane(d){const b=bike;if(!b||b.done)return;const n=clamp(b.lane+d,0,3);if(n!==b.lane){b.lane=n;beep(520,700,.05,'triangle',.04)}}
function bikeHop(big){
  const b=bike;if(!b||b.done||b.air>0)return;
  b.airMax=big?1.15:AIR;b.air=b.airMax;b.airTricks=[];b.trick=null;beep(240,520,.1,'square',.05);
}
// arrows while airborne start a trick
function skateKey(k){
  const b=bike;if(!b||b.done||b.air<=0)return false;
  if(b.trick)return true;
  const T=TRICKS[k];b.trick={k,n:T.n,d:T.d,t:0,p:T.p};beep(600,900,.06,'triangle',.05);
  return true;
}
function bikeCrash(why){
  const b=bike;if(b.inv>0||godMode){b.trick=null;return}
  lives--;sfx.hurt();shake=.4;b.inv=1.6;b.speed=6;b.trick=null;b.airTricks=[];b.combo=1;b.air=0;b.crashT=.6;
  popups.push({x:W/2,y:300,text:'OUCH!',t:1,c:'#ff5d8f',scr:true});
  banner={text:why,t:1.6};
  if(lives<=0)gameOver(why);
}
function bankTricks(){
  const b=bike;if(!b.airTricks.length)return;
  const pts=b.airTricks.reduce((s,x)=>s+x.p,0)*b.combo;
  score+=pts;b.style=Math.min(1,b.style+pts/1600);
  popups.push({x:W/2,y:250,text:b.airTricks.map(x=>x.n).join(' + ')+(b.combo>1?' ×'+b.combo:'')+' · +'+pts,t:1.3,c:'#9fe3a0',scr:true});
  b.combo=Math.min(8,b.combo+1);b.comboT=2.6;if(b.combo>=5)award('tony');b.airTricks=[];sfx.cig();
  if(b.style>=1){b.style=0;lives=Math.min(MAXL,lives+1);popups.push({x:W/2,y:210,text:'STYLE MAX · +1 VIE',t:1.6,c:'#ff9ad5',scr:true})}
}
function skSpawn(kind,lane,extra){const b=bike;b.ents.push(Object.assign({kind,lane,z:b.z+SK.FAR},extra||{}))}
function updateBike(dt){
  const b=bike,d=drunk();
  if(b.gele>0){b.gele-=dt;dt*=.62}
  for(const q of parts){q.life-=dt;q.vy+=(q.g||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt}parts=parts.filter(q=>q.life>0);
  for(const q of popups){q.t-=dt;q.y-=40*dt}popups=popups.filter(q=>q.t>0);
  if(banner){banner.t-=dt;if(banner.t<=0)banner=null}
  shake=Math.max(0,shake-dt);b.inv=Math.max(0,b.inv-dt);b.land=Math.max(0,b.land-dt);b.crashT=Math.max(0,b.crashT-dt);
  const onGround=b.air<=0;
  const target=b.done?0:onGround?(keys.j?21:keys.d?8:14):b.speed;
  b.speed+=clamp(target-b.speed,-14*dt,9*dt);
  if(onGround&&keys.j)b.push+=dt*8;
  b.z+=b.speed*dt;camX=b.z*10;player.x=camX;
  // smooth lane change: eased glide, the lean follows the movement
  const tx=SK_LANE[b.lane],plx=b.lx;b.lx+=(tx-b.lx)*(1-Math.exp(-dt*7.5));const vlx=(b.lx-plx)/Math.max(dt,1e-3);b.lean+=(clamp(vlx*.09,-.38,.38)-b.lean)*(1-Math.exp(-dt*10));
  // tricks in the air
  if(b.trick){b.trick.t+=dt;if(b.trick.t>=b.trick.d){b.airTricks.push(b.trick);b.trick=null}}
  if(b.air>0){b.air-=dt;if(b.air<=0){b.air=0;b.land=.15;if(b.trick)bikeCrash('T\'AS MANQUÉ TA RÉCEPTION');else{bankTricks();shake=.06}}}
  if(onGround){b.comboT-=dt;if(b.comboT<=0&&b.combo>1)b.combo=1}
  if(b.done){b.doneT+=dt;if(b.doneT>1.4&&state==='play'){score+=800;
    showCard('ARRIVÉ · +800','NIVEAU 4<br>CHEZ MICHEL','3 h du matin. Ta blonde dort. Rentre jusqu\'à ton lit sans rien faire tomber, sans courir et sans croiser le chien. Un bruit de trop et elle se réveille.','SUR LA POINTE DES PIEDS',()=>{startLevel(3);state='play'})}return}
  if(b.z>=BIKE_LEN){b.done=true;if(run.lvLost===0)award('skate');banner={text:'MICHEL EST ARRIVÉ',sub:'Il range le skate… dans le bac de recyclage',t:1.6,c:'#2f6f6b'};return}
  if(d>.3&&onGround){b.drift-=dt;if(b.drift<=0){b.drift=rnd(2.5,5)/d;bikeLane(b.lane===0?1:b.lane===3?-1:pick([-1,1]));popups.push({x:W/2,y:300,text:'OUPS!',t:.8,c:'#fff4dc',scr:true})}}
  // spawning far ahead
  const prog=b.z/BIKE_LEN,far=b.z+SK.FAR;
  const free=(lane,gap)=>!b.ents.some(e=>e.lane===lane&&Math.abs(e.z-far)<gap);
  b.spawnT-=dt;
  if(b.spawnT<=0){b.spawnT=(rnd(.9,1.6)-prog*.4)*DF.skGap;const lane=Math.floor(Math.random()*4);
    if(free(lane,14)){const onc=lane<2;skSpawn('car',lane,{v:onc?-rnd(9,13):rnd(5,8),c:pick(SKCAR)})}}
  b.obsT-=dt;
  if(b.obsT<=0){b.obsT=(rnd(1.2,2.3)-prog*.5)*DF.skGap;const lane=Math.floor(Math.random()*4);
    if(free(lane,8))skSpawn(pick(['cone','cone','hole','bar']),lane,{img:pick(['cone_tall','cone_small','cone_dirty','cone_sign']),bimg:pick(['bar_stripe','bar_water','bar_jersey','bar_horse'])})}
  b.rampT-=dt;
  if(b.rampT<=0){b.rampT=rnd(6,10);const lane=2+Math.floor(Math.random()*2);if(free(lane,10)){skSpawn('ramp',lane);for(let k=1;k<4;k++)b.ents.push({kind:'item',lane,z:far+3+k*2.2,type:k===3&&Math.random()<.4?'rb':'cig',high:true})}}
  b.itemT-=dt;
  if(b.itemT<=0){b.itemT=rnd(.5,1);const lane=Math.floor(Math.random()*4),r=Math.random();
    if(free(lane,4)){const n=r>.6?3:1;for(let k=0;k<n;k++)b.ents.push({kind:'item',lane,z:far+k*2,type:r<.05?'rb':r<.32?'beer':'cig'})}}
  // move cars, resolve what reaches Michel
  for(const e of b.ents){
    if(e.kind==='car')e.z+=e.v*dt;
    const dz=e.z-b.z;
    if(!e.done&&dz<=SK.PD+.25){
      e.done=true;
      const hitLane=Math.abs(b.lx-SK_LANE[e.lane])<.58,air=b.air>0;
      if(!hitLane)continue;
      if(e.kind==='car')bikeCrash(e.v<0?'UN CHAR EN PLEINE FACE':'T\'AS EMBOUTI UN CHAR');
      else if(e.kind==='ramp'){if(!air){bikeHop(true);popups.push({x:W/2,y:270,text:'RAMPE! FAIS DES FIGURES',t:1.2,c:'#5ee0ff',scr:true})}}
      else if(e.kind==='item'){
        if(e.high&&!air)continue;
        if(e.type==='cig'){cigs++;score+=10;sfx.cig();if(cigs%10===0){lives=Math.min(MAXL,lives+1);popups.push({x:W/2,y:260,text:'10 CLOPES · +1 VIE!',t:1.4,c:'#ff9ad5',scr:true})}}
        else if(e.type==='rb'){lives=Math.min(MAXL,lives+3);score+=100;sfx.beer();popups.push({x:W/2,y:260,text:'+3 VIES!',t:1.4,c:'#5ee0ff',scr:true})}
        else{beers++;ammo++;score+=25;sfx.beer()}
        e.gone=true;
      }
      else if(air){score+=20;popups.push({x:W/2,y:300,text:'OLLIE +20',t:.7,c:'#fff4dc',scr:true})}
      else bikeCrash(e.kind==='hole'?'NID-DE-POULE!':e.kind==='bar'?'T\'AS FONCÉ DANS UNE BARRIÈRE':'T\'AS FONCÉ DANS UN CÔNE');
    }
  }
  b.ents=b.ents.filter(e=>!e.gone&&e.z-b.z>.7&&e.z-b.z<SK.FAR+30);
}
// projection: lateral x (road units) and height h (road units) at depth dz
function skP(x,h,dz){const s=1/dz,cl=bike.lx*.55;return {x:W/2+(x-cl)*SK.RU*s,y:SK.HZ+(SK.CAMH-h*SK.RU)*s,s:SK.RU*s}}
function drawSkCar(e,dz,n){
  const c=e.c,P=skP(SK_LANE[e.lane],0,dz),u=P.s,w=.86*u,hb=.42*u,hc=.3*u,x=P.x,y=P.y,onc=e.v<0;
  const lw=Math.max(1,u*.012);ctx.strokeStyle=INK;ctx.lineWidth=lw;
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x,y,w*.55,u*.05,0,0,7);ctx.fill();
  ctx.fillStyle='#2a2730';rr(x-w*.46,y-u*.12,w*.18,u*.12,lw*2);ctx.fill();rr(x+w*.28,y-u*.12,w*.18,u*.12,lw*2);ctx.fill();
  const top=c.kind==='pickup'?y-hb-hc*1.25:y-hb-hc;
  ctx.fillStyle=c.body;ctx.beginPath();ctx.moveTo(x-w*.36,y-hb);ctx.lineTo(x-w*.3,top);ctx.lineTo(x+w*.3,top);ctx.lineTo(x+w*.36,y-hb);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#3a4a5c';ctx.beginPath();ctx.moveTo(x-w*.3,y-hb-hc*.12);ctx.lineTo(x-w*.26,top+hc*.18);ctx.lineTo(x+w*.26,top+hc*.18);ctx.lineTo(x+w*.3,y-hb-hc*.12);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(x-w*.2,top+hc*.25,w*.06,hc*.5);
  ctx.fillStyle=c.body;rr(x-w*.5,y-hb-u*.02,w,hb,u*.06);ctx.fill();ctx.stroke();
  ctx.fillStyle=c.dark;ctx.fillRect(x-w*.5+lw,y-hb*.42,w-lw*2,hb*.18);
  ctx.fillStyle='#d9d2c3';rr(x-w*.5,y-hb*.22,w,hb*.2,u*.02);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fffaf0';rr(x-w*.09,y-hb*.62,w*.18,hb*.2,lw);ctx.fill();ctx.stroke();
  const lc=onc?'#fff3c4':'#ff4a4a';ctx.fillStyle=lc;
  rr(x-w*.46,y-hb*.82,w*.17,hb*.22,lw*2);ctx.fill();ctx.stroke();rr(x+w*.29,y-hb*.82,w*.17,hb*.22,lw*2);ctx.fill();ctx.stroke();
  if(c.kind==='ticoq'){ctx.fillStyle='#f6c64b';ctx.beginPath();ctx.arc(x,top-u*.06,u*.06,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#e8603c';ctx.beginPath();ctx.moveTo(x-u*.03,top-u*.11);ctx.lineTo(x,top-u*.17);ctx.lineTo(x+u*.03,top-u*.11);ctx.fill()}
  if(c.kind==='pickup'){ctx.fillStyle='#a8743f';ctx.fillRect(x-w*.42,top-u*.05,w*.84,u*.04);ctx.strokeRect(x-w*.42,top-u*.05,w*.84,u*.04)}
  if(n>.05){lights.push({k:onc?'headsk':'tail',x:x-w*.37,y:y-hb*.71,r:u*.22});lights.push({k:onc?'headsk':'tail',x:x+w*.37,y:y-hb*.71,r:u*.22})}
}
function drawSkEnt(e,dz,n){
  const P=skP(SK_LANE[e.lane],0,dz),u=P.s;
  if(e.kind==='car')return drawSkCar(e,dz,n);
  if(e.kind==='hole'){ctx.fillStyle='#1c1a22';ctx.beginPath();ctx.ellipse(P.x,P.y,u*.34,u*.07,0,0,7);ctx.fill();ctx.strokeStyle='#6b6573';ctx.lineWidth=Math.max(1,u*.012);ctx.stroke();return}
  if(e.kind==='ramp'){const w=.8*u,h=.3*u;ctx.fillStyle='#a8743f';ctx.strokeStyle=INK;ctx.lineWidth=Math.max(1,u*.012);
    ctx.beginPath();ctx.moveTo(P.x-w/2,P.y);ctx.lineTo(P.x+w/2,P.y);ctx.lineTo(P.x+w*.42,P.y-h);ctx.lineTo(P.x-w*.42,P.y-h);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffd166';for(let i=0;i<3;i++)ctx.fillRect(P.x-w*.3+i*w*.24,P.y-h*.62,w*.12,h*.2);return}
  if(e.kind==='item'){const h=e.high?.95:.32,Q=skP(SK_LANE[e.lane],h+Math.sin(t*4+e.z)*.03,dz),sz=Q.s*.32;
    ctx.save();ctx.translate(Q.x,Q.y);const k=sz/40;ctx.scale(k,k);
    ctx.fillStyle='rgba(255,220,140,.3)';ctx.beginPath();ctx.arc(0,0,26,0,7);ctx.fill();
    if(e.type==='cig'){ctx.rotate(-.35);ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.fillStyle='#fffaf0';rr(-15,-4,22,8,2);ctx.fill();ctx.stroke();ctx.fillStyle='#e0892f';rr(5,-4,10,8,2);ctx.fill();ctx.stroke()}
    else if(e.type==='rb'){ctx.fillStyle='#2f6fb3';ctx.strokeStyle=INK;ctx.lineWidth=2.5;rr(-9,-17,18,34,4);ctx.fill();ctx.stroke();ctx.fillStyle='#ffd166';ctx.fillRect(-9,-4,18,8)}
    else bottleShape();
    ctx.restore();if(n>.05)lights.push({k:'glow',x:Q.x,y:Q.y,r:sz*.9});return}
  const D=DECO[e.kind==='bar'?e.bimg:e.img],h=(e.kind==='bar'?.42:.48)*u,w=h*D.ar;if(D.im.complete)ctx.drawImage(D.im,P.x-w/2,P.y+u*.02-h,w,h);
}
function drawBoardBack(x,y,u,b){
  // the deck seen from behind: a dark slab and two wheels
  const tr=b.trick;let rot=b.lean*.5,sx=1,sy=1,dy=0;
  if(tr){const q=tr.t/tr.d;if(tr.k==='l'){rot+=q*Math.PI*2}else if(tr.k==='r'){sx=Math.cos(q*Math.PI*2)}else if(tr.k==='j'){rot+=q*Math.PI*2;sx=Math.cos(q*Math.PI*2)}else{dy=-u*.06}}
  ctx.save();ctx.translate(x,y+dy);ctx.rotate(rot);ctx.scale(sx,sy);
  ctx.fillStyle='#f4ecd6';ctx.strokeStyle=INK;ctx.lineWidth=2;
  for(const s of [-1,1]){rr(s*u*.2-u*.035,-u*.02,u*.07,u*.06,u*.02);ctx.fill();ctx.stroke()}
  ctx.fillStyle='#8a8f96';ctx.fillRect(-u*.22,-u*.035,u*.44,u*.02);
  ctx.fillStyle=tr&&tr.k==='l'&&Math.cos(tr.t/tr.d*Math.PI*2)<0?'#e76f51':'#2b2b2b';rr(-u*.3,-u*.07,u*.6,u*.04,u*.02);ctx.fill();ctx.stroke();
  ctx.restore();
}
function drawSkRider(b,n){
  const P=skP(b.lx,0,SK.PD),u=P.s,air=b.air>0,ph=air?1-b.air/b.airMax:0,hop=air?Math.sin(Math.PI*ph)*(b.airMax>AIR?1.2:.62)*u:0;
  if(b.inv>0&&Math.floor(b.inv*14)%2===0)return;
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(P.x,P.y,u*.34*(1-.4*Math.sin(Math.PI*ph)),u*.06,0,0,7);ctx.fill();
  const by=P.y-u*.06-hop;
  drawBoardBack(P.x,by,u,b);
  const H=1.18*u,w=H*HB.ar,crouch=b.land>0?.9:air?(b.trick&&b.trick.k==='d'?.82:.94):1,bob=!air&&keys.j?Math.abs(Math.sin(b.push))*u*.03:0;
  ctx.save();ctx.translate(P.x,by-u*.06+bob);ctx.rotate(b.lean+(b.crashT>0?Math.sin(t*30)*.12:0)+(drunk()>.3?Math.sin(t*2.4)*.05:0));
  if(b.trick&&b.trick.k==='j')ctx.rotate(Math.sin(b.trick.t/b.trick.d*Math.PI)*.25);
  ctx.scale(1,crouch);if(HB.im.complete)ctx.drawImage(HB.im,-w/2,-H,w,H);ctx.restore();
}
// street pictures as walls: thin vertical slices, each scaled for its depth
const SKW=5.2,SK_STREET=[0,1].map(i=>{const A=ASSETS.streets['street'+i];return {im:mkImg(A.img),w:A.w,h:A.h,L:30}});
function skWalls(b){
  for(const side of [-1,1]){
    const S=SK_STREET[side<0?0:1];if(!S.im.complete)continue;const Hm=S.L*S.h/S.w,off=side<0?0:13;
    // near to far slices, drawn far first
    const sl=[];let z=b.z+.7;
    while(z<b.z+SK.FAR){const d=z-b.z;let st=Math.max(.05,d*.05);const zz=z+off,u0=((zz%S.L)+S.L)%S.L;if(u0+st>S.L)st=S.L-u0;sl.push([z,st,u0]);z+=st}
    for(let i=sl.length-1;i>=0;i--){const [z0,st,u0]=sl[i],d0=z0-b.z,d1=d0+st,dm=d0+st/2;
      const A=skP(side*SKW,0,d0),B=skP(side*SKW,0,d1),T=skP(side*SKW,Hm,dm),Bm=skP(side*SKW,0,dm);
      const xa=Math.min(A.x,B.x),xb=Math.max(A.x,B.x)+.6;
      let su=u0/S.L*S.w,sw=st/S.L*S.w;if(side>0)su=S.w-su-sw;
      const fog=clamp((d0-(SK.FAR-18))/18,0,1);if(fog>=1)continue;if(fog>0)ctx.globalAlpha=1-fog;
      // right side: the picture runs the other way, so it reads correctly as the street recedes
      ctx.drawImage(S.im,su,0,Math.max(.5,sw),S.h,xa,T.y,xb-xa,Bm.y-T.y);ctx.globalAlpha=1}
  }
}
function drawBikeLevel(){
  const b=bike,n=.45;lights=[];
  ctx.save();
  if(shake>0)ctx.translate(rnd(-5,5)*shake*3,rnd(-5,5)*shake*3);
  const HZ=SK.HZ,cl=b.lx*.55;
  // skyline over the horizon
  {const img=BGS.night,w=1100,h=614;if(img.complete)ctx.drawImage(img,W/2-w/2-cl*30,HZ-h*.78,w,h)}
  ctx.fillStyle='#55505c';ctx.fillRect(0,HZ,W,H-HZ);
  // road made of 3 m slices, far to near
  const seg=3,first=Math.floor((b.z+SK.FAR)/seg),last=Math.ceil((b.z+SK.PD*.45)/seg);
  for(let k=first;k>=last;k--){
    const z0=k*seg,z1=(k+1)*seg,d0=Math.max(.5,z0-b.z),d1=z1-b.z;if(d1<=.5)continue;
    const A=skP(0,0,d0),B=skP(0,0,d1),odd=k%2===0;
    const ed=(x,P,d)=>W/2+(x-cl)*SK.RU/d;
    const quad=(xa,xb,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(ed(xa,A,d0),A.y);ctx.lineTo(ed(xb,A,d0),A.y);ctx.lineTo(ed(xb,B,d1),B.y);ctx.lineTo(ed(xa,B,d1),B.y);ctx.closePath();ctx.fill()};
    quad(-SKW,-2.25,odd?'#a39c90':'#99928a');quad(2.25,SKW,odd?'#a39c90':'#99928a');
    quad(-2.25,-2.05,odd?'#e8e1d3':'#c8403a');quad(2.05,2.25,odd?'#e8e1d3':'#c8403a');
    quad(-2.05,2.05,odd?'#4f4b56':'#4a4651');
    quad(-.04,-.01,'#e9c46a');quad(.01,.04,'#e9c46a');
    if(odd){quad(-1.02,-.98,'#e8e1d3');quad(.98,1.02,'#e8e1d3')}
  }
  // the street fronts, as walls in perspective on both sides, scrolling with the ride
  skWalls(b);
  // roadside: lamps and trees
  const props=[];
  for(let z=Math.ceil(b.z/16)*16;z<b.z+SK.FAR;z+=16){for(const s of [-1,1])props.push({z,kind:'lamp',x:s*2.6,s})}
  for(let z=Math.ceil((b.z+5)/11)*11-5;z<b.z+SK.FAR;z+=11){for(const s of [-1,1])props.push({z:z+(s>0?4:0),kind:'tree',x:s*3.6})}
  const all=[];
  for(const p of props){const dz=p.z-b.z;if(dz>.8)all.push({dz,f:()=>{
    if(p.kind==='lamp'){const B=skP(p.x,0,dz),T=skP(p.x,3.2,dz),u=B.s;ctx.strokeStyle='#2f3a3f';ctx.lineWidth=Math.max(1,u*.05);ctx.beginPath();ctx.moveTo(B.x,B.y);ctx.lineTo(T.x,T.y);ctx.lineTo(T.x-p.s*u*.45,T.y);ctx.stroke();
      ctx.fillStyle='#fff1b8';ctx.beginPath();ctx.ellipse(T.x-p.s*u*.45,T.y+u*.04,u*.12,u*.05,0,0,7);ctx.fill();lights.push({k:'skl',x:T.x-p.s*u*.45,y:T.y+u*.06,r:u*.9})}
    else{const D=DECO.tree_maple,B=skP(p.x,0,dz),h=2.2*B.s,w=h*D.ar;if(D.im.complete)ctx.drawImage(D.im,B.x-w/2,B.y-h,w,h)}}})}
  for(const e of b.ents){const dz=e.z-b.z;all.push({dz,f:()=>drawSkEnt(e,dz,n)})}
  all.push({dz:SK.PD-.01,f:()=>drawSkRider(b,n)});
  all.sort((a,c)=>c.dz-a.dz).forEach(o=>{
    const fog=clamp((o.dz-(SK.FAR-18))/18,0,1);if(fog>0)ctx.globalAlpha=1-fog;o.f();ctx.globalAlpha=1});
  // the door at the end
  {const dz=BIKE_LEN+6-b.z;if(dz<SK.FAR&&dz>.8){const B=skP(3.4,0,dz),u=B.s;ctx.fillStyle='#b5553c';ctx.fillRect(B.x-u*.2,B.y-u*3,u*2.6,u*3);ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.strokeRect(B.x-u*.2,B.y-u*3,u*2.6,u*3);ctx.fillStyle='#2f6f6b';ctx.fillRect(B.x+u*.3,B.y-u*1,u*.5,u);signText('CHEZ MICHEL',B.x+u*1.1,B.y-u*2.6,u*2.2,Math.max(8,u*.26),'#fff4dc')}}
  // night
  ctx.save();ctx.globalCompositeOperation='multiply';ctx.fillStyle=`rgb(${Math.round(lerp(255,70,n))},${Math.round(lerp(255,82,n))},${Math.round(lerp(255,150,n))})`;ctx.fillRect(-20,-20,W+40,H+40);ctx.restore();
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const l of lights){
    if(l.k==='skl'){const g=ctx.createRadialGradient(l.x,l.y,1,l.x,l.y,l.r);g.addColorStop(0,'rgba(255,226,150,.5)');g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(l.x,l.y,l.r,0,7);ctx.fill()}
    else if(l.k==='headsk'){const g=ctx.createRadialGradient(l.x,l.y,1,l.x,l.y,l.r);g.addColorStop(0,'rgba(255,248,210,.9)');g.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(l.x,l.y,l.r,0,7);ctx.fill()}
    else if(l.k==='tail'){const g=ctx.createRadialGradient(l.x,l.y,1,l.x,l.y,l.r*.7);g.addColorStop(0,'rgba(255,60,60,.8)');g.addColorStop(1,'rgba(255,40,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(l.x,l.y,l.r*.7,0,7);ctx.fill()}
    else if(l.k==='glow'){const g=ctx.createRadialGradient(l.x,l.y,1,l.x,l.y,l.r);g.addColorStop(0,'rgba(255,200,110,.5)');g.addColorStop(1,'rgba(255,200,110,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(l.x,l.y,l.r,0,7);ctx.fill()}
  }
  ctx.restore();
  if(b.gele>0){ctx.save();ctx.globalCompositeOperation='overlay';ctx.fillStyle=`rgba(150,90,255,${.25+.1*Math.sin(t*3)})`;ctx.fillRect(0,0,W,H);ctx.restore()}
  for(const q of popups){ctx.globalAlpha=clamp(q.t*2,0,1);ctx.font='18px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.strokeText(q.text,q.x,q.y);ctx.fillStyle=q.c;ctx.fillText(q.text,q.x,q.y);ctx.globalAlpha=1}
  ctx.restore();
  ctx.setTransform(scale,0,0,scale,0,0);
  hud(n);
  const bw=280,mx=W/2-bw/2,pr=clamp(b.z/BIKE_LEN,0,1);
  ctx.fillStyle='rgba(32,13,56,.85)';pg(mx-14,12,bw+28,50);ctx.fill();
  ctx.textAlign='left';ctx.font='900 12px Inter, Arial';ctx.fillStyle='#9fe3a0';ctx.fillText('EN SKATE → CHEZ MICHEL',mx,26);
  ctx.textAlign='right';ctx.font='600 12px Inter, Arial';ctx.fillStyle='#f4e7c8';ctx.fillText(Math.round(b.speed*3.6)+' km/h',mx+bw,26);
  ctx.fillStyle='#3a2a34';pg(mx,33,bw,10);ctx.fill();ctx.fillStyle='#9fe3a0';pg(mx,33,Math.max(4,bw*pr),10);ctx.fill();
  ctx.textAlign='left';ctx.font='900 11px Inter, Arial';ctx.fillStyle='#ff9ad5';ctx.fillText('STYLE',mx,55);
  ctx.fillStyle='#3a2a34';pg(mx+48,50,130,7);ctx.fill();ctx.fillStyle='#ff9ad5';pg(mx+48,50,Math.max(3,130*b.style),7);ctx.fill();
  ctx.textAlign='right';ctx.fillStyle=b.combo>1?'#ffd166':'#8c8aa0';ctx.fillText(b.gele>0?'GELÉ · ×'+b.combo:'COMBO ×'+b.combo,mx+bw,55);
  {ctx.textAlign='center';ctx.font='900 12px Inter, Arial';ctx.fillStyle='#fff4dc';ctx.strokeStyle=INK;ctx.lineWidth=4;
   const s=b.air>0?'← KICKFLIP   → SHOVE-IT   ↑ 360 FLIP   ↓ GRAB':'← → VOIE   ESPACE OLLIE   ↑ POUSSER   ↓ FREINER';ctx.strokeText(s,W/2,H-14);ctx.fillText(s,W/2,H-14)}
  if(banner){
    ctx.globalAlpha=clamp(banner.t*2,0,1);ctx.font='26px "Lilita One", Inter, Arial';const w=Math.min(W-40,ctx.measureText(banner.text).width+50);
    ctx.fillStyle=banner.c||'#c8403a';pg(W/2-w/2,120,w,52);ctx.fill();signText(banner.text,W/2,146,w-30,26,'#fff4dc');
    const sub=banner.sub||(lives>0?`−1 vie · il t'en reste ${lives}`:'Plus de vies');ctx.font='600 14px Inter, Arial';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle=INK;ctx.strokeText(sub,W/2,190);ctx.fillStyle='#fff4dc';ctx.fillText(sub,W/2,190);ctx.globalAlpha=1;
  }
}
