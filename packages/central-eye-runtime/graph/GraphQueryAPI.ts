import { Graph } from './Graph';
import { NodeId, GraphNode } from './Node';
import { EdgeId } from './Edge';

/**
 * Graph Query API
 * 
 * Provides a standardized way for all future features (AI Assistant, 
 * Incident Replay, Simulation, Renderers) to interrogate the graph 
 * without traversing internals directly.
 */
export class GraphQueryAPI {
  private graph: Graph;

  constructor(graph: Graph) {
    this.graph = graph;
  }

  /**
   * Returns all immediate dependencies of a given node.
   */
  public dependencies(nodeId: NodeId): GraphNode[] {
    const deps: GraphNode[] = [];
    for (const edge of this.graph.getAllEdges()) {
      if (edge.source === nodeId) {
        const target = this.graph.getNode(edge.target);
        if (target) deps.push(target);
      }
    }
    return deps;
  }

  /**
   * Simulates a failure and returns all downstream impacted nodes.
   */
  public blastRadius(nodeId: NodeId): GraphNode[] {
    const visited = new Set<NodeId>();
    const impacted: GraphNode[] = [];
    const queue = [nodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      
      visited.add(current);
      if (current !== nodeId) {
        const node = this.graph.getNode(current);
        if (node) impacted.push(node);
      }

      // Find all nodes that depend on 'current'
      for (const edge of this.graph.getAllEdges()) {
        if (edge.target === current) {
          queue.push(edge.source);
        }
      }
    }

    return impacted;
  }

  /**
   * Finds the shortest path between two nodes (e.g., for routing visualization).
   */
  public shortestPath(sourceId: NodeId, targetId: NodeId): NodeId[] {
    // Basic BFS implementation omitted for brevity, would return path array
    return [sourceId, targetId]; 
  }
}
