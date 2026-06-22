import { CONFIG_JEU } from './config.js';
import { formaterTemps } from '../utils/temps.js';

function borner(valeur, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, valeur));
}

function collisionne(entiteA, entiteB) {
  return (
    entiteA.x < entiteB.x + entiteB.largeur &&
    entiteA.x + entiteA.largeur > entiteB.x &&
    entiteA.y < entiteB.y + entiteB.hauteur &&
    entiteA.y + entiteA.hauteur > entiteB.y
  );
}

function terminerPartie(etat, resultat) {
  etat.resultat = resultat;
  etat.phase = 'saisie-score';
}

function creerProjectile(etat, proprietaire, x, y, vitesseVerticale) {
  etat.projectiles.push({
    id: `projectile-${etat.prochainIdProjectile}`,
    proprietaire,
    x,
    y,
    largeur: CONFIG_JEU.projectiles.largeur,
    hauteur: CONFIG_JEU.projectiles.hauteur,
    vitesseVerticale,
  });
  etat.prochainIdProjectile += 1;
}

function deplacerJoueur(etat, entrees, deltaSecondes) {
  const joueur = etat.joueur;
  const vaAGauche = entrees.estEnfoncee('ArrowLeft') || entrees.estEnfoncee('KeyA');
  const vaADroite = entrees.estEnfoncee('ArrowRight') || entrees.estEnfoncee('KeyD');
  const direction = Number(vaADroite) - Number(vaAGauche);

  joueur.x = borner(
    joueur.x + direction * CONFIG_JEU.joueur.vitesse * deltaSecondes,
    0,
    CONFIG_JEU.largeur - joueur.largeur,
  );
}

function mettreAJourTirJoueur(etat, entrees, deltaSecondes) {
  const joueur = etat.joueur;
  joueur.delaiTir = Math.max(0, joueur.delaiTir - deltaSecondes);
  joueur.bouclierSecondes = Math.max(0, joueur.bouclierSecondes - deltaSecondes);

  if (!entrees.estEnfoncee('Space') || joueur.delaiTir !== 0) {
    return;
  }

  creerProjectile(
    etat,
    'joueur',
    joueur.x + joueur.largeur / 2 - CONFIG_JEU.projectiles.largeur / 2,
    joueur.y - CONFIG_JEU.projectiles.hauteur,
    -CONFIG_JEU.projectiles.vitesseJoueur,
  );
  joueur.delaiTir = CONFIG_JEU.joueur.delaiEntreTirs;
}

function calculerBordsAliens(aliens) {
  let minimumX = Infinity;
  let maximumX = -Infinity;
  let maximumY = -Infinity;

  for (const alien of aliens) {
    minimumX = Math.min(minimumX, alien.x);
    maximumX = Math.max(maximumX, alien.x + alien.largeur);
    maximumY = Math.max(maximumY, alien.y + alien.hauteur);
  }

  return { minimumX, maximumX, maximumY };
}

function calculerVitesseHorizontaleAliens(etat) {
  const totalAliens = CONFIG_JEU.aliens.lignes * CONFIG_JEU.aliens.colonnes;
  const bonusVitesse =
    (totalAliens - etat.aliens.length) * CONFIG_JEU.aliens.bonusVitesseParAlienDetruit;

  return (etat.vitesseAliens + bonusVitesse) * etat.directionAliens;
}

function deplacerAliensHorizontalement(etat, deltaSecondes) {
  const vitesseHorizontale = calculerVitesseHorizontaleAliens(etat);

  for (const alien of etat.aliens) {
    alien.x += vitesseHorizontale * deltaSecondes;
  }
}

function doitInverserFlotte(bords) {
  return bords.maximumX >= CONFIG_JEU.largeur - 12 || bords.minimumX <= 12;
}

function faireDescendreFlotte(etat) {
  etat.directionAliens *= -1;

  for (const alien of etat.aliens) {
    alien.x = borner(alien.x, 12, CONFIG_JEU.largeur - alien.largeur - 12);
    alien.y += CONFIG_JEU.aliens.descenteParRebond;
  }
}

function choisirTireurAlien(aliens) {
  const tireursParColonne = new Map();

  for (const alien of aliens) {
    const alienLePlusBas = tireursParColonne.get(alien.colonne);
    if (!alienLePlusBas || alien.y > alienLePlusBas.y) {
      tireursParColonne.set(alien.colonne, alien);
    }
  }

  const tireursPossibles = [...tireursParColonne.values()];
  if (tireursPossibles.length === 0) {
    return null;
  }

  return tireursPossibles[Math.floor(Math.random() * tireursPossibles.length)];
}

function faireTirerAlien(etat) {
  const tireur = choisirTireurAlien(etat.aliens);
  if (!tireur) {
    return;
  }

  creerProjectile(
    etat,
    'alien',
    tireur.x + tireur.largeur / 2 - CONFIG_JEU.projectiles.largeur / 2,
    tireur.y + tireur.hauteur + 6,
    CONFIG_JEU.projectiles.vitesseAlien,
  );
}

