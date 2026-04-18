import api from './api';
import type {CartRequest, CartResponse, CartItemResponse,UpdateQuantityRequest} from '../types/cart';
import type {ApiResponse} from '../types/apiresponse';

export const addToCart = async (data: CartRequest): Promise<CartResponse> => {
    const res = await api.post<ApiResponse<CartResponse>>(`/cart`, data);
    return res.data.data;
}
export const getCartByUserId = async (userId: number): Promise<CartResponse> => {
    const res = await api.get<ApiResponse<CartResponse>>(`/cart/user/${userId}`);
    return res.data.data;
}
export const getCartItems = async (id: number): Promise<CartItemResponse[]> => {
    const res = await api.get<ApiResponse<CartItemResponse[]>>(`/cart/${id}/items`);
    return res.data.data;
}
export const updateItemQuantity = async (id:number, data:UpdateQuantityRequest): Promise<CartResponse> => {
    const res = await api.put<ApiResponse<CartResponse>>(`/cart/${id}`, data);
    return res.data.data;
}
export const clearCart = async (userId: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/cart/user/${userId}`);
    return res.data.data;
}