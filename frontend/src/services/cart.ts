import api from './api';
import type {CartRequest, CartResponse, UpdateQuantityRequest} from '../types/cart';
import type {ApiResponse} from '../types/apiresponse';

export const addToCart = async (data: CartRequest): Promise<CartResponse> => {
    const res = await api.post<ApiResponse<CartResponse>>(`/cart/add`, data);
    return res.data.data;
};
export const getMyCart = async () => {
  const res = await api.get('/cart/my-cart');
  return res.data.data;
};
export const updateItemQuantity = async (id:number, data:UpdateQuantityRequest): Promise<CartResponse> => {
    const res = await api.put<ApiResponse<CartResponse>>(`/cart/items/${id}`, data);
    return res.data.data;
};
export const clearCart = async (userId: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/cart/user/${userId}`);
    return res.data.data;
};
export const removeCartItem = async (cartItemId: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/cart/items/${cartItemId}`);
    return res.data.data;
};