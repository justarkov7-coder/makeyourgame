export class RenduCarte {
  constructor({ coucheCarte }) {
    this.coucheCarte = coucheCarte;
    this.estVide = false;
  }

  rendre() {
    if (this.estVide) {
      return;
    }

    this.coucheCarte.replaceChildren();
    this.estVide = true;
  }
}
