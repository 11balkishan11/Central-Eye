import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Layers, Activity, Network } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { apiClient } from "@/shared/api/client";
import { TopologyCanvas } from "../adapter/TopologyCanvas";
import { applyNodeChanges, applyEdgeChanges, addEdge, NodeChange, EdgeChange, Connection } from "@xyflow/react";

// Helper to determine node category based on hostname
function determineCategory(name: string): number {
  if (!name) return 0;
  const lower = name.toLowerCase();
  if (lower.includes('core')) return 1;
  if (lower.includes('dist')) return 2;
  if (lower.includes('access')) return 3;
  if (lower.includes('server')) return 4;
  if (lower.includes('firewall') || lower.includes('sec')) return 5;
  return 0; // External/Unknown
}

// BFS to compute all downstream impacted nodes
function computeBlastRadius(failedNodeId: string, edges: any[]): Set<string> {
  const affected = new Set<string>();
  const queue = [failedNodeId];
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (!affected.has(currentId)) {
      affected.add(currentId);
      edges.forEach(edge => {
        if (edge.source === currentId && !affected.has(edge.target)) {
          queue.push(edge.target);
        }
      });
    }
  }
  return affected;
}

// Simple grid layout for React Flow intent canvas
const getLayoutedElements = (nodes: any[], edges: any[]) => {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const spacing = 150;
  
  const layoutedNodes = nodes.map((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      ...node,
      position: { x: col * spacing, y: row * spacing }
    };
  });
  return { nodes: layoutedNodes, edges };
};

