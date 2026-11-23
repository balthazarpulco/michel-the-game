// Constantes du monde : taille du canvas, sol, physique de Michel, contexte 2D.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

const W=960,H=540,GROUND=452,FG=1.5,BGP=0.25;
const G=2300,JUMP=880,SPEED=290,SPRINT=420;
const INK='#2a1a16';
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const stage=document.getElementById('stage');
