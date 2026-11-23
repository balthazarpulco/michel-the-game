// PNJ de la rue : clients, collègues, itinérants, bulles.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

function star(x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle='#ffd166';ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<10;i++){const r=i%2?4:9,a=i*Math.PI/5-Math.PI/2;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
function drawPatron(e,n){
  const x=e.x-camX;if(x<-60||x>W+60)return;
  if(e.who&&RIGS[e.who]){drawColleague(e,x);return}
  let sway=Math.sin(t*2.2+e.ph)*.08;const cx=x+e.w/2;
  if(e.act==='vomit'){const el=e.actLen-e.actDur;sway=e.f*Math.min(.38,el*.9)*(e.actDur<.25?e.actDur/.25:1)}
  ctx.save();ctx.translate(cx,GROUND+(e.ky||0));ctx.rotate(sway+(e.rot||0));
  ctx.strokeStyle=INK;ctx.lineWidth=3;
  // legs
  ctx.fillStyle='#2e3a46';ctx.fillRect(-12,-34,10,34);ctx.fillRect(2,-34,10,34);ctx.strokeRect(-12,-34,10,34);ctx.strokeRect(2,-34,10,34);
  // body
  ctx.fillStyle=e.col;rr(-18,-74,36,44,10);ctx.fill();ctx.stroke();
  // arm with beer
  ctx.save();ctx.translate(14,-64);ctx.rotate(-.9+Math.sin(t*3+e.ph)*.25);
  ctx.fillStyle=e.col;rr(-4,0,9,24,4);ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffbf47';rr(-6,22,14,18,2);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(-6,20,14,5);
  ctx.restore();
  // head
  ctx.fillStyle=e.skin;ctx.beginPath();ctx.arc(0,-90,18,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle=e.hair;ctx.beginPath();ctx.arc(0,-95,18,Math.PI*1.05,Math.PI*1.95);ctx.fill();ctx.stroke();
  ctx.fillStyle=INK;ctx.beginPath();ctx.arc(-6,-90,2.2,0,7);ctx.arc(6,-90,2.2,0,7);ctx.fill();
  ctx.beginPath();ctx.lineWidth=2;ctx.arc(0,-84,6,.2,Math.PI-.2);ctx.stroke();
  ctx.fillStyle='rgba(230,90,90,.45)';ctx.beginPath();ctx.arc(-10,-84,4,0,7);ctx.arc(10,-84,4,0,7);ctx.fill();
  ctx.restore();
}
function drawColleague(e,x){
  const k=e.who,ph=e.ph,f=Math.sign(player.x-e.x)||1;
  // waiting at the bar door: weight shifts, a beer in hand, waving Michel over
  const b=t*1.9+ph,sn=Math.sin(b);
  let tilt=sn*.04,dy=Math.abs(Math.sin(b))*-3;
  const ang={head:{r:Math.sin(b+.7)*.06},legL:Math.max(0,sn)*.12,legR:Math.min(0,sn)*.12};
  const wave=e.near&&!e.act;
  if(k==='cw1')ang.armL=wave?1.9+Math.sin(t*9+ph)*.3:-.15+sn*.08;
  if(k==='cw2'){ang.armR=wave?-.5+Math.sin(t*7)*.3:sn*.15;ang.armL=sn*.1}
  if(k==='cw6'||k==='cw7'||k==='cw8'){ang.armL=wave?1.9+Math.sin(t*9+ph)*.3:sn*.08;ang.armR=-sn*.08}
  if(k==='cw5')ang.armL=wave?1.9+Math.sin(t*9+ph)*.3:sn*.1;
  if(k==='cw3'||k==='cw4'){tilt=sn*(wave?.1:.05);if(wave)dy=-Math.abs(Math.sin(t*6+ph))*8}
  if(e.act==='vomit'){const el=e.actLen-e.actDur;tilt=f*Math.min(.32,el*.9)*(e.actDur<.25?e.actDur/.25:1);ang.head={r:.15*f};ang.legL=ang.legR=0}
  ang.hair=ang.hairR=ang.head;
  ang.ex=e.act==='vomit'?{blink:.7,mouth:'o'}:wave?{mouth:'grin',blink:blinkAt(ph)}:{blink:blinkAt(ph)};
  ctx.save();ctx.translate(x+e.w/2,GROUND+dy+(e.ky||0));
  if(f<0)ctx.scale(-1,1);ctx.rotate(tilt+(e.rot||0)*f);
  drawRig(RIGS[k],e.dh,ang);ctx.restore();
}
function drawBum(e){
  const x=e.x-camX;if(x<-100||x>W+100)return;
  const c=CAST[e.who],wk=e.walk||0,sn=Math.sin(wk),cs=Math.cos(wk),k=sn*c.stride;
  const bob=Math.abs(sn)*3;
  // walk cycle: hips swing, the forward foot lifts, the head bobs a beat behind
  const ang={legL:{r:k,y:-Math.max(0,cs)*5},legR:{r:-k,y:-Math.max(0,-cs)*5},head:{r:Math.sin(wk*2+.6)*.025,y:Math.abs(cs)*1.4}};
  let tilt=Math.sin(wk*2)*.015;
  if(e.who==='itin1'){ang.armR={r:Math.sin(t*1.7+e.x*.01)*.06-k*.2}}
  else if(e.who==='itin2'){ang.armR={r:Math.sin(t*1.5+e.x*.01)*.06-k*.2};ang.armL=k*.45}
  else if(e.who==='vieille1'){ang.cart={r:Math.sin(wk*2)*.03,y:-Math.abs(Math.sin(wk*2))*2};ang.armR=-k*.35;tilt=sn*.03}
  else if(e.who==='vieille2'){ang.bagL=-sn*.16;ang.bagR=sn*.14;tilt=sn*.035}
  else if(e.who==='punk2'){ang.sign={r:sn*.03,y:-Math.abs(sn)*3}}
  else if(e.who==='drag'){ang.armR=Math.sin(t*2.2+e.x*.01)*.12;tilt=sn*.06;delete ang.head;ang.legL=k;ang.legR=-k}
  if(e.act){
    const el=e.actLen-e.actDur,ph=Math.sin(Math.PI*clamp(el/e.actLen,0,1));
    if(e.act==='vomit'){tilt=Math.min(.32,el*.9)*(e.actDur<.25?e.actDur/.25:1);ang.legL=ang.legR=0;if(ang.head)ang.head={r:.12*ph}}
    else if(e.act==='sip'){ang.armR={r:-1.05*ph};ang.legL=ang.legR=0;ang.head={r:-.07*ph}}
    else if(e.act==='charge'){tilt=-.08}
    else if(e.act==='scold'){ang.bagL={r:Math.sin(el*20)*.3};ang.bagR={r:-Math.sin(el*20)*.3};ang.head={r:Math.sin(el*14)*.08};ang.legL=ang.legR=0}
    else if(e.act==='sign'){ang.sign={y:-28*ph,r:Math.sin(el*8)*.05};ang.legL=ang.legR=0}
    else if(e.act==='pose'){tilt=-.14;ang.armR=-.55}
  }
  ctx.save();ctx.translate(x+e.w/2,GROUND-bob+(e.ky||0));
  if(e.vx<0)ctx.scale(-1,1);
  ctx.rotate(tilt+(e.rot||0)*(e.vx<0?-1:1));
  drawRig(RIGS[e.who],c.h,ang);
  ctx.restore();
}
function bubble(text,x,y,big){
  ctx.font=big?'800 16px Inter, Arial, sans-serif':'600 13px Inter, Arial, sans-serif';
  const w=ctx.measureText(text).width+18;
  const bx=clamp(x-w/2,6,W-w-6);
  ctx.fillStyle=big?'#fff4dc':'#fffaf0';ctx.strokeStyle=INK;ctx.lineWidth=2.5;
  rr(bx,y-26,w,24,10);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-6,y-3);ctx.lineTo(x,y+8);ctx.lineTo(x+6,y-3);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(x-6,y-2);ctx.lineTo(x,y+8);ctx.lineTo(x+6,y-2);ctx.stroke();
  ctx.fillStyle=INK;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,bx+w/2,y-14);
}
