function appliquerBoite(element, entite) {
  element.style.width = `${entite.largeur}px`;
  element.style.height = `${entite.hauteur}px`;
  element.style.transform = `translate3d(${Math.round(entite.x)}px, ${Math.round(entite.y)}px, 0)`;
}

export class RenduDom {
  constructor({ scene, monde, coucheEntites }) {
    this.scene = scene;
    this.monde = monde;
    this.coucheEntites = coucheEntites;
    this.elementsAliens = new Map();
    this.elementsProjectiles = new Map();
    this.elementJoueur = this.creerElementJoueur();
    this.coucheEntites.innerHTML = '';
    this.coucheEntites.append(this.elementJoueur);
    this.mettreEnPageMonde = this.mettreEnPageMonde.bind(this);
    this.mettreEnPageMonde();
    window.addEventListener('resize', this.mettreEnPageMonde);
  }

  mettreEnPageMonde() {
    const rectangle = this.scene.getBoundingClientRect();
    const echelle = Math.min(rectangle.width / 960, rectangle.height / 640);
    const decalageX = (rectangle.width - 960 * echelle) / 2;
    const decalageY = (rectangle.height - 640 * echelle) / 2;
    this.monde.style.transform = `translate(${decalageX}px, ${decalageY}px) scale(${echelle})`;
  }

  creerElementJoueur() {
    const element = document.createElement('div');
    element.className = 'entity player';
    return element;
  }

  creerElementAlien(alien) {
    const element = document.createElement('div');
    element.className = `entity alien ${alien.type}`;
    this.coucheEntites.append(element);
    this.elementsAliens.set(alien.id, element);
    return element;
  }

  creerElementProjectile(projectile) {
    const typeProjectile = projectile.proprietaire === 'joueur' ? 'player-shot' : 'alien-shot';
    const element = document.createElement('div');
    element.className = `entity bullet ${typeProjectile}`;
    this.coucheEntites.append(element);
    this.elementsProjectiles.set(projectile.id, element);
    return element;
  }

  rendre(etat) {
    this.rendreJoueur(etat.joueur);
    this.rendreAliens(etat.aliens);
    this.rendreProjectiles(etat.projectiles);
  }

  rendreJoueur(joueur) {
    appliquerBoite(this.elementJoueur, joueur);
    this.elementJoueur.style.opacity = joueur.bouclierSecondes > 0 ? '0.5' : '1';
  }

  rendreAliens(aliens) {
    const idsAliensVivants = new Set();

    for (const alien of aliens) {
      idsAliensVivants.add(alien.id);
      const element = this.elementsAliens.get(alien.id) || this.creerElementAlien(alien);
      appliquerBoite(element, alien);
    }

    this.supprimerElementsAbsents(this.elementsAliens, idsAliensVivants);
  }

  rendreProjectiles(projectiles) {
    const idsProjectilesActifs = new Set();

    for (const projectile of projectiles) {
      idsProjectilesActifs.add(projectile.id);
      const element =
        this.elementsProjectiles.get(projectile.id) || this.creerElementProjectile(projectile);
      appliquerBoite(element, projectile);
    }

    this.supprimerElementsAbsents(this.elementsProjectiles, idsProjectilesActifs);
  }

  supprimerElementsAbsents(collectionElements, idsActifs) {
    for (const [id, element] of collectionElements.entries()) {
      if (idsActifs.has(id)) {
        continue;
      }

      element.remove();
      collectionElements.delete(id);
    }
  }
}
