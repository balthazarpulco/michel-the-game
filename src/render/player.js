// Dessin de Michel en jeu (drawPlayer).
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

function drawPlayer(){
  const p=player,R=RIGS.hero;
  if(level===3&&home&&home.win)return;
  if(p.inv>0&&Math.floor(p.inv*14)%2===0)return;
  const sh=112,sw=R.w*sh/R.h;p.sw=sw;
  let sx=1,sy=1,bob=0,rot=0,ang;
  // drunk levels: dk starts at 10 beers in hand (floppy, clumsy), d25 from ~25 beers (the head leads, the body follows)
  const dkA=drunk(),d25=soberT>0?0:clamp((ammo-23)/4,0,1),spd=Math.abs(p.vx);
  // sign convention: negative = forward (toward where Michel faces) for hips/shoulders, positive knee = bends back
  const leg=(ph,A,K)=>{const hip=-Math.sin(ph)*A,knee=K*Math.pow(Math.max(0,Math.cos(ph)),1.4)+.06,foot=-(hip+knee)*.85+.25*Math.max(0,Math.sin(ph))*A;return [hip,knee,foot]};
  if(!p.onGround){
    const up=p.vy<0,k=clamp(-p.vy/900,-1,1);
    ang=up?{legL:-.75,shinL:1.15,footL:-.35,legR:.25,shinR:.75,footR:-.6,armL:-1.35,foreL:-.7,armR:-.7}
          :{legL:-.3,shinL:.35,footL:-.1,legR:.15,shinR:.25,footR:-.25,armL:-.6-.3*(1-k),foreL:-.35,armR:-.3};
  }else if(spd>20){
    // run cycle: hips swing, knees fold on the passing leg, feet roll heel→toe, arms counter-swing with a bent elbow
    const run=spd>330,A=(run?.62:.46)*(1+.4*dkA),K=(run?1.25:.85)*(1+.3*dkA),w=p.walk;
    const [hL,kL,fL]=leg(w,A,K),[hR,kR,fR]=leg(w+Math.PI,A,K);
    const aw=Math.sin(w-.25)*A*1.05;
    ang={legL:hL,shinL:kL,footL:fL,legR:hR,shinR:kR,footR:fR,
         armL:aw,foreL:-(run?.75:.35)-.45*Math.max(0,-aw/A),armR:-aw*.6};
    bob=Math.abs(Math.sin(w))*(run?6:4)*(1+.6*dkA);rot=Math.sin(w*2)*.02+(p.vx/SPRINT)*.08;
  }else{
    // idle: breathing, weight shifts from foot to foot, the hand hangs loose
    const br=Math.sin(t*2.1),ws=Math.sin(t*.8);
    ang={legL:ws*.04,shinL:.04+Math.max(0,ws)*.08,footL:-ws*.04,legR:-ws*.04,shinR:.04+Math.max(0,-ws)*.08,footR:ws*.04,
         armL:br*.05+.04,foreL:-.14-br*.04,armR:-br*.05};sy=1+br*.012;rot=ws*.015;
  }
  if(dkA>.05){
    // 10+ beers: knees buckle, elbows flop, feet drag; everything overshoots a little
    const f=dkA,add=(k,v)=>{ang[k]=(ang[k]||0)+v};
    add('legL',Math.sin(t*3.1)*.14*f);add('legR',Math.sin(t*3.1+1.7)*.14*f);
    add('shinL',Math.max(0,Math.sin(t*2.7))*.35*f);add('shinR',Math.max(0,Math.sin(t*2.7+2))*.35*f);
    add('footL',Math.sin(t*2.2)*.15*f);add('footR',Math.sin(t*2.2+1)*.15*f);
    add('armL',Math.sin(t*2.3)*.4*f);add('foreL',.25*f+Math.sin(t*3.3+.8)*.45*f);add('armR',Math.sin(t*2.3+1.2)*.35*f);
    if(p.onGround)sy*=1-.06*f*Math.abs(Math.sin(t*2.6));
  }
  if(p.throwT>0){const q=Math.sin(Math.PI*(1-p.throwT/.28));ang.armL=-2.7*q;ang.foreL=-.9*q+.2}
  if(!p.onGround){sy=p.vy<0?1.07:.97;sx=p.vy<0?.94:1.03;rot=p.facing*.06}
  if(p.land>0){sy*=.88;sx*=1.12;ang.shinL=(ang.shinL||0)+.5;ang.shinR=(ang.shinR||0)+.5;ang.legL=(ang.legL||0)-.25;ang.legR=(ang.legR||0)-.25;ang.footL=(ang.footL||0)-.25;ang.footR=(ang.footR||0)-.25}
  // 25 beers: the head swings first, the body catches up late
  const lead=(Math.sin(t*1.25)*.55+Math.sin(t*.67+1.3)*.35)*d25;
  p.lag=(p.lag||0)+(lead*.6-(p.lag||0))*(1-Math.exp(-frameDt*2));
  rot+=p.lag;
  {const dk0=drunk(),sprint=Math.abs(p.vx)>330,moving=spd>20;
   ang.head={r:(moving?Math.sin(p.walk*2-.6)*.035:Math.sin(t*1.3)*.02)+Math.sin(t*1.7)*.13*dk0+(lead-p.lag),y:moving?-Math.abs(Math.cos(p.walk))*1.2:0};
   ang.ex=p.inv>0?{brow:-1,mouth:'o',open:.8,blink:0}:p.pukeT>0?{mouth:'shout',blink:.6,drunk:1}:p.throwT>0?{brow:.6,mouth:'grin',blink:0}:
     !p.onGround?(p.vy<0?{brow:-.6,mouth:'o',open:.4,blink:0}:{brow:-.3,mouth:'flat',blink:0}):p.land>0?{blink:.6,mouth:'frown'}:
     sprint?{brow:.5,mouth:'grin',blink:0}:dk0>.55?{mouth:'smile',drunk:dk0,blink:blinkAt(.4)*.8+.15}:{mouth:'flat',look:{x:moving?.6:Math.sin(t*.7)*.5,y:0}};
   if(dk0>.3&&ang.ex.drunk===undefined)ang.ex.drunk=dk0*.6;
   if(d25>0){ang.ex.drunk=1;ang.ex.blink=Math.max(ang.ex.blink||0,.35)}}
  ctx.save();
  ctx.translate(p.x+p.w/2-camX,p.y+p.h-bob);
  // shadow
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(0,GROUND-(p.y+p.h)+bob+4,26*(p.onGround?1:.7),6,0,0,7);if(p.y+p.h>GROUND-4)ctx.fill();
  const dk=drunk();
  rot+=Math.sin(t*2.6)*.16*dk+(p.slip>0?Math.sin(t*22)*.22*p.slip:0);
  if(p.pukeT>0)rot+=p.facing*.38*Math.min(1,(1.1-p.pukeT)*5,p.pukeT*5);
  // blend everything: limbs, squash and the turn-around
  const d25b=soberT>0?0:clamp((ammo-23)/4,0,1),rate=(p.onGround?20:26)*(1-.55*drunk())*(1-.35*d25b);
  ang=easeAng(p.av||(p.av={}),ang,rate);
  const V=easeVals(p.tv||(p.tv={}),{rot,sx,sy,bob,fs:p.facing},(p.onGround?16*(1-.5*drunk()):22)*(1-.4*d25b));
  ctx.translate(0,bob-V.bob);
  const fs=Math.sign(V.fs||1)*Math.max(.22,Math.abs(V.fs));
  ctx.rotate(V.rot);ctx.scale(V.sx*fs,V.sy);
  if(dk>.3){ctx.save();ctx.globalAlpha=.28*dk;ctx.translate(Math.sin(t*1.9)*12*dk,0);drawRig(R,sh,ang);ctx.restore()}
  drawRig(R,sh,ang);
  ctx.restore();
}
