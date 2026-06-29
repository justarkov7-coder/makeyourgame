import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cheminFichierCourant = fileURLToPath(import.meta.url);
const dossierCourant = path.dirname(cheminFichierCourant);
const DOSSIER_PUBLIC = path.join(dossierCourant, 'public');
const PORT = Number(process.env.PORT) || 3000;
const PORT_API = Number(process.env.API_PORT) || 3001;

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
  reponse.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
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

function demarrerServiceClassement() {
  const processus = spawn('go', ['run', 'api/server.go'], {
    cwd: dossierCourant,
    env: {
      ...process.env,
      API_PORT: String(PORT_API),
    },
    stdio: 'inherit',
  });

  const arreter = () => {
    if (!processus.killed) {
      processus.kill('SIGTERM');
    }
  };

  process.on('exit', arreter);
  process.on('SIGINT', () => {
    arreter();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    arreter();
    process.exit(0);
  });
}

function estRequeteApi(urlRequete) {
  return urlRequete.pathname.startsWith('/api/');
}

function proxyVersApi(requete, reponse) {
  const options = {
    hostname: '127.0.0.1',
    port: PORT_API,
    path: requete.url,
    method: requete.method,
    headers: requete.headers,
  };

  const requeteApi = http.request(options, (reponseApi) => {
    reponse.writeHead(reponseApi.statusCode || 502, reponseApi.headers);
    reponseApi.pipe(reponse);
  });

  requeteApi.on('error', () => {
    reponse.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    reponse.end(JSON.stringify({ error: 'API Go indisponible' }));
  });

  requete.pipe(requeteApi);
}

function servirStatique(urlRequete, reponse) {
  const cheminFichier = resoudreCheminFichier(urlRequete.pathname);

  fs.stat(cheminFichier, (erreur, statistiques) => {
    if (!erreur && statistiques.isDirectory()) {
      envoyerFichier(reponse, path.join(cheminFichier, 'index.html'));
      return;
    }

    envoyerFichier(reponse, cheminFichier);
  });
}

function servirRequete(requete, reponse) {
  const urlRequete = new URL(requete.url, `http://${requete.headers.host}`);

  if (estRequeteApi(urlRequete)) {
    proxyVersApi(requete, reponse);
    return;
  }

  servirStatique(urlRequete, reponse);
}

function demarrerServeur() {
  demarrerServiceClassement();
  const serveur = http.createServer(servirRequete);
  serveur.listen(PORT, () => {
    console.log(`Space Invaders server running on http://localhost:${PORT}`);
    console.log(`Go API running on http://localhost:${PORT_API}/api/scores`);
  });
}

demarrerServeur();
