import { CONFIG_JEU } from './config.js';
import { creerProjectile } from './moteurCommun.js';

// choisirTireurAlien prend l'alien le plus bas d'une colonne aleatoire.
function choisirTireurAlien(aliens) {
  const tireursParColonne = new Map();
  for (const alien of aliens) {
    if (alien.enEntree) continue;
    const alienLePlusBas = tireursParColonne.get(alien.colonne);
    if (!alienLePlusBas || alien.y > alienLePlusBas.y) tireursParColonne.set(alien.colonne, alien);
  }
  const tireursPossibles = [...tireursParColonne.values()];
  if (tireursPossibles.length === 0) return null;
  return tireursPossibles[Math.floor(Math.random() * tireursPossibles.length)];
}

// calculerDelaiTirAlien ajuste la cadence de tir ennemie.
function calculerDelaiTirAlien(intensite) {
  const delai = CONFIG_JEU.aliens.delaiEntreTirs - intensite * 0.76;
  return Math.max(CONFIG_JEU.aliens.delaiEntreTirsMinimum, delai);
}

// faireTirerAlien cree un tir depuis un alien.
function faireTirerAlien(etat) {
  const tireur = choisirTireurAlien(etat.aliens);
  if (!tireur) return;
  creerProjectile(etat, 'alien', tireur.x + tireur.largeur / 2 - CONFIG_JEU.projectiles.largeur / 2, tireur.y + tireur.hauteur + 6, CONFIG_JEU.projectiles.vitesseAlien, {
    margeCollisionX: 10, margeCollisionY: 13,
  });
}

// mettreAJourTirAlien gere le compte a rebours du tir alien.
export function mettreAJourTirAlien(etat, deltaSecondes, intensite) {
  etat.delaiTirAlien = Math.max(0, etat.delaiTirAlien - deltaSecondes);
  if (etat.delaiTirAlien !== 0) return;
  faireTirerAlien(etat);
  etat.delaiTirAlien = calculerDelaiTirAlien(intensite);
}
