// Niveaux de rue (1 et 2) : génération des façades, plateformes, objets, itinérants et leurs routines.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

const BRICKS=['#b5553c','#a9493a','#c46a4a','#9c4434','#b8634c'];
function addFacade(f){
  f.color=f.color||pick(BRICKS);
  f.trim=f.trim||pick(['#2f6f6b','#3a7d7a','#e8dcc0','#4b6a8a']);
  f.bricks=[];for(let i=0;i<Math.floor(f.w*f.h/2600);i++)f.bricks.push([rnd(8,f.w-24),rnd(18,f.h-8)]);
  f.wins=[];
  const ground=f.kind==='resto'?0:f.kind==='triplex'?80:110;
  const cols=Math.max(1,Math.floor((f.w-30)/78)),gap=(f.w-cols*42)/(cols+1);
  const top=GROUND-f.h;
  const rows=f.kind==='resto'?0:Math.max(1,Math.floor((f.h-ground-110)/96)+1);
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    f.wins.push({x:gap+c*(42+gap),y:28+r*96,w:42,h:58,lit:Math.random()<.65,cat:Math.random()<.06});
  }
  facades.push(f);
  return f;
}
function addPlatform(x,y,w,kind){platforms.push({x,y,w,kind})}
// image buildings: height in game pixels; their balconies and ledges become platforms
const BLD_H={plex:320,fire:400,pink:320,church:360,house:215};
function addBuilding(k,x,w){
  const B=BLD[k],h=BLD_H[k],bw=Math.round(h*B.ar),bx=Math.round(x+Math.max(0,(w-bw)/2));
  const f=addFacade({x:bx,w:bw,h,kind:'img',img:'b_'+k,glow:k==='pink'?[[.04,.84,.6,.13]]:k==='house'?[[.26,.58,.24,.14]]:null});
  const top=GROUND-h,pl=[];
  for(const [a,b,y] of B.plats){const px=bx+a*bw,py=top+y*h;if(GROUND-py<30)continue;addPlatform(px,py,(b-a)*bw,'ledge');pl.push([px,py,(b-a)*bw])}
  pl.sort((p,q)=>p[1]-q[1]);
  // treats on the ledges: a beer on the highest, cigarettes on the rest
  pl.forEach((p,i)=>{if(i===0)addItem(p[0]+p[2]/2,p[1]-40,'beer');else if(Math.random()<.6)addItem(p[0]+p[2]*rnd(.3,.7),p[1]-36,'cig')});
  return {f,bw,bx,pl};
}
function addDeco(k,x,h,front){const D=DECO[k];decos.push({k,x,h,w:Math.round(h*D.ar),front:!!front})}
function streetDecor(x0,x1){
  const n=Math.random();
  if(n<.35)addDeco('tree_maple',x0+rnd(0,Math.max(1,x1-x0-150)),rnd(170,210));
  else if(n<.55)addDeco(pick(['planter','bush','grass','leaves']),x0+rnd(0,Math.max(1,x1-x0-110)),pick([46,54,60]));
  else if(n<.72){const c=pick(['cone_tall','cone_small','cone_dirty','cone_stack','cone_sign','cone_tip']);addDeco(c,x0+rnd(0,Math.max(1,x1-x0-60)),c==='cone_tall'||c==='cone_sign'?50:34,true)}
  else if(n<.82)addDeco(pick(['bar_stripe','bar_rack','bar_jersey','bar_water','bar_horse']),x0+rnd(0,Math.max(1,x1-x0-90)),36,true);
}
function addItem(x,y,type){items.push({x,y,type,ph:Math.random()*6})}

