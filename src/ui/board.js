// Classement : db de l'artifact si dispo, sinon localStorage ; saisie du nom.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- leaderboard: shared when the page's database is available, this browser's otherwise ----------
let lbDb=null,lbShared=[],lbLocal=[],lbMine=null,lbLast=null;
try{lbLocal=JSON.parse(localStorage.getItem('michel-board')||'[]')}catch(e){lbLocal=[]}
function cleanName(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9ÀÂÉÈÊËÎÏÔÛÙÇ]/g,'').slice(0,6)}
function boardRows(){
  const src=lbDb?lbShared:lbLocal;
  return src.filter(r=>r&&typeof r.score==='number'&&r.name&&(DIFFS[r.mode]?r.mode:'medium')===boardTab).sort((a,b)=>b.score-a.score).slice(0,10);
}
let boardTab=null;var diffReady=false;
function renderBoard(){
  if(!diffReady)return;
  if(!boardTab)boardTab=diff;
  document.querySelectorAll('[data-tabs]').forEach(tb=>{
    if(!tb.children.length)for(const k of Object.keys(DIFFS)){const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.dataset.m=k;b.textContent=DIFFS[k].name;b.onclick=()=>{boardTab=k;renderBoard()};tb.appendChild(b)}
    tb.setAttribute('role','tablist');for(const b of tb.children)b.setAttribute('aria-selected',String(b.dataset.m===boardTab));
  });
  const rows=boardRows();
  for(const [lid,nid] of [['boardList','boardNote'],['boardList2','boardNote2']]){
    const ol=document.getElementById(lid);ol.textContent='';
    if(!rows.length){const li=document.createElement('li');li.className='empty';li.textContent='Aucun score en '+DIFFS[boardTab].name+' encore. Sois le premier.';ol.appendChild(li)}
    rows.forEach((r,i)=>{
      const li=document.createElement('li');if(lbMine&&r.id===lbMine)li.className='me';
      const rk=document.createElement('span');rk.className='rk';rk.textContent=(i+1)+'.';
      const nm=document.createElement('span');nm.className='nm';nm.textContent=cleanName(r.name)||'?';
      const st=document.createElement('small');st.textContent=r.win?'Bonne nuit':lvStage(r.stage);nm.appendChild(st);
      const sc=document.createElement('span');sc.className='sc';sc.textContent=Math.round(r.score).toLocaleString('fr-CA');
      li.append(rk,nm,sc);ol.appendChild(li);
    });
    document.getElementById(nid).textContent=lbDb?'Classement partagé entre tous les joueurs de cette page.':'Classement de ce navigateur.';
  }
}
(async()=>{
  try{
    // online board: Supabase when the build has its keys (src/net/supabase-board.ts), else the claude.ai page db
    const db=UI.board||(window.claude&&window.claude.use?await window.claude.use('db'):null);
    if(!db)return;
    lbDb=db;renderBoard();
    db.collection('scores').orderBy('score','desc').limit(150).onSnapshot(snap=>{
      lbShared=snap.docs.map(d=>({id:d.id,...d.data()}));renderBoard();
    },()=>{lbDb=null;renderBoard()});
  }catch(e){lbDb=null}
})();
renderBoard();
const nameIn=document.getElementById('nameIn'),nameBtn=document.getElementById('nameBtn');
try{nameIn.value=localStorage.getItem('michel-name')||''}catch(e){}
nameIn.addEventListener('input',()=>{const c=cleanName(nameIn.value);if(c!==nameIn.value)nameIn.value=c});
document.getElementById('nameForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const name=cleanName(nameIn.value);
  if(!name){nameIn.focus();return}
  if(!lbLast||lbLast.saved)return;
  lbLast.saved=true;nameBtn.disabled=true;nameIn.disabled=true;nameBtn.textContent='…';
  const row={name,score:lbLast.score,stage:lbLast.stage,win:lbLast.win,mode:diff,at:Date.now()};
  try{localStorage.setItem('michel-name',name)}catch(e){}
  const id='l'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  lbLocal.push({id,...row});lbLocal.sort((a,b)=>b.score-a.score);lbLocal=lbLocal.slice(0,90);
  try{localStorage.setItem('michel-board',JSON.stringify(lbLocal))}catch(e){}
  lbMine=id;
  if(lbDb){
    try{const ref=lbDb.collection('scores').doc();lbMine=ref.id;await ref.set(row)}
    catch(err){lbMine=id;lbDb=null;document.getElementById('boardNote').textContent='Score gardé dans ce navigateur (le classement partagé refuse ton accès).'}
  }
  nameBtn.textContent='ENREGISTRÉ';renderBoard();
  document.getElementById('again').focus();
});
function openEntry(score,stage,win){
  boardTab=diff;
  lbLast={score,stage,win,saved:false};lbMine=null;
  const show=score>0;
  document.getElementById('nameForm').hidden=!show;
  nameBtn.disabled=false;nameIn.disabled=false;nameBtn.textContent='ENREGISTRER';
  renderBoard();
  return show;
}
document.getElementById('showBoard').onclick=()=>{boardTab=diff;renderBoard();document.getElementById('boardOv').hidden=false;document.getElementById('closeBoard').focus()};
document.getElementById('closeBoard').onclick=()=>{document.getElementById('boardOv').hidden=true;document.getElementById('start').focus()};
