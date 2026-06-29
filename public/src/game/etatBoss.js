import { CONFIG_JEU } from './config.js';
import { SPRITES_ALIENS } from './etatAliens.js';

// Choisit le sprite du boss parmi les sprites aliens.
function choisirSpriteBossAleatoire() {
  const index = Math.floor(Math.random() * SPRITES_ALIENS.length);
  return SPRITES_ALIENS[index];
}

// Cree le boss courant avec une difficulte progressive.
export function creerBoss(nombreBossVaincus = 0) {
  const multiplicateurTaille = CONFIG_JEU.boss.multiplicateurTaille;
  const largeur = CONFIG_JEU.aliens.largeur * multiplicateurTaille;
  const hauteur = CONFIG_JEU.aliens.hauteur * multiplicateurTaille;
  const pointsDeVieMax = CONFIG_JEU.boss.pointsDeVieBase + nombreBossVaincus * CONFIG_JEU.boss.pointsDeVieParBoss;
  return {
    id: `boss-${nombreBossVaincus + 1}`, type: 'boss', spriteId: choisirSpriteBossAleatoire(),
    animationOffset: nombreBossVaincus % 7, animationCadence: 5 + (nombreBossVaincus % 3),
    largeur, hauteur, x: CONFIG_JEU.largeur / 2 - largeur / 2, y: CONFIG_JEU.boss.yDepart,
    vitesseHorizontale: CONFIG_JEU.boss.vitesseHorizontaleBase + nombreBossVaincus * CONFIG_JEU.boss.vitesseHorizontaleParBoss,
    vitesseVerticale: CONFIG_JEU.boss.vitesseVerticaleBase + nombreBossVaincus * CONFIG_JEU.boss.vitesseVerticaleParBoss,
    directionHorizontale: nombreBossVaincus % 2 === 0 ? 1 : -1,
    directionVerticale: nombreBossVaincus % 2 === 0 ? 1 : -1,
    delaiSalve: 0.8, angleSalve: nombreBossVaincus * 0.37,
    pointsDeVie: pointsDeVieMax, pointsDeVieMax,
    pointsBonus: CONFIG_JEU.boss.pointsBonus + nombreBossVaincus * 50,
  };
}
