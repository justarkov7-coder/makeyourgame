import { CONFIG_JEU } from './config.js';
import { creerBoss, creerDeploiementAliens } from './createState.js';
import { formaterTemps } from '../utils/temps.js';

function borner(valeur, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, valeur));
}

function construireBoiteCollision(entite) {
  const margeCollisionX = entite.margeCollisionX || 0;
  const margeCollisionY = entite.margeCollisionY || 0;

  return {
    x: entite.x + margeCollisionX,
    y: entite.y + margeCollisionY,
    largeur: Math.max(1, entite.largeur - margeCollisionX * 2),
    hauteur: Math.max(1, entite.hauteur - margeCollisionY * 2),
  };
}

function collisionne(entiteA, entiteB) {
  const boiteA = construireBoiteCollision(entiteA);
  const boiteB = construireBoiteCollision(entiteB);

  return (
    boiteA.x < boiteB.x + boiteB.largeur &&
    boiteA.x + boiteA.largeur > boiteB.x &&
    boiteA.y < boiteB.y + boiteB.hauteur &&
    boiteA.y + boiteA.hauteur > boiteB.y
  );
}

function terminerPartie(etat, resultat) {
  etat.boss = null;
  etat.resultat = resultat;
  etat.phase = 'saisie-score';
}

function creerProjectile(etat, proprietaire, x, y, vitesseVerticale, options = {}) {
  etat.projectiles.push({
    id: `projectile-${etat.prochainIdProjectile}`,
    proprietaire,
    x,
    y,
    largeur: CONFIG_JEU.projectiles.largeur,
    hauteur: CONFIG_JEU.projectiles.hauteur,
    vitesseHorizontale: options.vitesseHorizontale || 0,
    vitesseVerticale,
    styleTir: options.styleTir || proprietaire,
    teinte: options.teinte ?? null,
    margeCollisionX: options.margeCollisionX || 0,
    margeCollisionY: options.margeCollisionY || 0,
  });
  etat.prochainIdProjectile += 1;
}

