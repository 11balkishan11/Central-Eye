import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { useAuthStore } from "../providers/useAuthStore";
import { ApiError } from "./errors";
import { toast } from "../utils/toast";
import { authApi } from "./authApi";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

export const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = useAuthStore.getState().token;
      const tenantId = useAuthStore.getState().tenantId;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (tenantId) {
        config.headers["X-Tenant-ID"] = tenantId;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      if (error.response) {
        const { status, data } = error.response as { status: number, data: any };
        
        let errorMessage = "An unexpected error occurred";
        if (data?.error?.message) {
          errorMessage = data.error.message;
        } else if (Array.isArray(data?.detail)) {
          errorMessage = data.detail.map((err: any) => err.msg).join(", ");
        } else if (data?.detail) {
          errorMessage = data.detail;
        } else if (data?.message) {
          errorMessage = data.message;
        }

        // Convert to our standard ApiError
        const apiError = new ApiError(
          status,
          errorMessage,
          data?.error?.code || data?.code,
          data?.error?.details || data?.details
        );

        // Avoid infinite loop on /auth/refresh and /auth/login
        const isAuthRoute = originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh");

        if (status === 401 && !originalRequest._retry && !isAuthRoute) {
          originalRequest._retry = true;

          if (!isRefreshing) {
            isRefreshing = true;

            try {
              const res = await authApi.refresh();
              const newToken = res.access_token;
              
              // Update store (tenant/user should remain unchanged or refetched)
              const state = useAuthStore.getState();
              state.setAuth(newToken, state.tenantId, state.user!);
              
              onRefreshed(newToken);
              return instance(originalRequest);
            } catch (refreshError) {
              useAuthStore.getState().clearAuth();
              toast.error("Session Expired", "Please log in again.");
              window.location.href = "/login";
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          } else {
            return new Promise((resolve) => {
              subscribeTokenRefresh((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(instance(originalRequest));
              });
            });
          }
        } else if (status === 401 && isAuthRoute && originalRequest.url?.includes("/auth/refresh")) {
           // Refresh failed, clean up
           useAuthStore.getState().clearAuth();
        } else if (status === 403) {
          toast.error("Access Denied", "You do not have permission for this action.");
        } else if (status >= 500) {
          toast.error("Server Error", "Please try again later.");
        }
        return Promise.reject(apiError);
      } else if (error.request) {
        toast.error("Network Error", "Please check your connection.");
        return Promise.reject(new ApiError(0, "Network Error - No response received"));
      }

      return Promise.reject(error);
    }
  );
};
