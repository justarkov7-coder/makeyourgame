export class GameLoop {
  constructor({ onFrame }) {
    this.onFrame = onFrame;
    this.rafId = 0;
    this.lastTimestamp = 0;
    this.running = false;
    this.tick = this.tick.bind(this);
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTimestamp = 0;
    this.rafId = window.requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;

    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  tick(timestamp) {
    if (!this.running) {
      return;
    }

    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
    }

    const deltaSeconds = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = timestamp;

    this.onFrame({
      timestamp,
      deltaSeconds,
    });

    this.rafId = window.requestAnimationFrame(this.tick);
  }
}
