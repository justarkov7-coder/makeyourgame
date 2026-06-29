import { HISTOIRE } from '../game/histoire.js';

// basculerElement affiche ou cache un element.
export function basculerElement(element, visible) {
  element.hidden = !visible;
}

// viderElement retire tous les enfants d'un element.
export function viderElement(element) {
  element.replaceChildren();
}

// creerBlocCarte construit un bouton de selection de carte.
export function creerBlocCarte(carte, selectionnee) {
  const bouton = document.createElement('button');
  const titre = document.createElement('strong');
  const resume = document.createElement('span');
  bouton.type = 'button'; bouton.className = `map-option${selectionnee ? ' active' : ''}`;
  bouton.dataset.carteId = carte.id; titre.textContent = carte.nom; resume.textContent = carte.resume;
  bouton.append(titre, resume);
  return bouton;
}

// creerLigneClassement construit une ligne du classement.
export function creerLigneClassement(score, estCourant) {
  const ligne = document.createElement('div');
  ligne.className = `ranking-row${estCourant ? ' current-player' : ''}`;
  ligne.innerHTML = `<span>${score.rank}</span><span>${score.name}</span><span>${score.score}</span><span>${score.time}</span>`;
  return ligne;
}

// creerMessageConclusion choisit le texte de fin.
export function creerMessageConclusion(resultat) {
  return resultat === 'victory' ? HISTOIRE.conclusions.victory : HISTOIRE.conclusions.defeat;
}

// estChampEditionActif indique si le clavier edite un champ.
export function estChampEditionActif() {
  const elementActif = document.activeElement;
  return elementActif instanceof HTMLInputElement || elementActif instanceof HTMLTextAreaElement || elementActif instanceof HTMLSelectElement;
}

export { HISTOIRE };
