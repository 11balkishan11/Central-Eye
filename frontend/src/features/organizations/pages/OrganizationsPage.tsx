import { useState } from "react";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Building2 } from "lucide-react";
import { useOrganizations } from "../hooks/useOrganizations";
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
import { CreateOrganizationDialog } from "../components/CreateOrganizationDialog";
import { EditOrganizationDialog } from "../components/EditOrganizationDialog";
import { DeleteOrganizationDialog } from "../components/DeleteOrganizationDialog";
import type { Organization } from "@/shared/types/organization";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PaginationControls } from "@/shared/components/navigation/pagination-controls";
import { Loader2 } from "lucide-react";

export function OrganizationsPage() {
  const { search, setSearch, searchParams } = useSearch();
  const { paginationParams, setPage, page, limit } = usePagination();

  const { data, isLoading, isError, error, refetch } = useOrganizations({
    ...searchParams,
    ...paginationParams,
  });

  const [createOpen, setCreateOpen] = useState(false);
  
  const [editOrg, setEditOrg] = useState<Organization | null>(null);
  const [deleteOrg, setDeleteOrg] = useState<Organization | null>(null);

  const orgs = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
          <p className="text-sm text-muted-foreground">Manage your customer organizations and their details.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus size={16} />
          Add Organization
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                title="Failed to load organizations" 
                description={error?.message || "An unknown error occurred"}
                retryAction={() => refetch()}
             />
          </div>
        ) : orgs.length === 0 ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <EmptyState
              icon={<Building2 size={24} />}
              title="No organizations found"
              description={search ? "No results match your search." : "Get started by creating your first organization."}
              action={!search ? <Button onClick={() => setCreateOpen(true)}>Add Organization</Button> : undefined}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[300px] truncate">
                    {org.description || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(org.created_at).toLocaleDateString()}
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
                        <DropdownMenuItem onClick={() => setEditOrg(org)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950"
                          onClick={() => setDeleteOrg(org)}
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

      <CreateOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditOrganizationDialog organization={editOrg} open={!!editOrg} onOpenChange={(open) => !open && setEditOrg(null)} />
      <DeleteOrganizationDialog organization={deleteOrg} open={!!deleteOrg} onOpenChange={(open) => !open && setDeleteOrg(null)} />
    </div>
  );
}
