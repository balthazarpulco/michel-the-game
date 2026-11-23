// Difficulté : DIFFS, setDiff, mgDiff (mini-jeux).
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// difficulty: every knob that changes between modes lives here
const DIFFS={
  easy:  {name:'FACILE',note:'5 vies · ennemis lents · danse plus lente',lives:5,cont:3,inv:2.2,bumSpd:.7,bumP:-.18,bossHp:8,bossAtk:1.45,dl:1.6,warn:1.5,joint:.78,qtime:11,uber:.7,skGap:1.35,noise:.65,dRate:.8,dWin:.27,dMiss:.06,dPass:.5,dSlow:true},
  medium:{name:'MEDIUM',note:'3 vies · la vraie nuit à Michel',lives:3,cont:2,inv:1.6,bumSpd:1,bumP:0,bossHp:12,bossAtk:1,dl:1,warn:1,joint:1,qtime:8,uber:1,skGap:1,noise:1,dRate:.88,dWin:.22,dMiss:.09,dPass:.6},
  hard:  {name:'HARD',note:'2 vies · ça va vite · pas de pitié',lives:2,cont:1,inv:1.15,bumSpd:1.35,bumP:.18,bossHp:16,bossAtk:.72,dl:.65,warn:.6,joint:1.22,qtime:6,uber:1.3,skGap:.72,noise:1.4,dRate:.95,dWin:.17,dMiss:.12,dPass:.7},
};
let diff='medium';try{const d=localStorage.getItem('michel-diff');if(DIFFS[d])diff=d}catch(e){}
let DF=DIFFS[diff];
function setDiff(d){
  if(!DIFFS[d])return;diff=d;DF=DIFFS[d];try{localStorage.setItem('michel-diff',d)}catch(e){}
  document.querySelectorAll('#diffRow button').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.d===d)));
  document.getElementById('diffNote').textContent=DF.note;
  if(LEVELS.texto&&LEVELS.dance){LEVELS.texto.tuto.tips[2][0]=DF.qtime+' S';LEVELS.dance.tuto.tips[1][0]=Math.round(DF.dPass*100)+' %'}
  const cb=document.getElementById('contBtn');if(cb)cb.textContent='REPRENDRE · '+DF.cont+(DF.cont>1?' VIES':' VIE');
}
document.querySelectorAll('#diffRow button').forEach(b=>b.onclick=()=>{setDiff(b.dataset.d);beep(660,880,.06,'triangle',.04)});
function mgDiff(){return diff==='easy'?.75:diff==='hard'?1.3:1}
