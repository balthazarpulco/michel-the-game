// Son : musique par groupe de niveaux (piste choisie par le registre de niveaux, fondus), bips et effets synthétisés, bouton muet.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// ---------- audio ----------
let actx=null,muted=false;
try{muted=localStorage.getItem('gerald-mute')==='1'}catch(e){}
const muteBtn=document.getElementById('mute');
// ---------- music: one track per group of levels, cross-faded ----------
const MUSIC={intro:'intro.mp3',a:'1-2-3.mp3',b:'4.mp3',c:'5-6.mp3',d:'7-8.mp3',e:'9.mp3'};
const tracks={};let curTrack=null;const MUSIC_VOL=.5;
function trk(k){if(!tracks[k]){const a=new Audio(UI.music[MUSIC[k]]||('music/'+MUSIC[k]));a.loop=true;a.preload='auto';a.volume=0;tracks[k]=a}return tracks[k]}
function playTrack(k){
  if(!k)return;
  const a=trk(k);
  if(curTrack!==k){curTrack=k;}
  if(a.paused){const p=a.play();if(p&&p.catch)p.catch(()=>{})}
}
function musicTick(dt){
  for(const k in tracks){
    const a=tracks[k],on=k===curTrack&&!muted&&state!=='video'&&state!=='outro';
    const tgt=on?(state==='pause'||state==='over'?MUSIC_VOL*.35:state==='phone'?MUSIC_VOL*.7:MUSIC_VOL):0;
    const v=a.volume+clamp(tgt-a.volume,-dt*.9,dt*.9);a.volume=clamp(v,0,1);
    if(!on&&a.volume<=.001&&!a.paused)a.pause();
    if(on&&a.paused){const p=a.play();if(p&&p.catch)p.catch(()=>{})}
  }
}
// browsers only start sound after a gesture: the title music begins on the first key or click
function kickMusic(){if(!curTrack&&!document.getElementById('title').hidden)curTrack='intro';if(curTrack)playTrack(curTrack)}
addEventListener('pointerdown',kickMusic,{passive:true});addEventListener('keydown',kickMusic);
function syncMute(){muteBtn.innerHTML=muted?'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>':'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';muteBtn.setAttribute('aria-label',muted?'Son coupé':'Son')}
syncMute();
muteBtn.onclick=()=>{muted=!muted;syncMute();try{localStorage.setItem('gerald-mute',muted?'1':'0')}catch(e){};muteBtn.blur()};
function beep(f1,f2,dur,type='square',vol=.08){
  if(muted)return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime;
    o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur);
  }catch(e){}
}
const sfx={
  jump:()=>beep(300,620,.14,'square',.05),
  cig:()=>{beep(880,1320,.08,'triangle',.08)},
  beer:()=>{beep(520,1040,.1,'triangle',.09);setTimeout(()=>beep(780,1560,.1,'triangle',.07),70)},
  hurt:()=>beep(220,60,.35,'sawtooth',.09),
  throw:()=>beep(420,180,.12,'triangle',.07),
  ko:()=>{beep(300,900,.12,'square',.07);setTimeout(()=>beep(900,300,.15,'square',.05),90)},
  glass:()=>beep(2400,1200,.08,'triangle',.05),
  boss:()=>beep(160,90,.25,'sawtooth',.08),
  resto:()=>{beep(660,330,.2,'square',.07);setTimeout(()=>beep(440,220,.3,'square',.07),180)},
};
