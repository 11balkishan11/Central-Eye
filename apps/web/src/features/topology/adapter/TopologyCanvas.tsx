import * as React from 'react';
import { ReactFlow, Controls, Background, MiniMap, ReactFlowProvider, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useStore } from 'zustand';
import { runtime } from '../../../runtime/container';
import { NodeMapper, EdgeMapper } from './mappers';
import type { GraphState } from '../runtime/GraphStore';

const CustomDeviceNode = ({ data }: any) => {
  return (
    <div className={`p-2 border rounded shadow-sm bg-card flex flex-col items-center justify-center min-w-[100px] min-h-[50px] ${data.selected ? 'ring-2 ring-primary border-primary' : ''} ${data.highlighted ? 'ring-2 ring-accent border-accent' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="font-medium text-xs truncate max-w-full">{data.label}</div>
      <div className="text-[10px] text-muted-foreground">{data.type}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = {
  customDevice: CustomDeviceNode,
};

const CanvasInner = () => {
  // We grab the store from the registry. In a real app we'd pass it via context or hook.
  // We assume the store was registered by the TopologyFeature.
  const storeApi = runtime.storeRegistry.getStore('topology');
  if (!storeApi) return <div>Topology Store not initialized</div>;

  // We are observing the global graph state.
  const graphState = useStore(storeApi as any) as GraphState;
  const nodes = React.useMemo(() => graphState.data.nodes.map(NodeMapper.toReactFlow), [graphState.data.nodes]);
  const edges = React.useMemo(() => graphState.data.edges.map(EdgeMapper.toReactFlow), [graphState.data.edges]);

  // const { fitView } = useReactFlow();

  // Listen for viewport commands
  React.useEffect(() => {
    // In a full implementation, we'd subscribe to GraphViewportRuntime here
    // e.g. runtime.selectionEngine...
  }, []);

  const onNodeClick = React.useCallback((_, node: any) => {
    // We do NOT modify React Flow state. We dispatch to the Graph Controller.
    // For MVP, we'll just log it. A real implementation would call GraphController.focusNode(node.id)
    console.log("Clicked node", node.id);
  }, []);

  const onPaneClick = React.useCallback(() => {
    console.log("Clicked pane");
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
};

export const TopologyCanvas = () => {
  return (
    <div className="w-full h-full border rounded-md bg-background overflow-hidden relative">
      <ReactFlowProvider>
        <CanvasInner />
      </ReactFlowProvider>
    </div>
  );
};
