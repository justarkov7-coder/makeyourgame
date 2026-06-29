const RAYON_REPULSION_COQUE = 190;
const VITESSE_REPULSION_COQUE = 430;

// coqueRepulseActive indique si le bonus defensif agit maintenant.
function coqueRepulseActive(etat) {
  return etat.bonusActif?.bonusId === 'hull-up' && etat.bonusActif.tempsRestantSecondes > 0;
}

// calculerCentreEntite donne le point central d'une entite.
function calculerCentreEntite(entite) {
  return { x: entite.x + entite.largeur / 2, y: entite.y + entite.hauteur / 2 };
}

// calculerDirectionRepulsion donne la direction depuis le joueur.
function calculerDirectionRepulsion(projectile, joueur) {
  const centreProjectile = calculerCentreEntite(projectile);
  const centreJoueur = calculerCentreEntite(joueur);
  let ecartX = centreProjectile.x - centreJoueur.x;
  let ecartY = centreProjectile.y - centreJoueur.y;
  let distance = Math.hypot(ecartX, ecartY);
  if (distance > RAYON_REPULSION_COQUE) return null;
  if (distance === 0) { ecartX = 0; ecartY = -1; distance = 1; }
  return { x: ecartX / distance, y: ecartY / distance, force: 1 - distance / RAYON_REPULSION_COQUE };
}

// repousserProjectileEnnemi eloigne un projectile de la coque du joueur.
function repousserProjectileEnnemi(projectile, joueur) {
  const direction = calculerDirectionRepulsion(projectile, joueur);
  if (!direction) return;
  projectile.x += direction.x * 28 * (0.5 + direction.force);
  projectile.y += direction.y * 28 * (0.5 + direction.force);
  projectile.vitesseHorizontale = direction.x * VITESSE_REPULSION_COQUE * (0.65 + direction.force);
  projectile.vitesseVerticale = direction.y * VITESSE_REPULSION_COQUE * (0.65 + direction.force);
  projectile.teinte = 175;
}

// repousserProjectilesEnnemis applique la coque aux tirs adverses.
export function repousserProjectilesEnnemis(etat) {
  if (!coqueRepulseActive(etat)) return;
  for (const projectile of etat.projectiles) {
    if (projectile.proprietaire !== 'joueur') repousserProjectileEnnemi(projectile, etat.joueur);
  }
}
