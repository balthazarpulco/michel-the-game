# Une nuit avec Michel (La Run à Michel)

Jeu web 2D en une seule page HTML (canvas 960×540) : la soirée de Michel à Montréal, du studio jusqu'à son lit.
Platformer, mini-jeux et cinématiques. Tout le texte du jeu est en **français québécois**.

> **Chantier en cours : v2, voir `ROADMAP.md`.** Étapes 0 à 2 faites ; 3 et 4 faites pour tout ce qui ne demande pas de décision d'Alexandre (outil d'animation, hébergement, projet Supabase, tests sur vrais appareils).
> **Cible : uniquement le web.** On ne passe ni à Unity ni à Unreal.
> Les étapes sont : restructuration Vite + TypeScript → rendu PixiJS → couche de détail d'animation → mise en ligne.
> Michel reste un rig vectoriel procédural. Chaque étape doit laisser un jeu jouable, avec `smoke.py` à 0 erreur et un commit.
> Quand la structure change, mettre à jour les sections « Commandes », « Structure » et « Architecture » de ce fichier.

## Avec l'utilisateur

- **Langue :** toujours répondre **en français**. L'utilisateur est un designer québécois (motion designer et directeur artistique). Il itère vite, envoie des captures et des images, et teste en jouant.
- **Remises en question :** il veut qu'on challenge ses idées. On propose des options quand une demande est floue, mais on agit quand elle est claire.
- **Animations :** fluides, naturelles et « curvy ». Michel devient mou et maladroit à partir de 10 bières. À partir d'environ 25 bières, la tête mène et le corps suit.
- **Manette :** support complet partout, menus et appels à l'action compris. Le tactile est optimisé.
- **Contrôles affichés :** la barre de touches sous le jeu et Pause → Settings ne montrent **que les contrôles du niveau en cours**, au clavier et à la manette.
- **Textes du tuto :** les messages des personnes sont en bleu, les textes de mise en situation sont en notification.
- **Fichiers .ai :** ils arrivent corrompus s'ils sont envoyés tels quels. Il faut demander un **.zip** ou un SVG.

## Commandes

```bash
npm install                       # une fois (Node 20+)
npm run dev                       # serveur de dev Vite (http://localhost:5173), hook __g actif
npm run build                     # assets + tsc + build de prod -> dist/ (à copier sur n'importe quel hébergement statique)
npm run build:test                # build de test -> dist-test/ (hook __g)
npm run assets                    # assets/ -> public/gen/ (atlas, images, rigs, musique, animations, hashés) ; ne refait rien si assets/ n'a pas changé (--force)
python3 tools/smoke.py            # build de test + vite preview + les 12 niveaux en headless, captures dans shots/, doit finir par "errors total 0"
python3 tools/smoke.py dance bj   # seulement certains niveaux (--no-build, --url URL, --out DIR, --renderer pixi|canvas)
python3 tools/perf.py             # démarrage + fps, téléphone simulé et CPU ralenti, pour les deux rendus
npm run package:itch              # build de prod + release/une-nuit-avec-michel-itch.zip
npm run meta                      # régénère icônes + image de partage (public/meta/) depuis le key art
tools/encode-music.sh             # assets/music/*.mp3 -> .ogg (Opus) à côté
python3 tools/rig_from_ai.py      # régénère assets/rigs/hero.json depuis source/MICHEL.ai (pip install pymupdf)
```

- **Dépendances :** Node 20+ (Vite 8, TypeScript, sharp pour les atlas), Python 3.9+ avec `pip install playwright` pour smoke.py (dans le conteneur cloud, la version Python doit égaler celle du Chromium préinstallé : `pip install playwright==1.63.0`), pymupdf pour le rig.
- **Vérifier les identifiants non définis :** concaténer les fichiers de `src/game-order.json` et lancer eslint avec `no-undef` (le code tourne en mode strict : une affectation à une variable non déclarée plante).
- **Hook de debug (dev et build de test seulement) :**
  - `__g.go('office'|1|'boss'|2|'joint'|'dance'|'texto'|'limo'|'bj'|'flip'|'bike'|3)` saute à un niveau.
  - `__g.ev('code')` évalue du code dans la portée du jeu (par exemple `__g.ev('ammo=30')` pour Michel saoul).
