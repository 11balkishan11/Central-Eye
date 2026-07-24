import { apiClient } from "./client";
import type { Site } from "../types/site";
import type { PaginatedResponse, PaginationParams } from "../types/pagination";

export const siteApi = {
  getAll: (params?: PaginationParams & { search?: string; organization_id?: string }) => 
    apiClient.get<PaginatedResponse<Site>>("/api/v1/sites", params),
  getById: (id: string) => apiClient.get<Site>(`/api/v1/sites/${id}`),
  create: (data: any) => apiClient.post<Site>("/api/v1/sites", data),
  update: (id: string, data: any) => apiClient.put<Site>(`/api/v1/sites/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/api/v1/sites/${id}`),
};
