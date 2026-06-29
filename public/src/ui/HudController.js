import { formaterTemps } from '../utils/temps.js';

export class ControleurHud {
  // constructor explique une etape dediee du module.
  constructor(elements) {
    this.elements = elements;
    this.dernieresValeurs = {
      timer: '',
      score: '',
      vies: '',
      bossVie: '',
      bossRatio: -1,
      bossVisible: false,
      bonusCle: '',
      bonusVisible: false,
    };
  }

  // rendre explique une etape dediee du module.
  rendre(etat) {
    const tempsFormate = formaterTemps(etat.tempsRestantSecondes);
    const score = String(etat.score);
    const vies = String(etat.vies);

    if (this.dernieresValeurs.timer !== tempsFormate) {
      this.dernieresValeurs.timer = tempsFormate;
      this.elements.hudTimer.textContent = tempsFormate;
    }

    if (this.dernieresValeurs.score !== score) {
      this.dernieresValeurs.score = score;
      this.elements.hudScore.textContent = score;
    }

    if (this.dernieresValeurs.vies !== vies) {
      this.dernieresValeurs.vies = vies;
      this.elements.hudLives.textContent = vies;
    }

    this.rendreBonusActif(etat);

    const bossVisible = etat.phase === 'running' && Boolean(etat.boss);
    if (this.dernieresValeurs.bossVisible !== bossVisible) {
      this.dernieresValeurs.bossVisible = bossVisible;
      this.elements.hudBoss.hidden = !bossVisible;
    }

    if (!etat.boss) {
      return;
    }

    const bossVie = `${etat.boss.pointsDeVie} / ${etat.boss.pointsDeVieMax}`;
    const ratioVie = Math.max(0, etat.boss.pointsDeVie / etat.boss.pointsDeVieMax);

    if (this.dernieresValeurs.bossVie !== bossVie) {
      this.dernieresValeurs.bossVie = bossVie;
      this.elements.hudBossLife.textContent = bossVie;
    }

    if (this.dernieresValeurs.bossRatio !== ratioVie) {
      this.dernieresValeurs.bossRatio = ratioVie;
      this.elements.hudBossBar.style.width = `${ratioVie * 100}%`;
    }
  }

  // rendreBonusActif explique une etape dediee du module.
  rendreBonusActif(etat) {
    const bonusVisible = etat.phase === 'running' && Boolean(etat.bonusActif?.bonusId);

    if (this.dernieresValeurs.bonusVisible !== bonusVisible) {
      this.dernieresValeurs.bonusVisible = bonusVisible;
      this.elements.hudBonus.hidden = !bonusVisible;
    }

    if (!bonusVisible) {
      this.dernieresValeurs.bonusCle = '';
      return;
    }

    const tempsRestant = Math.ceil(etat.bonusActif.tempsRestantSecondes);
    const multiplicateur = etat.bonusActif.occurrencesGagnantes >= 3 ? 'x3' : 'x2';
    const cleBonus = `${etat.bonusActif.bonusId}|${tempsRestant}|${multiplicateur}`;

    if (this.dernieresValeurs.bonusCle === cleBonus) {
      return;
    }

    this.dernieresValeurs.bonusCle = cleBonus;
    this.elements.hudBonusIcon.dataset.bonusId = etat.bonusActif.bonusId;
    this.elements.hudBonusName.textContent = `${etat.bonusActif.titre} ${multiplicateur}`;
    this.elements.hudBonusTime.textContent = `${tempsRestant}s`;
  }
}
