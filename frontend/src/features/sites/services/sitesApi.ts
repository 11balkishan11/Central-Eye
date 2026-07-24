import api from "@/shared/services/api/axios"

export interface Site {
  id: string
  organization_id: string
  name: string
  slug: string
  description?: string
  status: "active" | "inactive" | "maintenance"
  created_at: string
}

export interface SiteListResponse {
  items: Site[]
  total: number
  skip: number
  limit: number
}

export interface CreateSiteRequest {
  name: string
  slug: string
  description?: string
  status?: string
}

export interface UpdateSiteRequest {
  name?: string
  slug?: string
  description?: string
  status?: string
}

export const sitesApi = {
  list: async (organizationId: string, skip = 0, limit = 50, search = ""): Promise<SiteListResponse> => {
    const params = new URLSearchParams()
    if (skip) params.append("skip", skip.toString())
    if (limit) params.append("limit", limit.toString())
    if (search) params.append("search", search)
    
    // According to backend architecture, site listing is under /organizations/{org_id}/sites
    const response = await api.get(`/api/v1/organizations/${organizationId}/sites?${params.toString()}`)
    return response.data?.data ?? response.data
  },

  get: async (organizationId: string, siteId: string): Promise<Site> => {
    const response = await api.get(`/api/v1/organizations/${organizationId}/sites/${siteId}`)
    return response.data?.data ?? response.data
  },

  create: async (organizationId: string, data: CreateSiteRequest): Promise<Site> => {
    const response = await api.post(`/api/v1/organizations/${organizationId}/sites`, data)
    return response.data?.data ?? response.data
  },

  update: async (organizationId: string, siteId: string, data: UpdateSiteRequest): Promise<Site> => {
    const response = await api.patch(`/api/v1/organizations/${organizationId}/sites/${siteId}`, data)
    return response.data?.data ?? response.data
  },

  delete: async (organizationId: string, siteId: string, reason: string = "Manual"): Promise<void> => {
    await api.delete(`/api/v1/organizations/${organizationId}/sites/${siteId}?reason=${encodeURIComponent(reason)}`)
  }
}
