import { Graph } from '../graph/Graph';
import { VisualNode } from './VisualNode';
import { colors } from '../../design/tokens/colors';

/**
 * Presentation Engine
 * 
 * The crucial translator layer. It converts pure domain models (Graph, Node, Edge)
 * into Visual models (VisualNode, VisualEdge) based on the current product state.
 * It computes colors, glows, and opacities so the Renderer doesn't have to.
 */
export class PresentationEngine {
  
  /**
   * Converts a domain Graph into an array of VisualNodes ready for rendering.
   */
  public static buildVisualNodes(graph: Graph): VisualNode[] {
    const visualNodes: VisualNode[] = [];

    for (const node of graph.getAllNodes()) {
      // Logic: Determine color based on domain status
      let color: string = colors.graph.nodeDefault;
      let glow = false;
      let pulse = false;

      if (node.status === 'degraded') {
        color = colors.product.warning;
        glow = true;
      } else if (node.status === 'offline') {
        color = colors.product.error;
        pulse = true;
      }

      visualNodes.push({
        id: node.id,
        label: node.hostname || node.id,
        position: { x: 0, y: 0, z: 0 }, // Would normally map from a layout engine
        radius: 4,
        color,
        glow,
        opacity: 1.0,
        pulse,
        priority: 1,
      });
    }

    return visualNodes;
  }
}
