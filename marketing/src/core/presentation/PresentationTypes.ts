/**
 * Visual Effects System
 * 
 * Defines standardized, reusable effects without specifying how they are rendered.
 * The renderer will translate these into WebGL shaders, SVG animations, or CSS.
 */

export type EffectType = 
  | 'ObservationPulse' 
  | 'InferenceGlow' 
  | 'SelectionHalo' 
  | 'DegradedBlink' 
  | 'EdgeTraversal' 
  | 'RecommendationRipple';

export interface VisualEffect {
  id: string;
  type: EffectType;
  targetId: string; // The NodeId or EdgeId this effect applies to
  durationMs: number;
  loop: boolean;
  metadata?: Record<string, any>;
}

/**
 * Camera State
 * Data representation of the viewport camera.
 */
export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
  projection: 'orthographic' | 'perspective';
  transitionDurationMs: number;
  constraints?: {
    minZoom?: number;
    maxZoom?: number;
    panBounds?: [number, number, number, number];
  };
}

/**
 * Background State
 * Defines the persistent environment behind the graph.
 */
export type BackgroundType = 'void' | 'grid' | 'gradient' | 'noise' | 'stars';

export interface BackgroundState {
  type: BackgroundType;
  primaryColor: string;
  opacity: number;
  animate: boolean;
}

/**
 * Interaction Policy
 * Defines what a user is allowed to do in the current scene.
 */
export interface InteractionPolicy {
  hover: boolean;
  select: boolean;
  drag: boolean;
  zoom: boolean;
  pan: boolean;
  inspect: boolean;
  camera: 'locked' | 'free' | 'constrained';
}
