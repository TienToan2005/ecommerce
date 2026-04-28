import React, { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import api from '../services/api'; // Đường dẫn gọi API của sếp
import { LayoutGrid, Smartphone, Laptop, Headphones, Watch, Monitor } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('điện thoại')) return <Smartphone size={28} className="mb-2 text-blue-500" />;
  if (lowerName.includes('laptop') || lowerName.includes('máy tính')) return <Laptop size={28} className="mb-2 text-orange-500" />;
  if (lowerName.includes('phụ kiện') || lowerName.includes('tai nghe')) return <Headphones size={28} className="mb-2 text-purple-500" />;
  if (lowerName.includes('đồng hồ')) return <Watch size={28} className="mb-2 text-green-500" />;
  if (lowerName.includes('màn hình') || lowerName.includes('tivi')) return <Monitor size={28} className="mb-2 text-red-500" />;
  return <LayoutGrid size={28} className="mb-2 text-gray-500" />;
};

const Home: React.FC = () => {
  const location = useLocation();
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const queryParams = useMemo(() => ({
    page: 0,
    size: 12
  }), []);
  const { data, loading, error } = useProducts(
    queryParams,         
    activeCategoryId || undefined
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data || res.data || []);
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    const state = location.state as { categoryId?: number } | null;

    if (state && state.categoryId) {
      
      setTimeout(() => {
        setActiveCategoryId(state.categoryId as number);
      }, 0);
      
      // Xóa state trên URL (để nếu user F5 trang thì nó không bị kẹt lại bộ lọc cũ)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const productList = data?.content || (Array.isArray(data) ? data : []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* ========================================= */}
      {/* 1. BANNER QUẢNG CÁO */}
      {/* ========================================= */}
      <div className="w-full h-48 md:h-[400px] bg-gradient-to-r from-red-600 to-red-400 rounded-2xl mb-8 flex items-center justify-center text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 text-center px-4">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">T-PHONE HOT SALE</h2>
          <p className="text-lg md:text-xl font-medium">Giảm giá sập sàn các dòng iPhone 15 Series</p>
        </div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      {/* ========================================= */}
      {/* 2. THANH DANH MỤC (LỌC SẢN PHẨM) SIÊU ĐẸP */}
      {/* ========================================= */}
      <div className="mb-10">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Danh mục mua sắm</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          
          {/* Nút "Tất cả" */}
          <button 
            onClick={() => setActiveCategoryId(null)}
            className={`min-w-[100px] flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
              activeCategoryId === null 
              ? 'border-red-600 bg-red-50 shadow-md shadow-red-100 transform scale-105' 
              : 'border-gray-100 bg-white hover:border-red-300 hover:bg-red-50'
            }`}
          >
            <LayoutGrid size={28} className={`mb-2 ${activeCategoryId === null ? 'text-red-600' : 'text-gray-500'}`} />
            <span className={`text-sm font-bold ${activeCategoryId === null ? 'text-red-600' : 'text-gray-700'}`}>
              Tất cả
            </span>
          </button>

          {/* Render các danh mục từ DB */}
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`min-w-[120px] flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                activeCategoryId === cat.id 
                ? 'border-red-600 bg-red-50 shadow-md shadow-red-100 transform scale-105' 
                : 'border-gray-100 bg-white hover:border-red-300 hover:bg-red-50'
              }`}
            >
              {/* Lấy Icon ngẫu nhiên hoặc theo tên */}
              {getCategoryIcon(cat.name)}
              <span className={`text-sm font-bold text-center ${activeCategoryId === cat.id ? 'text-red-600' : 'text-gray-700'}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. DANH SÁCH SẢN PHẨM */}
      {/* ========================================= */}
      <div className="mb-6 flex items-center justify-between border-b-2 border-red-600 pb-2 mt-4">
        <h2 className="text-xl md:text-2xl font-bold uppercase text-gray-800">
          {activeCategoryId === null ? 'Sản phẩm nổi bật' : `Đang hiển thị`}
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

      {!loading && !error && productList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
          {productList.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && !error && productList.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
          <img src="https://cellphones.com.vn/cart/_nuxt/img/empty-cart.c71473e.png" alt="Empty" className="w-32 opacity-30 mb-4" />
          <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào trong danh mục này.</p>
        </div>
      )}

    </div>
  );
};

export default Home;