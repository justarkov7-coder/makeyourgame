import { basculerElement, creerMessageConclusion, HISTOIRE } from './superpositionOutils.js';

export const methodesRenduSuperposition = {
  // rendre synchronise toute la superposition avec l'etat.
  rendre(etat) { this.mettreAJourResume(etat); this.mettreAJourSelectionCarte(etat); this.basculerPanneaux(etat.phase); this.mettreAJourHabillage(etat); this.rendreSelonPhase(etat); },
  // mettreAJourResume met a jour le resume du menu.
  mettreAJourResume(etat) {
    const cleResume = `${etat.tempsRestantFormate}|${etat.score}|${etat.vies}`;
    if (this.derniereCleResume === cleResume) return;
    this.derniereCleResume = cleResume;
    this.elements.menuTemps.textContent = etat.tempsRestantFormate;
    this.elements.menuScore.textContent = String(etat.score);
    this.elements.menuVies.textContent = String(etat.vies);
  },
  // basculerPanneaux affiche les panneaux utiles a la phase.
  basculerPanneaux(phase) {
    const intro = phase === 'intro', bonusBoss = phase === 'bonus-boss', resume = phase === 'paused' || phase === 'saisie-score';
    const saisie = phase === 'saisie-score', classement = phase === 'classement', estVisible = phase !== 'running';
    basculerElement(this.elements.superposition, estVisible);
    this.elements.superposition.classList.toggle('visible', estVisible);
    basculerElement(this.elements.panneauCartes, intro); basculerElement(this.elements.resumePanel, resume);
    basculerElement(this.elements.panneauBonusBoss, bonusBoss); basculerElement(this.elements.formulaireScore, saisie);
    basculerElement(this.elements.panneauClassement, classement);
  },
  // mettreAJourHabillage pose les attributs visuels de phase.
  mettreAJourHabillage(etat) { this.elements.superposition.dataset.phase = etat.phase; this.elements.superposition.dataset.resultat = etat.resultat || ''; },
  // rendreSelonPhase appelle le rendu specifique de la phase.
  rendreSelonPhase(etat) {
    if (etat.phase === this.dernierePhase && etat.phase !== 'classement' && etat.phase !== 'saisie-score' && etat.phase !== 'bonus-boss') return;
    this.dernierePhase = etat.phase;
    if (etat.phase === 'intro') { this.rendreIntroduction(); return; }
    if (etat.phase === 'paused') { this.rendrePause(); return; }
    if (etat.phase === 'saisie-score') { this.rendreSaisieScore(etat); return; }
    if (etat.phase === 'bonus-boss') { this.rendreBonusBoss(etat); return; }
    if (etat.phase === 'classement') this.rendreClassement(etat);
  },
  // rendreIntroduction affiche le briefing initial.
  rendreIntroduction() {
    this.nettoyerAnimationBonusBoss(); this.annulerRepriseBonusBoss(); this.animationBonusBoss.sequence = -1;
    this.appliquerContenu(HISTOIRE.introduction); this.configurerActions({ continuer: false, recommencer: false });
  },
  // rendrePause affiche le menu de pause.
  rendrePause() {
    this.nettoyerAnimationBonusBoss(); this.annulerRepriseBonusBoss(); this.animationBonusBoss.sequence = -1;
    this.appliquerContenu({ tag: 'Pause', titre: 'Simulation suspendue', texte: 'Reprendre la simulation ou revenir au briefing.' });
    this.configurerActions({ demarrer: false, continuer: true, recommencer: true });
  },
  // rendreSaisieScore affiche le formulaire de score.
  rendreSaisieScore(etat) {
    this.nettoyerAnimationBonusBoss(); this.annulerRepriseBonusBoss(); this.animationBonusBoss.sequence = -1;
    this.appliquerContenu(creerMessageConclusion(etat.resultat)); this.mettreAJourMessageFormulaire(etat);
    this.elements.inputNom.disabled = etat.classement.chargement; this.elements.boutonSoumettre.disabled = etat.classement.chargement;
    this.configurerActions({ demarrer: false, continuer: false, recommencer: true });
  },
  // mettreAJourMessageFormulaire actualise le feedback du formulaire.
  mettreAJourMessageFormulaire(etat) {
    const resume = `${etat.classement.message}|${etat.classement.erreur}`;
    if (this.dernierResume === resume) return;
    this.dernierResume = resume;
    this.elements.scoreFormMessage.textContent = etat.classement.message || etat.classement.erreur;
    this.elements.scoreFormMessage.className = `score-form-message${etat.classement.erreur ? ' error' : ''}`;
  },
  // appliquerContenu remplit les textes principaux.
  appliquerContenu(message) { this.elements.tagSuperposition.textContent = message.tag; this.elements.titreSuperposition.textContent = message.titre; this.elements.texteSuperposition.textContent = message.texte; },
  // configurerActions affiche les actions contextuelles.
  configurerActions({ continuer, recommencer }) { basculerElement(this.elements.boutonContinuer, continuer); basculerElement(this.elements.boutonRecommencer, recommencer); },
};
