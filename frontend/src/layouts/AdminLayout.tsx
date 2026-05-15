import React, { useEffect } from 'react';
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import { LayoutDashboard, ShoppingBag, Package, Users, LogOut, Ticket, BellRing } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';

const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return;

    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      
      onConnect: () => {
        console.log('✅ Đã kết nối hệ thống Radar bắt đơn hàng!');
        
        stompClient.subscribe('/topic/admin-notifications', (message) => {
          if(message.body.includes("TING_TING")) {
            
            toast.success(message.body.replace("TING_TING: ", ""), {
              duration: 8000,
              icon: '🚨',
              style: {
                borderRadius: '10px',
                background: '#1e293b',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 'bold',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              },
            });

            const audio = new Audio('/ting-ting.mp3'); 
            audio.play().catch(e => console.log("Trình duyệt chặn auto-play âm thanh"));
          }
        });
      },
      onStompError: (frame) => {
        console.error('Lỗi kết nối WebSocket: ' + frame.headers['message']);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
      console.log('🛑 Đã ngắt kết nối Radar');
    };
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors shadow-sm ${
      isActive
        ? 'bg-red-600 text-white font-bold' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium' 
    }`;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black text-red-500 tracking-wider">
            TPHONE <span className="text-white font-light text-sm tracking-normal block mt-1">Admin Panel</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavLink to="/admin/dashboard" className={navLinkClass}>
            <LayoutDashboard size={20} />
            <span>Tổng quan (Dashboard)</span>
          </NavLink>
          
          <NavLink to="/admin/orders" className={navLinkClass}>
            <ShoppingBag size={20} />
            <span>Quản lý Đơn hàng</span>
          </NavLink>
          
          <NavLink to="/admin/products" className={navLinkClass}>
            <Package size={20} />
            <span>Sản phẩm & Kho</span>
          </NavLink>
          
          <NavLink to="/admin/users" className={navLinkClass}>
            <Users size={20} />
            <span>Khách hàng</span>
          </NavLink>
          <NavLink to="/admin/vouchers" className={navLinkClass}>
            <Ticket size={20} />
            <span>Khuyến mãi / Voucher</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">
              {user.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.fullName || 'Admin'}</p>
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

      {/* CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-gray-800">Xin chào, {user.fullName}!</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer group">
              <BellRing size={20} className="text-gray-500 group-hover:text-red-600 transition-colors" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
            </div>

            <div className="text-sm text-gray-500 border-l pl-6">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;