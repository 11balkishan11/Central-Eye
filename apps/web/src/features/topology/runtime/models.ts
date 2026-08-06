export type TopologyLayer = 'Infrastructure' | 'Network' | 'Servers' | 'Applications' | 'Security' | 'Wireless' | 'Power' | 'Unknown';

export interface GraphMetadata {
  id: string;
  type: string;
  layer: TopologyLayer;
  labels: Record<string, string>;
  groupId?: string;
  // Specific domains like ip, hostname, vendor mapped to business metadata
  properties: Record<string, any>;
}

export interface RenderMetadata {
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  icon?: string;
  selected: boolean;
  highlighted: boolean;
  expanded: boolean;
  hidden: boolean;
  pinned: boolean; // Manual layout override
}

export interface GraphNode {
  id: string;
  metadata: GraphMetadata;
  render: RenderMetadata;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  labels: Record<string, string>;
  hidden: boolean;
}

export interface GraphGroup {
  id: string;
  label: string;
  children: string[];
  bounds?: { x: number; y: number; width: number; height: number };
  collapsed: boolean;
}

export interface GraphSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
  groups: GraphGroup[];
}

export type DeltaOp = 'add' | 'update' | 'remove';

export interface GraphPatch {
  op: DeltaOp;
  entityType: 'node' | 'edge' | 'group';
  data: any; // Node, Edge, or Group depending on entityType
}

export interface GraphBatchDelta {
  patches: GraphPatch[];
}

export interface GraphViewport {
  x: number;
  y: number;
  zoom: number;
}
