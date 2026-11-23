// Niveau « flip » : flipper.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------------- 4. PINBALL ----------------
let FL=null;
const PB={x0:330,x1:630,y0:80,y1:530,LP:[405,462],RP:[555,462],FLL:66};
function pbWalls(){const W2=[],X0=PB.x0,X1=PB.x1,Y0=PB.y0,cx=(X0+X1)/2,top=Y0+70;
  W2.push([X0,top,X0,PB.y1-150],[X1,top,X1,PB.y1-150],[X0,PB.y1-150,PB.LP[0]-4,PB.LP[1]-2],[X1,PB.y1-150,PB.RP[0]+4,PB.RP[1]-2]);
  let px=X0,py=top;for(let i=1;i<=10;i++){const a=Math.PI+i/10*Math.PI,x=cx+Math.cos(a)*150,y=top+Math.sin(a)*70;W2.push([px,py,x,y]);px=x;py=y}
  // slingshots above the flippers
  W2.push([X0+30,PB.y1-200,X0+60,PB.y1-140],[X1-30,PB.y1-200,X1-60,PB.y1-140]);
  return W2}
function setupFlip(){camX=0;genDone=true;FL={time:15+flipBonus,t:-1.2,pts:0,balls:[],respawn:.2,lf:{a:.5,pa:.5},rf:{a:.5,pa:.5},bump:[{x:430,y:205,r:24,f:0},{x:530,y:205,r:24,f:0},{x:480,y:285,r:26,f:0}],can:{x:480,y:150,r:16,on:true,t:0},slow:0,walls:pbWalls(),done:false,endT:0,say:'GO MICHEL GO!!',sayT:2,jack:0,lights:0,combo:0,comboT:0};}
function pbSpawn(x,y,vx,vy){FL.balls.push({x:x??PB.x1-26,y:y??PB.y0+90,vx:vx??-260,vy:vy??80,r:8,trail:[]})}
function pbAdd(n,x,y,c){FL.pts+=n;score+=n;popups.push({x,y,text:'+'+n,t:.7,c:c||'#ffd23f'})}
function segHit(b,ax,ay,bx,by,rad,e,vx0,vy0){const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy,u=clamp(((b.x-ax)*dx+(b.y-ay)*dy)/L2,0,1),cx=ax+dx*u,cy=ay+dy*u,ox=b.x-cx,oy=b.y-cy,d=Math.hypot(ox,oy),R=b.r+rad;
  if(d>=R||d===0)return false;const nx=ox/d,ny=oy/d;b.x=cx+nx*R;b.y=cy+ny*R;const rvx=b.vx-(vx0||0)*u,rvy=b.vy-(vy0||0)*u,vn=rvx*nx+rvy*ny;if(vn<0){b.vx-=(1+e)*vn*nx;b.vy-=(1+e)*vn*ny}return true}
