import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cheminFichierCourant = fileURLToPath(import.meta.url);
const dossierCourant = path.dirname(cheminFichierCourant);
const DOSSIER_PUBLIC = path.join(dossierCourant, 'public');
const PORT = Number(process.env.PORT) || 3000;

const TYPES_MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
};

function resoudreCheminFichier(cheminUrl) {
  const cheminSecurise = path.normalize(cheminUrl).replace(/^(\.\.[/\\])+/, '');
  const cheminDemande = cheminSecurise === '/' ? '/index.html' : cheminSecurise;
  return path.join(DOSSIER_PUBLIC, cheminDemande);
}

function obtenirTypeMime(cheminFichier) {
  const extension = path.extname(cheminFichier);
  return TYPES_MIME[extension] || 'application/octet-stream';
}

function envoyerErreur(reponse, erreur) {
  const code = erreur.code === 'ENOENT' ? 404 : 500;
  const message = code === 404 ? 'Not found' : 'Server error';

  reponse.writeHead(code, {
    'Content-Type': 'text/plain; charset=utf-8',
  });
  reponse.end(message);
}

function envoyerFichier(reponse, cheminFichier) {
  fs.readFile(cheminFichier, (erreur, contenu) => {
    if (erreur) {
      envoyerErreur(reponse, erreur);
      return;
    }

    reponse.writeHead(200, {
      'Content-Type': obtenirTypeMime(cheminFichier),
      'Cache-Control': 'no-store',
    });
    reponse.end(contenu);
  });
}

function servirRequete(requete, reponse) {
  const urlRequete = new URL(requete.url, `http://${requete.headers.host}`);
  const cheminFichier = resoudreCheminFichier(urlRequete.pathname);

  fs.stat(cheminFichier, (erreur, statistiques) => {
    if (!erreur && statistiques.isDirectory()) {
      envoyerFichier(reponse, path.join(cheminFichier, 'index.html'));
      return;
    }

    envoyerFichier(reponse, cheminFichier);
  });
}

function demarrerServeur() {
  const serveur = http.createServer(servirRequete);
  serveur.listen(PORT, () => {
    console.log(`Space Invaders server running on http://localhost:${PORT}`);
  });
}

demarrerServeur();
