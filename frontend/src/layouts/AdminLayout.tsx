import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar quản trị */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="block p-2 hover:bg-gray-800 rounded">Dashboard</Link>
          <Link to="/admin/products" className="block p-2 hover:bg-gray-800 rounded">Quản lý Sản phẩm</Link>
          <Link to="/admin/orders" className="block p-2 hover:bg-gray-800 rounded">Quản lý Đơn hàng</Link>
        </nav>
      </aside>

      {/* Khu vực nội dung chính */}
      <main className="flex-1 p-6">
        <Outlet /> {/* Nơi hiển thị trang ProductManagement của bạn */}
      </main>
    </div>
  );
};