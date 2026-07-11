import axios from "axios";
import type { ApiError } from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const apiError: ApiError = error.response?.data ?? {
      status: 500, error: "Network Error", message: error.message,
    };
    return Promise.reject(apiError);
  }
);

export default api;
