// Décor de rue : façades, fenêtres, plateformes, sol, lampadaires, objets, voitures.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

function drawWindow(x,y,w,h,f,win,n){
  ctx.fillStyle='#efe6cf';ctx.fillRect(x-5,y-5,w+10,h+10);
  ctx.fillStyle='#e6dcc2';ctx.fillRect(x-8,y+h+3,w+16,7);
  ctx.fillStyle=n>.3&&win.lit?'#3a3550':'#8fb3b7';ctx.fillRect(x,y,w,h);
  ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(x+4,y+4,6,h-8);
  ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.strokeRect(x-5,y-5,w+10,h+10);ctx.strokeRect(x,y,w,h);
  ctx.beginPath();ctx.moveTo(x,y+h*.45);ctx.lineTo(x+w,y+h*.45);ctx.stroke();
  if(win.lit&&n>.05)lights.push({k:'win',x,y,w,h});
  if(win.cat){ctx.fillStyle='#f1c27d';ctx.beginPath();ctx.ellipse(x+w*.6,y+h-9,8,9,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(x+w*.6-8,y+h-14);ctx.lineTo(x+w*.6-5,y+h-24);ctx.lineTo(x+w*.6-1,y+h-16);ctx.moveTo(x+w*.6+8,y+h-14);ctx.lineTo(x+w*.6+5,y+h-24);ctx.lineTo(x+w*.6+1,y+h-16);ctx.fill();ctx.lineWidth=1.5;ctx.stroke()}
}
function signText(text,cx,cy,maxW,size,color){
  ctx.font=`900 ${size}px Inter, Arial, sans-serif`;
  let s=size;while(ctx.measureText(text).width>maxW&&s>9){s--;ctx.font=`900 ${s}px Inter, Arial, sans-serif`}
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,cx,cy+1);
  return s;
}
function drawDeco(d){const x=Math.round(d.x-camX);if(x>W+20||x+d.w<-20)return;const D=DECO[d.k];if(D.im.complete)ctx.drawImage(D.im,x,GROUND+(d.front?4:2)-d.h,d.w,d.h)}
function drawFacade(f,n){
  const x=Math.round(f.x-camX),top=GROUND-f.h;
  if(x>W+20||x+f.w<-20)return;
  if(f.kind==='img'){
    const F=FAC[f.img];if(F.im.complete)ctx.drawImage(F.im,x,top,f.w,f.h);
    if(n>.05&&f.glow)for(const g of f.glow)lights.push({k:'shop',x:x+g[0]*f.w,y:top+g[1]*f.h,w:g[2]*f.w,h:g[3]*f.h,warm:true});
    if(f.neonTxt){ctx.fillStyle='#1d1626';ctx.strokeStyle=INK;ctx.lineWidth=2.5;rr(x+f.w/2-120,top-34,240,28,6);ctx.fill();ctx.stroke();const col=f.neon||(f.neon=pick(['#ff5d8f','#5ee0ff','#ffd166','#9b8cff']));signText(f.neonTxt,x+f.w/2,top-20,220,14,col);lights.push({k:'neon',text:f.neonTxt,x:x+f.w/2,y:top-20,col,w:220})}
    return;
  }
  if(f.kind==='stsign'){
    // a Montréal street sign: blue plate on a pole
    const px=x+f.w/2;ctx.fillStyle='#5b6670';ctx.fillRect(px-3,GROUND-170,6,170);ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.strokeRect(px-3,GROUND-170,6,170);
    ctx.fillStyle='#1f4f9a';rr(px-64,GROUND-196,128,34,4);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;rr(px-60,GROUND-192,120,26,3);ctx.stroke();
    ctx.font='700 8px Inter, Arial';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('BOUL.',px,GROUND-183);ctx.font='900 11px Inter, Arial';ctx.fillText('SAINT-LAURENT',px,GROUND-171);
    return}
  if(f.kind==='downtown'){const im=BGS.office;if(im.complete)ctx.drawImage(im,x,GROUND+6-f.h*.962,f.w,f.h);return}
  if(f.kind==='office'){
    // Michel's office tower: the street starts at its door
    ctx.fillStyle='#8fa3b4';ctx.fillRect(x,top-200,f.w,f.h+200);ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.strokeRect(x,top-200,f.w,f.h+200);
    for(let r=0;r<9;r++)for(let c=0;c<4;c++){ctx.fillStyle=(r+c)%3?'#b9d3e3':'#d6e8f2';ctx.fillRect(x+14+c*(f.w-28)/4,top-190+r*56,(f.w-28)/4-8,46)}
    ctx.fillStyle='#4b5a66';ctx.fillRect(x,GROUND-120,f.w,120);ctx.strokeRect(x,GROUND-120,f.w,120);
    const dx=x+f.w/2+40;ctx.fillStyle='#b9e2f2';ctx.fillRect(dx-50,GROUND-100,100,100);ctx.strokeRect(dx-50,GROUND-100,100,100);ctx.beginPath();ctx.moveTo(dx,GROUND-100);ctx.lineTo(dx,GROUND);ctx.stroke();
    ctx.fillStyle='#2f8a4a';rr(dx-44,GROUND-128,88,22,4);ctx.fill();ctx.stroke();signText('SORTIE',dx,GROUND-117,76,13,'#fff4dc');
    ctx.fillStyle='#e8e1d3';rr(x+20,GROUND-112,110,26,4);ctx.fill();ctx.stroke();signText('BUREAU · 16H30',x+75,GROUND-99,100,11,'#2b3550');
    return;
  }
  ctx.fillStyle=f.color;ctx.fillRect(x,top,f.w,f.h);
  ctx.strokeStyle='rgba(40,15,10,.22)';ctx.lineWidth=2;
  ctx.beginPath();for(const [bx,by] of f.bricks){ctx.moveTo(x+bx,top+by);ctx.lineTo(x+bx+16,top+by);ctx.moveTo(x+bx+8,top+by+7);ctx.lineTo(x+bx+24,top+by+7)}ctx.stroke();
  ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.strokeRect(x,top,f.w,f.h);
  // cornice
  ctx.fillStyle=f.trim;ctx.fillRect(x-8,top-6,f.w+16,16);ctx.strokeRect(x-8,top-6,f.w+16,16);
  for(const w of f.wins)drawWindow(x+w.x,top+w.y,w.w,w.h,f,w,n);
  if(f.kind==='triplex'){
    // doors at street level
    const dc=Math.max(1,Math.floor(f.w/150));
    for(let i=0;i<dc;i++){
      const dx=x+(i+.5)*f.w/dc-20;
      ctx.fillStyle=f.trim;ctx.fillRect(dx,GROUND-78,40,78);ctx.strokeRect(dx,GROUND-78,40,78);
      ctx.fillStyle='#8fb3b7';ctx.fillRect(dx+8,GROUND-70,24,26);ctx.strokeRect(dx+8,GROUND-70,24,26);
      ctx.fillStyle='#e9e2d0';ctx.fillRect(dx-6,GROUND-6,52,6);
    }
    if(f.stairs)drawSpiral(x+f.stairs.x,n);
  }else if(f.kind==='dep'||f.kind==='shop'){
    shopFront(x,f,'#efe6cf');
    const lbl=f.label||'DÉPANNEUR';
    ctx.fillStyle='#f4ecd6';rr(x+f.w/2-110,GROUND-128,220,32,4);ctx.fill();ctx.stroke();
    signText(lbl,x+f.w/2,GROUND-112,200,18,'#2f6f6b');
    ctx.fillStyle='#c8403a';rr(x+f.w-86,GROUND-90,62,26,3);ctx.fill();ctx.stroke();
    ctx.font='900 9px Inter, Arial';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('BIÈRE',x+f.w-55,GROUND-82);ctx.fillText('FROIDE',x+f.w-55,GROUND-71);
    lights.push({k:'shop',x:x+20,y:GROUND-88,w:f.w-40,h:60});
    if(f.goal)goalSign(x,f,'ENTRE ICI');
  }else if(f.kind==='bar'){
    shopFront(x,f,'#2b2238');
    // neon
    ctx.fillStyle='#1d1626';rr(x+f.w/2-140,GROUND-140,280,40,6);ctx.fill();ctx.stroke();
    const col=f.neon||(f.neon=pick(['#ff5d8f','#5ee0ff','#ffd166','#9b8cff']));
    signText(f.label,x+f.w/2,GROUND-120,256,18,col);
    lights.push({k:'neon',text:f.label,x:x+f.w/2,y:GROUND-120,col,w:256});
    lights.push({k:'shop',x:x+20,y:GROUND-88,w:f.w-40,h:60,warm:true});
    if(f.goal)goalSign(x,f,'CHEZ GINETTE');
  }else if(f.kind==='resto'){
    const piz=f.label==='PIZZERIA';
    // parapet
    ctx.fillStyle=f.trim;ctx.fillRect(x-8,top-14,f.w+16,22);ctx.strokeRect(x-8,top-14,f.w+16,22);
    // sign
    ctx.fillStyle=piz?'#b8312f':'#203c5c';rr(x+18,top+22,f.w-36,46,6);ctx.fill();ctx.stroke();
    signText(f.label,x+f.w/2+ (piz?14:16),top+45,f.w-110,24,piz?'#fff4dc':'#f0c419');
    // icon
    if(piz){
      const ix=x+42,iy=top+45;ctx.fillStyle='#f2c14e';ctx.beginPath();ctx.moveTo(ix-12,iy-14);ctx.lineTo(ix+14,iy-14);ctx.lineTo(ix+1,iy+16);ctx.closePath();ctx.fill();ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#c8403a';[[ix-3,iy-7],[ix+6,iy-6],[ix+1,iy+3]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(a,b,3,0,7);ctx.fill()});
      ctx.fillStyle='#d98b3a';ctx.fillRect(ix-14,iy-17,30,5);
    }else{
      const ix=x+44,iy=top+46;ctx.fillStyle='#c8403a';ctx.beginPath();ctx.moveTo(ix-13,iy-4);ctx.lineTo(ix+13,iy-4);ctx.lineTo(ix+9,iy+16);ctx.lineTo(ix-9,iy+16);ctx.closePath();ctx.fill();ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#f4d35e';for(let i=-2;i<=2;i++){ctx.fillRect(ix+i*5-2,iy-18+Math.abs(i)*2,4,15)}
      ctx.fillStyle='#fff8e0';ctx.beginPath();ctx.arc(ix-4,iy-5,3,0,7);ctx.arc(ix+5,iy-6,3,0,7);ctx.fill();
    }
    ctx.lineWidth=3;
    // awning stripes
    const ay=top+82;
    for(let i=0;i<Math.ceil(f.w/28);i++){ctx.fillStyle=i%2?'#fff4dc':(piz?'#b8312f':'#2f6f6b');ctx.fillRect(x+i*28,ay,Math.min(28,f.w-i*28),20)}
    ctx.strokeRect(x,ay,f.w,20);
    ctx.beginPath();for(let i=0;i<f.w;i+=28){ctx.moveTo(x+i,ay+20);ctx.arc(x+i+14,ay+20,14,Math.PI,0,true)}ctx.fillStyle=piz?'#b8312f':'#2f6f6b';ctx.fill();ctx.stroke();
    // window + open door
    const wy=top+122;
    ctx.fillStyle='#ffe1a6';ctx.fillRect(x+20,wy,f.w*.5-30,GROUND-wy-14);ctx.strokeRect(x+20,wy,f.w*.5-30,GROUND-wy-14);
    ctx.font='900 12px Inter, Arial';ctx.fillStyle=piz?'#b8312f':'#203c5c';ctx.textAlign='center';
    ctx.fillText(piz?'2 POINTES 5 $':'GALVAUDE 9 $',x+20+(f.w*.5-30)/2,wy+22);
    ctx.fillText('OUVERT',x+20+(f.w*.5-30)/2,wy+42);
    const dx=x+f.w*.62,dw=f.w*.26;
    ctx.fillStyle='#2b1a14';ctx.fillRect(dx,wy-6,dw,GROUND-wy+6);
    ctx.fillStyle='#ffcf7a';ctx.beginPath();ctx.moveTo(dx,wy-6);ctx.lineTo(dx+dw,wy-6);ctx.lineTo(dx+dw+18,GROUND);ctx.lineTo(dx-18,GROUND);ctx.closePath();ctx.globalAlpha=.25;ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle=f.trim;ctx.save();ctx.translate(dx,wy-6);ctx.transform(1,-.08,0,1,0,0);ctx.fillRect(0,0,dw*.42,GROUND-wy+6);ctx.strokeRect(0,0,dw*.42,GROUND-wy+6);ctx.restore();
    ctx.strokeRect(dx,wy-6,dw,GROUND-wy+6);
    lights.push({k:'shop',x:x+20,y:wy,w:f.w*.5-30,h:GROUND-wy-14,warm:true});
    lights.push({k:'shop',x:dx,y:wy-6,w:dw,h:GROUND-wy+6,warm:true});
    // roof vent
    ctx.fillStyle='#9aa0a8';ctx.fillRect(x+f.w-70,top-40,34,26);ctx.strokeRect(x+f.w-70,top-40,34,26);
  }
}
function goalSign(x,f,text){
  const dx=x+f.w-55,y=GROUND-150+Math.sin(t*5)*6;
  ctx.fillStyle='#ffbf47';ctx.strokeStyle=INK;ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(dx-14,y);ctx.lineTo(dx+14,y);ctx.lineTo(dx+14,y+18);ctx.lineTo(dx+26,y+18);ctx.lineTo(dx,y+40);ctx.lineTo(dx-26,y+18);ctx.lineTo(dx-14,y+18);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.font='14px "Lilita One", Inter, Arial';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeText(text,dx,y-12);ctx.fillStyle='#fffaf0';ctx.fillText(text,dx,y-12);
  lights.push({k:'shop',x:x+f.w-82,y:GROUND-60,w:54,h:60,warm:true});
}
function shopFront(x,f,glass){
  ctx.fillStyle='#3b2a28';ctx.fillRect(x+10,GROUND-100,f.w-20,100);ctx.strokeRect(x+10,GROUND-100,f.w-20,100);
  ctx.fillStyle=glass;ctx.fillRect(x+20,GROUND-88,f.w-110,60);ctx.strokeRect(x+20,GROUND-88,f.w-110,60);
  ctx.fillStyle='#8fb3b7';ctx.fillRect(x+f.w-82,GROUND-60,54,60);ctx.strokeRect(x+f.w-82,GROUND-60,54,60);
}
function drawSpiral(sx,n){
  ctx.strokeStyle='#1f2326';ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(sx,GROUND);ctx.bezierCurveTo(sx+110,GROUND-20,sx+110,GROUND-90,sx+40,GROUND-110);
  ctx.bezierCurveTo(sx-20,GROUND-130,sx+40,GROUND-190,sx+110,GROUND-215);ctx.stroke();
  ctx.beginPath();ctx.moveTo(sx+8,GROUND-36);ctx.bezierCurveTo(sx+118,GROUND-56,sx+118,GROUND-126,sx+48,GROUND-146);ctx.bezierCurveTo(sx-12,GROUND-166,sx+48,GROUND-226,sx+118,GROUND-251);ctx.stroke();
}
function drawPlatform(pl,n){
  const x=Math.round(pl.x-camX);if(x>W||x+pl.w<0)return;
  ctx.strokeStyle=INK;ctx.lineWidth=3;
  if(pl.kind==='balcony'){
    ctx.fillStyle='#8a5a3b';ctx.fillRect(x,pl.y,pl.w,10);ctx.strokeRect(x,pl.y,pl.w,10);
    ctx.strokeStyle='#1f2326';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,pl.y-36);ctx.lineTo(x+pl.w,pl.y-36);
    for(let i=0;i<=pl.w;i+=14){ctx.moveTo(x+i,pl.y-36);ctx.lineTo(x+i,pl.y)}ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+8,pl.y+10);ctx.lineTo(x+22,pl.y+28);ctx.moveTo(x+pl.w-8,pl.y+10);ctx.lineTo(x+pl.w-22,pl.y+28);ctx.stroke();
  }else if(pl.kind==='step'){
    ctx.fillStyle='#2b3033';ctx.fillRect(x,pl.y,pl.w,8);ctx.strokeRect(x,pl.y,pl.w,8);
    ctx.strokeStyle='#1f2326';ctx.beginPath();ctx.moveTo(x+pl.w-6,pl.y);ctx.lineTo(x+pl.w-6,pl.y-30);ctx.stroke();
  }else if(pl.kind==='can'){
    const top=pl.y;
    ctx.fillStyle='#4e7a3c';rr(x+3,top+6,pl.w-6,GROUND-top-6,4);ctx.fill();ctx.stroke();
    ctx.fillStyle='#5f9149';rr(x-2,top,pl.w+4,10,3);ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,.25)';ctx.beginPath();for(let i=12;i<pl.w-6;i+=10){ctx.moveTo(x+i,top+16);ctx.lineTo(x+i,GROUND-6)}ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='900 8px Inter, Arial';ctx.textAlign='center';ctx.fillText('VILLE',x+pl.w/2,top+34);
  }else if(pl.kind==='awning'){
    for(let i=0;i<Math.ceil(pl.w/24);i++){ctx.fillStyle=i%2?'#1f1a2b':'#7a2335';ctx.fillRect(x+i*24,pl.y,Math.min(24,pl.w-i*24),16)}
    ctx.strokeRect(x,pl.y,pl.w,16);
  }
}
function drawGround(n){
  // sidewalk
  ctx.fillStyle='#c9c1b4';ctx.fillRect(0,GROUND,W,30);
  ctx.strokeStyle='rgba(42,26,22,.35)';ctx.lineWidth=2;ctx.beginPath();
  const o=-(camX%90);for(let x=o;x<W;x+=90){ctx.moveTo(x,GROUND);ctx.lineTo(x-14,GROUND+30)}ctx.stroke();
  ctx.fillStyle='#e8e1d3';ctx.fillRect(0,GROUND+28,W,6);
  ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,GROUND);ctx.lineTo(W,GROUND);ctx.moveTo(0,GROUND+34);ctx.lineTo(W,GROUND+34);ctx.stroke();
  // road
  ctx.fillStyle='#5a5560';ctx.fillRect(0,GROUND+34,W,H-GROUND-34);
  ctx.fillStyle='#e9d78a';const o2=-((camX*1.25)%120);for(let x=o2;x<W;x+=120)ctx.fillRect(x,H-22,60,6);
}
function drawLamp(lx,n){
  const x=Math.round(lx-camX);if(x<-80||x>W+80)return;
  ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.fillStyle='#2f3a3f';
  ctx.fillRect(x-4,GROUND-230,8,230);ctx.strokeRect(x-4,GROUND-230,8,230);
  ctx.beginPath();ctx.moveTo(x,GROUND-226);ctx.quadraticCurveTo(x+4,GROUND-260,x+40,GROUND-256);ctx.stroke();
  ctx.fillStyle=n>.2?'#fff1b8':'#d8d4c6';rr(x+28,GROUND-258,30,12,5);ctx.fill();ctx.stroke();
  if(n>.05)lights.push({k:'lamp',x:x+43,y:GROUND-248});
}
function bottleShape(){
  if(CAN.im.complete){const h=40,w=h*CAN.ar;ctx.drawImage(CAN.im,-w/2,-24,w,h)}
}
function drawItem(it){
  if(it.taken)return;
  const x=it.x-camX;if(x<-30||x>W+30)return;
  const y=it.y+Math.sin(t*3+(it.ph||0))*4;
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle='rgba(255,220,140,.25)';ctx.beginPath();ctx.arc(0,0,20,0,7);ctx.fill();
  ctx.strokeStyle=INK;ctx.lineWidth=2.5;
  if(it.type==='cig'){
    ctx.rotate(-.35);
    ctx.fillStyle='#fffaf0';rr(-15,-4,22,8,2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#e0892f';rr(5,-4,10,8,2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#ff5a1f';ctx.beginPath();ctx.arc(-15,0,2.5,0,7);ctx.fill();
  }else if(it.type==='rb'){
    ctx.rotate(Math.sin(t*4+(it.ph||0))*.15);
    ctx.fillStyle='#2f6fb3';rr(-8,-16,16,32,4);ctx.fill();ctx.stroke();
    ctx.fillStyle='#c9ced6';ctx.fillRect(-8,-6,16,12);ctx.fillRect(-6,-19,12,4);
    ctx.fillStyle='#ffd166';ctx.beginPath();ctx.moveTo(2,-5);ctx.lineTo(-4,1);ctx.lineTo(0,1);ctx.lineTo(-2,6);ctx.lineTo(4,-1);ctx.lineTo(0,-1);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#ffd166';ctx.lineWidth=2;ctx.globalAlpha=.5+.5*Math.sin(t*6);ctx.beginPath();ctx.arc(0,0,24,0,7);ctx.stroke();ctx.globalAlpha=1;
  }else bottleShape();
  ctx.restore();
}
// perf: dimmed car bitmaps are made once per darkness level, then reused
let carDim=0;
function dimmed(im,lv){if(!lv||!im.complete||!im.naturalWidth)return im;const C=im.dim||(im.dim=[]);if(!C[lv]){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');const nn=lv/4;g.filter=`brightness(${(1-.5*nn).toFixed(2)}) saturate(${(1-.3*nn).toFixed(2)})`;g.drawImage(im,0,0);C[lv]=c}return C[lv]}
function drawCar(c,n,ox,obase,sc){
  sc=sc||1;const C=CARS[c.kind]||CARS.green,k=c.len/C.w;
  const x=ox??(c.wx-camX*FG),base=obase??(H+14);
  ctx.save();ctx.translate(x,base);ctx.scale(sc,sc);
  if(c.dir<0){ctx.translate(c.len,0);ctx.scale(-1,1)}
  ctx.scale(k,k);
  const w0=C.wheels[0];ctx.translate(0,-(w0.y+w0.r));
  const bob=Math.sin((c.wx||0)*.045+(c.ph||0))*1.6;
  if(C.im.complete)ctx.drawImage(dimmed(C.im,carDim),0,bob,C.w,C.h);
  const spin=(c.wx||0)*(c.dir<0?-1:1);
  for(const w of C.wheels){ctx.save();ctx.translate(w.x,w.y);ctx.rotate(spin/(w.r*k*sc));if(w.im.complete)ctx.drawImage(dimmed(w.im,carDim),-w.r,-w.r,w.r*2,w.r*2);ctx.restore()}
  ctx.restore();
  if(n>.1)lights.push({k:'head',x:x+sc*(c.dir>0?c.len:0),y:base-sc*k*(w0.y+w0.r-C.h*.52),dir:c.dir});
}
