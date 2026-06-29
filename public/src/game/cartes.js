import {
  LIGNES_CARTE_HANGAR,
  LIGNES_CARTE_RUINES,
  LIGNES_CARTE_SOLAIRE,
} from './cartesDonnees.js';

const LEGENDE_TUILES = {
  '.': 0,
  '#': 1,
  '=': 2,
  '^': 3,
  '*': 4,
  '+': 5,
};

// convertirLignesEnTuiles explique une etape dediee du module.
function convertirLignesEnTuiles(lignes) {
  const tuiles = [];

  for (const ligne of lignes) {
    for (const symbole of ligne) {
      tuiles.push(LEGENDE_TUILES[symbole] ?? 0);
    }
  }

  return tuiles;
}

// creerGetTile explique une etape dediee du module.
function creerGetTile(tuiles, colonnes) {
  return function lireTuile(colonne, ligne) {
    return tuiles[ligne * colonnes + colonne];
  };
}

// creerCarte explique une etape dediee du module.
function creerCarte(id, nom, resume, lignesBrutes) {
  const colonnes = lignesBrutes[0].length;
  const lignes = lignesBrutes.length;
  const tailleTuile = 32;
  const tuiles = convertirLignesEnTuiles(lignesBrutes);

  return {
    id,
    nom,
    resume,
    colonnes,
    lignes,
    tailleTuile,
    columns: colonnes,
    rows: lignes,
    size: tailleTuile,
    tuiles,
    tiles: tuiles,
    getTile: creerGetTile(tuiles, colonnes),
  };
}

const CARTE_HANGAR = creerCarte('hangar', 'Hangar orbital', 'Piste stable et lignes claires.', LIGNES_CARTE_HANGAR);

const CARTE_RUINES = creerCarte('ruines', 'Ruines plasma', 'Blocs reacteurs et zones denses.', LIGNES_CARTE_RUINES);

const CARTE_SOLAIRE = creerCarte('solaire', 'Forteresse solaire', 'Balises et couloirs de defense.', LIGNES_CARTE_SOLAIRE);

export const LISTE_CARTES = [CARTE_HANGAR, CARTE_RUINES, CARTE_SOLAIRE];

const CARTES_PAR_ID = new Map();

for (const carte of LISTE_CARTES) {
  CARTES_PAR_ID.set(carte.id, carte);
}

// recupererCarte explique une etape dediee du module.
export function recupererCarte(idCarte) {
  return CARTES_PAR_ID.get(idCarte) || LISTE_CARTES[0];
}
