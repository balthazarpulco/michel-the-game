// Pause -> Settings : table des contrôles du niveau en cours (champ ctrl du registre).
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

const setOv=document.getElementById('setOv');
const CTRL_MOVE=[['Marcher','← → · A D','CROIX · STICK\u00a0G'],['Sauter','ESPACE · ↑','A']];
let ctrlAll=null;
function fillCtrl(){const box=document.querySelector('#setOv .ctrl'),leg=document.querySelector('#setOv .legend'),h2=document.querySelector('#setOv h2');if(!box)return;if(ctrlAll===null)ctrlAll=box.innerHTML;
  const rows=LEVELS[level]&&LEVELS[level].ctrl;if(!rows||document.getElementById('title').hidden===false){box.innerHTML=ctrlAll;h2.textContent='CONTRÔLES';if(leg)leg.style.display='';return}
  const esc=x=>x.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const k=t=>t==='—'?'—':t.split(' ').map(w=>/^[·+\/]$/.test(w)||/^[a-zé]/.test(w)?esc(w):'<kbd>'+esc(w)+'</kbd>').join(' ');
  box.innerHTML='<span class="h">ACTION</span><span class="h">CLAVIER</span><span class="h">MANETTE</span>'+[...rows,['Pause','P · ÉCHAP','START'],['Plein écran','F','—']].map(([a,b,c])=>'<span>'+esc(a)+'</span><span>'+k(b)+'</span><span>'+k(c)+'</span>').join('');
  h2.textContent='CONTRÔLES · '+lvStage(level).toUpperCase();if(leg)leg.style.display=LEVELS[level]&&LEVELS[level].legend?'':'none'}
function openSettings(){document.getElementById('pauseOv').hidden=true;fillCtrl();setOv.hidden=false;setTimeout(()=>document.getElementById('setBack').focus(),30)}
function closeSettings(){setOv.hidden=true;document.getElementById('pauseOv').hidden=false;setTimeout(()=>document.getElementById('setBtn').focus(),30)}
document.getElementById('setBtn').onclick=openSettings;
document.getElementById('setBack').onclick=closeSettings;
