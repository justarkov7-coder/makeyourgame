# Space Invaders DOM

Projet `Space Invaders` en `HTML/CSS/JavaScript` pur, sans framework et sans canvas.

## Lancer le jeu

```bash
npm start
```

Puis ouvrir `http://localhost:3000`.

## Controles

- `Fleche gauche` ou `A`: deplacer le vaisseau
- `Fleche droite` ou `D`: deplacer le vaisseau
- `Espace`: tirer
- `Echap` ou `P`: pause / reprendre
- `R`: recommencer

## Architecture

- `index.js`: serveur statique Node minimal
- `public/index.html`: structure de la page et du HUD
- `public/styles.css`: style retro arcade et layout responsive
- `public/src/core`: boucle `requestAnimationFrame`, input clavier, suivi FPS
- `public/src/game`: config, etat initial, logique metier
- `public/src/render`: rendu DOM optimise par mise a jour d'elements existants
- `public/src/ui`: HUD et overlay pause / fin de partie

## Notes perf

- La boucle du jeu repose sur `requestAnimationFrame`
- Les mouvements utilisent un `delta time` borne
- Le rendu DOM reutilise les memes noeuds au lieu de regenerer tout le plateau
- Les deplacements passent par `transform: translate3d(...)`
