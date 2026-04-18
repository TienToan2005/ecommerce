import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  PhoneCall, 
  ShoppingCart, 
  User, 
  Menu 
} from 'lucide-react';

// 1. IMPORT 2 HOOK CỦA ZUSTAND VÀO ĐÂY
import { useAuthStore } from '../hooks/useAuthStore';
import { useCartStore } from '../hooks/useCartStore';

const Header: React.FC = () => {
  // 2. KÉO CÁC STATE VÀ ACTION TỪ STORE RA ĐỂ SỬ DỤNG
  const { isAuthenticated, user, openAuthModal } = useAuthStore();
  const { getTotalItems } = useCartStore();

  return (
    <header className="bg-red-600 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* 1. Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center">
          <span className="text-2xl font-black tracking-tighter">
            T<span className="text-yellow-300">PHONE</span>
          </span>
        </Link>

        {/* 2. Nút Danh mục */}
        <button className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors">
          <Menu size={20} />
          <span className="text-sm font-medium">Danh mục</span>
        </button>

        {/* 3. Thanh tìm kiếm */}
        <div className="flex-1 max-w-xl relative hidden sm:block">
          <input 
            type="text" 
            placeholder="Bạn cần tìm gì?" 
            className="w-full bg-white text-gray-800 rounded-lg pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 p-1">
            <Search size={20} />
          </button>
        </div>

        {/* 4. Các nút chức năng */}
        <div className="hidden lg:flex items-center gap-4">
          <button className="flex items-center gap-2 hover:text-yellow-300 transition-colors">
            <PhoneCall size={20} />
            <div className="text-xs text-left">
              <p>Gọi mua hàng</p>
              <p className="font-bold">1800.2097</p>
            </div>
          </button>

          <button className="flex items-center gap-2 hover:text-yellow-300 transition-colors">
            <MapPin size={20} />
            <div className="text-xs text-left">
              <p>Cửa hàng</p>
              <p className="font-bold">Gần bạn</p>
            </div>
          </button>
        </div>

        {/* 5. Giỏ hàng & User */}
        <div className="flex items-center gap-4">
          
          {/* GIỎ HÀNG SẼ TỰ ĐỘNG CẬP NHẬT SỐ LƯỢNG NẾU > 0 */}
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

          {/* KIỂM TRA ĐĂNG NHẬP */}
          {isAuthenticated && user ? (
            <Link to="/my-orders" className="flex items-center gap-2 hover:bg-red-700 p-2 rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User size={20} />
              </div>
              <div className="hidden sm:block text-left text-sm">
                <p className="font-semibold">{user.fullName || user.email || 'Tmember'}</p>
                <p className="text-xs opacity-80 hover:underline">Đơn hàng của tôi</p>
              </div>
            </Link>
          ) : (
            <button onClick={openAuthModal} className="flex items-center gap-2 hover:bg-red-700 p-2 rounded-lg transition-colors">
              <User size={24} />
              <div className="hidden sm:block text-left text-sm">
                <p>Đăng nhập</p>
                <p className="font-bold">Tmember</p>
              </div>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;