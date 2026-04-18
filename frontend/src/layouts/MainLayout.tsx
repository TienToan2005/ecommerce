import React from 'react';
import { Outlet } from 'react-router-dom'; // BẮT BUỘC PHẢI CÓ CÁI NÀY
import Header from '../components/Header'; // Import Header xịn sò của bạn vào

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. Phần đầu trang luôn giữ cố định */}
      <Header />

      {/* 2. Phần thân trang: Nơi React Router sẽ tự động "bơm" các trang Home, Cart, Checkout vào */}
      <main className="flex-1 w-full">
        <Outlet /> {/* CHÌA KHÓA LÀ Ở ĐÂY */}
      </main>

      {/* 3. Phần chân trang (Sau này bạn thêm Footer vào đây) */}
      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;