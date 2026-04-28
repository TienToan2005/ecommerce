import api from './api';
import type { OrderResponse, UpdateOrderStatus } from '../types/order';
import type { ProductResponse } from '../types/product';
import type { UserResponse } from '../types/user';
import type { ApiResponse, Page } from '../types/apiresponse';

// --- ORDERS ---
export const getAdminOrders = async (params?: { page?: number, size?: number }): Promise<Page<OrderResponse>> => {
    const res = await api.get<ApiResponse<Page<OrderResponse>>>('/admin/orders', { params });
    return res.data.data;
};

export const updateAdminOrderStatus = async (orderId: number, data: UpdateOrderStatus): Promise<OrderResponse> => {
    const res = await api.put<ApiResponse<OrderResponse>>(`/admin/orders/${orderId}`, data);
    return res.data.data;
};

// --- PRODUCTS ---
export const getAdminProducts = async (params?: { page?: number, size?: number }): Promise<Page<ProductResponse>> => {
    const res = await api.get<ApiResponse<Page<ProductResponse>>>('/admin/products', { params });
    return res.data.data;
};

export const deleteAdminProduct = async (productId: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/admin/products/${productId}`);
    return res.data.data;
};

// --- USERS/CUSTOMERS ---
export const getAdminCustomers = async (params?: { page?: number, size?: number }): Promise<Page<UserResponse>> => {
    const res = await api.get<ApiResponse<Page<UserResponse>>>('/admin/users/customers', { params });
    return res.data.data;
};

export const toggleUserStatus = async (userId: number): Promise<string> => {
    const res = await api.put<ApiResponse<string>>(`/admin/users/${userId}/toggle-status`);
    return res.data.data;
};