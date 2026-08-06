import { createStore } from 'zustand';
import { PersonaType } from '@/lib/personas';

export interface AppState {
  activePersona: PersonaType;
  isInspectorOpen: boolean;
  activeMission: string | null;
  setPersona: (persona: PersonaType) => void;
  toggleInspector: () => void;
  setActiveMission: (mission: string | null) => void;
}

export const createAppStore = () => {
  return createStore<AppState>()((set) => ({
    activePersona: 'Enterprise',
    isInspectorOpen: false,
    activeMission: null,
    setPersona: (persona) => set({ activePersona: persona }),
    toggleInspector: () => set((state) => ({ isInspectorOpen: !state.isInspectorOpen })),
    setActiveMission: (mission) => set({ activeMission: mission }),
  }));
};
