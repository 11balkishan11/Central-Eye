import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Eye, Trash2, Edit, Activity, Terminal, Router } from "lucide-react";
import { useDevices } from "../hooks/useDevices";
import { useSearch } from "@/shared/hooks/useSearch";
import { usePagination } from "@/shared/hooks/usePagination";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
// type removed
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PaginationControls } from "@/shared/components/navigation/pagination-controls";
import { Loader2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { DeviceProvisionWizard } from "../components/wizard/DeviceProvisionWizard";
import { ProvisionWizardProvider } from "../contexts/ProvisionWizardContext";

export function DevicesPage() {
  const { search, setSearch, searchParams } = useSearch();
  const { paginationParams, setPage, page, limit } = usePagination();

  const { data, isLoading, isError, error, refetch } = useDevices({
    ...searchParams,
    ...paginationParams,
  });

  const devices = data?.data || [];
  const total = data?.total || 0;

  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Device Inventory</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor network devices across all sites.</p>
        </div>
        <Button className="gap-2" onClick={() => setWizardOpen(true)}>
          <Plus size={16} />
          Provision Device
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by hostname or IP..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Add Org/Site filters here later if needed */}
        </div>
        
        <PaginationControls 
          page={page} 
          setPage={setPage} 
          total={total} 
          limit={limit} 
        />
      </div>

      <div className="border border-border rounded-md bg-card flex-1 overflow-auto">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="min-h-[400px] flex items-center justify-center">
             <ErrorState 
                title="Failed to load devices" 
                description={error?.message || "An unknown error occurred"}
                retryAction={() => refetch()}
             />
          </div>
        ) : devices.length === 0 ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <EmptyState
              icon={<Router size={24} />}
              title="No devices found"
              description={search ? "No results match your search." : "Provision your first device to start monitoring."}
              action={!search ? <Button onClick={() => setWizardOpen(true)}>Provision Device</Button> : undefined}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="whitespace-nowrap">
                <TableHead>Hostname</TableHead>
                <TableHead>Mgmt IP</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>CPU/Mem</TableHead>
                <TableHead>Temp</TableHead>
                <TableHead>Resp Time</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Last Poll</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Router className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{device.hostname}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{device.management_ip}</TableCell>
                  <TableCell>{device.vendor || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${device.oper_state === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="capitalize text-sm">{device.oper_state}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={device.health === "good" ? "default" : device.health === "warning" ? "secondary" : "destructive"} 
                           className={device.health === "good" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : device.health === "warning" ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" : ""}>
                      {device.health}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground font-mono">
                      <span>{Math.floor(Math.random() * 80 + 10)}% / {Math.floor(Math.random() * 60 + 20)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{Math.floor(Math.random() * 30 + 35)}°C</TableCell>
                  <TableCell className="text-sm font-mono">{Math.floor(Math.random() * 10 + 1)}ms</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{Math.floor(Math.random() * 300 + 1)}d</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-muted-foreground">
                      <span>SNMP (Collector-East)</span>
                      <span>2m ago</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none">
                        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link to={`/devices/${device.id}`} className="flex w-full items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit (Soon)
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Activity className="mr-2 h-4 w-4" />
                          Poll Now
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Terminal className="mr-2 h-4 w-4" />
                          SSH Connect
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ProvisionWizardProvider>
        <DeviceProvisionWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      </ProvisionWizardProvider>
    </div>
  );
}
