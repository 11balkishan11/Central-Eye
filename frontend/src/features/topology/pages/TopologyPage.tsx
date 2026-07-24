import { useState } from "react";
import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";
import { Layers, Filter, Expand } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

const initialNodes = [
  { id: "0", name: "Internet", category: 0, symbolSize: 50 },
  { id: "1", name: "Core-Router-A", category: 1, symbolSize: 40 },
  { id: "2", name: "Core-Router-B", category: 1, symbolSize: 40 },
  { id: "3", name: "Dist-Switch-1", category: 2, symbolSize: 30 },
  { id: "4", name: "Dist-Switch-2", category: 2, symbolSize: 30 },
  { id: "5", name: "Access-Switch-1", category: 3, symbolSize: 20 },
  { id: "6", name: "Access-Switch-2", category: 3, symbolSize: 20 },
  { id: "7", name: "Access-Switch-3", category: 3, symbolSize: 20 },
  { id: "8", name: "Server-Farm-A", category: 4, symbolSize: 25 },
  { id: "9", name: "Server-Farm-B", category: 4, symbolSize: 25 },
  { id: "10", name: "Firewall-Primary", category: 5, symbolSize: 35 },
];

const initialLinks = [
  { source: "0", target: "10" },
  { source: "10", target: "1" },
  { source: "10", target: "2" },
  { source: "1", target: "2" },
  { source: "1", target: "3" },
  { source: "1", target: "4" },
  { source: "2", target: "3" },
  { source: "2", target: "4" },
  { source: "3", target: "5" },
  { source: "3", target: "6" },
  { source: "4", target: "7" },
  { source: "4", target: "8" },
  { source: "3", target: "9" },
  { source: "5", target: "6" }
];

export function TopologyPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [layout, setLayout] = useState<"force" | "circular">("force");

  const option = {
    tooltip: {
      formatter: "{b}"
    },
    legend: {
      data: ['External', 'Core', 'Distribution', 'Access', 'Servers', 'Security'],
      textStyle: { color: isDark ? '#ccc' : '#333' },
      orient: 'vertical',
      right: 20,
      top: 20
    },
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: layout,
        data: initialNodes,
        links: initialLinks,
        categories: [
          { name: 'External', itemStyle: { color: '#64748b' } },
          { name: 'Core', itemStyle: { color: '#3b82f6' } },
          { name: 'Distribution', itemStyle: { color: '#8b5cf6' } },
          { name: 'Access', itemStyle: { color: '#10b981' } },
          { name: 'Servers', itemStyle: { color: '#f59e0b' } },
          { name: 'Security', itemStyle: { color: '#ef4444' } }
        ],
        roam: true,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          color: isDark ? '#fff' : '#000',
          fontSize: 12
        },
        force: {
          repulsion: 1000,
          edgeLength: [50, 200]
        },
        lineStyle: {
          color: isDark ? '#475569' : '#cbd5e1',
          curveness: 0.1,
          width: 2
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4
          }
        }
      }
    ]
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Network Topology</h1>
          <p className="text-sm text-muted-foreground">Interactive map of all discovered infrastructure.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setLayout(layout === "force" ? "circular" : "force")}>
            <Layers className="w-4 h-4 mr-2" />
            {layout === "force" ? "Circular Layout" : "Force Layout"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Layer Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Show Core layer</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Show Distribution layer</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Show Access layer</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Show Servers</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline">
            <Expand className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 grid md:grid-cols-4 gap-4 pb-4 h-[calc(100vh-140px)]">
        <Card className="col-span-3 h-full overflow-hidden flex flex-col relative border-primary/20">
          <CardContent className="p-0 flex-1 relative bg-gradient-to-b from-card to-muted/10">
            <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
          </CardContent>
        </Card>

        <div className="space-y-4 overflow-y-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Topology Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Nodes</span>
                <Badge variant="outline">{initialNodes.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Links</span>
                <Badge variant="outline">{initialLinks.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Health Status</span>
                <span className="text-sm text-green-500 font-medium">100% Healthy</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Selected Node</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground italic text-center py-4">
                Click a node to view its details.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
