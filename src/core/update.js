// update(dt) : la logique de chaque frame. Les mini-jeux ont leur update (registre) ; sinon, le platformer commun (rues, boss, studio, chez Michel).
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

function update(dt){
  t+=dt;
  const D=LEVELS[level];
  if(D.update){D.update(dt);return}       // mini-games run their own frame
  if(D.frozen&&D.frozen(dt))return;       // platformer cut-scenes (office intro, getting caught, waking up…)
  const p=player;
  jumpBuf=Math.max(0,jumpBuf-dt);
  p.inv=Math.max(0,p.inv-dt);p.dropT=Math.max(0,p.dropT-dt);p.land=Math.max(0,p.land-dt);
  p.pukeT=Math.max(0,(p.pukeT||0)-dt);p.pukeCd=Math.max(0,(p.pukeCd||0)-dt);soberT=Math.max(0,soberT-dt);
  if(p.pukeT>0){jumpBuf=0;
    const sw=p.sw||66,left=p.x+p.w/2-sw/2,top=p.y+p.h-112,mx=p.facing>0?left+sw*.66:left+sw*.34;
    if(p.pukeT>.25)for(let i=0;i<2;i++)parts.push({x:mx+p.facing*10,y:top+64,vx:p.facing*rnd(60,180),vy:rnd(-40,60),life:.6,max:.6,c:pick(['#9bbf3b','#c7d36f','#7fa32b','#e0c35a']),r:rnd(2,4.5),g:900});
    if(!p.puddled&&p.pukeT<.3){p.puddled=true;puddles.push({x:mx+p.facing*55-35,w:70,life:20,seed:Math.random()*9})}
  }
  const dir=p.pukeT>0?0:(keys.r?1:0)-(keys.l?1:0);
  // the more beers Michel carries, the more he sways
  const d=drunk();
  p.slip=Math.max(0,p.slip-dt);
  const max=(keys.s?SPRINT:SPEED)*(p.onGround?1-.25*d:1);
  let acc=p.onGround?2600*(1-.6*d):1500;
  if(p.slip>0)acc=180;
  const sway=p.onGround?Math.sin(t*1.25+Math.sin(t*.63)*2.2)*170*d:0;
  p.vx+=clamp(dir*max+sway-p.vx,-acc*dt,acc*dt);
  if(dir)p.facing=dir;
  p.hic-=dt;
  if(d>.4&&p.hic<=0&&p.onGround){p.hic=rnd(2.5,5)/d;popups.push({x:p.x+p.w/2,y:p.y-8,text:'HIC!',t:.8,c:'#fff4dc'});beep(700,1200,.08,'sine',.06)}
  if(keys.d&&p.onGround)p.dropT=.25;
  if(jumpBuf>0&&(p.onGround||p.coyote>0)){p.vy=-JUMP;p.onGround=false;p.coyote=0;jumpBuf=0;sfx.jump()}
  p.vy+=G*dt;
  if(!keys.j&&p.vy<0)p.vy+=G*1.4*dt;
  p.vy=Math.min(p.vy,1100);
  p.x+=p.vx*dt;
  if(p.onGround)p.walk+=Math.abs(p.vx)*dt*.055;
  if(p.x<4){p.x=4;p.vx=Math.max(0,p.vx)}
  if(level==='boss'&&p.x<camX+4){p.x=camX+4;p.vx=Math.max(0,p.vx)}
  if(level==='boss'){const mx=boss&&boss.state==='down'?W-p.w-4:W-20-p.w;if(p.x>mx){p.x=mx;p.vx=0}}
  if(goal&&p.x>goal.f.x+goal.f.w-p.w-10){p.x=goal.f.x+goal.f.w-p.w-10;p.vx=0}
  const prevB=p.y+p.h;
  p.y+=p.vy*dt;
  const was=p.onGround;p.onGround=false;
  if(p.y+p.h>=GROUND){p.y=GROUND-p.h;p.vy=0;p.onGround=true}
  if(p.vy>=0&&p.dropT<=0){
    for(const pl of platforms){
      if(prevB<=pl.y+2&&p.y+p.h>=pl.y&&p.x+p.w>pl.x+6&&p.x<pl.x+pl.w-6){p.y=pl.y-p.h;p.vy=0;p.onGround=true}
    }
  }
  if(!p.onGround)p.peak=Math.min(p.peak??p.y,p.y);
  if(p.onGround&&!was){p.land=.12;if(level===3)landNoise(p.y-(p.peak??p.y));p.peak=p.y}
  if(p.onGround&&p.y+p.h>=GROUND-1&&p.slip<=0)for(const pd of puddles){
    if(p.x+p.w>pd.x+8&&p.x<pd.x+pd.w-8){p.slip=1;p.vx=(Math.abs(p.vx)>40?p.vx:p.facing*120)*1.35;popups.push({x:p.x+p.w/2,y:p.y-8,text:'OUACHE! ÇA GLISSE',t:1,c:'#c7d36f'});beep(500,150,.25,'sine',.06);break}
  }
  p.coyote=p.onGround?.09:Math.max(0,p.coyote-dt);
  maxX=Math.max(maxX,p.x);distance=maxX-120;
  if(level===3){camX=clamp(p.x-380,0,HOME_LEN-W);if(p.x>HOME_LEN-60)p.x=HOME_LEN-60}
  else if(level==='office'){const r0=office&&office.room?XB:0;camX=clamp(p.x-380,r0,r0+ROOM_W-W)}
  else if(level!=='boss'){camX=Math.max(0,camX+(p.x-360-camX)*Math.min(1,dt*10));if(goal)camX=Math.min(camX,goal.f.x+goal.f.w+80-W)}
  if(goal&&p.onGround&&p.x+p.w/2>goal.x&&p.x+p.w/2<goal.x+goal.w){reachGoal();return}

  // throwing beers
  throwCd-=dt;p.throwT=Math.max(0,p.throwT-dt);
  if(level==='office')throwReq=false;
  if(throwReq&&level===3){throwReq=false;
    if(p.pukeCd>0||!p.onGround)popups.push({x:p.x+p.w/2,y:p.y-14,text:p.pukeCd>0?'PLUS RIEN À RENDRE…':'PAS EN L\'AIR!',t:1,c:'#c7d36f'});
    else{p.pukeT=1.1;p.pukeCd=8;p.puddled=false;soberT=6.1;p.vx=0;beep(220,90,.5,'sawtooth',.05);makeNoise(.15,'MICHEL A VOMI DANS LE SALON');
      popups.push({x:p.x+p.w/2,y:p.y-14,text:'BLEURGH… · SOBRE 5 S',t:1.4,c:'#c7d36f'})}
  }
  if(throwReq){
    throwReq=false;
    if(ammo>0&&throwCd<=0){ammo--;throwCd=.3;p.throwT=.28;sfx.throw();
      bottles.push({x:p.x+p.w/2+p.facing*18,y:p.y+34,vx:p.facing*620+p.vx*.35,vy:-330,r:0,f:p.facing})}
    else if(ammo<=0)popups.push({x:p.x+p.w/2,y:p.y-14,text:'PLUS DE BIÈRE!',t:1,c:'#ff9a9a'});
  }
  for(const b of bottles){
    b.vy+=1500*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.r+=b.f*14*dt;
    for(const e of enemies){if(e.ko||b.dead)continue;if(b.x>e.x&&b.x<e.x+e.w&&b.y>GROUND-(e.dh||e.h)&&b.y<GROUND){knockOut(e,b);b.dead=true}}
    if(!b.dead&&boss&&boss.state!=='down'&&boss.state!=='intro'&&overlap({x:b.x-8,y:b.y-8,w:16,h:16},bossBox())){hitBoss(b);b.dead=true}
    if(!b.dead&&b.y>GROUND-4){b.dead=true;shatter(b.x,GROUND-4)}
    if(b.x<camX-60||b.x>camX+W+60)b.dead=true;
  }
  bottles=bottles.filter(b=>!b.dead);
  if(boss)updateBoss(dt);
  if(level===3)updateHome(dt);
  if(level==='office')updateOffice(dt);
  for(const c of cans){
    c.x+=c.vx*dt;c.r+=c.vx*dt/8;
    if(overlap({x:p.x+8,y:p.y+12,w:p.w-16,h:p.h-14},{x:c.x-8,y:GROUND-18,w:16,h:18})){c.dead=true;hurt('UNE CANETTE DANS LES CHEVILLES',Math.sign(c.vx)*-1||1)}
    if(c.x<camX-60||c.x>camX+W+60)c.dead=true;
  }
  cans=cans.filter(c=>!c.dead);
  for(const pd of puddles)pd.life-=dt;
  puddles=puddles.filter(pd=>pd.life>0&&pd.x+pd.w>camX-200);

  // resto doors
  for(const d of dangers)if(overlap({x:p.x+6,y:p.y+10,w:p.w-12,h:p.h-10},d))enterResto(d);
  // enemies
  for(const e of enemies){
    if(e.ko){e.kvy+=G*dt;e.ky+=e.kvy*dt;e.x+=e.kvx*dt;e.rot+=Math.sign(e.kvx)*5*dt;continue}
    const onScreen=e.x+e.w>camX+40&&e.x<camX+W-40;
    if(e.actT===undefined)e.actT=rnd(2,7);
    if(e.act)doAct(e,dt);
    else{
      if(e.type==='bum'){
        e.x+=e.vx*dt;e.walk=(e.walk||0)+Math.abs(e.vx)*dt*CAST[e.who].step;
        if(e.x<e.min){e.x=e.min;e.vx=Math.abs(e.vx)}
        if(e.x+e.w>e.max){e.x=e.max-e.w;e.vx=-Math.abs(e.vx)}
      }
      e.actT-=dt;
      if(e.actT<=0&&onScreen)startAct(e);
    }
    e.near=Math.abs((e.x+e.w/2)-(p.x+p.w/2))<230;
    // stomp: landing on a head knocks them out
    if(p.vy>0&&prevB<=e.y+24&&p.y+p.h>=e.y&&p.x+p.w>e.x+4&&p.x<e.x+e.w-4){
      knockOut(e,{x:p.x+p.w/2,y:e.y,vx:p.facing},true);p.vy=keys.j?-760:-560;p.onGround=false;continue;
    }
    if(state==='play'&&overlap({x:p.x+8,y:p.y+12,w:p.w-16,h:p.h-14},{x:e.x+6,y:e.y+10,w:e.w-12,h:e.h-10})){
      hurt(e.type==='bum'?CAST[e.who].hurt:'TES COLLÈGUES T\'ONT EMBARQUÉ POUR UNE DERNIÈRE',Math.sign((e.x+e.w/2)-(p.x+p.w/2))||1);
    }
  }
  // items
  for(const it of items){
    if(it.taken)continue;
    if(Math.abs(it.x-(p.x+p.w/2))<30&&it.y>p.y-14&&it.y<p.y+p.h+10){
      it.taken=true;
      const pts=it.type==='cig'?10:it.type==='rb'?100:25;score+=pts;
      if(it.type==='cig'){run.cigs++;if(run.cigs>=50)award('cig');
        cigs++;sfx.cig();
        if(cigs%10===0){lives=Math.min(MAXL,lives+1);popups.push({x:it.x,y:it.y-36,text:'10 CLOPES · +1 VIE!',t:1.4,c:'#ff9ad5'});setTimeout(()=>beep(660,1320,.18,'triangle',.08),120)}
      }else if(it.type==='rb'){
        lives=Math.min(MAXL,lives+3);sfx.beer();setTimeout(()=>beep(880,1760,.25,'triangle',.08),100);
        popups.push({x:it.x,y:it.y-36,text:'BOISSON ÉNERGISANTE · +3 VIES!',t:1.6,c:'#5ee0ff'});shake=.15;
      }else{beers++;ammo++;sfx.beer()}
      popups.push({x:it.x,y:it.y-10,text:'+'+pts,t:.9,c:it.type==='cig'?'#fff4dc':'#ffbf47'});
      for(let i=0;i<8;i++)parts.push({x:it.x,y:it.y,vx:rnd(-140,140),vy:rnd(-220,-40),life:.5,max:.5,c:it.type==='cig'?'#ff9a3c':'#ffd27a',r:rnd(2,4),g:500});
    }
  }
  // smoke from the cigarette
  smokeT-=dt;
  if(smokeT<=0){
    smokeT=.09;
    const sw=player.sw||66,sh=112,left=p.x+p.w/2-sw/2,top=p.y+p.h-sh;
    const mx=p.facing>0?left+sw*HERO_CIG.x:left+sw*(1-HERO_CIG.x);
    parts.push({x:mx+p.facing*3,y:top+sh*HERO_CIG.y+4,vx:rnd(-12,12)-p.vx*.15,vy:rnd(-50,-30),life:1.4,max:1.4,smoke:true,r:rnd(3,5),g:-10});
  }
  for(const q of parts){q.life-=dt;q.vy+=(q.g||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.g>0&&q.y>GROUND+4&&level!=='dance'&&level!=='bike'){q.y=GROUND+4;q.vy=0;q.vx*=.5}if(q.smoke){q.r+=dt*7;q.x+=Math.sin(t*3+q.y*.05)*12*dt}}
  parts=parts.filter(q=>q.life>0);
  for(const q of popups){q.t-=dt;q.y-=40*dt}
  popups=popups.filter(q=>q.t>0);
  if(banner){banner.t-=dt;if(banner.t<=0)banner=null}
  shake=Math.max(0,shake-dt);

  // cars (foreground)
  carTimer-=dt;
  if(carTimer<=0&&level!=='boss'&&level!==3&&level!=='office'){
    carTimer=rnd(1.2,3.6);
    const dirC=Math.random()<.5?1:-1,kind=pick(['green','pickup','ticoq']);
    const len=kind==='pickup'?360:330;
    cars.push({kind,dir:dirC,len,wx:camX*FG+(dirC>0?-len-40:W+40),v:dirC*rnd(260,420),ph:Math.random()*6});
  }
  for(const c of cars)c.wx+=c.v*dt;
  cars=cars.filter(c=>{const sx=c.wx-camX*FG;return sx>-c.len-200&&sx<W+200});

  // generate & cull
  while(level!=='boss'&&!genDone&&genX<camX+W*2)genChunk();
  const cut=-1e9;
  facades=facades.filter(f=>f.x+f.w>cut);platforms=platforms.filter(o=>o.x+o.w>cut);dangers=dangers.filter(o=>o.x+o.w>cut);
  enemies=enemies.filter(o=>o.x+o.w>cut&&!(o.ko&&o.ky>700));decos=decos.filter(d=>d.x+d.w>cut);items=items.filter(o=>o.x>cut&&!(o.taken));lamps=lamps.filter(x=>x>cut);
}
