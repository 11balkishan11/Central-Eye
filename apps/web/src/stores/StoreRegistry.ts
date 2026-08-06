import type { StoreApi } from 'zustand/vanilla';
import { createBaseStore } from './BaseStore';
import type { BaseStore } from './BaseStore';

export class StoreRegistry {
  private stores: Map<string, StoreApi<BaseStore>> = new Map();

  register(storeId: string, store?: StoreApi<BaseStore>) {
    if (this.stores.has(storeId)) {
      console.warn(`Store ${storeId} already registered.`);
      return;
    }
    this.stores.set(storeId, store || createBaseStore());
  }

  getStore(storeId: string): StoreApi<BaseStore> | undefined {
    return this.stores.get(storeId);
  }

  applySnapshot(storeId: string, snapshot: any) {
    const store = this.getStore(storeId);
    if (store) {
      store.getState().applySnapshot(snapshot);
    }
  }

  applyDelta(storeId: string, delta: any) {
    const store = this.getStore(storeId);
    if (store) {
      store.getState().applyDelta(delta);
    }
  }
}
