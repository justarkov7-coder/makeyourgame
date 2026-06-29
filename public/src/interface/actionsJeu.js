import { CONFIG_JEU } from '../game/config.js';
import { creerEtatInitial } from '../game/createState.js';
import { declencherBonusBossTest, reprendreApresBonusBoss, revelerBonusBoss } from '../game/updateGame.js';

// Remplace l'etat courant par un etat neuf.
function reinitialiserEtat(etatRef, idCarte) {
  etatRef.valeur = creerEtatInitial(idCarte);
}

// Construit la charge attendue par l'API de classement.
function construireChargeUtileScore(etat, nom) {
  return { name: nom, score: etat.score, timeSeconds: Math.round(etat.tempsEcouleSecondes) };
}

// Memorise le resume renvoye apres une soumission de score.
function appliquerResumeSoumission(etat, nom, resultatApi) {
  etat.classement.resumeSoumission = resultatApi.entry;
  etat.classement.message = '';
  etat.classement.erreur = '';
  etat.classement.page = 1;
  etat.classement.totalPages = resultatApi.totalPages;
  etat.classement.resumeSoumission.name = nom;
  etat.classement.resumeSoumission.percentile = resultatApi.percentile;
}

// Soumet le score final puis affiche le classement.
async function soumettreScore(etatRef, serviceClassement, nom) {
  const etat = etatRef.valeur;
  if (!nom) {
    etat.classement.erreur = 'Entre un nom avant envoi.';
    etat.classement.message = '';
    return;
  }
  try {
    etat.classement.chargement = true;
    etat.classement.message = 'Envoi du score en cours...';
    etat.classement.erreur = '';
    const resultat = await serviceClassement.envoyerScore(construireChargeUtileScore(etat, nom));
    appliquerResumeSoumission(etat, nom, resultat);
    etat.phase = 'classement';
    await chargerPageClassement(etatRef, serviceClassement, 1);
  } catch (erreur) {
    etat.classement.erreur = erreur.message;
    etat.classement.message = '';
  } finally {
    etat.classement.chargement = false;
  }
}

// Applique la page de classement recue depuis l'API.
function appliquerPageClassement(etat, resultat) {
  etat.classement.page = resultat.page;
  etat.classement.totalPages = resultat.totalPages;
  etat.classement.scores = resultat.scores;
}

// Charge une page de classement avec une borne basse.
export async function chargerPageClassement(etatRef, serviceClassement, page) {
  const etat = etatRef.valeur;
  const pageValide = Math.max(1, page);
  try {
    const resultat = await serviceClassement.chargerPage(pageValide, CONFIG_JEU.classement.pageSize);
    appliquerPageClassement(etat, resultat);
  } catch (erreur) {
    etat.classement.erreur = erreur.message;
  }
}

// Regroupe toutes les actions appelees par l'interface.
export function creerActionsJeu(etatRef, serviceClassement) {
  return {
    choisirCarte(idCarte) { reinitialiserEtat(etatRef, idCarte); },
    demarrer() { if (etatRef.valeur.phase === 'intro') etatRef.valeur.phase = 'running'; },
    redemarrer() { reinitialiserEtat(etatRef, etatRef.valeur.carte.id); },
    reprendre() { if (etatRef.valeur.phase === 'paused') etatRef.valeur.phase = 'running'; },
    continuerContextuel() {
      if (etatRef.valeur.phase === 'paused') { etatRef.valeur.phase = 'running'; return; }
      if (etatRef.valeur.phase === 'bonus-boss') reprendreApresBonusBoss(etatRef.valeur);
    },
    basculerPause() {
      if (etatRef.valeur.phase === 'running') { etatRef.valeur.phase = 'paused'; return; }
      if (etatRef.valeur.phase === 'paused') etatRef.valeur.phase = 'running';
    },
    mettreEnPauseSiActif() { if (etatRef.valeur.phase === 'running') etatRef.valeur.phase = 'paused'; },
    revelerBonusBoss() { revelerBonusBoss(etatRef.valeur); },
    declencherBonusBossTest() { declencherBonusBossTest(etatRef.valeur); },
    async soumettreScore(nom) { await soumettreScore(etatRef, serviceClassement, nom); },
    async pagePrecedente() { await chargerPageClassement(etatRef, serviceClassement, etatRef.valeur.classement.page - 1); },
    async pageSuivante() { await chargerPageClassement(etatRef, serviceClassement, etatRef.valeur.classement.page + 1); },
  };
}
