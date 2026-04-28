import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import LoginForm from '../../components/auth/LoginForm';


const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Khung chính chứa Form và Banner */}
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Phần Banner hình ảnh bên trái (Ẩn trên Mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-red-50 flex-col items-center justify-center p-8 border-r border-gray-100">
          <img 
            src="https://cellphones.com.vn/smember/_nuxt/img/chibi2.2227d82.png" 
            alt="Tmember Mascot" 
            className="w-48 h-48 object-contain mb-6 drop-shadow-md"
          />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Quyền lợi Tmember</h2>
          <ul className="text-gray-600 space-y-2 text-sm">
            <li>✨ Tích điểm lên đến 1% mọi giao dịch</li>
            <li>🎁 Ưu đãi độc quyền ngày sinh nhật</li>
            <li>🚚 Miễn phí giao hàng toàn quốc</li>
          </ul>
        </div>

        {/* Phần Form nhập liệu bên phải */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-black tracking-tighter text-red-600">
              T<span className="text-yellow-400">PHONE</span>
            </Link>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Đăng nhập tài khoản</h2>
          </div>

          {/* SỬ DỤNG COMPONENT CHUNG Ở ĐÂY */}
          <LoginForm onSuccess={() => navigate('/')} />
          <p className="mt-8 text-center text-sm text-gray-600">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-red-600 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;