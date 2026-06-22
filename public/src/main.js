import { BoucleDeJeu } from './core/GameLoop.js';
import { GestionnaireEntrees } from './core/InputManager.js';
import { MoniteurPerformance } from './core/PerfMonitor.js';
import { creerEtatInitial } from './game/createState.js';
import { mettreAJourJeu } from './game/updateGame.js';
import { RenduDom } from './render/DomRenderer.js';
import { ControleurHud } from './ui/HudController.js';

function recupererElementsInterface() {
  return {
    scene: document.getElementById('game-scene'),
    monde: document.getElementById('game-world'),
    coucheEntites: document.getElementById('entity-layer'),
    superposition: document.getElementById('overlay'),
    boutonContinuer: document.getElementById('continue-button'),
    boutonRecommencer: document.getElementById('restart-button'),
    hudTimer: document.getElementById('hud-timer'),
    hudScore: document.getElementById('hud-score'),
    hudLives: document.getElementById('hud-lives'),
    hudFps: document.getElementById('hud-fps'),
    menuTemps: document.getElementById('menu-timer'),
    menuScore: document.getElementById('menu-score'),
    menuVies: document.getElementById('menu-lives'),
    menuFps: document.getElementById('menu-fps'),
    titreSuperposition: document.getElementById('overlay-title'),
    texteSuperposition: document.getElementById('overlay-text'),
  };
}

function creerDependances(elements) {
  const rendu = new RenduDom({
    scene: elements.scene,
    monde: elements.monde,
    coucheEntites: elements.coucheEntites,
  });

  const hud = new ControleurHud(elements);

  return {
    rendu,
    hud,
    entrees: new GestionnaireEntrees(),
    performances: new MoniteurPerformance(),
  };
}

function creerActionsJeu(etatRef) {
  return {
    redemarrer() {
      etatRef.valeur = creerEtatInitial();
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
    reprendre() {
      if (etatRef.valeur.phase === 'paused') {
        etatRef.valeur.phase = 'running';
      }
    },
    mettreEnPauseSiActif() {
      if (etatRef.valeur.phase === 'running') {
        etatRef.valeur.phase = 'paused';
      }
    },
  };
}

function brancherRaccourcisClavier(entrees, actions) {
  entrees.surAppui('Escape', actions.basculerPause);
  entrees.surAppui('KeyP', actions.basculerPause);
  entrees.surAppui('KeyR', actions.redemarrer);
  entrees.attacher();
}

function brancherBoutons(elements, actions) {
  elements.boutonContinuer.addEventListener('click', actions.reprendre);
  elements.boutonRecommencer.addEventListener('click', actions.redemarrer);
}

function creerBoucle(etatRef, entrees, performances, rendu, hud) {
  return new BoucleDeJeu({
    surImage({ deltaSecondes }) {
      performances.mesurer(deltaSecondes);
      mettreAJourJeu(etatRef.valeur, entrees, deltaSecondes);
      rendu.rendre(etatRef.valeur);
      hud.rendre(etatRef.valeur, performances.instantane());
    },
  });
}

function initialiserJeu() {
  const elements = recupererElementsInterface();
  const { rendu, hud, entrees, performances } = creerDependances(elements);
  const etatRef = { valeur: creerEtatInitial() };
  const actions = creerActionsJeu(etatRef);

  brancherRaccourcisClavier(entrees, actions);
  brancherBoutons(elements, actions);
  window.addEventListener('blur', actions.mettreEnPauseSiActif);

  const boucle = creerBoucle(etatRef, entrees, performances, rendu, hud);
  rendu.rendre(etatRef.valeur);
  hud.rendre(etatRef.valeur, performances.instantane());
  boucle.demarrer();
}

// Point d'entree unique: on centralise le branchement de l'UI ici.
if (typeof document !== 'undefined') {
  initialiserJeu();
}
