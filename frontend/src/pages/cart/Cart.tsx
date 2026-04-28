import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../hooks/useCartStore';
import { formatCurrency } from '../../utils/format'; // Import hàm format tiền của sếp
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center">
        <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={64} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng của sếp đang trống</h2>
        <p className="text-gray-500 mb-6">Hãy chọn thêm một vài món đồ công nghệ xịn sò nhé!</p>
        <Link to="/" className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  // Chuyển Decimal sang Number để format hiển thị
  const totalPrice = getTotalPrice().toNumber();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Giỏ hàng của bạn</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Danh sách sản phẩm */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            // Lấy ảnh thumbnail an toàn
            const thumbnail = item.product.poster || (item.product.images?.[0]) || 'https://dummyimage.com/300x300/f3f4f6/9ca3af.png&text=No+Image';
            
            return (
              <div key={item.variant.id} className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
                <img src={thumbnail} alt={item.product.name} className="w-24 h-24 object-contain rounded-lg border p-1" />
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-red-600 transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Phân loại: {
                        item.variant.attributes 
                          ? Object.values(item.variant.attributes).join(' - ') 
                          : item.variant.sku || item.variant.id
                      } 
                      x <span className="font-bold">{item.quantity}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-red-600 font-bold">
                      {formatCurrency(Number(item.variant.price))}
                    </p>

                    {/* Tăng giảm số lượng */}
                    <div className="flex items-center border rounded-lg bg-gray-50">
                      <button 
                        onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors rounded-l-lg"
                      ><Minus size={16} /></button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                        disabled={item.quantity >= item.variant.stock} // Chặn nếu vượt quá số lượng tồn kho
                        className={`p-1.5 transition-colors rounded-r-lg ${item.quantity >= item.variant.stock ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 text-gray-600'}`}
                      ><Plus size={16} /></button>
                    </div>
                  </div>
                </div>

                {/* Nút xóa sản phẩm */}
                <button 
                  onClick={() => removeFromCart(item.variant.id, item.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  title="Xóa khỏi giỏ"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Cột phải: Tổng kết đơn hàng */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
          
          <div className="flex justify-between mb-3 text-gray-600">
            <span>Tổng tiền hàng:</span>
            <span className="font-medium">{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between mb-4 text-gray-600">
            <span>Phí vận chuyển:</span>
            <span className="text-green-600 font-medium">Miễn phí</span>
          </div>
          
          <hr className="my-4 border-gray-200" />
          
          <div className="flex justify-between mb-6">
            <span className="font-bold text-gray-800">Cần thanh toán:</span>
            <span className="font-black text-2xl text-red-600">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <Link 
            to="/checkout" 
            className="w-full flex items-center justify-center bg-red-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-200 hover:shadow-xl hover:-translate-y-0.5"
          >
            MUA HÀNG NGAY
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;