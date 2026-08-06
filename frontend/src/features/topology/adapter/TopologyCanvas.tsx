import * as React from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  MiniMap, 
  ReactFlowProvider, 
  Handle, 
  Position,
  NodeChange,
  EdgeChange,
  Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Cpu } from 'lucide-react'; // Using standard lucide icons

const categoryColors: Record<number, string> = {
  0: '#64748b', // External
  1: '#3b82f6', // Core
  2: '#8b5cf6', // Distribution
  3: '#10b981', // Access
  4: '#f59e0b', // Servers
  5: '#ef4444'  // Security
};

const CustomDeviceNode = ({ data }: any) => {
  const category = data.category !== undefined ? data.category : 0;
  const bgColor = categoryColors[category] || '#64748b';

  let driftBorder = '';
  
  // Blast Radius Styling Precedence
  let isFailed = false;
  let isUnaffected = false;
  
  if (data.impactState === 'failed') {
    driftBorder = 'ring-4 ring-red-600 ring-offset-2 ring-offset-background shadow-[0_0_20px_rgba(220,38,38,0.8)]';
    isFailed = true;
  } else if (data.impactState === 'impacted') {
    driftBorder = 'ring-4 ring-orange-500 ring-offset-2 ring-offset-background shadow-[0_0_15px_rgba(249,115,22,0.6)]';
  } else if (data.impactState === 'unaffected') {
    isUnaffected = true;
  }
  // Drift Styling (only if not in blast radius mode)
  else if (data.driftStatus === 'match') {
    driftBorder = 'ring-4 ring-green-500 ring-offset-2 ring-offset-background';
  } else if (data.driftStatus === 'missing') {
    driftBorder = 'ring-4 ring-red-500 ring-offset-2 ring-offset-background border-dashed opacity-50';
  } else if (data.driftStatus === 'extra') {
    driftBorder = 'ring-4 ring-yellow-500 ring-offset-2 ring-offset-background';
  }

  // Symbol sizes mapped from ECharts logic
  const size = category === 1 ? 40 : category === 5 ? 35 : category === 0 ? 50 : 30;

  // Telemetry processing
  const attrs = data.attributes || {};
  const cpu = attrs.cpu;
  const memory = attrs.memory;
  
  const hasHighCpu = cpu !== undefined && cpu > 80;
  const hasHighMem = memory !== undefined && memory > 80;

  return (
    <div className={`relative flex flex-col items-center justify-center group cursor-pointer transition-opacity duration-300 ${isUnaffected ? 'opacity-30' : 'opacity-100'}`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      {/* Node Circle */}
      <div className="relative">
        {/* Pulsing ring for high CPU/Mem or Blast Radius Failure */}
        {((hasHighCpu || hasHighMem) && !data.driftStatus && !data.impactState) || isFailed ? (
          <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isFailed ? 'bg-red-600' : 'bg-red-500'}`} style={{ transform: 'scale(1.5)' }}></div>
        ) : null}
        
        <div 
          style={{ width: size, height: size, backgroundColor: bgColor }} 
          className={`relative z-10 rounded-full shadow-lg ${driftBorder} flex items-center justify-center transition-transform hover:scale-110`}
        />
        
        {/* Telemetry Badges (Only show if data exists and not in drift comparison) */}
        {!data.driftStatus && cpu !== undefined && (
          <div className="absolute -top-3 -right-3 z-20 flex flex-col gap-1">
            <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shadow-sm flex items-center gap-1 ${hasHighCpu ? 'bg-red-500/10 text-red-500 border-red-500' : 'bg-background text-foreground'}`}>
              <Cpu className="w-2.5 h-2.5" />
              {cpu}%
            </div>
          </div>
        )}
      </div>

      <div className="absolute left-[110%] ml-2 font-medium text-xs whitespace-nowrap text-foreground bg-background/80 px-1 rounded z-20">
        {data.label}
      </div>

      {/* Hover Tooltip (Industry Standard) */}
      <div className="absolute top-[120%] left-1/2 -translate-x-1/2 mt-2 w-48 p-2 rounded-md bg-popover text-popover-foreground shadow-xl border text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="font-semibold border-b pb-1 mb-1">{data.label}</div>
        <div className="flex justify-between"><span>Type:</span> <span className="text-muted-foreground">{data.type || 'Unknown'}</span></div>
        {attrs.vendor && <div className="flex justify-between"><span>Vendor:</span> <span className="text-muted-foreground">{attrs.vendor}</span></div>}
        {attrs.os_version && <div className="flex justify-between"><span>OS:</span> <span className="text-muted-foreground">{attrs.os_version}</span></div>}
        {attrs.ip && <div className="flex justify-between"><span>IP:</span> <span className="text-muted-foreground">{attrs.ip}</span></div>}
        {attrs.mac && <div className="flex justify-between"><span>MAC:</span> <span className="text-muted-foreground">{attrs.mac}</span></div>}
        {memory !== undefined && <div className="flex justify-between"><span>Memory:</span> <span className={hasHighMem ? 'text-red-500 font-medium' : 'text-green-500'}>{memory}%</span></div>}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = {
  customDevice: CustomDeviceNode,
};

interface TopologyCanvasProps {
  nodes: any[];
  edges: any[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Connection) => void;
  onNodeClick?: (event: React.MouseEvent, node: any) => void;
  readOnly?: boolean;
}

const CanvasInner = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick, readOnly }: TopologyCanvasProps) => {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={readOnly ? undefined : onNodesChange}
      onEdgesChange={readOnly ? undefined : onEdgesChange}
      onConnect={readOnly ? undefined : onConnect}
      onNodeClick={onNodeClick}
      fitView
      elementsSelectable={!readOnly}
      nodesConnectable={!readOnly}
      nodesDraggable={!readOnly}
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
};

export const TopologyCanvas = (props: TopologyCanvasProps) => {
  return (
    <div className="w-full h-full border rounded-md bg-background overflow-hidden relative">
      <ReactFlowProvider>
        <CanvasInner {...props} />
      </ReactFlowProvider>
    </div>
  );
};
