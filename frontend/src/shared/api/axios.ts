import axios from "axios";
import { setupInterceptors } from "./interceptors";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

setupInterceptors(axiosInstance);

export default axiosInstance;
