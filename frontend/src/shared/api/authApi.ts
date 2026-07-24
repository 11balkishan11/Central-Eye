import { apiClient } from "./client";
import type { AuthSession } from "../types/auth";

export const authApi = {
  login: (data: any) => apiClient.post<AuthSession>("/api/v1/auth/login", data),
  logout: () => apiClient.post<void>("/api/v1/auth/logout"),
  me: () => apiClient.get<any>("/api/v1/auth/me"),
  getMe: () => apiClient.get<any>("/api/v1/auth/me"),
  refresh: () => apiClient.post<{ access_token: string }>("/api/v1/auth/refresh"),
};
