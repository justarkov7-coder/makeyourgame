import { CONFIG_JEU } from './config.js';

// borner ramene une valeur dans un intervalle.
export function borner(valeur, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, valeur));
}

// construireBoiteCollision applique les marges d'une entite.
function construireBoiteCollision(entite) {
  const margeCollisionX = entite.margeCollisionX || 0;
  const margeCollisionY = entite.margeCollisionY || 0;
  return { x: entite.x + margeCollisionX, y: entite.y + margeCollisionY, largeur: Math.max(1, entite.largeur - margeCollisionX * 2), hauteur: Math.max(1, entite.hauteur - margeCollisionY * 2) };
}

// collisionne detecte le chevauchement de deux boites.
export function collisionne(entiteA, entiteB) {
  const boiteA = construireBoiteCollision(entiteA);
  const boiteB = construireBoiteCollision(entiteB);
  return boiteA.x < boiteB.x + boiteB.largeur && boiteA.x + boiteA.largeur > boiteB.x && boiteA.y < boiteB.y + boiteB.hauteur && boiteA.y + boiteA.hauteur > boiteB.y;
}

// terminerPartie bascule vers l'ecran de saisie du score.
export function terminerPartie(etat, resultat) {
  etat.boss = null;
  etat.resultat = resultat;
  etat.phase = 'saisie-score';
}

// creerProjectile ajoute un projectile configure dans l'etat.
export function creerProjectile(etat, proprietaire, x, y, vitesseVerticale, options = {}) {
  etat.projectiles.push({
    id: `projectile-${etat.prochainIdProjectile}`, proprietaire, x, y,
    largeur: CONFIG_JEU.projectiles.largeur, hauteur: CONFIG_JEU.projectiles.hauteur,
    vitesseHorizontale: options.vitesseHorizontale || 0, vitesseVerticale,
    styleTir: options.styleTir || proprietaire, teinte: options.teinte ?? null,
    margeCollisionX: options.margeCollisionX || 0, margeCollisionY: options.margeCollisionY || 0,
  });
  etat.prochainIdProjectile += 1;
}

// compterAliensRestants compte les aliens actifs et reserves.
export function compterAliensRestants(etat) {
  return etat.aliens.length + etat.aliensEnReserve.length;
}

// bossEstActif indique si un boss est present.
export function bossEstActif(etat) {
  return etat.boss !== null;
}

// projectileAppartientAuJoueur filtre les tirs allies.
export function projectileAppartientAuJoueur(projectile) {
  return projectile.proprietaire === 'joueur';
}

// nettoyerProjectilesHostiles retire les tirs ennemis.
export function nettoyerProjectilesHostiles(etat) {
  etat.projectiles = etat.projectiles.filter(projectileAppartientAuJoueur);
}

// infligerDegatAuJoueur retire une vie si le bouclier est inactif.
export function infligerDegatAuJoueur(etat) {
  if (etat.joueur.bouclierSecondes > 0) return;
  etat.vies -= 1;
  etat.joueur.bouclierSecondes = etat.joueur.dureeBouclierReapparition;
  if (etat.vies <= 0) terminerPartie(etat, 'defeat');
}
