import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import type { GraphNode, GraphEdge } from '../runtime/models';

export class NodeMapper {
  static toReactFlow(node: GraphNode): RFNode {
    return {
      id: node.id,
      position: { x: node.render.x, y: node.render.y },
      data: {
        label: node.metadata.labels.name || node.id,
        type: node.metadata.type,
        layer: node.metadata.layer,
        icon: node.render.icon,
        color: node.render.color,
        selected: node.render.selected,
        highlighted: node.render.highlighted
      },
      // We can map custom node types here based on domain type or layer
      type: 'customDevice', 
      hidden: node.render.hidden,
      selected: node.render.selected,
      // Pass group if applicable
      parentId: node.metadata.groupId,
      style: {
        width: node.render.width,
        height: node.render.height
      }
    };
  }
}

export class EdgeMapper {
  static toReactFlow(edge: GraphEdge): RFEdge {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.labels.name,
      type: 'smoothstep', // Custom edge type could be mapped from edge.type
      hidden: edge.hidden,
      animated: edge.type === 'active_flow' // Example metadata usage
    };
  }
}
