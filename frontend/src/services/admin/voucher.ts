import api from '../api';
import type {VoucherRequest , VoucherResponse} from '../../types/voucher';

export const getAllVouchers = async (page: number = 0, size: number = 100) => {
  const response = await api.get('/admin/vouchers', {
    params: { page, size }
  });
  return response.data.data; 
};

export const createVoucher = async (data: VoucherRequest): Promise<VoucherResponse> => {
  const response = await api.post('/admin/vouchers', data);
  return response.data.data;
};

export const updateVoucher = async (id: number, data: VoucherRequest): Promise<VoucherResponse> => {
  const response = await api.put(`/admin/vouchers/${id}`, data);
  return response.data.data;
};

export const deleteVoucher = async (id: number): Promise<string> => {
  const response = await api.delete(`/admin/vouchers/${id}`);
  return response.data.data;
};