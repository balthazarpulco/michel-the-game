// Pause -> Settings : table des contrôles (CTRL) du niveau en cours.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

const setOv=document.getElementById('setOv');
const CTRL_MOVE=[['Marcher','← → · A D','CROIX · STICK\u00a0G'],['Sauter','ESPACE · ↑','A']];
const CTRL={
  office:[...CTRL_MOVE,['Prendre l\'escalier','↓ · S','CROIX ↓'],['Voler le vin','tiens E','tiens B']],
  1:[...CTRL_MOVE,['Descendre d\'un balcon','↓ · S','CROIX ↓'],['Sprint','MAJ','RB · RT · Y'],['Lancer une bière','E','B · X']],
  boss:[...CTRL_MOVE,['Descendre de l\'étagère','↓ · S','CROIX ↓'],['Lancer une bière','E','B · X']],
  2:[...CTRL_MOVE,['Descendre d\'un auvent','↓ · S','CROIX ↓'],['Sprint','MAJ','RB · RT · Y'],['Lancer une bière','E','B · X']],
  joint:[['Tirer une puff','CLIC · ESPACE','A']],
  dance:[['Les pas','← ↓ ↑ →','CROIX']],
  texto:[['Choisir une réponse','↑ ↓','CROIX ↑ ↓'],['Répondre','1 2 3 · ESPACE','A']],
  limo:[['Pencher dans le virage','← → · A D','CROIX · STICK\u00a0G'],['Prendre un vodka-Red Bull','E · ESPACE','B · A']],
  bj:[['Choisir Tirer / Rester','← →','CROIX'],['Valider','ESPACE · E','A · B'],['Tirer · Rester direct','1 · 2','—']],
  flip:[['Palette gauche / droite','← →','CROIX'],['Les deux palettes','ESPACE','A']],
  bike:[['Changer de voie','← →','CROIX'],['Ollie','ESPACE','A'],['Pousser / freiner','↑ / ↓','CROIX ↑ ↓'],['Figure (en l\'air)','ESPACE + ←↑→↓','A + CROIX']],
  3:[['Marcher doucement','← → · A D','CROIX · STICK\u00a0G'],['Sauter','ESPACE · ↑','A'],['Courir (fait du bruit)','MAJ','RB · RT · Y'],['Vomir','E','B · X']]};
let ctrlAll=null;
function fillCtrl(){const box=document.querySelector('#setOv .ctrl'),leg=document.querySelector('#setOv .legend'),h2=document.querySelector('#setOv h2');if(!box)return;if(ctrlAll===null)ctrlAll=box.innerHTML;
  const rows=CTRL[level];if(!rows||document.getElementById('title').hidden===false){box.innerHTML=ctrlAll;h2.textContent='CONTRÔLES';if(leg)leg.style.display='';return}
  const esc=x=>x.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const k=t=>t==='—'?'—':t.split(' ').map(w=>/^[·+\/]$/.test(w)||/^[a-zé]/.test(w)?esc(w):'<kbd>'+esc(w)+'</kbd>').join(' ');
  box.innerHTML='<span class="h">ACTION</span><span class="h">CLAVIER</span><span class="h">MANETTE</span>'+[...rows,['Pause','P · ÉCHAP','START'],['Plein écran','F','—']].map(([a,b,c])=>'<span>'+esc(a)+'</span><span>'+k(b)+'</span><span>'+k(c)+'</span>').join('');
  h2.textContent='CONTRÔLES · '+(STAGE_NAME[level]||'').toUpperCase();if(leg)leg.style.display=(level===1||level===2||level==='boss')?'':'none'}
function openSettings(){document.getElementById('pauseOv').hidden=true;fillCtrl();setOv.hidden=false;setTimeout(()=>document.getElementById('setBack').focus(),30)}
function closeSettings(){setOv.hidden=true;document.getElementById('pauseOv').hidden=false;setTimeout(()=>document.getElementById('setBtn').focus(),30)}
document.getElementById('setBtn').onclick=openSettings;
document.getElementById('setBack').onclick=closeSettings;
