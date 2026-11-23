// Images et rigs venus du loader (ASSETS) : fonds, façades, immeubles, déco, voitures, téléphone, canette.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// images arrive already loaded from the loader (src/boot/loader.ts); a plain URL string still works
const mkImg=src=>{if(typeof src!=='string')return src;const i=new Image();i.src=src;return i};
const BGS={};for(const k in ASSETS.bgs)BGS[k]=mkImg(ASSETS.bgs[k]);BGS.mile=mkImg(UI.bg);
const FAC=ASSETS.fac;for(const k in FAC)FAC[k].im=mkImg(FAC[k].img);
const BLD=ASSETS.bld;for(const k in BLD){BLD[k].im=mkImg(BLD[k].img);FAC['b_'+k]={im:BLD[k].im}}
const DECO=ASSETS.deco;for(const k in DECO)DECO[k].im=mkImg(DECO[k].img);
const CARS=ASSETS.cars;for(const k in CARS){CARS[k].im=mkImg(CARS[k].img);for(const w of CARS[k].wheels)w.im=mkImg(w.img)}
const imgs={bg:BGS.mile};
const RIGS=ASSETS.rigs;
const HERO_CIG=RIGS.hero.vface&&RIGS.hero.vface.cigTip?{x:RIGS.hero.vface.cigTip[0],y:RIGS.hero.vface.cigTip[1]}:{x:.64,y:.522};
const PHONE=ASSETS.phone;PHONE.im=mkImg(PHONE.img);
const CAN=ASSETS.can;CAN.im=mkImg(CAN.img);
const TOILET=ASSETS.toilet;TOILET.im=mkImg(TOILET.img);
