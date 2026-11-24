# Mise en ligne — Une nuit avec Michel

## 1. Construire

```bash
npm install
npm run build          # -> dist/ (le site complet, statique)
```

`dist/` se copie tel quel sur n'importe quel hébergement statique. Tous les chemins sont relatifs : le jeu marche à la racine d'un domaine comme dans un sous-dossier.

## 2. Ton site : Netlify ou Cloudflare Pages

- **Netlify :** « Add new site » → relier le dépôt GitHub. Commande de build : `npm run build`. Dossier publié : `dist`. Variables d'environnement (facultatives) : celles de `.env.example`.
- **Cloudflare Pages :** même chose, preset « None », commande `npm run build`, dossier `dist`.
- **À la main :** glisser le dossier `dist/` dans l'interface de Netlify (Deploys → drag & drop).

Le fichier `public/_headers`, copié dans `dist/`, règle le cache : tout ce qui a un hash dans son nom est gardé un an par les navigateurs.

Pour que l'image de partage (Facebook, iMessage, Slack…) s'affiche partout, construire avec l'adresse finale :

```bash
VITE_SITE_URL=https://michel.ton-site.com npm run build
```

## 3. itch.io

```bash
npm run package:itch   # -> release/une-nuit-avec-michel-itch.zip
```

Sur itch.io : « Create new project » → Kind of project : **HTML**. Téléverser le zip et cocher « This file will be played in the browser ». Dans Embed options, choisir une taille de 960 × 540 ou plus (par exemple 1280 × 720), cocher « Mobile friendly » (orientation paysage) et « Fullscreen button ».

Sur itch.io, le classement en ligne ne marche qu'avec Supabase (voir plus bas). Sinon, chaque joueur a son classement local.

## 4. Classement en ligne (Supabase, gratuit)

1. Créer un projet sur supabase.com (région : Canada si offerte).
2. Ouvrir SQL Editor, coller le contenu de `supabase/schema.sql`, puis exécuter.
3. Dans Project Settings → API, copier **Project URL** et la clé **anon public**.
4. Créer un fichier `.env` à la racine du dépôt (jamais commité) à partir de `.env.example` :
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ…
   ```
   Sur Netlify ou Cloudflare, mettre plutôt ces deux variables dans les réglages du site.
5. Rebuilder. Le classement affiche alors « Classement partagé entre tous les joueurs de cette page ».

La clé anon est faite pour être publique. La table est protégée par la sécurité au niveau des lignes (RLS) :
- on peut seulement lire et ajouter, jamais modifier ni supprimer ;
- le nom fait 6 lettres maximum et le score ne dépasse pas 1 000 000 ;
- chaque adresse IP ne peut envoyer qu'un score toutes les 20 secondes.

Pour effacer un score : Table Editor → scores, dans le tableau de bord Supabase.

## 5. À tester sur de vrais appareils avant d'annoncer

Ces tests sont impossibles depuis le conteneur cloud :

- [ ] Chrome et Firefox (Windows ou macOS) : clavier, manette Xbox et PlayStation, plein écran (F).
- [ ] Safari macOS : musique (mp3 ou ogg selon la version), vidéos intro/outro, glow.
- [ ] iPhone (Safari) : tactile, paysage, plein écran, son après le premier toucher, fluidité (le repli Canvas 2D se déclenche-t-il ?).
- [ ] Android (Chrome) : mêmes points, plus la vibration.
- [ ] Le partage du lien (aperçu Open Graph) dans Messenger ou iMessage.
- [ ] Mode dev (T) → « Rendu » : comparer PixiJS et Canvas 2D sur le même appareil.

Si un appareil rame : `?renderer=canvas` dans l'URL force le rendu Canvas 2D. On peut aussi baisser le glow dans `src/gfx/effects.ts` (`TUNING`).
