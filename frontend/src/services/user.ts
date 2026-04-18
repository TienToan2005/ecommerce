import api from './api';
import type { LoginRequest, RegisterRequest, TokenResponse, RefreshTokenResponse, UserResponse, UserRequest } from '../types/user';
import type { ApiResponse, Page } from '../types/apiresponse';

export const loginUser = async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post<ApiResponse<TokenResponse>>('/auth/login', data);
    return response.data.data;
};

export const registerUser = async (data: RegisterRequest): Promise<UserResponse> => {
    const response = await api.post<ApiResponse<UserResponse>>('/auth/register', data);
    return response.data.data;
};

export const refreshToken = async (data: string): Promise<RefreshTokenResponse> => {
    const response = await api.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', data);
    return response.data.data;
};
export const createUser = async (data: UserRequest): Promise<UserResponse> => {
    const res = await api.post<ApiResponse<UserResponse>>(`/user`,data);
    return res.data.data;
}
export const getUserById = async (id: number): Promise<UserResponse> => {
    const res = await api.get<ApiResponse<UserResponse>>(`/user/${id}`);
    return res.data.data;
}
export const getAllUser = async (params?: {page?: number, size?: number, sort?: string}): Promise<Page<UserResponse>> => {
    const res = await api.get<ApiResponse<Page<UserResponse>>>(`/user`, {params});
    return res.data.data;
}
export const getProfileAndOderHistory = async (): Promise<UserResponse> => {
    const res = await api.get<ApiResponse<UserResponse>>('/user/profile');
    return res.data.data;
}
export const updateUser = async (id: number, data: UserRequest): Promise<UserResponse> => {
    const res = await api.put<ApiResponse<UserResponse>>(`/user/${id}`, data);
    return res.data.data;
}
export const deleteUser = async (id: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/user/${id}`);
    return res.data.data;
}

