import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, Truck } from 'lucide-react';
import * as productApi from '../../services/product';
import type { ProductResponse } from '../../types/product';
import { useCartStore } from '../../hooks/useCartStore';
import { formatCurrency } from '../../utils/format';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await productApi.getProductById(Number(id));
        setProduct(data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-20 animate-pulse">Đang tải dữ liệu...</div>;
  if (!product) return <div className="text-center py-20 text-red-600 font-bold text-xl">Không tìm thấy sản phẩm!</div>;

  const handleBuyNow = () => {
    addToCart(product, 1);
    navigate('/cart'); // Thêm vào giỏ và nhảy sang trang Giỏ hàng luôn
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8">
      
      {/* Tiêu đề sản phẩm */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
        {product.name}
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* KHỐI 1: Ảnh sản phẩm (Trái) */}
        <div className="w-full md:w-[400px] flex-shrink-0">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-center aspect-square">
            <img 
              src={product.images || 'https://via.placeholder.com/400'} 
              alt={product.name} 
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* KHỐI 2: Thông tin & Đặt hàng (Giữa) */}
        <div className="flex-1 flex flex-col">
          
          {/* Giá */}
          <div className="mb-6">
            <p className="text-3xl font-bold text-red-600 mb-2">
              {formatCurrency(product.price)}
            </p>
            <p className="text-sm text-gray-500 line-through">
              {formatCurrency(product.price * 1.2)} {/* Giá ảo giả lập giảm giá 20% */}
            </p>
          </div>

          {/* Các nút Hành động */}
          <div className="flex flex-col gap-3 mt-auto">
            <button 
              onClick={handleBuyNow}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 uppercase flex flex-col items-center justify-center"
            >
              <span>Mua Ngay</span>
              <span className="text-xs font-normal text-red-100">Giao hàng tận nơi hoặc nhận tại cửa hàng</span>
            </button>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  addToCart(product, 1);
                  alert('Đã thêm vào giỏ hàng!');
                }}
                className="flex-1 border-2 border-red-600 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                <span>Thêm vào giỏ</span>
              </button>
            </div>
          </div>
        </div>

        {/* KHỐI 3: Chính sách bảo hành (Phải) */}
        <div className="w-full md:w-[300px] border border-gray-200 rounded-xl p-4 h-fit">
          <h3 className="font-bold text-gray-800 mb-4">Thông tin máy</h3>
          <ul className="space-y-4 text-sm text-gray-700">
            <li className="flex gap-3">
              <ShieldCheck className="text-red-600 flex-shrink-0" size={20} />
              <span>Bảo hành chính hãng 12 tháng tại trung tâm bảo hành uỷ quyền.</span>
            </li>
            <li className="flex gap-3">
              <Truck className="text-red-600 flex-shrink-0" size={20} />
              <span>Giao hàng nhanh toàn quốc. Kiểm tra hàng trước khi thanh toán.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Phần Mô tả sản phẩm */}
      <div className="mt-10 pt-6 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Đặc điểm nổi bật</h2>
        <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {product.description || 'Chưa có thông tin mô tả cho sản phẩm này.'}
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;