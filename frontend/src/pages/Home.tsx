import React, { useEffect, useState } from 'react';
import { ChevronRight, Truck, RefreshCw, ShieldCheck, HeadphonesIcon, ShoppingCart, Star, Loader2, Smartphone, Laptop, Watch, Headphones } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategoryStore } from '../hooks/useCategoryStore';
import { useProducts } from '../hooks/useProducts';
import { formatCurrency } from '../utils/format';
import * as categoryApi from '../services/category';
import * as productApi from '../services/product';
import toast from 'react-hot-toast';

const FALLBACK_IMAGE = 'https://placehold.co/400x400/f3f4f6/a1a1aa?text=TPHONE';

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
    e.currentTarget.className = 'w-full h-full object-contain opacity-50'; 
  }
};

const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) return 'https://placehold.co/200x200/f3f4f6/9ca3af?text=Icon';
  const name = categoryName.toLowerCase();
  
  if (name.includes('điện thoại') || name.includes('phone')) return 'https://placehold.co/200x200/fee2e2/ef4444?text=Phone';
  if (name.includes('laptop') || name.includes('máy tính')) return 'https://placehold.co/200x200/e0e7ff/6366f1?text=Laptop';
  
  if (name.includes('tai nghe') || name.includes('âm thanh') || name.includes('phụ kiện')) return 'https://placehold.co/200x200/ccfbf1/14b8a6?text=Audio';
  
  if (name.includes('đồng hồ') || name.includes('watch')) return 'https://placehold.co/200x200/fef3c7/f59e0b?text=Watch';
  
  return 'https://placehold.co/200x200/f3f4f6/9ca3af?text=Icon'; 
};

const getLucideIcon = (categoryName?: string) => {
  if (!categoryName) return <ChevronRight size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />;
  const name = categoryName.toLowerCase();
  
  if (name.includes('điện thoại') || name.includes('phone')) return <Smartphone size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />;
  if (name.includes('laptop') || name.includes('máy tính')) return <Laptop size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />;
  
  if (name.includes('tai nghe') || name.includes('âm thanh') || name.includes('phụ kiện')) return <Headphones size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />;
  
  if (name.includes('đồng hồ') || name.includes('watch')) return <Watch size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />;
  
  return <ChevronRight size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />;
};

const DYNAMIC_MEGA_MENU: Record<string, any> = {
  'điện thoại': [
    { label: 'Dưới 2 triệu', params: 'maxPrice=2000000' },
    { label: 'Từ 2 - 4 triệu', params: 'minPrice=2000000&maxPrice=4000000' },
    { label: 'Từ 4 - 7 triệu', params: 'minPrice=4000000&maxPrice=7000000' },
    { label: 'Từ 7 - 13 triệu', params: 'minPrice=7000000&maxPrice=13000000' },
    { label: 'Từ 13 - 20 triệu', params: 'minPrice=13000000&maxPrice=20000000' },
    { label: 'Trên 20 triệu', params: 'minPrice=20000000' }
  ],
  'laptop': [
    { label: 'Dưới 10 triệu', params: 'maxPrice=10000000' },
    { label: 'Từ 10 - 15 triệu', params: 'minPrice=10000000&maxPrice=15000000' },
    { label: 'Từ 15 - 20 triệu', params: 'minPrice=15000000&maxPrice=20000000' },
    { label: 'Từ 20 - 30 triệu', params: 'minPrice=20000000&maxPrice=30000000' },
    { label: 'Trên 30 triệu', params: 'minPrice=30000000' }
  ],
  'phụ kiện': [
    { label: 'Dưới 500K', params: 'maxPrice=500000' },
    { label: 'Từ 500K - 1 triệu', params: 'minPrice=500000&maxPrice=1000000' },
    { label: 'Từ 1 - 2 triệu', params: 'minPrice=1000000&maxPrice=2000000' },
    { label: 'Trên 2 triệu', params: 'minPrice=2000000' }
  ]
};

