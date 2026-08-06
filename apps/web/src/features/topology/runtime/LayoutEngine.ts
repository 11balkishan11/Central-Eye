import type { GraphSnapshot, GraphBatchDelta } from './models';
import dagre from 'dagre';

export type LayoutMode = 'automatic' | 'manual' | 'mixed';

export interface LayoutEngine {
  name: string;
  compute(snapshot: GraphSnapshot): GraphBatchDelta;
}

export class GridLayout implements LayoutEngine {
  name = 'grid';

  compute(snapshot: GraphSnapshot): GraphBatchDelta {
    const patches = [];
    const cols = Math.ceil(Math.sqrt(snapshot.nodes.length));
    const spacing = 150;

    let index = 0;
    for (const node of snapshot.nodes) {
      if (node.render.pinned) continue; // Respect manual overrides

      const col = index % cols;
      const row = Math.floor(index / cols);

      const nextX = col * spacing;
      const nextY = row * spacing;

      if (node.render.x !== nextX || node.render.y !== nextY) {
        patches.push({
          op: 'update' as const,
          entityType: 'node' as const,
          data: {
            ...node,
            render: { ...node.render, x: nextX, y: nextY }
          }
        });
      }
      index++;
    }

    return { patches };
  }
}

export class DagreLayout implements LayoutEngine {
  name = 'hierarchical';

  compute(snapshot: GraphSnapshot): GraphBatchDelta {
    const patches = [];
    
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 100 });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes to dagre
    for (const node of snapshot.nodes) {
      if (!node.render.hidden) {
         // Dagre needs width/height. We'll assume defaults if undefined.
         g.setNode(node.id, { width: node.render.width || 150, height: node.render.height || 50 });
      }
    }

    // Add edges
    for (const edge of snapshot.edges) {
      if (!edge.hidden) {
         g.setEdge(edge.source, edge.target);
      }
    }

    // Compute layout
    dagre.layout(g);

    // Generate deltas
    for (const node of snapshot.nodes) {
      if (node.render.hidden || node.render.pinned) continue;

      const layoutNode = g.node(node.id);
      if (layoutNode) {
        // Dagre positions represent the center of the node.
        // We typically want top-left for standard rendering.
        const nextX = layoutNode.x - (layoutNode.width / 2);
        const nextY = layoutNode.y - (layoutNode.height / 2);

        if (node.render.x !== nextX || node.render.y !== nextY) {
          patches.push({
            op: 'update' as const,
            entityType: 'node' as const,
            data: {
              ...node,
              render: { ...node.render, x: nextX, y: nextY }
            }
          });
        }
      }
    }

    return { patches };
  }
}
