// Dessin des rigs : préparation des tracés (Path2D), rigs vectoriels (vecFill, vecFace, vecDraw, drawVecRig) et drawRig.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

for(const R of Object.values(RIGS)){
  if(R.vec){const prep=L=>L.map(q=>{q=q.slice();q[3]=new Path2D(q[3]);return q});R.body.paths=prep(R.body.paths);for(const p of R.parts){p.paths=prep(p.paths);if(p.clip)p.clipP=new Path2D(p.clip);for(const k of ['mid','cig','front'])if(p[k])p[k].paths=prep(p[k].paths);for(const g of (p.segB||[]).concat(p.segF||[]))g.paths=prep(g.paths)}continue}
  R.im=mkImg(R.body);for(const p of R.parts)p.im=mkImg(p.img)}
// Draws a jointed sprite: origin is the feet (bottom-center). Layers: f=0 behind the body, f=1 in front, f=2 on top (the head).
// ang.red / ang.lid tint the eyes red and droop the eyelids when the rig knows where its eyes are.
function blinkAt(seed){return ((t+seed)%3.9)<.13?1:0}
// ---------- vector rigs (Michel): traced shapes per body part, eyes and mouth drawn live ----------
function vecFill(L,g){g=g||ctx;for(const q of L){const [f,x,y,P,st,w,eo]=q;
  if(f==='CLIP'){g.save();g.translate(x,y);g.clip(P);g.translate(-x,-y);continue}if(f==='END'){g.restore();continue}
  g.translate(x,y);
  if(f){g.fillStyle=f;g.fill(P,q.length<5||eo?'evenodd':'nonzero')}
  if(st){g.strokeStyle=st;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.stroke(P)}
  g.translate(-x,-y)}}
