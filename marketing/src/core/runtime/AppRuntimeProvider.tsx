'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { globalEventBus } from '../events/EventBus';
import { ProductState, VisualState, OSState } from '../state/types';

/**
 * AppRuntimeContext
 * 
 * Provides global access to the decoupled Product State and Visual State.
 */
interface AppRuntimeContextValue {
  productState: ProductState;
  visualState: VisualState;
  setOSState: (state: OSState) => void;
}

const defaultProductState: ProductState = {
  osState: 'ARRIVAL',
  nodes: new Map(),
  edges: new Map(),
  activeIncident: null,
};

const defaultVisualState: VisualState = {
  camera: { position: [0, 0, 100], target: [0, 0, 0], zoom: 1 },
  hoveredNodeId: null,
  selectedNodeId: null,
  highlightedPath: [],
  theme: 'dark',
};

const AppRuntimeContext = createContext<AppRuntimeContextValue | null>(null);

export function AppRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [productState, setProductState] = useState<ProductState>(defaultProductState);
  const [visualState, setVisualState] = useState<VisualState>(defaultVisualState);

  // Setup Event Bus Listeners
  useEffect(() => {
    const unsubNodeHover = globalEventBus.on('Visual:NodeHover', (nodeId: string | null) => {
      setVisualState(prev => ({ ...prev, hoveredNodeId: nodeId }));
    });

    const unsubNodeSelect = globalEventBus.on('Visual:NodeSelect', (nodeId: string | null) => {
      setVisualState(prev => ({ ...prev, selectedNodeId: nodeId }));
    });

    return () => {
      unsubNodeHover();
      unsubNodeSelect();
    };
  }, []);

  const setOSState = (state: OSState) => {
    setProductState(prev => ({ ...prev, osState: state }));
    globalEventBus.emit('Product:OSStateChanged', state);
  };

  return (
    <AppRuntimeContext.Provider value={{ productState, visualState, setOSState }}>
      {children}
    </AppRuntimeContext.Provider>
  );
}

export function useAppRuntime() {
  const context = useContext(AppRuntimeContext);
  if (!context) {
    throw new Error('useAppRuntime must be used within an AppRuntimeProvider');
  }
  return context;
}
