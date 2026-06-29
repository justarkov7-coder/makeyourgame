export class RenduCarte {
  // constructor explique une etape dediee du module.
  constructor({ coucheCarte }) {
    this.coucheCarte = coucheCarte;
    this.idCarte = '';
  }

  // rendre reconstruit les tuiles quand la carte change.
  rendre(carte) {
    if (this.idCarte === carte.id) {
      return;
    }

    this.coucheCarte.replaceChildren();
    this.idCarte = carte.id;
    this.coucheCarte.style.width = `${carte.colonnes * carte.tailleTuile}px`;
    this.coucheCarte.style.height = `${carte.lignes * carte.tailleTuile}px`;

    for (let ligne = 0; ligne < carte.lignes; ligne += 1) {
      for (let colonne = 0; colonne < carte.colonnes; colonne += 1) {
        this.coucheCarte.append(this.creerTuile(carte, colonne, ligne));
      }
    }
  }

  // creerTuile fabrique le noeud DOM d'une tuile de carte.
  creerTuile(carte, colonne, ligne) {
    const tuile = document.createElement('span');
    const typeTuile = carte.getTile(colonne, ligne);
    tuile.className = `tile tile-${typeTuile}`;
    tuile.dataset.tuile = String(typeTuile);
    tuile.style.left = `${colonne * carte.tailleTuile}px`;
    tuile.style.top = `${ligne * carte.tailleTuile}px`;
    tuile.style.width = `${carte.tailleTuile}px`;
    tuile.style.height = `${carte.tailleTuile}px`;
    return tuile;
  }
}
