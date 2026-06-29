import { formaterTemps } from '../utils/temps.js';
import { compterAliensRestants, bossEstActif, terminerPartie } from './moteurCommun.js';
import { mettreAJourBonusActif, declencherBossSiNecessaire } from './moteurBonusBoss.js';
import { deplacerJoueur, mettreAJourTirJoueur } from './moteurJoueur.js';
import { mettreAJourAliens } from './moteurAliens.js';
import { deplacerProjectiles, resoudreCollisions } from './moteurProjectiles.js';
export { revelerBonusBoss, reprendreApresBonusBoss, declencherBonusBossTest } from './moteurBonusBoss.js';

// mettreAJourChronometre avance le temps affiche par la manche.
function mettreAJourChronometre(etat, deltaSecondes) {
  etat.tempsEcouleSecondes += deltaSecondes;
  etat.tempsRestantSecondes = etat.tempsEcouleSecondes;
  etat.tempsRestantFormate = formaterTemps(etat.tempsEcouleSecondes);
}

// mettreAJourJeu orchestre une image complete de simulation.
export function mettreAJourJeu(etat, entrees, deltaSecondes) {
  if (etat.phase !== 'running') return;
  mettreAJourChronometre(etat, deltaSecondes);
  mettreAJourBonusActif(etat, deltaSecondes);
  if (etat.phase !== 'running') return;
  deplacerJoueur(etat, entrees, deltaSecondes);
  mettreAJourTirJoueur(etat, entrees, deltaSecondes);
  mettreAJourAliens(etat, deltaSecondes);
  if (etat.phase !== 'running') return;
  deplacerProjectiles(etat, deltaSecondes);
  resoudreCollisions(etat);
  if (etat.phase !== 'running') return;
  if (declencherBossSiNecessaire(etat) || bossEstActif(etat)) return;
  if (compterAliensRestants(etat) === 0) terminerPartie(etat, 'victory');
}
