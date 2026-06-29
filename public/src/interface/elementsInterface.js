// Recupere tous les elements DOM utilises par le jeu.
export function recupererElementsInterface() {
  return {
    scene: document.getElementById('game-scene'), monde: document.getElementById('game-world'),
    coucheCarte: document.getElementById('tile-layer'), coucheEntites: document.getElementById('entity-layer'),
    superposition: document.getElementById('overlay'), tagSuperposition: document.getElementById('overlay-tag'),
    titreSuperposition: document.getElementById('overlay-title'), texteSuperposition: document.getElementById('overlay-text'),
    boutonContinuer: document.getElementById('continue-button'), boutonRecommencer: document.getElementById('restart-button'),
    panneauCartes: document.getElementById('map-panel'), optionsCartes: document.getElementById('map-options'),
    resumePanel: document.getElementById('resume-panel'), panneauBonusBoss: document.getElementById('boss-bonus-panel'),
    reelsBonusBoss: [
      document.getElementById('boss-bonus-reel-1'),
      document.getElementById('boss-bonus-reel-2'),
      document.getElementById('boss-bonus-reel-3'),
    ],
    resultatBonusBoss: document.getElementById('boss-bonus-result'), formulaireScore: document.getElementById('score-form'),
    inputNom: document.getElementById('player-name'), boutonSoumettre: document.getElementById('submit-score-button'),
    scoreFormMessage: document.getElementById('score-form-message'), panneauClassement: document.getElementById('ranking-panel'),
    rankingFeedback: document.getElementById('ranking-feedback'), rankingRows: document.getElementById('ranking-rows'),
    pageIndicator: document.getElementById('page-indicator'), boutonPagePrecedente: document.getElementById('page-prev'),
    boutonPageSuivante: document.getElementById('page-next'), hudBoss: document.getElementById('hud-boss'),
    hudBossBar: document.getElementById('hud-boss-bar'), hudBossLife: document.getElementById('hud-boss-life'),
    hudBonus: document.getElementById('hud-bonus'), hudBonusIcon: document.getElementById('hud-bonus-icon'),
    hudBonusName: document.getElementById('hud-bonus-name'), hudBonusTime: document.getElementById('hud-bonus-time'),
    hudTimer: document.getElementById('hud-timer'), hudScore: document.getElementById('hud-score'),
    hudLives: document.getElementById('hud-lives'), menuTemps: document.getElementById('menu-timer'),
    menuScore: document.getElementById('menu-score'), menuVies: document.getElementById('menu-lives'),
    debugBonusTrigger: document.getElementById('debug-bonus-trigger'),
  };
}
