// Tuto « téléphone » : TUTO (messages + contrôles), LV_STORY, openPhone / closePhone / drawPhone.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

const TUTO={
  limo:{from:'Delachaud',av:'#ff9a1f',msgs:['MICHEL!! J\'t\'envoie une limo 🥂','Casino ce soir, c\'est moi qui paye!'],tips:[['← →','penche contre le virage'],['VERRE','garde-le droit, sinon mal de cœur'],['E','prendre un vodka-Red Bull (+ points, + tangue)']]},
  bj:{from:'Delachaud',av:'#ff9a1f',msgs:['Une main. Tout ce que t\'as! 🃏'],tips:[['TIRER','une carte de plus'],['RESTER','le croupier joue'],['21','sans dépasser'],['GAGNE','= plus de temps au flipper']]},
  flip:{from:'Delachaud',av:'#ff9a1f',msgs:['FLIPPER!!! Fais exploser le score 🎰'],tips:[['← →','palettes'],['ESPACE','les deux palettes'],['CANETTE','multiball + ralenti'],['JACKPOT','en haut : +1000']]},
  office:{from:'LD',av:'#c98a3b',msgs:['Yo! 5 à 7 chez Ginette ce soir 🍻','>C\'est bon, j\'arrive! J\'vais au dép avant 🍺'],tips:[['← →','marcher'],['ESPACE','sauter'],['↓','prendre l\'escalier (porte à droite)'],['TIENS E','voler le vin quand Dulac a le dos tourné'],['PLANTES','cache-toi quand Dulac revient vers toi']]},
  1:{from:'LD',av:'#c98a3b',msgs:['Arrête au dép pour des bières!'],tips:[['E','lancer une bière'],['ESPACE','saute sur la tête des passants'],['TOITS','balcons, auvents pis toits : grimpe partout'],['MAJ','sprint'],['10 CLOPES','= 1 vie de plus']]},
  boss:{from:'Ma blonde ❤️',av:'#f2c14e',msgs:['T\'es où là??','Je te vois. Bouge pas.'],tips:[['E','lance-lui des bières'],['ESPACE','saute sur sa tête'],['↑','étagère et comptoir pour esquiver ses cafés']]},
  2:{from:'LD',av:'#c98a3b',msgs:['On t\'attend chez Ginette!'],tips:[['BARS','passe sur l\'auvent : la porte te coûte une vie'],['E','une bière = un K.O.'],['⚠','trop de bières en main = tu tangues']]},
  joint:{from:'LD',av:'#c98a3b',msgs:['Le premier qui finit gagne 😏'],tips:[['CLIC / ESPACE','tirer une puff'],['TOUX','ralentis quand la jauge rougit']]},
  dance:{from:'Ginette',av:'#ff9ad5',msgs:['Personne sort sans danser, mon beau 💃'],tips:[['← ↓ ↑ →','quand la flèche touche la cible'],['60 %','des pas pour sortir']]},
  texto:{from:'Ma blonde ❤️',av:'#f2c14e',msgs:['Faut qu\'on se parle.'],tips:[['CLIC / 1 2 3','choisir ta réponse'],['UBER','mauvaise réponse = il approche'],['8 S','par question']]},
  bike:{from:'LD',av:'#c98a3b',msgs:['Prends mon skate, je dors ici 😴'],tips:[['← →','changer de voie'],['ESPACE','ollie : saute les cônes, trous pis barrières'],['↑ / ↓','pousser / freiner'],['EN L\'AIR + FLÈCHE','faire une figure'],['RAMPE','gros saut : enchaîne les figures']]},
  3:{from:'Ma blonde ❤️',av:'#f2c14e',msgs:['zzz'],tips:[['← →','marche doucement'],['MAJ','courir = bruit'],['E','vomir : 5 s sobre'],['CHIEN','il jappe si tu le touches'],['CRIK','planche qui craque : saute par-dessus']]},
};
setDiff(diff);diffReady=true;renderBoard();
let phone=null;
const LV_STORY={
  limo:'Delachaud t\'envoie une limo pour le Casino. Garde ton verre droit dans les virages pis prends les vodka-Red Bull qu\'il te tend.',
  bj:'Au Casino, Delachaud te met des jetons dans les mains : une main de blackjack. Approche-toi de 21 sans dépasser.',
  flip:'Delachaud t\'amène au flipper. Fais le plus gros score avant que l\'argent manque!',
  office:'17 h : la journée est faite, LD attend Michel pour la soirée. Descends par la porte à droite, faufile-toi dans la cuisine, vole le pinot de Dulac dans le frigo, pis sors par la porte noire.',
  1:'16 h 45, boulevard Saint-Laurent, devant Ribotti Vintage. Ramasse des clopes, évite le monde sur le trottoir pis rends-toi au dépanneur chercher de la bière.',
  boss:'Ta blonde t\'attend devant le frigo à bière, les bras croisés. Lance-lui des bières pour la calmer pis esquive ses cafés.',
  2:'21 h, le boulevard s\'allume. Rejoins le bar Chez Ginette sans te faire embarquer par tes collègues devant les bars.',
  joint:'Au fond du bar, LD sort un joint : « Le premier qui finit gagne. » Tire vite, mais surveille ta toux.',
  dance:'Ginette, le patron, bloque la sortie : personne ne repart sans danser avec lui. Suis le rythme!',
  texto:'Ton téléphone vibre : c\'est ta blonde. Réponds bien à ses textos, sinon elle te commande un Uber.',
  bike:'LD dort dans les toilettes. Prends son skate pis rentre chez vous : évite les chars, les cônes pis les trous.',
  3:'3 h du matin. Ta blonde dort au fond de l\'appart. Passe par le divan, le foyer pis le frigo pour éviter le chien pis les planches qui craquent, sans rien faire tomber. Attention : sauter de trop haut, ça fait du bruit.'};
