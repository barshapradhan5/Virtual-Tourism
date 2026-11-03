import axios from 'axios';

/**
 * Determine the backend API URL dynamically:
 * 1. If VITE_API_BASE_URL is explicitly configured, use it.
 * 2. If running on local machine (localhost / 127.0.0.1), use local Django development server.
 * 3. In cloud production (Vercel), default seamlessly to the deployed Render backend.
 */
export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000/api/v1';
    }
  }
  return 'https://virtual-tourism.onrender.com/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bharat_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('bharat_refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
          const newAccess = res.data.access;
          localStorage.setItem('bharat_access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('bharat_access_token');
          localStorage.removeItem('bharat_refresh_token');
          localStorage.removeItem('bharat_user');
          window.dispatchEvent(new Event('auth:logout'));
        }
      }
    }
    return Promise.reject(error);
  }
);
