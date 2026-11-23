// Aides des mini-jeux : particules, bannière, barres.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// =====================================================================
// Mini-games: Paper Toss 98 (kill time), the limo, blackjack, pinball
// =====================================================================
const MP={x:0,y:0,down:false,ids:{}};
function fxBurst(x,y,cols,n,sp){if(GFX){const c=(cols||[]).map(h=>parseInt(String(h).slice(1,7),16)).filter(v=>!isNaN(v));if((n||16)>=40)juiceWin(x,y);else juiceHit(x,y,c.length?c:undefined,(n||16)>=24)}for(let i=0;i<(n||16);i++){const a=Math.random()*7,v=rnd(80,sp||320);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,life:.8,max:.8,c:pick(cols),r:rnd(2,4.5),g:700})}}
function mgParts(dt){for(const q of parts){q.life-=dt;q.vy+=(q.g||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt}parts=parts.filter(q=>q.life>0);for(const q of popups){q.t-=dt;q.y-=40*dt}popups=popups.filter(q=>q.t>0);if(banner){banner.t-=dt;if(banner.t<=0)banner=null}shake=Math.max(0,shake-dt)}
function mgDrawParts(){for(const q of parts){ctx.globalAlpha=clamp(q.life/q.max*1.5,0,1);ctx.fillStyle=q.c;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,7);ctx.fill()}ctx.globalAlpha=1;
  for(const q of popups){ctx.globalAlpha=clamp(q.t*2,0,1);ctx.font='20px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.strokeText(q.text,q.x,q.y);ctx.fillStyle=q.c;ctx.fillText(q.text,q.x,q.y);ctx.globalAlpha=1}}
function mgBanner(){if(!banner)return;ctx.globalAlpha=clamp(banner.t*2,0,1);ctx.font='28px "Lilita One", Inter, Arial';const w=Math.min(W-40,ctx.measureText(banner.text).width+60);
  ctx.fillStyle='#2a1240';pg(W/2-w/2,H/2-36,w,64);ctx.fill();ctx.fillStyle=banner.c||'#ff3d9a';pg(W/2-w/2,H/2-40,w,64);ctx.fill();signText(banner.text,W/2,H/2-8,w-30,28,'#fff');
  if(banner.sub){ctx.font='700 15px Inter, Arial';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle=INK;ctx.strokeText(banner.sub,W/2,H/2+46);ctx.fillStyle='#fff4dc';ctx.fillText(banner.sub,W/2,H/2+46)}ctx.globalAlpha=1}
function mgBar(label,sub,v,col,x){const bw=280,mx=x??W/2-bw/2;ctx.fillStyle='rgba(32,13,56,.86)';pg(mx-14,12,bw+28,50);ctx.fill();htFill();
  ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='14px "Lilita One", Inter, Arial';ctx.fillStyle=col;ctx.fillText(label,mx,30);
  ctx.textAlign='right';ctx.font='600 12px Inter, Arial';ctx.fillStyle='#f4e7c8';ctx.fillText(sub,mx+bw,30);
  ctx.fillStyle='#3a2a34';pg(mx,38,bw,12);ctx.fill();ctx.fillStyle=col;pg(mx,38,Math.max(0,bw*clamp(v,0,1)),12);ctx.fill()}
