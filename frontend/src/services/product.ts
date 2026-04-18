import api from './api'
import type {ProductResponse, ProductRequest} from '../types/product';
import type {ApiResponse,Page} from '../types/apiresponse';

export interface ProductQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}
export const createProduct = async (data: ProductRequest): Promise<ProductResponse> => {
    const res = await api.post<ApiResponse<ProductResponse>>(`/products`,data);
    return res.data.data;
}
export const getAllProducts = async (params?: ProductQueryParams): Promise<Page<ProductResponse>> => {
    const res = await api.get<ApiResponse<Page<ProductResponse>>>(`/products`, {params});
    return res.data.data;
}
export const getAllProductsByCategory = async (
    categoryId: number | string, 
    params?: ProductQueryParams
): Promise<Page<ProductResponse>> => {
    
    const response = await api.get<ApiResponse<Page<ProductResponse>>>(
        `/products/category/${categoryId}`, 
        { params }
    );

    return response.data.data;
};
export const getProductById = async (id: number): Promise<ProductResponse> => {
    const res = await api.get<ApiResponse<ProductResponse>>(`/products/${id}`) ;
    return res.data.data
}
export const updateProductById = async(id: number, data: ProductRequest): Promise<ProductResponse> => {
    const res = await api.put<ApiResponse<ProductResponse>>(`/products/${id}`, data);
    return res.data.data;
}
export const deleteProductById = async(id: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/products/${id}`);
    return res.data.data;
}   