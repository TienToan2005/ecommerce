import api from './api';
import type {ReviewRequest, ReviewResponse, UpdateReview} from '../types/review';
import type {ApiResponse, Page} from '../types/apiresponse';

export const createReview = async (data: ReviewRequest, files?: File[]): Promise<ReviewResponse> => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append('images', file); 
        });
    }
    const res = await api.post<ApiResponse<ReviewResponse>>(`/reviews`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data.data;
}

export const getReviewsByProduct = async (productId: number, params?: {page?: number, size?: number, sort?: string}): Promise<Page<ReviewResponse>> => {
    const res = await api.get<ApiResponse<Page<ReviewResponse>>>(`/reviews/product/${productId}`, { params });
    return res.data.data;
}

export const getMyReviews = async (params?: {page?: number, size?: number, sort?: string}): Promise<Page<ReviewResponse>> => {
    const res = await api.get<ApiResponse<Page<ReviewResponse>>>(`/reviews/my_review`, { params });
    return res.data.data;
}

export const getReviewById = async (id: number): Promise<ReviewResponse> => {
    const res = await api.get<ApiResponse<ReviewResponse>>(`/reviews/${id}`);
    return res.data.data;
}

export const updateReview = async (id: number, data: UpdateReview): Promise<ReviewResponse> => {
    const res = await api.put<ApiResponse<ReviewResponse>>(`/reviews/${id}`, data);
    return res.data.data;
}

export const deleteReview = async (id: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/reviews/${id}`);
    return res.data.data;
}