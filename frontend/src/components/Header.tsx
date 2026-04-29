import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Settings
} from 'lucide-react';

import { useAuthStore } from '../hooks/useAuthStore';
import { useCartStore } from '../hooks/useCartStore';
import api from '../services/api';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();

  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hàm mở menu
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCategoryOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsCategoryOpen(false);
    }, 200);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
        <div 
          className="relative hidden md:block"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors cursor-pointer">
            <Menu size={20} />
            <span className="text-sm font-medium">Danh mục</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCategoryOpen && (
            <div className="absolute top-full left-0 pt-2 w-64 z-50">
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 text-gray-800 animate-fade-in">
                {categories.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 flex items-center justify-center">
                     <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent mr-2"></div>
                     Đang tải...
                  </div>
                ) : (
                  categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      to="/"
                      state={{ categoryId: cat.id }}
                      onClick={() => setIsCategoryOpen(false)} 
                      className="block px-4 py-3 text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors border-b border-gray-50 last:border-0"
                    >
                      {cat.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Thanh tìm kiếm */}
        <div className="flex-1 max-w-xl relative hidden sm:block">
          <input 
            type="text" 
            placeholder="Bạn cần tìm gì?" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown} 
            className="w-full bg-white text-gray-800 rounded-lg pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
          <button 
            onClick={handleSearch} 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 p-1"
          >
            <Search size={20} />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors">
            <PhoneCall size={20} />
            <div className="text-xs text-left">
              <p>Gọi mua hàng</p>
              <p className="font-bold">1800.2097</p>
            </div>
          </div>

          <div className="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors">
            <MapPin size={20} />
            <div className="text-xs text-left">
              <p>Cửa hàng</p>
              <p className="font-bold">Gần bạn</p>
            </div>
          </div>
        </div>

        {/* 5. Giỏ hàng & User */}
        <div className="flex items-center gap-4">
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

          {isAuthenticated && user ? (
            <div className="relative group z-50"> 
              <div className="flex items-center gap-2 hover:bg-red-700 p-2 rounded-lg transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={20} />
                </div>
                <div className="hidden sm:block text-left text-sm">
                  <p className="font-semibold truncate max-w-[100px]">{user?.fullName || user?.email || 'Tmember'}</p>
                  <p className="text-xs opacity-80">Tài khoản</p>
                </div>
              </div>

              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 overflow-hidden transform origin-top-right group-hover:scale-100 scale-95">
                
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

                  <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                    <UserCircle size={18} /> Thông tin tài khoản
                  </Link>
                  <Link to="/order-history" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                    <ClipboardList size={18} /> Quản lý đơn hàng
                  </Link>
                </div>

                <div className="p-2 border-t">
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 hover:bg-red-700 p-2 rounded-lg transition-colors">
              <User size={24} />
              <div className="hidden sm:block text-left text-sm">
                <p>Đăng nhập</p>
                <p className="font-bold">Tmember</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;