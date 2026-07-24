import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { OrganizationForm } from "./OrganizationForm";
import { useUpdateOrganization } from "../hooks/useOrganizations";
import { OrganizationFormData } from "../schemas/organizationSchema";
import type { Organization } from "@/shared/types/organization";

interface Props {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditOrganizationDialog({ organization, open, onOpenChange }: Props) {
  const updateMutation = useUpdateOrganization();

  const handleSubmit = (data: OrganizationFormData) => {
    if (!organization) return;
    updateMutation.mutate({ id: organization.id, data }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  if (!organization) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>
            Update details for {organization.name}.
          </DialogDescription>
        </DialogHeader>
        <OrganizationForm 
          defaultValues={{ name: organization.name, description: organization.description }}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
