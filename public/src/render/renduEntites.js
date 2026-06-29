import { creerElementAlien, creerElementBio, creerElementBoss, creerElementProjectile } from './renduCreationEntites.js';
import { appliquerBoite, appliquerFrameSprite, CONFIG_SPRITES } from './renduSprites.js';

// rendreJoueur actualise le joueur et sa frame.
export function rendreJoueur(rendu, joueur) {
  appliquerBoite(rendu.elementJoueur, joueur);
  let indexFrame = 0;
  if (joueur.animationTirSecondes > 0) indexFrame = 3;
  else if (joueur.directionAnimation < 0) indexFrame = 1;
  else if (joueur.directionAnimation > 0) indexFrame = 2;
  appliquerFrameSprite(rendu.elementJoueur, joueur, CONFIG_SPRITES.player, indexFrame);
  rendu.elementJoueur.classList.toggle('is-shielded', joueur.bouclierSecondes > 0);
}

// rendreAliens actualise les aliens presents et supprime les autres.
export function rendreAliens(rendu, aliens, tempsEcouleSecondes) {
  const idsAliensVivants = new Set();
  for (const alien of aliens) {
    idsAliensVivants.add(alien.id);
    const element = rendu.elementsAliens.get(alien.id) || creerElementAlien(rendu, alien);
    appliquerBoite(element, alien);
    const configSprite = CONFIG_SPRITES[alien.spriteId] || CONFIG_SPRITES.ananas;
    const indexFrame = Math.floor(tempsEcouleSecondes * alien.animationCadence) + alien.animationOffset;
    appliquerFrameSprite(element, alien, configSprite, indexFrame);
  }
  supprimerElementsAbsents(rendu.elementsAliens, idsAliensVivants);
}

// rendreBoss actualise le boss ou retire son noeud.
export function rendreBoss(rendu, boss, tempsEcouleSecondes) {
  if (!boss) {
    if (rendu.elementBoss) {
      rendu.elementBoss.remove();
      rendu.elementBoss = null;
    }
    return;
  }
  const element = rendu.elementBoss || creerElementBoss(rendu, boss);
  element.className = `entity sprite sprite-alien sprite-${boss.spriteId} boss-entity`;
  appliquerBoite(element, boss);
  const configSprite = CONFIG_SPRITES[boss.spriteId] || CONFIG_SPRITES.ananas;
  const indexFrame = Math.floor(tempsEcouleSecondes * boss.animationCadence) + boss.animationOffset;
  appliquerFrameSprite(element, boss, configSprite, indexFrame);
}

// rendreBios actualise les boucliers biologiques.
export function rendreBios(rendu, boucliersBio) {
  const idsBiosActifs = new Set();
  for (const bouclierBio of boucliersBio) {
    idsBiosActifs.add(bouclierBio.id);
    const element = rendu.elementsBios.get(bouclierBio.id) || creerElementBio(rendu, bouclierBio);
    appliquerBoite(element, bouclierBio);
    element.style.setProperty('--bio-integrite', String(bouclierBio.pointsDeVie));
    element.style.setProperty('--bio-integrite-max', String(bouclierBio.pointsDeVieMax));
    element.dataset.integrite = String(bouclierBio.pointsDeVie);
  }
  supprimerElementsAbsents(rendu.elementsBios, idsBiosActifs);
}

// rendreProjectiles actualise les projectiles visibles.
export function rendreProjectiles(rendu, projectiles, tempsEcouleSecondes) {
  const idsProjectilesActifs = new Set();
  for (const projectile of projectiles) {
    idsProjectilesActifs.add(projectile.id);
    const element = rendu.elementsProjectiles.get(projectile.id) || creerElementProjectile(rendu, projectile);
    appliquerBoite(element, projectile);
    if (projectile.teinte !== null) element.style.setProperty('--shot-hue', String(projectile.teinte));
    else element.style.removeProperty('--shot-hue');
    const indexFrame = projectile.proprietaire === 'joueur' ? Math.floor(tempsEcouleSecondes * 18) % 2 : 2 + (Math.floor(tempsEcouleSecondes * 14) % 2);
    appliquerFrameSprite(element, projectile, CONFIG_SPRITES.bullet, indexFrame);
  }
  supprimerElementsAbsents(rendu.elementsProjectiles, idsProjectilesActifs);
}

// supprimerElementsAbsents retire les elements DOM qui ne sont plus actifs.
export function supprimerElementsAbsents(collectionElements, idsActifs) {
  for (const [id, element] of collectionElements.entries()) {
    if (idsActifs.has(id)) continue;
    element.remove();
    collectionElements.delete(id);
  }
}
