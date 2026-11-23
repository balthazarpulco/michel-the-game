// Personnages de la rue (CAST), collègues (COLL) et Delachaud.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)

// Street characters: display height, walking speed, stride, and what they say when Michel gets close
const CAST={
  itin1:{hurt:'LE GARS T\'A PRIS TON CHANGE',h:94,spd:[28,50],stride:.28,step:.09,say:['T\'as-tu 2 piasses?','Hey l\'ami, une clope?','Juste pour un café…','T\'aurais pas du change?']},
  itin2:{hurt:'IL T\'A RENVERSÉ SON CAFÉ DESSUS',h:96,spd:[24,44],stride:.26,step:.085,say:['Belle soirée, hein?','Une p\'tite clope, mon chum?','J\'ai faim, toé?','Tasse-toi pas, j\'te mords pas.']},
  vieille1:{hurt:'ÉCRASÉ PAR UN CHARIOT À COMMISSIONS',h:88,spd:[18,30],stride:.22,step:.13,say:['Éteins-moi ça, jeune homme!','Il va mouiller, mon garçon.','Ça sent la boucane!','Tassez-vous, j\'ai mes commissions!']},
  vieille2:{hurt:'UN COUP DE SAC D\'ÉPICERIE',h:88,spd:[16,28],stride:.24,step:.13,say:['Dans mon temps on fumait dehors!','T\'as pas froid, toi?','Voyou!','Mes oranges vont s\'écraser!']},
  punk2:{hurt:'LE PUNK T\'A FAIT UN COUP DE TÊTE',h:92,spd:[28,48],stride:.3,step:.1,say:['Un p\'tit don?','Peace, man.','T\'as-tu du feu?','Anarchie pis amour.']},
  drag:{hurt:'UN COUP DE TALON AIGUILLE',h:106,spd:[30,50],stride:.32,step:.1,say:['Bonsoir, mon chou!','Tasse-toi, darling!','Pas sur mes talons!','Fifi, on s\'en va au show!']},
};
// Michel's coworkers: they wait in front of the bars, then show up on Ginette's dance floor
const COLL={
  cw1:{say:['Michel! Une dernière!','On est juste en face, viens!','J\'paye la première!'],arms:['armL']},
  cw2:{say:['Hey Mich! C\'est ma tournée!','Une p\'tite, pour la route?','Michel! Par ici!'],arms:['armL','armR']},
  cw3:{say:['Reste donc un peu!','On t\'a gardé une place!','T\'es pas déjà parti?'],arms:[]},
  cw4:{say:['Une p\'tite IPA, Michel?','Le 5 à 7 vient de commencer.','Assis-toi deux minutes.'],arms:[]},
  cw5:{say:['MICHEL! Viens t\'asseoir!','Ha! Tu te sauves?','Juste UNE bière!'],arms:['armL']},
  cw6:{say:['Michel! T\'as l\'air d\'avoir soif.','Une p\'tite pinte avec nous?','On t\'a commandé un pichet!'],arms:['armL','armR']},
  cw7:{say:['MICHEEEL! Viens danser!','Pas déjà parti, voyons!','Une shot pis tu t\'en vas!'],arms:['armL','armR']},
  cw8:{say:['Yo Mich. Une bière?','Reste donc, c\'est vendredi.','J\'te paye une Labatt.'],arms:['armL','armR']},
};
let collBag=[];
function nextColl(){if(!collBag.length)collBag=Object.keys(COLL).filter(k=>k!==DELACHAUD).sort(()=>Math.random()-.5);return collBag.pop()}

const DELACHAUD='cw8';
