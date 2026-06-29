import { attendreTexte, verifier } from './aides-e2e.mjs';

// verifierClassement teste la soumission et la lecture API.
export async function verifierClassement(page) {
  await page.evaluate(function preparerClassement() {
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
  const apiScores = await page.evaluate(async function chargerScoresApi() {
    const reponse = await fetch('/api/scores');
    return reponse.json();
  });
  verifier(Array.isArray(apiScores.scores), 'La liste de scores API devrait etre un tableau');
  verifier(apiScores.scores.some(function scoreAppartientAuPilote(score) { return score.name === 'TestPilot'; }), 'Le score TestPilot devrait etre stocke');
  const entree = apiScores.scores.find(function trouverScorePilote(score) { return score.name === 'TestPilot'; });
  verifier(typeof entree.rank === 'number', 'Chaque score devrait exposer rank');
  verifier(typeof entree.time === 'string', 'Chaque score devrait exposer time');
}

// ajouterScoresPourPagination cree assez de scores pour deux pages.
async function ajouterScoresPourPagination(page) {
  await page.evaluate(async function envoyerScoresPagination() {
    const pilotes = [['Alpha', 320, 40], ['Beta', 300, 44], ['Gamma', 280, 48], ['Delta', 260, 52], ['Epsilon', 240, 56], ['Zeta', 220, 60]];
    for (const [name, score, timeSeconds] of pilotes) {
      await fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, score, timeSeconds }) });
    }
  });
}

// verifierPagination teste les boutons de pages.
export async function verifierPagination(page) {
  await ajouterScoresPourPagination(page);
  await page.evaluate(function allerPageSuivante() { return window.__actions.pageSuivante(); });
  await page.waitForTimeout(150);
  await page.getByText('Page 2/2').waitFor({ state: 'visible' });
  const textePage = await page.locator('#ranking-rows').innerText();
  verifier(textePage.includes('Zeta') || textePage.includes('TestPilot'), 'La seconde page devrait afficher des scores plus bas');
  await page.evaluate(function allerPagePrecedente() { return window.__actions.pagePrecedente(); });
  await page.waitForTimeout(150);
  await page.getByText('Page 1/2').waitFor({ state: 'visible' });
}
