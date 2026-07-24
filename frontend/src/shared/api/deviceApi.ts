import { apiClient } from "./client";
import type { Device } from "../types/device";
import type { PaginatedResponse, PaginationParams } from "../types/pagination";

export const deviceApi = {
  getAll: (params?: PaginationParams & { search?: string; site_id?: string; organization_id?: string }) => 
    apiClient.get<PaginatedResponse<Device>>("/api/v1/devices", params),
  getById: (id: string) => apiClient.get<Device>(`/api/v1/devices/${id}`),
  create: (data: any) => apiClient.post<Device>("/api/v1/devices/provision", data),
  update: (id: string, data: any) => apiClient.put<Device>(`/api/v1/devices/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/api/v1/devices/${id}`),
};
