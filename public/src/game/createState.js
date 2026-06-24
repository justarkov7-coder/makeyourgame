import { CONFIG_JEU } from './config.js';
import { recupererCarte } from './cartes.js';
import { formaterTemps } from '../utils/temps.js';

function creerAlien(index, ligne, colonne) {
  return {
    id: `alien-${index}`,
    type: `tier-${Math.min(3, ligne + 1)}`,
    ligne,
    colonne,
    largeur: CONFIG_JEU.aliens.largeur,
    hauteur: CONFIG_JEU.aliens.hauteur,
    x:
      CONFIG_JEU.aliens.departX +
      colonne * (CONFIG_JEU.aliens.largeur + CONFIG_JEU.aliens.ecartHorizontal),
    y:
      CONFIG_JEU.aliens.departY +
      ligne * (CONFIG_JEU.aliens.hauteur + CONFIG_JEU.aliens.ecartVertical),
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

function creerJoueurInitial() {
  return {
    x: CONFIG_JEU.largeur / 2 - CONFIG_JEU.joueur.largeur / 2,
    y: CONFIG_JEU.hauteur - CONFIG_JEU.joueur.hauteur - 28,
    largeur: CONFIG_JEU.joueur.largeur,
    hauteur: CONFIG_JEU.joueur.hauteur,
    delaiTir: 0,
    bouclierSecondes: 0,
  };
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

function creerHistoireInitiale() {
  return {
    palierDeclenche: false,
  };
}

export function creerEtatInitial(idCarte = CONFIG_JEU.cartes.idParDefaut) {
  const tempsRestantSecondes = CONFIG_JEU.dureeMancheSecondes;

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
    delaiTirAlien: 0.3,
    joueur: creerJoueurInitial(),
    projectiles: [],
    aliens: creerAliens(),
    carte: recupererCarte(idCarte),
    histoire: creerHistoireInitiale(),
    classement: creerClassementInitial(),
  };
}
