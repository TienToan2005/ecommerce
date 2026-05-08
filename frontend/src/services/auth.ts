import api from './api';
import type { LoginRequest, RegisterRequest, TokenResponse, RefreshTokenResponse, UserResponse, VerifyAccountRequest, ResetPasswordRequest} from '../types/user';
import type { ApiResponse } from '../types/apiresponse';


// --- AUTH ---
export const loginUser = async (data: LoginRequest): Promise<TokenResponse> => {
  const res = await api.post<ApiResponse<TokenResponse>>('/auth/login', data);
  return res.data.data;
};

export const registerUser = async (data: RegisterRequest): Promise<UserResponse> => {
  const res = await api.post<ApiResponse<UserResponse>>('/auth/register', data);
  return res.data.data;
};

export const verifyOtp = async (data: VerifyAccountRequest): Promise<string> => {
  const res = await api.post<ApiResponse<string>>('/auth/verify', data);
  return res.data.data;
};

export const resendOtp = async (email: string): Promise<string> => {
  const res = await api.post<ApiResponse<string>>('/auth/resend-otp', null, {
    params: { email }
  });
  return res.data.data;
};

export const forgotPassword = async (email: string): Promise<string> => {
  const res = await api.post<ApiResponse<string>>('/auth/forgot-password', null, {
    params: { email }
  });
  return res.data.data;
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<string> => {
  const res = await api.post<ApiResponse<string>>('/auth/reset-password', data);
  return res.data.data;
};

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const res = await api.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh',);
  return res.data.data;
};

export const logoutUser = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

// --- USER ---
export const getProfile = async (): Promise<UserResponse> => {
  const res = await api.get<ApiResponse<UserResponse>>('/users/profile');
  return res.data.data;
}