import { CONFIG_JEU } from './config.js';
import { recupererBonusBoss, tirerBonusBossAleatoire } from './bonusBoss.js';
import { creerDeploiementAliens } from './etatAliens.js';
import { creerBoss } from './etatBoss.js';
import { bossEstActif, nettoyerProjectilesHostiles } from './moteurCommun.js';

// creerNouvelleVague replace une flotte apres le bonus.
function creerNouvelleVague(etat) {
  const { aliensActifs, aliensEnReserve } = creerDeploiementAliens();
  etat.aliens = aliensActifs; etat.aliensEnReserve = aliensEnReserve;
  etat.directionAliens = 1; etat.delaiRenfortAlien = CONFIG_JEU.aliens.delaiRenfortInitial; etat.delaiTirAlien = 0.8;
}

// activerBoss remplace la flotte par un boss.
function activerBoss(etat) {
  etat.aliens = []; etat.aliensEnReserve = [];
  nettoyerProjectilesHostiles(etat);
  etat.vies += 2; etat.joueur.bouclierSecondes = Math.max(etat.joueur.bouclierSecondes, 1.25);
  etat.bossDoitApparaitre = false; etat.boss = creerBoss(etat.bossesVaincus);
  etat.prochainPalierBoss += CONFIG_JEU.boss.palierScore;
}

// preparerMachineSousBoss construit le tirage de bonus.
function preparerMachineSousBoss(etat) {
  const resultat = tirerBonusBossAleatoire();
  etat.phase = 'bonus-boss'; etat.resultat = null;
  etat.bonusBoss = { sequence: etat.bonusBoss.sequence + 1, bonusId: resultat.bonusId, reelsFinaux: resultat.reelsFinaux, occurrencesGagnantes: resultat.occurrencesGagnantes, dureeSecondes: resultat.dureeSecondes, estRevele: false, estApplique: false };
}

// terminerBoss recompense le joueur et ouvre le bonus.
export function terminerBoss(etat) {
  etat.score += etat.boss.pointsBonus; etat.boss = null; etat.bossesVaincus += 1;
  nettoyerProjectilesHostiles(etat); preparerMachineSousBoss(etat);
}

// reinitialiserStatsBonusJoueur retire les effets temporaires.
function reinitialiserStatsBonusJoueur(etat) {
  etat.joueur.vitesse = CONFIG_JEU.joueur.vitesse;
  etat.joueur.delaiEntreTirs = CONFIG_JEU.joueur.delaiEntreTirs;
}

// appliquerBonusBoss applique le gain tire par la machine.
function appliquerBonusBoss(etat) {
  if (etat.bonusBoss.estApplique || !etat.bonusBoss.bonusId) return;
  const bonus = recupererBonusBoss(etat.bonusBoss.bonusId);
  reinitialiserStatsBonusJoueur(etat);
  etat.bonusActif = { bonusId: bonus.id, titre: bonus.titre, symbole: bonus.symbole, tempsRestantSecondes: etat.bonusBoss.dureeSecondes, dureeSecondes: etat.bonusBoss.dureeSecondes, occurrencesGagnantes: etat.bonusBoss.occurrencesGagnantes };
  if (bonus.id === 'rapid-fire') etat.joueur.delaiEntreTirs = Math.max(0.08, CONFIG_JEU.joueur.delaiEntreTirs * 0.72);
  if (bonus.id === 'thruster-up') etat.joueur.vitesse = Math.min(760, CONFIG_JEU.joueur.vitesse * 1.22);
  etat.bonusBoss.estApplique = true;
}

// mettreAJourBonusActif decremente le bonus et le termine.
export function mettreAJourBonusActif(etat, deltaSecondes) {
  if (!etat.bonusActif?.bonusId) return;
  etat.bonusActif.tempsRestantSecondes = Math.max(0, etat.bonusActif.tempsRestantSecondes - deltaSecondes);
  if (etat.bonusActif.tempsRestantSecondes > 0) return;
  reinitialiserStatsBonusJoueur(etat);
  etat.bonusActif = { bonusId: '', titre: '', symbole: '', tempsRestantSecondes: 0, dureeSecondes: 0, occurrencesGagnantes: 0 };
}

// declencherBossSiNecessaire active un boss quand le palier est atteint.
export function declencherBossSiNecessaire(etat) {
  if (bossEstActif(etat) || (etat.score < etat.prochainPalierBoss && !etat.bossDoitApparaitre)) return false;
  activerBoss(etat); return true;
}

// revelerBonusBoss affiche puis applique le bonus tire.
export function revelerBonusBoss(etat) {
  if (etat.phase !== 'bonus-boss' || etat.bonusBoss.estRevele) return;
  appliquerBonusBoss(etat); etat.bonusBoss.estRevele = true;
}

// reprendreApresBonusBoss relance une vague apres le bonus.
export function reprendreApresBonusBoss(etat) {
  if (etat.phase !== 'bonus-boss' || !etat.bonusBoss.estRevele) return;
  creerNouvelleVague(etat);
  etat.bonusBoss = { sequence: etat.bonusBoss.sequence, bonusId: '', reelsFinaux: [], occurrencesGagnantes: 0, dureeSecondes: 0, estRevele: false, estApplique: false };
  etat.phase = 'running';
}

// declencherBonusBossTest force le bonus pour le mode debug.
export function declencherBonusBossTest(etat) {
  etat.boss = null; etat.bossDoitApparaitre = false; etat.resultat = null;
  nettoyerProjectilesHostiles(etat); preparerMachineSousBoss(etat);
}