function genChunk(){
  const x=genX,n=nightAt(x),km=x/10000+(level===2?.35:0);
  if(x>=LEN[level]){
    // the goal: the dépanneur (level 1) or Chez Ginette (level 2)
    const w=level===1?520:560;
    lamps.push(x+10);
    const f=addFacade({x:x+40,w,h:level===1?300:290,kind:level===1?'dep':'bar',label:level===1?'DÉPANNEUR':'BAR CHEZ GINETTE',goal:true,color:level===1?'#c46a4a':'#5b2f3a',neon:'#ff5d8f'});
    goal={x:f.x+f.w-82,w:54,f};
    addFacade({x:x+40+w+24,w:420,h:320,kind:'triplex'});
    for(let i=0;i<5;i++)addItem(x-200+i*50,GROUND-40,i%2?'beer':'cig');
    genDone=true;genX+=w+520;return;
  }
  const types=['street','street','street','stairs','stairs','resto'];
  if(n>.6)types.push('bar','bar','bar');
  let tp=pick(types);
  if(tp==='resto'&&x-lastResto<1800)tp=pick(['street','stairs']);
  if(firstResto&&x>900){tp='resto'}
  if(tp==='resto')lastResto=x;
  lamps.push(x+20);
  if(tp==='street'){
    let w=rnd(420,560);
    const kind=pick(['shopimg','pink','fire','house','pink','fire',level===1&&x>2500&&!churchDone?'church':'house']);
    if(kind!=='shopimg'){
      if(kind==='church')churchDone=true;
      const bw=Math.round(BLD_H[kind]*BLD[kind].ar);w=Math.max(w,bw+90);
      addBuilding(kind,x+40,w-80);
      streetDecor(x+10,x+w-10);
      const nItems=2+Math.floor(Math.random()*3),sx=x+rnd(60,140);
      for(let i=0;i<nItems;i++)addItem(sx+i*55,GROUND-38,'cig');
      if(Math.random()<.45+km*.25+DF.bumP)addBum(x+80,x+w-40);
      genX+=w;return;
    }
    if(kind==='shopimg'){const im=level===1?'cinema':pick(['cinema','ribotti']),fh=im==='cinema'?250:220,fw=Math.round(FAC[im].w*fh/FAC[im].h);addFacade({x:x+30+Math.max(0,(w-60-fw)/2),w:fw,h:fh,kind:'img',img:im,glow:im==='cinema'?[[.3,.2,.4,.17]]:[[.27,.27,.5,.5]]})}
    else addFacade({x:x+30,w:w-60,h:rnd(250,320),kind});
    if(kind==='triplex'){
      const bx=x+30+rnd(20,w-200);
      addPlatform(bx,GROUND-128,140,'balcony');addItem(bx+70,GROUND-170,'beer');
      if(Math.random()<.5){addPlatform(bx+60,GROUND-250,130,'balcony');addItem(bx+125,GROUND-290,'cig')}
    }
    const nItems=3+Math.floor(Math.random()*3),sx=x+rnd(60,140);
    for(let i=0;i<nItems;i++)addItem(sx+i*55,GROUND-38-(Math.random()<.3?70:0),'cig');
    if(Math.random()<.45+km*.25+DF.bumP)addBum(x+80,x+w-40);
    genX+=w;
  }else if(tp==='stairs'){
    // a Plateau plex with spiral stairs: the balconies are platforms
    const bw=Math.round(BLD_H.plex*BLD.plex.ar),w=Math.max(rnd(460,560),bw+90);
    const B=addBuilding('plex',x+40,w-80);
    streetDecor(x+10,B.bx-10);
    const top=B.pl[0];
    if(!rbPlaced&&x>2300&&top){rbPlaced=true;addItem(top[0]+top[2]*.8,top[1]-110,'rb')}
    addBum(x+200,x+w-30);
    if(Math.random()<.4+km*.2+DF.bumP)addBum(x+260,x+w-30);
    genX+=w;
  }else if(tp==='resto'){
    const im=pick(['belle','poutine','boustan']),fh=196,bw=Math.round(FAC[im].w*fh/FAC[im].h),can=x+60;
    addPlatform(can,GROUND-62,54,'can');
    const bx=x+150,roof=GROUND-fh;
    const name={belle:'LA BELLE PROVINCE',poutine:'POUTINEVILLE',boustan:'BOUSTAN'}[im];
    addFacade({x:bx,w:bw,h:fh,kind:'img',img:im,glow:[[.25,.55,.5,.3]]});
    addPlatform(bx+4,roof+4,bw-8,'roof');
    for(let i=0;i<4;i++)addItem(bx+40+i*(bw-80)/3,roof-40,i%2?'beer':'cig');
    if(!rbPlaced&&x>3200){rbPlaced=true;addItem(bx+bw/2,roof-120,'rb')}
    addItem(can+27,GROUND-110,'cig');
    firstResto=false;
    genX+=150+bw+120;
  }else if(tp==='bar'){
    const w=rnd(460,560);
    const name=pick(['TAVERNE LE PLATEAU','BAR LE TI-COQ','BRASSERIE ST-LAURENT','BAR LE CLAQUE']);
    {const fh=250,fw=Math.round(FAC.siboire.w*fh/FAC.siboire.h),fx=x+20+Math.max(0,(w-40-fw)/2);
     dangers.push({x:fx+.42*fw,y:GROUND-110,w:.11*fw,h:110,name,bar:true,respawn:{x:x+10,y:GROUND-96},hint:firstBar,hintA:'PAS DEVANT LA PORTE DU BAR',hintB:'SAUTE SUR L\'AUVENT'});firstBar=false;
     addFacade({x:fx,w:fw,h:fh,kind:'img',img:'siboire',glow:[[.15,.31,.23,.25],[.55,.31,.11,.25]],neonTxt:name})}
    const count=2+(Math.random()<.4+km*.2+DF.bumP?1:0);
    for(let i=0;i<count;i++){
      const px=x+120+i*rnd(150,175);
      const who=nextColl();
      enemies.push({type:'patron',who,dh:104,x:px,y:GROUND-92,w:34,h:92,ph:Math.random()*6,col:pick(['#e76f51','#2a9d8f','#e9c46a','#8d6cab','#f4a3b5','#5fa8d3']),skin:pick(['#f2c9a0','#d9a07a','#a86e4b','#7a4a30']),hair:pick(['#2b2018','#c98a3b','#6b4a2e','#d9d2c3','#1d1d1d']),say:pick(COLL[who].say)});
      addItem(px+17,GROUND-190,'beer');
    }
    addPlatform(x+70,GROUND-150,Math.min(w-140,count*170),'awning');
    genX+=w;
  }
}
function addBum(a,b){
  const n=nightAt(a);
  const pool=['itin1','itin2','vieille1','vieille2','punk2'];
  if(n>.5)pool.push('drag','drag','punk2','itin2');else pool.push('vieille1','vieille2');
  const who=pick(pool),c=CAST[who],R=RIGS[who];
  const dw=R.w*c.h/R.h,w=Math.round(dw*(who==='vieille1'?.72:.56)),h=Math.round(c.h*.86);
  const x=rnd(a,Math.max(a+1,b-w-10));
  enemies.push({type:'bum',who,x,y:GROUND-h,w,h,dh:c.h,vx:rnd(c.spd[0],c.spd[1]+distance/500)*DF.bumSpd*(Math.random()<.5?-1:1),min:a,max:Math.max(a+w+20,b),say:pick(c.say),walk:Math.random()*6});
}

// ---------- street characters' little routines ----------
const ACTS={itin1:['vomit','sip','sip'],itin2:['vomit','sip'],vieille1:['charge','charge'],vieille2:['scold'],punk2:['sign','vomit'],drag:['pose'],patron:['vomit']};
const ACT_INFO={vomit:[1.6,'Bleurgh…'],sip:[1.6,'Slurp…'],charge:[1.4,'Tassez-vous!'],scold:[1.3,'Voyou! Voyou!'],sign:[1.7,'Un p\'tit don?'],pose:[1.4,'Slay, darling!']};
function startAct(e){
  const a=pick(ACTS[e.type==='bum'?e.who:'patron']);
  e.act=a;e.actLen=e.actDur=ACT_INFO[a][0];e.actSay=ACT_INFO[a][1];e.done=false;
  const toP=Math.sign(player.x-e.x)||1;
  if(e.type==='bum'&&a==='charge')e.vx=Math.abs(e.vx)*toP;
  e.f=e.type==='bum'?(Math.sign(e.vx)||1):toP;
}
function doAct(e,dt){
  e.actDur-=dt;const el=e.actLen-e.actDur,f=e.f;
  const dh=e.dh||e.h+12,mx=e.x+e.w/2+f*dh*.2,my=GROUND-dh*.58;
  if(e.act==='vomit'){
    if(el>.45&&el<1.25)for(let i=0;i<2;i++)parts.push({x:mx,y:my,vx:f*rnd(70,200),vy:rnd(-80,30),life:.7,max:.7,c:pick(['#9bbf3b','#c7d36f','#7fa32b','#e0c35a']),r:rnd(2,4.5),g:900});
    if(!e.done&&el>1.25){e.done=true;puddles.push({x:mx+f*40-38,w:76,life:16,seed:Math.random()*9})}
  }else if(e.act==='charge'){
    e.x=clamp(e.x+f*160*dt,e.min,e.max-e.w);e.walk=(e.walk||0)+dt*14;
  }else if(e.act==='pose'&&Math.random()<dt*14){
    parts.push({x:e.x+e.w/2+rnd(-40,40),y:GROUND-dh*rnd(.4,1),vx:0,vy:-30,life:.6,max:.6,c:pick(['#ff9ad5','#fff4dc','#ffd166']),r:rnd(2,3.5),g:0});
  }
  if(e.actDur<=0){e.act=null;e.actT=rnd(5,11)}
}
function splash(x,y){for(let i=0;i<10;i++)parts.push({x,y,vx:rnd(-150,150),vy:rnd(-260,-60),life:.6,max:.6,c:pick(['#6b4226','#8a5a3b','#f3e9d2']),r:rnd(2,5),g:900})}

// the street levels start here (called by startLevel, after the common reset)
function setupStreet(l){
  if(l!==1)addFacade({x:-40,w:300,h:300,kind:'triplex'});
  for(let i=0;i<4;i++)addItem(330+i*60,GROUND-40,i===3?'beer':'cig');
  genX=l===1?930:560;
  // Mile End: the street opens on Ribotti Vintage, right next to the office
  // Michel walks out of Ribotti Vintage's door, onto boulevard Saint-Laurent
  if(l===1){const fh=260,fw=Math.round(FAC.ribotti.w*fh/FAC.ribotti.h),fx=-20;addFacade({x:fx,w:fw,h:fh,kind:'img',img:'ribotti',glow:[[.27,.27,.5,.5]]});
    facades.push({x:fx+fw+6,w:70,h:250,kind:'stsign'});lamps.push(fx+fw+140);genX=fx+fw+90;
    player.x=fx+fw*.858-player.w/2;player.facing=1;doorOut={x:fx+fw*.808,w:fw*.1,y:GROUND-fh*.62,h:fh*.6,t:1.2}}
  while(genX<W*2.5&&!genDone)genChunk();
}

// ---------- registre ----------
defineLevel({
  id:1, n:2,
  name:'BOULEVARD SAINT-LAURENT', stage:'Mile End', chapter:'Boul. Saint-Laurent',
  dev:'Saint-Laurent', devTitle:'NIVEAU 1',
  track:'a', hour:x=>14+clamp(x/LEN[1],0,1)*5.6,
  place:left=>`Dépanneur : ${left} m`,
  start:()=>setupStreet(1),
  keys:[['← →','bouger'],['ESPACE','sauter'],['E','lancer une bière'],['MAJ','sprint']],
  legend:true,
  tuto:{from:'LD',av:'#c98a3b',msgs:['Arrête au dép pour des bières!'],tips:[['E','lancer une bière'],['ESPACE','saute sur la tête des passants'],['TOITS','balcons, auvents pis toits : grimpe partout'],['MAJ','sprint'],['10 CLOPES','= 1 vie de plus']]},
  story:'16 h 45, boulevard Saint-Laurent, devant Ribotti Vintage. Ramasse des clopes, évite le monde sur le trottoir pis rends-toi au dépanneur chercher de la bière.',
  ctrl:[...CTRL_MOVE,['Descendre d\'un balcon','↓ · S','CROIX ↓'],['Sprint','MAJ','RB · RT · Y'],['Lancer une bière','E','B · X']],
});

// ---------- registre ----------
defineLevel({
  id:2, n:4,
  name:'LE BOULEVARD', stage:'Boulevard', chapter:'Le boulevard',
  dev:'Le boulevard', devTitle:'NIVEAU 2',
  track:'b', hour:x=>(21+clamp(x/LEN[2],0,1)*4.5)%24,
  place:left=>`Chez Ginette : ${left} m`,
  start:()=>setupStreet(2),
  keys:[['← →','bouger'],['ESPACE','sauter'],['E','lancer une bière'],['MAJ','sprint']],
  legend:true,
  tuto:{from:'LD',av:'#c98a3b',msgs:['On t\'attend chez Ginette!'],tips:[['BARS','passe sur l\'auvent : la porte te coûte une vie'],['E','une bière = un K.O.'],['⚠','trop de bières en main = tu tangues']]},
  story:'21 h, le boulevard s\'allume. Rejoins le bar Chez Ginette sans te faire embarquer par tes collègues devant les bars.',
  ctrl:[...CTRL_MOVE,['Descendre d\'un auvent','↓ · S','CROIX ↓'],['Sprint','MAJ','RB · RT · Y'],['Lancer une bière','E','B · X']],
});
