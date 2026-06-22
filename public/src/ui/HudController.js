function formatTime(timeLeftSeconds) {
  const totalSeconds = Math.ceil(timeLeftSeconds);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export class HudController {
  constructor(elements) {
    this.elements = elements;
    this.lastPhase = '';
  }

  render(state, perf) {
    const formattedTime = formatTime(state.timeLeftSeconds);

    this.elements.hudTimer.textContent = formattedTime;
    this.elements.hudScore.textContent = String(state.score);
    this.elements.hudLives.textContent = String(state.lives);
    this.elements.hudFps.textContent = String(perf.fps);

    this.elements.menuTimer.textContent = formattedTime;
    this.elements.menuScore.textContent = String(state.score);
    this.elements.menuLives.textContent = String(state.lives);
    this.elements.menuFps.textContent = `${perf.fps}`;

    if (this.lastPhase !== state.phase) {
      this.lastPhase = state.phase;
      this.syncOverlay(state.phase);
    }
  }

  syncOverlay(phase) {
    const {
      overlay,
      overlayTitle,
      overlayText,
      continueButton,
    } = this.elements;

    if (phase === 'paused') {
      overlay.classList.add('visible');
      overlayTitle.textContent = 'En pause';
      overlayText.textContent = '`Echap` ou `P` pour continuer, `R` pour recommencer.';
      continueButton.hidden = false;
      continueButton.disabled = false;
      return;
    }

    if (phase === 'game-over') {
      overlay.classList.add('visible');
      overlayTitle.textContent = 'Partie terminee';
      overlayText.textContent = 'Les aliens ont gagne. Appuie sur `R` pour relancer.';
      continueButton.hidden = true;
      continueButton.disabled = true;
      return;
    }

    if (phase === 'victory') {
      overlay.classList.add('visible');
      overlayTitle.textContent = 'Victoire';
      overlayText.textContent = 'La flotte est detruite. Appuie sur `R` pour rejouer.';
      continueButton.hidden = true;
      continueButton.disabled = true;
      return;
    }

    overlay.classList.remove('visible');
    continueButton.hidden = false;
    continueButton.disabled = false;
  }
}
