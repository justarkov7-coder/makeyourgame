export const CONFIG_JEU = {
  largeur: 960,
  hauteur: 640,
  viesInitiales: 3,
  dureeMancheSecondes: 120,
  joueur: {
    largeur: 64,
    hauteur: 40,
    vitesse: 420,
    delaiEntreTirs: 0.22,
    dureeBouclierReapparition: 1.1,
  },
  aliens: {
    colonnes: 9,
    lignes: 5,
    largeur: 48,
    hauteur: 32,
    ecartHorizontal: 18,
    ecartVertical: 18,
    departX: 120,
    departY: 84,
    vitesseBase: 52,
    bonusVitesseParAlienDetruit: 8,
    descenteParRebond: 22,
    delaiEntreTirs: 0.68,
  },
  projectiles: {
    vitesseJoueur: 540,
    vitesseAlien: 310,
    largeur: 12,
    hauteur: 24,
  },
  histoire: {
    scorePalier: 120,
  },
  cartes: {
    idParDefaut: 'hangar',
  },
  classement: {
    pageSize: 5,
  },
};
