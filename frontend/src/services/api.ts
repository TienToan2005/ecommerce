import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if(token && config.headers){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
(error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      console.error('Phiên đăng nhập hết hạn!');
    }

    return Promise.reject(error);
  }
);
export default api;