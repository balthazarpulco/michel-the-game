// Niveau « dance » : dance-off avec Ginette.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- boss 2: dance-off with Ginette ----------
const BPM=126.01,BEAT=60/BPM,HIT_Y=118,SPEEDN=300,TRACK_PHASE=.298;
const LANES=['l','d','j','r'],LANE_X={l:405,d:455,j:505,r:555};
const ARROW_COL={l:'#ff5d8f',d:'#5ee0ff',j:'#9fe3a0',r:'#ffd166'};
const GIN_SAY=['Plus de hanches, chéri!','Suis-moi!','Tu me piles sur les pieds!','Ooh, Michel!','Ça, c\'est du disco!','On lâche pas!'];
let dance=null;
function makeChart(){
  const notes=[];let beat=4;
  let ph=(n,step,pat)=>{for(let i=0;i<n;i++){notes.push({t:beat*BEAT,d:pat?pat[i%pat.length]:pick(LANES)});beat+=step}};
  const ph0=ph;ph=(n,step,pat)=>ph0(DF.dSlow&&step<2?Math.ceil(n*.75):n,DF.dSlow?2:step,pat);
  ph(8,2,['l','r','l','r','j','d','j','d']);
  ph(8,2);beat+=2;
  ph(8,1,['l','d','j','r']);beat+=2;
  ph(8,2);
  ph(12,1);beat+=2;
  ph(4,2,['j','d','l','r']);ph(4,1,['j','j','d','d']);
  return {notes,end:(beat+2)*BEAT,beats:Math.ceil(beat+4)};
}
function setupDance(){
  const ch=makeChart();
  // start the song on a measured beat around 0:28, so the arrows land on the music
  const per=BEAT,k=Math.ceil((28-TRACK_PHASE)/per),aStart=TRACK_PHASE+k*per;
  dance={aStart,notes:ch.notes,end:ch.end,beats:ch.beats,start:performance.now()/1000+2.6,t:-2.6*DF.dRate,meter:.5,combo:0,best:0,hits:0,judge:null,
    pose:null,poseT:0,gPose:null,gPoseT:0,say:'Personne sort d\'ici sans danser, mon beau!',sayT:3,done:false,doneT:0,flash:{}};
  curTrack='c';const a=trk('c');try{a.currentTime=aStart-2.6*DF.dRate}catch(e){}
  dance.rate=DF.dRate;try{a.preservesPitch=a.mozPreservesPitch=a.webkitPreservesPitch=true;a.playbackRate=DF.dRate}catch(e){}
  if(!muted){a.volume=MUSIC_VOL;const p=a.play();if(p&&p.catch)p.catch(()=>{})}
}
function danceMusicSynth(){
  if(muted)return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    const bus=actx.createGain();bus.gain.value=.55;bus.connect(actx.destination);dance.bus=bus;
    const a0=actx.currentTime+(dance.start-performance.now()/1000);
    const nb=actx.createBuffer(1,actx.sampleRate*.2,actx.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
    const bassline=[55,55,65.4,73.4,55,55,82.4,73.4];
    for(let b=0;b<dance.beats;b++){
      const at=a0+b*BEAT;
      // kick
      {const o=actx.createOscillator(),g=actx.createGain();o.frequency.setValueAtTime(140,at);o.frequency.exponentialRampToValueAtTime(45,at+.12);g.gain.setValueAtTime(.9,at);g.gain.exponentialRampToValueAtTime(.001,at+.18);o.connect(g).connect(bus);o.start(at);o.stop(at+.2)}
      // off-beat hat
      {const n=actx.createBufferSource(),f=actx.createBiquadFilter(),g=actx.createGain();n.buffer=nb;f.type='highpass';f.frequency.value=7000;g.gain.setValueAtTime(.25,at+BEAT/2);g.gain.exponentialRampToValueAtTime(.001,at+BEAT/2+.06);n.connect(f).connect(g).connect(bus);n.start(at+BEAT/2);n.stop(at+BEAT/2+.08)}
      // clap on 2 and 4
      if(b%2===1){const n=actx.createBufferSource(),f=actx.createBiquadFilter(),g=actx.createGain();n.buffer=nb;f.type='bandpass';f.frequency.value=1500;g.gain.setValueAtTime(.5,at);g.gain.exponentialRampToValueAtTime(.001,at+.14);n.connect(f).connect(g).connect(bus);n.start(at);n.stop(at+.16)}
      // disco octave bass
      if(b>=4)for(const off of [0,.5]){const o=actx.createOscillator(),g=actx.createGain(),fr=bassline[b%8]*(off?2:1);o.type='square';o.frequency.value=fr;g.gain.setValueAtTime(.09,at+off*BEAT);g.gain.exponentialRampToValueAtTime(.001,at+off*BEAT+.2);o.connect(g).connect(bus);o.start(at+off*BEAT);o.stop(at+off*BEAT+.22)}
    }
  }catch(e){}
}
function stopDanceMusic(){try{if(dance&&dance.bus){dance.bus.gain.setValueAtTime(0,actx.currentTime);dance.bus.disconnect()}}catch(e){}}
function danceHit(dir){
  const D=dance;if(!D||D.done)return;
  D.pose=dir;D.poseT=.3;D.flash[dir]=.15;
  let best=null,bd=1;
  for(const n of D.notes){if(n.hit||n.miss||n.d!==dir)continue;const dd=Math.abs(n.t-D.t);if(dd<bd){bd=dd;best=n}}
  if(best&&bd<DF.dWin){
    best.hit=true;D.hits++;D.combo++;D.best=Math.max(D.best,D.combo);
    const [txt,pts,m,c]=bd<DF.dWin*.32?['PARFAIT!',100,.06,'#9fe3a0']:bd<DF.dWin*.64?['BIEN!',60,.04,'#5ee0ff']:['OK',25,.02,'#ffd166'];
    score+=pts+Math.min(D.combo,20)*2;D.meter=Math.min(1,D.meter+m);D.judge={txt,c,t:.6};
    for(let i=0;i<8;i++)parts.push({x:LANE_X[dir],y:HIT_Y,vx:rnd(-160,160),vy:rnd(-160,120),life:.4,max:.4,c:ARROW_COL[dir],r:rnd(2,4),g:0});
    if(D.combo>0&&D.combo%10===0){D.cheer=.9;D.cwSay={k:pick(CW_FLOOR.map(c=>c.k)),txt:pick(['GO MICHEL!','Wooooh!','Le roi du disco!','T\'es en feu!']),t:1.5}}
    if(D.combo>0&&D.combo%10===0){D.say=pick(['Ooh, Michel!','Ça, c\'est du disco!','T\'as du rythme, mon beau!']);D.sayT=1.6}
  }else{D.meter=Math.max(0,D.meter-.03);D.judge={txt:'TROP TÔT',c:'#ff9a9a',t:.4}}
}
function danceFail(){
  if(godMode){dance.meter=.5;return}
  stopDanceMusic();lives--;sfx.hurt();
  if(lives<=0){gameOver('GINETTE T\'A SORTI DE LA PISTE');return}
  showCard('L\'AMBIANCE EST TOMBÉE · −1 VIE','ON RECOMMENCE','Ginette croise les bras : « Encore une fois, pis avec du cœur! » Suis le rythme et appuie quand la flèche touche la cible.','REDANSER',()=>{startLevel('dance');state='play'});
}
function updateDance(dt){
  const D=dance,A=tracks.c;
  // follow the song's own clock when it plays, the wall clock otherwise
  const rate=D.rate||1;
  if(A&&!A.paused&&A.readyState>=2&&!muted){const at=A.currentTime-D.aStart;if(Math.abs(at-(performance.now()/1000-D.start)*rate)>.04)D.start=performance.now()/1000-at/rate}
  D.t=(performance.now()/1000-D.start)*rate;
  D.poseT=Math.max(0,D.poseT-dt);D.cheer=Math.max(0,(D.cheer||0)-dt);D.oops=Math.max(0,(D.oops||0)-dt);if(D.cwSay){D.cwSay.t-=dt;if(D.cwSay.t<=0)D.cwSay=null}D.gPoseT=Math.max(0,D.gPoseT-dt);D.sayT-=dt;if(D.judge){D.judge.t-=dt;if(D.judge.t<=0)D.judge=null}
  for(const k in D.flash)D.flash[k]=Math.max(0,D.flash[k]-dt);
  for(const n of D.notes){
    if(!n.g&&D.t>=n.t){n.g=true;D.gPose=n.d;D.gPoseT=.28;D.gVar=(D.gVar||0)+1}
    if(!n.hit&&!n.miss&&D.t>n.t+DF.dWin){n.miss=true;D.combo=0;D.meter=Math.max(0,D.meter-DF.dMiss);D.judge={txt:'RATÉ',c:'#ff5d8f',t:.6};D.pose='miss';D.poseT=.35;D.oops=.6;
      if(Math.random()<.35){D.say=pick(['Tu me piles sur les pieds!','Écoute la musique, chéri!','Allez, Michel!']);D.sayT=1.4}}
  }
  for(const q of parts){q.life-=dt;q.vy+=(q.g||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt}
  parts=parts.filter(q=>q.life>0);
  if(D.done){D.doneT+=dt;if(D.doneT>2.4&&state==='play'){
    const pct=Math.round(100*D.hits/D.notes.length);score+=pct*10+lives*300;
    lives=Math.min(MAXL,lives+1);
    showCard('DANSE '+pct+' % · COMBO '+D.best+' · +1 VIE','TA BLONDE TEXTE','Ton téléphone vibre : c\'est ta blonde. Réponds bien à ses textos, sinon elle te commande un Uber pis ta soirée est finie. Clique une réponse ou appuie sur 1, 2 ou 3. Plus t\'es saoul, plus ton clavier fait des siennes.','LIRE LES TEXTOS',()=>{startLevel('texto');state='play'})}return}
  if(D.meter<=0&&D.t>0){danceFail();return}
  if(D.t>D.end){
    stopDanceMusic();
    if(D.hits/D.notes.length>=DF.dPass){D.done=true;if(D.hits===D.notes.length)award('disco');D.say='Correct… tu peux y aller. Reviens jeudi!';D.sayT=9}
    else danceFail();
  }
}
function arrowPath(x,y,dir,s){
  const a={j:0,r:Math.PI/2,d:Math.PI,l:-Math.PI/2}[dir];
  ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.scale(s,s);
  ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(19,0);ctx.lineTo(8,0);ctx.lineTo(8,18);ctx.lineTo(-8,18);ctx.lineTo(-8,0);ctx.lineTo(-19,0);ctx.closePath();
  ctx.restore();
}
function drawDance(){
  const D=dance,bt=Math.max(0,D.t)/BEAT,bp=bt%1,pulse=D.t>0?Math.pow(1-bp,3):0;
  // bar interior
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1c1430');g.addColorStop(1,'#3a1f45');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // back bar with bottles
  ctx.fillStyle='#2a1a2e';ctx.fillRect(0,196,W,150);
  for(let r=0;r<2;r++){ctx.fillStyle='#5b3a2e';ctx.fillRect(0,248+r*52,W,6);
    for(let i=0;i<34;i++){const x=12+i*28,h=26+((i*7+r*3)%4)*6;ctx.fillStyle=['#7fa32b','#a8641f','#5ee0ff','#c8403a','#e9c46a','#8d6cab'][(i+r)%6];ctx.globalAlpha=.85;rr(x,248+r*52-h,14,h,3);ctx.fill();ctx.fillRect(x+4,248+r*52-h-8,6,8);ctx.globalAlpha=1}}
  // neon sign
  ctx.save();ctx.shadowColor='#ff5d8f';ctx.shadowBlur=18+pulse*16;signText('CHEZ GINETTE',W/2,170,420,40,'#ff9ad5');ctx.restore();
  // disco ball
  const bx=W/2,by=58;ctx.strokeStyle='#888';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx,0);ctx.lineTo(bx,by-26);ctx.stroke();
  ctx.fillStyle='#c9ced6';ctx.beginPath();ctx.arc(bx,by,26,0,7);ctx.fill();ctx.strokeStyle=INK;ctx.stroke();
  for(let i=0;i<14;i++){const a=i*.9+t*1.5,x=bx+Math.cos(a)*18,y=by+Math.sin(i*1.7)*16;ctx.fillStyle=i%2?'#fff':'#9fe3ff';ctx.fillRect(x-3,y-3,6,6)}
  // spotlights
  ctx.save();ctx.globalCompositeOperation='lighter';
  [['#ff5d8f',-1],['#5ee0ff',1],['#ffd166',.3]].forEach(([c,s],i)=>{const a=Math.sin(t*.9+i*2)*.5*s;ctx.globalAlpha=.16+pulse*.12;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+Math.sin(a-.12)*700,by+700);ctx.lineTo(bx+Math.sin(a+.12)*700,by+700);ctx.closePath();ctx.fill()});
  for(let i=0;i<24;i++){const x=(i*137+t*40)%W,y=(i*71)%300+20;ctx.globalAlpha=.4*Math.abs(Math.sin(t*3+i));ctx.fillStyle='#fff';ctx.fillRect(x,y,3,3)}
  ctx.restore();
  // dance floor
  const cols=['#ff5d8f','#5ee0ff','#ffd166','#9fe3a0','#9b8cff'];
  for(let r=0;r<5;r++)for(let c=0;c<12;c++){const lit=((c+r+Math.floor(bt))%3===0);ctx.fillStyle=lit?cols[(c*3+r+Math.floor(bt))%5]:'#2b2238';ctx.globalAlpha=lit?.55+pulse*.4:1;ctx.fillRect(c*80,GROUND-60+r*30,80,30);ctx.globalAlpha=1;ctx.strokeStyle='#120c1c';ctx.lineWidth=2;ctx.strokeRect(c*80,GROUND-60+r*30,80,30)}
  // dancers
  for(const c of CW_FLOOR)if(c.back)drawCwDancer(D,c);
  for(const c of CW_FLOOR)if(!c.back)drawCwDancer(D,c);
  drawDancerMichel(D,pulse);drawGinette(D,pulse);
  if(D.cwSay){const c=CW_FLOOR.find(c=>c.k===D.cwSay.k);bubble(D.cwSay.txt,c.x,GROUND+c.y-c.h-6)}
  // note highway
  ctx.fillStyle='rgba(18,12,28,.62)';rr(372,74,216,H-74,12);ctx.fill();
  for(const k of LANES){
    const x=LANE_X[k];ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,90);ctx.lineTo(x,H);ctx.stroke();
    arrowPath(x,HIT_Y,k,1.05);ctx.fillStyle=D.flash[k]>0?ARROW_COL[k]:'rgba(255,255,255,.08)';ctx.fill();ctx.strokeStyle=ARROW_COL[k];ctx.lineWidth=3;ctx.stroke();
  }
  for(const n of D.notes){
    if(n.hit)continue;const y=HIT_Y+(n.t-D.t)*SPEEDN;if(y>H+30||y<40)continue;
    arrowPath(LANE_X[n.d],y,n.d,1);ctx.globalAlpha=n.miss?.3:1;ctx.fillStyle=ARROW_COL[n.d];ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.stroke();ctx.globalAlpha=1;
  }
  for(const q of parts){ctx.globalAlpha=clamp(q.life/q.max*1.5,0,1);ctx.fillStyle=q.c;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,7);ctx.fill();ctx.globalAlpha=1}
  if(D.judge){ctx.globalAlpha=clamp(D.judge.t*3,0,1);ctx.font='26px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.strokeStyle=INK;ctx.lineWidth=5;const jy=HIT_Y+70-(.6-D.judge.t)*20;ctx.strokeText(D.judge.txt,480,jy);ctx.fillStyle=D.judge.c;ctx.fillText(D.judge.txt,480,jy);ctx.globalAlpha=1}
  if(D.combo>=4){ctx.font='18px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.fillStyle='#fff4dc';ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.strokeText('COMBO '+D.combo,480,HIT_Y+108);ctx.fillText('COMBO '+D.combo,480,HIT_Y+108)}
  if(D.t<0){const c=Math.ceil(-D.t/(2.6*(D.rate||1)/3));ctx.font='64px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.strokeStyle=INK;ctx.lineWidth=7;const s=c>0&&c<=3?String(c):'GO!';ctx.strokeText(s,480,330);ctx.fillStyle='#ffbf47';ctx.fillText(s,480,330)}
  if(D.sayT>0)bubble(D.say,730,190,true);
  hud(0);
  // ambiance meter
  const bw=300,mx=W/2-bw/2;
  ctx.fillStyle='rgba(32,13,56,.85)';pg(mx-14,12,bw+28,50);ctx.fill();
  ctx.textAlign='left';ctx.font='900 13px Inter, Arial';ctx.fillStyle='#ff9ad5';ctx.fillText('GINETTE · LE PATRON',mx,28);
  ctx.textAlign='right';ctx.font='600 12px Inter, Arial';ctx.fillStyle='#f4e7c8';ctx.fillText(`${D.hits}/${D.notes.length} pas · ambiance`,mx+bw,28);
  ctx.fillStyle='#3a2a34';pg(mx,38,bw,13,6);ctx.fill();
  ctx.fillStyle=D.meter<.25?'#ff5d8f':D.meter<.6?'#ffd166':'#9fe3a0';pg(mx,38,Math.max(0,bw*D.meter),13,6);ctx.fill();
  ctx.strokeStyle=INK;pg(mx,38,bw,13,6);ctx.stroke();
}
// the coworkers on the floor: each has a few signature moves, switching every 2 bars
const CW_FLOOR=[
  {k:'cw3',x:150,y:-44,h:112,back:1,ph:.5,moves:['twist','hop','moonwalk','spin']},
  {k:'cw4',x:628,y:-44,h:116,back:1,ph:0,moves:['headbang','robot','twist','hop']},
  {k:'cw1',x:58,y:-14,h:134,ph:0,moves:['raise','sprinkler','bounce','spin']},
  {k:'cw2',x:322,y:-14,h:136,ph:1,moves:['robot','raise','moonwalk','sprinkler']},
  {k:'cw5',x:902,y:-14,h:134,ph:2,moves:['sprinkler','hop','raise','twist']},
  {k:'cw6',x:250,y:-50,h:104,back:1,ph:1.5,moves:['raise','twist','robot','bounce']},
  {k:'cw7',x:520,y:-50,h:108,back:1,ph:2.5,moves:['hop','sprinkler','raise','spin']},
];
function drawCwDancer(D,c){
  const R=RIGS[c.k];if(!R)return;
  const bt=Math.max(0,D.t)/BEAT,b=bt+c.ph*.5,fr=b%1,beat=Math.floor(b),arms=COLL[c.k].arms;
  const mv=D.t<0?'bounce':D.done||D.cheer>0?'cheer':c.moves[Math.floor((bt+c.ph*4)/8)%c.moves.length];
  let ox=0,dy=0,rot=0,sx=1,sy=1;const ang={legL:0,legR:0,head:{r:0}};
  const setArms=(a,b2)=>{if(arms.includes('armL'))ang.armL=-Math.max(a,-2.05);if(arms.includes('armR'))ang.armR=Math.max(b2,-2.05)};
  const bob=Math.abs(Math.sin(Math.PI*b));
  if(mv==='bounce'){dy=-bob*10;ang.legL=Math.sin(Math.PI*b)*.2;ang.legR=-ang.legL;ang.head.r=Math.sin(Math.PI*b)*.08;setArms(-.5-bob*.6,.3)}
  else if(mv==='raise'){dy=-bob*12;setArms(-2.8+Math.sin(Math.PI*2*b)*.35,-2.2+Math.sin(Math.PI*2*b)*.35);ang.head.r=Math.sin(Math.PI*b)*.12;ang.legL=.15;ang.legR=-.15}
  else if(mv==='twist'){rot=Math.sin(Math.PI*b)*.22;sy=.93+bob*.04;ox=Math.sin(Math.PI*b)*10;ang.legL=-Math.sin(Math.PI*b)*.4;ang.legR=-ang.legL;setArms(-1.4+Math.sin(Math.PI*b)*.6,-1)}
  else if(mv==='robot'){const st=[0,.14,0,-.14][beat%4];rot=st;ang.head.r=-st*1.4;setArms([-1.6,-.2,-1.6,-2.9][beat%4],[-1.5,-2.8,-.3,-1.5][beat%4]);ang.legL=st*2;ang.legR=-st*2;dy=fr<.15?-4:0}
  else if(mv==='spin'){sx=Math.cos(Math.PI*(b%2));dy=-bob*6;setArms(-1.6,-1.6)}
  else if(mv==='hop'){dy=-Math.sin(Math.PI*fr)*30;ang.legL=-Math.sin(Math.PI*fr)*.6;ang.legR=-ang.legL;setArms(-2.5*Math.sin(Math.PI*fr),-2.5*Math.sin(Math.PI*fr))}
  else if(mv==='headbang'){ang.head.r=.08+Math.sin(Math.PI*2*b)*.22;rot=.06+Math.sin(Math.PI*2*b)*.05;dy=-bob*4;setArms(-2.6,-2.6)}
  else if(mv==='moonwalk'){ox=20-((b%4)/4)*40;rot=-.08;ang.legL=Math.sin(Math.PI*b)*.35;ang.legR=-Math.sin(Math.PI*b)*.35;setArms(.3,.3);ang.head.r=-.05}
  else if(mv==='sprinkler'){const st=[-.3,-.1,.1,.3][beat%4];rot=st;setArms(-1.55,-2.6);ang.head.r=st*.5;dy=fr<.12?-3:0;ang.legL=.2;ang.legR=-.2}
  else if(mv==='cheer'){dy=-Math.abs(Math.sin(t*9+c.ph))*26;setArms(-3+Math.sin(t*14)*.2,-2.9);ang.legL=-.4;ang.legR=.4}
  ang.hair=ang.hairR=ang.head;
  ang.ex=mv==='cheer'?{mouth:'o',brow:-.6}:D.oops>0?{mouth:'o',open:.5,brow:-1}:mv==='headbang'||mv==='robot'?{blink:1,mouth:'grin'}:{blink:blinkAt(c.ph*2),mouth:'smile'};
  if(c.k==='cw1'||c.k==='cw5'||c.k==='cw2')delete ang.ex.mouth;
  if(D.oops>0){rot+=-.12*Math.sin(D.oops*10)}
  const X=c.x+ox,Y=GROUND+c.y;
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(X,Y+3,c.h*.26,6,0,0,7);ctx.fill();
  ctx.save();ctx.translate(X,Y+dy);if(c.x>W/2)ctx.scale(-1,1);ctx.rotate(rot);ctx.scale(sx,sy);drawRig(R,c.h,ang);ctx.restore();
}
function drawDancerMichel(D,pulse){
  const R=RIGS.hero,k=D.poseT>0?D.pose:null,q=D.poseT/.3;
  const bt=Math.max(0,D.t)/BEAT;
  let ang={legL:Math.sin(bt*Math.PI)*.22,legR:-Math.sin(bt*Math.PI)*.22,armL:-.6-Math.abs(Math.sin(bt*Math.PI))*1.2,armR:Math.sin(bt*Math.PI*2)*.4},rot=Math.sin(bt*Math.PI)*.12,dy=-pulse*12,sx=1,sy=1,ox=Math.sin(bt*Math.PI)*10;
  if(k==='l'){rot=-.32;ox=-22;ang={armL:-2.9,armR:.5,legL:.55,legR:-.1}}                              // disco point
  else if(k==='r'){sx=Math.cos((1-q)*Math.PI*2);ang={armL:-1.6,armR:1.6,legL:.2,legR:-.2}}             // spin
  else if(k==='j'){dy=-Math.sin(Math.PI*(1-q))*70;ang={armL:-3,armR:-2.4,legL:-.95,legR:.95}}          // split jump
  else if(k==='d'){sy=.78;sx=1.15;ox=Math.sin(t*60)*6;rot=Math.sin(t*50)*.08;ang={armL:.9,armR:.7,legL:.7,legR:-.7}} // shimmy
  else if(k==='miss'){rot=-.45+Math.sin(t*25)*.08;ox=-10;ang={armL:-2.2,armR:.8,legL:.5,legR:.4}}
  ang.ex=k==='miss'?{brow:-1,mouth:'o',open:1,blink:0}:k==='j'?{brow:-.8,mouth:'shout',blink:0}:k==='l'?{mouth:'grin',wink:'r'}:k==='r'?{mouth:'o',open:.5,blink:.5}:k==='d'?{mouth:'grin',brow:.4,blink:0}:{mouth:D.combo>=8?'grin':'smile',look:{x:Math.sin(bt*Math.PI*.5),y:0}};
  ang.head={r:Math.sin(bt*Math.PI)*.06};
  ang=easeAng(D.mAv||(D.mAv={}),ang,26);
  ctx.save();ctx.translate(230+ox,GROUND+dy);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,-dy+4,44,8,0,0,7);ctx.fill();
  ctx.rotate(rot);ctx.scale(sx,sy);drawRig(R,178,ang);ctx.restore();
}
function drawGinette(D,pulse){
  const R=RIGS.ginette,k=D.gPoseT>0?D.gPose:null,q=clamp(1-D.gPoseT/.28,0,1),e=Math.sin(Math.PI*q),v=(D.gVar||0)%2;
  const bt=Math.max(0,D.t)/BEAT,b=Math.sin(bt*Math.PI),bb=Math.abs(b),groove=Math.floor(bt/8)%4;
  let ang,rot=0,dy=-pulse*8,sx=1,sy=1,ox=0;
  // between the notes she grooves; the groove changes every 2 bars
  if(groove===0){rot=b*.12;ox=b*14;ang={legL:b*.25,legR:-b*.25,shaker:Math.sin(t*22)*.2,glass:b*.25,head:{r:-b*.1}}}                                        // hip sway
  else if(groove===1){rot=Math.sin(t*26)*.035;dy-=bb*6;ang={shaker:Math.sin(t*26)*.35,glass:-Math.sin(t*26)*.3,legL:.1,legR:-.1,head:{r:Math.sin(bt*Math.PI*2)*.09}}} // shoulder shimmy
  else if(groove===2){ox=Math.sign(b)*Math.sqrt(bb)*20;rot=b*.06;ang={legL:{r:Math.max(0,b)*.45,y:-Math.max(0,b)*6},legR:{r:Math.min(0,b)*.45,y:Math.min(0,b)*6},glass:-.5,shaker:-.2,head:{r:b*.12}}} // step-touch
  else{dy-=bb*10;rot=b*.05;ang={glass:-.9+b*.3,shaker:-.6-b*.3,legL:b*.15,legR:-b*.15,head:{r:.08,y:-bb*4}}}                                                       // vogue arms
  if(D.done){ang={glass:-1.1+Math.sin(t*4)*.15,shaker:-.4,head:{r:Math.sin(t*2)*.12},legL:Math.sin(t*4)*.2,legR:-Math.sin(t*4)*.2};rot=Math.sin(t*2)*.06}
  // on each note: a move, with two variants that alternate
  if(k==='l'){if(!v){rot=-.38*e;ox=-34*e;ang={shaker:-1.2*e,glass:.6,legL:.5*e,legR:-.2,head:{r:.22*e}}}                                       // hip bump
              else{rot=.1*e;ang={glass:-1.6*e,shaker:-1.3*e,legL:.3*e,legR:-.3*e,head:{r:-.18*e}}}}                                              // vogue
  else if(k==='r'){if(!v){sx=Math.cos(q*Math.PI*2);ang={shaker:1,glass:-1,legL:.25,legR:-.25,head:{r:0}}}                                     // diva spin
              else{rot=.15*e;ang={shaker:-.5,glass:-.8*e,legL:.2,legR:-.2,head:{r:-.55*Math.sin(Math.PI*2*q)}}}}                                 // hair flip
  else if(k==='j'){if(!v){dy=-e*52;ang={shaker:-1.6*e,glass:-1.4*e,legL:-.8*e,legR:.8*e,head:{r:0,y:-4*e}}}                                    // star jump
              else{dy=-e*30;rot=Math.sin(t*40)*.06*e;ang={shaker:-1.6*e,glass:-.3,legL:-.4*e,legR:.4*e,head:{r:Math.sin(t*30)*.1}}}}             // shimmy up
  else if(k==='d'){if(!v){sy=1-.18*e;sx=1+.12*e;ox=Math.sin(t*55)*8*e;rot=Math.sin(t*44)*.1*e;ang={shaker:.8*e,glass:.6*e,legL:.55*e,legR:-.55*e,head:{r:-.1*e}}} // shimmy down
              else{sy=1-.14*e;rot=-.1*e;ang={shaker:.4,glass:-.6*e,legL:.6*e,legR:.2,head:{r:Math.sin(Math.PI*2*q)*.3}}}}                         // dip + head roll
  ang.ex=D.done?{mouth:'smile',wink:'l',brow:-.4}:k==='j'?{mouth:'o',brow:-1}:k==='l'?{mouth:'grin',wink:'r',brow:-.5}:k==='r'?{mouth:'o',open:.6,blink:.6}:k==='d'?{mouth:'grin',brow:.3}:{mouth:'smile',brow:-.3,blink:blinkAt(5)};
  ang=easeAng(D.gAv||(D.gAv={}),ang,22);
  const V=easeVals(D.gTv||(D.gTv={}),{rot,ox,dy},18);
  ctx.save();ctx.translate(735+V.ox,GROUND+V.dy);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,-V.dy+4,70,10,0,0,7);ctx.fill();
  ctx.scale(-1,1);ctx.rotate(V.rot);ctx.scale(sx,sy);drawRig(R,215,ang);ctx.restore();
}

