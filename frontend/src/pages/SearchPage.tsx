import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as productApi from '../services/product';
import ProductCard from '../components/ProductCard';
import { Search, PackageSearch } from 'lucide-react';
import type { ProductResponse } from '../types/product';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchData = async () => {
      if (!query) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const res = await productApi.getAllProducts({name: query, size: 20});
        
        const data = res.content || (Array.isArray(res) ? res : []);
        setProducts(data);
      } catch (err: any) {
        setError("Không thể tải kết quả tìm kiếm.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchData();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh]">
      
      {/* Tiêu đề kết quả */}
      <div className="mb-8 flex items-center gap-3 border-b pb-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-full">
          <Search size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Kết quả tìm kiếm cho: <span className="text-red-600">"{query}"</span>
          </h1>
          <p className="text-sm text-gray-500">Tìm thấy {products.length} sản phẩm</p>
        </div>
      </div>

      {/* Trạng thái Loading */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 h-80 rounded-xl"></div>
          ))}
        </div>
      )}

      {/* Hiển thị danh sách sản phẩm */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Trường hợp không tìm thấy */}
      {!loading && products.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <PackageSearch size={64} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700">Rất tiếc, không tìm thấy sản phẩm phù hợp</h2>
          <p className="text-gray-500 mt-2 max-w-md">
            Sếp vui lòng thử lại với từ khóa khác hoặc kiểm tra lại lỗi chính tả nhé!
          </p>
          <button 
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all"
          >
            Quay lại trang trước
          </button>
        </div>
      )}

      {/* Báo lỗi */}
      {error && (
        <div className="text-center py-20 text-red-500 font-medium">
          {error}
        </div>
      )}
      
    </div>
  );
};

export default SearchPage;