import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from './hooks/useAuthStore';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

import AuthModal from './components/AuthModal';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Cart from './pages/cart/Cart';
import ProductDetail from './pages/product/ProductDetail';
import SearchPage from './pages/SearchPage';

import ProfilePage from './pages/ProfilePage';
import OrderHistory from './pages/order/OrderHistory';
import OrderDetail from './pages/order/OrderDetail';
import Checkout from './pages/order/Checkout';

import Dashboard from './pages/admin/Dashboard';
import AdminOrder from './pages/admin/AdminOrder';
import AdminProduct from './pages/admin/AdminProduct';
import AdminCustomer from './pages/admin/AdminCustomer';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      
      <AuthModal />

      <Routes>

        <Route element={<MainLayout />}>
          
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/search" element={<SearchPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/order-history/:id" element={<OrderDetail />} />
          </Route>
          
        </Route>


        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="orders" element={<AdminOrder />} />
            <Route path="products" element={<AdminProduct />} />
            <Route path="users" element={<AdminCustomer />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;