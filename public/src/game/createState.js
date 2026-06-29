import { CONFIG_JEU } from './config.js';
import { recupererCarte } from './cartes.js';
import { creerDeploiementAliens } from './etatAliens.js';
import { formaterTemps } from '../utils/temps.js';

const ID_TUILE_BIO = 5;

// creerJoueurInitial explique une etape dediee du module.
function creerJoueurInitial() {
  return {
    x: CONFIG_JEU.largeur / 2 - CONFIG_JEU.joueur.largeur / 2, y: CONFIG_JEU.hauteur - CONFIG_JEU.joueur.hauteur - 28,
    largeur: CONFIG_JEU.joueur.largeur, hauteur: CONFIG_JEU.joueur.hauteur,
    margeCollisionX: CONFIG_JEU.joueur.margeCollisionX, margeCollisionY: CONFIG_JEU.joueur.margeCollisionY,
    vitesse: CONFIG_JEU.joueur.vitesse, delaiEntreTirs: CONFIG_JEU.joueur.delaiEntreTirs,
    dureeBouclierReapparition: CONFIG_JEU.joueur.dureeBouclierReapparition,
    delaiTir: 0, bouclierSecondes: 0, animationTirSecondes: 0, directionAnimation: 0,
  };
}

// creerBoucliersBio explique une etape dediee du module.
function creerBoucliersBio(carte) {
  const boucliers = [];

  for (let ligne = 0; ligne < carte.lignes; ligne += 1) {
    for (let colonne = 0; colonne < carte.colonnes; colonne += 1) {
      if (carte.getTile(colonne, ligne) !== ID_TUILE_BIO) {
        continue;
      }

      boucliers.push({
        id: `bio-${colonne}-${ligne}`, x: colonne * carte.tailleTuile + (carte.tailleTuile - CONFIG_JEU.bio.largeur) / 2,
        y: ligne * carte.tailleTuile + (carte.tailleTuile - CONFIG_JEU.bio.hauteur) / 2,
        largeur: CONFIG_JEU.bio.largeur, hauteur: CONFIG_JEU.bio.hauteur,
        pointsDeVie: CONFIG_JEU.bio.pointsDeVie, pointsDeVieMax: CONFIG_JEU.bio.pointsDeVie,
      });
    }
  }

  return boucliers;
}

// creerClassementInitial explique une etape dediee du module.
function creerClassementInitial() {
  return {
    message: '', erreur: '', chargement: false, page: 1, totalPages: 1, scores: [], resumeSoumission: null,
  };
}

// creerBonusBossInitial explique une etape dediee du module.
function creerBonusBossInitial() {
  return {
    sequence: 0, bonusId: '', reelsFinaux: [], occurrencesGagnantes: 0,
    dureeSecondes: 0, estRevele: false, estApplique: false,
  };
}

// creerBonusActifInitial explique une etape dediee du module.
function creerBonusActifInitial() {
  return {
    bonusId: '', titre: '', symbole: '', tempsRestantSecondes: 0, dureeSecondes: 0, occurrencesGagnantes: 0,
  };
}

// creerEtatInitial explique une etape dediee du module.
export function creerEtatInitial(idCarte = CONFIG_JEU.cartes.idParDefaut) {
  const tempsRestantSecondes = 0;
  const carte = recupererCarte(idCarte);
  const { aliensActifs, aliensEnReserve } = creerDeploiementAliens();

  return {
    phase: 'intro', resultat: null, score: 0, vies: CONFIG_JEU.viesInitiales,
    tempsRestantSecondes, tempsRestantFormate: formaterTemps(tempsRestantSecondes), tempsEcouleSecondes: 0,
    prochainIdProjectile: 0, directionAliens: 1, vitesseAliens: CONFIG_JEU.aliens.vitesseBase,
    delaiTirAlien: 0.8, delaiRenfortAlien: CONFIG_JEU.aliens.delaiRenfortInitial,
    bossDoitApparaitre: false, prochainPalierBoss: CONFIG_JEU.boss.palierScore,
    boss: null, bossesVaincus: 0, joueur: creerJoueurInitial(), projectiles: [],
    aliens: aliensActifs, aliensEnReserve, boucliersBio: creerBoucliersBio(carte),
    bonusBoss: creerBonusBossInitial(), bonusActif: creerBonusActifInitial(), carte, classement: creerClassementInitial(),
  };
}
