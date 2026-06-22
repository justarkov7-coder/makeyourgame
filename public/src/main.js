import { BoucleDeJeu } from './core/GameLoop.js';
import { GestionnaireEntrees } from './core/InputManager.js';
import { MoniteurPerformance } from './core/PerfMonitor.js';
import { CONFIG_JEU } from './game/config.js';
import { LISTE_CARTES } from './game/cartes.js';
import { creerEtatInitial } from './game/createState.js';
import { mettreAJourJeu } from './game/updateGame.js';
import { RenduDom } from './render/DomRenderer.js';
import { ServiceClassement } from './services/ServiceClassement.js';
import { ControleurHud } from './ui/HudController.js';
import { ControleurSuperposition } from './ui/ControleurSuperposition.js';

function recupererElementsInterface() {
  return {
    scene: document.getElementById('game-scene'),
    monde: document.getElementById('game-world'),
    coucheCarte: document.getElementById('tile-layer'),
    coucheEntites: document.getElementById('entity-layer'),
    superposition: document.getElementById('overlay'),
    tagSuperposition: document.getElementById('overlay-tag'),
    titreSuperposition: document.getElementById('overlay-title'),
    texteSuperposition: document.getElementById('overlay-text'),
    boutonDemarrer: document.getElementById('start-button'),
    boutonContinuer: document.getElementById('continue-button'),
    boutonRecommencer: document.getElementById('restart-button'),
    panneauCartes: document.getElementById('map-panel'),
    optionsCartes: document.getElementById('map-options'),
    resumePanel: document.getElementById('resume-panel'),
    formulaireScore: document.getElementById('score-form'),
    inputNom: document.getElementById('player-name'),
    boutonSoumettre: document.getElementById('submit-score-button'),
    scoreFormMessage: document.getElementById('score-form-message'),
    panneauClassement: document.getElementById('ranking-panel'),
    rankingFeedback: document.getElementById('ranking-feedback'),
    rankingRows: document.getElementById('ranking-rows'),
    pageIndicator: document.getElementById('page-indicator'),
    boutonPagePrecedente: document.getElementById('page-prev'),
    boutonPageSuivante: document.getElementById('page-next'),
    hudTimer: document.getElementById('hud-timer'),
    hudScore: document.getElementById('hud-score'),
    hudLives: document.getElementById('hud-lives'),
    hudFps: document.getElementById('hud-fps'),
    menuTemps: document.getElementById('menu-timer'),
    menuScore: document.getElementById('menu-score'),
    menuVies: document.getElementById('menu-lives'),
    menuFps: document.getElementById('menu-fps'),
  };
}

function creerDependances(elements) {
  return {
    rendu: new RenduDom({
      scene: elements.scene,
      monde: elements.monde,
      coucheCarte: elements.coucheCarte,
      coucheEntites: elements.coucheEntites,
    }),
    hud: new ControleurHud(elements),
    superposition: new ControleurSuperposition(elements, LISTE_CARTES),
    entrees: new GestionnaireEntrees(),
    performances: new MoniteurPerformance(),
    serviceClassement: new ServiceClassement(),
  };
}

function reinitialiserEtat(etatRef, idCarte) {
  etatRef.valeur = creerEtatInitial(idCarte);
}

function creerActionsJeu(etatRef, serviceClassement) {
  return {
    choisirCarte(idCarte) {
      reinitialiserEtat(etatRef, idCarte);
    },
    demarrer() {
      if (etatRef.valeur.phase === 'intro') {
        etatRef.valeur.phase = 'running';
      }
    },
    redemarrer() {
      reinitialiserEtat(etatRef, etatRef.valeur.carte.id);
    },
    reprendre() {
      if (etatRef.valeur.phase === 'paused' || etatRef.valeur.phase === 'checkpoint') {
        etatRef.valeur.phase = 'running';
      }
    },
    basculerPause() {
      if (etatRef.valeur.phase === 'running') {
        etatRef.valeur.phase = 'paused';
        return;
      }

      if (etatRef.valeur.phase === 'paused') {
        etatRef.valeur.phase = 'running';
      }
    },
    mettreEnPauseSiActif() {
      if (etatRef.valeur.phase === 'running') {
        etatRef.valeur.phase = 'paused';
      }
    },
    async soumettreScore(nom) {
      await soumettreScore(etatRef, serviceClassement, nom);
    },
    async pagePrecedente() {
      await chargerPageClassement(etatRef, serviceClassement, etatRef.valeur.classement.page - 1);
    },
    async pageSuivante() {
      await chargerPageClassement(etatRef, serviceClassement, etatRef.valeur.classement.page + 1);
    },
  };
}

