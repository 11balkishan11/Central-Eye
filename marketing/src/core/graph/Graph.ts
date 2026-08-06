import { GraphNode, NodeId } from './Node';
import { GraphEdge, EdgeId } from './Edge';

/**
 * The Reality Graph.
 * The absolute source of truth for the product and the UI.
 */
export class Graph {
  private nodes: Map<NodeId, GraphNode>;
  private edges: Map<EdgeId, GraphEdge>;

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
  }

  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(edge: GraphEdge): void {
    // Only add edge if both nodes exist in the graph
    if (this.nodes.has(edge.source) && this.nodes.has(edge.target)) {
      this.edges.set(edge.id, edge);
    } else {
      console.warn(`[Graph] Cannot add edge ${edge.id}. Missing source or target node.`);
    }
  }

  public getNode(id: NodeId): GraphNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  public clear(): void {
    this.nodes.clear();
    this.edges.clear();
  }
}
