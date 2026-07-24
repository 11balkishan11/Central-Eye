import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { SiteForm } from "./SiteForm";
import { useUpdateSite } from "../hooks/useSites";
import { SiteFormData } from "../schemas/siteSchema";
import type { Site } from "@/shared/types/site";

interface Props {
  site: Site | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSiteDialog({ site, open, onOpenChange }: Props) {
  const updateMutation = useUpdateSite();

  const handleSubmit = (data: SiteFormData) => {
    if (!site) return;
    updateMutation.mutate({ id: site.id, data }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  if (!site) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Site</DialogTitle>
          <DialogDescription>
            Update details for {site.name}.
          </DialogDescription>
        </DialogHeader>
        <SiteForm 
          defaultValues={{ 
            name: site.name, 
            description: site.description,
            organization_id: site.organization_id 
          }}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
