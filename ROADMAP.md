# Roadmap — Michel The Game v2

**Cible : uniquement le web** (pas de Steam, pas de console). On ne change pas de moteur pour passer à Unity ou Unreal. On fait évoluer la base actuelle.
**Objectif :** beaucoup plus de détail dans les animations (sprites, FX, PNJ, décors), puis une mise en ligne propre.

Règle d'or : **chaque étape livre un jeu jouable**. Avant de passer à l'étape suivante, `smoke.py` doit finir sur `errors total 0` et chaque étape doit avoir son commit git.

---

## Étape 0 — Préparation

- [x] `git init` et commit de l'état actuel (`v55`, identique à l'artifact claude.ai).
- [x] Tag `v1-canvas` pour pouvoir revenir à cette version.
- [x] Vérifier que `python3 tools/build.py --test` et `python3 tools/smoke.py` passent avant de toucher quoi que ce soit.

## Étape 1 — Restructuration (aucun changement visible) ✅

Fait. Écarts assumés par rapport au plan :
- Les fichiers du jeu sont encore du JS qui partage une seule portée (voir « Architecture » dans `CLAUDE.md`), pas des modules TypeScript typés. Seuls l'entrée et le loader sont en TS. La conversion se fera module par module.
- Atlas faits maison (`tools/assets.mjs` + sharp) au lieu de TexturePacker.
- L'audio n'est pas préchargé (10 Mo de musique avant le premier écran casserait l'objectif des 3 s) : seules les images, les rigs et les polices le sont.
- Polices auto-hébergées, plus de Google Fonts.

But : sortir du fichier unique de ~3 850 lignes sans changer le rendu.

- [x] Mettre en place **Vite + TypeScript** (`npm create vite@latest`, template vanilla-ts).
- [x] Découper `src/template.html` en modules :
  ```
  src/
    main.ts            boucle, états, dispatch update/render
    core/              input (clavier, PAD_MAP, tactile), audio, save (localStorage), diff (DIFFS, mgDiff)
    render/            drawRig, drawVecRig, vecDraw (cache), vecFace, htFill, pg
    rigs/              hairTick, drawSegs, heroJoints, easeAng, easeVals
    ui/                title, pause, settings (CTRL), dev, board, phone (TUTO, LV_STORY), cards, hud
    levels/            office.ts, street1.ts, boss.ts, street2.ts, joint.ts, dance.ts,
                       texto.ts, limo.ts, bj.ts, flip.ts, bike.ts, home.ts
    data/              LV_TRACK, STAGE_NAME, LV_NAME, TROPHIES, CHAPTERS…
  ```
- [x] **Registre de niveaux** : chaque niveau exporte `{ id, name, track, start, update, render, keys, pad, tuto, story, ctrl }`. Ajouter un niveau ne demande alors plus de modifier une douzaine d'endroits (voir la liste dans `CLAUDE.md`).
- [x] Sortir les images du base64 : `assets/img/*` deviennent des fichiers servis à part, regroupés en **atlas WebP** (TexturePacker ou `free-tex-packer`).
- [x] **Écran de chargement** avec une vraie barre de progression (préchargement des atlas, de l'audio et des rigs JSON).
- [x] Adapter `tools/smoke.py` pour qu'il tourne sur `vite preview` à la place de `dist/test.html`, en gardant un hook `__g` exposé en mode test.
- [x] Vérification : captures `shots/` identiques à la v1 (à quelques pixels près).

## Étape 2 — Rendu PixiJS (WebGL) ✅ (sauf le rig de Michel en sprites)

But : afficher beaucoup plus d'éléments à l'écran et avoir accès aux filtres et aux shaders.

- [x] Intégrer **PixiJS v8** (`src/gfx/pixi.ts`). Le canvas Pixi se pose sur #c ; letterbox, plein écran et clics inchangés.
  Choix fait : Pixi est un **compositeur**. Le jeu dessine toujours en Canvas 2D, dans deux calques (monde, interface), et Pixi les assemble avec les filtres et les particules. Tous les niveaux en profitent d'un coup, sans réécrire ~2 000 lignes de dessin.
- [ ] **Rig de Michel en sprites Pixi (option A)** : pas fait. Tant que le monde est dessiné en Canvas 2D, Michel est intercalé entre le décor et l'avant-plan : le sortir dans Pixi demande de découper le dessin du monde en couches, niveau par niveau. À faire niveau par niveau, quand un niveau en a besoin (par exemple pour des filtres propres à Michel).
- [x] UI : reste en DOM/CSS (menus, overlays). Le HUD, les bannières et le téléphone sont sur un calque à part, jamais filtré.
- [x] Filtres (`src/gfx/effects.ts`, réglages dans `TUNING`) : ivresse (saturation, teinte qui dérive, double vision), glow (bloom), qualité auto. Le grain reste celui du Canvas.
- [x] Particules : système maison GPU (`src/gfx/particles.ts`, `FX.burst / emit`), 8 presets.
- [x] Filet de sécurité : `?renderer=canvas|pixi`, bouton dans le mode dev, repli automatique sur Canvas 2D (pas de WebGL, ou moins de 24 fps sur l'écran titre).

## Étape 3 — Couche de détail d'animation (partie procédurale ✅)

**Choix d'outil : À CONFIRMER par Alexandre.**
Proposition par défaut :
- **Sprite sheets exportées d'After Effects** pour les FX, les décors animés et les transitions. **Le pipeline est prêt** : séquence PNG dans `assets/anim/<nom>/` (+ `anim.json`), puis `FX.anim('<nom>', x, y)`.
- **Spine** (runtime `@esotericsoftware/spine-pixi-v8`) pour les PNJ importants qui doivent être souples (LD, Ginette, la blonde, Dulac, Delachaud).
- Alternative : **Rive** (`@rive-app/canvas`), qui fait les deux avec des state machines interactives.

**Michel reste un rig vectoriel procédural.** C'est la signature du jeu.

Fait sans assets (particules, filtres, code) :
- [x] Global : transition en trame de points entre les niveaux, squash & stretch sur les boutons (et respiration du bouton JOUER), vibration de la manette (blessure, K.O., chute, gros gains, atterrissages lourds), impacts (flash + étincelles), poussière aux atterrissages, braises sur les clopes et les bières.
- [x] `2` : bruine fine à 21 h, glow des lampadaires, fenêtres et enseignes.
- [x] `joint` : volutes de fumée GPU en plus de la fumée dessinée.
- [x] `dance` : glow, poussière de lumière, étincelles sur les pas réussis, confettis tous les 10 pas d'affilée.
- [x] `bj` / `flip` : traînée des billes, étincelles sur les bumpers, flash + confettis sur les gains, glow.
- [x] `bike` : poussière sous les roues, nuage de poussière à la chute.
- [x] `office` / `3` : poussière de lumière.

À faire avec les exports ou l'outil d'Alexandre (à prioriser avec lui) :
- [ ] `office` : écrans qui clignotent, collègues en idle, vapeur de café.
- [ ] `1` / `2` : enseignes néon animées, passants, fumée des bouches d'égout.
- [ ] `boss` : néon du frigo à bières, caissier en idle.
- [ ] `dance` : foule animée en arrière-plan, boule disco animée.
- [ ] `limo` : reflets qui défilent sur les vitres.
- [ ] `bike` : parallax multi-couches, étincelles sur les grinds.
- [ ] `3` : chat qui dort, ombres.

## Étape 4 — Mise en ligne (tout ce qui ne demande pas de compte ✅)

- [x] Build de prod : atlas WebP, musique en `.ogg` (Opus) + `.mp3`, vidéos déjà compressées (gardées telles quelles), tout `gen/` et `assets/` hashé (cache infini via `public/_headers`).
- [ ] Hébergement : **itch.io** et/ou le site d'Alexandre. Prêt (`npm run package:itch`, `dist/` pour Netlify / Cloudflare Pages), mais la mise en ligne demande ses comptes : voir `docs/DEPLOIEMENT.md`.
- [x] Classement en ligne : **Supabase**, avec repli sur localStorage. Code + `supabase/schema.sql` (RLS, validation, anti-spam) prêts et testés. [ ] Créer le projet Supabase et mettre les clés dans `.env` (Alexandre).
- [x] Méta : favicon, icônes, Open Graph (key art + logo), titre, description en français, manifest web.
- [ ] Tests sur les vrais navigateurs : Chrome, Safari macOS et iOS, Firefox, Android, avec manette et en tactile (impossible depuis le conteneur : liste dans `docs/DEPLOIEMENT.md`).
- [~] Performance : résolution adaptative et repli Canvas 2D automatiques ; `tools/perf.py` mesure en headless (WebGL logiciel, donc pessimiste). Le 60 fps sur un mobile milieu de gamme reste à vérifier sur un vrai téléphone.

---

## Prompt de départ pour Claude Code

> Lis `CLAUDE.md` et `ROADMAP.md`. On attaque l'étape 0 puis l'étape 1 : migrer `src/template.html` vers Vite + TypeScript, un module par niveau avec un registre de niveaux, assets sortis du base64 en atlas WebP, écran de chargement. Aucun changement visuel. `tools/smoke.py` doit finir à 0 erreur. Un commit par sous-étape.
