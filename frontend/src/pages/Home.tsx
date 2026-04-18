import React, { useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  const { data, loading, error } = useProducts({ page: 0, size: 12 });

  // In ra Console để xem Backend thực sự trả về cái gì
  useEffect(() => {
    console.log("Dữ liệu API Products trả về:", data);
  }, [data]);

  // Xử lý thông minh: Nếu data có .content (kiểu Page) thì lấy, nếu data là mảng luôn (kiểu List) thì dùng data, không thì lấy mảng rỗng.
  const productList = data?.content || (Array.isArray(data) ? data : []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Banner quảng cáo */}
      <div className="w-full h-48 md:h-[400px] bg-gradient-to-r from-red-600 to-red-400 rounded-2xl mb-8 flex items-center justify-center text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 text-center px-4">
          <h2 className="text-3xl md:text-5xl font-black mb-4">T-PHONE HOT SALE</h2>
          <p className="text-lg md:text-xl">Giảm giá sập sàn các dòng iPhone 15 Series</p>
        </div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="mb-6 flex items-center justify-between border-b-2 border-red-600 pb-2">
        <h2 className="text-xl md:text-2xl font-bold uppercase text-gray-800">
          Sản phẩm nổi bật
        </h2>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg text-center font-medium">
          Lỗi tải dữ liệu: {error}
        </div>
      )}

      {/* DÙNG productList thay vì data.content */}
      {!loading && !error && productList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {productList.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && !error && productList.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
          <img src="https://cellphones.com.vn/cart/_nuxt/img/empty-cart.c71473e.png" alt="Empty" className="w-32 opacity-30 mb-4" />
          <p className="text-gray-500 text-lg">Chưa có sản phẩm nào trong hệ thống.</p>
          <p className="text-gray-400 text-sm mt-2">Dữ liệu trả về hiện đang trống.</p>
        </div>
      )}

    </div>
  );
};

export default Home;