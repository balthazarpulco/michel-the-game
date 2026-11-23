// Tactile : pad reconstruit pour chaque niveau (padFor, buildPad), clics sur le canvas.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- touch pad: rebuilt for each level, buttons send the same keys as the keyboard ----------
const IS_TOUCH=(()=>{try{return matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0&&matchMedia('(hover:none)').matches}catch(e){return false}})();
if(IS_TOUCH)document.body.classList.add('is-touch');
const touchEl=document.getElementById('touch'),tpL=document.getElementById('tpL'),tpR=document.getElementById('tpR');
let padLayout='';
function buzz(){try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}}
function tbtn(label,code,cls){
  const b=document.createElement('div');b.className='tb '+(cls||'');b.innerHTML='<span>'+label+'</span>';
  const down=e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}if(b.classList.contains('on'))return;b.classList.add('on');buzz();padKey(code,true)};
  const up=e=>{e.preventDefault();if(!b.classList.contains('on'))return;b.classList.remove('on');padKey(code,false)};
  b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);
  b.addEventListener('contextmenu',e=>e.preventDefault());
  return b;
}
// left/right as one zone: slide the thumb across without lifting it
function dpad(){
  const z=document.createElement('div');z.className='dpad';
  const l=document.createElement('div'),r=document.createElement('div');l.className=r.className='tb';l.innerHTML='<span>◀</span>';r.innerHTML='<span>▶</span>';z.append(l,r);
  let cur=null;const set=d=>{if(d===cur)return;if(cur){padKey(cur==='l'?'ArrowLeft':'ArrowRight',false);(cur==='l'?l:r).classList.remove('on')}cur=d;if(d){padKey(d==='l'?'ArrowLeft':'ArrowRight',true);(d==='l'?l:r).classList.add('on');buzz()}};
  const pick=e=>{const R=z.getBoundingClientRect();return e.clientX<R.left+R.width/2?'l':'r'};
  z.addEventListener('pointerdown',e=>{e.preventDefault();try{z.setPointerCapture(e.pointerId)}catch(_){}set(pick(e))});
  z.addEventListener('pointermove',e=>{if(cur)set(pick(e))});
  const end=e=>{e.preventDefault();set(null)};
  z.addEventListener('pointerup',end);z.addEventListener('pointercancel',end);z.addEventListener('lostpointercapture',()=>set(null));
  z.addEventListener('contextmenu',e=>e.preventDefault());
  return z;
}
function col(...els){const c=document.createElement('div');c.className='col';c.append(...els);return c}
function padFor(){
  if(!IS_TOUCH||state!=='play')return 'none';
  if(level==='joint'||level==='texto')return 'none';
  if(level==='dance')return dance&&!dance.done?'dance':'none';
  if(level==='bike')return 'bike';
  if(level==='bj'||level==='flip')return 'none';
  if(level==='limo')return LM&&!LM.done?'limo':'none';
  if(level===3)return home&&(home.wake||home.win)?'none':'home';
  if(level==='office')return office&&(office.intro>0||office.caughtT>0)?'none':'office';
  return 'plat';
}
function buildPad(kind){
  // release anything still held before swapping buttons
  for(const c of ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyE','ShiftLeft'])padKey(c,false);
  tpL.textContent='';tpR.textContent='';touchEl.hidden=kind==='none';
  if(kind==='none')return;
  if(kind==='limo'){tpL.append(dpad());tpR.append(tbtn('VODKA','KeyE','big txt'));return}
  if(kind==='dance'){
    tpL.append(tbtn('◀','ArrowLeft','big'),tbtn('▼','ArrowDown','big'));
    tpR.append(tbtn('▲','ArrowUp','big'),tbtn('▶','ArrowRight','big'));return}
  if(kind==='bike'){
    tpL.append(dpad());
    tpR.append(col(tbtn('POUSSE','ArrowUp','sm txt'),tbtn('FREINE','ArrowDown','sm txt')),tbtn('OLLIE','Space','big'));return}
  tpL.append(col(tbtn('▼','ArrowDown','sm'),dpad()));
  const act=kind==='office'?'VOLER':kind==='home'?'VOMIR':'BIÈRE';
  tpR.append(col(tbtn(kind==='home'?'COURIR':'SPRINT','ShiftLeft','sm txt'),tbtn(act,'KeyE','txt')),tbtn('▲','Space','big'));
}
function padTick(){const k=padFor();if(k!==padLayout){padLayout=k;buildPad(k)}}
// on phones, the first tap on GO asks for full screen in landscape
function touchFull(){
  if(!IS_TOUCH)return;
  try{const el=document.getElementById('stage');if(!document.fullscreenElement&&el.requestFullscreen){const pr=el.requestFullscreen({navigationUI:'hide'});if(pr&&pr.then)pr.then(()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}).catch(()=>{})}}catch(e){}
}
// clicks on the game itself: the joint duel and the texts
cv.addEventListener('pointerdown',e=>{
  if(state==='phone'){e.preventDefault();closePhone();return}
  if(state!=='play')return;
  const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;
  if(level==='joint'){e.preventDefault();jointPuff()}
  else if(level==='texto'){e.preventDefault();textoClick(x,y)}
  else if(level==='limo'){e.preventDefault();limoDrink()}
  else if(level==='bj'){e.preventDefault();bjClick(x,y)}
  else if(level==='flip'){e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}MP.ids[e.pointerId]=x<W/2?'l':'r';MP.l=Object.values(MP.ids).includes('l');MP.r=Object.values(MP.ids).includes('r')}
});
const cvXY=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]};
const cvUp=e=>{delete MP.ids[e.pointerId];MP.l=Object.values(MP.ids).includes('l');MP.r=Object.values(MP.ids).includes('r')};
cv.addEventListener('pointerup',cvUp);cv.addEventListener('pointercancel',cvUp);
