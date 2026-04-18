import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '../hooks/useAuthStore';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal } = useAuthStore();
  const [view, setView] = useState<'prompt' | 'login' | 'register'>('prompt');

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setView('prompt');
    closeAuthModal();
  };

  // Nếu màn hình chào
  if (view === 'prompt') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-6 relative animate-in zoom-in-95 duration-200">
          <button onClick={handleClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1"><X size={20} /></button>
          <div className="flex flex-col items-center text-center mt-2">
            <h2 className="text-red-600 font-bold text-[22px] mb-4">Tmember</h2>
            <img src="https://cellphones.com.vn/smember/_nuxt/img/chibi2.2227d82.png" alt="Mascot" className="w-24 h-24 object-contain mb-4"/>
            <p className="text-gray-700 text-[15px] mb-6 px-2">Vui lòng đăng nhập để tiếp tục.</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setView('register')} className="flex-1 bg-white border border-red-600 text-red-600 font-semibold py-2.5 rounded-xl hover:bg-red-50">Đăng ký</button>
              <button onClick={() => setView('login')} className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-xl hover:bg-red-700">Đăng nhập</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình Form (Sử dụng Component được tái sử dụng)
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-10 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200 my-auto">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-10"><X size={24} /></button>
        <button onClick={() => setView('prompt')} className="absolute top-4 left-4 text-sm font-medium text-red-600 hover:underline z-10">Quay lại</button>

        <div className="pt-12 px-6 pb-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {view === 'login' ? 'Đăng nhập Tmember' : 'Đăng ký Tmember'}
          </h2>

          {/* GỌI COMPONENT Ở ĐÂY */}
          {/* Khi login thành công trong Modal, tự động đóng Modal (handleClose) */}
          {view === 'login' && <LoginForm onSuccess={handleClose} />}
          
          {/* Khi đăng ký thành công, tự động chuyển tab sang Login */}
          {view === 'register' && <RegisterForm onSuccess={() => setView('login')} />}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;