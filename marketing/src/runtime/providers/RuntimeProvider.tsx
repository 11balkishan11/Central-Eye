"use client";

import { useEffect, useRef } from 'react';
import { Runtime } from '../kernel/runtime';
import { MockProvider } from './mock-provider';

export function RuntimeProviderComponent({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      
      // Setup debug inspector array
      if (typeof window !== 'undefined') {
        (window as any).__CENTRAL_EYE_RUNTIME_DEBUG__ = {
          events: [],
          logEvent: (e: any) => {
            (window as any).__CENTRAL_EYE_RUNTIME_DEBUG__.events.push(e);
            if ((window as any).__CENTRAL_EYE_RUNTIME_DEBUG__.events.length > 500) {
              (window as any).__CENTRAL_EYE_RUNTIME_DEBUG__.events.shift();
            }
          }
        };
      }

      // Boot the runtime with Mock Provider
      console.log("[Central Eye Runtime] Booting Kernel v1.1");
      Runtime.setProvider(new MockProvider());
      Runtime.start();
    }

    return () => {
      // We don't shut down the runtime on unmount because this wraps the whole app, 
      // but if we did want to clean up on HMR:
      // Runtime.shutdown();
    };
  }, []);

  return <>{children}</>;
}
