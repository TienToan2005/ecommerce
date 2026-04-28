import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as orderApi from '../../services/order';
import type { OrderResponse } from '../../types/order';
import { formatCurrency } from '../../utils/format';
import { useAuthStore } from '../../hooks/useAuthStore';
import toast from 'react-hot-toast';
import { Package, Clock, CheckCircle2, XCircle, Truck, ChevronRight } from 'lucide-react';

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để xem đơn hàng!');
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res: any = await orderApi.getUserOrders();
      const orderList = res.content || res.items || res || [];
      setOrders(orderList);
    } catch (error) {
      toast.error('Không thể tải lịch sử đơn hàng!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    
    try {
      setCancelingId(orderId);
      await orderApi.cancelOrder(orderId);
      toast.success('Hủy đơn hàng thành công!');
      fetchOrders(); // Tải lại danh sách
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Hủy đơn thất bại!');
    } finally {
      setCancelingId(null);
    }
  };

  // --- HÀM TẠO MÀU SẮC CHO TRẠNG THÁI ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium"><Clock size={16}/> Chờ xác nhận</span>;
      case 'PROCESSING':
        return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium"><Package size={16}/> Đang chuẩn bị hàng</span>;
      case 'SHIPPED':
        return <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm font-medium"><Truck size={16}/> Đang giao hàng</span>;
      case 'DELIVERED':
      case 'COMPLETED':
        return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-medium"><CheckCircle2 size={16}/> Đã giao hàng</span>;
      case 'CANCELLED':
        return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium"><XCircle size={16}/> Đã hủy</span>;
      default:
        return <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm">{status}</span>;
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Đang tải dữ liệu đơn hàng...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase">Lịch sử đơn hàng</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center flex flex-col items-center">
            <Package size={64} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-500 mb-6">Bạn chưa thực hiện giao dịch nào. Hãy mua sắm ngay nhé!</p>
            <Link to="/" className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-700 transition">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* HEADER CỦA ĐƠN HÀNG */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800">Mã ĐH: #{order.orderNumber}</span>
                    <span className="text-gray-400 text-sm hidden sm:inline">|</span>
                    {order.createdAt && (
                      <span className="text-gray-500 text-sm">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                  <div>{getStatusBadge(order.status || 'PENDING')}</div>
                </div>

                {/* DANH SÁCH SẢN PHẨM TRONG ĐƠN */}
                <div className="p-4 space-y-4">
                  {order.orderItems?.map((item: any) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-dashed border-gray-100 last:border-0 last:pb-0">
                      <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 p-2 flex-shrink-0">
                        {/* Lưu ý: Thay đổi đường dẫn ảnh cho khớp với DTO Backend của sếp */}
                        <img src={item.product?.poster || item.product?.images?.[0] || 'https://placehold.co/100x100?text=No+Image'} alt="product" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-2">{item.product?.name || 'Sản phẩm'}</p>
                          <p className="text-sm text-gray-500 mt-1">Phân loại: {item.variant?.sku || 'Mặc định'}</p>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-gray-600 font-medium">x{item.quantity}</span>
                          <span className="font-bold text-gray-800">{formatCurrency(Number(item.price || 0))}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FOOTER: TỔNG TIỀN VÀ NÚT ACTION */}
                <div className="p-4 bg-red-50/30 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
                  <div className="text-sm text-gray-600 flex flex-col">
                    <span>Thanh toán: <strong className="text-gray-800">{order.paymentInfo?.method}</strong></span>
                    {order.paymentInfo?.status === 'COMPLETED' ? (
                      <span className="text-emerald-600 text-xs font-medium">Đã thanh toán</span>
                    ) : (
                      <span className="text-yellow-600 text-xs font-medium">Chưa thanh toán</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Thành tiền:</span>
                      <span className="text-2xl font-bold text-red-600">{formatCurrency(Number(order.totalPrice))}</span>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      {/* Chỉ hiển thị nút Hủy khi đơn hàng đang ở trạng thái PENDING */}
                      {order.status === 'PENDING' && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancelingId === order.id}
                          className="flex-1 sm:flex-none border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50"
                        >
                          {cancelingId === order.id ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                        </button>
                      )}
                      <Link to={`/order-history/${order.id}`} className="flex-1 sm:flex-none bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition text-center flex items-center justify-center gap-1">
                        Xem chi tiết <ChevronRight size={16}/>
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;