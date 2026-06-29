import fs from 'node:fs';
import path from 'node:path';
import { dossierPublic, typesMime } from './configServeur.js';

// resoudreCheminFichier transforme une URL en chemin public securise.
export function resoudreCheminFichier(cheminUrl) {
  const cheminSecurise = path.normalize(cheminUrl).replace(/^(\.\.[/\\])+/, '');
  const cheminDemande = cheminSecurise === '/' ? '/index.html' : cheminSecurise;
  return path.join(dossierPublic, cheminDemande);
}

// obtenirTypeMime retrouve le type HTTP d'un fichier statique.
export function obtenirTypeMime(cheminFichier) {
  const extension = path.extname(cheminFichier);
  return typesMime[extension] || 'application/octet-stream';
}

// envoyerErreur renvoie une erreur de lecture statique.
export function envoyerErreur(reponse, erreur) {
  const code = erreur.code === 'ENOENT' ? 404 : 500;
  const message = code === 404 ? 'Not found' : 'Server error';
  reponse.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
  reponse.end(message);
}

// envoyerFichier lit et transmet un fichier au navigateur.
export function envoyerFichier(reponse, cheminFichier) {
  fs.readFile(cheminFichier, function gererLectureFichier(erreur, contenu) {
    if (erreur) {
      envoyerErreur(reponse, erreur);
      return;
    }
    reponse.writeHead(200, { 'Content-Type': obtenirTypeMime(cheminFichier), 'Cache-Control': 'no-store' });
    reponse.end(contenu);
  });
}

// servirStatique sert un fichier public ou un index de dossier.
export function servirStatique(urlRequete, reponse) {
  const cheminFichier = resoudreCheminFichier(urlRequete.pathname);
  fs.stat(cheminFichier, function gererStatFichier(erreur, statistiques) {
    if (!erreur && statistiques.isDirectory()) {
      envoyerFichier(reponse, path.join(cheminFichier, 'index.html'));
      return;
    }
    envoyerFichier(reponse, cheminFichier);
  });
}