const getPricesForCategory = (categoryName?: string) => {
  if (!categoryName) return DYNAMIC_MEGA_MENU['điện thoại'];
  const name = categoryName.toLowerCase();
  
  if (name.includes('laptop') || name.includes('máy tính')) return DYNAMIC_MEGA_MENU['laptop'];
  
  if (name.includes('phụ kiện') || name.includes('tai nghe') || name.includes('âm thanh')) return DYNAMIC_MEGA_MENU['phụ kiện'];
  
  return DYNAMIC_MEGA_MENU['điện thoại']; 
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { categories, fetchCategories } = useCategoryStore();
  const { data: productsData, loading: isProductsLoading } = useProducts({ page: 0, size: 10 });
  const products = productsData?.content || [];

  const phoneCatId = categories.find(c => c.name.toLowerCase().includes('điện thoại'))?.id || '';
  const laptopCatId = categories.find(c => c.name.toLowerCase().includes('laptop'))?.id || '';
  const accessoryCatId = categories.find(c => c.name.toLowerCase().includes('phụ kiện'))?.id || '';

  const [hoveredCategory, setHoveredCategory] = useState<number | string | null>(null);
  const [categoryFiltersCache, setCategoryFiltersCache] = useState<Record<string, any>>({});
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  const handleHoverCategory = async (catId: number, catName: string) => {
    setHoveredCategory(catId);
    if (categoryFiltersCache[catId]) return;

    try {
      setIsLoadingFilters(true);
      
      let finalBrands: string[] = [];
      try {
        const filterData = await categoryApi.getCategoryFilters(catId);
        finalBrands = filterData?.brands || [];
      } catch (error) {
        finalBrands = catName.toLowerCase().includes('laptop') ? ['Apple', 'ASUS', 'Dell', 'HP', 'Lenovo'] : ['Apple', 'Samsung', 'Xiaomi', 'OPPO'];
      }
      
      let hotProductsDB: any[] = [];
      try {
        const hotProdRes = await productApi.getAllProducts({ categoryId: catId, size: 15 });
        if (hotProdRes && hotProdRes.content) {
            const highRated = hotProdRes.content.filter((p: any) => p.averageRating && p.averageRating >= 4);
            hotProductsDB = (highRated.length > 0 ? highRated : hotProdRes.content).slice(0, 4);
        }
      } catch (error) {
        console.warn("Lỗi lấy SP HOT");
      }

      setCategoryFiltersCache(prev => ({
        ...prev,
        [catId]: {
          BRANDS: finalBrands,
          PRICES: getPricesForCategory(catName),
          HOT_PRODUCTS: hotProductsDB
        }
      }));
    } catch (error) {
      console.error("Lỗi tải filter", error);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          
          <div 
            className="hidden md:flex flex-col w-[250px] bg-white rounded-2xl shadow-sm border border-gray-100 h-[400px] flex-shrink-0 relative z-40"
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div className="py-2 h-full flex flex-col overflow-y-auto scrollbar-hide">
              {categories.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">Đang tải danh mục...</div>
              ) : (
                categories.map((cat) => (
                  <Link 
                    key={cat.id} 
                    to={`/products?category=${cat.id}`} 
                    onMouseEnter={() => handleHoverCategory(cat.id, cat.name)} 
                    className={`flex items-center justify-between px-4 py-2.5 transition group cursor-pointer ${hoveredCategory === cat.id ? 'bg-red-50' : 'hover:bg-red-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      {getLucideIcon(cat.name)}
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600 transition-colors">{cat.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                  </Link>
                ))
              )}
            </div>

            {hoveredCategory && (
              <div className="absolute top-0 left-[100%] w-[600px] lg:w-[800px] h-[400px] bg-white shadow-2xl rounded-r-2xl border border-gray-100 p-6 flex flex-col gap-6 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                
                {isLoadingFilters && !categoryFiltersCache[hoveredCategory] ? (
                  <div className="flex h-full w-full items-center justify-center text-gray-500 flex-col gap-2">
                    <Loader2 className="animate-spin text-red-600" size={32} />
                    <p className="font-medium text-sm">Đang tải bộ lọc từ hệ thống...</p>
                  </div>
                ) : (
                  (() => {
                    const menuData = categoryFiltersCache[hoveredCategory];
                    if (!menuData) return null;

                    return (
                      <>
                        {menuData.BRANDS && menuData.BRANDS.length > 0 && (
                          <div>
                            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Chọn theo Hãng</h3>
                            <div className="grid grid-cols-4 lg:grid-cols-5 gap-3">
                              {menuData.BRANDS.map((brand: string) => (
                                <Link 
                                  key={brand} 
                                  to={`/products?category=${hoveredCategory}&brand=${brand}`}
                                  className="px-3 py-2 text-center text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-100 rounded-lg hover:border-red-500 hover:text-red-600 transition-all shadow-sm"
                                >
                                  {brand}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Chọn theo Mức giá</h3>
                          <div className="flex flex-wrap gap-3">
                            {menuData.PRICES.map((price: any, idx: number) => (
                              <Link 
                                key={idx}
                                to={`/products?category=${hoveredCategory}&${price.params}`}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-100 rounded-lg hover:border-red-500 hover:text-red-600 transition-all"
                              >
                                {price.label}
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                            Sản phẩm HOT <Star size={16} className="fill-yellow-400 text-yellow-400" />
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {menuData.HOT_PRODUCTS && menuData.HOT_PRODUCTS.length > 0 ? (
                              menuData.HOT_PRODUCTS.map((p: any) => (
                                <Link 
                                  key={p.id}
                                  to={`/product/${p.id}`}
                                  className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-100 rounded-xl hover:border-red-300 hover:bg-red-50/50 transition-colors group shadow-sm"
                                >
                                  <div className="w-12 h-12 bg-white rounded-lg p-1 border border-gray-100 flex-shrink-0">
                                    <img src={p.poster || p.images?.[0] || FALLBACK_IMAGE} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate group-hover:text-red-600 transition-colors">{p.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs font-bold text-red-600">
                                        {formatCurrency(p.variants?.[0]?.price || 0)}
                                      </span>
                                      <span className="text-[10px] text-gray-500 flex items-center bg-white px-1.5 py-0.5 rounded border border-gray-100">
                                        <Star size={10} className="fill-yellow-400 text-yellow-400 mr-0.5" />
                                        {p.averageRating?.toFixed(1) || '0.0'}
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 italic">Chưa có sản phẩm HOT nào.</p>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()
                )}
              </div>
            )}
          </div>

          <div className="flex-1 relative bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl overflow-hidden shadow-sm flex items-center h-[200px] md:h-[400px] group border border-gray-100 z-10">
            <div className="z-20 p-8 md:p-12 max-w-lg">
              <span className="inline-block px-3 py-1 bg-red-100 text-red-600 font-bold text-xs rounded-full mb-3 md:mb-4">Siêu sale cuối mùa</span>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-2 md:mb-4">
                Giảm đến <span className="text-red-600">50%++</span>
              </h1>
              <p className="text-gray-600 mb-6 text-sm md:text-lg hidden md:block">Hàng ngàn sản phẩm chính hãng. Giá tốt nhất dành cho bạn.</p>
              <div className="flex gap-3">
                <Link to="/products" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 md:py-3 md:px-8 rounded-full shadow-lg shadow-red-500/30 transition-transform hover:-translate-y-1 text-sm md:text-base">Mua ngay</Link>
                <Link to="/products" className="bg-white text-gray-800 font-bold py-2.5 px-6 md:py-3 md:px-8 rounded-full shadow-sm hover:shadow-md transition-all text-sm md:text-base">Xem thêm</Link>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-red-100/50 z-10">
              <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop" alt="Sale Banner" className="w-full h-full object-cover opacity-80 mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>

        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-12 flex flex-wrap justify-between items-center gap-4 border border-gray-100">
          {[
            { icon: <Truck className="text-red-500" size={28}/>, title: 'Miễn phí vận chuyển', sub: 'Cho đơn từ 500.000đ' },
            { icon: <RefreshCw className="text-orange-500" size={28}/>, title: 'Đổi trả dễ dàng', sub: 'Trong vòng 7 ngày' },
            { icon: <ShieldCheck className="text-emerald-500" size={28}/>, title: 'Thanh toán an toàn', sub: 'Bảo mật 100%' },
            { icon: <HeadphonesIcon className="text-blue-500" size={28}/>, title: 'Hỗ trợ 24/7', sub: 'Hotline: 1900 1234' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 w-full sm:w-[48%] lg:w-auto">
              <div className="bg-gray-50 p-3 rounded-full">{item.icon}</div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Danh mục nổi bật</h2>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-4">
            {categories.length === 0 ? (
              <p className="text-gray-500 text-sm">Đang tải danh mục...</p>
            ) : (
              categories.map((cat) => (
                <Link to={`/products?category=${cat.id}`} key={cat.id} className="flex flex-col items-center gap-3 min-w-[100px] cursor-pointer group">
                  <div className="w-20 h-20 bg-white rounded-full p-3 shadow-sm border border-gray-100 group-hover:shadow-md group-hover:border-red-200 transition-all overflow-hidden flex items-center justify-center">
                    <img 
                      src={cat.image || getCategoryIcon(cat.name)} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                      onError={handleImageError} 
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 text-center">{cat.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to={`/products${phoneCatId ? `?category=${phoneCatId}` : ''}`} className="bg-red-50 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group overflow-hidden">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Điện thoại chính hãng</h3>
              <p className="text-red-600 font-bold text-lg mb-3">Giảm đến 30%</p>
              <span className="text-sm text-gray-500 group-hover:text-red-600 transition-colors">Xem ngay &rarr;</span>
            </div>
            <img src="https://placehold.co/200x200/fee2e2/ef4444?text=Promo+1" alt="Promo" className="w-24 h-24 object-cover rounded-full group-hover:scale-110 transition-transform" onError={handleImageError}/>
          </Link>
          <Link to={`/products${laptopCatId ? `?category=${laptopCatId}` : ''}`} className="bg-blue-50 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group overflow-hidden">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Laptop deal sốc</h3>
              <p className="text-blue-600 font-bold text-lg mb-3">Giảm đến 40%</p>
              <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">Xem ngay &rarr;</span>
            </div>
            <img src="https://placehold.co/200x200/e0e7ff/6366f1?text=Promo+2" alt="Promo" className="w-24 h-24 object-cover rounded-full group-hover:scale-110 transition-transform" onError={handleImageError}/>
          </Link>
          <Link to={`/products${accessoryCatId ? `?category=${accessoryCatId}` : ''}`} className="bg-emerald-50 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group overflow-hidden">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Phụ kiện giá tốt</h3>
              <p className="text-emerald-600 font-bold text-lg mb-3">Giảm đến 20%</p>
              <span className="text-sm text-gray-500 group-hover:text-emerald-600 transition-colors">Xem ngay &rarr;</span>
            </div>
            <img src="https://placehold.co/200x200/d1fae5/10b981?text=Promo+3" alt="Promo" className="w-24 h-24 object-cover rounded-full group-hover:scale-110 transition-transform" onError={handleImageError}/>
          </Link>
        </div>

        <div>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sản phẩm bán chạy</h2>
            <Link to="/products" className="text-red-600 text-sm font-semibold hover:underline flex items-center">Xem tất cả <ChevronRight size={16}/></Link>
          </div>
          
          {isProductsLoading ? (
            <div className="flex justify-center items-center py-20 text-red-500">
              <Loader2 className="animate-spin" size={40} />
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Chưa có sản phẩm nào trong hệ thống.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((item) => {
                let minPrice = 0;
                let originalPrice = 0;
                if (item.variants && item.variants.length > 0) {
                  const cheapestVariant = item.variants.reduce((prev, curr) => 
                    Number(curr.price) < Number(prev.price) ? curr : prev
                  );
                  minPrice = Number(cheapestVariant.price);
                  originalPrice = cheapestVariant.originalPrice ? Number(cheapestVariant.originalPrice) : minPrice;
                }
                const discountPercent = originalPrice > minPrice 
                  ? Math.round(((originalPrice - minPrice) / originalPrice) * 100) 
                  : 0;

                const imageUrl = (item.poster || (item.images && item.images.length > 0 ? item.images[0] : null))?.replace('http://', 'https://') || FALLBACK_IMAGE;

                return (
                  <Link to={`/product/${item.id}`} key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-xl hover:border-red-100 transition-all group relative flex flex-col h-full cursor-pointer">
                    {discountPercent > 0 ? (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg z-10 shadow-sm">
                        Giảm {discountPercent}%
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg z-10 shadow-sm">
                        HOT
                      </div>
                    )}
                    
                    <div className="w-full h-48 mb-4 relative overflow-hidden rounded-xl flex items-center justify-center bg-gray-50 p-2">
                      <img 
                        src={imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                        onError={handleImageError}
                      />
                    </div>
                    
                    <div className="flex flex-col flex-1">
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors" title={item.name}>
                        {item.name}
                      </h3>
                      
                      <div className="mt-auto">
                        <div className="flex items-end gap-2 mb-1">
                          <span className="text-lg font-bold text-red-600">{formatCurrency(minPrice)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 line-through">
                            {discountPercent > 0 ? formatCurrency(originalPrice) : ''}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" /> 
                            {item.averageRating ? item.averageRating.toFixed(1) : '0.0'} 
                            <span className="ml-1 text-gray-400">({item.totalReviews || 0})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        toast('Vui lòng vào chi tiết để chọn Phiên bản!', { icon: '🛒' });
                      }}
                      className="absolute bottom-4 right-4 w-8 h-8 bg-red-50 text-red-600 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-red-600 hover:text-white"
                      title="Thêm vào giỏ"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;