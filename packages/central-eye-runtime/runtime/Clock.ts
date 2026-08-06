/**
 * Central Eye - Deterministic Clock
 * 
 * Prevents any engine from calling Date.now() or performance.now().
 * Essential for incident replay, time travel, and simulation.
 */
export class Clock {
  private startTime: number;
  private currentTime: number;
  private isPaused: boolean = false;
  private playbackSpeed: number = 1.0;

  constructor() {
    this.startTime = Date.now();
    this.currentTime = this.startTime;
  }

  public tick(deltaMs: number): void {
    if (!this.isPaused) {
      this.currentTime += (deltaMs * this.playbackSpeed);
    }
  }

  public now(): number {
    return this.currentTime;
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public speed(multiplier: number): void {
    this.playbackSpeed = multiplier;
  }
}
