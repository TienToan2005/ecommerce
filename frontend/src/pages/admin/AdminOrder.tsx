import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle2, Clock, Truck, Package, XCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../../services/admin/order';
import type { OrderResponse } from '../../types/order';

const AdminOrder: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Fetch Dữ liệu thật từ Backend
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const pageData = await getAllOrdersAdmin(0, 20);
      setOrders(pageData.content);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng", error);
      toast.error('Không thể tải danh sách đơn hàng!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatusAdmin(orderId, { status: newStatus });
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
      toast.success('Đã cập nhật trạng thái đơn hàng!');
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái", error);
      toast.error('Có lỗi xảy ra, không thể thay đổi trạng thái!');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md text-xs font-bold"><Clock size={14}/> Chờ xác nhận</span>;
      case 'PROCESSING': return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-bold"><Package size={14}/> Chuẩn bị hàng</span>;
      case 'SHIPPED': return <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-xs font-bold"><Truck size={14}/> Đang giao</span>;
      case 'DELIVERED': return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold"><CheckCircle2 size={14}/> Đã giao</span>;
      case 'CANCELLED': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-bold"><XCircle size={14}/> Đã hủy</span>;
      default: return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi và cập nhật trạng thái đơn hàng</p>
        </div>
        <div className="relative">
          <input type="text" placeholder="Tìm mã đơn hàng..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-gray-400">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                <th className="py-4 px-6 font-medium">Mã Đơn</th>
                <th className="py-4 px-6 font-medium">Khách Hàng</th>
                <th className="py-4 px-6 font-medium">Ngày Đặt</th>
                <th className="py-4 px-6 font-medium">Tổng Tiền</th>
                <th className="py-4 px-6 font-medium">Trạng Thái</th>
                <th className="py-4 px-6 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const customerName = (order.deliveryAddress as any)?.fullName || `User #${order.userId}`;
                
                const totalAmount = Number(order.totalPrice);

                return (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 text-sm font-bold text-gray-800">{order.orderNumber}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{customerName}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-red-600">{formatCurrency(totalAmount)}</td>
                    <td className="py-4 px-6">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-sm font-bold text-gray-700 outline-none cursor-pointer bg-transparent mb-1 hover:text-blue-600 transition border border-gray-200 rounded p-1"
                      >
                        <option value="PENDING">Chờ xác nhận</option>
                        <option value="PROCESSING">Chuẩn bị hàng</option>
                        <option value="SHIPPED">Đang giao</option>
                        <option value="DELIVERED">Hoàn thành (Đã giao)</option>
                        <option value="CANCELLED">Hủy đơn</option>
                      </select>
                      <div className="mt-1">{getStatusBadge(order.status)}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg transition" title="Xem chi tiết">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    Chưa có đơn hàng nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default AdminOrder;