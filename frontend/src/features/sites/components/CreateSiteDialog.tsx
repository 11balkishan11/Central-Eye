import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { SiteForm } from "./SiteForm";
import { useCreateSite } from "../hooks/useSites";
import { SiteFormData } from "../schemas/siteSchema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultOrganizationId?: string;
}

export function CreateSiteDialog({ open, onOpenChange, defaultOrganizationId }: Props) {
  const createMutation = useCreateSite();

  const handleSubmit = (data: SiteFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Site</DialogTitle>
          <DialogDescription>
            Add a new site to an organization.
          </DialogDescription>
        </DialogHeader>
        <SiteForm 
          defaultValues={{ organization_id: defaultOrganizationId }}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
