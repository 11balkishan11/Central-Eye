import { RuntimeContext } from '../runtime/RuntimeContext';

export class SimulationRuntime {
  private ctx: RuntimeContext;

  constructor(ctx: RuntimeContext) {
    this.ctx = ctx;
  }

  public simulateConnect(): void {
    // A single collector connected pulse
    this.ctx.commands.execute('Visual:Pulse', { color: 'cyan', radius: 100 });
  }

  public simulateDiscovery(): void {
    const nodes = [
      { id: 'SW-17', type: 'switch', label: 'Switch-17' },
      { id: 'SAP-01', type: 'application', label: 'SAP Finance' },
      { id: 'VLAN-20', type: 'network', label: 'Finance VLAN' }
    ];

    nodes.forEach((n, idx) => {
      // Stagger the arrival slightly for visual effect
      setTimeout(() => {
        this.ctx.events.emit('Knowledge:ObservationReceived', {
          sourceId: n.id,
          timestamp: this.ctx.clock.now(),
          payload: { status: 'healthy', hostname: n.label, ...n }
        });
      }, idx * 300);
    });
  }

  public simulateIncident(): void {
    // 1. SAP becomes unreachable
    this.ctx.events.emit('Knowledge:ObservationReceived', {
      sourceId: 'SAP-01',
      timestamp: this.ctx.clock.now(),
      payload: { status: 'unreachable' }
    });

    // 2. Inference correlates it
    setTimeout(() => {
      this.ctx.events.emit('Knowledge:InferenceTriggered', { targetId: 'SW-17', confidence: 0.987, cause: 'Uplink Failure' });
    }, 1500);
  }
}
