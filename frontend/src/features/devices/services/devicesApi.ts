import api from "@/shared/services/api/axios"

export interface Device {
  id: string
  organization_id: string
  site_id: string
  hostname: string
  management_ip: string
  vendor: string
  model: string
  device_type: string
  os_version?: string
  serial_number?: string
  status: "online" | "offline" | "warning" | "unknown"
  health_state: "healthy" | "warning" | "critical" | "unknown"
  lifecycle_state: "provisioning" | "discovering" | "active" | "maintenance" | "decommissioning" | "decommissioned" | "error"
  last_seen_at?: string
}

export interface DeviceListResponse {
  items: Device[]
  total: number
  skip: number
  limit: number
}

export interface ProvisionDeviceRequest {
  organization_id: string
  site_id: string
  hostname: string
  management_ip: string
  vendor?: string
  model?: string
  device_type: string
  credential_profile_id?: string
  polling_profile_id?: string
  collector_id?: string
  tags?: Record<string, string>
}

export const devicesApi = {
  list: async (organizationId: string, skip = 0, limit = 50, search = ""): Promise<DeviceListResponse> => {
    const params = new URLSearchParams()
    if (skip) params.append("skip", skip.toString())
    if (limit) params.append("limit", limit.toString())
    if (search) params.append("search", search)
    if (organizationId) params.append("organization_id", organizationId) // Pass org_id to /devices endpoint
    
    // Note: In Phase 7 backend, devices is a global endpoint that accepts organization_id query parameter
    const response = await api.get(`/api/v1/devices?${params.toString()}`)
    return response.data?.data ?? response.data
  },

  get: async (deviceId: string): Promise<Device> => {
    const response = await api.get(`/api/v1/devices/${deviceId}`)
    return response.data?.data ?? response.data
  },

  provision: async (data: ProvisionDeviceRequest): Promise<Device> => {
    const response = await api.post("/api/v1/devices", data)
    return response.data?.data ?? response.data
  },

  delete: async (deviceId: string, reason: string = "Manual"): Promise<void> => {
    await api.delete(`/api/v1/devices/${deviceId}?reason=${encodeURIComponent(reason)}`)
  }
}
