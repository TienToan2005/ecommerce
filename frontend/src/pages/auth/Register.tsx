import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';

const Register: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black tracking-tighter text-red-600">
            T<span className="text-yellow-400">PHONE</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Tạo tài khoản Tmember</h2>
        </div>

        <RegisterForm onSuccess={() => navigate('/login')} />

        <p className="mt-8 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-red-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;