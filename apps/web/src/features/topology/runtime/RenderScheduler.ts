import type { StoreApi } from 'zustand/vanilla';
import type { GraphState } from './GraphStore';
import type { GraphBatchDelta } from './models';

/**
 * RenderScheduler buffers incoming deltas (e.g. from websocket)
 * and only flushes them to the GraphStore on the next animation frame,
 * ensuring 60fps React rendering.
 */
export class RenderScheduler {
  pendingDeltas: GraphBatchDelta[] = [];
  frameId: number | null = null;
  store: StoreApi<GraphState>;

  constructor(store: StoreApi<GraphState>) {
    this.store = store;
  }

  schedule(delta: GraphBatchDelta) {
    this.pendingDeltas.push(delta);
    if (this.frameId === null) {
      this.frameId = requestAnimationFrame(() => this.flush());
    }
  }

  flush() {
    this.frameId = null;
    if (this.pendingDeltas.length === 0) return;

    // Combine all pending batches into a single large batch
    const mergedBatch: GraphBatchDelta = { patches: [] };
    for (const d of this.pendingDeltas) {
      mergedBatch.patches.push(...d.patches);
    }
    
    this.pendingDeltas = [];

    // Apply to store (which updates React)
    this.store.getState().applyBatchDelta(mergedBatch);
  }
}
