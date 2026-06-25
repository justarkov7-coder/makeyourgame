import { RenduCarte } from './RenduCarte.js';
import { CONFIG_JEU } from '../game/config.js';

const CONFIG_SPRITES = {
  player: { colonnes: 2, lignes: 2, totalFrames: 4 },
  ananas: { colonnes: 2, lignes: 2, totalFrames: 4 },
  mouche: { colonnes: 2, lignes: 2, totalFrames: 4 },
  papillon: { colonnes: 2, lignes: 2, totalFrames: 4 },
  pommefraise: { colonnes: 2, lignes: 2, totalFrames: 4 },
  banane: { colonnes: 2, lignes: 3, totalFrames: 6 },
  versdeterre: { colonnes: 2, lignes: 5, totalFrames: 10 },
  bullet: { colonnes: 2, lignes: 3, totalFrames: 6 },
};

function appliquerBoite(element, entite) {
  element.style.width = `${entite.largeur}px`;
  element.style.height = `${entite.hauteur}px`;
  element.style.transform = `translate3d(${Math.round(entite.x)}px, ${Math.round(entite.y)}px, 0)`;
}

function appliquerFrameSprite(element, entite, configSprite, indexFrame) {
  const frameNormalisee = ((indexFrame % configSprite.totalFrames) + configSprite.totalFrames) % configSprite.totalFrames;
  const colonne = frameNormalisee % configSprite.colonnes;
  const ligne = Math.floor(frameNormalisee / configSprite.colonnes);
  const largeurFond = entite.largeur * configSprite.colonnes;
  const hauteurFond = entite.hauteur * configSprite.lignes;

  element.style.backgroundSize = `${largeurFond}px ${hauteurFond}px`;
  element.style.backgroundPosition = `${-colonne * entite.largeur}px ${-ligne * entite.hauteur}px`;
}

export class RenduDom {
  constructor({ scene, monde, coucheCarte, coucheEntites }) {
    this.scene = scene;
    this.monde = monde;
    this.largeurMonde = CONFIG_JEU.largeur;
    this.hauteurMonde = CONFIG_JEU.hauteur;
    this.renduCarte = new RenduCarte({ coucheCarte });
    this.coucheEntites = coucheEntites;
    this.elementsBios = new Map();
    this.elementsAliens = new Map();
    this.elementsProjectiles = new Map();
    this.elementBoss = null;
    this.elementJoueur = this.creerElementJoueur();
    this.monde.style.width = `${this.largeurMonde}px`;
    this.monde.style.height = `${this.hauteurMonde}px`;
    this.coucheEntites.innerHTML = '';
    this.coucheEntites.append(this.elementJoueur);
    this.mettreEnPageMonde = this.mettreEnPageMonde.bind(this);
    this.mettreEnPageMonde();
    window.addEventListener('resize', this.mettreEnPageMonde);
  }

  mettreEnPageMonde() {
    const rectangle = this.scene.getBoundingClientRect();
    const echelle = Math.min(
      rectangle.width / this.largeurMonde,
      rectangle.height / this.hauteurMonde,
    );
    const decalageX = (rectangle.width - this.largeurMonde * echelle) / 2;
    const decalageY = (rectangle.height - this.hauteurMonde * echelle) / 2;
    this.monde.style.transform = `translate(${decalageX}px, ${decalageY}px) scale(${echelle})`;
  }

  creerElementJoueur() {
    const element = document.createElement('div');
    element.className = 'entity sprite sprite-player';
    return element;
  }

  creerElementAlien(alien) {
    const element = document.createElement('div');
    element.className = `entity sprite sprite-alien sprite-${alien.spriteId} ${alien.type}`;
    this.coucheEntites.append(element);
    this.elementsAliens.set(alien.id, element);
    return element;
  }

  creerElementBoss(boss) {
    const element = document.createElement('div');
    element.className = `entity sprite sprite-alien sprite-${boss.spriteId} boss-entity`;
    this.coucheEntites.append(element);
    this.elementBoss = element;
    return element;
  }

  creerElementBio(bouclierBio) {
    const element = document.createElement('div');
    element.className = 'entity sprite sprite-bio';
    this.coucheEntites.append(element);
    this.elementsBios.set(bouclierBio.id, element);
    return element;
  }

