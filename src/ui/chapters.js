// Chapitres débloqués en jouant.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

trophyUI();
document.getElementById('showChap').onclick=()=>{chapterUI();document.getElementById('chapOv').hidden=false;setTimeout(()=>{const b=document.querySelector('#chapGrid button:not(:disabled)');b&&b.focus()},30)};
document.getElementById('closeChap').onclick=()=>{document.getElementById('chapOv').hidden=true;document.getElementById('showChap').focus()};

// ---------------- chapters (unlocked by playing) ----------------
const CHAPTERS=[['office','Le studio'],[1,'Boul. Saint-Laurent'],['boss','Ta blonde'],[2,'Le boulevard'],['joint','Duel avec LD'],['dance','Ginette'],['texto','Les textos'],['limo','La limo'],['bj','Blackjack'],['flip','Le flipper'],['bike','En skate'],[3,'Chez Michel']];
let chapOpen={};try{chapOpen=JSON.parse(localStorage.getItem('michel-chapters')||'{}')||{}}catch(e){}
chapOpen.office=1;
function unlockChapter(l){if(run&&run.dev)return;if(!chapOpen[l]){chapOpen[l]=1;try{localStorage.setItem('michel-chapters',JSON.stringify(chapOpen))}catch(e){}}}
function chapterUI(){const g=document.getElementById('chapGrid');g.textContent='';CHAPTERS.forEach(([l,n],i)=>{const b=document.createElement('button');b.type='button';b.className='ghost';const on=!!chapOpen[l];b.disabled=!on;b.textContent=(i+1)+' · '+(on?n:'🔒 ???');b.onclick=()=>startChapter(l);g.appendChild(b)})}
function startChapter(l){
  ['chapOv','title','over'].forEach(id=>document.getElementById(id).hidden=true);
  newGame();run.cont=true;banner=null;touchFull();
  startLevel(l);state='play';
  openPhone({kicker:'CHAPITRE '+(CHAPTERS.findIndex(c=>c[0]===l)+1),title:LV_NAME[l]||'',text:'',btn:'JOUER'});
}
