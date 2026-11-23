# Handoff — « Une nuit avec Michel » (La Run à Michel)

Dernière mise à jour : 15 octobre 2026. Version publiée : **v55**.

## 1. Le projet en bref

- **Ce que c'est :** un jeu web (une seule page HTML, canvas 960×540) qui raconte une soirée de Michel à Montréal, du studio jusqu'à son lit. Platformer, mini-jeux et cinématiques.
- **Où il est publié :** artifact claude.ai `https://claude.ai/artifact/ACbvXQFR4wd5H5gCsBKsR8`. Il faut toujours republier à cette URL.
- **Fichiers publiés à côté de la page :** `intro.mp4/.webm`, `outro.mp4/.webm` et `music/{1-2-3,4,5-6,7-8,9,intro}.mp3`. Ils sont déjà en ligne : on ne republie que la page, sauf si un média change.
- **Capacité de l'artifact :** `db`, pour le classement partagé (via `window.claude.use('db')`, avec un repli sur localStorage). Pas besoin de la repasser au republish.
- **Utilisateur :** Québécois. Toujours lui répondre **en français**, avec un ton familier et québécois dans les textes du jeu. Il itère vite et teste beaucoup.

## 2. Ordre des niveaux (actuel)

Vidéo d'intro → **office** (le studio : vole le pinot de Dulac, sors par la porte noire) → **1** (boul. Saint-Laurent, départ devant Ribotti Vintage) → **boss** (dépanneur, la blonde) → **2** (le boulevard) → **joint** (duel avec LD) → **dance** (Ginette) → **texto** (textos de la blonde) → **limo** (la limo de Delachaud, garder son verre droit) → **bj** (blackjack, une main) → **flip** (flipper ; le blackjack donne du temps bonus) → **bike** (skate, retour) → **3** (chez Michel, se coucher sans bruit) → vidéo d'outro → victoire.

- Le premier mini-jeu (Paper Toss, puis « Fuir les réunions », puis un essai style WarioWare) a été **supprimé** à la demande de l'utilisateur. Le jeu commence au studio.
- Le code des deux dernières versions est gardé dans `archive/` (`meet.js` et `ww.js`, avec 8 micro-jeux de bureau), au cas où.

## 3. Contenu du dossier

```
michel-game/
  HANDOFF.md
  game/                      ← dossier de travail (cwd pour le build)
    template.html            ← SOURCE du jeu (tout le JS/CSS ; placeholders __ASSETS__, __BG__, __KEYART__…)
    la-run-a-gerald.html     ← build final (= index.html publié, ~6,2 Mo)
    assets.json, assets2.json, assets3.json   ← sprites/décors encodés (base64)
    vec/*.json               ← rigs vectoriels : hero_ai.json (Michel, depuis l'Illustrator), ld, dulac, boss, ginette, cw6–8, others
    cw/rigs_cw.json          ← collègues (rigs bitmap)
    office/                  ← studio.png, ground.png, dep.png, home.png, plantes
    skate/streets.json, ui/ui.json (key art, logo, flammes)
    music/*.mp3, intro/outro .mp4/.webm   ← médias publiés à part
  tools/
    build3.py   ← build : fusionne template + assets → game/la-run-a-gerald.html + tools/test.html + tools/g.js
    pcomp.py    ← compression des tracés SVG des rigs (utilisé par build3)
    vai.py      ← reconstruit vec/hero_ai.json depuis source/MICHEL.ai (calques Illustrator)
    smoke.py    ← test : lance chaque niveau dans Chromium headless, rapporte les erreurs JS
    scenes.py, rigsheet.py, rigbig.py, hairx.py, hairm.py, walkz.py, newt.py, keyt.py, ctrlt.py ← captures/tests ciblés
    fnt/        ← polices locales (Lilita One, Inter) pour test.html hors-ligne
  source/MICHEL.ai           ← fichier Illustrator de Michel (44 calques nommés)
  archive/meet.js, ww.js     ← mini-jeux d'ouverture retirés
```

## 4. Build, test, publication

