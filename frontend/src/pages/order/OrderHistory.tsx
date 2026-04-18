import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, MapPin, ChevronRight } from 'lucide-react';
import * as orderApi from '../../services/order';
import type { Page } from '../../types/apiresponse';
import type { OrderResponse } from '../../types/order';
import { useAuthStore } from '../../hooks/useAuthStore';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [orderPage, setOrderPage] = useState<Page<OrderResponse> | null>(null);
  const [loading, setLoading] = useState(true);

  // Bảo vệ route và gọi API
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để xem đơn hàng!');
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Gọi API lấy danh sách đơn hàng của user hiện tại
        const data = await orderApi.getUserOrders({ page: 0, size: 10 });
        setOrderPage(data);
      } catch (error) {
        toast.error('Không thể tải lịch sử đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Package className="text-red-600" size={32} />
        <h1 className="text-2xl font-bold uppercase text-gray-800">Đơn hàng của tôi</h1>
      </div>

      {!orderPage || orderPage.content.length === 0 ? (
        // UI khi chưa có đơn hàng nào
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
          <img src="https://cellphones.com.vn/cart/_nuxt/img/empty-cart.c71473e.png" alt="Empty" className="w-48 opacity-50 mb-6" />
          <p className="text-gray-500 text-lg mb-6">Bạn chưa có đơn hàng nào.</p>
          <Link to="/" className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30">
            MUA SẮM NGAY
          </Link>
        </div>
      ) : (
        // UI Danh sách đơn hàng
        <div className="space-y-6">
          {orderPage.content.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              
              {/* Header của từng đơn (Mã đơn & Trạng thái) */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mã đơn hàng</p>
                  <p className="font-bold text-gray-800">#{order.order_number}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" />
                  {/* Tạm thời hiển thị text cứng, sau này bạn có thể map field status từ DB lên */}
                  <span className="text-blue-600 font-semibold text-sm bg-blue-50 px-3 py-1 rounded-full">Đang xử lý</span>
                </div>
              </div>

              {/* Body: Danh sách sản phẩm trong đơn */}
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      {/* Placeholder ảnh: Vì API hiện tại chỉ trả productId, ta dùng ảnh xám tạm thời */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-medium text-xs">
                        ID: {item.productId}
                      </div>
                      <div className="flex-1">
                        {/* Ở dự án thực tế, Backend nên trả kèm Tên và Ảnh sản phẩm trong OrderItemResponse */}
                        <p className="font-semibold text-gray-800">Sản phẩm #{item.productId}</p>
                        <p className="text-sm text-gray-500">x {item.quantity}</p>
                      </div>
                      <div className="font-bold text-red-600">
                        {formatCurrency(Number(item.price))}
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-dashed border-gray-200 mb-6" />

                {/* Footer: Tổng tiền & Thông tin thanh toán */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>Thanh toán bằng: <strong className="text-gray-800">{order.paymentInfo?.method || 'N/A'}</strong></span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">Tổng số tiền:</span>
                    <span className="text-2xl font-bold text-red-600">{formatCurrency(Number(order.totalPrice))}</span>
                    
                    {/* Nút xem chi tiết (Có thể phát triển thêm tính năng này sau) */}
                    <button className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium ml-4 border border-red-600">
                      Chi tiết <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;