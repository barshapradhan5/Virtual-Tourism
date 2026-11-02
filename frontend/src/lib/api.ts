import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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

