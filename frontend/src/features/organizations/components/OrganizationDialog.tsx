import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { organizationsApi } from "../services/organizationsApi"
import type { Organization, CreateOrganizationRequest, UpdateOrganizationRequest } from "../services/organizationsApi"
import { Loader2 } from "lucide-react"

interface OrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization?: Organization | null // If provided, we are editing
}

export function OrganizationDialog({ open, onOpenChange, organization }: OrganizationDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = !!organization

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [status, setStatus] = useState<string>("active")

  useEffect(() => {
    if (open) {
      if (organization) {
        setName(organization.name)
        setSlug(organization.slug)
        setStatus(organization.status)
      } else {
        setName("")
        setSlug("")
        setStatus("active")
      }
    }
  }, [open, organization])

  // Auto-generate slug from name if not editing and slug is untouched or matches previous name
  const handleNameChange = (val: string) => {
    setName(val)
    if (!isEditing) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateOrganizationRequest) => organizationsApi.create(data),
    onSuccess: () => {
      toast.success("Organization created successfully")
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to create organization")
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateOrganizationRequest) => organizationsApi.update(organization!.id, data),
    onSuccess: () => {
      toast.success("Organization updated successfully")
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to update organization")
    }
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !slug) return

    if (isEditing) {
      updateMutation.mutate({ name, slug, status })
    } else {
      createMutation.mutate({ name, slug, status })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Organization" : "Create Organization"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Make changes to the organization here. Click save when you're done." 
                : "Add a new organization to the platform."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
            <Button type="submit" disabled={isPending || !name || !slug}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
