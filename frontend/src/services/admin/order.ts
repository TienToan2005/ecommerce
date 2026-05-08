import api from '../api';
import type { OrderResponse, UpdateOrderStatus } from '../../types/order';
import type { ApiResponse, Page } from '../../types/apiresponse';

export interface OrderQueryParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

export const getAllOrdersAdmin = async (params?: OrderQueryParams): Promise<Page<OrderResponse>> => {
    const res = await api.get<ApiResponse<Page<OrderResponse>>>('/admin/orders', { params });
    return res.data.data;
};

export const updateOrderStatusAdmin = async (orderId: number, data: UpdateOrderStatus): Promise<OrderResponse> => {
    const res = await api.put<ApiResponse<OrderResponse>>(`/admin/orders/${orderId}`, data);
    return res.data.data;
};