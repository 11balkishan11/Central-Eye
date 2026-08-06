import { NodeId, GraphNode } from '../graph/Node';

/**
 * Visual Node (Presentation Layer)
 * 
 * Represents how a domain Node should be rendered on screen.
 * Contains no business logic, only visual properties.
 */
export interface VisualNode {
  id: NodeId;
  label: string;
  
  // Spatial
  position: { x: number, y: number, z: number };
  radius: number;
  
  // Styling (maps to design tokens)
  color: string;
  glow: boolean;
  opacity: number;
  
  // State
  pulse: boolean;
  priority: number;
}
