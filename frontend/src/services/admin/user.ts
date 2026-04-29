import api from '../api';
import type { UserResponse, UserRequest } from '../../types/user';
import type { ApiResponse, Page } from '../../types/apiresponse';


export const createUser = async (data: UserRequest): Promise<UserResponse> => {
    const res = await api.post<ApiResponse<UserResponse>>('/admin/users', data);
    return res.data.data;
}

export const getUserById = async (id: number): Promise<UserResponse> => {
    const res = await api.get<ApiResponse<UserResponse>>(`/admin/users/${id}`);
    return res.data.data;
}

export const getAllUsers = async (params?: {page?: number, size?: number, sort?: string}): Promise<Page<UserResponse>> => {
    const res = await api.get<ApiResponse<Page<UserResponse>>>('/admin/users', { params });
    return res.data.data;
}


export const updateUser = async (id: number, data: UserRequest): Promise<UserResponse> => {
    const res = await api.put<ApiResponse<UserResponse>>(`/admin/users/${id}`, data);
    return res.data.data;
}

export const deleteUser = async (id: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/admin/users/${id}`);
    return res.data.data;
}

export const getAllCustomers = async (page = 0, size = 10): Promise<Page<UserResponse>> => {
  const response = await api.get<ApiResponse<Page<UserResponse>>>(`/admin/users?page=${page}&size=${size}`);
  return response.data.data;
};

export const toggleUserStatusAdmin = async (userId: number): Promise<string> => {
  const response = await api.put<ApiResponse<string>>(`/admin/users/${userId}/toggle-status`);
  return response.data.data;
};