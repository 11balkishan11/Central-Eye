import { apiClient } from "./client";
import type { Organization } from "../types/organization";
import type { PaginatedResponse, PaginationParams } from "../types/pagination";

export const organizationApi = {
  getAll: (params?: PaginationParams & { search?: string }) => 
    apiClient.get<PaginatedResponse<Organization>>("/api/v1/organizations", params),
  getById: (id: string) => apiClient.get<Organization>(`/api/v1/organizations/${id}`),
  create: (data: any) => apiClient.post<Organization>("/api/v1/organizations", data),
  update: (id: string, data: any) => apiClient.put<Organization>(`/api/v1/organizations/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/api/v1/organizations/${id}`),
};
