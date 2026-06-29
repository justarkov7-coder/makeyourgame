import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const cheminFichierCourant = fileURLToPath(import.meta.url);
export const dossierRacine = path.dirname(path.dirname(cheminFichierCourant));
export const dossierPublic = path.join(dossierRacine, 'public');
export const portWeb = Number(process.env.PORT) || 3000;
export const portApi = Number(process.env.API_PORT) || 3001;

export const typesMime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
};
