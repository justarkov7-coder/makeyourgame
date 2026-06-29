import { creerBlocCarte, estChampEditionActif, viderElement } from './superpositionOutils.js';

export const methodesNavigationSuperposition = {
  // initialiserNavigationClavier branche les raccourcis de menu.
  initialiserNavigationClavier(actions) { this.actions = actions; window.addEventListener('keydown', this.gererNavigationClavier); },
  // initialiserBonusBoss memorise l'action de revelation du bonus.
  initialiserBonusBoss(callbackRevelation) { this.callbackRevelerBonusBoss = callbackRevelation; },
  // initialiserCartes branche les boutons de choix de carte.
  initialiserCartes(callbackSelection, callbackDemarrer) {
    const controleur = this;
    this.elements.optionsCartes.addEventListener('click', function gererClicCarte(evenement) {
      const bouton = evenement.target.closest('[data-carte-id]');
      if (!bouton) return;
      controleur.selectionCarteId = bouton.dataset.carteId;
      callbackSelection(bouton.dataset.carteId);
      callbackDemarrer();
    });
  },
  // initialiserFormulaire branche la soumission de score.
  initialiserFormulaire(callback) {
    const controleur = this;
    this.elements.formulaireScore.addEventListener('submit', function gererSoumissionScore(evenement) {
      evenement.preventDefault();
      callback(controleur.elements.inputNom.value.trim());
    });
  },
  // initialiserPagination branche les boutons du classement.
  initialiserPagination(callbackPrecedent, callbackSuivant) {
    this.elements.boutonPagePrecedente.addEventListener('click', callbackPrecedent);
    this.elements.boutonPageSuivante.addEventListener('click', callbackSuivant);
  },
  // mettreAJourSelectionCarte reconstruit ou actualise les boutons cartes.
  mettreAJourSelectionCarte(etat) {
    this.selectionCarteId = this.selectionCarteId || etat.carte.id;
    if (this.dernierIdCarte !== etat.carte.id) {
      this.dernierIdCarte = etat.carte.id;
      if (!this.selectionCarteId) this.selectionCarteId = etat.carte.id;
      viderElement(this.elements.optionsCartes);
      for (const carte of this.cartes) this.elements.optionsCartes.append(creerBlocCarte(carte, carte.id === this.selectionCarteId));
      return;
    }
    for (const bouton of this.elements.optionsCartes.querySelectorAll('[data-carte-id]')) {
      const estActif = bouton.dataset.carteId === this.selectionCarteId;
      bouton.classList.toggle('active', estActif);
      bouton.setAttribute('aria-selected', estActif ? 'true' : 'false');
    }
  },
  // gererNavigationClavier distribue les touches selon la phase.
  gererNavigationClavier(evenement) {
    if (!this.actions || !this.elements.superposition.classList.contains('visible') || estChampEditionActif()) return;
    if (this.dernierePhase === 'intro') { this.gererNavigationIntroduction(evenement); return; }
    if (this.dernierePhase === 'paused') { if (evenement.code === 'Enter') { evenement.preventDefault(); this.actions.continuerContextuel(); } return; }
    if (this.dernierePhase === 'bonus-boss') { evenement.preventDefault(); return; }
    if (this.dernierePhase === 'classement' && evenement.code === 'ArrowLeft') { evenement.preventDefault(); this.actions.pagePrecedente(); }
    if (this.dernierePhase === 'classement' && evenement.code === 'ArrowRight') { evenement.preventDefault(); this.actions.pageSuivante(); }
  },
  // gererNavigationIntroduction change ou valide la carte selectionnee.
  gererNavigationIntroduction(evenement) {
    let indexActuel = 0;
    for (let index = 0; index < this.cartes.length; index += 1) if (this.cartes[index].id === this.selectionCarteId) indexActuel = index;
    if (evenement.code === 'ArrowUp' || evenement.code === 'ArrowLeft') {
      evenement.preventDefault(); this.selectionCarteId = this.cartes[(indexActuel - 1 + this.cartes.length) % this.cartes.length].id;
      this.mettreAJourSelectionCarte({ carte: { id: this.dernierIdCarte } }); return;
    }
    if (evenement.code === 'ArrowDown' || evenement.code === 'ArrowRight') {
      evenement.preventDefault(); this.selectionCarteId = this.cartes[(indexActuel + 1) % this.cartes.length].id;
      this.mettreAJourSelectionCarte({ carte: { id: this.dernierIdCarte } }); return;
    }
    if (evenement.code === 'Enter') { evenement.preventDefault(); this.actions.choisirCarte(this.selectionCarteId); this.actions.demarrer(); }
  },
};
