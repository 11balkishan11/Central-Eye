import { VisualNode } from './VisualNode';
import { CameraState, BackgroundState, InteractionPolicy, VisualEffect } from './PresentationTypes';

export interface VisualEdge {
  id: string;
  sourceId: string;
  targetId: string;
  width: number;
  gradient: [string, string];
  opacity: number;
  dashPattern?: number[];
  animated: boolean;
}

export interface VisualLayer {
  id: string;
  zIndex: number;
  visible: boolean;
  nodes: VisualNode[];
  edges: VisualEdge[];
}

/**
 * Scene Definition
 * 
 * The ultimate source of truth for the Viewport. 
 * A pure data representation of exactly what should be on screen, 
 * completely independent of React or WebGL.
 */
export interface SceneDefinition {
  id: string;
  camera: CameraState;
  background: BackgroundState;
  layers: VisualLayer[];
  effects: VisualEffect[];
  interactions: InteractionPolicy;
}