```bash
cd michel-game/game
python3 ../tools/vai.py          # seulement si on change le rig de Michel
python3 ../tools/build3.py       # → la-run-a-gerald.html (+ tools/test.html)
node -e "new Function(require('fs').readFileSync('../tools/g.js','utf8'))"   # check de syntaxe
python3 ../tools/smoke.py        # doit finir par "errors total 0 []"
```

- **Dépendances :** Python 3 avec Pillow, numpy, pymupdf (pour vai.py) et playwright (Chromium déjà installé dans l'environnement cloud). `pip install --break-system-packages pymupdf` au besoin.
- **Publication :** `Artifact publish` avec `file_path=game/la-run-a-gerald.html` et `url=https://claude.ai/artifact/ACbvXQFR4wd5H5gCsBKsR8`. Il faut d'abord faire un `Artifact read` de l'URL dans la nouvelle conversation (sinon la publication est refusée), puis republier par-dessus.
- **Dans test.html**, `window.__g.go('office'|1|'boss'|…)` saute à un niveau et `__g.ev('code')` évalue du code dans le scope du jeu. Les tests s'en servent.
- **Pour tout changement :** on modifie `template.html` (petits patches Python avec assert sur `count==1`), on rebuild, on vérifie la syntaxe, on lance smoke.py, on fait une capture si c'est visuel, puis on publie.

## 5. Architecture du code (template.html, ~3850 lignes)

- **Boucle :** `loop` appelle `update(dt)` (dispatch par `level`) puis `render()` / `renderBase()`. Le `dt` est plafonné à 0,05 et `frameDt` sert aux easings.
- **Variable `state` :** `'title' | 'video' | 'phone' | 'play' | 'pause' | 'dev' | 'over' | 'outro'`.
- **Écran tuto « téléphone » :** `openPhone()` / `closePhone()`. Les contrôles s'affichent à gauche, et à droite les messages `TUTO[level]`. Les messages bleus viennent de la personne ; un message préfixé `'>'` s'affiche comme envoyé (vert, aligné à droite, signé « VERV · envoyé »). La notification reprend `LV_STORY[level]`.
- **Pour ajouter ou retirer un niveau**, il faut toucher tous ces endroits :
  - `LV_TRACK`, `STAGE_NAME`, `LV_NAME`, `DEV_LV` + les boutons HTML `#dev .devgrid` + la map de titres dans `devGo`/`openPhone`.
  - `hourAt`, le libellé du hud (`level==='…'?'Au …'`), `startLevel`, `update`, `renderBase`.
  - La chaîne keydown, les handlers pointer de `cv`, `padFor`/`buildPad`.
  - `TUTO`, `LV_STORY`, `TROPHIES`, `CHAPTERS`, `CTRL` (la table des contrôles en pause), et `KO` dans `updateKeys` (la barre de touches sous le jeu).
- **Difficulté :** `DIFFS` (facile, moyen, difficile), avec `DF = DIFFS[diff]`. Pour les mini-jeux, `mgDiff()` vaut 0,75, 1 ou 1,3.
- **Ivresse :**
  - `ammo` est le nombre de bières.
  - `drunk() = clamp((ammo-9)/9)` : Michel devient mou à partir de 10 bières.
  - `d25` : à partir d'environ 25 bières, la tête mène et le corps suit.
- **Manette :** `PAD_MAP` traduit les boutons en événements clavier. La navigation dans les menus est spatiale (`moveSpatial`). B fait retour, Start fait pause.
- **Chapitres :** ils se débloquent en jouant (localStorage `michel-chapters`). `startChapter(l)` met `run.cont=true`.
- **Classement :** `renderBoard`, par mode de difficulté. Il utilise la db de l'artifact, avec un repli local.

### Rigs vectoriels (`RIGS.*`, `drawRig` → `drawVecRig`)

- **Structure d'un rig :** `{vec:1, w, h, k, body:{x,y,paths,bb}, parts:[{n, f, x, y, px, py, parent?, clip?, paths, bb}]}`.
- **Calques :** `f` vaut 0 (derrière le corps), 1 (devant), 2 (la tête) ou 3 (au-dessus de tout). `parent` sert à chaîner les membres (cuisse, tibia, pied ; bras, avant-bras).
- **Tracés :** chaque entrée de `paths` est `[fill, tx, ty, d, stroke, width, evenodd]`. Les marqueurs `['CLIP',0,0,d]` et `['END',…]` servent au masque des tatouages.
- **Cache :** `vecDraw` garde un bitmap par niveau de zoom (`bb` est calculé dans build3).
- **Michel (`hero_ai.json`, généré par `vai.py` depuis les calques du .ai) :**
  - Parties : legL/shinL/footL, legR/shinR/footR, armR, keys (trousseau qui ballotte), armL/foreL, top (camisole), head.
  - `armL`/`foreL` sont le bras tatoué. Ils sont en **f=3, donc au-dessus du visage**, à la demande de l'utilisateur.
  - La tête est découpée en `segB` (les mèches de derrière, puis la tête) et `segF` (lunettes et nez, masse des cheveux, toupets 01–03, oreille gauche).
  - Les mèches qui ont un `piv` rebondissent sur des ressorts (`hairTick`, `drawSegs`). Elles réagissent à l'accélération, à la rotation de la tête et à l'ivresse. L'amplitude max est de 0,2×amp, et la masse principale a amp=0,2.
  - Les yeux, les paupières et la bouche sont dessinés en direct (`vecFace`, avec `ang.ex = {mouth, brow, blink, wink, look, drunk}`). La clope vient du calque « Cloppe » et se cache avec `ang.noCig`.
  - Les ombres du .ai (Produit 25 % violet, Incrustation rose) sont recalculées dans `vai.py` (`bake`).
- **Auto-poses :** `heroJoints()` remplit les genoux, les chevilles, le coude et le trousseau quand une scène ne pose que les hanches et l'épaule. `easeAng` et `easeVals` lissent les poses.

## 6. Préférences et décisions de l'utilisateur

- **Animations :** fluides, naturelles et « curvy ». À 10 bières Michel devient mou et maladroit ; à 25 bières la tête tourne d'abord et le corps suit.
- **Manette :** support complet partout, menus et appels à l'action compris. Le tactile est optimisé.
- **Contrôles par niveau :**
  - La barre sous le jeu et le menu Pause → Settings montrent **uniquement les contrôles du niveau en cours**.
  - Les contrôles sont affichés pour le clavier et la manette.
  - Les points (cigarette +10, etc.) ne s'affichent que dans les niveaux de rue.
- **Textes du tuto :** les messages des personnes sont en bleu, et les petits textes de mise en situation sont en notification.
- **Studio :** à 17 h la journée est faite. LD texte « Yo! 5 à 7 chez Ginette ce soir 🍻 », et VERV répond « C'est bon, j'arrive! J'vais au dép avant 🍺 ».
- **Personnages :**
  - Delachaud est le collègue barbu et frisé en t-shirt blanc (rig `cw8`, constante `DELACHAUD`).
  - Les collègues attendent devant les bars, puis se retrouvent chez Ginette.
- **Ordre après Ginette :** textos, puis limo, puis casino.
- **Remises en question :** l'utilisateur veut qu'on remette ses idées en question (« hésite pas à challenger mes idées »). Proposer des options, mais agir quand la demande est claire.
- **Envoi de fichiers :** les .ai envoyés tels quels arrivent **corrompus** (convertis en texte). Il faut demander un **.zip** ou un SVG.

## 7. En suspens / idées

- **Classement sur son propre site :** l'utilisateur ne sait pas encore quel hébergement (PHP, WordPress ou statique avec Supabase). Quand il le saura, il suffit de changer l'endroit où `renderBoard` envoie et lit les scores.
- **Réglages d'animation :** le rebond des cheveux et le bras tatoué au-dessus du visage sont à faire valider en jeu (on peut ajuster `hairTick` : gains 0,009 / 0,006 / 4, raideur 150, amortissement 9).
- **Pistes déjà proposées :** musique propre à chaque mini-jeu, écran de fin avec les stats de la nuit, nouveau mini-jeu d'ouverture (voir `archive/ww.js`).
- **Pièges connus :**
  - Il y a eu des conflits de publication quand la page a été modifiée ailleurs (titre changé en « Une nuit avec Michel »). Il faut fusionner dans `template.html`.
  - Les polices Google ne sont pas accessibles dans le conteneur. test.html utilise `tools/fnt`.
