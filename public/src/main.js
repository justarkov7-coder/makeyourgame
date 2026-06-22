import { GameLoop } from './core/GameLoop.js';
import { InputManager } from './core/InputManager.js';
import { PerfMonitor } from './core/PerfMonitor.js';
import { createInitialState } from './game/createState.js';
import { updateGame } from './game/updateGame.js';
import { DomRenderer } from './render/DomRenderer.js';
import { HudController } from './ui/HudController.js';

const scene = document.getElementById('game-scene');
const world = document.getElementById('game-world');
const entityLayer = document.getElementById('entity-layer');
const overlay = document.getElementById('overlay');
const continueButton = document.getElementById('continue-button');
const restartButton = document.getElementById('restart-button');

const hud = new HudController({
  hudTimer: document.getElementById('hud-timer'),
  hudScore: document.getElementById('hud-score'),
  hudLives: document.getElementById('hud-lives'),
  hudFps: document.getElementById('hud-fps'),
  menuTimer: document.getElementById('menu-timer'),
  menuScore: document.getElementById('menu-score'),
  menuLives: document.getElementById('menu-lives'),
  menuFps: document.getElementById('menu-fps'),
  overlay,
  overlayTitle: document.getElementById('overlay-title'),
  overlayText: document.getElementById('overlay-text'),
  continueButton,
});

const renderer = new DomRenderer({
  scene,
  world,
  entityLayer,
});

const input = new InputManager();
const perf = new PerfMonitor();

let state = createInitialState();

function restartGame() {
  state = createInitialState();
}

function togglePause() {
  if (state.phase === 'running') {
    state.phase = 'paused';
    return;
  }

  if (state.phase === 'paused') {
    state.phase = 'running';
  }
}

input.onPress('Escape', togglePause);
input.onPress('KeyP', togglePause);
input.onPress('KeyR', restartGame);
input.attach();

continueButton.addEventListener('click', () => {
  if (state.phase === 'paused') {
    state.phase = 'running';
  }
});

restartButton.addEventListener('click', restartGame);

const loop = new GameLoop({
  onFrame({ deltaSeconds }) {
    perf.track(deltaSeconds);
    updateGame(state, input, deltaSeconds);
    renderer.render(state);
    hud.render(state, perf.snapshot());
  },
});

window.addEventListener('blur', () => {
  if (state.phase === 'running') {
    state.phase = 'paused';
  }
});

renderer.render(state);
hud.render(state, perf.snapshot());
loop.start();
