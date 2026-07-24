import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "@/shared/api/organizationApi";
import type { PaginationParams } from "@/shared/types/pagination";
import { toast } from "@/shared/utils/toast";

export const orgKeys = {
  all: ["organizations"] as const,
  lists: () => [...orgKeys.all, "list"] as const,
  list: (params: any) => [...orgKeys.lists(), params] as const,
  details: () => [...orgKeys.all, "detail"] as const,
  detail: (id: string) => [...orgKeys.details(), id] as const,
};

export function useOrganizations(params?: PaginationParams & { search?: string }) {
  return useQuery({
    queryKey: orgKeys.list(params),
    queryFn: () => organizationApi.getAll(params),
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: orgKeys.detail(id),
    queryFn: () => organizationApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: organizationApi.create,
    onSuccess: () => {
      toast.success("Organization created successfully");
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => organizationApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success("Organization updated successfully");
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orgKeys.detail(variables.id) });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: organizationApi.delete,
    onSuccess: () => {
      toast.success("Organization deleted successfully");
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
    },
  });
}
