import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { ProductResponse } from '../types/product';
import { useCartStore } from '../hooks/useCartStore';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';

interface Props {
  product: ProductResponse;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const addToCart = useCartStore(state => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn không cho Link chuyển trang khi bấm nút "Thêm vào giỏ"
    addToCart(product, 1);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  // Backend của bạn trả về images là mảng List<String>, ta lấy ảnh đầu tiên để hiển thị
  const thumbnail = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://via.placeholder.com/300';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group relative">
      
      {/* Ảnh sản phẩm */}
      <Link to={`/product/${product.id}`} className="block relative pt-[100%] mb-4 overflow-hidden rounded-lg bg-gray-50">
        <img 
          src={thumbnail} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Thông tin sản phẩm */}
      <div className="flex flex-col flex-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 hover:text-red-600 transition-colors mb-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Phần Giá nằm ở cuối để đẩy xuống đáy */}
        <div className="mt-auto">
          <p className="text-red-600 font-bold text-lg">
            {formatCurrency(Number(product.price))}
          </p>
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500">Kho: {product.stock}</span>
            <button 
              onClick={handleAddToCart}
              className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;