function deplacerJoueur(etat, entrees, deltaSecondes) {
  const joueur = etat.joueur;
  const vaAGauche = entrees.estEnfoncee('ArrowLeft') || entrees.estEnfoncee('KeyA');
  const vaADroite = entrees.estEnfoncee('ArrowRight') || entrees.estEnfoncee('KeyD');
  const direction = Number(vaADroite) - Number(vaAGauche);
  joueur.directionAnimation = direction;

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
  joueur.animationTirSecondes = Math.max(0, joueur.animationTirSecondes - deltaSecondes);

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
  joueur.animationTirSecondes = CONFIG_JEU.joueur.dureeAnimationTir;
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

function compterAliensRestants(etat) {
  return etat.aliens.length + etat.aliensEnReserve.length;
}

function bossEstActif(etat) {
  return etat.boss !== null;
}

function creerNouvelleVague(etat) {
  const { aliensActifs, aliensEnReserve } = creerDeploiementAliens();
  etat.aliens = aliensActifs;
  etat.aliensEnReserve = aliensEnReserve;
  etat.directionAliens = 1;
  etat.delaiRenfortAlien = CONFIG_JEU.aliens.delaiRenfortInitial;
  etat.delaiTirAlien = 0.8;
}

function nettoyerProjectilesHostiles(etat) {
  etat.projectiles = etat.projectiles.filter((projectile) => projectile.proprietaire === 'joueur');
}

function activerBoss(etat) {
  etat.aliens = [];
  etat.aliensEnReserve = [];
  nettoyerProjectilesHostiles(etat);
  etat.vies += 2;
  etat.joueur.bouclierSecondes = Math.max(etat.joueur.bouclierSecondes, 1.25);
  etat.bossDoitApparaitre = false;
  etat.boss = creerBoss(etat.bossesVaincus);
  etat.prochainPalierBoss += CONFIG_JEU.boss.palierScore;
}

function terminerBoss(etat) {
  etat.score += etat.boss.pointsBonus;
  etat.boss = null;
  etat.bossesVaincus += 1;
  nettoyerProjectilesHostiles(etat);
  creerNouvelleVague(etat);
}

function declencherBossSiNecessaire(etat) {
  if (bossEstActif(etat) || (etat.score < etat.prochainPalierBoss && !etat.bossDoitApparaitre)) {
    return false;
  }

  activerBoss(etat);
  return true;
}

function calculerIntensiteInvasion(etat) {
  const totalAliens = CONFIG_JEU.aliens.lignes * CONFIG_JEU.aliens.colonnes;
  const ratioDeploiement = (totalAliens - etat.aliensEnReserve.length) / totalAliens;
  const ratioDestruction = 1 - compterAliensRestants(etat) / totalAliens;
  const ratioTemps = borner(etat.tempsEcouleSecondes / (CONFIG_JEU.dureeMancheSecondes * 0.72), 0, 1);

  return borner(ratioDeploiement * 0.55 + ratioDestruction * 0.2 + ratioTemps * 0.45, 0, 1);
}

function calculerVitesseHorizontaleAliens(etat) {
  const totalAliens = CONFIG_JEU.aliens.lignes * CONFIG_JEU.aliens.colonnes;
  const aliensRestants = compterAliensRestants(etat);
  const bonusVitesse =
    (totalAliens - aliensRestants) * CONFIG_JEU.aliens.bonusVitesseParAlienDetruit;
  const bonusTemps = etat.tempsEcouleSecondes * CONFIG_JEU.aliens.accelerationTempsParSeconde;
  const ratioSurvivants = aliensRestants / totalAliens;
  const ratioDeploiement = etat.aliens.length / totalAliens;
  const intensite = calculerIntensiteInvasion(etat);
  const modulation =
    0.42 +
    ratioDeploiement * 0.34 +
    intensite * 0.46 +
    (1 - ratioSurvivants) * 0.18 +
    0.05 * Math.sin(etat.tempsEcouleSecondes * 1.35);

  return (etat.vitesseAliens + bonusVitesse + bonusTemps) * modulation * etat.directionAliens;
}

function deplacerAliensHorizontalement(etat, deltaSecondes) {
  const vitesseHorizontale = calculerVitesseHorizontaleAliens(etat);

  for (const alien of etat.aliens) {
    alien.x += vitesseHorizontale * deltaSecondes;
  }
}

function retirerOffsetsCompression(aliens) {
  for (const alien of aliens) {
    alien.x -= alien.offsetCompressionX;
    alien.y -= alien.offsetCompressionY;
    alien.offsetCompressionX = 0;
    alien.offsetCompressionY = 0;
  }
}

function appliquerOffsetsCompression(etat) {
  const totalAliens = CONFIG_JEU.aliens.lignes * CONFIG_JEU.aliens.colonnes;
  const pressionVague = 1 - compterAliensRestants(etat) / totalAliens;
  const intensite = Math.min(
    CONFIG_JEU.aliens.amplitudeCompressionMax,
    CONFIG_JEU.aliens.amplitudeCompressionBase +
      etat.tempsEcouleSecondes / 28 +
      pressionVague * 0.75,
  );

  for (const alien of etat.aliens) {
    alien.offsetCompressionX =
      Math.sin(etat.tempsEcouleSecondes * 1.2 + alien.phaseCompression) *
      alien.amplitudeCompressionX *
      intensite;
    alien.offsetCompressionY =
      Math.cos(etat.tempsEcouleSecondes * 0.9 + alien.phaseCompression * 1.3) *
      alien.amplitudeCompressionY *
      intensite;
    alien.x += alien.offsetCompressionX;
    alien.y += alien.offsetCompressionY;
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
    alien.yFormation += CONFIG_JEU.aliens.descenteParRebond;
  }
}

function choisirTireurAlien(aliens) {
  const tireursParColonne = new Map();

  for (const alien of aliens) {
    if (alien.enEntree) {
      continue;
    }

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

function calculerDelaiTirAlien(etat) {
  const intensite = calculerIntensiteInvasion(etat);
  const delai = CONFIG_JEU.aliens.delaiEntreTirs - intensite * 0.76;

  return Math.max(CONFIG_JEU.aliens.delaiEntreTirsMinimum, delai);
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
    {
      margeCollisionX: 10,
      margeCollisionY: 13,
    },
  );
}

function mettreAJourTirAlien(etat, deltaSecondes) {
  etat.delaiTirAlien = Math.max(0, etat.delaiTirAlien - deltaSecondes);

  if (etat.delaiTirAlien !== 0) {
    return;
  }

  faireTirerAlien(etat);
  etat.delaiTirAlien = calculerDelaiTirAlien(etat);
}

function calculerDelaiSalveBoss(boss) {
  const ratioVie = boss.pointsDeVie / boss.pointsDeVieMax;
  const delai =
    CONFIG_JEU.boss.delaiEntreSalvesMinimum +
    (CONFIG_JEU.boss.delaiEntreSalves - CONFIG_JEU.boss.delaiEntreSalvesMinimum) * ratioVie;

  return Math.max(CONFIG_JEU.boss.delaiEntreSalvesMinimum, delai);
}

function calculerNombreProjectilesBoss(boss) {
  const ratioDegats = 1 - boss.pointsDeVie / boss.pointsDeVieMax;
  const nombre =
    CONFIG_JEU.boss.projectilesParSalve +
    Math.round(ratioDegats * (CONFIG_JEU.boss.projectilesParSalveMaximum - CONFIG_JEU.boss.projectilesParSalve));

  return Math.min(CONFIG_JEU.boss.projectilesParSalveMaximum, nombre);
}

function faireTirerBoss(etat) {
  const boss = etat.boss;
  if (!boss) {
    return;
  }

  const centreX = boss.x + boss.largeur / 2;
  const centreY = boss.y + boss.hauteur / 2;
  const nombreProjectiles = calculerNombreProjectilesBoss(boss);
  const amplitudeVitesse =
    CONFIG_JEU.boss.vitesseProjectileMaximum - CONFIG_JEU.boss.vitesseProjectileMinimum;
  const jitter = Math.sin(etat.tempsEcouleSecondes * 1.7 + boss.angleSalve) * 0.18;
  const rayonEmissionX = boss.largeur * 0.46;
  const rayonEmissionY = boss.hauteur * 0.46;

  for (let index = 0; index < nombreProjectiles; index += 1) {
    const ratio = index / nombreProjectiles;
    const angle = boss.angleSalve + ratio * Math.PI * 2 + jitter;
    const vitesse =
      CONFIG_JEU.boss.vitesseProjectileMinimum +
      amplitudeVitesse * ((index % 5) / 4);
    const xProjectile =
      centreX + Math.cos(angle) * rayonEmissionX - CONFIG_JEU.projectiles.largeur / 2;
    const yProjectile =
      centreY + Math.sin(angle) * rayonEmissionY - CONFIG_JEU.projectiles.hauteur / 2;

    creerProjectile(
      etat,
      'alien',
      xProjectile,
      yProjectile,
      Math.sin(angle) * vitesse,
      {
        vitesseHorizontale: Math.cos(angle) * vitesse,
        styleTir: 'boss',
        teinte: (Math.round((boss.angleSalve * 180) / Math.PI) + index * 27) % 360,
        margeCollisionX: 13,
        margeCollisionY: 15,
      },
    );
  }

  boss.angleSalve += 0.43;
}

function mettreAJourBoss(etat, deltaSecondes) {
  const boss = etat.boss;
  if (!boss) {
    return;
  }

  boss.x += boss.vitesseHorizontale * boss.directionHorizontale * deltaSecondes;
  boss.y += boss.vitesseVerticale * boss.directionVerticale * deltaSecondes;

  const marge = CONFIG_JEU.boss.margeDeplacement;
  const limiteXMax = CONFIG_JEU.largeur - boss.largeur - marge;
  const limiteYMax = Math.min(
    CONFIG_JEU.boss.hauteurPatrouilleMaximum,
    CONFIG_JEU.hauteur - boss.hauteur - CONFIG_JEU.boss.margeBasInterdite,
  );

  if (boss.x <= marge || boss.x >= limiteXMax) {
    boss.directionHorizontale *= -1;
    boss.x = borner(boss.x, marge, limiteXMax);
  }

  if (boss.y <= CONFIG_JEU.boss.yDepart || boss.y >= limiteYMax) {
    boss.directionVerticale *= -1;
    boss.y = borner(boss.y, CONFIG_JEU.boss.yDepart, limiteYMax);
  }

  boss.delaiSalve = Math.max(0, boss.delaiSalve - deltaSecondes);
  if (boss.delaiSalve === 0) {
    faireTirerBoss(etat);
    boss.delaiSalve = calculerDelaiSalveBoss(boss);
  }
}

function repousserFlotteApresPercussion(etat, bords) {
  const hauteurSecurite = CONFIG_JEU.hauteur - 128;
  const decalageVertical = Math.max(0, bords.maximumY - hauteurSecurite);

  if (decalageVertical === 0) {
    return;
  }

  for (const alien of etat.aliens) {
    alien.y -= decalageVertical;
    alien.yFormation -= decalageVertical;
  }
}

function verifierDefaiteParDescente(etat, bords) {
  if (bords.maximumY < CONFIG_JEU.hauteur) {
    return;
  }

  infligerDegatAuJoueur(etat);
  repousserFlotteApresPercussion(etat, bords);
}

function activerAlienEnRenfort(alien, indexRenfort) {
  const amplitudeVitesse =
    CONFIG_JEU.aliens.vitesseEntreeMaximum - CONFIG_JEU.aliens.vitesseEntreeMinimum;
  const ratioVitesse = ((alien.colonne * 13 + alien.ligne * 29 + indexRenfort * 17) % 100) / 100;
  const decalageHauteur =
    (alien.colonne * 31 + alien.ligne * 19 + indexRenfort * 23) %
    (CONFIG_JEU.aliens.hauteurEntreeAleatoire + 1);

  alien.x = alien.xFormation;
  alien.y = alien.yFormation - CONFIG_JEU.aliens.hauteurEntree - decalageHauteur;
  alien.enEntree = true;
  alien.vitesseEntree = CONFIG_JEU.aliens.vitesseEntreeMinimum + amplitudeVitesse * ratioVitesse;
}

function calculerDelaiRenfortAlien(etat) {
  const intensite = calculerIntensiteInvasion(etat);
  const delai =
    CONFIG_JEU.aliens.delaiRenfortInitial -
    intensite * (CONFIG_JEU.aliens.delaiRenfortInitial - CONFIG_JEU.aliens.delaiRenfortMinimum);

  return Math.max(CONFIG_JEU.aliens.delaiRenfortMinimum, delai);
}

function calculerTailleRenfortAlien(etat) {
  const intensite = calculerIntensiteInvasion(etat);

  if (intensite >= 0.82) {
    return 3;
  }

  if (intensite >= 0.46) {
    return 2;
  }

  return 1;
}

function deployerRenfortsAliens(etat) {
  const tailleRenfort = Math.min(calculerTailleRenfortAlien(etat), etat.aliensEnReserve.length);

  for (let index = 0; index < tailleRenfort; index += 1) {
    const alien = etat.aliensEnReserve.shift();
    activerAlienEnRenfort(alien, index);
    etat.aliens.push(alien);
  }
}

function mettreAJourEntreeAliens(etat, deltaSecondes) {
  for (const alien of etat.aliens) {
    if (!alien.enEntree) {
      continue;
    }

    alien.y = Math.min(alien.yFormation, alien.y + alien.vitesseEntree * deltaSecondes);
    if (alien.y >= alien.yFormation) {
      alien.y = alien.yFormation;
      alien.enEntree = false;
      alien.vitesseEntree = 0;
    }
  }
}

function mettreAJourRenfortsAliens(etat, deltaSecondes) {
  if (etat.aliensEnReserve.length === 0) {
    mettreAJourEntreeAliens(etat, deltaSecondes);
    return;
  }

  etat.delaiRenfortAlien = Math.max(0, etat.delaiRenfortAlien - deltaSecondes);
  if (etat.delaiRenfortAlien === 0) {
    deployerRenfortsAliens(etat);
    etat.delaiRenfortAlien = calculerDelaiRenfortAlien(etat);
  }

  mettreAJourEntreeAliens(etat, deltaSecondes);
}

function mettreAJourAliens(etat, deltaSecondes) {
  if (bossEstActif(etat)) {
    mettreAJourBoss(etat, deltaSecondes);
    return;
  }

  mettreAJourRenfortsAliens(etat, deltaSecondes);

  if (compterAliensRestants(etat) === 0) {
    terminerPartie(etat, 'victory');
    return;
  }

  if (etat.aliens.length === 0) {
    return;
  }

  retirerOffsetsCompression(etat.aliens);
  deplacerAliensHorizontalement(etat, deltaSecondes);
  const bords = calculerBordsAliens(etat.aliens);

  if (doitInverserFlotte(bords)) {
    faireDescendreFlotte(etat);
  }

  appliquerOffsetsCompression(etat);
  mettreAJourTirAlien(etat, deltaSecondes);
  verifierDefaiteParDescente(etat, calculerBordsAliens(etat.aliens));
}

function projectileEstDansLaZone(projectile) {
  return (
    projectile.x + projectile.largeur >= -48 &&
    projectile.x <= CONFIG_JEU.largeur + 48 &&
    projectile.y + projectile.hauteur >= -48 &&
    projectile.y <= CONFIG_JEU.hauteur + 48
  );
}

function deplacerProjectiles(etat, deltaSecondes) {
  for (const projectile of etat.projectiles) {
    projectile.x += projectile.vitesseHorizontale * deltaSecondes;
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

function trouverBouclierBioTouche(projectile, boucliersBio) {
  for (const bouclierBio of boucliersBio) {
    if (collisionne(projectile, bouclierBio)) {
      return bouclierBio;
    }
  }

  return null;
}

function resoudreImpactBouclierBio(etat, projectile) {
  const bouclierBioTouche = trouverBouclierBioTouche(projectile, etat.boucliersBio);

  if (!bouclierBioTouche) {
    return false;
  }

  bouclierBioTouche.pointsDeVie -= 1;
  if (bouclierBioTouche.pointsDeVie <= 0) {
    etat.boucliersBio = etat.boucliersBio.filter((bouclierBio) => bouclierBio.id !== bouclierBioTouche.id);
  }

  return true;
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

function resoudreProjectileBoss(etat, projectile) {
  if (!etat.boss || !collisionne(projectile, etat.boss)) {
    return false;
  }

  etat.boss.pointsDeVie -= 1;
  if (etat.boss.pointsDeVie <= 0) {
    terminerBoss(etat);
  }

  return true;
}

function resoudreProjectileJoueur(etat, projectile, idsAliensDetruits) {
  if (resoudreProjectileBoss(etat, projectile)) {
    return true;
  }

  const alienTouche = trouverAlienTouche(projectile, etat.aliens, idsAliensDetruits);

  if (!alienTouche) {
    return false;
  }

  idsAliensDetruits.add(alienTouche.id);
  etat.score += alienTouche.points;

  if (!bossEstActif(etat) && etat.score >= etat.prochainPalierBoss) {
    etat.bossDoitApparaitre = true;
  }

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
  if (resoudreImpactBouclierBio(etat, projectile)) {
    return true;
  }

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

    if (etat.bossDoitApparaitre) {
      break;
    }
  }

  retirerAliensDetruits(etat, idsAliensDetruits);

  if (etat.bossDoitApparaitre) {
    etat.projectiles = projectilesRestants.filter((projectile) => projectile.proprietaire === 'joueur');
    activerBoss(etat);
    return;
  }

  etat.projectiles = projectilesRestants;
}

function mettreAJourChronometre(etat, deltaSecondes) {
  etat.tempsEcouleSecondes += deltaSecondes;
  etat.tempsRestantSecondes = etat.tempsEcouleSecondes;
  etat.tempsRestantFormate = formaterTemps(etat.tempsEcouleSecondes);
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

  if (declencherBossSiNecessaire(etat)) {
    return;
  }

  if (bossEstActif(etat)) {
    return;
  }

  if (compterAliensRestants(etat) === 0) {
    terminerPartie(etat, 'victory');
    return;
  }
}
