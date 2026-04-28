import api from './api';
import type {AddressRequest, AddressResponse} from '../types/address';
import type {ApiResponse} from '../types/apiresponse';


export const createAddress = async (data: AddressRequest): Promise<AddressResponse> => {
    const res = await api.post<ApiResponse<AddressResponse>>(`/addresses`, data);
    return res.data.data;
}

export const getMyAddresses = async (): Promise<AddressResponse[]> => {
  const response = await api.get<ApiResponse<AddressResponse[]>>('/addresses/my-address');
  return response.data.data;
};

export const updateAddress = async (id: number ,data: AddressRequest): Promise<AddressResponse> => {
    const res = await api.put<ApiResponse<AddressResponse>>(`/addresses/${id}`, data);
    return res.data.data;
}
export const deleteAddress = async (id: number): Promise<string> => {
    const res = await api.delete<ApiResponse<string>>(`/addresses/${id}`);
    return res.data.data;
}