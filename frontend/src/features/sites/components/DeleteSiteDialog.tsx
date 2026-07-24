import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useDeleteSite } from "../hooks/useSites";
import type { Site } from "@/shared/types/site";

interface Props {
  site: Site | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSiteDialog({ site, open, onOpenChange }: Props) {
  const deleteMutation = useDeleteSite();

  const handleDelete = () => {
    if (!site) return;
    deleteMutation.mutate(site.id, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  if (!site) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the site
            <span className="font-semibold text-foreground"> {site.name}</span> and all associated devices and data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Site"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
