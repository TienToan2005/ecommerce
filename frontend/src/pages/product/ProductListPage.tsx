import React from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ProductCard from '../../components/ProductCard';
import { useProducts } from '../../hooks/useProducts';

const ProductListPage: React.FC = () => {
  // Lấy categoryId từ URL (ví dụ: /category/1 -> categoryId = 1)
  const { categoryId } = useParams<{ categoryId: string }>();
  
  // Gọi API thông qua Hook
  const { data, loading, error } = useProducts({ page: 0, size: 12 }, categoryId);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      
      {/* CỘT TRÁI: Menu Danh mục & Bộ lọc */}
      <div className="w-full md:w-64 flex-shrink-0 hidden md:block">
        <Sidebar />
      </div>

      {/* CỘT PHẢI: Danh sách sản phẩm */}
      <div className="flex-1">
        
        {/* Banner hoặc Tiêu đề danh mục */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 uppercase">
            {categoryId ? `Danh mục sản phẩm (ID: ${categoryId})` : 'Tất cả sản phẩm'}
          </h1>
          <div className="text-sm text-gray-500">
            Sắp xếp theo: <span className="font-semibold text-gray-800 cursor-pointer">Mới nhất</span>
          </div>
        </div>

        {/* Xử lý các trạng thái UI */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {!loading && !error && data && data.content.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.content.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && !error && data && data.content.length === 0 && (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm h-64 text-gray-500">
            <img src="https://cellphones.com.vn/cart/_nuxt/img/empty-cart.c71473e.png" alt="Empty" className="w-32 opacity-50 mb-4" />
            <p>Không tìm thấy sản phẩm nào trong danh mục này.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductListPage;