import { CONFIG_JEU } from './config.js';

export const SPRITES_ALIENS = [
  'ananas',
  'mouche',
  'papillon',
  'pommefraise',
  'banane',
  'versdeterre',
];

// Calcule un leger decalage pour eviter une flotte trop rigide.
function calculerDecalageAlien(index, ligne, colonne) {
  const graineX = ((index * 17 + ligne * 7 + colonne * 13) % 19) - 9;
  const graineY = ((index * 11 + ligne * 5 + colonne * 3) % 13) - 6;
  return { x: graineX * 2, y: graineY * 2 + (colonne % 2 === 0 ? -4 : 4) };
}

// Cree une entite alien avec sa position de formation.
function creerAlien(index, ligne, colonne) {
  const decalage = calculerDecalageAlien(index, ligne, colonne);
  const xFormation = CONFIG_JEU.aliens.departX + colonne * (CONFIG_JEU.aliens.largeur + CONFIG_JEU.aliens.ecartHorizontal) + decalage.x;
  const yFormation = CONFIG_JEU.aliens.departY + ligne * (CONFIG_JEU.aliens.hauteur + CONFIG_JEU.aliens.ecartVertical) + decalage.y;
  return {
    id: `alien-${index}`, type: `tier-${Math.min(3, ligne + 1)}`,
    spriteId: SPRITES_ALIENS[index % SPRITES_ALIENS.length], animationOffset: index % 7,
    animationCadence: 5 + (index % 4), phaseCompression: index * 0.53 + ligne * 0.91 + colonne * 0.37,
    amplitudeCompressionX: 6 + (index % 3) * 2, amplitudeCompressionY: 3 + (colonne % 3),
    offsetCompressionX: 0, offsetCompressionY: 0, ligne, colonne,
    largeur: CONFIG_JEU.aliens.largeur, hauteur: CONFIG_JEU.aliens.hauteur,
    xFormation, yFormation, x: xFormation, y: yFormation, enEntree: false, vitesseEntree: 0,
    points: (CONFIG_JEU.aliens.lignes - ligne) * 10,
  };
}

// Cree la grille complete des aliens de la manche.
function creerAliens() {
  const aliens = [];
  let index = 0;
  for (let ligne = 0; ligne < CONFIG_JEU.aliens.lignes; ligne += 1) {
    for (let colonne = 0; colonne < CONFIG_JEU.aliens.colonnes; colonne += 1) {
      aliens.push(creerAlien(index, ligne, colonne));
      index += 1;
    }
  }
  return aliens;
}

// Trie les aliens selon leur ordre d'arrivee en renfort.
function ordonnerAliensPourEntree(aliens) {
  const centreColonne = (CONFIG_JEU.aliens.colonnes - 1) / 2;
  return [...aliens].sort(function comparerAliensPourEntree(alienA, alienB) {
    const distanceA = Math.abs(alienA.colonne - centreColonne);
    const distanceB = Math.abs(alienB.colonne - centreColonne);
    if (distanceA !== distanceB) return distanceA - distanceB;
    if (alienA.ligne !== alienB.ligne) return alienA.ligne - alienB.ligne;
    return alienA.colonne - alienB.colonne;
  });
}

// Place un alien hors ecran avant son entree animee.
function preparerAlienPourEntree(alien, indexActivation) {
  const amplitudeVitesse = CONFIG_JEU.aliens.vitesseEntreeMaximum - CONFIG_JEU.aliens.vitesseEntreeMinimum;
  const ratioVitesse = ((alien.ligne * 19 + alien.colonne * 11 + indexActivation * 7) % 100) / 100;
  const decalageHauteur = (alien.ligne * 37 + alien.colonne * 23 + indexActivation * 17) % (CONFIG_JEU.aliens.hauteurEntreeAleatoire + 1);
  alien.x = alien.xFormation;
  alien.y = alien.yFormation - CONFIG_JEU.aliens.hauteurEntree - decalageHauteur;
  alien.enEntree = true;
  alien.vitesseEntree = CONFIG_JEU.aliens.vitesseEntreeMinimum + amplitudeVitesse * ratioVitesse;
}

// Separe les aliens actifs des aliens gardes en reserve.
export function creerDeploiementAliens() {
  const ordreEntree = ordonnerAliensPourEntree(creerAliens());
  const aliensActifs = [];
  const aliensEnReserve = [];
  for (let index = 0; index < ordreEntree.length; index += 1) {
    const alien = ordreEntree[index];
    if (index < CONFIG_JEU.aliens.renfortsInitiaux) {
      preparerAlienPourEntree(alien, index);
      aliensActifs.push(alien);
      continue;
    }
    aliensEnReserve.push(alien);
  }
  return { aliensActifs, aliensEnReserve };
}
