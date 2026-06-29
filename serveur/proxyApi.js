import http from 'node:http';
import { portApi } from './configServeur.js';

// estRequeteApi detecte les appels destines au service Go.
export function estRequeteApi(urlRequete) {
  return urlRequete.pathname.startsWith('/api/');
}

// proxyVersApi transmet une requete du serveur web vers l'API Go.
export function proxyVersApi(requete, reponse) {
  const options = {
    hostname: '127.0.0.1', port: portApi, path: requete.url,
    method: requete.method, headers: requete.headers,
  };
  const requeteApi = http.request(options, function transmettreReponseApi(reponseApi) {
    reponse.writeHead(reponseApi.statusCode || 502, reponseApi.headers);
    reponseApi.pipe(reponse);
  });
  requeteApi.on('error', function gererErreurApi() {
    reponse.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    reponse.end(JSON.stringify({ error: 'API Go indisponible' }));
  });
  requete.pipe(requeteApi);
}