- **smoke.py** seede `Math.random` : deux runs génèrent les mêmes rues, pratique pour comparer des captures.
- **En jeu :** `T` ouvre le mode dev (choix du niveau, invincible, +bières, bascule du rendu PixiJS / Canvas 2D), `F` passe en plein écran, `P` / `Échap` met en pause.
- **Rendu :** `?renderer=canvas` ou `?renderer=pixi` dans l'URL force le rendu (sinon localStorage `michel-renderer`, défaut pixi).
- **Mise en ligne :** voir `docs/DEPLOIEMENT.md` (Netlify / Cloudflare Pages, itch.io, Supabase).

## Structure

```
index.html            le HTML (overlays, menus, écran de chargement)
src/main.ts           point d'entrée : écran de chargement -> loadAll() + Gfx.create() -> boot()
src/boot/loader.ts    précharge atlas, images, rigs et polices (barre pondérée par la taille), découpe les frames d'atlas, choisit ogg/mp3
src/gfx/              rendu PixiJS (TypeScript) : pixi.ts (compositeur, calques, repli Canvas), effects.ts (ivresse, glow,
                      réglages TUNING), particles.ts (FX), anims.ts (séquences d'images), transition.ts (trame entre niveaux)
src/net/              supabase-board.ts : classement en ligne (si VITE_SUPABASE_* au build)
src/style.css         tout le CSS (polices Inter / Lilita One auto-hébergées dans src/fonts/)
src/game-order.json   la liste ORDONNÉE des fichiers JS du jeu (voir Architecture)
src/core/             levels.js (REGISTRE), constants, world (état, startLevel), update (platformer), loop, boot,
                      input, touch, gamepad, audio, diff, game (règles communes), minigame, util, screen, fullscreen
src/levels/           un fichier par niveau + defineLevel({...}) : office, street (1 et 2), boss, joint, dance, texto,
                      limo, bj, flip, bike, home (3)
src/render/           rig (drawRig, vecFace, vecDraw…), world (render, renderBase, renderWorld), street, actors, player, fx (grain),
                      ui-draw, juice (impacts, poussière, vibration manette, émetteurs fxRate / fxDrizzle / fxMotes)
src/rigs/motion.js    hairTick, drawSegs, heroJoints, easeAng, easeVals
src/ui/               title, video, phone, cards, pause, settings, dev, board, trophies, chapters, hud
src/data/             assets (images du loader), cast (PNJ, collègues)
assets/manifest.json  structure de l'objet ASSETS (sauf rigs) ; "@img:<chemin>" = image de assets/img/
assets/img/           sprites (-> atlas), décors, pièces, rues
assets/rigs/*.json    personnages (un fichier par rig ; un nouveau fichier est pris automatiquement)
assets/ui/*.webp      key art, logo (base + flammes), fond « mile »
assets/music/         musique : <nom>.mp3 + <nom>.ogg (Opus)
assets/anim/<nom>/    (facultatif) séquences PNG/WebP + anim.json {fps, loop, anchor, scale} -> FX.anim('<nom>', x, y)
public/               intro/outro (.mp4/.webm), meta/ (icônes, og.jpg), manifest.webmanifest, _headers ; public/gen/ est GÉNÉRÉ (pas dans git)
supabase/schema.sql   table + RLS + anti-spam du classement en ligne
docs/DEPLOIEMENT.md   mise en ligne pas à pas
source/MICHEL.ai      Illustrator de Michel, 44 calques nommés
tools/                assets.mjs, vite-legacy-game.ts (plugin), smoke.py, perf.py, package-itch.py, make-meta.mjs, encode-music.sh,
                      rig_from_ai.py, rigtools.py
```

## Ordre des niveaux

Vidéo d'intro → `office` (le studio : vole le pinot de Dulac, sors par la porte noire) → `1` (boul. Saint-Laurent, départ devant Ribotti Vintage) → `boss` (dépanneur, la blonde) → `2` (le boulevard) → `joint` (duel avec LD) → `dance` (Ginette) → `texto` (textos de la blonde) → `limo` (la limo de Delachaud, garder son verre droit) → `bj` (blackjack ; un blackjack donne du temps au flipper) → `flip` (flipper) → `bike` (skate, retour) → `3` (chez Michel, se coucher sans bruit) → vidéo d'outro → victoire.

## Architecture

