import { RuntimeContext } from '../../central-eye-runtime/runtime/RuntimeContext';

/**
 * The First Conversation
 * 
 * Measures success not by code, but by the user's ability to answer:
 * "What does this product do?"
 */
export class ArrivalExperience {
  private ctx: RuntimeContext;

  constructor(ctx: RuntimeContext) {
    this.ctx = ctx;
  }

  public async start(): Promise<void> {
    // State 1: Silence
    this.ctx.commands.execute('Scene:SetBackground', { type: 'void', color: 'black' });
    await this.delay(2000);

    // State 2: Connect (Cyan Pulse)
    this.ctx.commands.execute('Simulation:Connect');
    await this.delay(1000);

    // State 3: Discover (Observations arrive, graph forms in Cyan)
    this.ctx.commands.execute('Simulation:Discover');
    await this.delay(2000);

    // State 4: Normalize (Cyan -> Emerald)
    this.ctx.commands.execute('Knowledge:RunNormalization');
    // Nodes turn emerald to indicate verified truth
    await this.delay(1500);

    // State 5: Inference (Incident Simulation -> Root Cause -> Emerald Glow)
    this.ctx.commands.execute('Simulation:TriggerIncident');
    await this.delay(3000); // 1.5s for outage, 1.5s for correlation

    // State 6: Question
    this.ctx.events.emit('Experience:ShowQuestion', 'What would you like to know?');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
