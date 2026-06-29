import { chromium } from '/usr/local/lib/node_modules/playwright/index.mjs';
import { reinitialiserScores, verifier } from './aides-e2e.mjs';
import { verifierClassement, verifierPagination } from './scenarios-classement.mjs';
import { demarrerPartie, verifierBriefing, verifierCheckpoint, verifierPause, verifierRenduCarte, verifierSelectionCartes } from './scenarios-navigation.mjs';

// lancer execute le scenario E2E complet.
async function lancer() {
  await reinitialiserScores();
  const navigateur = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await navigateur.newPage({ viewport: { width: 1440, height: 1200 } });
  const erreursConsole = [];
  page.on('pageerror', function noterErreurPage(erreur) { erreursConsole.push(`pageerror: ${erreur.message}`); });
  page.on('console', function noterErreurConsole(message) {
    if (message.type() === 'error') erreursConsole.push(`console: ${message.text()}`);
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
    verifier(erreursConsole.length === 0, `Erreurs console detectees: ${erreursConsole.join(' | ')}`);
    await page.screenshot({ path: '/private/tmp/makeyourgame-bonus-flow.png', fullPage: true });
    console.log('E2E bonus flow OK');
  } finally {
    await navigateur.close();
    await reinitialiserScores();
  }
}

lancer().catch(function gererErreurLancement(erreur) {
  console.error(erreur);
  process.exit(1);
});
