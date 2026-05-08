import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle2, Clock, Truck, Package, XCircle, Loader2, ClipboardList, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../../services/admin/order';
import type { OrderResponse } from '../../types/order';

const AdminOrder: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const pageData = await getAllOrdersAdmin({ 
        page: 0, 
        size: 20,
        search: searchTerm || undefined,
        status: statusFilter || undefined
      });
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
  }, [statusFilter]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchOrders();
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!window.confirm('Xác nhận cập nhật trạng thái đơn hàng này?')) return;

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
      case 'PENDING': return <span className="flex items-center justify-center gap-1.5 text-yellow-700 bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-md text-xs font-bold w-full"><Clock size={14}/> Chờ xác nhận</span>;
      case 'PROCESSING': return <span className="flex items-center justify-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md text-xs font-bold w-full"><Package size={14}/> Chuẩn bị hàng</span>;
      case 'SHIPPED': return <span className="flex items-center justify-center gap-1.5 text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md text-xs font-bold w-full"><Truck size={14}/> Đang giao</span>;
      case 'DELIVERED': return <span className="flex items-center justify-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md text-xs font-bold w-full"><CheckCircle2 size={14}/> Đã giao</span>;
      case 'CANCELLED': return <span className="flex items-center justify-center gap-1.5 text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-md text-xs font-bold w-full"><XCircle size={14}/> Đã hủy</span>;
      default: return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md text-xs font-bold w-full text-center">{status}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-white text-sm text-gray-700 font-medium cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="PROCESSING">Chuẩn bị hàng</option>
            <option value="SHIPPED">Đang giao</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          {/* Ô tìm kiếm */}
          <div className="relative flex-1 sm:w-64">
            <input 
              type="text" 
              placeholder="Nhập mã đơn hàng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-sm" 
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <button onClick={fetchOrders} className="p-2.5 bg-white border border-gray-200 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-all">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center py-20 text-red-500">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-sm border-b border-gray-100 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Mã Đơn</th>
                  <th className="py-4 px-6 font-semibold">Khách Hàng</th>
                  <th className="py-4 px-6 font-semibold">Ngày Đặt</th>
                  <th className="py-4 px-6 font-semibold">Tổng Tiền</th>
                  <th className="py-4 px-6 font-semibold text-center w-48">Trạng Thái</th>
                  <th className="py-4 px-6 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const customerName = order.createdBy || 'Khách vãng lai';
                  const totalAmount = Number(order.totalPrice);

                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition duration-150">
                      <td className="py-4 px-6 text-sm font-bold text-gray-800">
                        #{order.orderNumber}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-700">
                        {customerName}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-red-600">
                        {formatCurrency(totalAmount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <select 
                          value={order.status} 
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="w-full text-xs font-bold text-gray-600 outline-none cursor-pointer bg-white mb-2 hover:border-red-300 transition border border-gray-200 rounded p-1.5 shadow-sm focus:ring-1 focus:ring-red-500"
                        >
                          <option value="PENDING">Chờ xác nhận</option>
                          <option value="PROCESSING">Chuẩn bị hàng</option>
                          <option value="SHIPPED">Đang giao</option>
                          <option value="DELIVERED">Đã giao</option>
                          <option value="CANCELLED">Hủy đơn</option>
                        </select>
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => toast('Tính năng xem chi tiết đơn hàng đang phát triển!', { icon: '🚧' })}
                          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" 
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!isLoading && orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                       <div className="flex flex-col items-center justify-center text-gray-400">
                          <ClipboardList size={56} className="mb-4 opacity-40 text-slate-300" />
                          <p className="text-lg font-bold text-gray-600">Không tìm thấy đơn hàng nào</p>
                          <p className="text-sm mt-1 text-gray-500">Thử thay đổi mã đơn hàng cần tìm kiếm.</p>
                        </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrder;