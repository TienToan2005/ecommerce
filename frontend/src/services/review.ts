import api from './api';
import type {ReviewRequest, ReviewResponse, UpdateReview} from '../types/review';
import type {ApiResponse, Page} from '../types/apiresponse';

export const createReview = async (data: ReviewRequest): Promise<ReviewResponse> => {
    const res = await api.post<ApiResponse<ReviewResponse>>(`/review`, data);
    return res.data.data;
}
export const getReviewsByProduct = async (productId: number, params: {page?: number, size?: number, sort?: string}): Promise<Page<ReviewResponse>> => {
    const res = await api.post<ApiResponse<Page<ReviewResponse>>>(`/review/product/${productId}`, {params});
    return res.data.data;
}
export const getMyReviews = async (params: {page?: number, size?: number, sort?: string}): Promise<Page<ReviewResponse>> => {
    const res = await api.post<ApiResponse<Page<ReviewResponse>>>(`/review/my_review`, {params});
    return res.data.data;
}
export const getReviewById = async (id: number): Promise<ReviewResponse> => {
    const res = await api.post<ApiResponse<ReviewResponse>>(`/review/${id}`,);
    return res.data.data;
}
export const updateReview = async (id: number, data: UpdateReview): Promise<ReviewResponse> => {
    const res = await api.put<ApiResponse<ReviewResponse>>(`/review/${id}`,data);
    return res.data.data;
}
export const deleteReview = async (id: number): Promise<string> => {
    const res = await api.put<ApiResponse<string>>(`/review/${id}`);
    return res.data.data;
}