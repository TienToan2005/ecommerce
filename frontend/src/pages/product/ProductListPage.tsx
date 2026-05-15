import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ProductCard from '../../components/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import { Filter, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const PRICE_RANGES = [
  { label: 'Dưới 10 triệu', min: null, max: '10000000' },
  { label: 'Từ 10 - 20 triệu', min: '10000000', max: '20000000' },
  { label: 'Từ 20 - 30 triệu', min: '20000000', max: '30000000' },
  { label: 'Trên 30 triệu', min: '30000000', max: null },
];

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Lenovo', 'ASUS', 'HP', 'Dell', 'Sony', 'JBL'];

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryId = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const brand = searchParams.get('brand');
  const sort = searchParams.get('sort') || 'id,desc';
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const apiPage = currentPage > 0 ? currentPage - 1 : 0;

  const { data, loading, error } = useProducts({
    page: apiPage, 
    size: 12, // Một trang hiển thị 12 sản phẩm
    categoryId: categoryId ? Number(categoryId) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    brand: brand || undefined,
    sort: sort
  });

  const handleFilterChange = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value); 
    else newParams.delete(key);
    
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // 🚨 HÀM CHUYỂN TRANG
  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => setSearchParams(new URLSearchParams());

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 max-w-7xl mx-auto">
      
      {/* CỘT TRÁI: Bộ lọc Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        <Sidebar />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Filter size={18} className="text-red-600" /> Lọc Sản Phẩm
            </h3>
            {(minPrice || maxPrice || brand || categoryId) && (
              <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors">
                <XCircle size={14} /> Xóa lọc
              </button>
            )}
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Thương hiệu</h4>
            <div className="flex flex-wrap gap-2">
              {BRANDS.map(b => (
                <button 
                  key={b} 
                  onClick={() => handleFilterChange('brand', brand === b ? null : b)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    brand === b 
                      ? 'border-red-600 bg-red-50 text-red-600 shadow-sm' 
                      : 'border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Mức giá</h4>
            <div className="flex flex-col gap-2">
              {PRICE_RANGES.map((range, idx) => {
                const isActive = minPrice === range.min && maxPrice === range.max;
                return (
                  <button 
                    key={idx}
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      if (isActive) { 
                        newParams.delete('minPrice'); 
                        newParams.delete('maxPrice'); 
                      } else { 
                        if (range.min) newParams.set('minPrice', range.min); else newParams.delete('minPrice');
                        if (range.max) newParams.set('maxPrice', range.max); else newParams.delete('maxPrice');
                      }
                      newParams.delete('page'); // Đổi giá cũng reset về trang 1
                      setSearchParams(newParams);
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-red-50 text-red-600 font-bold border border-red-200' 
                        : 'text-gray-600 border border-transparent hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: Danh sách sản phẩm */}
      <div className="flex-1">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-800 uppercase">
            {brand ? `Thương hiệu ${brand}` : categoryId ? `Danh mục sản phẩm` : 'Tất cả sản phẩm'}
          </h1>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Sắp xếp:</span>
            <select 
              value={sort} 
              onChange={(e) => handleFilterChange('sort', e.target.value)} 
              className="border-gray-200 rounded-lg text-gray-700 font-medium focus:ring-red-500 py-1.5 px-3 bg-gray-50 border outline-none cursor-pointer"
            >
              <option value="id,desc">Mới nhất</option>
              <option value="averageRating,desc">Đánh giá cao nhất</option>
              <option value="minPrice,asc">Giá thấp đến cao</option>
              <option value="minPrice,desc">Giá cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* CÁC TRẠNG THÁI HIỂN THỊ */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl text-center font-medium shadow-sm">
            {error}
          </div>
        ) : data && data.content.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.content.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* 🚨 KHỐI PHÂN TRANG (PAGINATION) 🚨 */}
            {data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                {/* Nút Prev */}
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Danh sách các trang */}
                {[...Array(data.totalPages)].map((_, idx) => {
                  const pageNumber = idx + 1;
                  const isActive = currentPage === pageNumber;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
                        isActive 
                          ? 'bg-red-600 text-white border border-red-600 shadow-md' 
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {/* Nút Next */}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm h-72 text-gray-500 border border-gray-100">
            <img src="https://cellphones.com.vn/cart/_nuxt/img/empty-cart.c71473e.png" alt="Empty" className="w-32 opacity-60 mb-4" />
            <p className="font-medium text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
            <p className="text-sm mt-1">Sếp thử xóa bộ lọc hoặc tìm với tiêu chí khác nhé!</p>
            <button 
              onClick={clearAllFilters} 
              className="mt-4 px-6 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default ProductListPage;