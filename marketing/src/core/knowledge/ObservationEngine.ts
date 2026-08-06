import { GraphNode } from '../graph/Node';
import { Graph } from '../graph/Graph';
import { globalEventBus } from '../events/EventBus';

export interface RawObservation {
  sourceId: string;
  timestamp: number;
  payload: any;
}

/**
 * Knowledge Engine: Observation
 * 
 * Responsible for ingesting raw telemetry (e.g., from a Collector)
 * and triggering the Normalization / Graph update pipeline.
 */
export class ObservationEngine {
  private graph: Graph;

  constructor(graph: Graph) {
    this.graph = graph;
  }

  public ingest(observation: RawObservation): void {
    // 1. Emit that raw data was received (UI can show Cyan pulse)
    globalEventBus.emit('Knowledge:ObservationReceived', observation);

    // 2. Simple Normalization (In a real system, this would call NormalizationEngine)
    // Here we just ensure the node exists in the Reality Graph.
    let node = this.graph.getNode(observation.sourceId);
    
    if (!node) {
      node = new GraphNode(observation.sourceId, 'server', observation.payload);
      this.graph.addNode(node);
      globalEventBus.emit('Knowledge:NodeDiscovered', node);
    } else {
      node.lastObservedAt = observation.timestamp;
      // Update metadata based on payload
      node.metadata = { ...node.metadata, ...observation.payload };
    }

    // 3. Emit Graph Updated event
    globalEventBus.emit('Knowledge:GraphUpdated', this.graph);
  }
}
