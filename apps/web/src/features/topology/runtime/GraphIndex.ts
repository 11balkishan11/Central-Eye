import type { GraphNode, GraphEdge, GraphGroup, GraphSnapshot } from './models';

export class GraphIndex {
  public NodeById: Map<string, GraphNode> = new Map();
  public EdgeById: Map<string, GraphEdge> = new Map();
  public GroupById: Map<string, GraphGroup> = new Map();

  // Relational indices
  public OutgoingEdges: Map<string, Set<string>> = new Map(); // nodeId -> Set of edgeIds
  public IncomingEdges: Map<string, Set<string>> = new Map(); // nodeId -> Set of edgeIds
  public Neighbors: Map<string, Set<string>> = new Map();     // nodeId -> Set of nodeIds
  
  // Hierarchy indices
  public Children: Map<string, Set<string>> = new Map();      // groupId -> Set of nodeIds
  public Parents: Map<string, string> = new Map();            // nodeId -> groupId
  
  // State indices
  public SelectedNodes: Set<string> = new Set();
  public VisibleNodes: Set<string> = new Set();

  clear() {
    this.NodeById.clear();
    this.EdgeById.clear();
    this.GroupById.clear();
    this.OutgoingEdges.clear();
    this.IncomingEdges.clear();
    this.Neighbors.clear();
    this.Children.clear();
    this.Parents.clear();
    this.SelectedNodes.clear();
    this.VisibleNodes.clear();
  }

  rebuild(snapshot: GraphSnapshot) {
    this.clear();
    
    for (const node of snapshot.nodes) {
      this.addNode(node);
    }
    
    for (const group of snapshot.groups) {
      this.addGroup(group);
    }

    for (const edge of snapshot.edges) {
      this.addEdge(edge);
    }
  }

  addNode(node: GraphNode) {
    this.NodeById.set(node.id, node);
    if (!node.render.hidden) {
      this.VisibleNodes.add(node.id);
    }
    if (node.render.selected) {
      this.SelectedNodes.add(node.id);
    }
    if (node.metadata.groupId) {
      this.Parents.set(node.id, node.metadata.groupId);
      let children = this.Children.get(node.metadata.groupId);
      if (!children) {
        children = new Set();
        this.Children.set(node.metadata.groupId, children);
      }
      children.add(node.id);
    }
  }

  removeNode(nodeId: string) {
    const node = this.NodeById.get(nodeId);
    if (!node) return;

    this.NodeById.delete(nodeId);
    this.VisibleNodes.delete(nodeId);
    this.SelectedNodes.delete(nodeId);
    
    const parentId = this.Parents.get(nodeId);
    if (parentId) {
      this.Children.get(parentId)?.delete(nodeId);
      this.Parents.delete(nodeId);
    }

    // Edge cleanup is typically handled by the delta processing before node removal, 
    // but a robust index might clean up dangling edges here. 
    // For MVP, we trust the Delta Engine to provide correct ordered patches.
  }

  addEdge(edge: GraphEdge) {
    this.EdgeById.set(edge.id, edge);
    
    // Outgoing
    let outSet = this.OutgoingEdges.get(edge.source);
    if (!outSet) { outSet = new Set(); this.OutgoingEdges.set(edge.source, outSet); }
    outSet.add(edge.id);

    // Incoming
    let inSet = this.IncomingEdges.get(edge.target);
    if (!inSet) { inSet = new Set(); this.IncomingEdges.set(edge.target, inSet); }
    inSet.add(edge.id);

    // Neighbors (Undirected mapping)
    let srcNeighbors = this.Neighbors.get(edge.source);
    if (!srcNeighbors) { srcNeighbors = new Set(); this.Neighbors.set(edge.source, srcNeighbors); }
    srcNeighbors.add(edge.target);

    let tgtNeighbors = this.Neighbors.get(edge.target);
    if (!tgtNeighbors) { tgtNeighbors = new Set(); this.Neighbors.set(edge.target, tgtNeighbors); }
    tgtNeighbors.add(edge.source);
  }

  removeEdge(edgeId: string) {
    const edge = this.EdgeById.get(edgeId);
    if (!edge) return;
    this.EdgeById.delete(edgeId);

    this.OutgoingEdges.get(edge.source)?.delete(edgeId);
    this.IncomingEdges.get(edge.target)?.delete(edgeId);

    // Note: Neighbor removal requires checking if ANY other edge still connects them
    // For a simple implementation, if it's a multigraph, we'd need reference counting. 
    // We assume simple graph for now, or we recompute neighbors if strictly needed.
    // We will leave neighbor deletion naive for MVP.
    this.Neighbors.get(edge.source)?.delete(edge.target);
    this.Neighbors.get(edge.target)?.delete(edge.source);
  }

  addGroup(group: GraphGroup) {
    this.GroupById.set(group.id, group);
    for (const childId of group.children) {
      this.Parents.set(childId, group.id);
    }
    this.Children.set(group.id, new Set(group.children));
  }
}
