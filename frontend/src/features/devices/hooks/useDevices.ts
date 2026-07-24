import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deviceApi } from "@/shared/api/deviceApi";
import type { PaginationParams } from "@/shared/types/pagination";
import { toast } from "@/shared/utils/toast";

export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
  list: (params: any) => [...deviceKeys.lists(), params] as const,
  details: () => [...deviceKeys.all, "detail"] as const,
  detail: (id: string) => [...deviceKeys.details(), id] as const,
};

export function useDevices(params?: PaginationParams & { search?: string; site_id?: string; organization_id?: string }) {
  return useQuery({
    queryKey: deviceKeys.list(params),
    queryFn: () => deviceApi.getAll(params),
  });
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: deviceKeys.detail(id),
    queryFn: () => deviceApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deviceApi.create,
    onSuccess: () => {
      toast.success("Device provisioned successfully");
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deviceApi.delete,
    onSuccess: () => {
      toast.success("Device deleted successfully");
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
    },
  });
}