- **Une seule portée, plusieurs fichiers :** les fichiers JS de `src/core|levels|render|rigs|ui|data` ne s'importent pas entre eux. Le plugin `tools/vite-legacy-game.ts` les concatène dans l'ordre de `src/game-order.json` dans une fonction `boot(ASSETS, UI)` (module `virtual:game`, avec source map). Conséquences :
  - les déclarations de fonctions peuvent vivre dans n'importe quel fichier ;
  - les `const` / `let` et le code exécuté au chargement tournent dans l'ordre de la liste (attention au TDZ) ;
  - un nouveau fichier doit être ajouté à `src/game-order.json`.
  - Le nouveau code (src/boot, src/gfx, src/net, main.ts) est en TypeScript strict ; le code du jeu reste du JS en portée partagée, à convertir module par module quand on y touche.
- **Assets :** `tools/assets.mjs` empaquette les sprites avec transparence (≤ 1024 px) en atlas WebP 2048 et copie les grandes images, tous hashés, avec `public/gen/manifest.json`. Le loader remplace chaque `"@img:…"` par l'image chargée (les frames d'atlas deviennent des canvas qui répondent à `complete` / `naturalWidth`).
- **Boucle :** `loop` (core/loop.js) appelle `update(dt)` (`dt` plafonné à 0,05), le `fxTick` du niveau, puis `render()` / `renderBase()`, puis `GFX.present()`. `frameDt` sert aux easings. `resTick` baisse ou remonte la résolution selon la vitesse des frames.
- **Rendu (étape 2) :** le jeu dessine toujours en Canvas 2D, dans deux calques. `ctx` est le calque courant : `useMain()` (le monde, canvas #c) ou `useHud()` (HUD, bannières, téléphone, toasts).
  - Avec PixiJS (`GFX` non nul), chaque calque devient une texture : le monde reçoit les filtres (`src/gfx/effects.ts` : ivresse selon `drunk()`, glow la nuit ou selon `fx.bloom` du registre), puis viennent les particules, puis l'interface (jamais filtrée), puis la transition en trame de points (`GFX.wipe()`, appelée par `startLevel`).
  - Sans WebGL, ou si Pixi tourne sous 24 fps sur l'écran titre, on revient au Canvas 2D : `GFX` vaut `null`, `FX` ne fait rien, et le jeu est identique sans les effets.
  - Tout nouveau dessin d'interface doit passer par `useHud()`.
- **Particules (`FX`) :** `FX.burst(preset, x, y, opts)`, `FX.emit`, `FX.anim(nom, x, y)`, `FX.clear()`, en coordonnées écran (960 × 540, donc `x - camX` pour le monde). Presets : spark, ember, smoke, dust, confetti, drop, flash, mote. Pour les moments forts : `juiceHit`, `juiceWin`, `juiceLand`, `rumble(fort, faible, ms)` (render/juice.js).
- **États :** `state` vaut `'title' | 'video' | 'phone' | 'play' | 'pause' | 'dev' | 'over' | 'outro'`.
- **Registre de niveaux (`src/core/levels.js`) :** chaque niveau appelle `defineLevel({...})` à la fin de son fichier. Les champs (documentés en tête de `levels.js`) couvrent nom, chapitre, mode dev, musique, heure, HUD, `start` / `update` / `draw`, cinématiques (`frozen`), décor (`scene`, `night`), touches (`keydown`), clics (`pointer`), pad tactile, pause, tuto, histoire, contrôles de Settings et barre de touches.
  - `update` / `draw` présents = mini-jeu plein écran ; absents = le platformer commun (`core/update.js`, `render/world.js`).
  - **Ajouter un niveau :** créer `src/levels/xxx.js` avec ses fonctions et son `defineLevel`, puis l'ajouter à `src/game-order.json`. L'ordre dans la nuit vient du champ `n` (le mode dev, les chapitres et les touches 1–9 suivent).
  - `LEVELS[id]`, `LEVEL_ORDER`, `lvName(l)`, `lvStage(l)`. Il reste quelques `level===` à l'intérieur du platformer commun (bornes du boss, bruit chez Michel, studio).
  - Les trophées (`TROPHIES`, ui/trophies.js) ne passent pas par le registre.
- **Tuto « téléphone » :** `openPhone()` / `closePhone()`. Les contrôles viennent de `tuto.tips`, les messages de `tuto.msgs` (bulle bleue = la personne ; préfixe `'>'` = message envoyé, vert, « VERV · envoyé »), la notification de `story`.
- **Difficulté :** `DIFFS` (facile, moyen, difficile) avec `DF = DIFFS[diff]`. Pour les mini-jeux, `mgDiff()` vaut 0,75, 1 ou 1,3.
- **Ivresse :** `ammo` est le nombre de bières. `drunk() = clamp((ammo-9)/9)`, et `d25` gère l'effet « la tête mène » vers 25 bières.
- **Manette :** `PAD_MAP` traduit les boutons en événements clavier. La navigation dans les menus est spatiale (`moveSpatial`). B fait retour, Start fait pause.
- **Classement :** `renderBoard`, par mode de difficulté. Source : Supabase si le build a ses clés (`UI.board`, src/net/supabase-board.ts), sinon la db de l'artifact claude.ai, sinon localStorage `michel-board`.
- **Chapitres :** ils se débloquent en jouant (localStorage `michel-chapters`), via `startChapter(l)`.
- **Aides des mini-jeux :** `fxBurst`, `mgParts`, `mgDrawParts`, `mgBanner`, `mgBar`, `showCard(kicker, title, text, btn, next)`, `award(id)`.
- **Style UI v2 :**
  - Polices : Lilita One pour les titres, Inter pour le texte.
  - Couleurs : prune `#2a1240`, violet `#6a2fc2` / `#8b4fe0`, rose `#ff3d9a`, jaune `#ffd23f`.
  - Trame en points via `htFill`, pastilles via `pg()`.

### Rigs vectoriels (`RIGS.*`, `drawRig` → `drawVecRig`)

- **Structure :** `{vec:1, w, h, k, body:{x,y,paths,bb}, parts:[{n, f, x, y, px, py, parent?, clip?, paths, bb}], vface?}`.
- **Calques `f` :** 0 derrière le corps, 1 devant, 2 la tête, 3 au-dessus de tout. `parent` chaîne les membres (cuisse → tibia → pied).
- **Tracés :** chaque entrée de `paths` est `[fill, tx, ty, d, stroke, width, evenodd]`. Les marqueurs `['CLIP',0,0,d]` … `['END',…]` servent de masque (pour les tatouages).
- **Cache :** `vecDraw` garde un bitmap par niveau de zoom selon `bb`. Si on modifie un rig à la main, il faut repasser `tools/rigtools.finalize_rig`.
- **Michel (`hero.json`, généré par `tools/rig_from_ai.py`) :**
  - Parties : legL/shinL/footL, legR/shinR/footR, armR, keys (le trousseau qui ballotte), armL/foreL, top (la camisole, qui passe sous le bras levé), head.
  - armL/foreL sont le bras tatoué. Ils sont en **f=3, devant le visage**, à la demande de l'utilisateur.
  - La tête est découpée en `segB` (mèches de derrière, puis tête) et `segF` (lunettes, masse des cheveux, toupets, oreille).
  - Les segments qui ont un `piv` rebondissent sur des ressorts (`hairTick` / `drawSegs`). Gains 0,009 / 0,006 / 4, raideur 150, amortissement 9, max ±0,2×amp.
  - Les yeux, les paupières, la bouche et le bout de la clope sont dessinés en direct par `vecFace`, avec `ang.ex = {mouth, brow, blink, wink, look, drunk}`. `ang.noCig` cache la clope.
  - `heroJoints()` complète automatiquement les genoux, les chevilles, le coude et le trousseau quand une scène ne pose que les hanches et l'épaule. `easeAng` et `easeVals` lissent les poses.
- **Autres personnages :**
  - Bitmap : itin1/2, vieille1/2, punk2, dog, drag, cw1–5.
  - Vectoriels : ld, dulac (son téléphone suit la main), boss (la blonde), ginette, cw6–8.
  - Delachaud est `cw8` (constante `DELACHAUD`).

## Publication

- **v1 (claude.ai) :** l'artifact `https://claude.ai/artifact/ACbvXQFR4wd5H5gCsBKsR8` (v55), un seul fichier HTML. Le code v1 est au tag git `v1-canvas` (local, pas encore poussé).
- **v2 :** `npm run build` -> `dist/`, sur n'importe quel hébergement statique (Netlify, Cloudflare Pages : `public/_headers` gère le cache), ou `npm run package:itch` pour itch.io. Pas à pas : `docs/DEPLOIEMENT.md`.

## Workflow

1. Modifier le code (ou les assets).
2. Lancer `python3 tools/smoke.py` (il fait le build de test) et `npx tsc --noEmit`.
3. Regarder les captures dans `shots/` pour tout changement visuel.
4. Faire un commit git par sous-étape, avec un message clair.
5. Montrer le résultat à l'utilisateur.
