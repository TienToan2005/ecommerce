import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../hooks/useCartStore';
import { useAuthStore } from '../hooks/useAuthStore';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';
import api from '../services/api';
import { MapPin, Truck, CreditCard, CheckCircle } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  // State lưu thông tin form
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phoneNumber || '',
    address: user?.address || '',
    note: '',
    paymentMethod: 'COD',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thanh toán!');
      navigate('/login');
    } else if (items.length === 0) {
      toast.error('Giỏ hàng trống, hãy chọn mua thêm đồ nhé!');
      navigate('/');
    }
  }, [isAuthenticated, items, navigate]);

  // Xử lý khi gõ vào form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚨 Xử lý Đặt hàng
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate sương sương
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error('Sếp vui lòng điền đầy đủ thông tin giao hàng nhé!');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        ...formData,
        totalAmount: getTotalPrice().toNumber(),
        orderDetails: items.map(item => ({
          variantId: item.variant.id,
          quantity: item.quantity,
          price: item.variant.price
        }))
      };

      await api.post('/orders', orderPayload);

      toast.success('🎉 Đặt hàng thành công!');
      
      clearCart();
      
      navigate('/my-orders');
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  const totalPrice = getTotalPrice().toNumber();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8 uppercase tracking-wide">
        Thanh toán đơn hàng
      </h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG & THANH TOÁN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Box 1: Thông tin nhận hàng */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <MapPin className="text-red-600" /> Thông tin nhận hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Họ và tên *</label>
                <input 
                  type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none" 
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Số điện thoại *</label>
                <input 
                  type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none" 
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-700">Địa chỉ giao hàng cụ thể *</label>
                <input 
                  type="text" name="address" value={formData.address} onChange={handleInputChange} required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none" 
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-700">Ghi chú thêm (Tùy chọn)</label>
                <textarea 
                  name="note" value={formData.note} onChange={handleInputChange} rows={3}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none" 
                  placeholder="Giao giờ hành chính, gọi trước khi giao..."
                />
              </div>
            </div>
          </div>

          {/* Box 2: Phương thức thanh toán */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <CreditCard className="text-red-600" /> Phương thức thanh toán
            </h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'border-red-600 bg-red-50' : 'hover:bg-gray-50'}`}>
                <input 
                  type="radio" name="paymentMethod" value="COD" 
                  checked={formData.paymentMethod === 'COD'} 
                  onChange={handleInputChange} className="w-5 h-5 text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="font-semibold text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi shipper giao hàng tới.</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'VNPAY' ? 'border-red-600 bg-red-50' : 'hover:bg-gray-50'}`}>
                <input 
                  type="radio" name="paymentMethod" value="VNPAY" 
                  checked={formData.paymentMethod === 'VNPAY'} 
                  onChange={handleInputChange} className="w-5 h-5 text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="font-semibold text-gray-800">Thanh toán qua VNPAY</p>
                  <p className="text-sm text-gray-500">Quét mã QR qua ứng dụng ngân hàng hoặc ví điện tử.</p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-4">
            <Truck className="text-gray-700" /> Đơn hàng của bạn ({items.length} SP)
          </h2>
          
          {/* List Sản phẩm (Scrollable nếu nhiều hàng) */}
          <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-2">
            {items.map((item) => (
              <div key={item.variant.id} className="flex justify-between items-start gap-2">
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-gray-800 line-clamp-2">{item.product.name}</p>
                    <p className="text-gray-500">
                    Phân loại: {
                        item.variant.attributes && Object.keys(item.variant.attributes).length > 0
                        ? Object.values(item.variant.attributes).join(' - ') 
                        : item.variant.sku || item.variant.id
                    } 
                    x <span className="font-bold">{item.quantity}</span>
                    </p>
                </div>
                <p className="font-medium text-gray-800">
                  {formatCurrency(Number(item.variant.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          
          <hr className="my-4 border-gray-200" />
          
          <div className="flex justify-between mb-3 text-gray-600 text-sm">
            <span>Tạm tính:</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between mb-4 text-gray-600 text-sm">
            <span>Phí vận chuyển:</span>
            <span className="text-green-600 font-medium">Miễn phí</span>
          </div>
          
          <div className="flex justify-between items-center mb-6 py-4 border-t border-b border-gray-100">
            <span className="font-bold text-gray-800">Tổng cộng:</span>
            <span className="font-black text-2xl text-red-600">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-200 ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <><span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> Đang xử lý...</>
            ) : (
              <><CheckCircle size={20} /> ĐẶT HÀNG NGAY</>
            )}
          </button>
          
          <Link to="/cart" className="block text-center text-sm text-blue-600 hover:underline mt-4">
            Quay lại giỏ hàng
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;