// ---------- registre ----------
defineLevel({
  id:'dance', n:6,
  name:'GINETTE', stage:'Ginette', chapter:'Ginette',
  dev:'Boss : Ginette', devTitle:'BOSS : GINETTE',
  track:'c', hour:()=>.5,
  place:()=>'Piste de danse',
  fx:{bloom:0.65},   // glow (src/gfx/effects.ts)
  start:setupDance,
  afterPhone:()=>{stopDanceMusic();setupDance()},   // the chart starts when the phone closes
  canPause:()=>false,
  update:updateDance, draw:drawDance,
  keydown:e=>{
    const dk={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'j',KeyW:'j',Space:'j',ArrowDown:'d',KeyS:'d'}[e.code];
    if(dk){e.preventDefault();if(!e.repeat)danceHit(dk);return true}
    return e.code==='KeyP'||e.code==='Escape'},   // P / Échap : pas de pause pendant la danse
  pad:()=>dance&&!dance.done?'dance':'none',
  tuto:{from:'Ginette',av:'#ff9ad5',msgs:['Personne sort sans danser, mon beau 💃'],tips:[['← ↓ ↑ →','quand la flèche touche la cible'],['60 %','des pas pour sortir']]},
  story:'Ginette, le patron, bloque la sortie : personne ne repart sans danser avec lui. Suis le rythme!',
  ctrl:[['Les pas','← ↓ ↑ →','CROIX']],
});
