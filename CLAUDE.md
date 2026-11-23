# Une nuit avec Michel (La Run à Michel)

Jeu web 2D en une seule page HTML (canvas 960×540) : la soirée de Michel à Montréal, du studio jusqu'à son lit.
Platformer, mini-jeux et cinématiques. Tout le texte du jeu est en **français québécois**.

> **Chantier en cours : v2, voir `ROADMAP.md`.**
> **Cible : uniquement le web.** On ne passe ni à Unity ni à Unreal.
> Les étapes sont : restructuration Vite + TypeScript → rendu PixiJS → couche de détail d'animation → mise en ligne.
> Michel reste un rig vectoriel procédural. Chaque étape doit laisser un jeu jouable, avec `smoke.py` à 0 erreur et un commit.
> Quand la structure aura changé, mettre à jour les sections « Commandes », « Structure » et « Architecture » de ce fichier.

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
python3 tools/build.py            # src/ + assets/ + media/ -> dist/index.html (+ médias copiés dans dist/)
python3 tools/build.py --test     # + dist/test.html (polices locales, hook __g) + dist/game.js
node -e "new Function(require('fs').readFileSync('dist/game.js','utf8'))"   # check de syntaxe
python3 tools/smoke.py            # lance les 12 niveaux en headless, captures dans shots/, doit finir par "errors total 0"
python3 tools/smoke.py dance bj   # seulement certains niveaux
python3 tools/rig_from_ai.py      # régénère assets/rigs/hero.json depuis source/MICHEL.ai (pip install pymupdf)
```

- **Dépendances :** Python 3.9+, Pillow (facultatif), `pip install playwright && playwright install chromium` pour les tests, et pymupdf pour le rig.
- **Jouer en local :** ouvre `dist/index.html` dans un navigateur. Pour que la vidéo et la musique se chargent, sers plutôt le dossier : `python3 -m http.server -d dist 8000`.
- **Hook de debug dans test.html :**
  - `__g.go('office'|1|'boss'|2|'joint'|'dance'|'texto'|'limo'|'bj'|'flip'|'bike'|3)` saute à un niveau.
  - `__g.ev('code')` évalue du code dans le scope du jeu (par exemple `__g.ev('ammo=30')` pour Michel saoul).
- **En jeu :** `T` ouvre le mode dev (choix du niveau, invincible, +bières), `F` passe en plein écran, `P` / `Échap` met en pause.

## Structure

```
src/template.html     TOUT le code du jeu (HTML + CSS + JS, ~3 850 lignes). Placeholders remplis au build :
                      __ASSETS__ (JSON des assets), __KEYART__, __LOGOBASE__, __LOGOFLAME__, __LOGOSRC__, __BG__
assets/manifest.json  structure de l'objet ASSETS (sauf rigs) ; "@img:<chemin>" = image de assets/img/ inlinée en data URI
assets/img/           sprites, décors, voitures, façades, pièces (studio, dépanneur, appart), rues du skate…
assets/rigs/*.json    personnages (un fichier par rig ; un nouveau fichier est ajouté automatiquement au build)
assets/ui/*.webp      key art du titre, logo (base + flammes), fond « mile »
media/                intro.mp4/.webm, outro.mp4/.webm, music/*.mp3 (publiés À CÔTÉ de la page, pas inlinés)
source/MICHEL.ai      Illustrator de Michel, 44 calques nommés (Head, Toupet 01-03, Back Hair 01-04, Arm L, Arm Tattoo L…)
tools/                build.py, smoke.py, rig_from_ai.py, rigtools.py (bbox + compression des tracés), fnt/ (polices de test)
```

## Ordre des niveaux

Vidéo d'intro → `office` (le studio : vole le pinot de Dulac, sors par la porte noire) → `1` (boul. Saint-Laurent, départ devant Ribotti Vintage) → `boss` (dépanneur, la blonde) → `2` (le boulevard) → `joint` (duel avec LD) → `dance` (Ginette) → `texto` (textos de la blonde) → `limo` (la limo de Delachaud, garder son verre droit) → `bj` (blackjack ; un blackjack donne du temps au flipper) → `flip` (flipper) → `bike` (skate, retour) → `3` (chez Michel, se coucher sans bruit) → vidéo d'outro → victoire.

## Architecture (src/template.html)

- **Boucle :** `loop` appelle `update(dt)` (dispatch par `level`, `dt` plafonné à 0,05), puis `render()` / `renderBase()`. `frameDt` sert aux easings.
- **États :** `state` vaut `'title' | 'video' | 'phone' | 'play' | 'pause' | 'dev' | 'over' | 'outro'`.
- **Tuto « téléphone » :** `openPhone()` / `closePhone()`.
  - Les contrôles viennent de `TUTO[level].tips`.
  - Les messages viennent de `TUTO[level].msgs` : une bulle bleue vient de la personne, un message préfixé `'>'` s'affiche comme envoyé (vert, « VERV · envoyé »).
  - La notification reprend `LV_STORY[level]`.
- **Ajouter ou retirer un niveau** demande de toucher tous ces endroits (le registre de niveaux de l'étape 1 de la roadmap doit régler ça) :
  - `LV_TRACK`, `STAGE_NAME`, `LV_NAME`, `DEV_LV` et les boutons HTML `#dev .devgrid`, plus la map de titres dans `devGo`.
  - `hourAt`, le libellé du hud, `startLevel`, `update`, `renderBase`.
  - La chaîne keydown, les handlers pointer de `cv`, `padFor` / `buildPad`.
  - `TUTO`, `LV_STORY`, `TROPHIES`, `CHAPTERS`, `CTRL` (la table de Pause → Settings), et `KO` dans `updateKeys` (la barre sous le jeu).
- **Difficulté :** `DIFFS` (facile, moyen, difficile) avec `DF = DIFFS[diff]`. Pour les mini-jeux, `mgDiff()` vaut 0,75, 1 ou 1,3.
- **Ivresse :** `ammo` est le nombre de bières. `drunk() = clamp((ammo-9)/9)`, et `d25` gère l'effet « la tête mène » vers 25 bières.
- **Manette :** `PAD_MAP` traduit les boutons en événements clavier. La navigation dans les menus est spatiale (`moveSpatial`). B fait retour, Start fait pause.
- **Classement :** `renderBoard`, par mode de difficulté. Il passe par la db de l'artifact (`window.claude.use('db')`), avec un repli sur localStorage `michel-board`. Hors claude.ai, seul le repli local fonctionne. Pour la v2, la piste prévue est Supabase (voir `ROADMAP.md`, étape 4).
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

- **v1 (claude.ai) :** l'artifact `https://claude.ai/artifact/ACbvXQFR4wd5H5gCsBKsR8` (v55). On y publie `dist/index.html`, plus les médias à côté avec les mêmes chemins.
- **v2 :** itch.io et/ou le site de l'utilisateur, sur un hébergement statique (voir `ROADMAP.md`, étape 4).

## Workflow

1. Modifier le code (ou les assets).
2. Lancer le build, puis le check de syntaxe, puis `python3 tools/smoke.py`.
3. Regarder les captures dans `shots/` pour tout changement visuel.
4. Faire un commit git par sous-étape, avec un message clair.
5. Montrer le résultat à l'utilisateur.
