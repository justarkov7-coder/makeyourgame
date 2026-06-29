import { CONFIG_JEU } from './config.js';

// activerAlienEnRenfort prepare un alien reserve.
function activerAlienEnRenfort(alien, indexRenfort) {
  const amplitudeVitesse = CONFIG_JEU.aliens.vitesseEntreeMaximum - CONFIG_JEU.aliens.vitesseEntreeMinimum;
  const ratioVitesse = ((alien.colonne * 13 + alien.ligne * 29 + indexRenfort * 17) % 100) / 100;
  const decalageHauteur = (alien.colonne * 31 + alien.ligne * 19 + indexRenfort * 23) % (CONFIG_JEU.aliens.hauteurEntreeAleatoire + 1);
  alien.x = alien.xFormation; alien.y = alien.yFormation - CONFIG_JEU.aliens.hauteurEntree - decalageHauteur;
  alien.enEntree = true; alien.vitesseEntree = CONFIG_JEU.aliens.vitesseEntreeMinimum + amplitudeVitesse * ratioVitesse;
}

// calculerDelaiRenfortAlien adapte le delai de renfort.
function calculerDelaiRenfortAlien(intensite) {
  const delai = CONFIG_JEU.aliens.delaiRenfortInitial - intensite * (CONFIG_JEU.aliens.delaiRenfortInitial - CONFIG_JEU.aliens.delaiRenfortMinimum);
  return Math.max(CONFIG_JEU.aliens.delaiRenfortMinimum, delai);
}

// calculerTailleRenfortAlien choisit combien d'aliens entreront.
function calculerTailleRenfortAlien(intensite) {
  if (intensite >= 0.82) return 3;
  if (intensite >= 0.46) return 2;
  return 1;
}

// deployerRenfortsAliens sort des aliens de la reserve.
function deployerRenfortsAliens(etat, intensite) {
  const tailleRenfort = Math.min(calculerTailleRenfortAlien(intensite), etat.aliensEnReserve.length);
  for (let index = 0; index < tailleRenfort; index += 1) {
    const alien = etat.aliensEnReserve.shift();
    activerAlienEnRenfort(alien, index);
    etat.aliens.push(alien);
  }
}

// mettreAJourEntreeAliens avance les aliens qui entrent en jeu.
function mettreAJourEntreeAliens(etat, deltaSecondes) {
  for (const alien of etat.aliens) {
    if (!alien.enEntree) continue;
    alien.y = Math.min(alien.yFormation, alien.y + alien.vitesseEntree * deltaSecondes);
    if (alien.y >= alien.yFormation) { alien.y = alien.yFormation; alien.enEntree = false; alien.vitesseEntree = 0; }
  }
}

// mettreAJourRenfortsAliens gere les arrivees progressives.
export function mettreAJourRenfortsAliens(etat, deltaSecondes, intensite) {
  if (etat.aliensEnReserve.length !== 0) {
    etat.delaiRenfortAlien = Math.max(0, etat.delaiRenfortAlien - deltaSecondes);
    if (etat.delaiRenfortAlien === 0) {
      deployerRenfortsAliens(etat, intensite);
      etat.delaiRenfortAlien = calculerDelaiRenfortAlien(intensite);
    }
  }
  mettreAJourEntreeAliens(etat, deltaSecondes);
}
