// Cartes plein écran (showCard).
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

let cardNext=null;
// Level transitions: start the next level frozen behind a phone that shows the story and the controls
function showCard(kicker,title,text,btn,next){
  keys.l=keys.r=keys.j=keys.d=keys.s=keys.t=false;jumpBuf=0;throwReq=false;
  if(next)next();
  openPhone({kicker,title:title.replace(/<br>/g,' · '),text,btn});
}
document.getElementById('cardBtn').onclick=()=>{document.getElementById('card').hidden=true;keys.l=keys.r=keys.j=keys.t=false;jumpBuf=0;throwReq=false;const f=cardNext;cardNext=null;f&&f()};
