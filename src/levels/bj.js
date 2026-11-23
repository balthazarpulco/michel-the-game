// Niveau « bj » : blackjack.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------------- 3. BLACKJACK ----------------
let BJ=null,flipBonus=0;
function bjVal(h){let s=0,a=0;for(const c of h){if(c.hide)continue;s+=c.v===1?11:Math.min(10,c.v);if(c.v===1)a++}while(s>21&&a){s-=10;a--}return s}
function setupBJ(){camX=0;genDone=true;const deck=[];for(const s of '♠♥♦♣')for(let v=1;v<=13;v++)deck.push({v,s});deck.sort(()=>Math.random()-.5);
  BJ={deck,p:[],d:[],phase:'deal',pt:.5,dealt:0,sel:0,res:null,endT:0,say:'Une main, Michel. Tout ce que t\'as!',sayT:3,boxes:[]};flipBonus=0}
function bjDraw(to,hide){const c=BJ.deck.pop();c.hide=!!hide;c.a=0;to.push(c);beep(900,600,.04,'triangle',.03)}
function bjAct(i){const B=BJ;if(!B||B.phase!=='play')return;if(i===0){bjDraw(B.p);if(bjVal(B.p)>21){B.phase='res';bjResolve()}else if(bjVal(B.p)===21){B.phase='dealer';B.pt=.6;B.d[1].hide=false}}else{B.phase='dealer';B.pt=.6;B.d[1].hide=false;beep(500,700,.08,'triangle',.04)}}
function bjResolve(){const B=BJ,p=bjVal(B.p),d=bjVal(B.d.map(c=>({...c,hide:false}))),nat=B.p.length===2&&p===21;
  B.d.forEach(c=>c.hide=false);
  B.res=p>21?'lose':nat&&!(B.d.length===2&&d===21)?'bj':d>21||p>d?'win':p===d?'push':'lose';
  B.phase='done';B.endT=0;
  const R={bj:['BLACKJACK!!','#ffd23f',10,600],win:['GAGNÉ!','#9fe3a0',6,350],push:['ÉGALITÉ','#5ee0ff',3,100],lose:['PERDU…','#ff3d9a',0,0]}[B.res];
  flipBonus=R[2];score+=R[3];banner={text:R[0],sub:R[2]?'+'+R[2]+' s au flipper':'Delachaud : « C\'est rien, on va se refaire au flipper! »',t:2.2,c:R[1]==='#ff3d9a'?'#c8403a':'#2f6f6b'};
  if(R[2]){fxBurst(480,300,['#ffd23f','#fff4dc','#f2c14e'],50,420);shake=.2;sfx.cig()}else sfx.hurt();
  if(B.res==='bj')award('bj');
  B.say=B.res==='lose'?'Ah ben… au flipper d\'abord!':'MICHEL!!! T\'ES UN GÉNIE!';B.sayT=2.2}
function updateBJ(dt){const B=BJ;mgParts(dt);B.sayT-=dt;for(const c of B.p.concat(B.d))c.a=Math.min(1,c.a+dt*4);
  if(B.phase==='deal'){B.pt-=dt;if(B.pt<=0){const n=B.dealt++;bjDraw(n%2?B.d:B.p,n===3);B.pt=.32;if(B.dealt>=4){B.phase='play';if(bjVal(B.p)===21){B.phase='dealer';B.pt=.6;B.d[1].hide=false}}}}
  else if(B.phase==='dealer'){B.pt-=dt;if(B.pt<=0){if(bjVal(B.d)<17&&bjVal(B.p)<=21&&!(B.p.length===2&&bjVal(B.p)===21)){bjDraw(B.d);B.pt=.6}else{B.phase='res';bjResolve()}}}
  else if(B.phase==='done'){B.endT+=dt;if(B.endT>2.6&&state==='play'){const R={bj:'BLACKJACK',win:'MAIN GAGNÉE',push:'ÉGALITÉ',lose:'MAIN PERDUE'}[B.res];
    showCard(R+(flipBonus?' · +'+flipBonus+' S AU FLIPPER':''),'LE FLIPPER','Delachaud t\'amène au flipper : « '+(15+flipBonus)+' secondes, fais exploser le score! » ← → pour les palettes. Touche la canette de vodka-Red Bull : multiball au ralenti!','JOUER AU FLIPPER',()=>{startLevel('flip');state='play'})}}}
