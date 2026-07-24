import { useState } from "react";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, MapPin } from "lucide-react";
import { useSites } from "../hooks/useSites";
import { useSearch } from "@/shared/hooks/useSearch";
import { usePagination } from "@/shared/hooks/usePagination";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
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
import { CreateSiteDialog } from "../components/CreateSiteDialog";
import { EditSiteDialog } from "../components/EditSiteDialog";
import { DeleteSiteDialog } from "../components/DeleteSiteDialog";
import type { Site } from "@/shared/types/site";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PaginationControls } from "@/shared/components/navigation/pagination-controls";
import { Loader2 } from "lucide-react";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";

export function SitesPage() {
  const { search, setSearch, searchParams } = useSearch();
  const { paginationParams, setPage, page, limit } = usePagination();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("all");

  const { data: orgData, isLoading: isLoadingOrgs } = useOrganizations({ limit: 1000, page: 1 });
  const orgs = orgData?.data || [];

  const { data, isLoading, isError, error, refetch } = useSites({
    ...searchParams,
    ...paginationParams,
    ...(selectedOrgId !== "all" ? { organization_id: selectedOrgId } : {}),
  });

  const [createOpen, setCreateOpen] = useState(false);
  
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [deleteSite, setDeleteSite] = useState<Site | null>(null);

  const sites = data?.data || [];
  const total = data?.total || 0;

  // Helper to display org name
  const getOrgName = (orgId: string) => {
    return orgs.find(o => o.id === orgId)?.name || orgId;
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sites</h1>
          <p className="text-sm text-muted-foreground">Manage physical or logical locations for your organizations.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus size={16} />
          Add Site
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sites..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-64">
            <Select value={selectedOrgId} onValueChange={(val) => setSelectedOrgId(val || "")}>
              <SelectTrigger disabled={isLoadingOrgs}>
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {orgs.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                title="Failed to load sites" 
                description={error?.message || "An unknown error occurred"}
                retryAction={() => refetch()}
             />
          </div>
        ) : sites.length === 0 ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <EmptyState
              icon={<MapPin size={24} />}
              title="No sites found"
              description={search || selectedOrgId !== "all" ? "No results match your filters." : "Get started by creating your first site."}
              action={!search && selectedOrgId === "all" ? <Button onClick={() => setCreateOpen(true)}>Add Site</Button> : undefined}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.name}</TableCell>
                  <TableCell>{getOrgName(site.organization_id)}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {site.location || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(site.created_at).toLocaleDateString()}
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
                        <DropdownMenuItem onClick={() => setEditSite(site)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950"
                          onClick={() => setDeleteSite(site)}
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

      <CreateSiteDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        defaultOrganizationId={selectedOrgId !== "all" ? selectedOrgId : undefined} 
      />
      <EditSiteDialog site={editSite} open={!!editSite} onOpenChange={(open) => !open && setEditSite(null)} />
      <DeleteSiteDialog site={deleteSite} open={!!deleteSite} onOpenChange={(open) => !open && setDeleteSite(null)} />
    </div>
  );
}