function construireChargeUtlieScore(etat, nom) {
  return {
    name: nom,
    score: etat.score,
    timeSeconds: Math.round(etat.tempsEcouleSecondes),
  };
}

function appliquerResumeSoumission(etat, nom, resultatApi) {
  etat.classement.resumeSoumission = resultatApi.entry;
  etat.classement.message = '';
  etat.classement.erreur = '';
  etat.classement.page = 1;
  etat.classement.totalPages = resultatApi.totalPages;
  etat.classement.resumeSoumission.name = nom;
  etat.classement.resumeSoumission.percentile = resultatApi.percentile;
}

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
    const resultat = await serviceClassement.envoyerScore(construireChargeUtlieScore(etat, nom));
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

function appliquerPageClassement(etat, resultat) {
  etat.classement.page = resultat.page;
  etat.classement.totalPages = resultat.totalPages;
  etat.classement.scores = resultat.scores;
}

async function chargerPageClassement(etatRef, serviceClassement, page) {
  const etat = etatRef.valeur;
  const pageValide = Math.max(1, page);

  try {
    const resultat = await serviceClassement.chargerPage(pageValide, CONFIG_JEU.classement.pageSize);
    appliquerPageClassement(etat, resultat);
  } catch (erreur) {
    etat.classement.erreur = erreur.message;
  }
}

function brancherRaccourcisClavier(entrees, actions) {
  entrees.surAppui('Escape', actions.basculerPause);
  entrees.surAppui('KeyP', actions.basculerPause);
  entrees.surAppui('KeyR', actions.redemarrer);
  entrees.attacher();
}

function brancherBoutons(elements, superposition, actions) {
  elements.boutonDemarrer.addEventListener('click', actions.demarrer);
  elements.boutonContinuer.addEventListener('click', actions.reprendre);
  elements.boutonRecommencer.addEventListener('click', actions.redemarrer);
  superposition.initialiserCartes(actions.choisirCarte);
  superposition.initialiserFormulaire(actions.soumettreScore);
  superposition.initialiserPagination(actions.pagePrecedente, actions.pageSuivante);
}

function creerBoucle(etatRef, entrees, performances, rendu, hud, superposition) {
  return new BoucleDeJeu({
    surImage({ deltaSecondes }) {
      performances.mesurer(deltaSecondes);
      mettreAJourJeu(etatRef.valeur, entrees, deltaSecondes);
      rendu.rendre(etatRef.valeur);
      hud.rendre(etatRef.valeur, performances.instantane());
      superposition.rendre(etatRef.valeur, performances.instantane());
    },
  });
}

function initialiserJeu() {
  const elements = recupererElementsInterface();
  const { rendu, hud, superposition, entrees, performances, serviceClassement } =
    creerDependances(elements);
  const etatRef = { valeur: creerEtatInitial() };
  const actions = creerActionsJeu(etatRef, serviceClassement);

  // Expose l'etat en debug pour les tests navigateur locaux.
  window.__etatRef = etatRef;
  window.__actions = actions;

  brancherRaccourcisClavier(entrees, actions);
  brancherBoutons(elements, superposition, actions);
  window.addEventListener('blur', actions.mettreEnPauseSiActif);

  const boucle = creerBoucle(etatRef, entrees, performances, rendu, hud, superposition);
  rendu.rendre(etatRef.valeur);
  hud.rendre(etatRef.valeur, performances.instantane());
  superposition.rendre(etatRef.valeur, performances.instantane());
  boucle.demarrer();
}

if (typeof document !== 'undefined') {
  initialiserJeu();
}
