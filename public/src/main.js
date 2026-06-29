import { BoucleDeJeu } from './core/GameLoop.js';
import { creerEtatInitial } from './game/createState.js';
import { mettreAJourJeu } from './game/updateGame.js';
import { creerActionsJeu } from './interface/actionsJeu.js';
import { creerDependances } from './interface/dependancesJeu.js';
import { recupererElementsInterface } from './interface/elementsInterface.js';

// estModeDebugActif explique une etape dediee du module.
function estModeDebugActif() {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).get('debug') === '1';
}


// brancherRaccourcisClavier explique une etape dediee du module.
function brancherRaccourcisClavier(entrees, actions, options = {}) {
  entrees.surAppui('Escape', actions.basculerPause);
  entrees.surAppui('KeyP', actions.basculerPause);
  entrees.surAppui('KeyR', actions.redemarrer);
  if (options.modeDebugActif) {
    entrees.surAppui('KeyB', actions.declencherBonusBossTest);
  }
  entrees.attacher();
}

// brancherBoutons explique une etape dediee du module.
function brancherBoutons(elements, superposition, actions, options = {}) {
  elements.boutonContinuer.addEventListener('click', actions.continuerContextuel);
  elements.boutonRecommencer.addEventListener('click', actions.redemarrer);
  if (options.modeDebugActif && elements.debugBonusTrigger) {
    elements.debugBonusTrigger.hidden = false;
    elements.debugBonusTrigger.addEventListener('click', actions.declencherBonusBossTest);
  }
  superposition.initialiserNavigationClavier(actions);
  superposition.initialiserBonusBoss(actions.revelerBonusBoss);
  superposition.initialiserCartes(actions.choisirCarte, actions.demarrer);
  superposition.initialiserFormulaire(actions.soumettreScore);
  superposition.initialiserPagination(actions.pagePrecedente, actions.pageSuivante);
}

// creerBoucle explique une etape dediee du module.
function creerBoucle(etatRef, entrees, performances, rendu, hud, superposition) {
  return new BoucleDeJeu({
    surImage({ deltaSecondes }) {
      performances.mesurer(deltaSecondes);
      mettreAJourJeu(etatRef.valeur, entrees, deltaSecondes);
      rendu.rendre(etatRef.valeur);
      hud.rendre(etatRef.valeur);
      superposition.rendre(etatRef.valeur);
    },
  });
}

// initialiserJeu explique une etape dediee du module.
function initialiserJeu() {
  const modeDebugActif = estModeDebugActif();
  const elements = recupererElementsInterface();
  const { rendu, hud, superposition, entrees, performances, serviceClassement } = creerDependances(elements);
  const etatRef = { valeur: creerEtatInitial() };
  const actions = creerActionsJeu(etatRef, serviceClassement);

  // Expose l'etat en debug pour les tests navigateur locaux.
  window.__etatRef = etatRef;
  window.__actions = actions;
  window.__debug = { modeDebugActif };

  brancherRaccourcisClavier(entrees, actions, { modeDebugActif });
  brancherBoutons(elements, superposition, actions, { modeDebugActif });
  const boucle = creerBoucle(etatRef, entrees, performances, rendu, hud, superposition);
  rendu.rendre(etatRef.valeur);
  hud.rendre(etatRef.valeur);
  superposition.rendre(etatRef.valeur);
  boucle.demarrer();
}

if (typeof document !== 'undefined') {
  initialiserJeu();
}
