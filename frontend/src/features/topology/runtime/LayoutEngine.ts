import type { GraphSnapshot, GraphBatchDelta } from './models';
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


