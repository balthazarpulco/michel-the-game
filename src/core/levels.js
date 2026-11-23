// Registre des niveaux : chaque fichier de levels/ décrit son niveau avec defineLevel({...}).
// Ajouter un niveau = un fichier dans levels/ + sa ligne dans src/game-order.json.
// (Code partagé : tous les fichiers listés dans src/game-order.json forment une seule portée.)
//
// Champs (id, n, name, start et tuto sont obligatoires) :
//   id          valeur de `level` (1, 2, 3 ou un nom)              n         place dans la nuit (1 = premier)
//   name        titre sur le téléphone (« TA BLONDE »)             stage     nom court (classement, game over, settings)
//   chapter     libellé dans Chapitres                              dev       libellé dans le mode dev (T)
//   devTitle    titre du téléphone en mode dev                      track     musique (clé de MUSIC dans core/audio.js)
//   hour(x)     heure affichée (x = position de la caméra)          place(left) texte du HUD sous l'heure (left = mètres restants)
//   start()     prépare le niveau, après la remise à zéro commune de startLevel
//   update(dt)  toute la logique d'une frame (mini-jeux) ; sans update, c'est le platformer commun (core/update.js)
//   frozen(dt)  platformer : renvoie true quand une cinématique remplace la frame (intro, réveil, fin)
//   draw()      tout l'écran (mini-jeux) ; sans draw, c'est renderWorld (render/world.js)
//   scene()     platformer : le décor (sinon la rue)              night     platformer : obscurité fixe (sinon selon l'heure)
//   keydown(e)  touches propres au niveau en jeu, renvoie true si la touche est prise
//   pointer(e,x,y) clic / tap sur le canvas en jeu                 pad()     pad tactile : 'plat' (défaut), 'none', 'bike'…
//   keys        barre de touches sous le jeu (sinon les tips du tuto)
//   legend      affiche le barème des points dans Pause → Settings
//   tuto        {from, av, msgs, tips} : le téléphone avant le niveau (msgs bleus ; '>' = message envoyé par VERV)
//   story       le texte de la notification                         ctrl      lignes de Pause → Settings [action, clavier, manette]
//   afterPhone() quand le téléphone se ferme et que le niveau démarre
//   canPause()  renvoie false quand la pause est interdite (défaut : permise)
//   touchLabels libellés tactiles propres au niveau ({ESPACE:'OLLIE'})
//   fx          effets du rendu PixiJS : {bloom: 0..1} (src/gfx/effects.ts) 
//   fxTick(dt)  émetteurs de particules du niveau, à chaque frame en jeu (FX.burst / FX.emit, src/gfx/particles.ts)
let LEVEL_ORDER=[];
const LEVELS={};
function defineLevel(def){LEVELS[def.id]=def;LEVEL_ORDER=Object.values(LEVELS).sort((a,b)=>a.n-b.n).map(d=>d.id)}
function lvName(l){const d=LEVELS[l];return d&&d.name||''}
function lvStage(l){const d=LEVELS[l];return d&&d.stage||''}
