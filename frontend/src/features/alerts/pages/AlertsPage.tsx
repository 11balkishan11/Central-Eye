import { useState } from "react";
import { AlertTriangle, ServerCrash, Info, CheckCircle2, Search, Clock, Activity, ShieldAlert, Cpu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

type AlertSeverity = "critical" | "warning" | "info";
type AlertStatus = "active" | "acknowledged" | "resolved";

interface Alert {
  id: string;
  message: string;
  device: string;
  ip: string;
  severity: AlertSeverity;
  status: AlertStatus;
  timestamp: string;
  category: string;
}

const initialAlerts: Alert[] = [
  { id: "ALT-001", message: "BGP neighbor 10.0.1.254 went down", device: "Core-Router-A", ip: "10.0.1.1", severity: "critical", status: "active", timestamp: "2 mins ago", category: "Routing" },
  { id: "ALT-002", message: "CPU utilization exceeded 90%", device: "Dist-Switch-2", ip: "10.0.4.12", severity: "warning", status: "active", timestamp: "15 mins ago", category: "Performance" },
  { id: "ALT-003", message: "UPS battery running low (15% remaining)", device: "UPS-Main-A", ip: "10.0.9.5", severity: "critical", status: "acknowledged", timestamp: "1 hour ago", category: "Power" },
  { id: "ALT-004", message: "High latency on WAN link Gi0/1 (124ms)", device: "Edge-Router-1", ip: "192.168.1.1", severity: "warning", status: "active", timestamp: "2 hours ago", category: "Performance" },
  { id: "ALT-005", message: "Configuration changed by admin", device: "Core-Router-B", ip: "10.0.1.2", severity: "info", status: "active", timestamp: "3 hours ago", category: "Audit" },
  { id: "ALT-006", message: "SNMP authentication failure", device: "Access-Switch-3", ip: "10.0.5.23", severity: "warning", status: "resolved", timestamp: "1 day ago", category: "Security" },
  { id: "ALT-007", message: "Port channel 1 degraded (1 link down)", device: "Core-Router-A", ip: "10.0.1.1", severity: "critical", status: "resolved", timestamp: "2 days ago", category: "Interface" },
];

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const handleAcknowledge = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: "acknowledged" } : a));
  };

  const handleResolve = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: "resolved" } : a));
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === "active" && a.status === "resolved") return false;
    if (filter === "critical" && a.severity !== "critical") return false;
    if (filter === "warning" && a.severity !== "warning") return false;
    if (search && !a.message.toLowerCase().includes(search.toLowerCase()) && !a.device.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical": return <ServerCrash className="w-5 h-5 text-red-500" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "info": return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Performance": return <Activity className="w-3 h-3 mr-1" />;
      case "Security": return <ShieldAlert className="w-3 h-3 mr-1" />;
      case "Power": return <Cpu className="w-3 h-3 mr-1" />;
      default: return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alerts Center</h1>
          <p className="text-sm text-muted-foreground">Monitor and resolve infrastructure incidents.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Critical Alerts</p>
              <ServerCrash className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-3xl font-bold mt-2">{alerts.filter(a => a.severity === "critical" && a.status !== "resolved").length}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Warnings</p>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-3xl font-bold mt-2">{alerts.filter(a => a.severity === "warning" && a.status !== "resolved").length}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">Acknowledged</p>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mt-2">{alerts.filter(a => a.status === "acknowledged").length}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Resolved Today</p>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold mt-2">{alerts.filter(a => a.status === "resolved").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col shadow-sm">
        <div className="border-b border-border bg-muted/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Tabs defaultValue="active" onValueChange={setFilter} className="w-[400px]">
              <TabsList className="bg-transparent border border-border h-9">
                <TabsTrigger value="active" className="data-[state=active]:bg-muted">Active Unresolved</TabsTrigger>
                <TabsTrigger value="critical" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500">Critical Only</TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-muted">All History</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts or devices..."
                className="pl-9 h-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <CardContent className="p-0 flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 hover:bg-muted/10">
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Alert Message</TableHead>
                <TableHead>Target Asset</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map(alert => (
                <TableRow key={alert.id} className={`${alert.status === 'resolved' ? 'opacity-60' : ''}`}>
                  <TableCell className="pl-4 pr-1">
                    {getSeverityIcon(alert.severity)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-foreground">{alert.message}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">ID: {alert.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{alert.device}</div>
                    <div className="text-xs font-mono text-muted-foreground">{alert.ip}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs bg-muted/40 font-normal">
                      {getCategoryIcon(alert.category)}
                      {alert.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {alert.status === "active" && <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0">Active</Badge>}
                    {alert.status === "acknowledged" && <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0">Acknowledged</Badge>}
                    {alert.status === "resolved" && <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">Resolved</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {alert.timestamp}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-2">
                      {alert.status === "active" && (
                        <Button size="sm" variant="outline" onClick={() => handleAcknowledge(alert.id)}>
                          Ack
                        </Button>
                      )}
                      {alert.status !== "resolved" && (
                        <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleResolve(alert.id)}>
                          Resolve
                        </Button>
                      )}
                      {alert.status === "resolved" && (
                        <Button size="sm" variant="ghost" disabled>
                          Closed
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAlerts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No alerts found matching the criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
