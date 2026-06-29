import { writeFile } from 'node:fs/promises';

export const URL_TEST = 'http://127.0.0.1:3010';
const FICHIER_SCORES = new globalThis.URL('../api/scores.json', import.meta.url);

// verifier affirme une condition de test.
export function verifier(condition, message) {
  if (!condition) throw new Error(message);
}

// attendreTexte attend un texte visible dans la page.
export async function attendreTexte(page, texte) {
  await page.locator(`text=${texte}`).first().waitFor({ state: 'visible' });
}

// reinitialiserScores vide les donnees persistantes du test.
export async function reinitialiserScores() {
  await writeFile(FICHIER_SCORES, '[]\n');
}
