import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Cart from './pages/cart/Cart';
import ProductListPage from './pages/product/ProductListPage';
import ProductDetail from './pages/product/ProductDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OrderHistory from './pages/order/OrderHistory';
import Checkout from './pages/order/Checkout';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './hooks/useAuthStore';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
    <Routes>
      {/* 2. CHÚ Ý: Hai Route này phải nằm ở ĐÂY (ngay dưới <Routes> và trên MainLayout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Các Route nằm trong MainLayout (Có Header, Footer) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="category/:categoryId" element={<ProductListPage />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="my-orders" element={<OrderHistory />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;