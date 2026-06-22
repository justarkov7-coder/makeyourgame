import { GAME_CONFIG } from './config.js';

function createAliens() {
  const aliens = [];
  let id = 0;

  for (let row = 0; row < GAME_CONFIG.aliens.rows; row += 1) {
    for (let column = 0; column < GAME_CONFIG.aliens.columns; column += 1) {
      aliens.push({
        id: `alien-${id}`,
        type: `tier-${Math.min(3, row + 1)}`,
        row,
        column,
        width: GAME_CONFIG.aliens.width,
        height: GAME_CONFIG.aliens.height,
        x:
          GAME_CONFIG.aliens.startX +
          column * (GAME_CONFIG.aliens.width + GAME_CONFIG.aliens.gapX),
        y:
          GAME_CONFIG.aliens.startY +
          row * (GAME_CONFIG.aliens.height + GAME_CONFIG.aliens.gapY),
        points: (GAME_CONFIG.aliens.rows - row) * 10,
      });
      id += 1;
    }
  }

  return aliens;
}

export function createInitialState() {
  return {
    phase: 'running',
    score: 0,
    lives: GAME_CONFIG.initialLives,
    timeLeftSeconds: GAME_CONFIG.roundDurationSeconds,
    nextBulletId: 0,
    alienDirection: 1,
    alienSpeed: GAME_CONFIG.aliens.baseSpeed,
    alienFireCooldown: 0.3,
    player: {
      x: GAME_CONFIG.width / 2 - GAME_CONFIG.player.width / 2,
      y: GAME_CONFIG.height - 76,
      width: GAME_CONFIG.player.width,
      height: GAME_CONFIG.player.height,
      shootCooldown: 0,
      shieldSeconds: 0,
    },
    bullets: [],
    aliens: createAliens(),
  };
}
