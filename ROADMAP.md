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

## Étape 2 — Rendu PixiJS (WebGL)

But : afficher beaucoup plus d'éléments à l'écran et avoir accès aux filtres et aux shaders.

- [ ] Intégrer **PixiJS v8**. Le canvas 960×540 devient un `Application` Pixi, et le letterbox et le plein écran restent les mêmes.
- [ ] **Rig de Michel** : on garde la logique procédurale (ressorts, ivresse, `d25`, la tête qui mène). Seul le dessin change :
  - option A : chaque partie du rig est rasterisée dans une texture (via le cache bitmap `vecDraw` qui existe déjà), puis rendue comme un `Sprite` Pixi avec pivot ;
  - option B : `Graphics` Pixi à partir des tracés SVG.
  → Commencer par l'option A : c'est plus rapide et le rendu est identique.
- [ ] Porter l'UI (menus, hud, téléphone) : soit en Pixi, soit en DOM/CSS par-dessus le canvas. Le DOM est plus net pour le texte et plus simple pour l'accessibilité et la manette.
- [ ] Filtres de base disponibles : glow, blur, bruit/grain, color matrix (pour l'ivresse : saturation, teinte, double vision).
- [ ] Particules : `@pixi/particle-emitter` ou un système maison basé sur `mgParts`.
- [ ] Migrer niveau par niveau. Un flag `RENDERER = 'canvas' | 'pixi'` sert de filet de sécurité pendant la transition.

## Étape 3 — Couche de détail d'animation

**Choix d'outil : À CONFIRMER par Alexandre.**
Proposition par défaut :
- **Sprite sheets exportées d'After Effects** pour les FX, les décors animés et les transitions (export PNG → atlas WebP, lecture via `AnimatedSprite`).
- **Spine** (runtime `@esotericsoftware/spine-pixi-v8`) pour les PNJ importants qui doivent être souples (LD, Ginette, la blonde, Dulac, Delachaud).
- Alternative : **Rive** (`@rive-app/canvas`), qui fait les deux avec des state machines interactives.

**Michel reste un rig vectoriel procédural.** C'est la signature du jeu.

Idées par niveau (à prioriser avec Alexandre) :
- [ ] `office` : écrans qui clignotent, collègues en idle, vapeur de café.
- [ ] `1` / `2` (Saint-Laurent) : enseignes néon animées (avec glow), passants, voitures avec phares, pluie ou neige légère, fumée des bouches d'égout.
- [ ] `boss` (dépanneur) : néon du frigo à bières, caissier en idle.
- [ ] `joint` : volutes de fumée (sprites + blur).
- [ ] `dance` : foule animée en arrière-plan, lumières de club (blend additif), boule disco.
- [ ] `limo` : reflets qui défilent sur les vitres, lumières de la ville.
- [ ] `bj` / `flip` : cartes et billes avec trails, flash sur les gains.
- [ ] `bike` : parallax multi-couches, poussière, étincelles sur les grinds.
- [ ] `3` (chez Michel) : chat qui dort, lumière de lampe, ombres.
- [ ] Global : transitions entre les niveaux (wipe en trame de points en style `htFill`), squash & stretch sur les CTA, vibration de la manette.

## Étape 4 — Mise en ligne

- [ ] Build de prod optimisé : atlas WebP, audio en `.ogg` et `.mp3` compressés, vidéos intro/outro en WebM et MP4 compressées, cache busting par hash (Vite le gère).
- [ ] Hébergement : **itch.io** (page de jeu HTML5) et/ou le site d'Alexandre (Netlify ou Cloudflare Pages).
- [ ] Classement en ligne : **Supabase** (table `scores` + RLS + validation simple côté serveur), avec repli sur localStorage.
- [ ] Méta : favicon, Open Graph (key art), titre, description en français.
- [ ] Tests sur les vrais navigateurs : Chrome, Safari macOS et iOS, Firefox, Android, avec manette et en tactile.
- [ ] Performance : 60 fps sur un mobile milieu de gamme, premier affichage en moins de 3 s.

---

## Prompt de départ pour Claude Code

> Lis `CLAUDE.md` et `ROADMAP.md`. On attaque l'étape 0 puis l'étape 1 : migrer `src/template.html` vers Vite + TypeScript, un module par niveau avec un registre de niveaux, assets sortis du base64 en atlas WebP, écran de chargement. Aucun changement visuel. `tools/smoke.py` doit finir à 0 erreur. Un commit par sous-étape.
