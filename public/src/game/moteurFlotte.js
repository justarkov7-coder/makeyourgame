import { CONFIG_JEU } from './config.js';
import { borner, compterAliensRestants, infligerDegatAuJoueur } from './moteurCommun.js';

// calculerBordsAliens mesure les limites de la flotte.
export function calculerBordsAliens(aliens) {
  let minimumX = Infinity, maximumX = -Infinity, maximumY = -Infinity;
  for (const alien of aliens) {
    minimumX = Math.min(minimumX, alien.x);
    maximumX = Math.max(maximumX, alien.x + alien.largeur);
    maximumY = Math.max(maximumY, alien.y + alien.hauteur);
  }
  return { minimumX, maximumX, maximumY };
}

// calculerIntensiteInvasion mesure la pression de la manche.
export function calculerIntensiteInvasion(etat) {
  const totalAliens = CONFIG_JEU.aliens.lignes * CONFIG_JEU.aliens.colonnes;
  const ratioDeploiement = (totalAliens - etat.aliensEnReserve.length) / totalAliens;
  const ratioDestruction = 1 - compterAliensRestants(etat) / totalAliens;
  const ratioTemps = borner(etat.tempsEcouleSecondes / (CONFIG_JEU.dureeMancheSecondes * 0.72), 0, 1);
  return borner(ratioDeploiement * 0.55 + ratioDestruction * 0.2 + ratioTemps * 0.45, 0, 1);
}

// deplacerAliensHorizontalement avance la flotte sur l'axe x.
export function deplacerAliensHorizontalement(etat, deltaSecondes, intensite) {
  const totalAliens = CONFIG_JEU.aliens.lignes * CONFIG_JEU.aliens.colonnes;
  const aliensRestants = compterAliensRestants(etat);
  const bonusVitesse = (totalAliens - aliensRestants) * CONFIG_JEU.aliens.bonusVitesseParAlienDetruit;
  const bonusTemps = etat.tempsEcouleSecondes * CONFIG_JEU.aliens.accelerationTempsParSeconde;
  const ratioSurvivants = aliensRestants / totalAliens;
  const ratioDeploiement = etat.aliens.length / totalAliens;
  const modulation = 0.42 + ratioDeploiement * 0.34 + intensite * 0.46 + (1 - ratioSurvivants) * 0.18 + 0.05 * Math.sin(etat.tempsEcouleSecondes * 1.35);
  const vitesseHorizontale = (etat.vitesseAliens + bonusVitesse + bonusTemps) * modulation * etat.directionAliens;
  for (const alien of etat.aliens) alien.x += vitesseHorizontale * deltaSecondes;
}

// retirerOffsetsCompression annule la deformation de frame precedente.
export function retirerOffsetsCompression(aliens) {
  for (const alien of aliens) {
    alien.x -= alien.offsetCompressionX; alien.y -= alien.offsetCompressionY;
    alien.offsetCompressionX = 0; alien.offsetCompressionY = 0;
  }
}

// appliquerOffsetsCompression ajoute une deformation organique.
export function appliquerOffsetsCompression(etat) {
  const totalAliens = CONFIG_JEU.aliens.lignes * CONFIG_JEU.aliens.colonnes;
  const pressionVague = 1 - compterAliensRestants(etat) / totalAliens;
  const intensite = Math.min(CONFIG_JEU.aliens.amplitudeCompressionMax, CONFIG_JEU.aliens.amplitudeCompressionBase + etat.tempsEcouleSecondes / 28 + pressionVague * 0.75);
  for (const alien of etat.aliens) {
    alien.offsetCompressionX = Math.sin(etat.tempsEcouleSecondes * 1.2 + alien.phaseCompression) * alien.amplitudeCompressionX * intensite;
    alien.offsetCompressionY = Math.cos(etat.tempsEcouleSecondes * 0.9 + alien.phaseCompression * 1.3) * alien.amplitudeCompressionY * intensite;
    alien.x += alien.offsetCompressionX; alien.y += alien.offsetCompressionY;
  }
}

// doitInverserFlotte verifie les rebonds lateraux.
export function doitInverserFlotte(bords) {
  return bords.maximumX >= CONFIG_JEU.largeur - 12 || bords.minimumX <= 12;
}

// faireDescendreFlotte inverse et descend la flotte.
export function faireDescendreFlotte(etat) {
  etat.directionAliens *= -1;
  for (const alien of etat.aliens) {
    alien.x = borner(alien.x, 12, CONFIG_JEU.largeur - alien.largeur - 12);
    alien.y += CONFIG_JEU.aliens.descenteParRebond;
    alien.yFormation += CONFIG_JEU.aliens.descenteParRebond;
  }
}

// verifierDefaiteParDescente punit une flotte descendue trop bas.
export function verifierDefaiteParDescente(etat, bords) {
  if (bords.maximumY < CONFIG_JEU.hauteur) return;
  infligerDegatAuJoueur(etat);
  const decalageVertical = Math.max(0, bords.maximumY - (CONFIG_JEU.hauteur - 128));
  for (const alien of etat.aliens) { alien.y -= decalageVertical; alien.yFormation -= decalageVertical; }
}
