export const CONFIG_SPRITES = {
  player: { colonnes: 2, lignes: 2, totalFrames: 4 },
  ananas: { colonnes: 2, lignes: 2, totalFrames: 4 },
  mouche: { colonnes: 2, lignes: 2, totalFrames: 4 },
  papillon: { colonnes: 2, lignes: 2, totalFrames: 4 },
  pommefraise: { colonnes: 2, lignes: 2, totalFrames: 4 },
  banane: { colonnes: 2, lignes: 3, totalFrames: 6 },
  versdeterre: { colonnes: 2, lignes: 5, totalFrames: 10 },
  bullet: { colonnes: 2, lignes: 3, totalFrames: 6 },
};

// appliquerBoite positionne une entite dans le monde.
export function appliquerBoite(element, entite) {
  element.style.width = `${entite.largeur}px`;
  element.style.height = `${entite.hauteur}px`;
  element.style.transform = `translate3d(${Math.round(entite.x)}px, ${Math.round(entite.y)}px, 0)`;
}

// appliquerFrameSprite choisit la frame visible dans une spritesheet.
export function appliquerFrameSprite(element, entite, configSprite, indexFrame) {
  const frameNormalisee = ((indexFrame % configSprite.totalFrames) + configSprite.totalFrames) % configSprite.totalFrames;
  const colonne = frameNormalisee % configSprite.colonnes;
  const ligne = Math.floor(frameNormalisee / configSprite.colonnes);
  element.style.backgroundSize = `${entite.largeur * configSprite.colonnes}px ${entite.hauteur * configSprite.lignes}px`;
  element.style.backgroundPosition = `${-colonne * entite.largeur}px ${-ligne * entite.hauteur}px`;
}
