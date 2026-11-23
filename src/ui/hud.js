// HUD : score, vies, bières, heure.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

function hud(n){
  ctx.save();
  // panel
  ctx.fillStyle='rgba(32,13,56,.82)';pg(12,12,300,50);ctx.fill();htFill();
  ctx.textBaseline='middle';ctx.textAlign='left';
  ctx.font='26px "Lilita One", Inter, Arial';ctx.fillStyle='#ffbf47';ctx.fillText(String(score).padStart(5,'0'),26,37);
  // lives as hearts
  if(lives<=5){for(let i=0;i<Math.max(3,lives);i++)heart(150+i*24,28,i<lives)}
  else{heart(150,28,true);ctx.font='16px "Lilita One", Inter, Arial';ctx.fillStyle='#ff9ad5';ctx.textAlign='left';ctx.fillText('× '+lives,164,30)}
  ctx.font='600 13px Inter, Arial';ctx.fillStyle='#f4e7c8';
  ctx.fillText(`${cigs} clopes`,150,48);
  {const dk=drunk(),lv=DRUNK.find(l=>dk<l[0]);
   ctx.fillStyle='rgba(32,13,56,.72)';pg(12,68,180,22);ctx.fill();
   ctx.fillStyle='rgba(255,255,255,.12)';pg(96,75,86,8);ctx.fill();
   ctx.fillStyle=lv[2];pg(96,75,Math.max(4,86*dk),8);ctx.fill();
   ctx.font='900 11px Inter, Arial';ctx.textAlign='left';ctx.fillText(soberT>0?'SOBRE · '+Math.ceil(soberT-1)+' S':lv[1],24,79);
   ctx.font='600 13px Inter, Arial';ctx.fillStyle='#f4e7c8'}
  ctx.save();ctx.translate(234,42);ctx.scale(.62,.62);bottleShape();ctx.restore();
  ctx.font='16px "Lilita One", Inter, Arial';ctx.fillStyle=ammo>0?'#ffbf47':'#ff9a9a';ctx.textAlign='left';ctx.fillText('× '+ammo,248,40);
  // clock / place
  const hr=hourAt(camX+400),hh=Math.floor(hr),mm=Math.floor((hr-hh)*60/5)*5;
  ctx.fillStyle='rgba(32,13,56,.82)';pg(W-198,12,124,50);ctx.fill();htFill();
  ctx.textAlign='center';ctx.font='18px "Lilita One", Inter, Arial';ctx.fillStyle=n>.5?'#9b8cff':'#ffbf47';
  ctx.fillText(`${String(hh).padStart(2,'0')}h${String(mm).padStart(2,'0')}`,W-136,30);
  const left=level===3?Math.max(0,Math.floor((LEN[3]-player.x)/10)):goal?Math.max(0,Math.floor((goal.x-player.x)/10)):Math.max(0,Math.floor((LEN[level]+500-player.x)/10));
  ctx.font='600 10px Inter, Arial';ctx.fillStyle='#f4e7c8';
  ctx.fillText(level==='limo'?'En limousine':level==='bj'||level==='flip'?'Au Casino':level==='office'?'Au studio':level==='joint'?'Fond du bar':level==='texto'?'Devant le bar':level==='boss'?'Au dépanneur':level==='dance'?'Piste de danse':level==='bike'?`Chez Michel : ${Math.max(0,Math.round(BIKE_LEN-(bike?bike.z:0)))} m`:level===3?`Ton lit : ${left} m`:level===1?`Dépanneur : ${left} m`:`Chez Ginette : ${left} m`,W-136,49);
  if(level===3&&home){
    const bw=280,bx=W/2-bw/2;
    ctx.fillStyle='rgba(32,13,56,.85)';pg(bx-14,12,bw+28,50);ctx.fill();
    ctx.textAlign='left';ctx.font='900 13px Inter, Arial';ctx.fillStyle='#9fe3ff';ctx.fillText(home.wake?'TA BLONDE EST RÉVEILLÉE':'TA BLONDE DORT… Z z z',bx,28);
    ctx.textAlign='right';ctx.font='600 12px Inter, Arial';ctx.fillStyle='#f4e7c8';ctx.fillText('bruit',bx+bw,28);
    ctx.fillStyle='#3a2a34';pg(bx,38,bw,13,6);ctx.fill();
    ctx.fillStyle=home.noise>.7?'#ff5d8f':home.noise>.4?'#ffd166':'#9fe3ff';pg(bx,38,Math.max(0,bw*Math.min(1,home.noise)),13,6);ctx.fill();
    ctx.strokeStyle=INK;pg(bx,38,bw,13,6);ctx.stroke();
  }
  if(boss){
    const bw=280,bx=W/2-bw/2;
    ctx.fillStyle='rgba(32,13,56,.8)';pg(bx-14,12,bw+28,50);ctx.fill();
    ctx.textAlign='left';ctx.font='900 13px Inter, Arial';ctx.fillStyle='#ff5d8f';ctx.fillText('LA BLONDE',bx,28);
    ctx.fillStyle='#3a2a34';pg(bx,38,bw,13,6);ctx.fill();
    ctx.fillStyle=boss.hp<=4?'#ff5d8f':'#ffbf47';pg(bx,38,Math.max(0,bw*boss.hp/boss.max),13,6);ctx.fill();
    ctx.strokeStyle=INK;ctx.lineWidth=2;pg(bx,38,bw,13,6);ctx.stroke();
  }
  ctx.restore();
}
function heart(x,y,full){
  ctx.save();ctx.translate(x,y);ctx.beginPath();
  ctx.moveTo(0,6);ctx.bezierCurveTo(-12,-2,-8,-12,0,-5);ctx.bezierCurveTo(8,-12,12,-2,0,6);
  ctx.fillStyle=full?'#ff5d8f':'rgba(255,255,255,.12)';ctx.fill();ctx.strokeStyle=full?'#2a1a16':'rgba(244,231,200,.4)';ctx.lineWidth=2;ctx.stroke();ctx.restore();
}
