import { RenduCarte } from './RenduCarte.js';
import { CONFIG_JEU } from '../game/config.js';
import { creerElementJoueur } from './renduCreationEntites.js';
import { rendreAliens, rendreBios, rendreBoss, rendreJoueur, rendreProjectiles } from './renduEntites.js';

export class RenduDom {
  // constructor explique une etape dediee du module.
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
    this.elementJoueur = creerElementJoueur();
    this.monde.style.width = `${this.largeurMonde}px`;
    this.monde.style.height = `${this.hauteurMonde}px`;
    this.coucheEntites.innerHTML = '';
    this.coucheEntites.append(this.elementJoueur);
    this.mettreEnPageMonde = this.mettreEnPageMonde.bind(this);
    this.mettreEnPageMonde();
    window.addEventListener('resize', this.mettreEnPageMonde);
  }

  // mettreEnPageMonde explique une etape dediee du module.
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

  // rendre explique une etape dediee du module.
  rendre(etat) {
    this.renduCarte.rendre(etat.carte);
    rendreJoueur(this, etat.joueur);
    rendreBios(this, etat.boucliersBio);
    rendreAliens(this, etat.aliens, etat.tempsEcouleSecondes);
    rendreBoss(this, etat.boss, etat.tempsEcouleSecondes);
    rendreProjectiles(this, etat.projectiles, etat.tempsEcouleSecondes);
  }
}
