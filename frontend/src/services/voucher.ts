import api from './api';

export const checkVoucher = async (code: string, orderTotal: number) => {
  const response = await api.get('/vouchers/check', {
    params: { code, orderTotal }
  });
  return response.data.data;
};
export const getAllVouchers = async (page: number = 0, size: number = 100) => {
  const response = await api.get('/admin/vouchers', {
    params: { page, size }
  });
  return response.data.data; 
};