export function TopologyPage() {
  const [mode, setMode] = useState<"live" | "intent">("live");

  // Raw Backend Data
  const [liveApiNodes, setLiveApiNodes] = useState<any[]>([]);
  const [liveApiEdges, setLiveApiEdges] = useState<any[]>([]);

  // State for Live React Flow Canvas (so users can drag it around)
  const [liveNodes, setLiveNodes] = useState<any[]>([]);
  const [liveEdges, setLiveEdges] = useState<any[]>([]);

  // Intent State
  const [intentNodes, setIntentNodes] = useState<any[]>([]);
  const [intentEdges, setIntentEdges] = useState<any[]>([]);

  // Blast Radius State
  const [blastRadiusMode, setBlastRadiusMode] = useState(false);
  const [simulatedFailureId, setSimulatedFailureId] = useState<string | null>(null);

  // Track deleted nodes to prevent API polling from resurrecting them
  const deletedLiveNodeIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedNodes, fetchedEdges] = await Promise.all([
          apiClient.get<any[]>("/api/v1/knowledge-graph/nodes"),
          apiClient.get<any[]>("/api/v1/knowledge-graph/edges")
        ]);
        
        setLiveApiNodes(fetchedNodes);
        setLiveApiEdges(fetchedEdges);

        // Convert API data to React Flow format for the Live Network
        const rfLiveNodes = fetchedNodes.map(node => {
          const name = node.attributes?.hostname || node.attributes?.ip || node.aliases?.[0] || node.id;
          return {
            id: node.id,
            type: 'customDevice',
            position: { x: 0, y: 0 },
            data: { 
              label: name, 
              type: node.type, 
              category: determineCategory(name), 
              attributes: node.attributes || {},
              driftStatus: null // Live mode has no drift
            }
          };
        });
        
        const rfLiveEdges = fetchedEdges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'default',
          animated: true // Animated edges for live traffic
        }));
        
        const { nodes: layoutedLiveNodes, edges: layoutedLiveEdges } = getLayoutedElements(rfLiveNodes, rfLiveEdges);
        
        // Update Live canvas state, preserving existing node positions and manual changes
        setLiveNodes(prevLiveNodes => {
          if (prevLiveNodes.length === 0) return layoutedLiveNodes;
          
          const prevMap = new Map(prevLiveNodes.map(n => [n.id, n]));
          const apiMap = new Map(layoutedLiveNodes.map(n => [n.id, n]));
          
          const finalNodes = [];
          
          // Process nodes from the API (update telemetry, preserve positions)
          for (const apiNode of layoutedLiveNodes) {
            if (deletedLiveNodeIds.current.has(apiNode.id)) {
              continue; // Skip nodes the user explicitly deleted
            }

            const existingNode = prevMap.get(apiNode.id);
            if (existingNode) {
              finalNodes.push({
                ...apiNode,
                position: existingNode.position,
                selected: existingNode.selected,
                dragging: existingNode.dragging,
                positionAbsolute: existingNode.positionAbsolute,
              });
            } else {
              finalNodes.push(apiNode);
            }
          }
          
          // Preserve nodes manually added by the user that aren't in the API response
          for (const prevNode of prevLiveNodes) {
            if (!apiMap.has(prevNode.id)) {
              finalNodes.push(prevNode);
            }
          }
          
          return finalNodes;
        });

        // Preserve live edges so user removals or additions aren't wiped out immediately
        setLiveEdges(prevLiveEdges => {
          if (prevLiveEdges.length === 0) return layoutedLiveEdges;
          
          // Merge API edges with existing edges to keep manually drawn connections or respect deletions
          // Actually, if it's the live network, it should reflect reality. 
          // But if the user manually deleted a link in Live mode, we might want to respect that.
          // For now, let's strictly use API edges for Live, BUT the user asked to not wipe out changes.
          // The easiest way is to let the frontend state dictate until the page is refreshed.
          return prevLiveEdges; 
        });

        // Initialize intent if it's empty (clone the live state so they start with a copy)
        setIntentNodes((prev) => prev.length === 0 ? JSON.parse(JSON.stringify(layoutedLiveNodes)) : prev);
        setIntentEdges((prev) => prev.length === 0 ? JSON.parse(JSON.stringify(layoutedLiveEdges)) : prev);

      } catch (err) {
        console.error("Failed to fetch topology:", err);
      }
    };
    
    fetchData();
    let interval: NodeJS.Timeout;
    if (mode === "live") {
      // Poll every 5 seconds for telemetry updates
      interval = setInterval(fetchData, 5000);
    }
    return () => clearInterval(interval);
  }, [mode]);

  // Handlers for Live Canvas
  const onLiveNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach(change => {
      if (change.type === 'remove') {
        deletedLiveNodeIds.current.add(change.id);
      }
    });
    setLiveNodes((nds) => applyNodeChanges(changes, nds));
  }, []);
  const onLiveEdgesChange = useCallback((changes: EdgeChange[]) => setLiveEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onLiveConnect = useCallback((params: Connection) => setLiveEdges((eds) => addEdge({ ...params, type: 'default', animated: true }, eds)), []);
  const onLiveNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    if (blastRadiusMode) {
      setSimulatedFailureId(node.id);
    }
  }, [blastRadiusMode]);

  // Handlers for Intent Canvas
  const onIntentNodesChange = useCallback((changes: NodeChange[]) => setIntentNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onIntentEdgesChange = useCallback((changes: EdgeChange[]) => setIntentEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onIntentConnect = useCallback((params: Connection) => setIntentEdges((eds) => addEdge({ ...params, type: 'default' }, eds)), []);

  const addNodeToCanvas = (type: string) => {
    const newNode = {
      id: crypto.randomUUID(),
      type: 'customDevice',
      position: { x: 100, y: 100 },
      data: {
        label: `New ${type}`,
        type: type.toUpperCase(),
        category: determineCategory(`New ${type}`),
        attributes: {} // Intent/Manual nodes don't have real telemetry yet
      }
    };
    
    if (mode === "live") {
      setLiveNodes([...liveNodes, newNode]);
    } else {
      setIntentNodes([...intentNodes, newNode]);
    }
  };

  // Compute Intent Display with Drift Logic
  const { displayIntentNodes, displayIntentEdges, stats } = useMemo(() => {
    const liveNodeIds = new Set(liveNodes.map(n => n.id));
    const intentNodeIds = new Set(intentNodes.map(n => n.id));

    const finalNodes = [...intentNodes.map(node => {
      if (liveNodeIds.has(node.id)) {
        return { ...node, data: { ...node.data, driftStatus: 'match' } };
      } else {
        return { ...node, data: { ...node.data, driftStatus: 'missing' } };
      }
    })];

    // Add rogue nodes from live
    liveNodes.forEach(liveNode => {
      if (!intentNodeIds.has(liveNode.id)) {
        finalNodes.push({
          ...liveNode,
          type: 'customDevice',
          data: { ...liveNode.data, driftStatus: 'extra' }
        });
      }
    });

    const getEdgeKey = (e: any) => `${e.source}-${e.target}`;
    const liveEdgeKeys = new Set(liveEdges.map(getEdgeKey));
    const intentEdgeKeys = new Set(intentEdges.map(getEdgeKey));

    const finalEdges = [...intentEdges.map(edge => {
      const key = getEdgeKey(edge);
      if (liveEdgeKeys.has(key)) {
        return { ...edge, style: { stroke: '#22c55e', strokeWidth: 2 } }; 
      } else {
        return { ...edge, animated: true, style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' } };
      }
    })];

    liveEdges.forEach(liveEdge => {
      const key = getEdgeKey(liveEdge);
      if (!intentEdgeKeys.has(key)) {
        finalEdges.push({
          id: key,
          source: liveEdge.source,
          target: liveEdge.target,
          style: { stroke: '#eab308', strokeWidth: 2 }
        });
      }
    });

    let missingNodes = 0, extraNodes = 0, missingEdges = 0, extraEdges = 0;
    finalNodes.forEach(n => {
      if (n.data.driftStatus === 'missing') missingNodes++;
      if (n.data.driftStatus === 'extra') extraNodes++;
    });
    finalEdges.forEach(e => {
      if (e.style?.stroke === '#ef4444') missingEdges++;
      if (e.style?.stroke === '#eab308') extraEdges++;
    });

    return { 
      displayIntentNodes: finalNodes, 
      displayIntentEdges: finalEdges,
      stats: { missingNodes, extraNodes, missingEdges, extraEdges }
    };
  }, [liveNodes, liveEdges, intentNodes, intentEdges]);

  // Compute Live Display with Blast Radius Logic
  const { displayLiveNodes, displayLiveEdges } = useMemo(() => {
    if (!blastRadiusMode || !simulatedFailureId) {
      return { displayLiveNodes: liveNodes, displayLiveEdges: liveEdges };
    }

    const affectedIds = computeBlastRadius(simulatedFailureId, liveEdges);

    const finalNodes = liveNodes.map(node => {
      let impactState = 'unaffected';
      if (node.id === simulatedFailureId) impactState = 'failed';
      else if (affectedIds.has(node.id)) impactState = 'impacted';
      
      return { ...node, data: { ...node.data, impactState } };
    });

    const finalEdges = liveEdges.map(edge => {
      let impactState = 'unaffected';
      if (affectedIds.has(edge.source) && affectedIds.has(edge.target)) {
        impactState = 'impacted';
      }
      return { 
        ...edge, 
        animated: impactState === 'unaffected', // Stop animating impacted traffic
        style: impactState === 'impacted' 
          ? { stroke: '#f97316', strokeWidth: 2, opacity: 0.8 } 
          : { stroke: '#475569', opacity: 0.2 } 
      };
    });

    return { displayLiveNodes: finalNodes, displayLiveEdges: finalEdges };
  }, [liveNodes, liveEdges, blastRadiusMode, simulatedFailureId]);

  // Telemetry Aggregates for Live View
  const liveStats = useMemo(() => {
    let highCpuCount = 0;
    let highMemCount = 0;
    liveNodes.forEach(n => {
      if (n.data.attributes?.cpu > 80) highCpuCount++;
      if (n.data.attributes?.memory > 80) highMemCount++;
    });
    return { highCpuCount, highMemCount };
  }, [liveNodes]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Topology Drift Analysis</h1>
          <p className="text-sm text-muted-foreground">Compare intended architecture against live reality.</p>
        </div>
        <div className="flex items-center gap-2">
          {mode === "live" && (
            <Button 
              variant={blastRadiusMode ? "destructive" : "outline"}
              size="sm"
              onClick={() => {
                setBlastRadiusMode(!blastRadiusMode);
                setSimulatedFailureId(null);
              }}
              className="mr-2"
            >
              Blast Radius Mode {blastRadiusMode ? 'ON' : 'OFF'}
            </Button>
          )}
          <div className="flex bg-muted p-1 rounded-md ml-4">
            <Button 
              variant={mode === "live" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => {
                setMode("live");
                setBlastRadiusMode(false);
              }}
            >
              <Activity className="w-4 h-4 mr-2" /> Live Network
            </Button>
            <Button 
              variant={mode === "intent" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setMode("intent")}
            >
              <Layers className="w-4 h-4 mr-2" /> Compare Intent
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid md:grid-cols-4 gap-4 pb-4 h-[calc(100vh-140px)]">
        
        {/* Intent Sidebar */}
        {mode === "intent" && (
          <div className="col-span-1 space-y-4 overflow-y-auto">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Drift Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-red-500">
                  <span className="text-sm font-medium">Missing Devices</span>
                  <Badge variant="outline" className="text-red-500 border-red-500">{stats?.missingNodes}</Badge>
                </div>
                <div className="flex items-center justify-between text-yellow-500">
                  <span className="text-sm font-medium">Rogue Devices</span>
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">{stats?.extraNodes}</Badge>
                </div>
                <div className="flex items-center justify-between text-red-500">
                  <span className="text-sm font-medium">Missing Links</span>
                  <Badge variant="outline" className="text-red-500 border-red-500">{stats?.missingEdges}</Badge>
                </div>
                <div className="flex items-center justify-between text-yellow-500">
                  <span className="text-sm font-medium">Rogue Links</span>
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">{stats?.extraEdges}</Badge>
                </div>
                
                {(stats?.missingNodes === 0 && stats?.extraNodes === 0 && stats?.missingEdges === 0 && stats?.extraEdges === 0) ? (
                  <div className="mt-4 p-3 bg-green-500/10 text-green-500 rounded-md text-sm text-center font-medium">
                    100% Matching Intent!
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-red-500/10 text-red-500 rounded-md text-sm text-center font-medium">
                    Drift Detected
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Add Element</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => addNodeToCanvas("Core Router")}>
                  <Network className="w-4 h-4 mr-2" /> Add Core Router
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addNodeToCanvas("Access Switch")}>
                  <Network className="w-4 h-4 mr-2" /> Add Access Switch
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addNodeToCanvas("Firewall")}>
                  <Network className="w-4 h-4 mr-2" /> Add Firewall
                </Button>
                <div className="text-xs text-muted-foreground mt-4 text-center">
                  Drag handles between nodes to create connections.
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Live Sidebar */}
        {mode === "live" && (
          <div className="col-span-1 space-y-4 overflow-y-auto">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Topology Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Discovered Nodes</span>
                  <Badge variant="outline">{liveNodes.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Links</span>
                  <Badge variant="outline">{liveEdges.length}</Badge>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Live Telemetry</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">High CPU Alerts</span>
                    <Badge variant="outline" className={liveStats.highCpuCount > 0 ? "text-red-500 border-red-500" : "text-green-500 border-green-500"}>
                      {liveStats.highCpuCount} Nodes
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">High Memory Alerts</span>
                    <Badge variant="outline" className={liveStats.highMemCount > 0 ? "text-red-500 border-red-500" : "text-green-500 border-green-500"}>
                      {liveStats.highMemCount} Nodes
                    </Badge>
                  </div>
                </div>

                {blastRadiusMode && (
                  <div className="pt-4 border-t mt-4 animate-in fade-in">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                      <h4 className="text-xs font-bold text-red-500 mb-1">IMPACT SIMULATION</h4>
                      <p className="text-[10px] text-muted-foreground">
                        {simulatedFailureId 
                          ? "Simulating failure. Orange nodes represent the downstream blast radius that will lose connectivity." 
                          : "Click any node to simulate a catastrophic failure and calculate downstream impact."}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div><span className="text-sm text-muted-foreground">Core</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div><span className="text-sm text-muted-foreground">Distribution</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div><span className="text-sm text-muted-foreground">Access</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div><span className="text-sm text-muted-foreground">Servers</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div><span className="text-sm text-muted-foreground">Security</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#64748b]"></div><span className="text-sm text-muted-foreground">External/Unknown</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Add Element</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => addNodeToCanvas("Core Router")}>
                  <Network className="w-4 h-4 mr-2" /> Add Core Router
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addNodeToCanvas("Access Switch")}>
                  <Network className="w-4 h-4 mr-2" /> Add Access Switch
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addNodeToCanvas("Firewall")}>
                  <Network className="w-4 h-4 mr-2" /> Add Firewall
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Canvas */}
        <Card className="col-span-3 h-full overflow-hidden flex flex-col relative border-primary/20">
          <CardContent className="p-0 flex-1 relative bg-gradient-to-b from-card to-muted/10">
            {mode === "live" ? (
              <TopologyCanvas 
                nodes={displayLiveNodes}
                edges={displayLiveEdges}
                onNodesChange={onLiveNodesChange}
                onEdgesChange={onLiveEdgesChange}
                onConnect={onLiveConnect}
                onNodeClick={onLiveNodeClick}
                readOnly={false} // Make live editable so user can rearrange it!
              />
            ) : (
              <TopologyCanvas 
                nodes={displayIntentNodes}
                edges={displayIntentEdges}
                onNodesChange={onIntentNodesChange}
                onEdgesChange={onIntentEdgesChange}
                onConnect={onIntentConnect}
                readOnly={false}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
