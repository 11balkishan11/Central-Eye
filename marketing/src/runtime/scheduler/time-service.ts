import { EventBus } from '../events/event-bus';

export type TimeState = 'LIVE' | 'PAUSED' | 'REPLAY';

export class TimeService {
  private state: TimeState = 'LIVE';
  private multiplier: number = 1;
  private currentTime: number = Date.now();
  private eventBus: EventBus;
  private tickInterval: NodeJS.Timeout | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  start() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    
    this.tickInterval = setInterval(() => {
      if (this.state !== 'PAUSED') {
        const delta = 1000 * this.multiplier;
        this.currentTime += delta;
        this.eventBus.dispatch('TIME_STATE_CHANGED', {
          state: this.state,
          multiplier: this.multiplier,
          currentTime: this.currentTime
        }, 'TimeService');
      }
    }, 1000);
  }

  pause() {
    this.state = 'PAUSED';
    this.broadcastState();
  }

  resume() {
    this.state = 'LIVE';
    this.broadcastState();
  }

  setMultiplier(mult: number) {
    this.multiplier = mult;
    this.broadcastState();
  }

  jumpTo(timestamp: number) {
    this.currentTime = timestamp;
    this.state = 'REPLAY';
    this.broadcastState();
  }

  dispose() {
    if (this.tickInterval) clearInterval(this.tickInterval);
  }

  private broadcastState() {
    this.eventBus.dispatch('TIME_STATE_CHANGED', {
      state: this.state,
      multiplier: this.multiplier,
      currentTime: this.currentTime
    }, 'TimeService');
  }
}
