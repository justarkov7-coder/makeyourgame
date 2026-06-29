// creerElementJoueur cree le noeud DOM du joueur.
export function creerElementJoueur() {
  const element = document.createElement('div');
  element.className = 'entity sprite sprite-player';
  return element;
}

// creerElementAlien cree et memorise un alien.
export function creerElementAlien(rendu, alien) {
  const element = document.createElement('div');
  element.className = `entity sprite sprite-alien sprite-${alien.spriteId} ${alien.type}`;
  rendu.coucheEntites.append(element);
  rendu.elementsAliens.set(alien.id, element);
  return element;
}

// creerElementBoss cree et memorise le boss.
export function creerElementBoss(rendu, boss) {
  const element = document.createElement('div');
  element.className = `entity sprite sprite-alien sprite-${boss.spriteId} boss-entity`;
  rendu.coucheEntites.append(element);
  rendu.elementBoss = element;
  return element;
}

// creerElementBio cree et memorise un bouclier biologique.
export function creerElementBio(rendu, bouclierBio) {
  const element = document.createElement('div');
  element.className = 'entity sprite sprite-bio';
  rendu.coucheEntites.append(element);
  rendu.elementsBios.set(bouclierBio.id, element);
  return element;
}

// creerElementProjectile cree et memorise un projectile.
export function creerElementProjectile(rendu, projectile) {
  const typeProjectile = projectile.styleTir === 'boss' ? 'boss-shot' : projectile.proprietaire === 'joueur' ? 'player-shot' : 'alien-shot';
  const element = document.createElement('div');
  element.className = `entity sprite bullet ${typeProjectile}`;
  rendu.coucheEntites.append(element);
  rendu.elementsProjectiles.set(projectile.id, element);
  return element;
}
