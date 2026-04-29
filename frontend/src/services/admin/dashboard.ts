import api from '../api';
import type { DashboardStats, MonthlyRevenue, TopProduct } from '../../types/dashboard'; 
import type { ProductVariantResponse } from '../../types/product';
import type { ApiResponse } from '../../types/apiresponse';

export const getStats = async (): Promise<DashboardStats> => {
    const res = await api.get<ApiResponse<DashboardStats>>(`/admin/dashboard/stats`);
    return res.data.data;
}

export const getRevenueChart = async (year: number): Promise<MonthlyRevenue[]> => {
    const res = await api.get<ApiResponse<MonthlyRevenue[]>>(`/admin/dashboard/revenue-chart?year=${year}`);
    return res.data.data;
}

export const getTopSellingProducts = async (): Promise<TopProduct[]> => {
    const res = await api.get<ApiResponse<TopProduct[]>>(`/admin/dashboard/top-selling`);
    return res.data.data;
}

export const getLowStock = async (): Promise<ProductVariantResponse[]> => {
    const res = await api.get<ApiResponse<ProductVariantResponse[]>>(`/admin/dashboard/low-stock`);
    return res.data.data;
}