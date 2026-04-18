import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useCartStore } from '../../hooks/useCartStore';
import * as orderApi from '../../services/order';
import type { OrderRequest } from '../../types/order';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY' | 'CREDIT_CARD'>('COD');
  const [selectedAddressId, setSelectedAddressId] = useState<number>(1); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thanh toán!');
      navigate('/login');
    } else if (items.length === 0) {
      toast.error('Giỏ hàng trống!');
      navigate('/');
    }
  }, [isAuthenticated, items.length, navigate]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const orderPayload: OrderRequest = {
            addressId: selectedAddressId,
            paymentMethod: paymentMethod,
            orderItemList: items.map(item => ({
                productId: item.id || 0, 
                quantity: item.quantity,
                discount_amount: "0" 
            }))
        };

      await orderApi.placeOrder(orderPayload);

      toast.success('🎉 Đặt hàng thành công!');
      clearCart();
      navigate('/'); 
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || items.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold uppercase text-gray-800 mb-8">Thanh toán đơn hàng</h1>

      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
        
        <div className="flex-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">1. Địa chỉ giao hàng</h2>
            <div className="space-y-3">
              <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === 1 ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}>
                <input type="radio" checked={selectedAddressId === 1} onChange={() => setSelectedAddressId(1)} className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="ml-3">
                  <p className="font-bold text-gray-800">{user?.fullName || 'Khách hàng'} - {user?.phoneNumber}</p>
                  <p className="text-gray-600 text-sm mt-1">123 Đường Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội</p>
                </div>
              </label>
            </div>
            <button type="button" className="mt-4 text-red-600 font-medium text-sm hover:underline">+ Thêm địa chỉ mới</button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">2. Phương thức thanh toán</h2>
            <div className="space-y-3">
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'COD' ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}>
                <input type="radio" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-5 h-5 text-red-600" />
                <span className="ml-3 font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'VNPAY' ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}>
                <input type="radio" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} className="w-5 h-5 text-red-600" />
                <span className="ml-3 font-medium text-gray-800">Thanh toán qua VNPAY</span>
              </label>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Đơn hàng của bạn</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-md border flex-shrink-0">
                    <img src={item.images} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-gray-800 line-clamp-2">{item.name}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500">SL: {item.quantity}</span>
                      <span className="font-bold text-red-600">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-end mt-2">
                <span className="font-bold text-gray-800">Tổng cộng:</span>
                {/* Đã gọi getTotalPrice ở đây */}
                <span className="font-medium">{formatCurrency(Number(getTotalPrice()))}</span>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className={`w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg uppercase text-lg hover:bg-red-700 ${isSubmitting ? 'opacity-70' : ''}`}>
              {isSubmitting ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG NGAY'}
            </button>

            {/* Đã thêm lại Link vào đây để hết lỗi unused import */}
            <Link to="/cart" className="block text-center mt-4 text-sm text-gray-500 hover:text-red-600 hover:underline">
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>

      </form>
    </div>
  );
};

export default Checkout;