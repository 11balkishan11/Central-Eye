import { EventType, RuntimeEvent, EventListener } from './event-types';

export class EventBus {
  private listeners: Map<EventType | '*', Set<EventListener>> = new Map();

  subscribe(type: EventType | '*', listener: EventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  dispatch<P = any>(type: EventType, payload: P, source?: string): void {
    const event: RuntimeEvent<P> = {
      id: Math.random().toString(36).substring(2, 11),
      type,
      timestamp: Date.now(),
      payload,
      source
    };

    // Dispatch to specific listeners
    this.listeners.get(type)?.forEach(listener => {
      try { listener(event); } catch (e) { console.error('Error in event listener', e); }
    });

    // Dispatch to wildcard listeners
    this.listeners.get('*')?.forEach(listener => {
      try { listener(event); } catch (e) { console.error('Error in wildcard listener', e); }
    });
    
    // Developer tool hook - will be picked up by Runtime Inspector
    if (typeof window !== 'undefined' && (window as any).__CENTRAL_EYE_RUNTIME_DEBUG__) {
      (window as any).__CENTRAL_EYE_RUNTIME_DEBUG__.logEvent(event);
    }
  }
}

// Global singleton for the application lifetime
export const globalEventBus = new EventBus();
