import api from './api';
import type { LoginRequest, RegisterRequest, TokenResponse, RefreshTokenResponse, UserResponse, UserRequest } from '../types/user';
import type { ApiResponse, Page } from '../types/apiresponse';

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

// --- USER ---
export const createUser = async (data: UserRequest): Promise<UserResponse> => {
    const res = await api.post<ApiResponse<UserResponse>>('/users', data);
    return res.data.data;
}

export const getUserById = async (id: number): Promise<UserResponse> => {
    const res = await api.get<ApiResponse<UserResponse>>(`/users/${id}`);
    return res.data.data;
}

export const getAllUser = async (params?: {page?: number, size?: number, sort?: string}): Promise<Page<UserResponse>> => {
    const res = await api.get<ApiResponse<Page<UserResponse>>>('/users', { params });
    return res.data.data;
}

export const getProfile = async (): Promise<UserResponse> => {
    const res = await api.get<ApiResponse<UserResponse>>('/users/profile');
    return res.data.data;
}

export const updateUser = async (id: number, data: UserRequest): Promise<UserResponse> => {
    const res = await api.put<ApiResponse<UserResponse>>(`/users/${id}`, data);
    return res.data.data;
}

export const deleteUser = async (id: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/users/${id}`);
    return res.data.data;
}