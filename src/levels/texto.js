// Niveau « texto » : répondre aux textos de la blonde.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- mini-game: answer your girlfriend's texts before she books you an Uber ----------
const QUESTIONS=[
  ['T\'es où là?',['Chez Ginette, j\'m\'en viens bientôt ❤️','Dans un bar… quelque part','Qui ça?']],
  ['T\'as bu combien de bières?',['Deux. Peut-être trois.','J\'ai arrêté de compter à 7','Bières? Quelles bières? hic']],
  ['Tu rentres à quelle heure?',['Avant 3 h, promis','Quand Ginette me laisse partir','Demain midi pis encore']],
  ['C\'est qui ça, LD?',['Un gars de la job, inoffensif','Un ami… compliqué à expliquer','Mon nouveau meilleur ami 🌿']],
  ['T\'as pensé au lait?',['Oui, je passe au dépanneur en revenant','Du lait de quoi?','J\'ai acheté de la bière à la place']],
  ['Pourquoi tu m\'as envoyé un selfie avec une drag queen?',['C\'est Ginette, elle te salue!','J\'sais pas, mon pouce a glissé','Elle danse mieux que toi']],
  ['Tu fumes encore?',['Non non, c\'est la boucane du bar','Juste une… ou deux','Juste un p\'tit joint avec LD']],
  ['Tu m\'aimes?',['Plus que la poutine ❤️','Ben oui, tsé','Ça dépend, t\'es qui?']],
  ['Dulac dit que t\'as volé son vin.',['Je l\'ai emprunté pour toi 🍷','Quel vin?','Dulac est un pas bon']],
  ['Tu veux que j\'aille te chercher?',['Non, je rentre en skate, je suis prudent','Peut-être… t\'as l\'auto?','Viens danser avec Ginette!']],
];
const REACT=[['Ok 😊','Haha t\'es cute','Bon, correct.','Aww ❤️'],['Hmm.','…ok?','On s\'en reparle.','Mouin.'],['PARDON?!','Je regarde les Uber, là.','T\'es sérieux?','Wow. Juste wow.']];
const QTIME=8;
let TX=null;
function setupTexto(){
  const qs=QUESTIONS.slice().sort(()=>Math.random()-.5).slice(0,6);
  TX={qs,i:-1,u:.42,uv:.42,msgs:[],phase:'typing',pt:1.1,sel:0,opts:null,qt:DF.qtime,done:false,endT:0,win:false,boxes:[]};
}
function scramble(s,d){
  if(d<.05)return s;
  const a=[...s];
  for(let i=1;i<a.length-1;i++)if(a[i]!==' '&&a[i+1]!==' '&&Math.random()<d*.22){const k=a[i];a[i]=a[i+1];a[i+1]=k;i++}
  return a.join('');
}
function nextQuestion(){
  const T=TX;T.i++;
  if(T.i>=T.qs.length){finishTexto(true);return}
  const q=T.qs[T.i];
  T.msgs.push({me:false,txt:q[0]});
  const d=drunk();
  T.opts=q[1].map((txt,k)=>({k,txt,shown:scramble(txt,d)})).sort(()=>Math.random()-.5);
  T.sel=0;T.qt=QTIME*(1-.25*d);T.phase='answer';beep(900,1200,.08,'sine',.05);
}
function answerTexto(idx){
  const T=TX;if(!T||T.phase!=='answer')return;
  const o=T.opts[idx];if(!o)return;
  const q=o.k,d=drunk();if(q!==0)T.imperfect=true;
  let txt=o.shown;if(d>.4&&Math.random()<d)txt+=' '+pick(['🍺','🍺🍺','😵','🕺','🌭']);
  T.msgs.push({me:true,txt});
  T.u=clamp(T.u+[-.24,.09*DF.uber,.3*DF.uber][q],0,1.2);
  score+=[120,30,0][q];
  T.react=q;T.phase='react';T.pt=1;T.opts=null;beep(600,500,.06,'triangle',.04);
}
function finishTexto(win){
  const T=TX;if(T.done)return;T.done=true;T.win=win;T.endT=0;
  if(win){T.msgs.push({me:false,txt:'Bon OK, amuse-toi. Mais rentre avant 3 h. ❤️'});score+=300;if(!T.imperfect)award('chum')}
  else T.msgs.push({me:false,txt:'C\'est fini. Ton Uber est en bas. 🚗'});
}
function updateTexto(dt){
  const T=TX;
  T.uv+=(Math.min(1,T.u)-T.uv)*Math.min(1,dt*3);
  if(T.done){T.endT+=dt;
    if(T.endT>2.6&&state==='play'){
      if(T.win)showCard('ELLE TE LAISSE FINIR LA SOIRÉE · +300','LA LIMO DE DELACHAUD','Delachaud texte : « MICHEL!! J\'t\'envoie une limo, on s\'en va au Casino! » Garde ton verre droit dans les virages avec ← →, sinon tu vas être malade. E pour prendre un vodka-Red Bull.','MONTER DANS LA LIMO',()=>{startLevel('limo');state='play';banner=null});
      else{lives--;if(lives<=0){gameOver('TA BLONDE T\'A COMMANDÉ UN UBER');return}
        showCard('L\'UBER EST ARRIVÉ · −1 VIE','ON RECOMMENCE','Ta blonde t\'a commandé un Uber. Tu le cancelles pis tu réessaies. Réponds comme du monde, cette fois.','RELIRE LES TEXTOS',()=>{startLevel('texto');state='play'})}
    }
    return}
  if(T.phase==='typing'){T.pt-=dt;if(T.pt<=0)nextQuestion();return}
  if(T.phase==='react'){T.pt-=dt;if(T.pt<=0){T.msgs.push({me:false,txt:pick(REACT[T.react])});
    if(T.u>=1){finishTexto(false);return}
    if(T.u<=0){finishTexto(true);return}
    T.phase='typing';T.pt=1}return}
  if(T.phase==='answer'){T.qt-=dt;if(T.qt<=0){T.imperfect=true;T.msgs.push({me:true,txt:'…'});T.u=clamp(T.u+.25,0,1.2);T.react=2;T.phase='react';T.pt=1;T.opts=null;sfx.hurt()}}
}
function textoClick(x,y){
  const T=TX;if(!T||T.phase!=='answer')return;
  T.boxes.forEach((b,i)=>{if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)answerTexto(i)});
}
function wrapText(txt,maxW){
  const words=txt.split(' '),lines=[];let cur='';
  for(const w of words){const tst=cur?cur+' '+w:w;if(ctx.measureText(tst).width>maxW&&cur){lines.push(cur);cur=w}else cur=tst}
  if(cur)lines.push(cur);return lines;
}
function drawTexto(){
  const T=TX,d=drunk();
  // the street outside the bar, blurred by the night
  const bg=BGS.night;if(bg.complete){if(!bg.blurCv){const c=document.createElement('canvas');c.width=1040;c.height=580;const g=c.getContext('2d');g.filter='blur(3px)';g.drawImage(bg,0,0,1040,580);bg.blurCv=c}ctx.drawImage(bg.blurCv,-40+Math.sin(t*.3)*10,-20,1040,580)}
  ctx.fillStyle='rgba(16,14,30,.55)';ctx.fillRect(0,0,W,H);
  // Michel, swaying, staring at his phone
  ctx.save();ctx.translate(150,H-20);ctx.rotate(Math.sin(t*1.7)*.05*(1+d*2));drawRig(RIGS.hero,230,{armL:-1.5,armR:-.3});ctx.restore();
  // phone
  const px=290,py=36,pw=330,ph=480;
  ctx.fillStyle='#1d1f2b';rr(px,py,pw,ph,34);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle='#f4ecd6';rr(px+12,py+44,pw-24,ph-58,12);ctx.fill();
  ctx.fillStyle='#2b2b2b';rr(px+pw/2-36,py+16,72,12,6);ctx.fill();
  ctx.fillStyle='#ff9ad5';ctx.beginPath();ctx.arc(px+40,py+70,14,0,7);ctx.fill();ctx.font='900 12px Inter, Arial';ctx.fillStyle='#2b2b2b';ctx.textAlign='left';ctx.fillText('MA BLONDE ❤️',px+62,py+74);
  ctx.strokeStyle='rgba(42,26,22,.2)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px+12,py+92);ctx.lineTo(px+pw-12,py+92);ctx.stroke();
  // chat history, newest at the bottom
  ctx.save();ctx.beginPath();ctx.rect(px+12,py+94,pw-24,ph-230);ctx.clip();
  ctx.font='600 13px Inter, Arial';
  let y=py+ph-140;
  if(T.phase==='typing'&&!T.done){ctx.fillStyle='#ffffff';rr(px+24,y-34,58,28,12);ctx.fill();ctx.fillStyle='#8c8aa0';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(px+40+i*13,y-20+Math.sin(t*8+i)*2,3.5,0,7);ctx.fill()}y-=42}
  for(let k=T.msgs.length-1;k>=0&&y>py+100;k--){
    const m=T.msgs[k],lines=wrapText(m.txt,200),h=lines.length*17+12,w=Math.max(...lines.map(l=>ctx.measureText(l).width))+22;
    const x=m.me?px+pw-24-w:px+24;y-=h;
    ctx.fillStyle=m.me?'#5ee0ff':'#ffffff';rr(x,y,w,h,12);ctx.fill();ctx.strokeStyle='rgba(42,26,22,.25)';ctx.stroke();
    ctx.fillStyle='#2b2b2b';ctx.textAlign='left';lines.forEach((l,i)=>ctx.fillText(l,x+11,y+18+i*17));y-=8;
  }
  ctx.restore();
  // answers
  T.boxes=[];
  if(T.phase==='answer'&&T.opts){
    const by=py+ph-126;
    T.opts.forEach((o,i)=>{
      const dx=Math.sin(t*1.8+i*2.1)*18*d,dy=Math.cos(t*1.4+i)*3*d;
      const b={x:px+22+dx,y:by+i*38+dy,w:pw-44,h:32};T.boxes.push(b);
      ctx.fillStyle=i===T.sel?'#ffd166':'#ffffff';rr(b.x,b.y,b.w,b.h,10);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
      ctx.font='900 11px Inter, Arial';ctx.fillStyle='#c8403a';ctx.textAlign='left';ctx.fillText(String(i+1),b.x+10,b.y+21);
      ctx.font='600 12px Inter, Arial';ctx.fillStyle='#2b2b2b';
      let s=o.shown;while(ctx.measureText(s).width>b.w-40&&s.length>4)s=s.slice(0,-2);if(s!==o.shown)s+='…';
      [...s].reduce((xx,ch,ci)=>{const jy=d>.2?Math.sin(t*9+ci)*1.6*d:0;ctx.fillText(ch,xx,b.y+21+jy);return xx+ctx.measureText(ch).width},b.x+28);
    });
    const tw=pw-44,tp=clamp(T.qt/QTIME,0,1);ctx.fillStyle='#3a2a34';pg(px+22,by-14,tw,6,3);ctx.fill();ctx.fillStyle=tp<.3?'#ff5d8f':'#9fe3a0';pg(px+22,by-14,Math.max(2,tw*tp),6,3);ctx.fill();
  }
  // the Uber map
  const mx=650,my=70,mw=280,mh=330;
  ctx.fillStyle='#e8e4da';rr(mx,my,mw,mh,14);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.stroke();
  ctx.save();ctx.beginPath();ctx.rect(mx+4,my+4,mw-8,mh-8);ctx.clip();
  ctx.strokeStyle='#ffffff';ctx.lineWidth=10;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(mx,my+30+i*58);ctx.lineTo(mx+mw,my+10+i*58);ctx.stroke();ctx.beginPath();ctx.moveTo(mx+20+i*52,my);ctx.lineTo(mx+40+i*52,my+mh);ctx.stroke()}
  ctx.fillStyle='#b8d8a8';ctx.fillRect(mx+150,my+40,90,70);ctx.fillStyle='#9fc2e6';ctx.fillRect(mx+10,my+230,80,70);
  const path=[[mx+30,my+300],[mx+60,my+190],[mx+180,my+170],[mx+200,my+90]];
  ctx.strokeStyle='#2b3550';ctx.lineWidth=4;ctx.setLineDash([8,6]);ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.setLineDash([]);
  const seg=Math.min(2.999,T.uv*3),si=Math.floor(seg),f=seg-si,cx=lerp(path[si][0],path[si+1][0],f),cy=lerp(path[si][1],path[si+1][1],f);
  ctx.fillStyle='#ff5d8f';ctx.beginPath();ctx.arc(path[3][0],path[3][1],12,0,7);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();ctx.font='900 10px Inter, Arial';ctx.fillStyle='#2b2b2b';ctx.textAlign='center';ctx.fillText('CHEZ GINETTE',path[3][0],path[3][1]-18);
  ctx.fillStyle='#1d1d22';rr(cx-16,cy-9,32,18,6);ctx.fill();ctx.fillStyle='#ffffff';ctx.font='900 8px Inter, Arial';ctx.fillText('UBER',cx,cy+3);
  ctx.restore();
  const eta=Math.max(0,Math.round((1-T.uv)*14));
  ctx.fillStyle='rgba(32,13,56,.9)';pg(mx,my+mh+10,mw,58,10);ctx.fill();
  ctx.font='14px "Lilita One", Inter, Arial';ctx.textAlign='left';ctx.fillStyle=T.uv>.7?'#ff5d8f':'#f4e7c8';ctx.fillText(T.uv>=1?'TON UBER EST ARRIVÉ':'UBER : '+eta+' MIN',mx+14,my+mh+34);
  ctx.font='600 12px Inter, Arial';ctx.fillStyle='#c9c4d8';ctx.fillText('Bonne réponse = l\'Uber recule',mx+14,my+mh+54);
  hud(0);
  ctx.font='900 13px Inter, Arial';ctx.textAlign='center';ctx.fillStyle='#fff4dc';ctx.strokeStyle=INK;ctx.lineWidth=4;const tip='CLIQUE UNE RÉPONSE OU 1 · 2 · 3';ctx.strokeText(tip,px+pw/2,H-8);ctx.fillText(tip,px+pw/2,H-8);
}

