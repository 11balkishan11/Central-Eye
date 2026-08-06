import { EventBus, globalEventBus } from '../events/event-bus';
import { EventType, EventListener, RuntimeEvent } from '../events/event-types';
import { RuntimeProvider } from '../providers/provider';
import { TimeService } from '../scheduler/time-service';
import { createAppStore } from '../state/app-store';
import { createWorkspaceStore } from '../state/workspace-store';

class RuntimeKernel {
  private eventBus: EventBus;
  private provider: RuntimeProvider | null = null;
  private timeService: TimeService;
  
  // Expose zustand stores to hooks, but abstract them from components
  public appStore = createAppStore();
  public workspaceStore = createWorkspaceStore();

  constructor() {
    this.eventBus = globalEventBus;
    this.timeService = new TimeService(this.eventBus);
    
    // Bind internal state to event bus
    this.eventBus.subscribe('PERSONA_CHANGED', (e) => {
      this.appStore.getState().setPersona(e.payload);
    });
  }

  setProvider(provider: RuntimeProvider) {
    if (this.provider) {
      this.provider.dispose();
    }
    this.provider = provider;
    this.provider.initialize(this.eventBus);
  }

  start() {
    this.timeService.start();
    this.eventBus.dispatch('APP_INITIALIZED', { version: '1.1' }, 'RuntimeKernel');
  }

  shutdown() {
    this.timeService.dispose();
    this.provider?.dispose();
  }

  // Public SDK Methods
  dispatch<P = any>(type: EventType, payload: P, source?: string) {
    this.eventBus.dispatch(type, payload, source);
  }

  subscribe(type: EventType | '*', listener: EventListener) {
    return this.eventBus.subscribe(type, listener);
  }

  executeAction(actionType: string, payload: any) {
    this.provider?.executeAction(actionType, payload);
  }

  getSnapshot() {
    return this.provider?.getSnapshot();
  }
  
  // Time controls
  pause() { this.timeService.pause(); }
  resume() { this.timeService.resume(); }
  setSpeed(mult: number) { this.timeService.setMultiplier(mult); }
  jumpTo(time: number) { this.timeService.jumpTo(time); }
}

// Global Singleton
export const Runtime = new RuntimeKernel();

// Inject into window for Inspector
if (typeof window !== 'undefined') {
  (window as any).__CENTRAL_EYE_RUNTIME__ = Runtime;
}