function openPhone(o){
  if(!o.text)o.text=LV_STORY[level]||'';
  phone=Object.assign({t:0},o);state='phone';
  keys.l=keys.r=keys.j=keys.d=keys.s=keys.t=false;jumpBuf=0;throwReq=false;
  beep(880,1320,.09,'sine',.05);setTimeout(()=>beep(1320,1760,.09,'sine',.04),110);
}
function closePhone(){
  if(!phone)return;
  // too early (still sliding in): remember the press and start as soon as it's ready
  if(phone.t<.35){phone.want=true;return}
  phone=null;state='play';
  keys.l=keys.r=keys.j=keys.d=keys.s=keys.t=false;jumpBuf=0;throwReq=false;
  if(level==='dance'){stopDanceMusic();setupDance()}
}
const TOUCH_KEY={'← →':'◀ ▶','ESPACE':'▲','E':'BIÈRE','TIENS E':'TIENS VOLER','MAJ':'SPRINT','↓':'▼','↑':'▲','CLIC / ESPACE':'TOUCHE','CLIC / 1 2 3':'TOUCHE','← ↓ ↑ →':'◀ ▼ ▲ ▶','↑ / ↓':'POUSSE / FREINE','EN L\'AIR + FLÈCHE':'EN L\'AIR + ◀ ▶'};
function touchKey(k){if(!IS_TOUCH)return k;if(level==='bike'&&k==='ESPACE')return 'OLLIE';if(level===3&&k==='E')return 'VOMIR';if(level===3&&k==='MAJ')return 'COURIR';return TOUCH_KEY[k]||k}
function drawPhone(){
  const P=phone,T=TUTO[level]||TUTO[1];
  ctx.setTransform(scale,0,0,scale,0,0);
  ctx.fillStyle='rgba(26,10,44,.9)';ctx.fillRect(0,0,W,H);htFill2();
  const ph=528,pw=Math.round(ph*PHONE.ar),px=W-pw-60;
  // the controls, big, on the left
  let tipsEnd=0;
  {ctx.textBaseline='alphabetic';const tips=T.tips,rowH=Math.min(52,(H-250)/tips.length),y0=Math.max(98,(H-rowH*tips.length-120)/2+10),maxTx=px-48-30;tipsEnd=y0+rowH*tips.length;
   ctx.font='14px "Lilita One", Inter, Arial';ctx.fillStyle='#ffbf47';ctx.textAlign='left';ctx.globalAlpha=clamp(P.t*3,0,1);ctx.fillText('COMMENT JOUER',48,y0-18);
   tips.forEach(([key,txt],i)=>{
     const a=clamp((P.t-.12-i*.12)*4,0,1);if(a<=0)return;ctx.globalAlpha=a;
     const y=y0+i*rowH+(1-a)*12;
     key=touchKey(key);ctx.font='16px "Lilita One", Inter, Arial';const kw=Math.min(170,Math.max(48,ctx.measureText(key).width+28)),bh=rowH-14;
     ctx.fillStyle='#2a1240';pg(48,y+3,kw,bh);ctx.fill();ctx.fillStyle='#6a2fc2';pg(48,y,kw,bh);ctx.fill();htFill(false);ctx.strokeStyle='#2a1240';ctx.lineWidth=2.5;ctx.stroke();
     ctx.fillStyle='#ffbf47';ctx.textAlign='center';ctx.fillText(key,48+kw/2,y+bh/2+6,kw-16);
     ctx.font='700 16px Inter, Arial';ctx.fillStyle='#fff4dc';ctx.textAlign='left';
     const ls=wrapText(txt,maxTx-kw).slice(0,2);ls.forEach((l,j)=>ctx.fillText(l,48+kw+16,y+bh/2+6-(ls.length-1)*9+j*18));
   });ctx.globalAlpha=1}
  // the phone (Michel's cracked phone)
  const py=6+Math.max(0,(1-P.t*4))*40,SC=PHONE.scr;
  const sx=px+SC[0]*pw,sy=py+SC[1]*ph,sw=(SC[2]-SC[0])*pw,sh=(SC[3]-SC[1])*ph;
  ctx.save();rr(sx,sy,sw,sh,22);ctx.clip();
  ctx.fillStyle='#f4ecd6';ctx.fillRect(sx,sy,sw,sh);
  const hr=hourAt(camX+400),hh=Math.floor(hr),mm=Math.floor((hr-hh)*60);
  ctx.font='600 11px Inter, Arial';ctx.fillStyle='#2a1a16';ctx.textAlign='left';ctx.fillText(`${hh}:${String(mm).padStart(2,'0')}`,sx+16,sy+21);
  ctx.textAlign='right';ctx.fillText('23 %',sx+sw-14,sy+21);
  // contact header
  ctx.fillStyle='#e8dcc0';ctx.fillRect(sx,sy+36,sw,54);ctx.strokeStyle='rgba(42,26,22,.15)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx,sy+90);ctx.lineTo(sx+sw,sy+90);ctx.stroke();
  ctx.fillStyle=T.av;ctx.beginPath();ctx.arc(sx+34,sy+63,17,0,7);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  ctx.font='14px "Lilita One", Inter, Arial';ctx.fillStyle='#2a1a16';ctx.textAlign='center';ctx.fillText(T.from.charAt(0),sx+34,sy+68);
  ctx.textAlign='left';ctx.font='800 15px Inter, Arial';ctx.fillText(T.from,sx+60,sy+60);
  ctx.font='600 11px Inter, Arial';ctx.fillStyle='#3f8a4a';ctx.fillText('en ligne',sx+60,sy+76);
  // conversation: bubbles appear one by one; the newest stays in view
  const items=[];
  // the story text arrives as a notification, the people write in blue bubbles
  const clean=x=>String(x||'').replace(/<br\s*\/?>/gi,' · ').replace(/<[^>]+>/g,'');
  if(P.kicker||P.title||P.text)items.push({k:'notif',head:clean(P.kicker),title:clean(P.title),txt:clean(P.text)});
  for(const m of T.msgs)items.push(m[0]==='>'?{k:'msg',txt:m.slice(1),me:true}:{k:'msg',txt:m});
  const top=sy+98,bot=sy+sh-62,maxW=sw-20;
  let y=0;const lay=[];
  items.forEach((it,i)=>{
    if(it.k==='sys'){lay.push({it,y,h:22});y+=24;return}
    if(it.k==='notif'){ctx.font='500 12px Inter, Arial';const ls=it.txt?wrapText(it.txt,sw-44):[];const h=30+(it.title?18:0)+ls.length*15+10;lay.push({it,y,h,ls});y+=h+10;return}
    if(it.k==='msg'){ctx.font='600 14px Inter, Arial';const ls=wrapText(it.txt,maxW-24);const h=ls.length*18+16;lay.push({it,y,h,ls});y+=h+(it.me?20:8);return}
    ctx.font='900 12px Inter, Arial';const kw=Math.min(118,ctx.measureText(it.key).width+18);ctx.font='600 13px Inter, Arial';
    ctx.font='600 13px Inter, Arial';const ls=wrapText(it.txt,sw-kw-44);const h=Math.max(30,ls.length*16+12);lay.push({it,y,h,ls,kw});y+=h+5;
  });
  const shown=Math.min(items.length,Math.floor(P.t/.22)+1);
  const last=lay[shown-1],scroll=Math.max(0,last.y+last.h-(bot-top));
  ctx.save();ctx.beginPath();ctx.rect(sx,top,sw,bot-top);ctx.clip();
  lay.slice(0,shown).forEach((L,i)=>{
    const age=P.t-i*.22,a=clamp(age*5,0,1),yy=top+L.y-scroll+(1-a)*10,it=L.it;ctx.globalAlpha=a;
    if(it.k==='notif'){const nx=sx+8,nw=sw-16;
      ctx.save();ctx.shadowColor='rgba(0,0,0,.25)';ctx.shadowBlur=10;ctx.shadowOffsetY=3;ctx.fillStyle='rgba(28,26,38,.94)';rr(nx,yy,nw,L.h,14);ctx.fill();ctx.restore();
      ctx.fillStyle='#ffbf47';rr(nx+10,yy+9,16,16,4);ctx.fill();ctx.font='900 10px Inter, Arial';ctx.fillStyle='#1c1a26';ctx.textAlign='center';ctx.fillText('M',nx+18,yy+21);
      ctx.textAlign='left';ctx.font='700 10px Inter, Arial';ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillText((it.head||'LA RUN À MICHEL').toUpperCase(),nx+32,yy+21,nw-100);
      ctx.textAlign='right';ctx.font='500 10px Inter, Arial';ctx.fillText('maintenant',nx+nw-10,yy+21);
      let ty=yy+30;ctx.textAlign='left';
      if(it.title){ctx.font='800 13px Inter, Arial';ctx.fillStyle='#fff';ctx.fillText(it.title,nx+12,ty+12,nw-24);ty+=18}
      ctx.font='500 12px Inter, Arial';ctx.fillStyle='rgba(255,255,255,.88)';L.ls.forEach((l,j)=>ctx.fillText(l,nx+12,ty+12+j*15))}
    else if(it.k==='sys'){ctx.font='900 11px Inter, Arial';ctx.fillStyle='#8a7a6a';ctx.textAlign='center';ctx.fillText('— '+it.txt+' —',sx+sw/2,yy+18,sw-16)}
    else if(it.k==='msg'){const bw=Math.max(...L.ls.map(l=>{ctx.font='600 14px Inter, Arial';return ctx.measureText(l).width}))+24,bx=it.me?sx+sw-8-bw:sx+8;
      ctx.fillStyle=it.me?'#34c759':'#2f7cf6';rr(bx,yy,bw,L.h,14);ctx.fill();
      ctx.fillStyle='#fff';ctx.textAlign='left';ctx.font='600 14px Inter, Arial';L.ls.forEach((l,j)=>ctx.fillText(l,bx+12,yy+22+j*18));
      if(it.me){ctx.font='700 10px Inter, Arial';ctx.fillStyle='#8a7a6a';ctx.textAlign='right';ctx.fillText('VERV · envoyé',sx+sw-12,yy+L.h+11)}}
    else{ctx.fillStyle='#fffaf0';ctx.strokeStyle='rgba(42,26,22,.25)';ctx.lineWidth=1.5;rr(sx+8,yy,sw-16,L.h,10);ctx.fill();ctx.stroke();
      ctx.fillStyle='#2a1a16';rr(sx+14,yy+L.h/2-12,L.kw,24,4);ctx.fill();
      ctx.font='900 12px Inter, Arial';ctx.fillStyle='#ffbf47';ctx.textAlign='center';ctx.fillText(it.key,sx+14+L.kw/2,yy+L.h/2+5,L.kw-8);
      ctx.font='600 13px Inter, Arial';ctx.fillStyle='#2a1a16';ctx.textAlign='left';L.ls.forEach((l,j)=>ctx.fillText(l,sx+L.kw+22,yy+L.h/2+5-(L.ls.length-1)*8+j*16))}
    ctx.globalAlpha=1;
  });
  ctx.restore();
  // reply bar = the continue button
  const ready=P.t>.35,pulse=ready?.5+.5*Math.sin(t*5):0;
  ctx.fillStyle='#e8dcc0';ctx.fillRect(sx,bot+4,sw,sh-(bot-sy)-4);
  // a plain message field: the real button lives beside the phone
  {const bx=sx+12,bw=sw-24,by=bot+12,bh=34;ctx.fillStyle='#fffaf0';rr(bx,by,bw-44,bh,17);ctx.fill();ctx.strokeStyle='rgba(42,26,22,.2)';ctx.lineWidth=1.5;ctx.stroke();
   ctx.font='500 12px Inter, Arial';ctx.fillStyle='#9a8f80';ctx.textAlign='left';ctx.fillText('Message…',bx+14,by+21);
   ctx.fillStyle='#2f7cf6';ctx.beginPath();ctx.arc(bx+bw-17,by+bh/2,16,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(bx+bw-17,by+9);ctx.lineTo(bx+bw-10,by+18);ctx.lineTo(bx+bw-24,by+18);ctx.closePath();ctx.fill();ctx.fillRect(bx+bw-19,by+17,4,9)}
  ctx.restore();
  if(PHONE.im.complete)ctx.drawImage(PHONE.im,px,py,pw,ph);
  // the call to action, big and right under the controls
  {const a=clamp((P.t-.35)*4,0,1),cy=Math.min(H-110,tipsEnd+18),cw=Math.min(340,px-110),chh=58,lbl=(P.btn||'GO').toUpperCase()+'  ▸',sc=1+(ready?.025*pulse:0);
   ctx.save();ctx.globalAlpha=a;ctx.translate(48+cw/2,cy+chh/2);ctx.scale(sc,sc);
   ctx.fillStyle='#2a1240';pg(-cw/2,-chh/2+5,cw,chh);ctx.fill();
   ctx.shadowColor='rgba(255,61,154,.6)';ctx.shadowBlur=ready?14+10*pulse:0;
   {const g=ctx.createLinearGradient(0,-chh/2,0,chh/2);g.addColorStop(0,'#ffe772');g.addColorStop(.48,'#ffd23f');g.addColorStop(.52,'#ffb81f');g.addColorStop(1,'#ffc93a');ctx.fillStyle=ready?g:'rgba(255,210,63,.45)'}
   pg(-cw/2,-chh/2,cw,chh);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#2a1240';ctx.lineWidth=3;ctx.stroke();
   ctx.font='24px "Lilita One", Inter, Arial';ctx.fillStyle='#2a1240';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lbl,0,1,cw-30);
   ctx.restore();ctx.textBaseline='alphabetic';
   if(ready){ctx.font='600 13px Inter, Arial';ctx.fillStyle=`rgba(244,231,200,${.55+.45*pulse})`;ctx.textAlign='left';ctx.fillText(IS_TOUCH?'Touche l\'écran pour commencer':'ou appuie sur n\'importe quelle touche',52,cy+chh+24)}}
}
