import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as userApi from '../services/user';
import type { LoginRequest, UserResponse } from '../types/user';
import { useCartStore } from './useCartStore';

interface AuthState {
  isAuthenticated: boolean;
  user: UserResponse | null;
  isAuthModalOpen: boolean;
  loading: boolean;
  error: string | null;

  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginAction: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('accessToken'),
  user: null,
  isAuthModalOpen: false,
  loading: false,
  error: null,

  openAuthModal: () => set({ isAuthModalOpen: true, error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, error: null }),

  loginAction: async (data: LoginRequest) => {
    set({ loading: true, error: null });
    try {
      const result = await userApi.loginUser(data);
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      
      useCartStore.getState().clearCartUI();

      const userProfile = await userApi.getProfile();
      
      set({ 
        isAuthenticated: true, 
        user: userProfile, 
        isAuthModalOpen: false, 
        loading: false 
      });

      useCartStore.getState().fetchCart();
      
      toast.success('Đăng nhập thành công!');

    } catch (error: unknown) {
      set({ loading: false });
      if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || 'Lỗi mạng hoặc sai tài khoản!');
      } else if (error instanceof Error) {
          toast.error(error.message);
      } else {
          toast.error('Đã xảy ra lỗi không xác định!');
      }
    }
  },

  logout: () => {
    set({ isAuthenticated: false, user: null });
    useCartStore.getState().clearCartDB();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    toast.success('Đã đăng xuất!');
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const userProfile = await userApi.getProfile();
        set({ isAuthenticated: true, user: userProfile });
        
        useCartStore.getState().fetchCart();

      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ isAuthenticated: false, user: null });
      }
    }
  }
}));