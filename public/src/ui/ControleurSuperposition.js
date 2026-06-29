import { HISTOIRE } from '../game/histoire.js';
import { BONUS_BOSS, recupererBonusBoss } from '../game/bonusBoss.js';

function basculerElement(element, visible) {
  element.hidden = !visible;
}

function viderElement(element) {
  element.replaceChildren();
}

function creerBlocCarte(carte, selectionnee) {
  const bouton = document.createElement('button');
  const titre = document.createElement('strong');
  const resume = document.createElement('span');

  bouton.type = 'button';
  bouton.className = `map-option${selectionnee ? ' active' : ''}`;
  bouton.dataset.carteId = carte.id;
  titre.textContent = carte.nom;
  resume.textContent = carte.resume;
  bouton.append(titre, resume);
  return bouton;
}

function creerLigneClassement(score, estCourant) {
  const ligne = document.createElement('div');
  ligne.className = `ranking-row${estCourant ? ' current-player' : ''}`;
  ligne.innerHTML = `
    <span>${score.rank}</span>
    <span>${score.name}</span>
    <span>${score.score}</span>
    <span>${score.time}</span>
  `;
  return ligne;
}

function creerMessageConclusion(resultat) {
  return resultat === 'victory' ? HISTOIRE.conclusions.victory : HISTOIRE.conclusions.defeat;
}

function estChampEditionActif() {
  const elementActif = document.activeElement;
  return (
    elementActif instanceof HTMLInputElement ||
    elementActif instanceof HTMLTextAreaElement ||
    elementActif instanceof HTMLSelectElement
  );
}

function choisirBonusBossAleatoire() {
  return BONUS_BOSS[Math.floor(Math.random() * BONUS_BOSS.length)];
}

function creerSequencePisteAleatoire() {
  const bonus1 = choisirBonusBossAleatoire();
  const bonus2 = choisirBonusBossAleatoire();
  const bonus3 = choisirBonusBossAleatoire();

  return [bonus1, bonus2, bonus3, bonus1];
}

function creerSequencePisteFinale(bonusCentral) {
  const bonus1 = choisirBonusBossAleatoire();
  const bonus3 = choisirBonusBossAleatoire();

  return [bonus1, bonusCentral, bonus3, bonus1];
}

