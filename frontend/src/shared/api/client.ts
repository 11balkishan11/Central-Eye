import axiosInstance from "./axios";

export const apiClient = {
  get: async <T>(url: string, params?: any): Promise<T> => {
    const response = await axiosInstance.get<any>(url, { params });
    return response.data?.data ?? response.data;
  },
  post: async <T>(url: string, data?: any): Promise<T> => {
    const response = await axiosInstance.post<any>(url, data);
    return response.data?.data ?? response.data;
  },
  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await axiosInstance.put<any>(url, data);
    return response.data?.data ?? response.data;
  },
  delete: async <T>(url: string): Promise<T> => {
    const response = await axiosInstance.delete<any>(url);
    return response.data?.data ?? response.data;
  },
};