function flipTip(P,a,side){return [P[0]+side*Math.cos(a)*PB.FLL,P[1]+Math.sin(a)*PB.FLL]}
function updateFlip(dt){const F=FL;mgParts(dt);F.sayT-=dt;F.jack=Math.max(0,F.jack-dt);F.comboT-=dt;if(F.comboT<=0)F.combo=0;for(const b of F.bump)b.f=Math.max(0,b.f-dt*4);
  if(F.done){F.endT+=dt;if(F.endT>2.6&&state==='play'){if(F.pts>=5000)award('flip');
    showCard('PLUS D\'ARGENT · FLIPPER +'+F.pts,'RETOUR EN SKATE','Plus une cenne. Delachaud est reparti avec la limo pis deux danseuses. Michel emprunte un skate pour rentrer : esquive les chars, saute les cônes pis fais des figures.','ENVOYE, MICHEL',()=>{startLevel('bike');state='play';banner=null})}return}
  F.t+=dt;if(F.t<0)return;
  const sl=F.slow>0?.45:1;F.slow=Math.max(0,F.slow-dt);dt*=sl;
  F.time-=dt/sl*(F.slow>0?.6:1);
  if(F.time<=0){F.time=0;F.done=true;F.endT=0;banner={text:'PLUS D\'ARGENT!',sub:'Score : '+F.pts,t:2.4,c:'#c8403a'};sfx.boss();return}
  const L=keys.l||keys.j||MP.l,Rr=keys.r||keys.j||MP.r;
  for(const [f,on] of [[F.lf,L],[F.rf,Rr]]){f.pa=f.a;const tg=on?-.5:.5;f.a+=clamp(tg-f.a,-dt*20,dt*20);if(on&&!f.was)beep(200,140,.04,'square',.03);f.was=on}
  if(!F.balls.length){F.respawn-=dt;if(F.respawn<=0){pbSpawn();F.respawn=.8}}
  const steps=6,h=dt/steps;
  for(let s=0;s<steps;s++){
    const fr=[[F.lf,PB.LP,1],[F.rf,PB.RP,-1]].map(([f,P,side])=>{const a0=f.pa+(f.a-f.pa)*(s/steps),a1=f.pa+(f.a-f.pa)*((s+1)/steps),t0=flipTip(P,a0,side),t1=flipTip(P,a1,side);return {P,t:t1,v:[(t1[0]-t0[0])/h,(t1[1]-t0[1])/h]}});
    for(const b of F.balls){
      b.vy+=1150*h;const sp=Math.hypot(b.vx,b.vy);if(sp>1500){b.vx*=1500/sp;b.vy*=1500/sp}
      b.x+=b.vx*h;b.y+=b.vy*h;
      for(const w of F.walls)segHit(b,w[0],w[1],w[2],w[3],2,.45);
      for(const f of fr)if(segHit(b,f.P[0],f.P[1],f.t[0],f.t[1],6,.35,f.v[0],f.v[1])){}
      for(const bp of F.bump){const dx=b.x-bp.x,dy=b.y-bp.y,d=Math.hypot(dx,dy);if(d<b.r+bp.r){const nx=dx/d,ny=dy/d;b.x=bp.x+nx*(b.r+bp.r);b.y=bp.y+ny*(b.r+bp.r);b.vx=nx*620;b.vy=ny*620;bp.f=1;F.combo++;F.comboT=1.2;pbAdd(100*Math.min(5,F.combo),bp.x,bp.y-30,'#ff9ad5');beep(700+F.combo*60,400,.06,'square',.04);shake=.06}}
      const c=F.can;if(c.on&&Math.hypot(b.x-c.x,b.y-c.y)<b.r+c.r){c.on=false;c.t=7;b.vy=Math.abs(b.vy)*.8+100;pbAdd(500,c.x,c.y-30,'#5ee0ff');F.slow=3;F.jack=1.5;shake=.35;banner={text:'MULTIBALL!',sub:'Vodka-Red Bull : tout ralentit',t:1.4,c:'#2f6fb3'};fxBurst(c.x,c.y,['#5ee0ff','#ffd23f','#fff'],40,420);pbSpawn(c.x-30,c.y+20,-220,-80);pbSpawn(c.x+30,c.y+20,220,-80);ammo++;sfx.beer();F.say='MULTIBAAALL!!';F.sayT=1.6}
      // top lane jackpot
      if(b.y<PB.y0+40&&Math.abs(b.x-480)<26&&!b.jp){b.jp=true;pbAdd(1000,480,PB.y0+70,'#ffd23f');F.jack=1.5;banner={text:'JACKPOT!',t:1.2,c:'#ff3d9a'};shake=.3;fxBurst(480,PB.y0+50,['#ffd23f','#ff3d9a'],30)}
      if(b.y>PB.y0+120)b.jp=false;
    }
    F.balls=F.balls.filter(b=>b.y<PB.y1+30);
  }
  for(const b of F.balls){b.trail.push([b.x,b.y]);if(b.trail.length>8)b.trail.shift()}
  if(!F.can.on){F.can.t-=dt;if(F.can.t<=0)F.can.on=true}
  F.lights+=dt;
  if(Math.random()<dt*.2&&F.sayT<-1){F.say=pick(['FRAPPE-LA!','Plus vite, Michel!','On est riches!!','Encore! Encore!']);F.sayT=1.4}
}
function drawFlip(){const F=FL;
  ctx.save();if(shake>0)ctx.translate(rnd(-5,5)*shake*3,rnd(-5,5)*shake*3);
  // casino floor
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a0d2e');g.addColorStop(1,'#3a1240');ctx.fillStyle=g;ctx.fillRect(-20,-20,W+40,H+40);
  for(let i=0;i<30;i++){ctx.fillStyle=['#ff3d9a','#5ee0ff','#ffd23f'][i%3];ctx.globalAlpha=.25+.25*Math.sin(t*4+i);ctx.beginPath();ctx.arc((i*97)%W,30+(i*53)%120,3,0,7);ctx.fill()}ctx.globalAlpha=1;
  // table
  ctx.save();ctx.shadowColor='#ff3d9a';ctx.shadowBlur=26;ctx.fillStyle='#2a1240';rr(PB.x0-22,PB.y0-14,PB.x1-PB.x0+44,PB.y1-PB.y0+30,40);ctx.fill();ctx.restore();
  const tg=ctx.createLinearGradient(0,PB.y0,0,PB.y1);tg.addColorStop(0,'#3a1d72');tg.addColorStop(1,'#14092a');ctx.fillStyle=tg;ctx.beginPath();ctx.moveTo(PB.x0,PB.y1);ctx.lineTo(PB.x0,PB.y0+70);ctx.ellipse(480,PB.y0+70,150,70,0,Math.PI,0);ctx.lineTo(PB.x1,PB.y1);ctx.closePath();ctx.fill();
  ctx.save();ctx.clip();ctx.fillStyle='rgba(255,255,255,.05)';for(let y=PB.y0;y<PB.y1;y+=10)for(let x=PB.x0+((y/10)%2)*5;x<PB.x1;x+=10){ctx.beginPath();ctx.arc(x,y,1.3,0,7);ctx.fill()}
  // lane arrows lighting up
  for(let i=0;i<5;i++){const on=Math.floor(F.lights*6)%5===i;ctx.fillStyle=on?'#ffd23f':'rgba(255,210,63,.18)';ctx.beginPath();ctx.moveTo(480,360-i*18);ctx.lineTo(468,372-i*18);ctx.lineTo(492,372-i*18);ctx.closePath();ctx.fill()}
  ctx.font='26px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.fillStyle=`rgba(255,61,154,${.25+.2*Math.sin(t*5)})`;ctx.fillText('DELACHAUD',480,430);ctx.font='14px "Lilita One", Inter, Arial';ctx.fillText('CASINO DE MONTRÉAL',480,450);
  ctx.restore();
  // walls
  ctx.strokeStyle='#ff6fb5';ctx.lineWidth=4;ctx.lineCap='round';ctx.shadowColor='#ff3d9a';ctx.shadowBlur=10;for(const w of F.walls){ctx.beginPath();ctx.moveTo(w[0],w[1]);ctx.lineTo(w[2],w[3]);ctx.stroke()}ctx.shadowBlur=0;
  // jackpot lane
  ctx.fillStyle=F.jack>0?'#ffd23f':'rgba(255,210,63,.35)';rr(456,PB.y0+8,48,22,8);ctx.fill();ctx.font='10px "Lilita One", Inter';ctx.fillStyle='#2a1240';ctx.fillText('JACKPOT',480,PB.y0+23);
  // bumpers
  for(const b of F.bump){ctx.save();ctx.shadowColor='#5ee0ff';ctx.shadowBlur=10+b.f*30;ctx.fillStyle=b.f>0?'#fff':'#2f6fb3';ctx.beginPath();ctx.arc(b.x,b.y,b.r+b.f*4,0,7);ctx.fill();ctx.restore();ctx.fillStyle='#5ee0ff';ctx.beginPath();ctx.arc(b.x,b.y,b.r*.6,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.font='12px "Lilita One", Inter';ctx.textAlign='center';ctx.fillText('100',b.x,b.y+4)}
  // vodka can target
  if(F.can.on){const c=F.can;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(Math.sin(t*3)*.15);ctx.shadowColor='#5ee0ff';ctx.shadowBlur=18;ctx.fillStyle='#2f6fb3';rr(-11,-20,22,40,4);ctx.fill();ctx.fillStyle='#c8d0d8';rr(-11,-20,22,7,3);ctx.fill();ctx.fillStyle='#ffd23f';ctx.font='900 7px Inter';ctx.textAlign='center';ctx.fillText('VODKA',0,2);ctx.fillText('RB',0,11);ctx.restore()}
  // flippers
  for(const [f,P,side] of [[F.lf,PB.LP,1],[F.rf,PB.RP,-1]]){const tp=flipTip(P,f.a,side);ctx.strokeStyle='#2a1240';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(P[0],P[1]);ctx.lineTo(tp[0],tp[1]);ctx.stroke();ctx.strokeStyle='#ffd23f';ctx.lineWidth=11;ctx.stroke();ctx.fillStyle='#2a1240';ctx.beginPath();ctx.arc(P[0],P[1],5,0,7);ctx.fill()}
  // balls
  for(const b of F.balls){for(let i=0;i<b.trail.length;i++){const [x,y]=b.trail[i];ctx.fillStyle=`rgba(94,224,255,${i/b.trail.length*.35})`;ctx.beginPath();ctx.arc(x,y,b.r*.8,0,7);ctx.fill()}
    const bg=ctx.createRadialGradient(b.x-3,b.y-3,1,b.x,b.y,b.r);bg.addColorStop(0,'#fff');bg.addColorStop(1,'#8a93a8');ctx.fillStyle=bg;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill()}
  ctx.lineCap='butt';
  mgDrawParts();
  // Delachaud and Michel on the sides
  {ctx.save();ctx.translate(165,H+30+(F.jack>0?-Math.abs(Math.sin(t*12))*16:0));drawRig(RIGS[DELACHAUD],320,{armL:F.jack>0?2.3:.3+Math.sin(t*5)*.2,armR:F.jack>0?-2.3:-.2,ex:{mouth:F.sayT>0?'talk':'grin',blink:blinkAt(3)}});ctx.restore();if(F.sayT>0)bubble(F.say,165,250,true)}
  {const L=keys.l||keys.j||MP.l,Rr=keys.r||keys.j||MP.r;ctx.save();ctx.translate(800,H+40);ctx.scale(-1,1);drawRig(RIGS.hero,320,{armL:L||Rr?-1.4:-.6,foreL:L||Rr?-.3:-.9,ex:F.jack>0?{mouth:'shout',brow:-1,blink:0}:{mouth:'grin',brow:.4,drunk:drunk(),look:{x:-.7,y:-.4}}});ctx.restore()}
  if(F.slow>0){ctx.fillStyle=`rgba(94,224,255,${.08+.05*Math.sin(t*10)})`;ctx.fillRect(0,0,W,H)}
  ctx.restore();
  // score + timer
  ctx.fillStyle='rgba(32,13,56,.9)';pg(W/2-150,12,300,56);ctx.fill();htFill();
  ctx.font='30px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.fillStyle='#ffd23f';ctx.fillText(String(F.pts).padStart(6,'0'),W/2-40,50);
  ctx.fillStyle=F.time<5?'#ff3d9a':'#5ee0ff';ctx.fillText(Math.ceil(F.time)+' s',W/2+95,50);
  if(F.combo>1){ctx.font='18px "Lilita One", Inter, Arial';ctx.fillStyle='#ff9ad5';ctx.fillText('COMBO ×'+Math.min(5,F.combo),W/2-250,130)}
  if(F.t<0){ctx.font='44px "Lilita One", Inter, Arial';ctx.lineWidth=7;ctx.strokeStyle=INK;ctx.strokeText('PRÊT?',W/2,300);ctx.fillStyle='#ffd23f';ctx.fillText('PRÊT?',W/2,300)}
  hud(0);mgBanner();
  {ctx.textAlign='center';ctx.font='700 12px Inter, Arial';ctx.fillStyle='#fff4dc';ctx.strokeStyle=INK;ctx.lineWidth=4;const s=IS_TOUCH?'TOUCHE À GAUCHE / À DROITE POUR LES PALETTES':'← → PALETTES · ESPACE LES DEUX · CLIC GAUCHE / DROITE';ctx.strokeText(s,W/2,H-10);ctx.fillText(s,W/2,H-10)}
}

// ---------- registre ----------
defineLevel({
  id:'flip', n:10,
  name:'LE FLIPPER', stage:'Flipper', chapter:'Le flipper',
  dev:'Flipper', devTitle:'FLIPPER',
  track:'d', hour:()=>1.4,
  place:()=>'Au Casino',
  fx:{bloom:0.5},   // glow (src/gfx/effects.ts)
  start:setupFlip,
  update:updateFlip, draw:drawFlip,
  pointer:(e,x)=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}MP.ids[e.pointerId]=x<W/2?'l':'r';MP.l=Object.values(MP.ids).includes('l');MP.r=Object.values(MP.ids).includes('r')},
  pad:()=>'none',
  tuto:{from:'Delachaud',av:'#ff9a1f',msgs:['FLIPPER!!! Fais exploser le score 🎰'],tips:[['← →','palettes'],['ESPACE','les deux palettes'],['CANETTE','multiball + ralenti'],['JACKPOT','en haut : +1000']]},
  story:'Delachaud t\'amène au flipper. Fais le plus gros score avant que l\'argent manque!',
  ctrl:[['Palette gauche / droite','← →','CROIX'],['Les deux palettes','ESPACE','A']],
});
