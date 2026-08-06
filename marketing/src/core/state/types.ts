/**
 * Central Eye - State Typings
 * 
 * Defines the strict separation between Product (Infrastructure) State
 * and Visual (UI/Camera) State.
 */

// --- PRODUCT STATE ---
export type NodeId = string;
export type EdgeId = string;

export interface ProductNode {
  id: NodeId;
  type: 'collector' | 'switch' | 'router' | 'server' | 'database';
  status: 'healthy' | 'degraded' | 'offline';
  metadata: Record<string, any>;
}

export interface ProductEdge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  type: 'physical' | 'logical' | 'inferred';
}

export type OSState = 'ARRIVAL' | 'OBSERVING' | 'UNDERSTANDING' | 'REASONING' | 'PREDICTING' | 'GUIDING';

export interface ProductState {
  osState: OSState;
  nodes: Map<NodeId, ProductNode>;
  edges: Map<EdgeId, ProductEdge>;
  activeIncident: string | null;
}

// --- VISUAL STATE ---
export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export interface VisualState {
  camera: CameraState;
  hoveredNodeId: NodeId | null;
  selectedNodeId: NodeId | null;
  highlightedPath: EdgeId[];
  theme: 'dark' | 'light'; // Always 'dark' by default, but built for scale
}
