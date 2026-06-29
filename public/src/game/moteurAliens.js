import { bossEstActif, compterAliensRestants, terminerPartie } from './moteurCommun.js';
import { mettreAJourBoss } from './moteurBoss.js';
import { calculerBordsAliens, calculerIntensiteInvasion, deplacerAliensHorizontalement, retirerOffsetsCompression, appliquerOffsetsCompression, doitInverserFlotte, faireDescendreFlotte, verifierDefaiteParDescente } from './moteurFlotte.js';
import { mettreAJourRenfortsAliens } from './moteurRenforts.js';
import { mettreAJourTirAlien } from './moteurTirsAliens.js';

// mettreAJourAliens orchestre la flotte ou le boss.
export function mettreAJourAliens(etat, deltaSecondes) {
  if (bossEstActif(etat)) { mettreAJourBoss(etat, deltaSecondes); return; }
  const intensite = calculerIntensiteInvasion(etat);
  mettreAJourRenfortsAliens(etat, deltaSecondes, intensite);
  if (compterAliensRestants(etat) === 0) { terminerPartie(etat, 'victory'); return; }
  if (etat.aliens.length === 0) return;
  retirerOffsetsCompression(etat.aliens);
  deplacerAliensHorizontalement(etat, deltaSecondes, intensite);
  const bords = calculerBordsAliens(etat.aliens);
  if (doitInverserFlotte(bords)) faireDescendreFlotte(etat);
  appliquerOffsetsCompression(etat);
  mettreAJourTirAlien(etat, deltaSecondes, intensite);
  verifierDefaiteParDescente(etat, calculerBordsAliens(etat.aliens));
}
