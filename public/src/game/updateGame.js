import { GAME_CONFIG } from './config.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function spawnBullet(state, owner, x, y, velocityY) {
  state.bullets.push({
    id: `bullet-${state.nextBulletId}`,
    owner,
    x,
    y,
    width: GAME_CONFIG.bullets.width,
    height: GAME_CONFIG.bullets.height,
    velocityY,
  });
  state.nextBulletId += 1;
}

function updatePlayer(state, input, deltaSeconds) {
  const { player } = state;
  const moveLeft = input.isDown('ArrowLeft') || input.isDown('KeyA');
  const moveRight = input.isDown('ArrowRight') || input.isDown('KeyD');
  const direction = Number(moveRight) - Number(moveLeft);

  player.x = clamp(
    player.x + direction * GAME_CONFIG.player.speed * deltaSeconds,
    0,
    GAME_CONFIG.width - player.width,
  );

  player.shootCooldown = Math.max(0, player.shootCooldown - deltaSeconds);
  player.shieldSeconds = Math.max(0, player.shieldSeconds - deltaSeconds);

  if (input.isDown('Space') && player.shootCooldown === 0) {
    spawnBullet(
      state,
      'player',
      player.x + player.width / 2 - GAME_CONFIG.bullets.width / 2,
      player.y - GAME_CONFIG.bullets.height,
      -GAME_CONFIG.bullets.playerSpeed,
    );
    player.shootCooldown = GAME_CONFIG.player.shootCooldown;
  }
}

function getAlienBounds(aliens) {
  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const alien of aliens) {
    minX = Math.min(minX, alien.x);
    maxX = Math.max(maxX, alien.x + alien.width);
    maxY = Math.max(maxY, alien.y + alien.height);
  }

  return {
    minX,
    maxX,
    maxY,
  };
}

function updateAliens(state, deltaSeconds) {
  if (state.aliens.length === 0) {
    state.phase = 'victory';
    return;
  }

  const speedBoost =
    (GAME_CONFIG.aliens.rows * GAME_CONFIG.aliens.columns - state.aliens.length) *
    GAME_CONFIG.aliens.speedStep;
  const velocityX = (state.alienSpeed + speedBoost) * state.alienDirection;

  for (const alien of state.aliens) {
    alien.x += velocityX * deltaSeconds;
  }

  const bounds = getAlienBounds(state.aliens);
  const hitRightWall = bounds.maxX >= GAME_CONFIG.width - 12;
  const hitLeftWall = bounds.minX <= 12;

  if (hitLeftWall || hitRightWall) {
    state.alienDirection *= -1;

    for (const alien of state.aliens) {
      alien.x = clamp(alien.x, 12, GAME_CONFIG.width - alien.width - 12);
      alien.y += GAME_CONFIG.aliens.dropDistance;
    }
  }

  state.alienFireCooldown = Math.max(0, state.alienFireCooldown - deltaSeconds);

  if (state.alienFireCooldown === 0) {
    const shootersByColumn = new Map();

    for (const alien of state.aliens) {
      const current = shootersByColumn.get(alien.column);
      if (!current || alien.y > current.y) {
        shootersByColumn.set(alien.column, alien);
      }
    }

    const shooters = [...shootersByColumn.values()];

    if (shooters.length > 0) {
      const shooter = shooters[Math.floor(Math.random() * shooters.length)];
      spawnBullet(
        state,
        'alien',
        shooter.x + shooter.width / 2 - GAME_CONFIG.bullets.width / 2,
        shooter.y + shooter.height + 6,
        GAME_CONFIG.bullets.alienSpeed,
      );
    }

    state.alienFireCooldown = GAME_CONFIG.aliens.fireCooldownSeconds;
  }

  if (bounds.maxY >= state.player.y) {
    state.phase = 'game-over';
  }
}

function updateBullets(state, deltaSeconds) {
  for (const bullet of state.bullets) {
    bullet.y += bullet.velocityY * deltaSeconds;
  }

  state.bullets = state.bullets.filter(
    (bullet) => bullet.y + bullet.height >= -24 && bullet.y <= GAME_CONFIG.height + 24,
  );
}

function damagePlayer(state) {
  if (state.player.shieldSeconds > 0) {
    return;
  }

  state.lives -= 1;
  state.player.shieldSeconds = GAME_CONFIG.player.respawnShieldSeconds;

  if (state.lives <= 0) {
    state.phase = 'game-over';
  }
}

function handleCollisions(state) {
  const remainingBullets = [];
  const destroyedAliens = new Set();

  for (const bullet of state.bullets) {
    let bulletConsumed = false;

    if (bullet.owner === 'player') {
      for (const alien of state.aliens) {
        if (destroyedAliens.has(alien.id)) {
          continue;
        }

        if (isColliding(bullet, alien)) {
          destroyedAliens.add(alien.id);
          state.score += alien.points;
          bulletConsumed = true;
          break;
        }
      }
    } else if (isColliding(bullet, state.player)) {
      damagePlayer(state);
      bulletConsumed = true;
    }

    if (!bulletConsumed) {
      remainingBullets.push(bullet);
    }
  }

  if (destroyedAliens.size > 0) {
    state.aliens = state.aliens.filter((alien) => !destroyedAliens.has(alien.id));
  }

  state.bullets = remainingBullets;
}

export function updateGame(state, input, deltaSeconds) {
  if (state.phase !== 'running') {
    return;
  }

  state.timeLeftSeconds = Math.max(0, state.timeLeftSeconds - deltaSeconds);

  if (state.timeLeftSeconds === 0) {
    state.phase = 'game-over';
    return;
  }

  updatePlayer(state, input, deltaSeconds);
  updateAliens(state, deltaSeconds);

  if (state.phase !== 'running') {
    return;
  }

  updateBullets(state, deltaSeconds);
  handleCollisions(state);

  if (state.phase === 'running' && state.aliens.length === 0) {
    state.phase = 'victory';
  }
}
