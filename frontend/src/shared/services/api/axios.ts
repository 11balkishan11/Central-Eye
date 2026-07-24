import axios from "axios"
import { useAuthStore } from "@/shared/providers/useAuthStore"

const apiClient = axios.create({
  baseURL: "/api/v1", // Requires Vite proxy setup or absolute URL
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to attach tokens
apiClient.interceptors.request.use(
  (config) => {
    const { token, tenantId } = useAuthStore.getState()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (tenantId) {
      config.headers["X-Tenant-ID"] = tenantId
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle global errors (e.g., 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if the user is already trying to log in
      if (!error.config.url?.includes('/auth/login')) {
        // Token expired or invalid
        useAuthStore.getState().clearAuth()
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
