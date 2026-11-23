// Manette : PAD_MAP (boutons -> touches), navigation spatiale dans les menus.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- gamepad: buttons become key presses; in menus the d-pad moves focus and A clicks ----------
const PAD_MAP=[['a',0,'Space'],['b',1,'KeyE'],['x',2,'KeyE'],['y',3,'ShiftLeft'],['rb',5,'ShiftLeft'],['rt',7,'ShiftLeft'],['start',9,'Escape'],['up',12,'ArrowUp'],['down',13,'ArrowDown'],['left',14,'ArrowLeft'],['right',15,'ArrowRight']];
let padPrev={};
function padKey(code,down){window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code,key:code,bubbles:true,cancelable:true}))}
function visibleMenu(){for(const id of ['setOv','chapOv','trophOv','boardOv','pauseOv','dev','over','title']){const el=document.getElementById(id);if(el&&!el.hidden)return el}return null}
// gamepad menus: the d-pad moves to the nearest button in that direction (rows and columns, like a console menu)
function padButtons(menu){return [...menu.querySelectorAll('button,input')].filter(b=>!b.disabled&&b.offsetParent!==null)}
function moveSpatial(menu,dir){
  const bs=padButtons(menu);if(!bs.length)return;
  const cur=document.activeElement;
  if(!bs.includes(cur)){(menu.querySelector('#start,#resumeBtn,#contBtn,#again,#setBack,#closeBoard,#closeTroph')||bs[0]).focus();return}
  const r0=cur.getBoundingClientRect(),cx=r0.left+r0.width/2,cy=r0.top+r0.height/2;let best=null,bd=1e9;
  for(const b of bs){if(b===cur)continue;const r=b.getBoundingClientRect(),x=r.left+r.width/2-cx,y=r.top+r.height/2-cy;
    const along=dir==='left'?-x:dir==='right'?x:dir==='up'?-y:y,horiz=dir==='left'||dir==='right',side=horiz?Math.max(0,Math.abs(y)-(r.height+r0.height)/2):Math.max(0,Math.abs(x)-(r.width+r0.width)/2);
    if(along<4||(horiz&&side>6))continue;const perp=horiz?Math.abs(y):Math.abs(x),d=along+side*2.2+perp*(horiz?1.2:.35);if(d<bd){bd=d;best=b}}
  if(best)best.focus();
}
function padBack(menu){
  const id=menu.id;
  if(id==='setOv')closeSettings();
  else if(id==='trophOv')document.getElementById('closeTroph').click();
  else if(id==='chapOv')document.getElementById('closeChap').click();
  else if(id==='boardOv')document.getElementById('closeBoard').click();
  else if(id==='pauseOv')document.getElementById('resumeBtn').click();
  else if(id==='dev')toggleDev();
}
function moveFocus(menu,d){const bs=[...menu.querySelectorAll('button')].filter(b=>!b.disabled&&b.offsetParent!==null);if(!bs.length)return;let i=bs.indexOf(document.activeElement);i=i<0?0:(i+d+bs.length)%bs.length;bs[i].focus()}
function pollPad(){
  const gps=navigator.getGamepads?navigator.getGamepads():[];let g=null;
  for(const p of gps)if(p&&p.connected){g=p;break}
  if(!g)return;
  if(g.buttons.some(b=>b&&b.pressed))document.body.classList.add('pad');
  const now={};
  for(const [n,i] of PAD_MAP){const b=g.buttons[i];now[n]=!!(b&&(b.pressed||b.value>.5))}
  const ax=g.axes[0]||0,ay=g.axes[1]||0;
  now.left=now.left||ax<-.5;now.right=now.right||ax>.5;now.up=now.up||ay<-.6;now.down=now.down||ay>.6;
  if(state==='video'||state==='outro'){if((now.a&&!padPrev.a)||(now.start&&!padPrev.start))(state==='video'?endIntro:endOutro)();padPrev=now;return}
  const menu=(state==='video'||state==='phone')?null:visibleMenu();
  for(const [n,,code] of PAD_MAP){
    if(now[n]===!!padPrev[n])continue;
    if(menu){
      if(!now[n])continue;
      document.body.classList.add('pad');
      if(n==='a'){let el=document.activeElement;
        if(!(el&&menu.contains(el)&&(el.tagName==='BUTTON'||el.tagName==='INPUT')))el=menu.querySelector('#start,#resumeBtn,#contBtn,#again,#setBack,#closeBoard,#closeTroph')||menu.querySelector('button');
        if(el&&el.tagName==='INPUT')el=document.getElementById('nameBtn');
        if(el&&el.id==='nameBtn'&&!cleanName(nameIn.value))nameIn.value='MICHEL';
        el&&el.click()}
      else if(n==='up'||n==='down'||n==='left'||n==='right'){moveSpatial(menu,n);padRep={n,t:performance.now()+380}}
      else if(n==='b'||n==='x')padBack(menu);
      else if(n==='start'){if(menu.id==='title')document.getElementById('start').click();else if(menu.id==='pauseOv'||menu.id==='setOv'||menu.id==='dev')padBack(menu);else{padKey('Escape',true);padKey('Escape',false)}}
      continue;
    }
    padKey(code,now[n]);
  }
  // hold a direction in menus: it repeats
  if(menu&&padRep&&now[padRep.n]&&performance.now()>padRep.t){moveSpatial(menu,padRep.n);padRep.t=performance.now()+140}
  if(!menu||(padRep&&!now[padRep.n]))padRep=null;
  padPrev=now;
}
let padRep=null;
addEventListener('mousemove',()=>document.body.classList.remove('pad'),{passive:true});
addEventListener('gamepadconnected',e=>{const n=document.getElementById('padNote');if(n)n.textContent='Manette connectée : '+e.gamepad.id.slice(0,48);if(state==='play')banner={text:'MANETTE CONNECTÉE',sub:'Start pour la pause · Settings pour les contrôles',t:2.2,c:'#2f6f6b'}});
