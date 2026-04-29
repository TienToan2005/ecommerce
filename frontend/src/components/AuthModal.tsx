import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import LoginForm from './auth/LoginForm';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen) {
      closeAuthModal();
    }
  }, [isAuthenticated, isAuthModalOpen, closeAuthModal]);

  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleGoToRegister = () => {
    closeAuthModal(); 
    navigate('/register'); 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      {/* Vùng bấm ra ngoài để đóng Modal */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={closeAuthModal}
      ></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="bg-red-50 p-6 text-center border-b border-red-100">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <span className="text-2xl font-black text-red-600">CPS</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Đăng nhập tài khoản</h2>
          <p className="text-sm text-gray-500 mt-1">Đăng nhập để theo dõi đơn hàng và nhận ưu đãi riêng</p>
        </div>

        {/* Thân Modal (Chứa Form) */}
        <div className="p-6">
          <LoginForm onSuccess={closeAuthModal} />

          <div className="mt-6 text-center text-sm text-gray-600">
            Bạn chưa có tài khoản?{' '}
            <button 
              onClick={handleGoToRegister}
              className="text-red-600 font-bold hover:underline"
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;