// ---------- registre ----------
defineLevel({
  id:'texto', n:7,
  name:'LES TEXTOS', stage:'Textos', chapter:'Les textos',
  dev:'Textos', devTitle:'TEXTOS',
  track:'d', hour:()=>.9,
  place:()=>'Devant le bar',
  start:setupTexto,
  update:updateTexto, draw:drawTexto,
  keydown:e=>{
    if(!(TX&&TX.phase==='answer'))return false;
    const n='123'.indexOf(e.key);if(n>=0){e.preventDefault();answerTexto(n);return true}
    if(e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();TX.sel=(TX.sel+2)%3;return true}
    if(e.code==='ArrowDown'||e.code==='KeyS'){e.preventDefault();TX.sel=(TX.sel+1)%3;return true}
    if(e.code==='Enter'||e.code==='Space'){e.preventDefault();answerTexto(TX.sel);return true}
    return false},
  pointer:(e,x,y)=>{e.preventDefault();textoClick(x,y)},
  pad:()=>'none',
  tuto:{from:'Ma blonde ❤️',av:'#f2c14e',msgs:['Faut qu\'on se parle.'],tips:[['CLIC / 1 2 3','choisir ta réponse'],['UBER','mauvaise réponse = il approche'],['8 S','par question']]},
  story:'Ton téléphone vibre : c\'est ta blonde. Réponds bien à ses textos, sinon elle te commande un Uber.',
  ctrl:[['Choisir une réponse','↑ ↓','CROIX ↑ ↓'],['Répondre','1 2 3 · ESPACE','A']],
});