function vecFace(R,ox,oy,ang,stage){
  const V=R.vface,ELW=V.lw||9,E=ang.ex||{},br=E.brow||0,dk=E.drunk||0,look=E.look||{x:0,y:0},red=ang.red||0;
  ctx.lineCap='round';ctx.lineJoin='round';
  if(stage!=='mouth')V.eyes.forEach(([cx,top,rx,ry,pcx],i)=>{
    const [lx,ly,lw,lh]=V.lid[i];cx-=ox;top-=oy;pcx-=ox;
    let shut=(E.wink==='l'&&i===0)||(E.wink==='r'&&i===1)?1:(E.blink??blinkAt(1.3+i*.02));
    shut=Math.max(shut,(ang.lid||0)*.7);
    const ry2=ry*(1-shut)*(br<0?1-br*.3:1);
    if(ry2>4){
      ctx.beginPath();ctx.moveTo(cx-rx,top);ctx.ellipse(cx,top,rx,ry2,0,0,Math.PI);ctx.closePath();
      ctx.fillStyle=red>0?`rgb(255,${Math.round(255-130*red)},${Math.round(255-130*red)})`:'#fff';ctx.fill();
      ctx.save();ctx.clip();
      const PR=V.pr||37,px=pcx+look.x*15+dk*Math.sin(t*3.1+i*2.3)*15,py=top+(V.pdy??-2)+(look.y||0)*9+dk*Math.cos(t*2.7+i)*9,pr=PR*(br<0?.81:1)*(1-red*.15);
      ctx.fillStyle='#0b0b0b';ctx.beginPath();ctx.arc(px,py,pr,0,7);ctx.fill();
      if(br<0){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(px+9,py+12,6,0,7);ctx.fill()}
      ctx.restore();
      ctx.beginPath();ctx.moveTo(cx-rx,top);ctx.ellipse(cx,top,rx,ry2,0,0,Math.PI);ctx.closePath();ctx.strokeStyle='#0b0b0b';ctx.lineWidth=ELW;ctx.stroke();
    }else{ctx.strokeStyle='#0b0b0b';ctx.lineWidth=ELW;ctx.beginPath();ctx.moveTo(cx-rx*.95,top+4);ctx.quadraticCurveTo(cx,top+22,cx+rx*.95,top+4);ctx.stroke()}
    // the heavy upper lid: drops when he blinks, lifts when surprised, tilts when angry
    const yOff=shut*14+(br<0?br*18:0)+(dk*4),tilt=br>0?(i===0?1:-1)*br*.32:0;
    ctx.save();ctx.translate(lx-ox+lw/2,ly-oy+lh/2+yOff);ctx.rotate(tilt);ctx.fillStyle='#0b0b0b';rr(-lw/2,-lh/2,lw,lh,lh/2);ctx.fill();ctx.restore();
  });
  // the cigarette, drawn live so it can be put away (joint, dance...)
  if(stage==='eyes'){ctx.lineCap='butt';ctx.lineJoin='miter';return}
  if(V.cig&&!ang.noCig&&!V.tip){const [cx,cy,ca,cl]=V.cig;ctx.save();ctx.translate(cx-ox,cy-oy);ctx.rotate(ca+(E.mouth&&E.mouth!=='flat'&&E.mouth!=='smile'?.25:0));
    ctx.fillStyle='#fffaf0';ctx.strokeStyle='#0b0b0b';ctx.lineWidth=6;rr(0,-10,cl,20,6);ctx.fill();ctx.stroke();
    ctx.fillStyle='#e8a050';ctx.fillRect(3,-7,14,14);
    ctx.fillStyle=`rgb(255,${90+Math.round(60*Math.sin(t*7))},40)`;rr(cl-12,-7,10,14,4);ctx.fill();ctx.restore()}
  // mouth under the moustache
  {const [mx0,my0,mw]=V.mouth,mx=mx0-ox,my=my0-oy;let m=E.mouth||'flat';if(m==='talk')m=Math.sin(t*17)>0?'o':'flat';const op=E.open??1;
   if(V.tip&&(m==='flat'||m==='smile')){ctx.lineCap='butt';ctx.lineJoin='miter';return}
   ctx.strokeStyle=V.line;ctx.lineWidth=V.lw||8;ctx.fillStyle='#4a1d1d';
   if(m==='o'){ctx.beginPath();ctx.ellipse(mx,my+6,mw*.55,mw*(.38+.42*op),0,0,7);ctx.fill();ctx.stroke()}
   else if(m==='shout'){ctx.beginPath();ctx.ellipse(mx,my+14,mw*1.2,mw*.95,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#e8707a';ctx.beginPath();ctx.ellipse(mx,my+24,mw*.5,mw*.25,0,0,7);ctx.fill()}
   else if(m==='grin'){ctx.beginPath();ctx.moveTo(mx-mw*1.1,my-4);ctx.quadraticCurveTo(mx,my+mw*1.3,mx+mw*1.1,my-4);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fffaf0';ctx.fillRect(mx-mw*.85,my-1,mw*1.7,mw*.36)}
   else if(m==='smile'){ctx.beginPath();ctx.moveTo(mx-mw*1.05,my-6);ctx.quadraticCurveTo(mx,my+mw*.85,mx+mw*1.05,my-6);ctx.stroke()}
   else if(m==='frown'){ctx.beginPath();ctx.moveTo(mx-mw,my+12);ctx.quadraticCurveTo(mx,my-mw*.6,mx+mw,my+12);ctx.stroke()}
   else{ctx.beginPath();ctx.moveTo(mx-mw*.95,my-3);ctx.quadraticCurveTo(mx,my+9,mx+mw*.95,my-3);ctx.stroke()}}
  ctx.lineCap='butt';ctx.lineJoin='miter';
}
// Perf: each vector part is rendered once to a bitmap at the size it is shown, then reused every frame
function vecDraw(o){
  const m=ctx.getTransform(),z=Math.hypot(m.a,m.b);
  if(!o.bb||z<=0){vecFill(o.paths);return}
  const zb=Math.min(4,Math.pow(2,Math.ceil(Math.log2(z)*4)/4));
  const C=o.cache||(o.cache=new Map());let c=C.get(zb);
  if(!c){
    const [x0,y0,x1,y1]=o.bb,w=Math.ceil((x1-x0)*zb)+4,h=Math.ceil((y1-y0)*zb)+4;
    c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);
    const g=c.getContext('2d');g.translate(2,2);g.scale(zb,zb);g.translate(-x0,-y0);if(o.clipP)g.clip(o.clipP);vecFill(o.paths,g);
    if(C.size>=3)C.delete(C.keys().next().value);C.set(zb,c);
  }
  const [x0,y0,x1,y1]=o.bb;ctx.drawImage(c,x0-2/zb,y0-2/zb,c.width/zb,c.height/zb);
}
function drawVecRig(R,h,ang){
  const s=h/R.h,k=R.k,u=1/k;
  if(!R.kids){R.kids={};for(const p of R.parts)if(p.parent)(R.kids[p.parent]=R.kids[p.parent]||[]).push(p)}
  ctx.save();ctx.translate(-R.w*s/2,-h);ctx.scale(s*k,s*k);
  // parts can hang on a parent (forearm on the upper arm): they turn with it, then around their own joint
  const part=(p,acc)=>{
    const a=ang[p.n]||0,r=typeof a==='number'?a:a.r||0,dx=(a.x||0)*u,dy=(a.y||0)*u,tot=acc+r;
    ctx.save();ctx.translate(p.px+dx,p.py+dy);ctx.rotate(r);
    ctx.save();ctx.translate(p.x-p.px,p.y-p.py);if(p.segB){hairTick(R,ang);drawSegs(p.segB)}else vecDraw(p);
    if(p.hand&&ang.phone){ctx.save();ctx.translate(p.hand[0],p.hand[1]);ctx.rotate(ang.phone.up?-tot+(ang.phone.tilt||0):ang.phone.r||0);const z=u*(ang.phone.s||1);ctx.scale(z,z);
      ctx.fillStyle='#1d1f2b';ctx.strokeStyle='#0b0b0b';ctx.lineWidth=1.6;rr(-6,-17,12,24,2.5);ctx.fill();ctx.stroke();ctx.fillStyle=ang.phone.lit?'#9fd3ff':'#3a4a66';ctx.fillRect(-4.2,-15,8.4,18);
      ctx.fillStyle=R.skin||'#e8b89a';ctx.beginPath();ctx.ellipse(-1,4,7,5,0,0,7);ctx.fill();ctx.restore()}
    if(p.n==='head'&&p.front){vecFace(R,p.x,p.y,ang,'eyes');vecDraw(p.mid);if(!ang.noCig){vecDraw(p.cig);const T=R.vface.tip;ctx.fillStyle=`rgba(255,${120+Math.round(60*Math.sin(t*7))},40,.95)`;ctx.beginPath();ctx.arc(T[0]-p.x,T[1]-p.y,7+Math.sin(t*7)*1.5,0,7);ctx.fill()}vecFace(R,p.x,p.y,ang,'mouth');if(p.segF)drawSegs(p.segF);else vecDraw(p.front)}
    else if(p.n==='head'){ctx.translate(-(p.x),-(p.y));if(R.vface)vecFace(R,0,0,ang);else if(R.eyes){ctx.scale(u,u);const F=rigFaceFns(R,ang);F.eyes(0,0);F.face(0,0)}}
    ctx.restore();
    const ks=R.kids[p.n];if(ks){ctx.translate(-p.px,-p.py);for(const c of ks)part(c,tot)}
    ctx.restore();
  };
  for(const p of R.parts)if(!p.f&&!p.parent)part(p,0);
  ctx.save();ctx.translate(R.body.x,R.body.y);vecDraw(R.body);ctx.restore();
  // the tank top covers the shoulder seam at rest, but goes under the arm once it is lifted
  const aL=ang.armL,lift=Math.abs(typeof aL==='number'?aL:(aL&&aL.r)||0)>.45;
  if(lift)for(const p of R.parts)if(p.n==='top')part(p,0);
  for(const f of [1,2,3])for(const p of R.parts)if(p.f===f&&!p.parent&&!(lift&&p.n==='top'))part(p,0);
  ctx.restore();
}
function rigFaceFns(R,ang){
  const eyes=(ox,oy)=>{
    if(!R.eyes||!(ang.red||ang.lid))return;
    for(const [ex,ey,rx,ry] of R.eyes){const x=ex-ox,y=ey-oy;
      if(ang.red){ctx.fillStyle=`rgba(225,40,50,${.5*ang.red})`;ctx.beginPath();ctx.ellipse(x,y,rx*.9,ry*.75,0,0,7);ctx.fill();
        ctx.strokeStyle=`rgba(190,20,30,${.75*ang.red})`;ctx.lineWidth=Math.max(.8,rx*.07);
        for(let i=0;i<4;i++){const a=i*1.6+.3;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*rx*.85,y+Math.sin(a)*ry*.65);ctx.lineTo(x+Math.cos(a)*rx*.4,y+Math.sin(a)*ry*.3);ctx.stroke()}}
      if(ang.lid){ctx.fillStyle=R.skin||'#e8b89a';ctx.beginPath();ctx.ellipse(x,y-ry*1.05,rx*1.05,ry*(.3+ang.lid*.95),0,0,7);ctx.fill()}
    }};
  // ang.ex = {brow:-1 surprised..1 angry, blink:0..1, wink:'l'|'r', mouth:'o'|'shout'|'smile'|'grin'|'frown'|'flat'|'talk', open:0..1}
  const face=(ox,oy)=>{
    const E=ang.ex;if(!E||!R.eyes)return;
    const [ea,eb]=R.eyes,rx=ea[2],ry=Math.max(ea[3],rx*.5),skin=R.skin||'#e8b89a',lw=Math.max(1.2,rx*.3);
    ctx.lineCap='round';
    [[ea,E.wink==='l'?1:E.blink||0,1],[eb,E.wink==='r'?1:E.blink||0,-1]].forEach(([e,l,side])=>{
      const x=e[0]-ox,y=e[1]-oy;
      if(l>0){ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx*1.2,ry*1.45,0,0,7);ctx.clip();ctx.fillStyle=skin;ctx.fillRect(x-rx*1.3,y-ry*1.5,rx*2.6,ry*2.9*Math.min(1,l));ctx.restore();
        if(l>.8){ctx.strokeStyle='#2a1a16';ctx.lineWidth=lw*.8;ctx.beginPath();ctx.arc(x,y-ry*.4,rx*.85,.25*Math.PI,.75*Math.PI);ctx.stroke()}}
      if(E.brow!==undefined){const b=E.brow,by=y-ry*2.1-(b<0?-b*ry*1.1:0),inner=side;
        ctx.strokeStyle='#3a2418';ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x-inner*rx*1.15,by-(b>0?b*ry*.5:0));ctx.lineTo(x+inner*rx*.95,by+(b>0?b*ry*1.15:0));ctx.stroke()}
    });
    if(E.mouth&&R.mouth){
      const mx=R.mouth[0]-ox,my=R.mouth[1]-oy,mw=rx*1.15,lip=R.lip;
      ctx.fillStyle=lip||skin;ctx.beginPath();ctx.ellipse(mx,my,mw*1.15,mw*.5,0,0,7);ctx.fill();
      const m=E.mouth==='talk'?(Math.sin(t*17)>0?'o':'flat'):E.mouth,op=E.open??1;
      ctx.strokeStyle=lip?'#5a1020':'#4a2418';ctx.lineWidth=lw*.8;ctx.fillStyle='#4a1820';
      if(m==='o'){ctx.beginPath();ctx.ellipse(mx,my,mw*.32,mw*.42*op+mw*.08,0,0,7);ctx.fill();ctx.fillStyle='#e8707a';ctx.beginPath();ctx.ellipse(mx,my+mw*.22*op,mw*.2,mw*.1,0,0,7);ctx.fill()}
      else if(m==='shout'){ctx.beginPath();ctx.ellipse(mx,my+mw*.05,mw*.75,mw*.5,0,0,7);ctx.fill();ctx.fillStyle='#fffaf0';ctx.fillRect(mx-mw*.55,my-mw*.32,mw*1.1,mw*.2);ctx.fillStyle='#e8707a';ctx.beginPath();ctx.ellipse(mx,my+mw*.32,mw*.35,mw*.14,0,0,7);ctx.fill()}
      else if(m==='grin'){ctx.beginPath();ctx.moveTo(mx-mw*.8,my-mw*.12);ctx.quadraticCurveTo(mx,my+mw*.95,mx+mw*.8,my-mw*.12);ctx.closePath();ctx.fill();ctx.fillStyle='#fffaf0';ctx.fillRect(mx-mw*.6,my-mw*.1,mw*1.2,mw*.16)}
      else if(m==='smile'){ctx.beginPath();ctx.arc(mx,my-mw*.45,mw*.75,.2*Math.PI,.8*Math.PI);ctx.stroke()}
      else if(m==='frown'){ctx.beginPath();ctx.arc(mx,my+mw*.55,mw*.7,1.2*Math.PI,1.8*Math.PI);ctx.stroke()}
      else{ctx.beginPath();ctx.moveTo(mx-mw*.5,my);ctx.lineTo(mx+mw*.5,my);ctx.stroke()}
    }
    ctx.lineCap='butt';
  };
  return {eyes,face};
}
function drawRig(R,h,ang){
  if(R===RIGS.hero&&R.vec)heroJoints(ang);
  if(R.vec)return drawVecRig(R,h,ang);
  const s=h/R.h;
  ctx.save();ctx.translate(-R.w*s/2,-h);ctx.scale(s,s);
  const {eyes,face}=rigFaceFns(R,ang);
  const part=p=>{
    if(!p.im.complete)return;
    const a=ang[p.n]||0,r=typeof a==='number'?a:a.r||0,dx=a.x||0,dy=a.y||0;
    ctx.save();ctx.translate(p.px+dx,p.py+dy);ctx.rotate(r);ctx.drawImage(p.im,p.x-p.px,p.y-p.py,p.w,p.h);
    if(p.n==='head'){eyes(p.px,p.py);face(p.px,p.py)}
    ctx.restore();
  };
  for(const p of R.parts)if(!p.f)part(p);
  if(R.im.complete)ctx.drawImage(R.im,0,0,R.w,R.h);
  if(!R.parts.some(p=>p.n==='head')){eyes(0,0);face(0,0)}
  for(const p of R.parts)if(p.f===1)part(p);
  for(const p of R.parts)if(p.f===2)part(p);
  ctx.restore();
}
RIGS.dulac.mouth=RIGS.dulac.mouth||[104.7,144];RIGS.ginette.skin='#F0B8A2';RIGS.ginette.lip='#8b1c2c';RIGS.boss.lip='#e98a9a';
