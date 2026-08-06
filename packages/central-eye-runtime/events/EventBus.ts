type EventCallback<T = any> = (payload: T) => void;

/**
 * Event Bus
 * Reports what HAS happened in the system (e.g., 'NodeHovered', 'InferenceCompleted').
 */
export class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  public on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  public off<T = any>(event: string, callback: EventCallback<T>): void {
    this.listeners.get(event)?.delete(callback);
  }

  public emit<T = any>(event: string, payload?: T): void {
    this.listeners.get(event)?.forEach(cb => cb(payload as T));
  }
}
