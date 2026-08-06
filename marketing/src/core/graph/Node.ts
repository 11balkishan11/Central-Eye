export type NodeId = string;
export type NodeType = 'collector' | 'switch' | 'router' | 'server' | 'database' | 'firewall';
export type NodeStatus = 'healthy' | 'degraded' | 'offline' | 'unknown';

/**
 * Represents a physical or logical entity in the infrastructure.
 * Pure domain model, absolutely no React/UI imports.
 */
export class GraphNode {
  public id: NodeId;
  public type: NodeType;
  public status: NodeStatus;
  public hostname?: string;
  public metadata: Record<string, any>;
  public firstObservedAt: number;
  public lastObservedAt: number;

  constructor(id: NodeId, type: NodeType, metadata: Record<string, any> = {}) {
    this.id = id;
    this.type = type;
    this.status = 'unknown';
    this.metadata = metadata;
    this.firstObservedAt = Date.now();
    this.lastObservedAt = Date.now();
    this.hostname = metadata.hostname;
  }

  public updateStatus(newStatus: NodeStatus): void {
    this.status = newStatus;
    this.lastObservedAt = Date.now();
  }
}
