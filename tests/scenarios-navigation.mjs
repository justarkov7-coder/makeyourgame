import { attendreTexte, URL_TEST, verifier } from './aides-e2e.mjs';

// verifierBriefing valide le premier ecran.
export async function verifierBriefing(page) {
  await page.goto(URL_TEST);
  await attendreTexte(page, 'Selection du pilote / secteur');
  const cartes = ['Hangar orbital', 'Ruines plasma', 'Forteresse solaire'];
  for (const carte of cartes) await page.getByRole('button', { name: carte }).waitFor({ state: 'visible' });
}

// verifierSelectionCartes teste les trois cartes disponibles.
export async function verifierSelectionCartes(page) {
  const ids = ['hangar', 'ruines', 'solaire'];
  const noms = ['Hangar orbital', 'Ruines plasma', 'Forteresse solaire'];
  for (let index = 0; index < ids.length; index += 1) {
    await verifierBriefing(page);
    await page.getByRole('button', { name: noms[index] }).click();
    const idCarte = await page.evaluate(function lireCarteSelectionnee() { return window.__etatRef.valeur.carte.id; });
    verifier(idCarte === ids[index], `La carte selectionnee devrait etre ${ids[index]}`);
  }
}

// demarrerPartie lance une partie sur la carte demandee.
export async function demarrerPartie(page, nomCarte) {
  await verifierBriefing(page);
  await page.getByRole('button', { name: nomCarte }).click();
  await page.locator('#overlay').waitFor({ state: 'hidden' });
}

// verifierRenduCarte controle le rendu de la carte.
export async function verifierRenduCarte(page) {
  const infos = await page.evaluate(function lireInfosCarte() {
    return { idCarte: window.__etatRef.valeur.carte.id, nombreTuiles: document.querySelectorAll('#tile-layer .tile').length };
  });
  verifier(infos.idCarte === 'ruines', 'La partie de test devrait tourner sur la carte ruines');
  verifier(infos.nombreTuiles === 600, 'La carte devrait rendre 600 tuiles');
}

// verifierPause teste la pause et la reprise.
export async function verifierPause(page) {
  await page.keyboard.press('Escape');
  await attendreTexte(page, 'Simulation suspendue');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.locator('#overlay').waitFor({ state: 'hidden' });
}

// verifierCheckpoint force le bonus boss via l'action de test.
export async function verifierCheckpoint(page) {
  await page.evaluate(function preparerCheckpoint() {
    window.__actions.declencherBonusBossTest();
  });
  await attendreTexte(page, 'Machine a sous activee');
  await page.locator('#overlay').waitFor({ state: 'hidden' });
}
