import api from './api';
import type {AddressRequest, AddressResponse} from '../types/address';
import type {ApiResponse} from '../types/apiresponse';

export const updateAddress = async (data: AddressRequest): Promise<AddressResponse> => {
    const res = await api.put<ApiResponse<AddressResponse>>(`/address`, data);
    return res.data.data;
}