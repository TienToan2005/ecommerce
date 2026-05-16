import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  PhoneCall, 
  ShoppingCart, 
  User, 
  Menu,
  ChevronDown,
  LogOut, 
  ClipboardList, 
  UserCircle,
  Settings,
  Loader2,
  ShoppingBag
} from 'lucide-react';

import { useAuthStore } from '../hooks/useAuthStore';
import { useCartStore } from '../hooks/useCartStore';
import api from '../services/api';
import * as productApi from '../services/product';
import { formatCurrency } from '../utils/format';

const FALLBACK_IMAGE = 'https://placehold.co/100x100/f3f4f6/a1a1aa?text=TPHONE';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  
  const { items, getTotalItems } = useCartStore();

  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // State Autocomplete
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null); 

  const isHomePage = location.pathname === '/';

  // Tính tổng tiền giỏ hàng cho Mini Cart
  const cartTotal = items.reduce((total, item) => total + (Number(item.variant.price) * item.quantity), 0);

  const handleMouseEnter = () => {
    if (isHomePage) return; 
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCategoryOpen(true);
  };

  const handleMouseLeave = () => {
    if (isHomePage) return;
    timeoutRef.current = setTimeout(() => {
      setIsCategoryOpen(false);
    }, 200);
  };

  // Logic Debounce Tìm kiếm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setIsSearchDropdownOpen(true);
      try {
        const res = await productApi.getAllProducts({ name: searchTerm.trim(), size: 5 });
        setSearchResults(res.content || []);
      } catch (error) {
        console.error("Lỗi gọi API tìm kiếm", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      setIsSearchDropdownOpen(false);
      navigate(`/products?name=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearchSubmit();
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories'); 
        setCategories(res.data.data || res.data || []); 
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <header className="bg-red-600 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* 1. Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center">
          <span className="text-2xl font-black tracking-tighter">
            T<span className="text-yellow-300">PHONE</span>
          </span>
        </Link>

        {/* 2. NÚT DANH MỤC */}
        <div className="relative hidden md:block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <button className={`flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors ${isHomePage ? 'cursor-default opacity-80' : 'cursor-pointer'}`}>
            <Menu size={20} />
            <span className="text-sm font-medium">Danh mục</span>
            {!isHomePage && <ChevronDown size={16} className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />}
          </button>

          {isCategoryOpen && !isHomePage && (
            <div className="absolute top-full left-0 pt-2 w-64 z-50">
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 text-gray-800 animate-fade-in">
                {categories.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 flex items-center justify-center">
                     <Loader2 className="animate-spin mr-2" size={16}/> Đang tải...
                  </div>
                ) : (
                  categories.map((cat) => (
                    <Link key={cat.id} to={`/products?category=${cat.id}`} onClick={() => setIsCategoryOpen(false)} className="block px-4 py-3 text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors border-b border-gray-50 last:border-0">
                      {cat.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. THANH TÌM KIẾM CÓ AUTOCOMPLETE */}
        <div className="flex-1 max-w-xl relative hidden sm:block" ref={searchContainerRef}>
          <input 
            type="text" placeholder="Bạn cần tìm gì?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleKeyDown} 
            onFocus={() => { if (searchTerm.trim()) setIsSearchDropdownOpen(true); }}
            className="w-full bg-white text-gray-800 rounded-lg pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
          <button onClick={handleSearchSubmit} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 p-1">
            <Search size={20} />
          </button>

          {isSearchDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 text-gray-800">
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700 flex items-center gap-1">🔥 Sản phẩm gợi ý</span>
                {isSearching && <Loader2 size={16} className="animate-spin text-red-500" />}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {isSearching && searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">Đang tìm kiếm...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => {
                    let minPrice = 0, originalPrice = 0;
                    if (product.variants?.length > 0) {
                      const cheapest = product.variants.reduce((prev: any, curr: any) => Number(curr.price) < Number(prev.price) ? curr : prev);
                      minPrice = Number(cheapest.price); originalPrice = cheapest.originalPrice ? Number(cheapest.originalPrice) : minPrice;
                    }
                    const imgUrl = (product.poster || product.images?.[0])?.replace('http://', 'https://') || FALLBACK_IMAGE;

                    return (
                      <Link key={product.id} to={`/product/${product.id}`} onClick={() => { setIsSearchDropdownOpen(false); setSearchTerm(''); }} className="flex items-center gap-3 p-3 hover:bg-red-50 transition-colors border-b border-gray-50 last:border-0 group">
                        <div className="w-14 h-14 bg-white rounded-lg border border-gray-100 p-1 flex-shrink-0">
                          <img src={imgUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-red-600 transition-colors">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-red-600">{formatCurrency(minPrice)}</span>
                            {originalPrice > minPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(originalPrice)}</span>}
                          </div>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500 mb-2">Không tìm thấy sản phẩm nào phù hợp với "{searchTerm}"</p>
                    <ShoppingBag size={80} className="mx-auto text-gray-300 mb-4" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors">
            <PhoneCall size={20} />
            <div className="text-xs text-left"><p>Gọi mua hàng</p><p className="font-bold">1800.2097</p></div>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors">
            <MapPin size={20} />
            <div className="text-xs text-left"><p>Cửa hàng</p><p className="font-bold">Gần bạn</p></div>
          </div>
        </div>

        {/* 5. KHỐI USER VÀ GIỎ HÀNG */}
        <div className="flex items-center gap-4">
          
          {/* 🚨 MINI CART BẮT ĐẦU TỪ ĐÂY 🚨 */}
          <div className="relative group py-2">
            <Link to="/cart" className="flex items-center gap-2 hover:text-yellow-300 transition-colors relative">
              <div className="relative">
                <ShoppingCart size={24} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-700 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-red-600">
                    {getTotalItems()}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-xs font-medium">Giỏ hàng</span>
            </Link>

            {/* Bảng Dropdown Mini Cart */}
            <div className="absolute right-0 top-full mt-0 w-[360px] bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 overflow-hidden transform origin-top-right group-hover:scale-100 scale-95 text-gray-800 z-50">
              {/* Header Mini Cart */}
              <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Giỏ hàng của bạn</span>
                <span className="text-xs font-medium text-gray-500">{getTotalItems()} sản phẩm</span>
              </div>
              
              {/* Danh sách SP */}
              <div className="max-h-[320px] overflow-y-auto p-2 scrollbar-hide">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <img src="https://cellphones.com.vn/cart/_nuxt/img/empty-cart.c71473e.png" alt="Empty Cart" className="w-20 opacity-50 mb-2 grayscale" />
                    <p className="text-sm text-gray-500 font-medium">Giỏ hàng trống</p>
                  </div>
                ) : (
                  items.map((item, idx) => {
                    const imgUrl = (item.product.poster || item.product.images?.[0])?.replace('http://', 'https://') || FALLBACK_IMAGE;
                    return (
                      <div key={idx} className="flex gap-3 p-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-16 h-16 bg-white rounded border border-gray-100 p-1 flex-shrink-0">
                          <img src={imgUrl} className="w-full h-full object-contain" alt={item.product.name} />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <p className="font-bold text-sm text-gray-800 line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Phiên bản: {item.variant.sku}</p>
                          </div>
                          <div className="flex justify-between items-end mt-1">
                            <span className="text-red-600 font-bold text-sm">{formatCurrency(Number(item.variant.price))}</span>
                            <span className="text-xs font-medium text-gray-500">x{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              
              {/* Footer Mini Cart */}
              {items.length > 0 && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-600">Tổng tạm tính:</span>
                    <span className="font-black text-red-600 text-lg">{formatCurrency(cartTotal)}</span>
                  </div>
                  <Link to="/cart" className="flex items-center justify-center w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm">
                    XEM GIỎ HÀNG
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* USER ACCOUNT */}
          {isAuthenticated && user ? (
            <div className="relative group z-50 py-2"> 
              <div className="flex items-center gap-2 hover:bg-red-700 p-2 rounded-lg transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={20} />
                </div>
                <div className="hidden sm:block text-left text-sm">
                  <p className="font-semibold truncate max-w-[100px]">{user?.fullName || user?.email || 'Tmember'}</p>
                  <p className="text-xs opacity-80">Tài khoản</p>
                </div>
              </div>

              <div className="absolute right-0 top-full mt-0 w-56 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 overflow-hidden transform origin-top-right group-hover:scale-100 scale-95">
                <div className="p-4 border-b bg-gray-50 text-gray-800">
                  <p className="font-bold truncate">{user?.fullName || 'Khách hàng'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email || user.phoneNumber}</p>
                </div>
                <div className="p-2 space-y-1">
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold rounded-lg transition-colors border border-blue-100 mb-2">
                      <Settings size={18} /> Quản trị hệ thống
                    </Link>
                  )}
                  <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><UserCircle size={18} /> Thông tin tài khoản</Link>
                  <Link to="/order-history" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><ClipboardList size={18} /> Quản lý đơn hàng</Link>
                </div>
                <div className="p-2 border-t">
                  <button onClick={() => { logout(); navigate('/'); }} className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium cursor-pointer">
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 hover:bg-red-700 p-2 rounded-lg transition-colors">
              <User size={24} />
              <div className="hidden sm:block text-left text-sm"><p>Đăng nhập</p><p className="font-bold">Tmember</p></div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;