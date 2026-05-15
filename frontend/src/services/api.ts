import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '../hooks/useAuthStore';
import { refreshToken } from '../services/auth';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken; 
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      
      originalRequest._retry = true;

      try {
        const result = await refreshToken();
        
        useAuthStore.setState({ accessToken: result.accessToken });

        originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
        
        return api(originalRequest);

      } catch (refreshError) {
        console.error('Phiên đăng nhập đã hết hạn hoàn toàn, vui lòng đăng nhập lại.');
        useAuthStore.getState().logout();
        window.location.href = '/login'; 
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;