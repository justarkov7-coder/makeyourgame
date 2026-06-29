export const BONUS_BOSS = [
  {
    id: 'rapid-fire',
    symbole: 'BLAST',
    titre: 'Cadence turbo',
    description: 'Le delai entre deux tirs baisse pour le reste de la partie.',
  },
  {
    id: 'hull-up',
    symbole: 'SHLD',
    titre: 'Coque renforcee',
    description: 'Les projectiles ennemis proches sont repousses par la coque.',
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

// choisirIndexAleatoire explique une etape dediee du module.
function choisirIndexAleatoire(taille) {
  return Math.floor(Math.random() * taille);
}

// recupererBonusBoss explique une etape dediee du module.
export function recupererBonusBoss(idBonus) {
  for (const bonus of BONUS_BOSS) {
    if (bonus.id === idBonus) {
      return bonus;
    }
  }

  return BONUS_BOSS[0];
}

// creerReelsBonusBoss explique une etape dediee du module.
export function creerReelsBonusBoss(idBonusGagnant) {
  const reels = [];
  const bonusSecondaires = [];
  const nombreOccurrencesGagnantes = Math.random() < 0.28 ? 3 : 2;
  const reelsFinaux = Array(nombreOccurrencesGagnantes).fill(idBonusGagnant);

  for (const bonus of BONUS_BOSS) {
    reels.push(bonus.id);
    if (bonus.id !== idBonusGagnant) {
      bonusSecondaires.push(bonus.id);
    }
  }

  if (nombreOccurrencesGagnantes === 2) {
    reelsFinaux.push(bonusSecondaires[choisirIndexAleatoire(bonusSecondaires.length)]);
  }

  return melangerReels(reelsFinaux);
}

// melangerReels explique une etape dediee du module.
function melangerReels(reels) {
  for (let index = reels.length - 1; index > 0; index -= 1) {
    const indexAleatoire = choisirIndexAleatoire(index + 1);
    const valeur = reels[index];
    reels[index] = reels[indexAleatoire];
    reels[indexAleatoire] = valeur;
  }

  return reels;
}

// tirerBonusBossAleatoire explique une etape dediee du module.
export function tirerBonusBossAleatoire() {
  const bonus = BONUS_BOSS[choisirIndexAleatoire(BONUS_BOSS.length)];
  const reelsFinaux = creerReelsBonusBoss(bonus.id);
  let occurrencesGagnantes = 0;

  for (const idBonus of reelsFinaux) {
    if (idBonus === bonus.id) {
      occurrencesGagnantes += 1;
    }
  }

  return {
    bonusId: bonus.id,
    reelsFinaux,
    occurrencesGagnantes,
    dureeSecondes:
      occurrencesGagnantes >= 3 ? DUREE_BONUS_TRIPLE_SECONDES : DUREE_BONUS_DOUBLE_SECONDES,
  };
}
