// Démarrage : bouton JOUER, état initial, lancement de la boucle.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

function start(){
  touchFull();
  newGame();banner=null;
  document.getElementById('title').hidden=true;document.getElementById('over').hidden=true;
  playIntro();
  stage.focus?.();cv.focus?.();
}
document.getElementById('start').onclick=start;
document.getElementById('again').onclick=start;
document.getElementById('contBtn').onclick=continueLevel;
setDiff(diff);diffReady=true;renderBoard();
buildDevGrid();
score=0;cigs=0;beers=0;lives=3;ammo=3;koCount=0;startLevel(1);
// title screen: no enemies near spawn so the attract mode is calm
enemies=[];
(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{});
requestAnimationFrame(loop);
