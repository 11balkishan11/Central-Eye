import { apiClient } from "./client";

export const lookupApi = {
  getCredentialProfiles: () => apiClient.get<any[]>("/api/v1/lookups/credential-profiles"),
  getPollingProfiles: () => apiClient.get<any[]>("/api/v1/lookups/polling-profiles"),
  getCollectors: () => apiClient.get<any[]>("/api/v1/collectors"),
  getDeviceGroups: () => apiClient.get<any[]>("/api/v1/lookups/device-groups"),
  getVendors: () => apiClient.get<any[]>("/api/v1/lookups/vendors"),
  getSites: (organization_id: string) => apiClient.get<any[]>(`/api/v1/lookups/sites?organization_id=${organization_id}`),
};
