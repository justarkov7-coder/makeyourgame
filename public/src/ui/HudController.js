import { formaterTemps } from '../utils/temps.js';

export class ControleurHud {
  constructor(elements) {
    this.elements = elements;
  }

  rendre(etat, performances) {
    const tempsFormate = formaterTemps(etat.tempsRestantSecondes);
    this.elements.hudTimer.textContent = tempsFormate;
    this.elements.hudScore.textContent = String(etat.score);
    this.elements.hudLives.textContent = String(etat.vies);
    this.elements.hudFps.textContent = String(performances.fps);
  }
}
