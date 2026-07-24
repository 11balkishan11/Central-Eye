import api from "@/shared/services/api/axios"

export interface Organization {
  id: string
  name: string
  slug: string
  status: "active" | "inactive" | "maintenance"
  created_at: string
}

export interface OrganizationListResponse {
  items: Organization[]
  total: number
  skip: number
  limit: number
}

export interface CreateOrganizationRequest {
  name: string
  slug: string
  status?: string
}

export interface UpdateOrganizationRequest {
  name?: string
  slug?: string
  status?: string
}

export const organizationsApi = {
  list: async (skip = 0, limit = 50, search = ""): Promise<OrganizationListResponse> => {
    const params = new URLSearchParams()
    if (skip) params.append("skip", skip.toString())
    if (limit) params.append("limit", limit.toString())
    if (search) params.append("search", search)
    
    const response = await api.get(`/api/v1/organizations?${params.toString()}`)
    return response.data?.data ?? response.data
  },

  get: async (id: string): Promise<Organization> => {
    const response = await api.get(`/api/v1/organizations/${id}`)
    return response.data?.data ?? response.data
  },

  create: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await api.post("/api/v1/organizations", data)
    return response.data?.data ?? response.data
  },

  update: async (id: string, data: UpdateOrganizationRequest): Promise<Organization> => {
    const response = await api.patch(`/api/v1/organizations/${id}`, data)
    return response.data?.data ?? response.data
  },

  delete: async (id: string, reason: string = "Manual"): Promise<void> => {
    await api.delete(`/api/v1/organizations/${id}?reason=${encodeURIComponent(reason)}`)
  }
}
