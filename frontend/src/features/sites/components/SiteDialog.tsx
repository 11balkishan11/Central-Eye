import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { toast } from "sonner"
import { sitesApi } from "../services/sitesApi"
import type { Site, CreateSiteRequest, UpdateSiteRequest } from "../services/sitesApi"
import { organizationsApi } from "@/features/organizations/services/organizationsApi"
import { Loader2 } from "lucide-react"

interface SiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  site?: Site | null // If provided, we are editing
  preselectedOrgId?: string // If provided, locks the organization dropdown
}

export function SiteDialog({ open, onOpenChange, site, preselectedOrgId }: SiteDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = !!site

  const [orgId, setOrgId] = useState<string>(preselectedOrgId || "")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [status, setStatus] = useState<string>("active")
  const [description, setDescription] = useState("")

  // Fetch organizations for the dropdown
  const { data: orgsData, isLoading: isLoadingOrgs } = useQuery({
    queryKey: ["organizations", "all"],
    queryFn: () => organizationsApi.list(0, 1000, ""),
    enabled: open
  })

  useEffect(() => {
    if (open) {
      if (site) {
        setOrgId(site.organization_id)
        setName(site.name)
        setSlug(site.slug)
        setStatus(site.status)
        setDescription(site.description || "")
      } else {
        setOrgId(preselectedOrgId || "")
        setName("")
        setSlug("")
        setStatus("active")
        setDescription("")
      }
    }
  }, [open, site, preselectedOrgId])

  const handleNameChange = (val: string) => {
    setName(val)
    if (!isEditing) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateSiteRequest) => sitesApi.create(orgId, data),
    onSuccess: () => {
      toast.success("Site created successfully")
      queryClient.invalidateQueries({ queryKey: ["sites"] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to create site")
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSiteRequest) => sitesApi.update(orgId, site!.id, data),
    onSuccess: () => {
      toast.success("Site updated successfully")
      queryClient.invalidateQueries({ queryKey: ["sites"] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to update site")
    }
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !slug || !orgId) return

    if (isEditing) {
      updateMutation.mutate({ name, slug, status, description })
    } else {
      createMutation.mutate({ name, slug, status, description })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Site" : "Create Site"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Make changes to the site here. Click save when you're done." 
                : "Add a new physical or logical site for an organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="orgId" className="text-right">Organization</Label>
              <div className="col-span-3">
                <Select 
                  value={orgId} 
                  onValueChange={(val) => setOrgId(val || "")} 
                  disabled={isPending || isEditing || !!preselectedOrgId || isLoadingOrgs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingOrgs ? "Loading..." : "Select Organization"} />
                  </SelectTrigger>
                  <SelectContent>
                    {orgsData?.items.map(org => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => handleNameChange(e.target.value)} 
                className="col-span-3" 
                disabled={isPending}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">Slug</Label>
              <Input 
                id="slug" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)} 
                className="col-span-3" 
                disabled={isPending}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <div className="col-span-3">
                <Select value={status} onValueChange={(val) => setStatus(val || "")} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name || !slug || !orgId}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
