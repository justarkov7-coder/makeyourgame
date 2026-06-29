import { BONUS_BOSS, recupererBonusBoss } from '../game/bonusBoss.js';

// choisirBonusBossAleatoire choisit un symbole de reel.
function choisirBonusBossAleatoire() { return BONUS_BOSS[Math.floor(Math.random() * BONUS_BOSS.length)]; }

// creerSequencePisteAleatoire cree une piste de reel aleatoire.
function creerSequencePisteAleatoire() {
  const bonus1 = choisirBonusBossAleatoire(), bonus2 = choisirBonusBossAleatoire(), bonus3 = choisirBonusBossAleatoire();
  return [bonus1, bonus2, bonus3, bonus1];
}

// creerSequencePisteFinale centre le bonus gagnant.
function creerSequencePisteFinale(bonusCentral) {
  return [choisirBonusBossAleatoire(), bonusCentral, choisirBonusBossAleatoire(), choisirBonusBossAleatoire()];
}

export const methodesBonusSuperposition = {
  // rendreBonusBoss affiche le tirage de boss.
  rendreBonusBoss(etat) {
    const bonus = recupererBonusBoss(etat.bonusBoss.bonusId);
    const multiplicateur = etat.bonusBoss.occurrencesGagnantes >= 3 ? 'x3' : 'x2';
    const cleBonusBoss = JSON.stringify({ sequence: etat.bonusBoss.sequence, reels: etat.bonusBoss.reelsFinaux, revele: etat.bonusBoss.estRevele, bonusId: etat.bonusBoss.bonusId });
    if (this.derniereCleBonusBoss === cleBonusBoss) return;
    this.derniereCleBonusBoss = cleBonusBoss;
    this.appliquerContenu({ tag: '', titre: 'Machine a sous activee', texte: '' });
    this.elements.resultatBonusBoss.textContent = etat.bonusBoss.estRevele ? `Gain ${multiplicateur}: ${bonus.titre} - ${etat.bonusBoss.dureeSecondes}s` : 'Tirage en cours...';
    this.configurerActions({ continuer: false, recommencer: false });
    if (!etat.bonusBoss.estRevele) { this.demarrerAnimationBonusBoss(etat.bonusBoss); return; }
    this.nettoyerAnimationBonusBoss(); this.appliquerEtatFinalBonusBoss(etat.bonusBoss.reelsFinaux); this.planifierRepriseBonusBoss();
  },
  // demarrerAnimationBonusBoss anime les trois reels.
  demarrerAnimationBonusBoss(bonusBoss) {
    if (this.animationBonusBoss.sequence === bonusBoss.sequence) return;
    this.nettoyerAnimationBonusBoss(); this.annulerRepriseBonusBoss(); this.animationBonusBoss.sequence = bonusBoss.sequence;
    this.elements.resultatBonusBoss.textContent = 'Tirage en cours...';
    const reels = this.elements.reelsBonusBoss;
    for (const element of reels) element.classList.add('is-spinning');
    for (let index = 0; index < reels.length; index += 1) this.demarrerReelBonusBoss(reels[index], index, reels, bonusBoss);
  },
  // demarrerReelBonusBoss anime un reel individuel.
  demarrerReelBonusBoss(element, index, reels, bonusBoss) {
    const controleur = this;
    this.mettreAJourReelBonusBoss(element, BONUS_BOSS[index % BONUS_BOSS.length], creerSequencePisteAleatoire());
    const intervalle = window.setInterval(function faireTournerReel() {
      const sequence = creerSequencePisteAleatoire();
      controleur.mettreAJourReelBonusBoss(element, sequence[1], sequence);
    }, 90 + index * 35);
    const temporisation = window.setTimeout(function arreterReel() {
      window.clearInterval(intervalle);
      const bonusFinal = recupererBonusBoss(bonusBoss.reelsFinaux[index]);
      controleur.mettreAJourReelBonusBoss(element, bonusFinal, creerSequencePisteFinale(bonusFinal));
      element.classList.remove('is-spinning');
      if (index === reels.length - 1 && controleur.callbackRevelerBonusBoss) controleur.callbackRevelerBonusBoss();
    }, 900 + index * 420);
    this.animationBonusBoss.intervalles.push(intervalle); this.animationBonusBoss.temporisations.push(temporisation);
  },
  // nettoyerAnimationBonusBoss arrete les timers de reels.
  nettoyerAnimationBonusBoss() {
    for (const intervalle of this.animationBonusBoss.intervalles) window.clearInterval(intervalle);
    for (const temporisation of this.animationBonusBoss.temporisations) window.clearTimeout(temporisation);
    this.animationBonusBoss.intervalles = []; this.animationBonusBoss.temporisations = [];
  },
  // annulerRepriseBonusBoss annule la reprise automatique.
  annulerRepriseBonusBoss() {
    if (!this.temporisationRepriseBonusBoss) return;
    window.clearTimeout(this.temporisationRepriseBonusBoss); this.temporisationRepriseBonusBoss = null;
  },
  // planifierRepriseBonusBoss reprend apres affichage du gain.
  planifierRepriseBonusBoss() {
    if (this.temporisationRepriseBonusBoss) return;
    const controleur = this;
    this.temporisationRepriseBonusBoss = window.setTimeout(function reprendreApresAffichageBonus() {
      controleur.temporisationRepriseBonusBoss = null; controleur.actions?.continuerContextuel();
    }, 1400);
  },
  // appliquerEtatFinalBonusBoss affiche les reels finaux.
  appliquerEtatFinalBonusBoss(reelsFinaux) {
    for (let index = 0; index < this.elements.reelsBonusBoss.length; index += 1) {
      const element = this.elements.reelsBonusBoss[index];
      element.classList.remove('is-spinning');
      const bonus = recupererBonusBoss(reelsFinaux[index]);
      this.mettreAJourReelBonusBoss(element, bonus, creerSequencePisteFinale(bonus));
    }
  },
  // mettreAJourReelBonusBoss remplit un reel avec une piste.
  mettreAJourReelBonusBoss(element, bonus, sequencePiste = creerSequencePisteFinale(bonus)) {
    const titre = element.querySelector('[data-bonus-title]');
    const description = element.querySelector('[data-bonus-description]');
    const slots = element.querySelectorAll('[data-bonus-slot]');
    for (let index = 0; index < slots.length; index += 1) {
      const slot = slots[index], bonusSlot = sequencePiste[index] || bonus, symbole = slot.querySelector('[data-bonus-symbol]');
      slot.dataset.bonusId = bonusSlot.id; symbole.textContent = bonusSlot.symbole;
    }
    titre.textContent = bonus.titre; description.textContent = bonus.description; element.dataset.bonusId = bonus.id;
  },
};
