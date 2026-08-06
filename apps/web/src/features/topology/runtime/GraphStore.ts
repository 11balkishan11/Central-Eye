import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';
import type { BaseStore } from '../../../stores/BaseStore';
import type { GraphSnapshot, GraphBatchDelta, GraphPatch, GraphNode, GraphEdge, GraphGroup } from './models';
import { GraphIndex } from './GraphIndex';
import { GraphSearchIndex } from './GraphSearchIndex';

export interface GraphState extends BaseStore {
  data: GraphSnapshot;
  index: GraphIndex;
  applyBatchDelta: (delta: GraphBatchDelta) => void;
}

export function createGraphStore(): StoreApi<GraphState> {
  const index = new GraphIndex();
  const searchIndex = new GraphSearchIndex();

  return createStore<GraphState>()((set, get) => ({
    isInitialized: false,
    isLoading: true,
    error: null,
    data: { nodes: [], edges: [], groups: [] },
    index,
    searchIndex,

    initialize: () => set({ isInitialized: true, isLoading: false, error: null }),
    
    applySnapshot: (snapshot: any) => {
      const snap = snapshot as GraphSnapshot;
      index.rebuild(snap);
      
      // Rebuild search index
      snap.nodes.forEach(n => searchIndex.addNode(n));
      
      set({ data: snap, isInitialized: true, isLoading: false, error: null });
    },

    applyDelta: (delta: any) => {
      // Compatibility with base store, forward to applyBatchDelta
      get().applyBatchDelta({ patches: [delta as GraphPatch] });
    },

    applyBatchDelta: (delta: GraphBatchDelta) => {
      const current = get().data;
      
      // We mutate copies for React state updates
      const nextNodes = new Map(current.nodes.map(n => [n.id, n]));
      const nextEdges = new Map(current.edges.map(e => [e.id, e]));
      const nextGroups = new Map(current.groups.map(g => [g.id, g]));

      for (const patch of delta.patches) {
        if (patch.op === 'add') {
          if (patch.entityType === 'node') {
            const node = patch.data as GraphNode;
            nextNodes.set(node.id, node);
            index.addNode(node);
            searchIndex.addNode(node);
          } else if (patch.entityType === 'edge') {
            const edge = patch.data as GraphEdge;
            nextEdges.set(edge.id, edge);
            index.addEdge(edge);
          } else if (patch.entityType === 'group') {
            const group = patch.data as GraphGroup;
            nextGroups.set(group.id, group);
            index.addGroup(group);
          }
        } 
        else if (patch.op === 'update') {
          if (patch.entityType === 'node') {
            const node = patch.data as GraphNode;
            nextNodes.set(node.id, node);
            // Updating index might be needed if metadata changed that affects index
            index.removeNode(node.id);
            index.addNode(node);
            searchIndex.removeNode(node.id);
            searchIndex.addNode(node);
          } else if (patch.entityType === 'edge') {
            const edge = patch.data as GraphEdge;
            nextEdges.set(edge.id, edge);
            index.removeEdge(edge.id);
            index.addEdge(edge);
          }
        }
        else if (patch.op === 'remove') {
          if (patch.entityType === 'node') {
            const id = patch.data.id;
            nextNodes.delete(id);
            index.removeNode(id);
            searchIndex.removeNode(id);
          } else if (patch.entityType === 'edge') {
            const id = patch.data.id;
            nextEdges.delete(id);
            index.removeEdge(id);
          } else if (patch.entityType === 'group') {
            const id = patch.data.id;
            nextGroups.delete(id);
            index.GroupById.delete(id);
          }
        }
      }

      set({
        data: {
          nodes: Array.from(nextNodes.values()),
          edges: Array.from(nextEdges.values()),
          groups: Array.from(nextGroups.values())
        }
      });
    },

    invalidate: () => set({ isInitialized: false, isLoading: true }),
    destroy: () => {
      index.clear();
      set({ data: { nodes: [], edges: [], groups: [] }, isInitialized: false, isLoading: false, error: null });
    }
  }));
}
