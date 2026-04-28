import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useUIStore } from '../hooks/useUIStore';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal } = useUIStore();
  const navigate = useNavigate();

  if (!isAuthModalOpen) return null;

  return (
    // Lớp overlay màu đen mờ
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      {/* Khung trắng */}
      <div className="bg-white rounded-2xl w-full max-w-sm relative overflow-hidden shadow-2xl scale-in-center">
        
        {/* Nút tắt (Dấu X) */}
        <button 
          onClick={closeAuthModal}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Tmember</h2>
          
          {/* Sếp có thể thay cái div này bằng cái ảnh Logo con kiến/mascot của sếp */}
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
             <span className="text-3xl">👤</span>
          </div>

          <p className="text-gray-600 text-sm mb-6 px-2">
            Vui lòng đăng nhập tài khoản Tmember để xem ưu đãi và mua hàng dễ dàng hơn.
          </p>

          <div className="flex gap-3">
            <button 
              onClick={() => { closeAuthModal(); navigate('/register'); }}
              className="flex-1 py-2.5 rounded-lg border-2 border-red-600 text-red-600 font-bold hover:bg-red-50 transition-colors"
            >
              Đăng ký
            </button>
            <button 
              onClick={() => { closeAuthModal(); navigate('/login'); }}
              className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-200"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;