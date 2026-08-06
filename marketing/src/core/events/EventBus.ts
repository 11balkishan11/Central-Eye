/**
 * Central Eye - Global Event Bus
 * 
 * Decouples systems from one another. Every transition or action is an event.
 * Systems subscribe to events (e.g., 'ObservationReceived') and react (e.g., 'Update Graph').
 */

type EventCallback<T = any> = (payload: T) => void;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Set<EventCallback>>;

  private constructor() {
    this.listeners = new Map();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return an unsubscribe function
    return () => this.off(event, callback);
  }

  public off<T = any>(event: string, callback: EventCallback<T>): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  public emit<T = any>(event: string, payload?: T): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => {
        try {
          callback(payload as T);
        } catch (error) {
          console.error(`[EventBus] Error executing listener for event '${event}':`, error);
        }
      });
    }
  }
}

// Global instance export for immediate use
export const globalEventBus = EventBus.getInstance();
