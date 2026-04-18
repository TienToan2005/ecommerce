import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../hooks/useCartStore';
import { useAuthStore } from '../../hooks/useAuthStore';
import { formatCurrency } from '../../utils/format';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  
  // Lấy state và action từ Zustand Cart Store
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCartStore();
  
  // Lấy state từ Zustand Auth Store để kiểm tra đăng nhập
  const { isAuthenticated, openAuthModal } = useAuthStore();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Nếu chưa đăng nhập -> Gọi Modal lên (giống CellphoneS)
      openAuthModal();
      return;
    }
    // Nếu đã đăng nhập -> Chuyển sang bước tạo đơn hàng (sẽ làm sau)
    alert('Đang chuyển hướng sang trang Thanh toán...');
  };

  // 1. Giao diện khi giỏ hàng trống
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm mt-4">
        <ShoppingBag size={80} className="text-gray-200 mb-6" />
        <p className="text-gray-500 text-lg mb-6">Giỏ hàng của bạn đang trống.</p>
        <Link 
          to="/" 
          className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md shadow-red-600/30"
        >
          TIẾP TỤC MUA SẮM
        </Link>
      </div>
    );
  }

  // 2. Giao diện khi có sản phẩm
  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold uppercase text-gray-800">Giỏ hàng của bạn</h2>
        <span className="bg-gray-200 text-gray-700 text-sm font-bold px-3 py-1 rounded-full">
          {items.length} sản phẩm
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
              
              {/* Ảnh sản phẩm */}
              <Link to={`/product/${item.id}`} className="w-24 h-24 flex-shrink-0 bg-white p-2 border border-gray-200 rounded-lg">
                <img src={item.images || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-contain" />
              </Link>

              {/* Thông tin */}
              <div className="flex-1 flex flex-col sm:flex-row justify-between w-full gap-4">
                <div className="flex-1">
                  <Link to={`/product/${item.id}`} className="font-semibold text-gray-800 hover:text-red-600 transition-colors line-clamp-2">
                    {item.name}
                  </Link>
                  <p className="text-red-600 font-bold mt-2">{formatCurrency(item.price)}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto">
                  {/* Cụm nút Tăng giảm số lượng */}
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="w-10 text-center font-medium text-sm">
                      {item.quantity}
                    </div>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Nút Xóa */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2 bg-white rounded-full hover:bg-red-50"
                    title="Xóa khỏi giỏ hàng"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG */}
        <div className="w-full lg:w-[350px] flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="text-lg font-bold mb-4">Thông tin thanh toán</h3>
            
            <div className="flex justify-between text-gray-600 mb-3">
              <span>Tạm tính:</span>
              <span className="font-medium">{formatCurrency(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-4 pb-4 border-b border-dashed border-gray-200">
              <span>Khuyến mãi:</span>
              <span className="text-green-600 font-medium">- 0 ₫</span>
            </div>
            
            <div className="flex justify-between items-end mb-6">
              <span className="font-bold text-gray-800">Tổng cộng:</span>
              <span className="text-2xl font-bold text-red-600">{formatCurrency(getTotalPrice())}</span>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-red-600 text-white font-bold py-3.5 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 uppercase"
            >
              Tiến hành đặt hàng
            </button>
            
            <Link to="/" className="block text-center mt-4 text-sm text-red-600 hover:underline font-medium">
              Chọn thêm sản phẩm khác
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;