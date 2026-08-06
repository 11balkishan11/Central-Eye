import * as React from 'react';
import type { Feature } from '../../runtime/FeatureRegistry';
import { runtime } from '../../runtime/container';
import { useStore } from 'zustand';

const InventoryView = () => {
  // In a real app we'd wrap this elegantly via hooks
  const storeApi = runtime.storeRegistry.getStore('inventory');
  
  // A naive render just to prove the runtime
  const state = storeApi ? useStore(storeApi) : null;

  React.useEffect(() => {
    // Subscribe to live client on mount
    runtime.liveClient.subscribe('inventory');
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
      <div className="border rounded-md p-4 bg-card">
        {state?.isLoading ? 'Loading...' : (
          <pre className="text-sm overflow-auto">
            {JSON.stringify(state?.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export const InventoryFeature: Feature = {
  id: 'inventory',
  name: 'Inventory',
  routes: [
    {
      path: '/inventory',
      component: InventoryView,
      title: 'Inventory'
    }
  ],
  initialize: (runtime: any) => {
    runtime.storeRegistry.register('inventory');
  }
};
