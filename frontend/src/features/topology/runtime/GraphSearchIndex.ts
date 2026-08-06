import type { GraphNode } from './models';

export class GraphSearchIndex {
  // Simple token-to-node mapping. In a real system, use MiniSearch or similar.
  private tokens: Map<string, Set<string>> = new Map();
  private nodeTokens: Map<string, string[]> = new Map();

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/[\s\-_.:]+/);
  }

  addNode(node: GraphNode) {
    const texts = [
      node.id,
      node.metadata.type,
      node.metadata.layer,
      ...Object.values(node.metadata.labels),
      ...Object.values(node.metadata.properties).map(String)
    ];

    const tokens = new Set<string>();
    for (const t of texts) {
      for (const token of this.tokenize(t)) {
        if (token.length > 1) {
          tokens.add(token);
        }
      }
    }

    const tokenArray = Array.from(tokens);
    this.nodeTokens.set(node.id, tokenArray);

    for (const token of tokenArray) {
      let set = this.tokens.get(token);
      if (!set) {
        set = new Set();
        this.tokens.set(token, set);
      }
      set.add(node.id);
    }
  }

  removeNode(nodeId: string) {
    const tokens = this.nodeTokens.get(nodeId);
    if (tokens) {
      for (const t of tokens) {
        this.tokens.get(t)?.delete(nodeId);
      }
      this.nodeTokens.delete(nodeId);
    }
  }

  search(query: string): string[] {
    const queryTokens = this.tokenize(query).filter(t => t.length > 1);
    if (queryTokens.length === 0) return [];

    let results: Set<string> | null = null;

    for (const qt of queryTokens) {
      let matchedNodes = new Set<string>();
      
      // Prefix matching
      for (const [token, nodes] of this.tokens.entries()) {
        if (token.startsWith(qt)) {
          for (const n of nodes) matchedNodes.add(n);
        }
      }

      if (results === null) {
        results = matchedNodes;
      } else {
        // Intersection
        const nextResults = new Set<string>();
        for (const n of results) {
          if (matchedNodes.has(n)) nextResults.add(n);
        }
        results = nextResults;
      }
      
      if (results.size === 0) break;
    }

    return results ? Array.from(results) : [];
  }
}
