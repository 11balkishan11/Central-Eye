'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { RuntimeEnvironment, RuntimeContext } from '../../central-eye-runtime/runtime/RuntimeContext';

const RuntimeReactContext = createContext<RuntimeContext | null>(null);

/**
 * AppRuntimeProvider
 * 
 * The root shell component. Initializes the platform runtime once and injects
 * the context into React. This is the only place where React knows about the OS.
 */
export function AppRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [runtime, setRuntime] = useState<RuntimeContext | null>(null);

  useEffect(() => {
    // Boot the OS
    const ctx = RuntimeEnvironment.initialize();
    setRuntime(ctx);
    
    // In the future, this would start the scheduler and clock
  }, []);

  if (!runtime) return null; // Wait for OS to boot

  return (
    <RuntimeReactContext.Provider value={runtime}>
      {children}
    </RuntimeReactContext.Provider>
  );
}

export function useAppRuntime() {
  const ctx = useContext(RuntimeReactContext);
  if (!ctx) throw new Error('useAppRuntime must be used within AppRuntimeProvider');
  return ctx;
}
