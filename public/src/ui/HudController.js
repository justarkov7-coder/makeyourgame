function formaterTemps(tempsRestantSecondes) {
  const totalSecondes = Math.ceil(tempsRestantSecondes);
  const minutes = String(Math.floor(totalSecondes / 60)).padStart(2, '0');
  const secondes = String(totalSecondes % 60).padStart(2, '0');
  return `${minutes}:${secondes}`;
}

const MESSAGES_PHASE = {
  paused: {
    titre: 'En pause',
    texte: '`Echap` ou `P` pour continuer, `R` pour recommencer.',
    afficherContinuer: true,
  },
  'game-over': {
    titre: 'Partie terminee',
    texte: 'Les aliens ont gagne. Appuie sur `R` pour relancer.',
    afficherContinuer: false,
  },
  victory: {
    titre: 'Victoire',
    texte: 'La flotte est detruite. Appuie sur `R` pour rejouer.',
    afficherContinuer: false,
  },
};

export class ControleurHud {
  constructor(elements) {
    this.elements = elements;
    this.dernierePhase = '';
  }

  rendre(etat, performances) {
    this.mettreAJourStatistiques(etat, performances);

    if (this.dernierePhase !== etat.phase) {
      this.dernierePhase = etat.phase;
      this.synchroniserSuperposition(etat.phase);
    }
  }

  mettreAJourStatistiques(etat, performances) {
    const tempsFormate = formaterTemps(etat.tempsRestantSecondes);

    this.elements.hudTimer.textContent = tempsFormate;
    this.elements.hudScore.textContent = String(etat.score);
    this.elements.hudLives.textContent = String(etat.vies);
    this.elements.hudFps.textContent = String(performances.fps);

    this.elements.menuTemps.textContent = tempsFormate;
    this.elements.menuScore.textContent = String(etat.score);
    this.elements.menuVies.textContent = String(etat.vies);
    this.elements.menuFps.textContent = String(performances.fps);
  }

  synchroniserSuperposition(phase) {
    const message = MESSAGES_PHASE[phase];

    if (!message) {
      this.masquerSuperposition();
      return;
    }

    this.afficherSuperposition(message);
  }

  afficherSuperposition(message) {
    this.elements.superposition.classList.add('visible');
    this.elements.titreSuperposition.textContent = message.titre;
    this.elements.texteSuperposition.textContent = message.texte;
    this.elements.boutonContinuer.hidden = !message.afficherContinuer;
    this.elements.boutonContinuer.disabled = !message.afficherContinuer;
  }

  masquerSuperposition() {
    this.elements.superposition.classList.remove('visible');
    this.elements.boutonContinuer.hidden = false;
    this.elements.boutonContinuer.disabled = false;
  }
}
