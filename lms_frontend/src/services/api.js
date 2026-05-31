/**
 * Axios instance with JWT auth + automatic token refresh.
 * All service files should import `api` from here instead of using raw axios.
 */
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, try to refresh the access token once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/token/refresh/")
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/token/refresh/`, { refresh });
          const newAccess = res.data.access;
          localStorage.setItem("token", newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh");
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Unwrap paginated DRF responses.
 * Returns the results array whether the response is paginated { count, results: [] }
 * or a plain array (for endpoints without pagination).
 */
export function unwrap(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return data;
}

export default api;
export { API_URL };
