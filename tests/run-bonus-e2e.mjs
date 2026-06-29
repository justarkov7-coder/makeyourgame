import { chromium } from '/usr/local/lib/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';

const URL = 'http://127.0.0.1:3010';
const FICHIER_SCORES = new globalThis.URL('../api/scores.json', import.meta.url);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function attendreTexte(page, texte) {
  await page.locator(`text=${texte}`).first().waitFor({ state: 'visible' });
}

async function verifierBriefing(page) {
  await page.goto(URL);
  await attendreTexte(page, 'Briefing orbital');

  const cartes = ['Hangar orbital', 'Ruines plasma', 'Forteresse solaire'];
  for (const carte of cartes) {
    await page.getByRole('button', { name: carte }).waitFor({ state: 'visible' });
  }
}

async function verifierSelectionCartes(page) {
  const ids = ['hangar', 'ruines', 'solaire'];
  const noms = ['Hangar orbital', 'Ruines plasma', 'Forteresse solaire'];

  for (let index = 0; index < ids.length; index += 1) {
    await page.getByRole('button', { name: noms[index] }).click();
    const idCarte = await page.evaluate(() => window.__etatRef.valeur.carte.id);
    assert(idCarte === ids[index], `La carte selectionnee devrait etre ${ids[index]}`);
  }
}

async function demarrerPartie(page, nomCarte) {
  await verifierBriefing(page);
  await page.getByRole('button', { name: nomCarte }).click();
  await page.getByRole('button', { name: 'Demarrer' }).click();
  await page.locator('#overlay').waitFor({ state: 'hidden' });
}

async function verifierRenduCarte(page) {
  const infos = await page.evaluate(() => ({
    idCarte: window.__etatRef.valeur.carte.id,
    nombreTuiles: document.querySelectorAll('#tile-layer .tile').length,
  }));

  assert(infos.idCarte === 'ruines', 'La partie de test devrait tourner sur la carte ruines');
  assert(infos.nombreTuiles === 600, 'La carte devrait rendre 600 tuiles');
}

async function verifierPause(page) {
  await page.keyboard.press('Escape');
  await attendreTexte(page, 'Simulation suspendue');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.locator('#overlay').waitFor({ state: 'hidden' });
}

async function verifierCheckpoint(page) {
  await page.evaluate(() => {
    window.__etatRef.valeur.phase = 'running';
    window.__etatRef.valeur.score = 120;
  });
  await page.waitForTimeout(80);
  await attendreTexte(page, 'Relais securise');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.locator('#overlay').waitFor({ state: 'hidden' });
}

async function verifierClassement(page) {
  await page.evaluate(() => {
    window.__etatRef.valeur.phase = 'saisie-score';
    window.__etatRef.valeur.resultat = 'defeat';
    window.__etatRef.valeur.score = 180;
    window.__etatRef.valeur.tempsEcouleSecondes = 91;
  });
  await attendreTexte(page, 'Dernier signal');
  await page.getByPlaceholder('Capitaine Nova').fill('TestPilot');
  await page.getByRole('button', { name: 'Envoyer' }).click();
  await attendreTexte(page, 'Classement des pilotes');
  await attendreTexte(page, 'Bravo TestPilot');
  await attendreTexte(page, 'TestPilot');

  const apiScores = await page.evaluate(async () => {
    const reponse = await fetch('/api/scores');
    return reponse.json();
  });

  assert(Array.isArray(apiScores.scores), 'La liste de scores API devrait etre un tableau');
  assert(apiScores.scores.some((score) => score.name === 'TestPilot'), 'Le score TestPilot devrait etre stocke');
  const entree = apiScores.scores.find((score) => score.name === 'TestPilot');
  assert(typeof entree.rank === 'number', 'Chaque score devrait exposer rank');
  assert(typeof entree.time === 'string', 'Chaque score devrait exposer time');
}

async function ajouterScoresPourPagination(page) {
  await page.evaluate(async () => {
    const pilotes = [
      ['Alpha', 320, 40],
      ['Beta', 300, 44],
      ['Gamma', 280, 48],
      ['Delta', 260, 52],
      ['Epsilon', 240, 56],
      ['Zeta', 220, 60],
    ];

    for (const [name, score, timeSeconds] of pilotes) {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score, timeSeconds }),
      });
    }
  });
}

async function verifierPagination(page) {
  await ajouterScoresPourPagination(page);
  await page.evaluate(() => window.__actions.pageSuivante());
  await page.waitForTimeout(150);
  await page.getByText('Page 2/2').waitFor({ state: 'visible' });
  const textePage = await page.locator('#ranking-rows').innerText();
  assert(textePage.includes('Zeta') || textePage.includes('TestPilot'), 'La seconde page devrait afficher des scores plus bas');
  await page.evaluate(() => window.__actions.pagePrecedente());
  await page.waitForTimeout(150);
  await page.getByText('Page 1/2').waitFor({ state: 'visible' });
}

async function reinitialiserScores() {
  await writeFile(FICHIER_SCORES, '[]\n');
}

async function lancer() {
  await reinitialiserScores();
  const navigateur = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const page = await navigateur.newPage({ viewport: { width: 1440, height: 1200 } });
  const erreursConsole = [];
  page.on('pageerror', (erreur) => erreursConsole.push(`pageerror: ${erreur.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      erreursConsole.push(`console: ${message.text()}`);
    }
  });

  try {
    await verifierBriefing(page);
    await verifierSelectionCartes(page);
    await demarrerPartie(page, 'Ruines plasma');
    await verifierRenduCarte(page);
    await verifierPause(page);
    await verifierCheckpoint(page);
    await verifierClassement(page);
    await verifierPagination(page);

    assert(erreursConsole.length === 0, `Erreurs console detectees: ${erreursConsole.join(' | ')}`);
    await page.screenshot({ path: '/private/tmp/makeyourgame-bonus-flow.png', fullPage: true });
    console.log('E2E bonus flow OK');
  } finally {
    await navigateur.close();
    await reinitialiserScores();
  }
}

lancer().catch((erreur) => {
  console.error(erreur);
  process.exit(1);
});
