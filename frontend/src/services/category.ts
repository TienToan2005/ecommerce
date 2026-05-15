import api from './api';
import type { ApiResponse } from '../types/apiresponse';
import type {CategoryRequest, CategoryResponse} from '../types/category';

const BASE_URL = '/categories';

export const createCategory = async (formData: FormData): Promise<CategoryResponse> => {
  const res = await api.post<ApiResponse<CategoryResponse>>(BASE_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data;
};

export const getAllCategories = async (): Promise<CategoryResponse[]> => {
  const res = await api.get<ApiResponse<CategoryResponse[]>>(BASE_URL);
  return res.data.data;
};

export const getCategoryById = async (id: number): Promise<CategoryResponse> => {
  const res = await api.get<ApiResponse<CategoryResponse>>(`${BASE_URL}/${id}`);
  return res.data.data;
};

export const getCategoryFilters = async (id: number) => {
  const response = await api.get(`/categories/${id}/filters`);
  return response.data.data;
};

export const updateCategory = async (id: number, data: CategoryRequest): Promise<CategoryResponse> => {
  const res = await api.put<ApiResponse<CategoryResponse>>(`${BASE_URL}/${id}`, data);
  return res.data.data;
};

export const deleteCategory = async (id: number): Promise<string> => {
  const res = await api.delete<ApiResponse<string>>(`${BASE_URL}/${id}`);
  return res.data.data; // Backend trả về chữ "Xóa danh mục thành công."
};