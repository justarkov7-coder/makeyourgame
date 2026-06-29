export const BONUS_BOSS = [
  {
    id: 'rapid-fire',
    symbole: 'BLAST',
    titre: 'Cadence turbo',
    description: 'Le delai entre deux tirs baisse pour le reste de la partie.',
  },
  {
    id: 'hull-up',
    symbole: 'LIFE',
    titre: 'Coque renforcee',
    description: 'Une vie supplementaire est ajoutee immediatement.',
  },
  {
    id: 'thruster-up',
    symbole: 'SPEED',
    titre: 'Reacteurs boostes',
    description: 'La vitesse de deplacement du joueur augmente durablement.',
  },
];

export const DUREE_BONUS_DOUBLE_SECONDES = 30;
export const DUREE_BONUS_TRIPLE_SECONDES = 45;

function choisirIndexAleatoire(taille) {
  return Math.floor(Math.random() * taille);
}

export function recupererBonusBoss(idBonus) {
  return BONUS_BOSS.find((bonus) => bonus.id === idBonus) || BONUS_BOSS[0];
}

export function creerReelsBonusBoss(idBonusGagnant) {
  const reels = BONUS_BOSS.map((bonus) => bonus.id);
  const bonusSecondaires = reels.filter((idBonus) => idBonus !== idBonusGagnant);
  const nombreOccurrencesGagnantes = Math.random() < 0.28 ? 3 : 2;
  const reelsFinaux = Array(nombreOccurrencesGagnantes).fill(idBonusGagnant);

  if (nombreOccurrencesGagnantes === 2) {
    reelsFinaux.push(bonusSecondaires[choisirIndexAleatoire(bonusSecondaires.length)]);
  }

  return reelsFinaux.sort(() => Math.random() - 0.5);
}

export function tirerBonusBossAleatoire() {
  const bonus = BONUS_BOSS[choisirIndexAleatoire(BONUS_BOSS.length)];
  const reelsFinaux = creerReelsBonusBoss(bonus.id);
  const occurrencesGagnantes = reelsFinaux.filter((idBonus) => idBonus === bonus.id).length;

  return {
    bonusId: bonus.id,
    reelsFinaux,
    occurrencesGagnantes,
    dureeSecondes:
      occurrencesGagnantes >= 3 ? DUREE_BONUS_TRIPLE_SECONDES : DUREE_BONUS_DOUBLE_SECONDES,
  };
}