function drawCard(c,x,y,s){const w=58*s,h=82*s,a=c.a;ctx.save();ctx.translate(x+w/2,y+h/2+(1-a)*-60);ctx.rotate((1-a)*-.6);ctx.globalAlpha=a;
  ctx.fillStyle='rgba(0,0,0,.25)';rr(-w/2+3,-h/2+4,w,h,7);ctx.fill();
  if(c.hide){ctx.fillStyle='#6a2fc2';rr(-w/2,-h/2,w,h,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;rr(-w/2+5,-h/2+5,w-10,h-10,5);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.25)';for(let i=0;i<5;i++)for(let k=0;k<7;k++)if((i+k)%2)ctx.fillRect(-w/2+9+i*8,-h/2+9+k*9,6,6)}
  else{ctx.fillStyle='#fffaf0';rr(-w/2,-h/2,w,h,7);ctx.fill();ctx.strokeStyle='#2a1240';ctx.lineWidth=2;ctx.stroke();const red=c.s==='♥'||c.s==='♦',n=c.v===1?'A':c.v===11?'J':c.v===12?'Q':c.v===13?'K':String(c.v);
    ctx.fillStyle=red?'#d62839':'#1d1626';ctx.font=`900 ${16*s}px Inter, Arial`;ctx.textAlign='left';ctx.fillText(n,-w/2+6,-h/2+18*s);ctx.font=`${12*s}px Inter, Arial`;ctx.fillText(c.s,-w/2+6,-h/2+32*s);ctx.font=`${30*s}px Inter, Arial`;ctx.textAlign='center';ctx.fillText(c.s,0,12*s)}
  ctx.restore();ctx.globalAlpha=1}
function drawBJ(){const B=BJ;
  const g=ctx.createRadialGradient(W/2,H*.75,40,W/2,H*.6,640);g.addColorStop(0,'#1f8a52');g.addColorStop(1,'#0b3d24');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#2a1240';ctx.fillRect(0,0,W,52);ctx.save();ctx.shadowColor='#ff3d9a';ctx.shadowBlur=14;ctx.fillStyle='#ff3d9a';ctx.fillRect(0,52,W,4);ctx.restore();
  ctx.strokeStyle='rgba(255,230,160,.5)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(W/2,-90,420,330,0,.12*Math.PI,.88*Math.PI);ctx.stroke();
  ctx.font='16px "Lilita One", Inter, Arial';ctx.fillStyle='rgba(255,230,160,.75)';ctx.textAlign='center';ctx.fillText('LE BLACKJACK PAIE 3 POUR 2 · LE CROUPIER TIRE JUSQU\'À 17',W/2,262);
  // chips
  for(let s=0;s<4;s++)for(let i=0;i<5;i++){ctx.fillStyle=['#c8403a','#2f6fb3','#2a1240','#ffd23f'][s];ctx.beginPath();ctx.ellipse(800+s*30,420-i*5,14,6,0,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke()}
  const row=(h,y)=>{const s=1.2,w=58*s,gap=14,tw=h.length*(w+gap)-gap;h.forEach((c,i)=>drawCard(c,W/2-tw/2+i*(w+gap),y,s))};
  row(B.d,82);row(B.p,286);
  const tag=(txt,y,c)=>{ctx.font='18px "Lilita One", Inter, Arial';const w=ctx.measureText(txt).width+26;ctx.fillStyle='#2a1240';pg(W/2-w/2,y,w,26);ctx.fill();ctx.fillStyle=c;ctx.textAlign='center';ctx.fillText(txt,W/2,y+19)};
  if(B.d.length)tag('CROUPIER · '+bjVal(B.d)+(B.d.some(c=>c.hide)?' + ?':''),190,'#fff4dc');
  if(B.p.length)tag('MICHEL · '+bjVal(B.p),396,bjVal(B.p)>21?'#ff3d9a':'#ffd23f');
  // buttons
  B.boxes=[];if(B.phase==='play'){['TIRER','RESTER'].forEach((l,i)=>{const x=W/2-170+i*180,y=440,w=160,h=50,on=B.sel===i;B.boxes.push({x,y,w,h});
    ctx.fillStyle='#2a1240';pg(x,y+5,w,h);ctx.fill();ctx.fillStyle=on?'#ffd23f':'#8b4fe0';pg(x,y,w,h);ctx.fill();ctx.strokeStyle='#2a1240';ctx.lineWidth=3;ctx.stroke();
    ctx.font='22px "Lilita One", Inter, Arial';ctx.fillStyle=on?'#2a1240':'#fff';ctx.textAlign='center';ctx.fillText((i?'2 · ':'1 · ')+l,x+w/2,y+33)})}
  // Delachaud and Michel at the table
  {ctx.save();ctx.translate(110,H+40);drawRig(RIGS[DELACHAUD],330,{armL:B.res&&B.res!=='lose'?2+Math.sin(t*12)*.3:-.2,armR:B.res&&B.res!=='lose'?-2:-.1,ex:{mouth:B.sayT>0?'talk':'grin',blink:blinkAt(3)}});ctx.restore();if(B.sayT>0)bubble(B.say,150,240,true)}
  {const win=B.res&&B.res!=='lose',lose=B.res==='lose';ctx.save();ctx.translate(860,H+60+(win?-Math.abs(Math.sin(t*10))*14:0));ctx.scale(-1,1);drawRig(RIGS.hero,340,{armL:win?-2.8:-.4,foreL:win?-.4:-.2,ex:win?{mouth:'grin',brow:-.6,blink:0}:lose?{mouth:'frown',brow:.8,blink:0}:{mouth:'flat',look:{x:-.6,y:.3}}});ctx.restore()}
  mgDrawParts();hud(0);mgBanner();
  {ctx.textAlign='center';ctx.font='700 12px Inter, Arial';ctx.fillStyle='#fff4dc';ctx.strokeStyle=INK;ctx.lineWidth=4;const s=IS_TOUCH?'TOUCHE TIRER OU RESTER':'← → CHOISIR · ESPACE OU CLIC · 1 TIRER · 2 RESTER';ctx.strokeText(s,W/2,H-10);ctx.fillText(s,W/2,H-10)}}
function bjClick(x,y){const B=BJ;if(!B)return;B.boxes.forEach((b,i)=>{if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)bjAct(i)})}

// ---------- registre ----------
defineLevel({
  id:'bj', n:9,
  name:'BLACKJACK', stage:'Blackjack', chapter:'Blackjack',
  dev:'Blackjack', devTitle:'BLACKJACK',
  track:'d', hour:()=>1.25,
  place:()=>'Au Casino',
  start:setupBJ,
  update:updateBJ, draw:drawBJ,
  keydown:e=>{
    if(!BJ)return false;
    if(e.code==='ArrowLeft'||e.code==='KeyA'){e.preventDefault();BJ.sel=0;return true}
    if(e.code==='ArrowRight'||e.code==='KeyD'){e.preventDefault();BJ.sel=1;return true}
    if(e.key==='1'||e.key==='2'){e.preventDefault();bjAct(+e.key-1);return true}
    if(['Space','Enter','KeyE','ArrowUp'].includes(e.code)){e.preventDefault();if(!e.repeat)bjAct(BJ.sel);return true}
    return false},
  pointer:(e,x,y)=>{e.preventDefault();bjClick(x,y)},
  pad:()=>'none',
  keys:[['1','tirer'],['2','rester'],['CLIC','choisir']],
  tuto:{from:'Delachaud',av:'#ff9a1f',msgs:['Une main. Tout ce que t\'as! 🃏'],tips:[['TIRER','une carte de plus'],['RESTER','le croupier joue'],['21','sans dépasser'],['GAGNE','= plus de temps au flipper']]},
  story:'Au Casino, Delachaud te met des jetons dans les mains : une main de blackjack. Approche-toi de 21 sans dépasser.',
  ctrl:[['Choisir Tirer / Rester','← →','CROIX'],['Valider','ESPACE · E','A · B'],['Tirer · Rester direct','1 · 2','—']],
});
