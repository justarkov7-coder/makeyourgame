export class ServiceClassement {
  // constructor explique une etape dediee du module.
  constructor(urlBase = '/api/scores') {
    this.urlBase = urlBase;
  }

  // chargerPage explique une etape dediee du module.
  async chargerPage(page = 1, pageSize = 5) {
    const url = new URL(this.urlBase, window.location.origin);
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(pageSize));
    return this.envoyerRequete(url);
  }

  // envoyerScore explique une etape dediee du module.
  async envoyerScore(score) {
    const reponse = await fetch(this.urlBase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(score),
    });

    return this.lireReponse(reponse);
  }

  // envoyerRequete explique une etape dediee du module.
  async envoyerRequete(url) {
    const reponse = await fetch(url);
    return this.lireReponse(reponse);
  }

  // lireReponse explique une etape dediee du module.
  async lireReponse(reponse) {
    const donnees = await reponse.json();

    if (!reponse.ok) {
      throw new Error(donnees.error || 'Erreur serveur');
    }

    return donnees;
  }
}
