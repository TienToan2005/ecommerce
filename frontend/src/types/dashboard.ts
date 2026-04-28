export interface DashboardStats {
        totalRevenue: string;
        totalOrdersDelivered: number;
        totalOrdersCancelled: number;
        totalUsers: number
}
export interface MonthlyRevenue {
    month: number;
    revenue: string;
}
export interface TopProduct {
    name: string;
    totalSold: number;
    totalRevenue: string;
}