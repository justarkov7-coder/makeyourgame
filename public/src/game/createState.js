import { CONFIG_JEU } from './config.js';
import { recupererCarte } from './cartes.js';
import { formaterTemps } from '../utils/temps.js';

export const SPRITES_ALIENS = [
  'ananas',
  'mouche',
  'papillon',
  'pommefraise',
  'banane',
  'versdeterre',
];
const ID_TUILE_BIO = 5;

function calculerDecalageAlien(index, ligne, colonne) {
  const graineX = ((index * 17 + ligne * 7 + colonne * 13) % 19) - 9;
  const graineY = ((index * 11 + ligne * 5 + colonne * 3) % 13) - 6;

  return {
    x: graineX * 2,
    y: graineY * 2 + (colonne % 2 === 0 ? -4 : 4),
  };
}

function creerAlien(index, ligne, colonne) {
  const decalage = calculerDecalageAlien(index, ligne, colonne);
  const xFormation =
    CONFIG_JEU.aliens.departX +
    colonne * (CONFIG_JEU.aliens.largeur + CONFIG_JEU.aliens.ecartHorizontal) +
    decalage.x;
  const yFormation =
    CONFIG_JEU.aliens.departY +
    ligne * (CONFIG_JEU.aliens.hauteur + CONFIG_JEU.aliens.ecartVertical) +
    decalage.y;

  return {
    id: `alien-${index}`,
    type: `tier-${Math.min(3, ligne + 1)}`,
    spriteId: SPRITES_ALIENS[index % SPRITES_ALIENS.length],
    animationOffset: index % 7,
    animationCadence: 5 + (index % 4),
    phaseCompression: index * 0.53 + ligne * 0.91 + colonne * 0.37,
    amplitudeCompressionX: 6 + (index % 3) * 2,
    amplitudeCompressionY: 3 + (colonne % 3),
    offsetCompressionX: 0,
    offsetCompressionY: 0,
    ligne,
    colonne,
    largeur: CONFIG_JEU.aliens.largeur,
    hauteur: CONFIG_JEU.aliens.hauteur,
    xFormation,
    yFormation,
    x: xFormation,
    y: yFormation,
    enEntree: false,
    vitesseEntree: 0,
    points: (CONFIG_JEU.aliens.lignes - ligne) * 10,
  };
}

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

function ordonnerAliensPourEntree(aliens) {
  const centreColonne = (CONFIG_JEU.aliens.colonnes - 1) / 2;

  return [...aliens].sort((alienA, alienB) => {
    const distanceA = Math.abs(alienA.colonne - centreColonne);
    const distanceB = Math.abs(alienB.colonne - centreColonne);

    if (distanceA !== distanceB) {
      return distanceA - distanceB;
    }

    if (alienA.ligne !== alienB.ligne) {
      return alienA.ligne - alienB.ligne;
    }

    return alienA.colonne - alienB.colonne;
  });
}

function preparerAlienPourEntree(alien, indexActivation) {
  const amplitudeVitesse =
    CONFIG_JEU.aliens.vitesseEntreeMaximum - CONFIG_JEU.aliens.vitesseEntreeMinimum;
  const ratioVitesse = ((alien.ligne * 19 + alien.colonne * 11 + indexActivation * 7) % 100) / 100;
  const decalageHauteur =
    (alien.ligne * 37 + alien.colonne * 23 + indexActivation * 17) %
    (CONFIG_JEU.aliens.hauteurEntreeAleatoire + 1);

  alien.x = alien.xFormation;
  alien.y = alien.yFormation - CONFIG_JEU.aliens.hauteurEntree - decalageHauteur;
  alien.enEntree = true;
  alien.vitesseEntree = CONFIG_JEU.aliens.vitesseEntreeMinimum + amplitudeVitesse * ratioVitesse;
}

export function creerDeploiementAliens() {
  const ordreEntree = ordonnerAliensPourEntree(creerAliens());
  const aliensActifs = [];
  const aliensEnReserve = [];

  ordreEntree.forEach((alien, index) => {
    if (index < CONFIG_JEU.aliens.renfortsInitiaux) {
      preparerAlienPourEntree(alien, index);
      aliensActifs.push(alien);
      return;
    }

    aliensEnReserve.push(alien);
  });

  return {
    aliensActifs,
    aliensEnReserve,
  };
}

function choisirSpriteBossAleatoire() {
  const index = Math.floor(Math.random() * SPRITES_ALIENS.length);
  return SPRITES_ALIENS[index];
}

