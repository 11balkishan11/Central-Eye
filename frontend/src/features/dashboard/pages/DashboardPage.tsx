import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { useSites } from "@/features/sites/hooks/useSites";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Building2, MapPin, Router, Server, ServerCrash, Activity, ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useDemoDataEngine } from "../hooks/useDemoDataEngine";
import { CpuChart, MemoryChart, NetworkChart, HealthDonutChart } from "../components/DashboardCharts";

export function DashboardPage() {
  const { data: orgData } = useOrganizations({ limit: 1 });
  const { data: siteData } = useSites({ limit: 1 });
  // We use the real counts but force them to minimums for demo purposes if empty
  const totalOrgs = Math.max(orgData?.total || 0, 14);
  const totalSites = Math.max(siteData?.total || 0, 38);
  const totalCollectors = 6;
  const totalDevices = 512;
  const healthyDevices = 480;
  const warningDevices = 21;
  const criticalDevices = 11;

  const { cpuData, memoryData, throughputIn, throughputOut, currentCpu, currentMemory, incidents } = useDemoDataEngine();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ServerCrash className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-500/5';
      case 'warning': return 'border-l-amber-500 bg-amber-500/5';
      case 'info': return 'border-l-green-500 bg-green-500/5';
      default: return 'border-l-blue-500 bg-blue-500/5';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-12 overflow-x-hidden">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Central Eye Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time overview of global infrastructure.</p>
      </div>

      {/* Executive Summary Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-card/50 shadow-sm border-muted/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Organizations</CardTitle>
            <Building2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrgs}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-card/50 shadow-sm border-muted/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sites</CardTitle>
            <MapPin className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSites}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 shadow-sm border-muted/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collectors</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCollectors}</div>
            <div className="flex items-center text-xs mt-1 text-green-500">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              All collectors online
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 shadow-sm border-muted/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Devices</CardTitle>
            <Router className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDevices}</div>
            <div className="flex items-center text-xs mt-1 space-x-3">
              <span className="text-green-500 font-medium">{healthyDevices} Healthy</span>
              <span className="text-amber-500 font-medium">{warningDevices} Warning</span>
              <span className="text-red-500 font-medium">{criticalDevices} Critical</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* CPU Chart */}
        <Card className="col-span-3 lg:col-span-2 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              CPU Usage
              <span className="text-2xl font-bold text-blue-500">{currentCpu}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] p-0 mt-4">
            <CpuChart data={cpuData} />
          </CardContent>
        </Card>

        {/* Memory Chart */}
        <Card className="col-span-3 lg:col-span-2 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              Memory Usage
              <span className="text-2xl font-bold text-purple-500">{currentMemory}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] p-0 mt-4">
            <MemoryChart data={memoryData} />
          </CardContent>
        </Card>

        {/* Network Throughput */}
        <Card className="col-span-3 lg:col-span-2 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              Throughput
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-emerald-500 flex items-center"><ArrowDownRight className="w-3 h-3 mr-1"/> {(throughputIn[throughputIn.length-1]?.value || 0).toFixed(0)} Mbps</span>
                <span className="text-sm font-bold text-amber-500 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1"/> {(throughputOut[throughputOut.length-1]?.value || 0).toFixed(0)} Mbps</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] p-0 mt-4">
            <NetworkChart dataIn={throughputIn} dataOut={throughputOut} />
          </CardContent>
        </Card>
      </div>

      {/* Third Row: Timeline, Health Donut, Recent Devices */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 h-auto lg:h-[400px]">
        {/* Timeline */}
        <Card className="col-span-3 lg:col-span-2 shadow-sm overflow-hidden flex flex-col min-h-[350px] lg:min-h-0">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-base font-semibold flex items-center">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              Event Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            <div className="flex flex-col">
              {incidents.map((incident) => (
                <div key={incident.id} className={`flex items-start p-3 border-b border-border/50 border-l-4 ${getSeverityColor(incident.severity)} transition-all duration-500 hover:bg-muted/50`}>
                  <div className="flex-shrink-0 mt-0.5 mr-3">
                    {getSeverityIcon(incident.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {incident.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {incident.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Distribution */}
        <Card className="col-span-3 lg:col-span-2 shadow-sm min-h-[350px] lg:min-h-0">
          <CardHeader className="pb-0 text-center">
            <CardTitle className="text-base font-semibold">Health Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <HealthDonutChart />
          </CardContent>
        </Card>

        {/* Recent Devices */}
        <Card className="col-span-3 lg:col-span-2 shadow-sm overflow-hidden flex flex-col min-h-[350px] lg:min-h-0">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-base font-semibold flex items-center">
              <Server className="w-4 h-4 mr-2 text-muted-foreground" />
              Critical Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            <div className="flex flex-col">
              {[
                { name: 'Core-Router-01', ip: '10.0.1.254', vendor: 'Cisco', status: 'Healthy', ping: '2ms' },
                { name: 'FW-Edge-Primary', ip: '10.0.1.1', vendor: 'Juniper', status: 'Healthy', ping: '1ms' },
                { name: 'Dist-Switch-03', ip: '10.0.4.12', vendor: 'HP', status: 'Warning', ping: '12ms' },
                { name: 'UPS-Main-A', ip: '10.0.9.5', vendor: 'APC', status: 'Critical', ping: '5ms' },
                { name: 'Storage-NAS-01', ip: '10.0.10.100', vendor: 'NetApp', status: 'Healthy', ping: '3ms' },
              ].map((device) => (
                <div key={device.name} className="flex items-center justify-between p-3 border-b border-border/50 hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Router className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none truncate max-w-[120px] sm:max-w-none">{device.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{device.ip}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-semibold ${device.status === 'Healthy' ? 'text-green-500' : device.status === 'Warning' ? 'text-amber-500' : 'text-red-500'}`}>
                      {device.status}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{device.vendor} • {device.ping}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