  creerElementProjectile(projectile) {
    const typeProjectile =
      projectile.styleTir === 'boss'
        ? 'boss-shot'
        : projectile.proprietaire === 'joueur'
          ? 'player-shot'
          : 'alien-shot';
    const element = document.createElement('div');
    element.className = `entity sprite bullet ${typeProjectile}`;
    this.coucheEntites.append(element);
    this.elementsProjectiles.set(projectile.id, element);
    return element;
  }

  rendre(etat) {
    this.renduCarte.rendre(etat.carte);
    this.rendreJoueur(etat.joueur);
    this.rendreBios(etat.boucliersBio);
    this.rendreAliens(etat.aliens, etat.tempsEcouleSecondes);
    this.rendreBoss(etat.boss, etat.tempsEcouleSecondes);
    this.rendreProjectiles(etat.projectiles, etat.tempsEcouleSecondes);
  }

  rendreJoueur(joueur) {
    appliquerBoite(this.elementJoueur, joueur);
    let indexFrame = 0;
    if (joueur.animationTirSecondes > 0) {
      indexFrame = 3;
    } else if (joueur.directionAnimation < 0) {
      indexFrame = 1;
    } else if (joueur.directionAnimation > 0) {
      indexFrame = 2;
    }

    appliquerFrameSprite(this.elementJoueur, joueur, CONFIG_SPRITES.player, indexFrame);
    this.elementJoueur.classList.toggle('is-shielded', joueur.bouclierSecondes > 0);
  }

  rendreAliens(aliens, tempsEcouleSecondes) {
    const idsAliensVivants = new Set();

    for (const alien of aliens) {
      idsAliensVivants.add(alien.id);
      const element = this.elementsAliens.get(alien.id) || this.creerElementAlien(alien);
      appliquerBoite(element, alien);
      const configSprite = CONFIG_SPRITES[alien.spriteId] || CONFIG_SPRITES.ananas;
      const indexFrame =
        Math.floor(tempsEcouleSecondes * alien.animationCadence) + alien.animationOffset;
      appliquerFrameSprite(element, alien, configSprite, indexFrame);
    }

    this.supprimerElementsAbsents(this.elementsAliens, idsAliensVivants);
  }

  rendreBoss(boss, tempsEcouleSecondes) {
    if (!boss) {
      if (this.elementBoss) {
        this.elementBoss.remove();
        this.elementBoss = null;
      }
      return;
    }

    const element = this.elementBoss || this.creerElementBoss(boss);
    element.className = `entity sprite sprite-alien sprite-${boss.spriteId} boss-entity`;
    appliquerBoite(element, boss);
    const configSprite = CONFIG_SPRITES[boss.spriteId] || CONFIG_SPRITES.ananas;
    const indexFrame = Math.floor(tempsEcouleSecondes * boss.animationCadence) + boss.animationOffset;
    appliquerFrameSprite(element, boss, configSprite, indexFrame);
  }

  rendreBios(boucliersBio) {
    const idsBiosActifs = new Set();

    for (const bouclierBio of boucliersBio) {
      idsBiosActifs.add(bouclierBio.id);
      const element = this.elementsBios.get(bouclierBio.id) || this.creerElementBio(bouclierBio);
      appliquerBoite(element, bouclierBio);
      element.style.setProperty('--bio-integrite', String(bouclierBio.pointsDeVie));
      element.style.setProperty('--bio-integrite-max', String(bouclierBio.pointsDeVieMax));
      element.dataset.integrite = String(bouclierBio.pointsDeVie);
    }

    this.supprimerElementsAbsents(this.elementsBios, idsBiosActifs);
  }

  rendreProjectiles(projectiles, tempsEcouleSecondes) {
    const idsProjectilesActifs = new Set();

    for (const projectile of projectiles) {
      idsProjectilesActifs.add(projectile.id);
      const element =
        this.elementsProjectiles.get(projectile.id) || this.creerElementProjectile(projectile);
      appliquerBoite(element, projectile);
      if (projectile.teinte !== null) {
        element.style.setProperty('--shot-hue', String(projectile.teinte));
      } else {
        element.style.removeProperty('--shot-hue');
      }
      const indexFrame =
        projectile.proprietaire === 'joueur'
          ? Math.floor(tempsEcouleSecondes * 18) % 2
          : 2 + (Math.floor(tempsEcouleSecondes * 14) % 2);
      appliquerFrameSprite(element, projectile, CONFIG_SPRITES.bullet, indexFrame);
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
