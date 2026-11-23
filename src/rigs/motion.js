// Mouvement des rigs : easing des poses, mèches sur ressorts (hairTick, drawSegs), genoux/coudes auto (heroJoints).
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// eases every joint toward its target, so poses blend instead of snapping; a lower rate = floppier
let frameDt=1/60;
const PASS={ex:1,red:1,lid:1,noCig:1,phone:1};
function easeAng(st,tg,rate){
  const a=1-Math.exp(-frameDt*rate),out={};
  for(const k in tg){if(PASS[k]){out[k]=tg[k];continue}
    const v=tg[k],n=typeof v==='number'?{r:v}:(v||{}),c=st[k]||(st[k]={r:n.r||0,x:n.x||0,y:n.y||0});
    c.r+=((n.r||0)-c.r)*a;c.x+=((n.x||0)-c.x)*a;c.y+=((n.y||0)-c.y)*a}
  for(const k in st){const c=st[k];if(!(k in tg)){c.r-=c.r*a;c.x-=c.x*a;c.y-=c.y*a}out[k]={r:c.r,x:c.x,y:c.y}}
  return out;
}
function easeVals(st,tg,rate){const a=1-Math.exp(-frameDt*rate);for(const k in tg){if(st[k]===undefined)st[k]=tg[k];st[k]+=(tg[k]-st[k])*a}return st}
// hair tufts on springs: they lag behind when Michel speeds up, turns his head or lands, then settle
function hairTick(R,ang){
  const m=ctx.getTransform(),z=Math.hypot(m.a,m.b)||1,H=R.hs||(R.hs={t:-1,x:m.e/z,y:m.f/z,vx:0,vy:0,hr:0});
  if(H.t===t)return;const dt=clamp(t-H.t,1/240,.05),first=H.t<0;H.t=t;
  const x=m.e/z,y=m.f/z,hr=Math.atan2(m.b,m.a),dh=hr-H.hr;
  let vx=(x-H.x)/dt,vy=(y-H.y)/dt,om=Math.atan2(Math.sin(dh),Math.cos(dh))/dt;
  if(first||Math.hypot(vx,vy)>2500){vx=H.vx;vy=H.vy;om=0}
  const ax=clamp((vx-H.vx)/dt,-4000,4000),ay=clamp((vy-H.vy)/dt,-4000,4000);
  H.x=x;H.y=y;H.vx=vx;H.vy=vy;H.hr=hr;om=clamp(om,-12,12);
  const sg=Math.sign(m.a)||1,dk=typeof drunk==='function'?drunk():0;
  for(const p of R.parts)for(const s of (p.segB||[]).concat(p.segF||[])){if(!s.piv)continue;const S=s.st||(s.st={a:0,v:0,ph:Math.random()*6});
    const f=s.amp*(-ax*sg*.009-ay*s.side*.006-om*4+Math.sin(t*(2+dk*1.5)+S.ph)*(.8+dk*2));
    S.v+=(f-150*S.a-9*S.v)*dt;S.a=clamp(S.a+S.v*dt,-.2*s.amp,.2*s.amp)}
}
function drawSegs(L){for(const s of L){if(s.piv&&s.st&&Math.abs(s.st.a)>.002){ctx.save();ctx.translate(s.piv[0],s.piv[1]);ctx.rotate(s.st.a);ctx.translate(-s.piv[0],-s.piv[1]);vecDraw(s);ctx.restore()}else vecDraw(s)}}
// Michel's knees, ankles and elbow follow the hips/shoulder when a scene only poses those
const heroKeys={a:0,v:0};
function heroJoints(ang){
  const n=v=>typeof v==='number'?v:(v&&v.r)||0;
  for(const s of ['L','R']){const hp=n(ang['leg'+s]);if(ang['shin'+s]===undefined)ang['shin'+s]=Math.max(0,-hp)*.55+.04;if(ang['foot'+s]===undefined)ang['foot'+s]=-(hp+n(ang['shin'+s]))*.8}
  if(ang.foreL===undefined){const a=n(ang.armL);ang.foreL=a<-1?-.55:-.12+a*.12}
  if(ang.keys===undefined){const K=heroKeys,tg=(n(ang.legL)-n(ang.legR))*.45-n(ang.legL)*.2,dt2=Math.min(frameDt,.05);
    K.v+=((tg-K.a)*60-K.v*5)*dt2;K.a+=K.v*dt2;K.a=clamp(K.a,-.9,.9);ang.keys=K.a}
  return ang;
}
