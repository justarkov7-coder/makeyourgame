import { GestionnaireEntrees } from '../core/InputManager.js';
import { MoniteurPerformance } from '../core/PerfMonitor.js';
import { LISTE_CARTES } from '../game/cartes.js';
import { RenduDom } from '../render/DomRenderer.js';
import { ServiceClassement } from '../services/ServiceClassement.js';
import { ControleurHud } from '../ui/HudController.js';
import { ControleurSuperposition } from '../ui/ControleurSuperposition.js';

// Cree les services et controleurs partages par la boucle de jeu.
export function creerDependances(elements) {
  return {
    rendu: new RenduDom({
      scene: elements.scene, monde: elements.monde,
      coucheCarte: elements.coucheCarte, coucheEntites: elements.coucheEntites,
    }),
    hud: new ControleurHud(elements),
    superposition: new ControleurSuperposition(elements, LISTE_CARTES),
    entrees: new GestionnaireEntrees(),
    performances: new MoniteurPerformance(),
    serviceClassement: new ServiceClassement(),
  };
}
