import { NodeId } from './Node';

export type EdgeId = string;
export type EdgeType = 'physical' | 'logical' | 'inferred';

/**
 * Represents a relationship between two nodes in the Reality Graph.
 */
export class GraphEdge {
  public id: EdgeId;
  public source: NodeId;
  public target: NodeId;
  public type: EdgeType;
  public confidence: number; // 0.0 to 1.0

  constructor(source: NodeId, target: NodeId, type: EdgeType, confidence: number = 1.0) {
    this.id = `${source}->${target}`;
    this.source = source;
    this.target = target;
    this.type = type;
    this.confidence = confidence;
  }
}
