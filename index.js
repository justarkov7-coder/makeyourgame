import http from 'node:http';
import { portApi, portWeb } from './serveur/configServeur.js';
import { servirStatique } from './serveur/fichiersStatiques.js';
import { estRequeteApi, proxyVersApi } from './serveur/proxyApi.js';
import { demarrerServiceClassement } from './serveur/serviceClassement.js';

// servirRequete aiguille chaque requete vers l'API ou le statique.
function servirRequete(requete, reponse) {
  const urlRequete = new URL(requete.url, `http://${requete.headers.host}`);

  if (estRequeteApi(urlRequete)) {
    proxyVersApi(requete, reponse);
    return;
  }

  servirStatique(urlRequete, reponse);
}

// demarrerServeur lance le web statique et son service API.
function demarrerServeur() {
  demarrerServiceClassement();
  const serveur = http.createServer(servirRequete);
  serveur.listen(portWeb, function annoncerServeur() {
    console.log(`Space Invaders server running on http://localhost:${portWeb}`);
    console.log(`Go API running on http://localhost:${portApi}/api/scores`);
  });
}

demarrerServeur();
