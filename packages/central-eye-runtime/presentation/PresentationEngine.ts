import { Graph } from '../graph/Graph';
import { VisualNode } from './VisualNode';

/**
 * Presentation Engine
 * 
 * Strict mapping of Domain Truth to Design Truth.
 */
export class PresentationEngine {
  
  public static buildVisualNodes(graph: Graph): VisualNode[] {
    const visualNodes: VisualNode[] = [];

    // Assuming we have colors imported, hardcoding the hex for the vertical slice:
    const COLORS = {
      cyan: '#06b6d4',      // Observation
      emerald: '#10b981',   // Verified Truth (Normalized/Inferred)
      amber: '#f59e0b',     // Degraded
      red: '#ef4444'        // Failure
    };

    for (const node of graph.getAllNodes()) {
      let color = COLORS.cyan; // Default state when first observed
      let glow = false;
      let pulse = false;

      // Map knowledge state to semantic color
      if (node.status === 'healthy') {
        color = COLORS.emerald;
      } else if (node.status === 'degraded') {
        color = COLORS.amber;
      } else if (node.status === 'unreachable' || node.status === 'offline') {
        color = COLORS.red;
        pulse = true;
      }

      // If inference engine has tagged it as root cause
      if (node.isRootCause) {
        color = COLORS.emerald; // The truth is found
        glow = true;
      }

      visualNodes.push({
        id: node.id,
        label: node.hostname || node.id,
        // Calculate layout position (Hardcoded spiral/grid for slice)
        position: { x: Math.random() * 500, y: Math.random() * 500, z: 0 }, 
        radius: 6,
        color,
        glow,
        opacity: 1.0,
        pulse,
        priority: node.isRootCause ? 10 : 1,
      });
    }

    return visualNodes;
  }
}
