// Écran titre : logo animé (flammes et braises).
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// the logo's flames: each row of pixels sways, more at the tips, with embers rising
const logoCv=document.getElementById('logoCv'),lctx=logoCv.getContext('2d'),logoImg=document.getElementById('logoSrc'),embers=[];
// title logo: the letters stay still, the flames behind them lick upward (each row sways, more at the tips) and throw embers
const logoNewCv=document.getElementById('logoNew'),lnCtx=logoNewCv.getContext('2d'),logoBaseIm=document.getElementById('logoBase'),logoFlameIm=document.getElementById('logoFlame'),lnEmbers=[];
function drawLogo(time){
  if(document.getElementById('title').hidden||!logoBaseIm.complete||!logoFlameIm.complete||!logoFlameIm.naturalWidth)return;
  const g=lnCtx,tt=time/1000,PAD=64,FB=400,LW=logoFlameIm.naturalWidth;
  g.clearRect(0,0,1100,720);
  // flames: a gentle stretch from the base, rows sway like heat
  const st=1+.045*Math.sin(tt*5.3)+.02*Math.sin(tt*12.7);
  for(let y=0;y<FB;y+=2){
    const k=Math.pow(1-y/FB,1.5),dx=(Math.sin(tt*6.2+y*.05)*9+Math.sin(tt*13.1+y*.13)*3.5)*k,yy=FB-(FB-y)*st;
    g.drawImage(logoFlameIm,0,y,LW,2,dx,PAD+yy,LW,2*st+.5);
  }
  g.drawImage(logoFlameIm,0,FB,LW,logoFlameIm.naturalHeight-FB,0,PAD+FB,LW,logoFlameIm.naturalHeight-FB);
  // embers
  if(Math.random()<.55)lnEmbers.push({x:Math.random()<.5?100+Math.random()*320:690+Math.random()*320,y:PAD+150+Math.random()*80,vx:(Math.random()-.5)*30,vy:-50-Math.random()*70,l:1});
  g.globalCompositeOperation='lighter';
  for(const e of lnEmbers){e.l-=.018;e.x+=e.vx*.016+Math.sin(tt*5+e.y*.05)*.7;e.y+=e.vy*.016;g.fillStyle=`rgba(255,${130+Math.round(e.l*90)},40,${Math.max(0,e.l)})`;g.beginPath();g.arc(e.x,e.y,2.5+e.l*3,0,7);g.fill()}
  g.globalCompositeOperation='source-over';
  for(let i=lnEmbers.length-1;i>=0;i--)if(lnEmbers[i].l<=0||lnEmbers[i].y<0)lnEmbers.splice(i,1);
  // letters on top, with a little bounce
  const bob=Math.sin(tt*2)*4;g.drawImage(logoBaseIm,0,PAD+bob);
}
// flame tongues on the GO MICHEL button
{const b=document.getElementById('start');for(let i=0;i<0;i++){const f=document.createElement('i');f.className='fl';f.style.left=(10+i*11.4+(Math.random()*5-2.5))+'%';f.style.animationDuration=(.32+Math.random()*.35)+'s';f.style.animationDelay=(-Math.random())+'s';f.style.height=`calc(clamp(22px,3vw,38px)*${(.55+Math.random()*.7).toFixed(2)})`;f.style.bottom=(70+Math.random()*12)+'%';b.appendChild(f)}}
