'use client';

import React, { useEffect, useState } from 'react';
import { useAppRuntime } from './AppRuntimeProvider';
import { SVGViewport } from '../../central-eye-renderers/svg/SVGViewport';
import { SceneBuilder } from '../../central-eye-runtime/presentation/SceneBuilder';
import { Frame } from '../../central-eye-runtime/scene/TransitionEngine';

/**
 * ExperienceHost
 * 
 * Takes the current OS Experience and wires it to the Viewport.
 */
export function ExperienceHost() {
  const ctx = useAppRuntime();
  const [frame, setFrame] = useState<Frame | null>(null);

  useEffect(() => {
    // For this vertical slice, we'll manually assemble the Arrival -> Observe flow.
    // In production, this state is driven by the Scheduler and SceneStateMachine.
    
    // Start with Arrival (Silence)
    setFrame({
      timestamp: ctx.clock.now(),
      sceneState: SceneBuilder.buildArrivalScene()
    });

    // We'll simulate the "Observe" transition after a delay
    const timer = setTimeout(() => {
      setFrame({
        timestamp: ctx.clock.now(),
        sceneState: SceneBuilder.buildObserveScene(ctx.graph)
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [ctx]);

  if (!frame) return <div>Booting...</div>;

  return (
    <div className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
      <SVGViewport frame={frame} width={window.innerWidth} height={window.innerHeight} />
    </div>
  );
}
