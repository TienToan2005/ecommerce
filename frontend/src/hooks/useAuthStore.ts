import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as userApi from '../services/auth';
import type { LoginRequest, UserResponse } from '../types/user';
import { useCartStore } from './useCartStore';

interface AuthState {
  isAuthenticated: boolean;
  user: UserResponse | null;
  accessToken: string | null;
  isAuthModalOpen: boolean;
  loading: boolean;
  error: string | null;

  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginAction: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>; 
  checkAuth: () => Promise<void>;
  setGoogleAuth: (accessToken: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false, 
  user: null,
  accessToken: null,
  isAuthModalOpen: false,
  loading: false,
  error: null,

  openAuthModal: () => set({ isAuthModalOpen: true, error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, error: null }),

loginAction: async (data: LoginRequest) => {
    set({ loading: true, error: null });
    try {
      const result = await userApi.loginUser(data);
      
      set({ accessToken: result.accessToken });
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
        const backendMessage = error.response?.data?.message?.toLowerCase() || '';

        if (backendMessage.includes('user not found')) {
            toast.error('Tài khoản không tồn tại trên hệ thống!');
        } 
        else if (backendMessage.includes('password does not match') || backendMessage.includes('credentials')) {
            toast.error('Sai mật khẩu! Bạn vui lòng kiểm tra lại nhé.');
        } 
        else if (backendMessage.includes('verified') || backendMessage.includes('enabled')) {
            toast.error('Tài khoản chưa được xác thực email!');
        } 
        else {
            toast.error(error.response?.data?.message || 'Sai thông tin đăng nhập!');
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Đã xảy ra lỗi không xác định!');
      }
      
      throw error; 
    }
  },
  setGoogleAuth: async (accessToken: string) => {
    set({ loading: true, error: null });
    try {
      set({ accessToken: accessToken });
      useCartStore.getState().clearCartUI();

      const userProfile = await userApi.getProfile();
      
      set({ 
        isAuthenticated: true, 
        user: userProfile, 
        isAuthModalOpen: false, 
        loading: false 
      });

      useCartStore.getState().fetchCart();

    } catch (error) {
      set({ loading: false, isAuthenticated: false, user: null, accessToken: null });
      toast.error('Lỗi khi tải dữ liệu tài khoản Google!');
      console.error(error);
    }
  },
  logout: async () => {
    try {
      await userApi.logoutUser(); 
    } catch (error) {
      console.error("Lỗi khi xóa cookie phía server", error);
    } finally {
      set({ isAuthenticated: false, user: null, accessToken: null });
      useCartStore.getState().clearCartDB();
      toast.success('Đã đăng xuất!');
    }
  },

  checkAuth: async () => {
    try {
      const result = await userApi.refreshToken(); 
      set({ accessToken: result.accessToken });

      const userProfile = await userApi.getProfile();
      set({ isAuthenticated: true, user: userProfile });
      
      useCartStore.getState().fetchCart();

    } catch (error) {
      set({ isAuthenticated: false, user: null, accessToken: null });
    }
  }
}));