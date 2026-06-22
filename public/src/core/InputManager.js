const BLOCKED_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Space',
  'Escape',
  'KeyA',
  'KeyD',
  'KeyP',
  'KeyR',
]);

export class InputManager {
  constructor() {
    this.pressed = new Set();
    this.pressHandlers = new Map();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  attach() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  detach() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  onPress(code, handler) {
    const handlers = this.pressHandlers.get(code) || [];
    handlers.push(handler);
    this.pressHandlers.set(code, handlers);
  }

  isDown(code) {
    return this.pressed.has(code);
  }

  handleKeyDown(event) {
    if (BLOCKED_KEYS.has(event.code)) {
      event.preventDefault();
    }

    const wasPressed = this.pressed.has(event.code);
    this.pressed.add(event.code);

    if (!wasPressed) {
      const handlers = this.pressHandlers.get(event.code) || [];
      for (const handler of handlers) {
        handler();
      }
    }
  }

  handleKeyUp(event) {
    if (BLOCKED_KEYS.has(event.code)) {
      event.preventDefault();
    }

    this.pressed.delete(event.code);
  }
}
