import { RuntimeProvider } from './provider';
import { EventBus } from '../events/event-bus';
import { personas } from '@/lib/personas';

export class MockProvider implements RuntimeProvider {
  name = 'mock';
  private eventBus: EventBus | null = null;
  private interval: NodeJS.Timeout | null = null;
  private activePersona: string = 'Enterprise';

  initialize(eventBus: EventBus): void {
    this.eventBus = eventBus;
    
    // Subscribe to persona changes to rebuild the mock graph
    this.eventBus.subscribe('PERSONA_CHANGED', (event) => {
      this.activePersona = event.payload;
      this.rebuildTopology(event.payload);
    });

    // Start a basic simulation loop generating random events
    this.interval = setInterval(() => {
      if (Math.random() > 0.7) {
        this.eventBus?.dispatch('ALERT_TRIGGERED', {
          severity: Math.random() > 0.8 ? 'high' : 'medium',
          message: 'Simulated interface flap detected',
          nodeId: `node-${Math.floor(Math.random() * 100)}`
        }, 'MockProvider');
      }
    }, 5000);
  }

  dispose(): void {
    if (this.interval) clearInterval(this.interval);
    this.eventBus = null;
  }

  executeAction(actionType: string, payload: any): void {
    console.log(`MockProvider executing action: ${actionType}`, payload);
    
    if (actionType === 'AI_REQUESTED') {
      const personaData = personas.find(p => p.id === this.activePersona) || personas[0];
      
      // If the query matches the persona's prompt, give the realistic answer. Otherwise, generic mock.
      const responseText = (payload.query === personaData.aiPrompt) 
        ? personaData.aiResponse 
        : `Analysis complete. Based on the query "${payload.query}", our telemetry indicates nominal performance across the ${this.activePersona} environment, though secondary latency spikes were observed on edge nodes.`;

      setTimeout(() => {
        this.eventBus?.dispatch('AI_RESPONDED', {
          response: responseText
        }, 'MockProviderAI');
      }, 1500);
    }
  }

  getSnapshot(): any {
    return {
      nodes: 512,
      alerts: 3,
      health: 98.5
    };
  }

  private rebuildTopology(persona: string) {
    this.eventBus?.dispatch('TOPOLOGY_UPDATED', {
      persona,
      nodeCount: persona === 'Cloud' ? 12500 : 500
    }, 'MockProvider');
  }
}
