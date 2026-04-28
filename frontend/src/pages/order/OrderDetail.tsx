import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as orderApi from '../../services/order';
import type { OrderResponse } from '../../types/order';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';
import { ChevronLeft, Package, Clock, CheckCircle2, XCircle, Truck, MapPin, CreditCard, Receipt } from 'lucide-react';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        // Gọi API lấy chi tiết đơn hàng
        const data = await orderApi.getOrderById(Number(id));
        setOrder(data);
      } catch (error) {
        toast.error('Không tìm thấy thông tin đơn hàng!');
        navigate('/order-history'); // Lỗi thì đá về trang lịch sử
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id, navigate]);

  // Dùng lại hàm tạo màu cho Status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full text-sm font-medium"><Clock size={16}/> Chờ xác nhận</span>;
      case 'PROCESSING': return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-sm font-medium"><Package size={16}/> Đang chuẩn bị hàng</span>;
      case 'SHIPPED': return <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full text-sm font-medium"><Truck size={16}/> Đang giao hàng</span>;
      case 'DELIVERED':
      case 'COMPLETED': return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-medium"><CheckCircle2 size={16}/> Đã giao hàng</span>;
      case 'CANCELLED': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-sm font-medium"><XCircle size={16}/> Đã hủy</span>;
      default: return <span className="text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full text-sm">{status}</span>;
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Đang tải chi tiết đơn hàng...</div>;
  if (!order) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* NÚT QUAY LẠI & HEADER */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/order-history" className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition font-medium">
            <ChevronLeft size={20} /> Quay lại lịch sử
          </Link>
          <div className="text-right">
            <p className="text-sm text-gray-500">Mã đơn hàng</p>
            <p className="font-bold text-gray-800 text-lg">#{order.orderNumber}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* TRẠNG THÁI ĐƠN HÀNG */}
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Trạng thái đơn hàng</h2>
              <p className="text-sm text-gray-500">Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <div>{getStatusBadge(order.status || 'PENDING')}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* THÔNG TIN NGƯỜI NHẬN */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="flex items-center gap-2 text-gray-800 mb-4">
                <MapPin size={20} className="text-red-600" />
                <h3 className="font-bold">Địa chỉ nhận hàng</h3>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-bold text-gray-800 text-base">{order.deliveryAddress?.receiverName || 'Khách hàng'}</p>
                <p>Số điện thoại: <span className="font-medium text-gray-800">{order.deliveryAddress?.receiverPhone}</span></p>
                <p className="leading-relaxed pt-1">
                  {order.deliveryAddress?.street}, {order.deliveryAddress?.ward}, {order.deliveryAddress?.district}, {order.deliveryAddress?.city}
                </p>
              </div>
            </div>

            {/* THÔNG TIN THANH TOÁN */}
            <div className="p-6">
              <div className="flex items-center gap-2 text-gray-800 mb-4">
                <CreditCard size={20} className="text-red-600" />
                <h3 className="font-bold">Phương thức thanh toán</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Hình thức: <span className="font-bold text-gray-800">{order.paymentInfo?.method === 'VNPAY' ? 'Thanh toán qua VNPAY' : 'Thanh toán khi nhận hàng (COD)'}</span></p>
                <p className="flex items-center gap-2">
                  Trạng thái: 
                  {order.paymentInfo?.status === 'COMPLETED' ? (
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Đã thanh toán</span>
                  ) : (
                    <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded">Chưa thanh toán</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DANH SÁCH SẢN PHẨM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Receipt size={20} className="text-red-600" />
            <h3 className="font-bold text-gray-800">Sản phẩm đã mua</h3>
          </div>
          <div className="p-6 space-y-6">
            {order.orderItems?.map((item: any) => (
              <div key={item.id} className="flex gap-4 pb-6 border-b border-dashed border-gray-100 last:border-0 last:pb-0">
                <div className="w-24 h-24 bg-gray-50 rounded-lg border border-gray-100 p-2 flex-shrink-0">
                  <img src={item.product?.poster || item.product?.images?.[0]} alt="product" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 text-base line-clamp-2">{item.product?.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">Phân loại: {item.variant?.sku}</p>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-gray-600 font-medium">Số lượng: x{item.quantity}</span>
                    <span className="font-bold text-gray-800">{formatCurrency(Number(item.price))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* TỔNG KẾT TIỀN */}
          <div className="bg-gray-50 p-6 border-t border-gray-100">
            <div className="space-y-3 max-w-sm ml-auto">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{formatCurrency(Number(order.totalPrice))}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span>0 ₫</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-800">Tổng cộng:</span>
                <span className="text-2xl font-black text-red-600">{formatCurrency(Number(order.totalPrice))}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetail;