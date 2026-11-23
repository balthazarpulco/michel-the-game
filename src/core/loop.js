// Boucle principale (requestAnimationFrame).
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

let last=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;frameDt=dt;
  try{pollPad()}catch(e){}
  try{padTick()}catch(e){}
  {const pb=document.getElementById('pauseBtn'),v=state==='title'||!document.getElementById('title').hidden?'hidden':'';if(pb.style.visibility!==v)pb.style.visibility=v}
  try{runTick()}catch(e){}
  try{musicTick(dt)}catch(e){}
  drawLogo(now);
  if(state==='play')update(dt);
  else if(state==='title'){t+=dt;camX+=40*dt;player.x=camX+200;player.facing=1;
    for(const c of cars)c.wx+=c.v*dt;carTimer-=dt;if(carTimer<=0){carTimer=rnd(1.5,3);const d=Math.random()<.5?1:-1;cars.push({kind:pick(['green','pickup','ticoq']),dir:d,len:330,wx:camX*FG+(d>0?-380:W+40),v:d*rnd(260,380),ph:0})}
    cars=cars.filter(c=>{const sx=c.wx-camX*FG;return sx>-600&&sx<W+600});
    while(!genDone&&genX<camX+W*2)genChunk();camX=Math.min(camX,LEN[1]-W);}
  else if(state==='over'){t+=dt;for(const q of parts){q.life-=dt}}
  else if(state==='phone'&&phone){t+=dt;phone.t+=dt;if(phone.want&&phone.t>=.35)closePhone()}
  render();
  try{useHud();drawToasts(dt)}catch(e){}
  if(GFX){const D=LEVELS[level];GFX.present({t,dt,scale,level,state,drunk:state==='play'?drunk():0,night:frameNight,fxLevel:D&&D.fx||null})}
  requestAnimationFrame(loop);
}
