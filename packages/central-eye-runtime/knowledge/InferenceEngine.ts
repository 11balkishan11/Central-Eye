import { Graph } from '../graph/Graph';
import { globalEventBus } from '../events/EventBus';

export interface InferenceResult {
  rootCauseNodeId: string;
  blastRadius: string[];
  confidence: number;
  recommendation: string;
}

/**
 * Knowledge Engine: Inference
 * 
 * Takes the current state of the Reality Graph and determines root causes.
 */
export class InferenceEngine {
  private graph: Graph;

  constructor(graph: Graph) {
    this.graph = graph;
  }

  public runInference(triggerNodeId: string): InferenceResult | null {
    const node = this.graph.getNode(triggerNodeId);
    if (!node) return null;

    // Simulate an inference delay
    globalEventBus.emit('Knowledge:InferenceStarted', { nodeId: triggerNodeId });

    // In a real system, this traverses edges to find the root cause.
    // For this demonstration, we'll build a synthetic result.
    const result: InferenceResult = {
      rootCauseNodeId: triggerNodeId,
      blastRadius: ['srv-01', 'srv-02'], // Fake blast radius
      confidence: 0.98,
      recommendation: 'Restart BGP process or roll back recent configuration change.',
    };

    // Emit that inference has completed (UI can glow Emerald)
    globalEventBus.emit('Knowledge:InferenceCompleted', result);

    return result;
  }
}
