import type { StoreApi } from 'zustand/vanilla';
import type { GraphState } from './GraphStore';
import { SelectionEngine } from '../../../runtime/SelectionEngine';
import type { GraphNode } from './models';

export class GraphController {
  store: StoreApi<GraphState>;
  selectionEngine: SelectionEngine;

  constructor(
    store: StoreApi<GraphState>,
    selectionEngine: SelectionEngine
  ) {
    this.store = store;
    this.selectionEngine = selectionEngine;
  }

  focusNode(nodeId: string) {
    const index = this.store.getState().index;
    const node = index.NodeById.get(nodeId);
    if (!node) return;

    // Update global selection
    this.selectionEngine.select({
      id: node.id,
      type: 'device',
      data: node.metadata
    });

    // Update internal render state to highlight
    this.store.getState().applyBatchDelta({
      patches: [
        {
          op: 'update',
          entityType: 'node',
          data: {
            ...node,
            render: { ...node.render, selected: true }
          }
        }
      ]
    });
    
    // In the future, this would also emit a viewport command to center the camera
  }
  
  showNeighbors(nodeId: string) {
    const state = this.store.getState();
    const neighbors = state.index.Neighbors.get(nodeId);
    if (!neighbors) return;
    
    // Example: make all neighbors highlighted
    const patches = Array.from(neighbors).map(nid => {
      const node = state.index.NodeById.get(nid);
      return {
        op: 'update' as const,
        entityType: 'node' as const,
        data: {
          ...node,
          render: { ...node?.render, highlighted: true }
        }
      }
    });

    if (patches.length > 0) {
      state.applyBatchDelta({ patches });
    }
  }

  clearSelection() {
    this.selectionEngine.clear();
    // Revert all node selection states
    const state = this.store.getState();
    const patches = Array.from(state.index.SelectedNodes).map(nid => {
        const node = state.index.NodeById.get(nid);
        return {
            op: 'update' as const,
            entityType: 'node' as const,
            data: {
                ...node,
                render: { ...node?.render, selected: false }
            }
        }
    });
    if (patches.length > 0) {
        state.applyBatchDelta({ patches });
    }
  }
}
