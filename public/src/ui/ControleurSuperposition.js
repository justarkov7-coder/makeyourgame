import { methodesBonusSuperposition } from './superpositionBonus.js';
import { methodesClassementSuperposition } from './superpositionClassement.js';
import { methodesNavigationSuperposition } from './superpositionNavigation.js';
import { methodesRenduSuperposition } from './superpositionRendu.js';

export class ControleurSuperposition {
  // constructor initialise l'etat local du controleur.
  constructor(elements, cartes) {
    this.elements = elements;
    this.cartes = cartes;
    this.dernierePhase = '';
    this.dernierIdCarte = '';
    this.derniereCleClassement = '';
    this.dernierResume = '';
    this.derniereCleResume = '';
    this.derniereCleBonusBoss = '';
    this.selectionCarteId = cartes[0]?.id || '';
    this.actions = null;
    this.callbackRevelerBonusBoss = null;
    this.animationBonusBoss = { sequence: -1, intervalles: [], temporisations: [] };
    this.temporisationRepriseBonusBoss = null;
    this.gererNavigationClavier = this.gererNavigationClavier.bind(this);
  }
}

Object.assign(
  ControleurSuperposition.prototype,
  methodesNavigationSuperposition,
  methodesRenduSuperposition,
  methodesBonusSuperposition,
  methodesClassementSuperposition,
);
