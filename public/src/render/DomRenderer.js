function setBox(element, entity) {
  element.style.width = `${entity.width}px`;
  element.style.height = `${entity.height}px`;
  element.style.transform = `translate3d(${Math.round(entity.x)}px, ${Math.round(entity.y)}px, 0)`;
}

export class DomRenderer {
  constructor({ scene, world, entityLayer }) {
    this.scene = scene;
    this.world = world;
    this.entityLayer = entityLayer;
    this.entityLayer.innerHTML = '';
    this.playerElement = this.createPlayer();
    this.entityLayer.append(this.playerElement);
    this.alienElements = new Map();
    this.bulletElements = new Map();
    this.layoutWorld = this.layoutWorld.bind(this);
    this.layoutWorld();
    window.addEventListener('resize', this.layoutWorld);
  }

  layoutWorld() {
    const rect = this.scene.getBoundingClientRect();
    const scale = Math.min(rect.width / 960, rect.height / 640);
    const offsetX = (rect.width - 960 * scale) / 2;
    const offsetY = (rect.height - 640 * scale) / 2;
    this.world.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  }

  createPlayer() {
    const element = document.createElement('div');
    element.className = 'entity player';
    return element;
  }

  createAlien(alien) {
    const element = document.createElement('div');
    element.className = `entity alien ${alien.type}`;
    this.entityLayer.append(element);
    this.alienElements.set(alien.id, element);
    return element;
  }

  createBullet(bullet) {
    const element = document.createElement('div');
    element.className = `entity bullet ${bullet.owner === 'player' ? 'player-shot' : 'alien-shot'}`;
    this.entityLayer.append(element);
    this.bulletElements.set(bullet.id, element);
    return element;
  }

  render(state) {
    setBox(this.playerElement, state.player);
    this.playerElement.style.opacity = state.player.shieldSeconds > 0 ? '0.5' : '1';

    const aliveAlienIds = new Set();
    for (const alien of state.aliens) {
      aliveAlienIds.add(alien.id);
      const element = this.alienElements.get(alien.id) || this.createAlien(alien);
      setBox(element, alien);
    }

    for (const [alienId, element] of this.alienElements.entries()) {
      if (!aliveAlienIds.has(alienId)) {
        element.remove();
        this.alienElements.delete(alienId);
      }
    }

    const activeBulletIds = new Set();
    for (const bullet of state.bullets) {
      activeBulletIds.add(bullet.id);
      const element = this.bulletElements.get(bullet.id) || this.createBullet(bullet);
      setBox(element, bullet);
    }

    for (const [bulletId, element] of this.bulletElements.entries()) {
      if (!activeBulletIds.has(bulletId)) {
        element.remove();
        this.bulletElements.delete(bulletId);
      }
    }
  }
}
