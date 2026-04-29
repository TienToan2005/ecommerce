import api from './api';
import type { LoginRequest, RegisterRequest, TokenResponse, RefreshTokenResponse, UserResponse, UserRequest } from '../types/user';
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

export const refreshToken = async (data: string): Promise<RefreshTokenResponse> => {
    const res = await api.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', data);
    return res.data.data;
};

// -- USER --
export const getProfile = async (): Promise<UserResponse> => {
    const res = await api.get<ApiResponse<UserResponse>>('/users/profile');
    return res.data.data;
}