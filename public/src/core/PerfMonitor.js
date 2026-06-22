export class PerfMonitor {
  constructor() {
    this.fps = 60;
    this.slowestFrameMs = 0;
    this.slowFrames = 0;
    this.frameCounter = 0;
    this.accumulator = 0;
  }

  track(deltaSeconds) {
    const frameMs = deltaSeconds * 1000;
    this.frameCounter += 1;
    this.accumulator += frameMs;
    this.slowestFrameMs = Math.max(this.slowestFrameMs, frameMs);

    if (frameMs > 20) {
      this.slowFrames += 1;
    }

    if (this.accumulator >= 250) {
      this.fps = Math.round((this.frameCounter * 1000) / this.accumulator);
      this.frameCounter = 0;
      this.accumulator = 0;
      this.slowestFrameMs = frameMs;
    }
  }

  snapshot() {
    return {
      fps: this.fps,
      slowFrames: this.slowFrames,
      slowestFrameMs: Math.round(this.slowestFrameMs * 10) / 10,
    };
  }
}
