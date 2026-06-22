# Space Invaders DOM

Jeu `Space Invaders` realise en `HTML`, `CSS` et `JavaScript` pur, sans framework et sans canvas.

Le rendu passe uniquement par le DOM, avec une boucle basee sur `requestAnimationFrame`, des controles clavier continus, un HUD de jeu, et un menu de pause avec reprise et redemarrage.

## Lancement

```bash
npm start
```

Le serveur local expose ensuite le jeu sur `http://localhost:3000`.

## Controles

- `Fleche gauche` ou `A` : deplacer le vaisseau vers la gauche
- `Fleche droite` ou `D` : deplacer le vaisseau vers la droite
- `Espace` : tirer
- `Echap` ou `P` : mettre en pause / reprendre
- `R` : recommencer une partie

## Structure

- `index.js` : serveur statique Node minimal
- `public/index.html` : structure de la page, zone de jeu, HUD et menu
- `public/styles.css` : style visuel, layout responsive et couches DOM
- `public/src/main.js` : point d'entree et branchement de l'interface
- `public/src/core` : boucle de jeu, gestion clavier, suivi des performances
- `public/src/game` : configuration, etat initial, logique metier
- `public/src/render` : rendu DOM des entites
- `public/src/ui` : affichage HUD et gestion de la superposition

## Principes techniques

- boucle de jeu basee sur `requestAnimationFrame`
- mise a jour avec `delta` borne pour garder un mouvement stable
- rendu optimise par reutilisation des noeuds DOM
- deplacements via `transform: translate3d(...)`
- logique decoupee en petites fonctions pour garder une lecture simple

## Etat du code

- vocabulaire metier principal en francais
- fonctions courtes et responsabilites separees
- architecture modulaire entre `core`, `game`, `render` et `ui`
