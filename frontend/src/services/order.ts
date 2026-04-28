import api from './api';
import type { OrderRequest, OrderResponse, UpdateOrderStatus } from '../types/order';
import type { ApiResponse, Page } from '../types/apiresponse';

export const placeOrder = async (data: OrderRequest): Promise<OrderResponse> => {
    const res = await api.post<ApiResponse<OrderResponse>>('/orders', data);
    return res.data.data;
};

export const getAllOrders = async (params?: { page?: number, size?: number, sort?: string }): Promise<Page<OrderResponse>> => {
    const res = await api.get<ApiResponse<Page<OrderResponse>>>('/orders', { params });
    return res.data.data;
};

export const getUserOrders = async (params?: { page?: number, size?: number, sort?: string }): Promise<Page<OrderResponse>> => {
    const res = await api.get<ApiResponse<Page<OrderResponse>>>('/orders/my_order', { params });
    return res.data.data;
};

export const getOrderById = async (id: number): Promise<OrderResponse> => {
    const res = await api.get<ApiResponse<OrderResponse>>(`/orders/${id}`);
    return res.data.data;
};

export const updateOrderStatus = async (id: number, data: UpdateOrderStatus): Promise<OrderResponse> => {
    const res = await api.put<ApiResponse<OrderResponse>>(`/orders/${id}`, data);
    return res.data.data;
};

export const cancelOrder = async (id: number): Promise<OrderResponse> => {
    const res = await api.delete<ApiResponse<OrderResponse>>(`/orders/${id}`);
    return res.data.data;
};

export const verifyVnPayPayment = async (queryString: string): Promise<OrderResponse> => {
    const res = await api.get<ApiResponse<OrderResponse>>(`/orders/vnpay/return?query=${encodeURIComponent(queryString)}`);
    return res.data.data; 
};