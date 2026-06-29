import { CONFIG_JEU } from './config.js';
import { borner, creerProjectile } from './moteurCommun.js';

// calculerDelaiSalveBoss ajuste le delai selon la vie du boss.
function calculerDelaiSalveBoss(boss) {
  const ratioVie = boss.pointsDeVie / boss.pointsDeVieMax;
  const delai = CONFIG_JEU.boss.delaiEntreSalvesMinimum + (CONFIG_JEU.boss.delaiEntreSalves - CONFIG_JEU.boss.delaiEntreSalvesMinimum) * ratioVie;
  return Math.max(CONFIG_JEU.boss.delaiEntreSalvesMinimum, delai);
}

// calculerNombreProjectilesBoss augmente la salve avec les degats.
function calculerNombreProjectilesBoss(boss) {
  const ratioDegats = 1 - boss.pointsDeVie / boss.pointsDeVieMax;
  const nombre = CONFIG_JEU.boss.projectilesParSalve + Math.round(ratioDegats * (CONFIG_JEU.boss.projectilesParSalveMaximum - CONFIG_JEU.boss.projectilesParSalve));
  return Math.min(CONFIG_JEU.boss.projectilesParSalveMaximum, nombre);
}

// faireTirerBoss emet une salve circulaire.
function faireTirerBoss(etat) {
  const boss = etat.boss;
  if (!boss) return;
  const centreX = boss.x + boss.largeur / 2;
  const centreY = boss.y + boss.hauteur / 2;
  const nombreProjectiles = calculerNombreProjectilesBoss(boss);
  const amplitudeVitesse = CONFIG_JEU.boss.vitesseProjectileMaximum - CONFIG_JEU.boss.vitesseProjectileMinimum;
  const jitter = Math.sin(etat.tempsEcouleSecondes * 1.7 + boss.angleSalve) * 0.18;
  for (let index = 0; index < nombreProjectiles; index += 1) {
    const ratio = index / nombreProjectiles;
    const angle = boss.angleSalve + ratio * Math.PI * 2 + jitter;
    const vitesse = CONFIG_JEU.boss.vitesseProjectileMinimum + amplitudeVitesse * ((index % 5) / 4);
    creerProjectile(etat, 'alien', centreX + Math.cos(angle) * boss.largeur * 0.46 - CONFIG_JEU.projectiles.largeur / 2, centreY + Math.sin(angle) * boss.hauteur * 0.46 - CONFIG_JEU.projectiles.hauteur / 2, Math.sin(angle) * vitesse, {
      vitesseHorizontale: Math.cos(angle) * vitesse, styleTir: 'boss',
      teinte: (Math.round((boss.angleSalve * 180) / Math.PI) + index * 27) % 360,
      margeCollisionX: 13, margeCollisionY: 15,
    });
  }
  boss.angleSalve += 0.43;
}

// mettreAJourBoss deplace le boss et gere ses tirs.
export function mettreAJourBoss(etat, deltaSecondes) {
  const boss = etat.boss;
  if (!boss) return;
  boss.x += boss.vitesseHorizontale * boss.directionHorizontale * deltaSecondes;
  boss.y += boss.vitesseVerticale * boss.directionVerticale * deltaSecondes;
  const marge = CONFIG_JEU.boss.margeDeplacement;
  const limiteXMax = CONFIG_JEU.largeur - boss.largeur - marge;
  const limiteYMax = Math.min(CONFIG_JEU.boss.hauteurPatrouilleMaximum, CONFIG_JEU.hauteur - boss.hauteur - CONFIG_JEU.boss.margeBasInterdite);
  if (boss.x <= marge || boss.x >= limiteXMax) { boss.directionHorizontale *= -1; boss.x = borner(boss.x, marge, limiteXMax); }
  if (boss.y <= CONFIG_JEU.boss.yDepart || boss.y >= limiteYMax) { boss.directionVerticale *= -1; boss.y = borner(boss.y, CONFIG_JEU.boss.yDepart, limiteYMax); }
  boss.delaiSalve = Math.max(0, boss.delaiSalve - deltaSecondes);
  if (boss.delaiSalve === 0) { faireTirerBoss(etat); boss.delaiSalve = calculerDelaiSalveBoss(boss); }
}
