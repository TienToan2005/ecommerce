import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { DollarSign, ShoppingBag, XCircle, Users, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import * as dashboardApi from '../../services/admin/dashboard';
import type { DashboardStats, MonthlyRevenue, TopProduct } from '../../types/dashboard';
import type { ProductVariantResponse } from '../../types/product';
import { formatCurrency } from '../../utils/format';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<ProductVariantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, revenueRes, topRes, lowStockRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRevenueChart(year),
          dashboardApi.getTopSellingProducts(),
          dashboardApi.getLowStock()
        ]);
        
        setStats(statsRes);
        setRevenueData(revenueRes);
        setTopProducts(topRes);
        setLowStock(lowStockRes);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [year]);

  const chartData = revenueData.map(item => ({
    name: `Tháng ${item.month}`,
    DoanhThu: Number(item.revenue)
  }));

  if (loading) return <div className="p-8 text-center animate-pulse text-gray-500 font-medium">Đang tải dữ liệu tổng quan...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER & LỌC NĂM */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Tổng Quan</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi doanh thu và tình trạng kho hàng</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <span className="text-sm font-medium text-gray-600">Năm thống kê:</span>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="font-bold text-gray-800 outline-none cursor-pointer"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* 1. KHỐI CARD THỐNG KÊ (4 cột) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><DollarSign size={28}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng Doanh Thu</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(Number(stats?.totalRevenue || 0))}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><ShoppingBag size={28}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Đơn Giao Thành Công</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalOrdersDelivered || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"><XCircle size={28}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Đơn Hàng Đã Hủy</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalOrdersCancelled || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><Users size={28}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng Khách Hàng</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 2. BIỂU ĐỒ DOANH THU (Chiếm 2 cột) */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-500" /> Doanh thu hàng tháng ({year})
          </h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13}} dy={10} />
                <YAxis 
                  tickFormatter={(value) => `${value / 1000000}M`} // Rút gọn 1.000.000 thành 1M
                  axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13}}
                />
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="DoanhThu" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. TOP SẢN PHẨM BÁN CHẠY (Chiếm 1 cột) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ShoppingBag className="text-emerald-500" /> Top Sản Phẩm Bán Chạy
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {topProducts.length > 0 ? topProducts.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${index === 0 ? 'bg-yellow-100 text-yellow-600' : index === 1 ? 'bg-gray-200 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Đã bán: <span className="font-bold text-emerald-600">{item.totalSold}</span></p>
                </div>
                <div className="font-bold text-sm text-gray-800 shrink-0">
                  {formatCurrency(Number(item.totalRevenue))}
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-400">Chưa có dữ liệu bán hàng</div>
            )}
          </div>
        </div>

        {/* 4. CẢNH BÁO SẮP HẾT HÀNG (Trải ngang phía dưới) */}
        <div className="xl:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> Cảnh Báo Tồn Kho Thấp
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="py-3 px-4 font-medium rounded-tl-lg">Mã Phân Loại (SKU)</th>
                  <th className="py-3 px-4 font-medium">Giá Bán</th>
                  <th className="py-3 px-4 font-medium">Tồn Kho Hiện Tại</th>
                  <th className="py-3 px-4 font-medium rounded-tr-lg">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.length > 0 ? lowStock.map((variant, i) => (
                  <tr key={variant.id || i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Package size={16} className="text-gray-400"/> {variant.sku}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{formatCurrency(Number(variant.price))}</td>
                    <td className="py-3 px-4 text-sm font-bold text-red-600">{variant.stock}</td>
                    <td className="py-3 px-4">
                      {variant.stock === 0 
                        ? <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">Hết hàng</span>
                        : <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-bold">Sắp hết</span>
                      }
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">Kho hàng đang ổn định, không có sản phẩm nào sắp hết!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;