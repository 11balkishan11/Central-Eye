import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';

export interface StoreState {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  data: any;
  [key: string]: any;
}

export interface StoreActions {
  initialize: () => void;
  applySnapshot: (snapshot: any) => void;
  applyDelta: (delta: any) => void;
  invalidate: () => void;
  destroy: () => void;
}

export type BaseStore = StoreState & StoreActions;

export function createBaseStore(initialData: any = null): StoreApi<BaseStore> {
  return createStore<BaseStore>()((set, get) => ({
    isInitialized: false,
    isLoading: true,
    error: null,
    data: initialData,

    initialize: () => {
      set({ isInitialized: true, isLoading: false, error: null });
    },

    applySnapshot: (snapshot: any) => {
      set({ data: snapshot, isInitialized: true, isLoading: false, error: null });
    },

    applyDelta: (delta: any) => {
      // Abstract delta application.
      // E.g. array push/remove, object merge.
      // This is a naive merge for objects.
      const current = get().data;
      if (Array.isArray(current)) {
         // naive: replace for now
         set({ data: delta });
      } else if (typeof current === 'object' && current !== null) {
         set({ data: { ...current, ...delta } });
      } else {
         set({ data: delta });
      }
    },

    invalidate: () => {
      set({ isInitialized: false, isLoading: true });
    },

    destroy: () => {
      set({ data: initialData, isInitialized: false, isLoading: false, error: null });
    }
  }));
}
