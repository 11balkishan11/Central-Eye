import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { OrganizationForm } from "./OrganizationForm";
import { useCreateOrganization } from "../hooks/useOrganizations";
import { OrganizationFormData } from "../schemas/organizationSchema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrganizationDialog({ open, onOpenChange }: Props) {
  const createMutation = useCreateOrganization();

  const handleSubmit = (data: OrganizationFormData) => {
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
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Add a new organization to the platform.
          </DialogDescription>
        </DialogHeader>
        <OrganizationForm 
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
