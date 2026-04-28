import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import { useAuthStore } from './hooks/useAuthStore'; 
import Home from './pages/Home'; 
import Login from './pages/auth/Login'; 
import Register from './pages/auth/Register';
import Cart from './pages/cart/Cart'; 
import OrderHistory from './pages/order/OrderHistory';
import OrderDetail from './pages/order/OrderDetail';
import Checkout from './pages/order/Checkout';
import ProductDetail from './pages/product/ProductDetail';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import SearchPage from './pages/SearchPage';
import AuthModal from './components/AuthModal';
import ProfilePage from './pages/ProfilePage';
import AdminOrder from './pages/admin/AdminOrder';
import AdminProduct from './pages/admin/AdminProduct';
import AdminCustomer from './pages/admin/AdminCustomer';
const App: React.FC = () => {
  const checkAuth = useAuthStore(state => state.checkAuth);

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
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/order-history/:id" element={<OrderDetail />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrder />} />
          <Route path="products" element={<AdminProduct />} />
          <Route path="users" element={<AdminCustomer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;