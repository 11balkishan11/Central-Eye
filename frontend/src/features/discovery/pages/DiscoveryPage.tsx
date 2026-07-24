import { useState, useEffect } from "react";
import { Plus, Play, RefreshCw, Settings, CheckCircle2, Clock, Server } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";

// Simulated Discovery Scan Component
function ActiveDiscoveryScan({ profile, onComplete }: { profile: any, onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [currentIp, setCurrentIp] = useState("10.0.0.1");
  const [foundDevices, setFoundDevices] = useState<{ ip: string, type: string, status: string }[]>([]);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      setProgress(current);
      
      // Update IP address being scanned
      const lastOctet = Math.floor((current / 100) * 254) + 1;
      setCurrentIp(`10.0.${profile.subnet === '10.0.1.0/24' ? '1' : '5'}.${lastOctet}`);

      // Randomly "find" a device
      if (current % 15 === 0 && current < 100) {
        const types = ["Router", "Switch", "Server", "Firewall"];
        const statuses = ["SNMP Auth Success", "SSH Ready", "ICMP Only"];
        setFoundDevices(prev => [{
          ip: `10.0.${profile.subnet === '10.0.1.0/24' ? '1' : '5'}.${lastOctet}`,
          type: types[Math.floor(Math.random() * types.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)]
        }, ...prev]);
      }

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 2000);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [profile, onComplete]);

  return (
    <Card className="border-primary/50 shadow-lg shadow-primary/10 overflow-hidden">
      <div className="bg-primary/5 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-primary flex items-center">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Active Discovery Scan: {profile.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Scanning {profile.subnet}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-primary">{progress}%</div>
          <div className="text-xs text-muted-foreground">Elapsed: 00:12</div>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2 font-mono">
              <span className="text-muted-foreground">Scanning IP:</span>
              <span className="font-semibold">{currentIp}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="rounded-md border border-border/50 bg-muted/20 min-h-[200px]">
            <div className="px-4 py-2 border-b border-border/50 bg-muted/40 font-semibold text-sm">
              Discovered Devices ({foundDevices.length})
            </div>
            <div className="p-0 max-h-[200px] overflow-y-auto">
              <Table>
                <TableBody>
                  {foundDevices.map((dev, i) => (
                    <TableRow key={i} className="animate-in fade-in slide-in-from-top-2">
                      <TableCell className="py-2 pl-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="font-mono text-sm font-medium">{dev.ip}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground">{dev.type}</TableCell>
                      <TableCell className="py-2 text-sm">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">{dev.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {foundDevices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground text-sm">
                        Probing network... No devices found yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DiscoveryPage() {
  const [activeProfile, setActiveProfile] = useState<any>(null);

  const profiles = [
    { id: 1, name: "Core DC Subnet", subnet: "10.0.1.0/24", schedule: "Daily at 02:00", lastRun: "2 hours ago", status: "idle", found: 42 },
    { id: 2, name: "Branch Office Network", subnet: "192.168.10.0/23", schedule: "Weekly on Sun", lastRun: "3 days ago", status: "idle", found: 18 },
    { id: 3, name: "DMZ Zone", subnet: "10.0.5.0/24", schedule: "Every 4 hours", lastRun: "1 hour ago", status: "idle", found: 5 },
    { id: 4, name: "Legacy VLAN", subnet: "172.16.0.0/16", schedule: "Manual", lastRun: "Never", status: "idle", found: 0 },
  ];

  const handleRun = (profile: any) => {
    setActiveProfile(profile);
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Network Discovery</h1>
          <p className="text-sm text-muted-foreground">Automatically discover and classify devices on your network.</p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          New Profile
        </Button>
      </div>

      {activeProfile && (
        <ActiveDiscoveryScan 
          profile={activeProfile} 
          onComplete={() => setActiveProfile(null)} 
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Discovery Profiles</CardTitle>
          <CardDescription>Manage IP ranges and credentials for automated scanning.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Profile Name</TableHead>
                <TableHead>Target Range</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Devices Found</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map(profile => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium pl-6">{profile.name}</TableCell>
                  <TableCell className="font-mono text-sm">{profile.subnet}</TableCell>
                  <TableCell className="text-muted-foreground text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {profile.schedule}
                  </TableCell>
                  <TableCell className="text-sm">{profile.lastRun}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{profile.found}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      <span className="capitalize text-muted-foreground">{profile.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleRun(profile)}>
                        <Play className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground mt-1">SNMP Authentication success</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> Average Scan Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14m 32s</div>
            <p className="text-xs text-muted-foreground mt-1">Per /24 subnet</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-500" /> Discovered this week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground mt-1">New devices found automatically</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
