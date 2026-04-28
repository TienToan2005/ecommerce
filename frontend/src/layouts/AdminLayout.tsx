import React from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import { LayoutDashboard, ShoppingBag, Package, Users, LogOut } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  // 🚨 BỨC TƯỜNG BẢO MẬT: Chưa đăng nhập hoặc không phải ADMIN -> Đuổi về trang chủ
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black text-red-500 tracking-wider">
            TPHONE <span className="text-white font-light text-sm tracking-normal block mt-1">Admin Panel</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-lg transition-colors shadow-md">
            <LayoutDashboard size={20} />
            <span className="font-medium">Tổng quan (Dashboard)</span>
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <ShoppingBag size={20} />
            <span className="font-medium">Quản lý Đơn hàng</span>
          </Link>
          <Link to="/admin/products" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <Package size={20} />
            <span className="font-medium">Sản phẩm & Kho</span>
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <Users size={20} />
            <span className="font-medium">Khách hàng</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">
              {user.fullName?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* CONTENT BÊN PHẢI (Nơi React Router sẽ bơm các trang con vào) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Thanh Header nhỏ của Admin */}
        <header className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-gray-800">Xin chào, {user.fullName}!</h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Khu vực thay đổi nội dung */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet /> {/* CHÌA KHÓA LÀ Ở ĐÂY */}
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;