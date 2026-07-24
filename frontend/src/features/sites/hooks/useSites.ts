import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteApi } from "@/shared/api/siteApi";
import type { PaginationParams } from "@/shared/types/pagination";
import { toast } from "@/shared/utils/toast";

export const siteKeys = {
  all: ["sites"] as const,
  lists: () => [...siteKeys.all, "list"] as const,
  list: (params: any) => [...siteKeys.lists(), params] as const,
  details: () => [...siteKeys.all, "detail"] as const,
  detail: (id: string) => [...siteKeys.details(), id] as const,
};

export function useSites(params?: PaginationParams & { search?: string; organization_id?: string }) {
  return useQuery({
    queryKey: siteKeys.list(params),
    queryFn: () => siteApi.getAll(params),
  });
}

export function useSite(id: string) {
  return useQuery({
    queryKey: siteKeys.detail(id),
    queryFn: () => siteApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: siteApi.create,
    onSuccess: () => {
      toast.success("Site created successfully");
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => siteApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success("Site updated successfully");
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: siteKeys.detail(variables.id) });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: siteApi.delete,
    onSuccess: () => {
      toast.success("Site deleted successfully");
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
    },
  });
}
