import api from '../api';
import type { ProductResponse } from '../../types/product';
import type { ApiResponse, Page } from '../../types/apiresponse';
import type { ProductVariantRequest, ProductVariantResponse } from '../../types/product';

export interface ProductQueryParams {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number;
}

export const createProduct = async (formData: FormData): Promise<ProductResponse> => {
  const res = await api.post<ApiResponse<ProductResponse>>('/admin/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data;
};
export const getAllProducts = async (params?: ProductQueryParams): Promise<Page<ProductResponse>> => {
    const res = await api.get<ApiResponse<Page<ProductResponse>>>('/admin/products', { params });
    return res.data.data;
};

export const updateProductById = async (id: number, formData: FormData): Promise<ProductResponse> => {
    const res = await api.put<ApiResponse<ProductResponse>>(`/admin/products/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data.data;
}

export const deleteProduct = async (productId: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/admin/products/${productId}`);
    return res.data.data;
};

export const addVariantToProduct = async (productId: number, data: ProductVariantRequest): Promise<ProductVariantResponse> => {
    const res = await api.post<ApiResponse<ProductVariantResponse>>(`/admin/products/${productId}/variants`, data);
    return res.data.data;
};

export const updateVariant = async (variantId: number, data: ProductVariantRequest): Promise<ProductVariantResponse> => {
    const res = await api.put<ApiResponse<ProductVariantResponse>>(`/admin/products/variants/${variantId}`, data);
    return res.data.data;
};

export const deleteVariant = async (variantId: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/admin/products/variants/${variantId}`);
    return res.data.data;
};