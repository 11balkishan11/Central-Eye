import { EventBus } from '../events/event-bus';
import { RuntimeEvent } from '../events/event-types';

export interface RuntimeProvider {
  name: string;
  
  initialize(eventBus: EventBus): void;
  dispose(): void;
  
  // Expose methods for the runtime kernel to call
  executeAction(actionType: string, payload: any): void;
  getSnapshot(): any;
}