export function creerBoss(nombreBossVaincus = 0) {
  const multiplicateurTaille = CONFIG_JEU.boss.multiplicateurTaille;
  const largeur = CONFIG_JEU.aliens.largeur * multiplicateurTaille;
  const hauteur = CONFIG_JEU.aliens.hauteur * multiplicateurTaille;
  const pointsDeVieMax =
    CONFIG_JEU.boss.pointsDeVieBase + nombreBossVaincus * CONFIG_JEU.boss.pointsDeVieParBoss;

  return {
    id: `boss-${nombreBossVaincus + 1}`,
    type: 'boss',
    spriteId: choisirSpriteBossAleatoire(),
    animationOffset: nombreBossVaincus % 7,
    animationCadence: 5 + (nombreBossVaincus % 3),
    largeur,
    hauteur,
    x: CONFIG_JEU.largeur / 2 - largeur / 2,
    y: CONFIG_JEU.boss.yDepart,
    vitesseHorizontale:
      CONFIG_JEU.boss.vitesseHorizontaleBase +
      nombreBossVaincus * CONFIG_JEU.boss.vitesseHorizontaleParBoss,
    vitesseVerticale:
      CONFIG_JEU.boss.vitesseVerticaleBase +
      nombreBossVaincus * CONFIG_JEU.boss.vitesseVerticaleParBoss,
    directionHorizontale: nombreBossVaincus % 2 === 0 ? 1 : -1,
    directionVerticale: nombreBossVaincus % 2 === 0 ? 1 : -1,
    delaiSalve: 0.8,
    angleSalve: nombreBossVaincus * 0.37,
    pointsDeVie: pointsDeVieMax,
    pointsDeVieMax,
    pointsBonus: CONFIG_JEU.boss.pointsBonus + nombreBossVaincus * 50,
  };
}

function creerJoueurInitial() {
  return {
    x: CONFIG_JEU.largeur / 2 - CONFIG_JEU.joueur.largeur / 2,
    y: CONFIG_JEU.hauteur - CONFIG_JEU.joueur.hauteur - 28,
    largeur: CONFIG_JEU.joueur.largeur,
    hauteur: CONFIG_JEU.joueur.hauteur,
    margeCollisionX: CONFIG_JEU.joueur.margeCollisionX,
    margeCollisionY: CONFIG_JEU.joueur.margeCollisionY,
    vitesse: CONFIG_JEU.joueur.vitesse,
    delaiEntreTirs: CONFIG_JEU.joueur.delaiEntreTirs,
    dureeBouclierReapparition: CONFIG_JEU.joueur.dureeBouclierReapparition,
    delaiTir: 0,
    bouclierSecondes: 0,
    animationTirSecondes: 0,
    directionAnimation: 0,
  };
}

function creerBoucliersBio(carte) {
  const boucliers = [];

  for (let ligne = 0; ligne < carte.lignes; ligne += 1) {
    for (let colonne = 0; colonne < carte.colonnes; colonne += 1) {
      if (carte.getTile(colonne, ligne) !== ID_TUILE_BIO) {
        continue;
      }

      boucliers.push({
        id: `bio-${colonne}-${ligne}`,
        x: colonne * carte.tailleTuile + (carte.tailleTuile - CONFIG_JEU.bio.largeur) / 2,
        y: ligne * carte.tailleTuile + (carte.tailleTuile - CONFIG_JEU.bio.hauteur) / 2,
        largeur: CONFIG_JEU.bio.largeur,
        hauteur: CONFIG_JEU.bio.hauteur,
        pointsDeVie: CONFIG_JEU.bio.pointsDeVie,
        pointsDeVieMax: CONFIG_JEU.bio.pointsDeVie,
      });
    }
  }

  return boucliers;
}

function creerClassementInitial() {
  return {
    message: '',
    erreur: '',
    chargement: false,
    page: 1,
    totalPages: 1,
    scores: [],
    resumeSoumission: null,
  };
}

function creerBonusBossInitial() {
  return {
    sequence: 0,
    bonusId: '',
    reelsFinaux: [],
    occurrencesGagnantes: 0,
    dureeSecondes: 0,
    estRevele: false,
    estApplique: false,
  };
}

function creerBonusActifInitial() {
  return {
    bonusId: '',
    titre: '',
    symbole: '',
    tempsRestantSecondes: 0,
    dureeSecondes: 0,
    occurrencesGagnantes: 0,
  };
}

export function creerEtatInitial(idCarte = CONFIG_JEU.cartes.idParDefaut) {
  const tempsRestantSecondes = 0;
  const carte = recupererCarte(idCarte);
  const { aliensActifs, aliensEnReserve } = creerDeploiementAliens();

  return {
    phase: 'intro',
    resultat: null,
    score: 0,
    vies: CONFIG_JEU.viesInitiales,
    tempsRestantSecondes,
    tempsRestantFormate: formaterTemps(tempsRestantSecondes),
    tempsEcouleSecondes: 0,
    prochainIdProjectile: 0,
    directionAliens: 1,
    vitesseAliens: CONFIG_JEU.aliens.vitesseBase,
    delaiTirAlien: 0.8,
    delaiRenfortAlien: CONFIG_JEU.aliens.delaiRenfortInitial,
    bossDoitApparaitre: false,
    prochainPalierBoss: CONFIG_JEU.boss.palierScore,
    boss: null,
    bossesVaincus: 0,
    joueur: creerJoueurInitial(),
    projectiles: [],
    aliens: aliensActifs,
    aliensEnReserve,
    boucliersBio: creerBoucliersBio(carte),
    bonusBoss: creerBonusBossInitial(),
    bonusActif: creerBonusActifInitial(),
    carte,
    classement: creerClassementInitial(),
  };
}
