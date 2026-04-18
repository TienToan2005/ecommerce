import { create } from 'zustand';
import * as userApi from '../services/user';
import type { LoginRequest, UserResponse } from '../types/user';

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
      const result = await userApi.loginUser(data); // Gọi hàm loginUser của bạn
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      
      // Sau khi lấy được token, gọi API lấy profile để lưu thông tin user
      const userProfile = await userApi.getProfileAndOderHistory();
      
      set({ isAuthenticated: true, user: userProfile, isAuthModalOpen: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác!' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ isAuthenticated: false, user: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const userProfile = await userApi.getProfileAndOderHistory(); // Lấy profile của bạn
        set({ isAuthenticated: true, user: userProfile });
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ isAuthenticated: false, user: null });
      }
    }
  }
}));