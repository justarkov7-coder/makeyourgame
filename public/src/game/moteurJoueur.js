import { CONFIG_JEU } from './config.js';
import { borner, creerProjectile } from './moteurCommun.js';

// deplacerJoueur applique les entrees horizontales.
export function deplacerJoueur(etat, entrees, deltaSecondes) {
  const joueur = etat.joueur;
  const vaAGauche = entrees.estEnfoncee('ArrowLeft') || entrees.estEnfoncee('KeyA');
  const vaADroite = entrees.estEnfoncee('ArrowRight') || entrees.estEnfoncee('KeyD');
  const direction = Number(vaADroite) - Number(vaAGauche);
  joueur.directionAnimation = direction;
  joueur.x = borner(joueur.x + direction * joueur.vitesse * deltaSecondes, 0, CONFIG_JEU.largeur - joueur.largeur);
}

// mettreAJourTirJoueur gere le delai et la creation du tir joueur.
export function mettreAJourTirJoueur(etat, entrees, deltaSecondes) {
  const joueur = etat.joueur;
  joueur.delaiTir = Math.max(0, joueur.delaiTir - deltaSecondes);
  joueur.bouclierSecondes = Math.max(0, joueur.bouclierSecondes - deltaSecondes);
  joueur.animationTirSecondes = Math.max(0, joueur.animationTirSecondes - deltaSecondes);
  if (!entrees.estEnfoncee('Space') || joueur.delaiTir !== 0) return;
  creerProjectile(etat, 'joueur', joueur.x + joueur.largeur / 2 - CONFIG_JEU.projectiles.largeur / 2, joueur.y - CONFIG_JEU.projectiles.hauteur, -CONFIG_JEU.projectiles.vitesseJoueur);
  joueur.delaiTir = joueur.delaiEntreTirs;
  joueur.animationTirSecondes = CONFIG_JEU.joueur.dureeAnimationTir;
}
