import api from '../api';
import type { ProductResponse } from '../../types/product';
import type { ApiResponse, Page } from '../../types/apiresponse';

export const getAllProducts = async (params?: { page?: number, size?: number }): Promise<Page<ProductResponse>> => {
    const res = await api.get<ApiResponse<Page<ProductResponse>>>('/admin/products', { params });
    return res.data.data;
};

export const deleteProduct = async (productId: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/admin/products/${productId}`);
    return res.data.data;
};