export class ControleurSuperposition {
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
    this.animationBonusBoss = {
      sequence: -1,
      intervalles: [],
      temporisations: [],
    };
    this.temporisationRepriseBonusBoss = null;
    this.gererNavigationClavier = this.gererNavigationClavier.bind(this);
  }

  initialiserNavigationClavier(actions) {
    this.actions = actions;
    window.addEventListener('keydown', this.gererNavigationClavier);
  }

  initialiserBonusBoss(callbackRevelation) {
    this.callbackRevelerBonusBoss = callbackRevelation;
  }

  initialiserCartes(callbackSelection, callbackDemarrer) {
    this.elements.optionsCartes.addEventListener('click', (evenement) => {
      const bouton = evenement.target.closest('[data-carte-id]');
      if (!bouton) {
        return;
      }

      this.selectionCarteId = bouton.dataset.carteId;
      callbackSelection(bouton.dataset.carteId);
      callbackDemarrer();
    });
  }

  initialiserFormulaire(callback) {
    this.elements.formulaireScore.addEventListener('submit', (evenement) => {
      evenement.preventDefault();
      callback(this.elements.inputNom.value.trim());
    });
  }

  initialiserPagination(callbackPrecedent, callbackSuivant) {
    this.elements.boutonPagePrecedente.addEventListener('click', callbackPrecedent);
    this.elements.boutonPageSuivante.addEventListener('click', callbackSuivant);
  }

  rendre(etat) {
    this.mettreAJourResume(etat);
    this.mettreAJourSelectionCarte(etat);
    this.basculerPanneaux(etat.phase);
    this.mettreAJourHabillage(etat);
    this.rendreSelonPhase(etat);
  }

  mettreAJourResume(etat) {
    const cleResume = `${etat.tempsRestantFormate}|${etat.score}|${etat.vies}`;
    if (this.derniereCleResume === cleResume) {
      return;
    }

    this.derniereCleResume = cleResume;
    this.elements.menuTemps.textContent = etat.tempsRestantFormate;
    this.elements.menuScore.textContent = String(etat.score);
    this.elements.menuVies.textContent = String(etat.vies);
  }

  mettreAJourSelectionCarte(etat) {
    this.selectionCarteId = this.selectionCarteId || etat.carte.id;

    if (this.dernierIdCarte !== etat.carte.id) {
      this.dernierIdCarte = etat.carte.id;
      if (!this.selectionCarteId) {
        this.selectionCarteId = etat.carte.id;
      }
      viderElement(this.elements.optionsCartes);

      for (const carte of this.cartes) {
        const bouton = creerBlocCarte(carte, carte.id === this.selectionCarteId);
        this.elements.optionsCartes.append(bouton);
      }
      return;
    }

    for (const bouton of this.elements.optionsCartes.querySelectorAll('[data-carte-id]')) {
      bouton.classList.toggle('active', bouton.dataset.carteId === this.selectionCarteId);
      bouton.setAttribute('aria-selected', bouton.dataset.carteId === this.selectionCarteId ? 'true' : 'false');
    }
  }

  gererNavigationClavier(evenement) {
    if (!this.actions || !this.elements.superposition.classList.contains('visible')) {
      return;
    }

    if (estChampEditionActif()) {
      return;
    }

    if (this.dernierePhase === 'intro') {
      this.gererNavigationIntroduction(evenement);
      return;
    }

    if (this.dernierePhase === 'paused') {
      if (evenement.code === 'Enter') {
        evenement.preventDefault();
        this.actions.continuerContextuel();
      }
      return;
    }

    if (this.dernierePhase === 'bonus-boss') {
      evenement.preventDefault();
      return;
    }

    if (this.dernierePhase === 'classement') {
      if (evenement.code === 'ArrowLeft') {
        evenement.preventDefault();
        this.actions.pagePrecedente();
      }

      if (evenement.code === 'ArrowRight') {
        evenement.preventDefault();
        this.actions.pageSuivante();
      }
    }
  }

  gererNavigationIntroduction(evenement) {
    const indexActuel = Math.max(
      0,
      this.cartes.findIndex((carte) => carte.id === this.selectionCarteId),
    );

    if (evenement.code === 'ArrowUp' || evenement.code === 'ArrowLeft') {
      evenement.preventDefault();
      const prochainIndex = (indexActuel - 1 + this.cartes.length) % this.cartes.length;
      this.selectionCarteId = this.cartes[prochainIndex].id;
      this.mettreAJourSelectionCarte({ carte: { id: this.dernierIdCarte } });
      return;
    }

    if (evenement.code === 'ArrowDown' || evenement.code === 'ArrowRight') {
      evenement.preventDefault();
      const prochainIndex = (indexActuel + 1) % this.cartes.length;
      this.selectionCarteId = this.cartes[prochainIndex].id;
      this.mettreAJourSelectionCarte({ carte: { id: this.dernierIdCarte } });
      return;
    }

    if (evenement.code === 'Enter') {
      evenement.preventDefault();
      this.actions.choisirCarte(this.selectionCarteId);
      this.actions.demarrer();
    }
  }

  basculerPanneaux(phase) {
    const intro = phase === 'intro';
    const bonusBoss = phase === 'bonus-boss';
    const resume = phase === 'paused' || phase === 'saisie-score';
    const saisie = phase === 'saisie-score';
    const classement = phase === 'classement';
    const estVisible = phase !== 'running';

    basculerElement(this.elements.superposition, estVisible);
    this.elements.superposition.classList.toggle('visible', estVisible);
    basculerElement(this.elements.panneauCartes, intro);
    basculerElement(this.elements.resumePanel, resume);
    basculerElement(this.elements.panneauBonusBoss, bonusBoss);
    basculerElement(this.elements.formulaireScore, saisie);
    basculerElement(this.elements.panneauClassement, classement);
  }

  mettreAJourHabillage(etat) {
    this.elements.superposition.dataset.phase = etat.phase;
    this.elements.superposition.dataset.resultat = etat.resultat || '';
  }

  rendreSelonPhase(etat) {
    if (
      etat.phase === this.dernierePhase &&
      etat.phase !== 'classement' &&
      etat.phase !== 'saisie-score' &&
      etat.phase !== 'bonus-boss'
    ) {
      return;
    }

    this.dernierePhase = etat.phase;

    if (etat.phase === 'intro') {
      this.rendreIntroduction();
      return;
    }

    if (etat.phase === 'paused') {
      this.rendrePause();
      return;
    }

    if (etat.phase === 'saisie-score') {
      this.rendreSaisieScore(etat);
      return;
    }

    if (etat.phase === 'bonus-boss') {
      this.rendreBonusBoss(etat);
      return;
    }

    if (etat.phase === 'classement') {
      this.rendreClassement(etat);
    }
  }

  rendreIntroduction() {
    this.nettoyerAnimationBonusBoss();
    this.annulerRepriseBonusBoss();
    this.animationBonusBoss.sequence = -1;
    this.appliquerContenu(HISTOIRE.introduction);
    this.configurerActions({
      continuer: false,
      recommencer: false,
    });
  }

  rendrePause() {
    this.nettoyerAnimationBonusBoss();
    this.annulerRepriseBonusBoss();
    this.animationBonusBoss.sequence = -1;
    this.appliquerContenu({
      tag: 'Pause',
      titre: 'Simulation suspendue',
      texte: 'Reprendre la simulation ou revenir au briefing.',
    });
    this.configurerActions({
      demarrer: false,
      continuer: true,
      recommencer: true,
    });
  }

  rendreBonusBoss(etat) {
    const bonus = recupererBonusBoss(etat.bonusBoss.bonusId);
    const multiplicateur = etat.bonusBoss.occurrencesGagnantes >= 3 ? 'x3' : 'x2';
    const cleBonusBoss = JSON.stringify({
      sequence: etat.bonusBoss.sequence,
      reels: etat.bonusBoss.reelsFinaux,
      revele: etat.bonusBoss.estRevele,
      bonusId: etat.bonusBoss.bonusId,
    });

    if (this.derniereCleBonusBoss === cleBonusBoss) {
      return;
    }

    this.derniereCleBonusBoss = cleBonusBoss;
    this.appliquerContenu({
      tag: '',
      titre: 'Machine a sous activee',
      texte: '',
    });
    this.elements.resultatBonusBoss.textContent = etat.bonusBoss.estRevele
      ? `Gain ${multiplicateur}: ${bonus.titre} - ${etat.bonusBoss.dureeSecondes}s`
      : 'Tirage en cours...';
    this.configurerActions({
      continuer: false,
      recommencer: false,
    });

    if (!etat.bonusBoss.estRevele) {
      this.demarrerAnimationBonusBoss(etat.bonusBoss);
      return;
    }

    this.nettoyerAnimationBonusBoss();
    this.appliquerEtatFinalBonusBoss(etat.bonusBoss.reelsFinaux);
    this.planifierRepriseBonusBoss();
  }

  rendreSaisieScore(etat) {
    this.nettoyerAnimationBonusBoss();
    this.annulerRepriseBonusBoss();
    this.animationBonusBoss.sequence = -1;
    this.appliquerContenu(creerMessageConclusion(etat.resultat));
    this.mettreAJourMessageFormulaire(etat);
    this.elements.inputNom.disabled = etat.classement.chargement;
    this.elements.boutonSoumettre.disabled = etat.classement.chargement;
    this.configurerActions({
      demarrer: false,
      continuer: false,
      recommencer: true,
    });
  }

  rendreClassement(etat) {
    this.nettoyerAnimationBonusBoss();
    this.annulerRepriseBonusBoss();
    this.animationBonusBoss.sequence = -1;
    const cleClassement = JSON.stringify({
      page: etat.classement.page,
      totalPages: etat.classement.totalPages,
      scores: etat.classement.scores,
      resume: etat.classement.resumeSoumission,
    });

    if (this.derniereCleClassement === cleClassement) {
      return;
    }

    this.derniereCleClassement = cleClassement;
    this.appliquerContenu({
      tag: 'Scoreboard',
      titre: 'Classement des pilotes',
      texte: 'Les scores sont tries par ordre descendant et stockes par le service Go.',
    });
    this.elements.rankingFeedback.textContent = this.creerMessageClassement(etat);
    this.elements.pageIndicator.textContent = `Page ${etat.classement.page}/${etat.classement.totalPages}`;
    this.elements.boutonPagePrecedente.disabled = etat.classement.page <= 1;
    this.elements.boutonPageSuivante.disabled = etat.classement.page >= etat.classement.totalPages;
    this.remplirClassement(etat);
    this.configurerActions({
      demarrer: false,
      continuer: false,
      recommencer: true,
    });
  }

  mettreAJourMessageFormulaire(etat) {
    const resume = `${etat.classement.message}|${etat.classement.erreur}`;
    if (this.dernierResume === resume) {
      return;
    }

    this.dernierResume = resume;
    this.elements.scoreFormMessage.textContent = etat.classement.message || etat.classement.erreur;
    this.elements.scoreFormMessage.className = `score-form-message${etat.classement.erreur ? ' error' : ''}`;
  }

  appliquerContenu(message) {
    this.elements.tagSuperposition.textContent = message.tag;
    this.elements.titreSuperposition.textContent = message.titre;
    this.elements.texteSuperposition.textContent = message.texte;
  }

  configurerActions({ continuer, recommencer }) {
    basculerElement(this.elements.boutonContinuer, continuer);
    basculerElement(this.elements.boutonRecommencer, recommencer);
  }

  demarrerAnimationBonusBoss(bonusBoss) {
    if (this.animationBonusBoss.sequence === bonusBoss.sequence) {
      return;
    }

    this.nettoyerAnimationBonusBoss();
    this.annulerRepriseBonusBoss();
    this.animationBonusBoss.sequence = bonusBoss.sequence;
    this.elements.resultatBonusBoss.textContent = 'Tirage en cours...';
    const reels = this.elements.reelsBonusBoss;

    reels.forEach((element) => {
      element.classList.add('is-spinning');
    });

    reels.forEach((element, index) => {
      this.mettreAJourReelBonusBoss(element, BONUS_BOSS[index % BONUS_BOSS.length], creerSequencePisteAleatoire());

      const intervalle = window.setInterval(() => {
        const sequence = creerSequencePisteAleatoire();
        this.mettreAJourReelBonusBoss(element, sequence[1], sequence);
      }, 90 + index * 35);

      const temporisation = window.setTimeout(() => {
        window.clearInterval(intervalle);
        const bonusFinal = recupererBonusBoss(bonusBoss.reelsFinaux[index]);
        this.mettreAJourReelBonusBoss(element, bonusFinal, creerSequencePisteFinale(bonusFinal));
        element.classList.remove('is-spinning');

        if (index === reels.length - 1 && this.callbackRevelerBonusBoss) {
          this.callbackRevelerBonusBoss();
        }
      }, 900 + index * 420);

      this.animationBonusBoss.intervalles.push(intervalle);
      this.animationBonusBoss.temporisations.push(temporisation);
    });
  }

  nettoyerAnimationBonusBoss() {
    for (const intervalle of this.animationBonusBoss.intervalles) {
      window.clearInterval(intervalle);
    }

    for (const temporisation of this.animationBonusBoss.temporisations) {
      window.clearTimeout(temporisation);
    }

    this.animationBonusBoss.intervalles = [];
    this.animationBonusBoss.temporisations = [];
  }

  annulerRepriseBonusBoss() {
    if (!this.temporisationRepriseBonusBoss) {
      return;
    }

    window.clearTimeout(this.temporisationRepriseBonusBoss);
    this.temporisationRepriseBonusBoss = null;
  }

  planifierRepriseBonusBoss() {
    if (this.temporisationRepriseBonusBoss) {
      return;
    }

    this.temporisationRepriseBonusBoss = window.setTimeout(() => {
      this.temporisationRepriseBonusBoss = null;
      this.actions?.continuerContextuel();
    }, 1400);
  }

  appliquerEtatFinalBonusBoss(reelsFinaux) {
    this.elements.reelsBonusBoss.forEach((element, index) => {
      element.classList.remove('is-spinning');
      const bonus = recupererBonusBoss(reelsFinaux[index]);
      this.mettreAJourReelBonusBoss(element, bonus, creerSequencePisteFinale(bonus));
    });
  }

  mettreAJourReelBonusBoss(element, bonus, sequencePiste = creerSequencePisteFinale(bonus)) {
    const titre = element.querySelector('[data-bonus-title]');
    const description = element.querySelector('[data-bonus-description]');
    const slots = element.querySelectorAll('[data-bonus-slot]');

    slots.forEach((slot, index) => {
      const bonusSlot = sequencePiste[index] || bonus;
      const symbole = slot.querySelector('[data-bonus-symbol]');

      slot.dataset.bonusId = bonusSlot.id;
      symbole.textContent = bonusSlot.symbole;
    });

    titre.textContent = bonus.titre;
    description.textContent = bonus.description;
    element.dataset.bonusId = bonus.id;
  }

  creerMessageClassement(etat) {
    const resume = etat.classement.resumeSoumission;
    if (!resume) {
      return 'Aucun score recemment soumis.';
    }

    return `Bravo ${resume.name}, score ${resume.score}, temps ${resume.time}, top ${resume.percentile}%, position ${resume.rank}.`;
  }

  remplirClassement(etat) {
    viderElement(this.elements.rankingRows);

    if (etat.classement.scores.length === 0) {
      const vide = document.createElement('p');
      vide.className = 'ranking-empty';
      vide.textContent = 'Aucun score enregistre pour le moment.';
      this.elements.rankingRows.append(vide);
      return;
    }

    const nomCourant = etat.classement.resumeSoumission?.name || '';
    for (const score of etat.classement.scores) {
      const estCourant = score.name === nomCourant && score.rank === etat.classement.resumeSoumission?.rank;
      this.elements.rankingRows.append(creerLigneClassement(score, estCourant));
    }
  }
}
