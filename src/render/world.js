// Rendu : fonds, lumières, render / renderBase / renderWorld.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- draw ----------
let lights=[];
const BG_SEQ={1:['office','alley_day','mile','alley_day','mile'],2:['night','alley_dusk','mile','night','alley_dusk']};
function bgFor(k){const s=BG_SEQ[level]||['mile'];if(k<s.length)return BGS[s[Math.max(0,k)]];const loop=s.slice(1);return BGS[loop[(k-s.length)%loop.length]]}
// background tiles overlap and each one fades in over the previous one
const fadeCv=document.createElement('canvas'),fctx=fadeCv.getContext('2d');
function bgTiles(imgAt,w,h,off,y){
  const F=Math.round(w*.22),step=w-F,k0=Math.floor(off/step)-1;
  for(let k=k0;k<k0+4;k++){
    const img=imgAt(k);if(!img||!img.complete||!img.naturalWidth)continue;
    const sx=Math.floor(k*step-off);if(sx>W||sx+w<0)continue;
    const iw=img.naturalWidth,ih=img.naturalHeight,fr=F/w*iw;
    ctx.drawImage(img,fr,0,iw-fr,ih,sx+F,y,w-F+1,h);
    // perf: the faded left edge of each picture is made once and reused
    if(!img.fade||img.fadeF!==fr){const c=document.createElement('canvas'),cw=Math.max(1,Math.ceil(fr)),ch=ih;c.width=cw;c.height=ch;const g=c.getContext('2d');
      g.drawImage(img,0,0,fr,ih,0,0,cw,ch);g.globalCompositeOperation='destination-in';const gr=g.createLinearGradient(0,0,cw,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=gr;g.fillRect(0,0,cw,ch);img.fade=c;img.fadeF=fr}
    ctx.drawImage(img.fade,sx,y,F+1,h);
  }
}
function drawBG(n){
  const h=GROUND+30,w=h*1100/614;
  bgTiles(bgFor,w,h,camX*BGP,-20);
  // haze so the playable layer reads in front
  ctx.fillStyle=`rgba(${Math.round(lerp(250,30,n))},${Math.round(lerp(232,34,n))},${Math.round(lerp(205,70,n))},${lerp(.32,.25,n)})`;
  ctx.fillRect(0,0,W,GROUND);
}
function drawLights(n,only){
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const l of lights){
    if(l.k==='win'){ctx.globalAlpha=n;ctx.fillStyle='#ffc865';ctx.fillRect(l.x,l.y,l.w,l.h);ctx.globalAlpha=n*.35;ctx.fillStyle='#ff9a3c';ctx.fillRect(l.x-6,l.y-6,l.w+12,l.h+12)}
    else if(l.k==='moon'){ctx.globalAlpha=.35;ctx.fillStyle='#6f8fd8';ctx.fillRect(l.x,l.y,l.w,l.h);ctx.globalAlpha=.1;ctx.fillStyle='#9fb8ff';ctx.beginPath();ctx.moveTo(l.x,l.y+l.h);ctx.lineTo(l.x+l.w,l.y+l.h);ctx.lineTo(l.x+l.w+90,GROUND+20);ctx.lineTo(l.x+40,GROUND+20);ctx.closePath();ctx.fill()}
    else if(l.k==='shop'){ctx.globalAlpha=n*.7;ctx.fillStyle=l.warm?'#ffb456':'#cfe8ff';ctx.fillRect(l.x,l.y,l.w,l.h)}
    else if(l.k==='lamp'){
      const g=ctx.createRadialGradient(l.x,l.y,2,l.x,l.y,110);g.addColorStop(0,`rgba(255,226,150,${.9*n})`);g.addColorStop(1,'rgba(255,200,120,0)');
      ctx.globalAlpha=1;ctx.fillStyle=g;ctx.beginPath();ctx.arc(l.x,l.y,110,0,7);ctx.fill();
      ctx.globalAlpha=.28*n;ctx.fillStyle='#ffd88a';ctx.beginPath();ctx.moveTo(l.x-14,l.y);ctx.lineTo(l.x+14,l.y);ctx.lineTo(l.x+90,GROUND+30);ctx.lineTo(l.x-90,GROUND+30);ctx.closePath();ctx.fill();
    }else if(l.k==='neon'){
      ctx.globalAlpha=n;ctx.shadowColor=l.col;ctx.shadowBlur=18;signText(l.text,l.x,l.y,l.w,18,l.col);ctx.shadowBlur=0;
    }else if(l.k==='head'){
      ctx.globalAlpha=.35*n;const d=l.dir;const g=ctx.createLinearGradient(l.x,l.y,l.x+d*260,l.y);g.addColorStop(0,'rgba(255,245,200,1)');g.addColorStop(1,'rgba(255,245,200,0)');ctx.fillStyle=g;
      ctx.beginPath();ctx.moveTo(l.x,l.y-5);ctx.lineTo(l.x+d*260,l.y-40);ctx.lineTo(l.x+d*260,l.y+40);ctx.lineTo(l.x,l.y+5);ctx.closePath();ctx.fill();
    }
  }
  // collectibles shine at night
  ctx.globalAlpha=.5*n;
  if(!only)for(const it of items){const x=it.x-camX;if(x<-30||x>W+30)continue;const g=ctx.createRadialGradient(x,it.y,1,x,it.y,26);g.addColorStop(0,'rgba(255,200,110,.9)');g.addColorStop(1,'rgba(255,200,110,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,it.y,26,0,7);ctx.fill()}
  ctx.restore();
}
function render(){
  renderBase();
  if(state==='phone'&&phone)drawPhone();
}
function renderBase(){
  if(level==='dance'){ctx.setTransform(scale,0,0,scale,0,0);drawDance();drawNoise();return}
  if(level==='bike'){ctx.setTransform(scale,0,0,scale,0,0);drawBikeLevel();drawNoise();return}
  if(level==='joint'){ctx.setTransform(scale,0,0,scale,0,0);drawJoint();drawNoise();return}
  if(level==='texto'){ctx.setTransform(scale,0,0,scale,0,0);drawTexto();drawNoise();return}
  if(level==='limo'){ctx.setTransform(scale,0,0,scale,0,0);drawLimo();drawNoise();return}
  if(level==='bj'){ctx.setTransform(scale,0,0,scale,0,0);drawBJ();drawNoise();return}
  if(level==='flip'){ctx.setTransform(scale,0,0,scale,0,0);drawFlip();drawNoise();return}
  renderWorld();drawNoise();
}
function renderWorld(){
  const n=level==='boss'||level==='office'?0:level===3?.82:nightAt(camX+W/2);
  lights=[];
  ctx.setTransform(scale,0,0,scale,0,0);
  if(shake>0)ctx.translate(rnd(-5,5)*shake*3,rnd(-5,5)*shake*3);
  {const dk=drunk();if(dk>0){ctx.translate(W/2,H/2);ctx.rotate(Math.sin(t*.8)*.018*dk);ctx.scale(1+.02*dk,1+.02*dk);ctx.translate(-W/2+Math.sin(t*1.1)*6*dk,-H/2)}}
  if(level==='boss')drawArena();
  else if(level===3)drawHome();
  else if(level==='office')drawOffice();
  else{
  drawBG(n);
  for(const f of facades)drawFacade(f,n);
  if(doorOut&&level===1&&doorOut.t>0){doorOut.t-=frameDt;const k=clamp(doorOut.t/.5,0,1),x=Math.round(doorOut.x-camX);ctx.fillStyle=`rgba(28,22,34,${.9*k})`;ctx.fillRect(x,doorOut.y,doorOut.w*(.3+.7*k),doorOut.h)}
  for(const d of decos)if(!d.front)drawDeco(d);
  for(const lx of lamps)drawLamp(lx,n);
  for(const pl of platforms)drawPlatform(pl,n);
  drawGround(n);
  for(const d of decos)if(d.front)drawDeco(d);
  }
  // first-resto tip
  for(const d of dangers){
    if(!d.hint)continue;const x=d.respawn.x-camX;
    if(x>-100&&x<W){ctx.font='14px "Lilita One", Inter, Arial';ctx.fillStyle='#fffaf0';ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.textAlign='center';
      const ty=GROUND-215+Math.sin(t*4)*4,hx=d.x-camX;ctx.strokeText(d.hintA,hx,ty);ctx.fillText(d.hintA,hx,ty);
      ctx.strokeText(d.hintB,hx,ty+20);ctx.fillText(d.hintB,hx,ty+20);}
  }
  for(const pd of puddles){
    const x=pd.x-camX;if(x>W||x+pd.w<0)continue;
    ctx.save();ctx.globalAlpha=Math.min(1,pd.life/2)*.9;ctx.fillStyle='#b5c24a';ctx.strokeStyle='#6f7d22';ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(x+pd.w/2,GROUND+8,pd.w/2,7,0,0,7);ctx.ellipse(x+pd.w*.3,GROUND+12,pd.w*.22,5,0,0,7);ctx.ellipse(x+pd.w*.75,GROUND+4,pd.w*.18,4,0,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='#e0c35a';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(x+8+((pd.seed*37+i*29)%(pd.w-16)),GROUND+5+(i%3)*3,2,0,7);ctx.fill()}
    ctx.restore();
  }
  for(const c of cans){ctx.save();ctx.translate(c.x-camX,GROUND-9);ctx.rotate(c.r);ctx.fillStyle='#c9ced6';ctx.strokeStyle=INK;ctx.lineWidth=2;rr(-7,-9,14,18,3);ctx.fill();ctx.stroke();ctx.fillStyle='#c8403a';ctx.fillRect(-7,-3,14,6);ctx.restore()}
  for(const it of items)drawItem(it);
  for(const e of enemies)e.type==='bum'?drawBum(e):drawPatron(e,n);
  if(boss)drawBoss();
  if(level===3)drawHomeActors();
  if(level==='office')drawOfficeActors();
  drawPlayer();
  if(level==='office'){drawOfficeFront();if(office&&office.fadeT>0){ctx.fillStyle=`rgba(0,0,0,${clamp(1-Math.abs(office.fadeT-.3)/.3,0,1)})`;ctx.fillRect(0,0,W,H)}}
  for(const b of bottles){ctx.save();ctx.translate(b.x-camX,b.y);ctx.rotate(b.r);ctx.scale(.8,.8);bottleShape();ctx.restore()}
  for(const c of cups)drawCup(c);
  for(const q of parts){
    const x=q.x-camX;
    if(q.zz){ctx.globalAlpha=clamp(q.life/q.max,0,1);ctx.font='18px "Lilita One", Inter, Arial';ctx.fillStyle='#9fe3ff';ctx.textAlign='center';ctx.fillText('z',x,q.y);ctx.globalAlpha=1;continue}
    if(q.smoke){ctx.fillStyle=`rgba(235,235,240,${.45*q.life/q.max})`}else if(q.steam){ctx.fillStyle=`rgba(255,255,255,${.75*q.life/q.max})`}else ctx.fillStyle=q.c;
    ctx.globalAlpha=q.smoke||q.steam?1:clamp(q.life/q.max*1.5,0,1);
    ctx.beginPath();ctx.arc(x,q.y,q.r,0,7);ctx.fill();ctx.globalAlpha=1;
  }
  // night grade
  if(n>0){
    ctx.save();ctx.globalCompositeOperation='multiply';
    ctx.fillStyle=`rgb(${Math.round(lerp(255,70,n))},${Math.round(lerp(255,82,n))},${Math.round(lerp(255,150,n))})`;
    ctx.fillRect(-20,-20,W+40,H+40);ctx.restore();
  }else if(level!=='boss'&&level!=='office'){
    // late-afternoon warmth
    ctx.save();ctx.globalCompositeOperation='soft-light';ctx.fillStyle='rgba(255,170,90,.25)';ctx.fillRect(0,0,W,H);ctx.restore();
  }
  drawLights(n);
  // foreground cars pass in front of the lamp glow (dimmed for the night themselves)
  if(cars.length){const L0=lights.length;carDim=Math.round(n*4);for(const c of cars)drawCar(c,n);carDim=0;
    const heads=lights.slice(L0);lights=heads;drawLights(n,true)}
  // cigarette ember always glows
  {const p=player,sw=p.sw||66,left=p.x+p.w/2-sw/2,top=p.y+p.h-112;const mx=p.facing>0?left+sw*.655:left+sw*.345;
   if(!(p.inv>0&&Math.floor(p.inv*14)%2===0)){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,110,40,${.5+.4*Math.sin(t*7)})`;ctx.beginPath();ctx.arc(mx-camX+p.facing*4,top+112*.535,2.5+n*2,0,7);ctx.fill();ctx.restore()}}
  // speech bubbles
  for(const e of enemies){if(e.ko||state!=='play')continue;const txt=e.act?e.actSay:e.near?e.say:null;if(txt){const x=e.x+e.w/2-camX;bubble(txt,x,GROUND-(e.dh||e.h)-(e.type==='bum'?14:22))}}
  if(boss&&boss.sayT>0)bubble(boss.say,boss.x+boss.w/2,GROUND-BOSS_H-4,true);
  for(const q of popups){ctx.globalAlpha=clamp(q.t*2,0,1);ctx.font='18px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.strokeText(q.text,q.x-camX,q.y);ctx.fillStyle=q.c;ctx.fillText(q.text,q.x-camX,q.y);ctx.globalAlpha=1}
  ctx.setTransform(scale,0,0,scale,0,0);
  hud(n);
  if(banner){
    ctx.globalAlpha=clamp(banner.t*2,0,1);
    ctx.font='26px "Lilita One", Inter, Arial';const w=Math.min(W-40,ctx.measureText(banner.text).width+50);
    const by=level==='boss'?66:150;ctx.fillStyle=banner.c||'#c8403a';pg(W/2-w/2,by,w,52,8);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.stroke();
    signText(banner.text,W/2,by+26,w-30,26,'#fff4dc');
    ctx.font='600 14px Inter, Arial';ctx.fillStyle='#fff4dc';ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.textAlign='center';const sub=banner.sub||(lives>0?`−1 vie · il t'en reste ${lives}`:'Plus de vies');ctx.strokeText(sub,W/2,by+70);ctx.fillText(sub,W/2,by+70);
    ctx.globalAlpha=1;
  }
  if(level==='office'&&office&&office.intro>0)drawPhoneIntro();
  if(state==='pause'&&false){
    ctx.fillStyle='rgba(22,26,46,.6)';ctx.fillRect(0,0,W,H);
    ctx.font='48px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.fillStyle='#f4e7c8';ctx.fillText('PAUSE CLOPE',W/2,H/2);
    ctx.font='600 16px Inter, Arial';ctx.fillText('Appuie sur P pour repartir',W/2,H/2+40);
  }
}
