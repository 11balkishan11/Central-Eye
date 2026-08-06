import { useEffect } from 'react';
import { useStore } from 'zustand';
import { Runtime } from '../kernel/runtime';
import { EventType, RuntimeEvent } from '../events/event-types';

export function useRuntime() {
  // Subscribe to internal state changes from the abstracted Zustand stores
  const appState = useStore(Runtime.appStore);
  const workspaceState = useStore(Runtime.workspaceStore);

  return {
    // Abstracted state reads
    persona: appState.activePersona,
    isInspectorOpen: appState.isInspectorOpen,
    activeMission: appState.activeMission,
    activePane: workspaceState.activePane,
    timelinePosition: workspaceState.timelinePosition,


    // Abstracted API methods
    dispatch: Runtime.dispatch.bind(Runtime),
    executeAction: Runtime.executeAction.bind(Runtime),
    getSnapshot: Runtime.getSnapshot.bind(Runtime),

    // Time Controls
    pause: Runtime.pause.bind(Runtime),
    resume: Runtime.resume.bind(Runtime),
    setSpeed: Runtime.setSpeed.bind(Runtime),
    jumpTo: Runtime.jumpTo.bind(Runtime),
  };
}



export function useEvents(type: EventType | '*', callback: (event: RuntimeEvent) => void, deps: any[] = []) {
  useEffect(() => {
    const unsubscribe = Runtime.subscribe(type, callback);
    return () => unsubscribe();
  }, deps);
}
