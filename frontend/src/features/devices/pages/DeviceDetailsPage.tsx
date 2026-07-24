import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Server, Activity, AlertTriangle, ShieldCheck, Clock, RefreshCw, Terminal, Cpu, Thermometer, Fan, Zap, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";
import { useDevice } from "../hooks/useDevices";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { CpuChart, MemoryChart } from "@/features/dashboard/components/DashboardCharts";
import { useDemoDataEngine } from "@/features/dashboard/hooks/useDemoDataEngine";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Progress } from "@/shared/components/ui/progress";

export function DeviceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: device, isLoading, isError, error, refetch } = useDevice(id || "");
  
  const { cpuData, memoryData, currentCpu, currentLatency } = useDemoDataEngine();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !device) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <ErrorState 
          title="Failed to load device" 
          description={error?.message || "Device not found"}
          retryAction={() => refetch()}
        />
      </div>
    );
  }

  const isHealthy = device.health === "good" || device.health === "healthy";

  return (
    <div className="flex flex-col h-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/devices">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm shrink-0">
              <Server className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{device.hostname}</h1>
                <Badge variant={isHealthy ? "default" : device.health === "warning" ? "secondary" : "destructive"} 
                       className={isHealthy ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : device.health === "warning" ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" : ""}>
                  {device.health}
                </Badge>
                <Badge variant="outline" className="bg-background">
                  <span className={`w-2 h-2 rounded-full mr-2 ${device.oper_state === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {device.oper_state}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                {device.management_ip} • {device.vendor || "Unknown Vendor"} {device.model || "Unknown Model"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Terminal className="h-4 w-4" />
            Terminal
          </Button>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Poll Now
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">Overview</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">Performance</TabsTrigger>
          <TabsTrigger value="interfaces" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">Interfaces</TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">Inventory</TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">Alerts</TabsTrigger>
          <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">Logs</TabsTrigger>
          <TabsTrigger value="config" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">Configuration</TabsTrigger>
          <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Response Time</CardTitle>
                <Activity className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentLatency} ms</div>
                <div className="text-xs text-muted-foreground mt-1">Last polled: 12 seconds ago</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">System Uptime</CardTitle>
                <Clock className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124 days</div>
                <div className="text-xs text-muted-foreground mt-1">Since last reboot</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">CPU Usage</CardTitle>
                <Cpu className="w-4 h-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentCpu}%</div>
                <Progress value={Number(currentCpu)} className="h-1 mt-2" />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <div className="text-xs text-muted-foreground mt-1 text-red-500">1 Critical, 1 Warning</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Identity & Asset Info */}
            <Card className="col-span-3 shadow-sm">
              <CardHeader>
                <CardTitle>Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <span className="text-muted-foreground block mb-1">Vendor</span>
                    <span className="font-medium">{device.vendor || "Cisco Systems"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Model</span>
                    <span className="font-medium">{device.model || "Catalyst 9300"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Serial Number</span>
                    <span className="font-medium font-mono">{device.serial_number || "FOC2349U85A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Firmware Version</span>
                    <span className="font-medium">{device.firmware || "17.3.4"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Location</span>
                    <span className="font-medium">{device.location || "Rack 4, U12, Primary DC"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Device Role</span>
                    <span className="font-medium">Core Switch</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Collector</span>
                    <span className="font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Collector-East
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Discovery Status</span>
                    <span className="font-medium text-green-600 flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Success (SNMPv3)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hardware Sensors */}
            <Card className="col-span-4 shadow-sm">
              <CardHeader>
                <CardTitle>Hardware Sensors</CardTitle>
                <CardDescription>Real-time physical chassis telemetry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50">
                    <Thermometer className="w-8 h-8 text-amber-500 mb-2" />
                    <span className="text-2xl font-bold font-mono">42°C</span>
                    <span className="text-xs text-muted-foreground mt-1">Inlet Temp</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50">
                    <Thermometer className="w-8 h-8 text-orange-500 mb-2" />
                    <span className="text-2xl font-bold font-mono">55°C</span>
                    <span className="text-xs text-muted-foreground mt-1">Exhaust Temp</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50">
                    <Fan className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-2xl font-bold font-mono">8400</span>
                    <span className="text-xs text-muted-foreground mt-1">Fan 1 RPM</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50">
                    <Zap className="w-8 h-8 text-green-500 mb-2" />
                    <span className="text-2xl font-bold font-mono">110W</span>
                    <span className="text-xs text-muted-foreground mt-1">Power Draw</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interfaces" className="mt-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Network Interfaces</CardTitle>
                <CardDescription>Live port status and telemetry</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> 24 Up</span>
                <span className="flex items-center gap-1 ml-3"><span className="w-2 h-2 rounded-full bg-red-500"></span> 2 Down</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6">Port</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>VLAN</TableHead>
                    <TableHead>Traffic (In/Out)</TableHead>
                    <TableHead>Errors</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 'Gi1/0/1', status: 'up', speed: '1 Gbps', vlan: '10', in: '45.2', out: '12.8', errors: 0, desc: 'Uplink to Core-1' },
                    { id: 'Gi1/0/2', status: 'up', speed: '1 Gbps', vlan: '10', in: '8.4', out: '4.1', errors: 0, desc: 'Server Rack A' },
                    { id: 'Gi1/0/3', status: 'down', speed: '1 Gbps', vlan: '20', in: '0.0', out: '0.0', errors: 0, desc: 'Unused' },
                    { id: 'Gi1/0/4', status: 'up', speed: '1 Gbps', vlan: '30', in: '124.5', out: '80.2', errors: 12, desc: 'Storage NAS' },
                    { id: 'Gi1/0/5', status: 'up', speed: '1 Gbps', vlan: '10', in: '2.1', out: '0.5', errors: 0, desc: 'Printer 1' },
                  ].map((iface) => (
                    <TableRow key={iface.id}>
                      <TableCell className="font-mono font-medium pl-6">{iface.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${iface.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="capitalize">{iface.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{iface.speed}</TableCell>
                      <TableCell>{iface.vlan}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs font-mono">
                          <span className="text-emerald-500 flex items-center"><ArrowDownRight className="w-3 h-3 mr-1"/>{iface.in} Mbps</span>
                          <span className="text-amber-500 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1"/>{iface.out} Mbps</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={iface.errors > 0 ? "text-red-500 font-bold" : "text-muted-foreground"}>{iface.errors}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[150px]">{iface.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>CPU Performance</CardTitle>
                <CardDescription>Processor utilization over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <CpuChart data={cpuData} />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Memory Allocation</CardTitle>
                <CardDescription>RAM usage over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <MemoryChart data={memoryData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <div className="h-[300px] flex items-center justify-center border rounded-md border-dashed">
            <p className="text-muted-foreground flex flex-col items-center">
              <Layers className="w-8 h-8 mb-2 opacity-50" />
              Hardware components (FRUs, power supplies, line cards) will appear here.
            </p>
          </div>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
