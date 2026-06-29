import { CONFIG_JEU } from './config.js';
import { bossEstActif, collisionne, infligerDegatAuJoueur, projectileAppartientAuJoueur } from './moteurCommun.js';
import { declencherBossSiNecessaire, terminerBoss } from './moteurBonusBoss.js';
import { repousserProjectilesEnnemis } from './moteurCoque.js';

// projectileEstDansLaZone garde les projectiles proches de l'ecran.
function projectileEstDansLaZone(projectile) {
  return projectile.x + projectile.largeur >= -48 && projectile.x <= CONFIG_JEU.largeur + 48 && projectile.y + projectile.hauteur >= -48 && projectile.y <= CONFIG_JEU.hauteur + 48;
}

// deplacerProjectiles avance les tirs puis retire ceux hors zone.
export function deplacerProjectiles(etat, deltaSecondes) {
  for (const projectile of etat.projectiles) {
    projectile.x += projectile.vitesseHorizontale * deltaSecondes;
    projectile.y += projectile.vitesseVerticale * deltaSecondes;
  }
  repousserProjectilesEnnemis(etat);
  etat.projectiles = etat.projectiles.filter(projectileEstDansLaZone);
}

// resoudreImpactBouclierBio gere un impact sur bouclier bio.
function resoudreImpactBouclierBio(etat, projectile) {
  for (const bouclierBio of etat.boucliersBio) {
    if (!collisionne(projectile, bouclierBio)) continue;
    bouclierBio.pointsDeVie -= 1;
    if (bouclierBio.pointsDeVie <= 0) etat.boucliersBio = etat.boucliersBio.filter(function garderBouclierBio(item) { return item.id !== bouclierBio.id; });
    return true;
  }
  return false;
}

// resoudreProjectileBoss gere un tir joueur sur le boss.
function resoudreProjectileBoss(etat, projectile) {
  if (!etat.boss || !collisionne(projectile, etat.boss)) return false;
  etat.boss.pointsDeVie -= 1;
  if (etat.boss.pointsDeVie <= 0) terminerBoss(etat);
  return true;
}

// resoudreProjectileJoueur gere un tir joueur sur les cibles.
function resoudreProjectileJoueur(etat, projectile, idsAliensDetruits) {
  if (resoudreProjectileBoss(etat, projectile)) return true;
  for (const alien of etat.aliens) {
    if (idsAliensDetruits.has(alien.id) || !collisionne(projectile, alien)) continue;
    idsAliensDetruits.add(alien.id);
    etat.score += alien.points;
    if (!bossEstActif(etat) && etat.score >= etat.prochainPalierBoss) etat.bossDoitApparaitre = true;
    return true;
  }
  return false;
}

// projectileEstConsomme resout une collision de projectile.
function projectileEstConsomme(etat, projectile, idsAliensDetruits) {
  if (resoudreImpactBouclierBio(etat, projectile)) return true;
  if (projectile.proprietaire === 'joueur') return resoudreProjectileJoueur(etat, projectile, idsAliensDetruits);
  if (!collisionne(projectile, etat.joueur)) return false;
  infligerDegatAuJoueur(etat);
  return true;
}

// retirerAliensDetruits purge les aliens touches par cette frame.
function retirerAliensDetruits(etat, idsAliensDetruits) {
  if (idsAliensDetruits.size === 0) return;
  etat.aliens = etat.aliens.filter(function garderAlien(alien) { return !idsAliensDetruits.has(alien.id); });
}

// resoudreCollisions construit la liste restante apres impacts.
export function resoudreCollisions(etat) {
  const projectilesRestants = [];
  const idsAliensDetruits = new Set();
  for (const projectile of etat.projectiles) {
    const estConsomme = projectileEstConsomme(etat, projectile, idsAliensDetruits);
    if (!estConsomme) projectilesRestants.push(projectile);
    if (etat.bossDoitApparaitre) break;
  }
  retirerAliensDetruits(etat, idsAliensDetruits);
  if (etat.bossDoitApparaitre) {
    etat.projectiles = projectilesRestants.filter(projectileAppartientAuJoueur);
    declencherBossSiNecessaire(etat);
    return;
  }
  etat.projectiles = projectilesRestants;
}
