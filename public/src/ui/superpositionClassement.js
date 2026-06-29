import { creerLigneClassement, viderElement } from './superpositionOutils.js';

export const methodesClassementSuperposition = {
  // rendreClassement affiche la page courante du classement.
  rendreClassement(etat) {
    this.nettoyerAnimationBonusBoss(); this.annulerRepriseBonusBoss(); this.animationBonusBoss.sequence = -1;
    const cleClassement = JSON.stringify({ page: etat.classement.page, totalPages: etat.classement.totalPages, scores: etat.classement.scores, resume: etat.classement.resumeSoumission });
    if (this.derniereCleClassement === cleClassement) return;
    this.derniereCleClassement = cleClassement;
    this.appliquerContenu({ tag: 'Scoreboard', titre: 'Classement des pilotes', texte: 'Les scores sont tries par ordre descendant et stockes par le service Go.' });
    this.elements.rankingFeedback.textContent = this.creerMessageClassement(etat);
    this.elements.pageIndicator.textContent = `Page ${etat.classement.page}/${etat.classement.totalPages}`;
    this.elements.boutonPagePrecedente.disabled = etat.classement.page <= 1;
    this.elements.boutonPageSuivante.disabled = etat.classement.page >= etat.classement.totalPages;
    this.remplirClassement(etat);
    this.configurerActions({ demarrer: false, continuer: false, recommencer: true });
  },
  // creerMessageClassement resume la soumission recente.
  creerMessageClassement(etat) {
    const resume = etat.classement.resumeSoumission;
    if (!resume) return 'Aucun score recemment soumis.';
    return `Bravo ${resume.name}, score ${resume.score}, temps ${resume.time}, top ${resume.percentile}%, position ${resume.rank}.`;
  },
  // remplirClassement reconstruit les lignes visibles.
  remplirClassement(etat) {
    viderElement(this.elements.rankingRows);
    if (etat.classement.scores.length === 0) {
      const vide = document.createElement('p');
      vide.className = 'ranking-empty'; vide.textContent = 'Aucun score enregistre pour le moment.';
      this.elements.rankingRows.append(vide); return;
    }
    const nomCourant = etat.classement.resumeSoumission?.name || '';
    for (const score of etat.classement.scores) {
      const estCourant = score.name === nomCourant && score.rank === etat.classement.resumeSoumission?.rank;
      this.elements.rankingRows.append(creerLigneClassement(score, estCourant));
    }
  },
};
