import { createStore } from 'zustand';

export interface WorkspaceState {
  activePane: 'inventory' | 'graph' | 'ai' | 'timeline' | 'all';
  timelinePosition: number; // timestamp
  setActivePane: (pane: 'inventory' | 'graph' | 'ai' | 'timeline' | 'all') => void;
  setTimelinePosition: (timestamp: number) => void;
}

export const createWorkspaceStore = () => {
  return createStore<WorkspaceState>()((set) => ({
    activePane: 'all',
    timelinePosition: Date.now(),
    setActivePane: (pane) => set({ activePane: pane }),
    setTimelinePosition: (timestamp) => set({ timelinePosition: timestamp }),
  }));
};
