import api from './api';
import type { ProductResponse } from '../types/product';
import type { ApiResponse, Page } from '../types/apiresponse';

export interface ProductQueryParams {
    page?: number;
    size?: number;
    sort?: string;
    name?: string;      
    categoryId?: number | string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string
}

export const getAllProducts = async (params?: ProductQueryParams): Promise<Page<ProductResponse>> => {
    const res = await api.get<ApiResponse<Page<ProductResponse>>>('/products', { params });
    return res.data.data;
}

export const getProductById = async (id: number): Promise<ProductResponse> => {
    const res = await api.get<ApiResponse<ProductResponse>>(`/products/${id}`);
    return res.data.data;
}