function mettreAJourTirAlien(etat, deltaSecondes) {
  etat.delaiTirAlien = Math.max(0, etat.delaiTirAlien - deltaSecondes);

  if (etat.delaiTirAlien !== 0) {
    return;
  }

  faireTirerAlien(etat);
  etat.delaiTirAlien = CONFIG_JEU.aliens.delaiEntreTirs;
}

function verifierDefaiteParDescente(etat, bords) {
  if (bords.maximumY >= etat.joueur.y) {
    terminerPartie(etat, 'defeat');
  }
}

function mettreAJourAliens(etat, deltaSecondes) {
  if (etat.aliens.length === 0) {
    terminerPartie(etat, 'victory');
    return;
  }

  deplacerAliensHorizontalement(etat, deltaSecondes);
  const bords = calculerBordsAliens(etat.aliens);

  if (doitInverserFlotte(bords)) {
    faireDescendreFlotte(etat);
  }

  mettreAJourTirAlien(etat, deltaSecondes);
  verifierDefaiteParDescente(etat, calculerBordsAliens(etat.aliens));
}

function projectileEstDansLaZone(projectile) {
  return projectile.y + projectile.hauteur >= -24 && projectile.y <= CONFIG_JEU.hauteur + 24;
}

function deplacerProjectiles(etat, deltaSecondes) {
  for (const projectile of etat.projectiles) {
    projectile.y += projectile.vitesseVerticale * deltaSecondes;
  }

  etat.projectiles = etat.projectiles.filter(projectileEstDansLaZone);
}

function infligerDegatAuJoueur(etat) {
  if (etat.joueur.bouclierSecondes > 0) {
    return;
  }

  etat.vies -= 1;
  etat.joueur.bouclierSecondes = CONFIG_JEU.joueur.dureeBouclierReapparition;

  if (etat.vies <= 0) {
    terminerPartie(etat, 'defeat');
  }
}

function trouverAlienTouche(projectile, aliens, idsAliensDetruits) {
  for (const alien of aliens) {
    if (idsAliensDetruits.has(alien.id)) {
      continue;
    }

    if (collisionne(projectile, alien)) {
      return alien;
    }
  }

  return null;
}

function resoudreProjectileJoueur(etat, projectile, idsAliensDetruits) {
  const alienTouche = trouverAlienTouche(projectile, etat.aliens, idsAliensDetruits);

  if (!alienTouche) {
    return false;
  }

  idsAliensDetruits.add(alienTouche.id);
  etat.score += alienTouche.points;
  return true;
}

function resoudreProjectileAlien(etat, projectile) {
  if (!collisionne(projectile, etat.joueur)) {
    return false;
  }

  infligerDegatAuJoueur(etat);
  return true;
}

function projectileEstConsomme(etat, projectile, idsAliensDetruits) {
  if (projectile.proprietaire === 'joueur') {
    return resoudreProjectileJoueur(etat, projectile, idsAliensDetruits);
  }

  return resoudreProjectileAlien(etat, projectile);
}

function retirerAliensDetruits(etat, idsAliensDetruits) {
  if (idsAliensDetruits.size === 0) {
    return;
  }

  etat.aliens = etat.aliens.filter((alien) => !idsAliensDetruits.has(alien.id));
}

function resoudreCollisions(etat) {
  const projectilesRestants = [];
  const idsAliensDetruits = new Set();

  for (const projectile of etat.projectiles) {
    const estConsomme = projectileEstConsomme(etat, projectile, idsAliensDetruits);
    if (!estConsomme) {
      projectilesRestants.push(projectile);
    }
  }

  retirerAliensDetruits(etat, idsAliensDetruits);
  etat.projectiles = projectilesRestants;
}

function mettreAJourChronometre(etat, deltaSecondes) {
  etat.tempsRestantSecondes = Math.max(0, etat.tempsRestantSecondes - deltaSecondes);
  etat.tempsEcouleSecondes += deltaSecondes;
  etat.tempsRestantFormate = formaterTemps(etat.tempsRestantSecondes);

  if (etat.tempsRestantSecondes === 0) {
    terminerPartie(etat, 'defeat');
  }
}

function declencherPalierHistoire(etat) {
  const scorePalier = CONFIG_JEU.histoire.scorePalier;

  if (etat.histoire.palierDeclenche || etat.score < scorePalier) {
    return;
  }

  etat.histoire.palierDeclenche = true;
  etat.phase = 'checkpoint';
}

export function mettreAJourJeu(etat, entrees, deltaSecondes) {
  if (etat.phase !== 'running') {
    return;
  }

  mettreAJourChronometre(etat, deltaSecondes);
  if (etat.phase !== 'running') {
    return;
  }

  deplacerJoueur(etat, entrees, deltaSecondes);
  mettreAJourTirJoueur(etat, entrees, deltaSecondes);
  mettreAJourAliens(etat, deltaSecondes);

  if (etat.phase !== 'running') {
    return;
  }

  deplacerProjectiles(etat, deltaSecondes);
  resoudreCollisions(etat);

  if (etat.phase !== 'running') {
    return;
  }

  if (etat.aliens.length === 0) {
    terminerPartie(etat, 'victory');
    return;
  }

  declencherPalierHistoire(etat);
}
